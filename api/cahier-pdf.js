import { existsSync } from 'node:fs';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export const config = {
  maxDuration: 120,
  api: {
    bodyParser: {
      sizeLimit: '20mb'
    },
    responseLimit: false
  }
};

const MAX_HTML_SIZE = 18 * 1024 * 1024;
const MAX_BASE_URL_LENGTH = 512;
const LONG_TIMEOUT = 120000;
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const A4_WIDTH_CSS = '210mm';
const A4_HEIGHT_CSS = '297mm';

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 8;
const rateLimitStore = globalThis.__cahierPdfRateLimitStore || (globalThis.__cahierPdfRateLimitStore = new Map());

const LOCAL_CHROME_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
];

const isLocalDev = () => !process.env.VERCEL && process.env.NODE_ENV !== 'production';
const getLocalChromePath = () => LOCAL_CHROME_PATHS.find((path) => existsSync(path));
const getExecutablePath = async () => {
  const localPath = getLocalChromePath();
  if (isLocalDev() && localPath) return localPath;
  return chromium.executablePath();
};
const getLaunchArgs = () => isLocalDev() ? ['--no-sandbox', '--disable-setuid-sandbox'] : chromium.args;
const getClientAddress = (req) => {
  const forwarded = String(req?.headers?.['x-forwarded-for'] || '').split(',')[0].trim();
  const real = String(req?.headers?.['x-real-ip'] || '').trim();
  return (forwarded || real || 'unknown').slice(0, 64);
};

const applyRateLimit = (req, res) => {
  const now = Date.now();
  const key = getClientAddress(req);
  let entry = rateLimitStore.get(key);
  if (!entry || now - entry.startedAt >= RATE_LIMIT_WINDOW_MS) { entry = { startedAt: now, count: 0 }; rateLimitStore.set(key, entry); }
  entry.count += 1;
  const resetAt = entry.startedAt + RATE_LIMIT_WINDOW_MS;
  const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - entry.count);
  res.setHeader('RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS);
  res.setHeader('RateLimit-Remaining', remaining);
  res.setHeader('RateLimit-Reset', Math.ceil(resetAt / 1000));
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) { res.setHeader('Retry-After', Math.max(1, Math.ceil((resetAt - now) / 1000))); return false; }
  return true;
};

const isAllowedBaseHost = (hostname) => {
  const host = String(hostname || '').toLowerCase().replace(/\.$/, '');
  return host === 'localhost' || host === '127.0.0.1' || host === 'a4exam.com' || host.endsWith('.a4exam.com') || host.endsWith('.vercel.app');
};

const cleanBaseUrl = (url, req) => {
  const fallbackHost = String(req?.headers?.host || 'a4exam.com').split(':')[0];
  const raw = String(url || `https://${fallbackHost}`).trim();
  if (raw.length > MAX_BASE_URL_LENGTH) throw new Error('URL de base trop longue');
  let parsed;
  try { parsed = new URL(raw); } catch { throw new Error('URL de base invalide'); }
  if (!['http:', 'https:'].includes(parsed.protocol) || !isAllowedBaseHost(parsed.hostname)) throw new Error('Domaine de base non autorisé');
  return parsed.origin;
};

const sanitizeHtml = (html) => String(html)
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<\s*(script|iframe|object|embed|form|base|meta|link)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
  .replace(/<\s*(script|iframe|object|embed|form|base|meta|link)\b[^>]*\/?>/gi, '')
  .replace(/\s+on[a-z0-9_-]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/\s+(?:href|src|action|xlink:href)\s*=\s*(["'])\s*javascript:[\s\S]*?\1/gi, '')
  .replace(/\s+(?:href|src|action|xlink:href)\s*=\s*(["'])\s*data:text\/html[\s\S]*?\1/gi, '');
const errorMessage = (error) => String(error?.message || error || 'Erreur génération PDF');

const isInlinePreview = (req) => {
  if (String(req?.query?.preview || '') === '1') return true;
  try {
    const requestUrl = new URL(req?.url || '/api/cahier-pdf', 'http://localhost');
    return requestUrl.searchParams.get('preview') === '1';
  } catch {
    return false;
  }
};

const addSchoolYearToDateText = (text) => {
  const normalized = String(text || '')
    // Nettoie aussi les anciens PDF qui contiennent déjà une année ajoutée
    // après une date au format AAAA/MM/JJ.
    .replace(/(\d{4}\/\d{2}\/\d{2})(?:\/(?:2026|2027))+/g, '$1');

  // Le web arabe fournit déjà les dates complètes sous la forme AAAA/MM/JJ.
  // Ne jamais interpréter la portion MM/JJ comme une nouvelle date courte.
  if (/\d{4}\/\d{2}\/\d{2}/.test(normalized)) return normalized;

  return normalized.replace(/\b(\d{2})\/(\d{2})(?!\/\d{4})\b/g, (_, day, month) => {
    const year = Number(month) >= 9 ? 2026 : 2027;
    return `${day}/${month}/${year}`;
  });
};

const enrichHomeworkDates = (html) => String(html).replace(
  /(<div\b[^>]*class=(?:"[^"]*\bhomework-date\b[^"]*"|'[^']*\bhomework-date\b[^']*')[^>]*>)([\s\S]*?)(<\/div>)/gi,
  (_, openingTag, content, closingTag) => `${openingTag}${addSchoolYearToDateText(content)}${closingTag}`
);

export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!applyRateLimit(req, res)) {
    return res.status(429).json({ error: 'Trop de demandes. Réessayez dans une minute.' });
  }

  const { html, baseUrl } = req.body || {};
  if (!html || typeof html !== 'string') {
    return res.status(400).json({ error: 'HTML manquant' });
  }

  if (html.length > MAX_HTML_SIZE) {
    return res.status(413).json({ error: 'Document trop grand pour générer le PDF' });
  }

  let safeBase;
  let enrichedHtml;
  try {
    safeBase = cleanBaseUrl(baseUrl, req);
    enrichedHtml = enrichHomeworkDates(sanitizeHtml(html));
  } catch (error) {
    return res.status(400).json({ error: errorMessage(error) });
  }

  let browser;

  try {
    browser = await puppeteer.launch({
      args: getLaunchArgs(),
      defaultViewport: { width: A4_WIDTH, height: A4_HEIGHT, deviceScaleFactor: 1 },
      executablePath: await getExecutablePath(),
      headless: true,
      protocolTimeout: LONG_TIMEOUT
    });

    const page = await browser.newPage();
    await page.setViewport({ width: A4_WIDTH, height: A4_HEIGHT, deviceScaleFactor: 1 });
    page.setDefaultTimeout(LONG_TIMEOUT);
    page.setDefaultNavigationTimeout(LONG_TIMEOUT);

    const documentHtml = `<!doctype html>
<html>
<head>
  <base href="${safeBase}/">
  <meta charset="utf-8">
  <style>
    @page { size: ${A4_WIDTH_CSS} ${A4_HEIGHT_CSS}; margin: 0; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
    html, body {
      width: ${A4_WIDTH_CSS} !important;
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
      overflow: visible !important;
    }
    body { min-height: ${A4_HEIGHT_CSS} !important; }
    .cahier-pdf-export-button, .app-tabs, .tab-button, button,
    #cahier-main-cover-page, .cahier-main-cover-page, [data-force-first-page="true"] { display: none !important; }
    body.emp-primaire-ar .primary-timetable-page .no-print,
    body.emp-primaire-ar .primary-timetable-page button { display: none !important; }
    .cahier-preview-zone, .preview-zone {
      width: ${A4_WIDTH_CSS} !important;
      min-width: ${A4_WIDTH_CSS} !important;
      max-width: ${A4_WIDTH_CSS} !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: visible !important;
      height: auto !important;
      max-height: none !important;
      background: white !important;
      display: block !important;
      transform: none !important;
      scale: 1 !important;
      translate: 0 0 !important;
      zoom: 1 !important;
      container-type: normal !important;
    }
    .cahier-preview-zone .a4-page,
    .cahier-preview-zone .cahier-page,
    .preview-zone .a4-page,
    .preview-zone .cahier-page,
    .a4-page,
    .cahier-page {
      width: ${A4_WIDTH_CSS} !important;
      min-width: ${A4_WIDTH_CSS} !important;
      max-width: ${A4_WIDTH_CSS} !important;
      height: ${A4_HEIGHT_CSS} !important;
      min-height: ${A4_HEIGHT_CSS} !important;
      max-height: ${A4_HEIGHT_CSS} !important;
      margin: 0 !important;
      transform: none !important;
      scale: 1 !important;
      translate: 0 0 !important;
      zoom: 1 !important;
      overflow: hidden !important;
      break-after: page !important;
      page-break-after: always !important;
      box-shadow: none !important;
      display: block !important;
      position: relative !important;
      flex: none !important;
    }
    .cahier-preview-zone .a4-page::before,
    .preview-zone .a4-page::before {
      display: none !important;
      content: none !important;
    }
    .cahier-group-cover-page {
      width: ${A4_WIDTH_CSS} !important;
      height: ${A4_HEIGHT_CSS} !important;
    }
    .homework-date {
      border-bottom: 2px dotted rgba(63, 64, 80, 0.5) !important;
      padding-bottom: 8px !important;
    }
    .a4-page:last-child, .cahier-page:last-child { break-after: auto !important; page-break-after: auto !important; }
  </style>
</head>
<body class="line-mode-line emp-primaire-ar cahier-tab-active">
  ${enrichedHtml}
</body>
</html>`;

    await page.setContent(documentHtml, { waitUntil: 'domcontentloaded', timeout: LONG_TIMEOUT });
    await page.evaluate(async () => {
      document.querySelectorAll('.no-print, button').forEach((element) => element.remove());

      const addYear = (text) => {
        const normalized = String(text || '')
          .replace(/(\d{4}\/\d{2}\/\d{2})(?:\/(?:2026|2027))+/g, '$1');
        if (/\d{4}\/\d{2}\/\d{2}/.test(normalized)) return normalized;
        return normalized.replace(/\b(\d{2})\/(\d{2})(?!\/\d{4})\b/g, (_, day, month) => {
          const year = Number(month) >= 9 ? 2026 : 2027;
          return `${day}/${month}/${year}`;
        });
      };

      document.querySelectorAll('.homework-date').forEach((element) => {
        element.textContent = addYear(element.textContent);
      });

      document.querySelectorAll('.cahier-exams-list tbody tr').forEach((row) => {
        Array.from(row.cells).slice(0, 2).forEach((cell) => {
          cell.textContent = addYear(cell.textContent);
        });
      });

      const compactHiddenHourStart = 4;
      const compactHiddenHourEnd = 6;
      const keepCompactCellPart = (cell, span, startsAfterBreak = false) => {
        cell.colSpan = span;
        if (startsAfterBreak) {
          cell.classList.add('cahier-pdf-after-break');
          cell.style.setProperty('border-left', '4px solid #000', 'important');
        }
      };
      const transformCompactRow = (row) => {
        let logicalHourIndex = 0;

        Array.from(row.cells).slice(1).forEach((cell) => {
          const originalSpan = Math.max(Number(cell.colSpan) || 1, 1);
          const cellEnd = logicalHourIndex + originalSpan;
          const beforeBreakSpan = Math.max(
            0,
            Math.min(cellEnd, compactHiddenHourStart) - logicalHourIndex,
          );
          const afterBreakSpan = Math.max(
            0,
            cellEnd - Math.max(logicalHourIndex, compactHiddenHourEnd),
          );

          if (beforeBreakSpan > 0 && afterBreakSpan > 0) {
            const afterBreakCell = cell.cloneNode(true);
            keepCompactCellPart(cell, beforeBreakSpan);
            keepCompactCellPart(afterBreakCell, afterBreakSpan, true);
            cell.after(afterBreakCell);
          } else if (beforeBreakSpan > 0) {
            keepCompactCellPart(cell, beforeBreakSpan);
          } else if (afterBreakSpan > 0) {
            keepCompactCellPart(
              cell,
              afterBreakSpan,
              logicalHourIndex <= compactHiddenHourEnd,
            );
          } else {
            cell.remove();
          }

          logicalHourIndex = cellEnd;
        });
      };

      document.querySelectorAll('.timetable-table.compact-pdf-hours').forEach((table) => {
        const headerRow = table.tHead?.rows?.[0];
        const logicalHeaderWidth = Array.from(headerRow?.cells || [])
          .slice(1)
          .reduce((total, cell) => total + Math.max(Number(cell.colSpan) || 1, 1), 0);

        if (logicalHeaderWidth > 8) {
          table.querySelectorAll('thead tr, tbody tr').forEach(transformCompactRow);
        }

        table.querySelectorAll('.cahier-pdf-after-break').forEach((cell) => {
          cell.style.setProperty('border-left', '4px solid #000', 'important');
        });
        table.style.setProperty('width', '96%', 'important');
        table.style.setProperty('margin-left', 'auto', 'important');
        table.style.setProperty('margin-right', 'auto', 'important');
        table.style.setProperty('table-layout', 'fixed', 'important');
        table.dataset.cahierPdfCompactNormalized = 'true';
        table.classList.remove('compact-pdf-hours');
      });

      if (document.fonts?.ready) await document.fonts.ready.catch(() => {});
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1000);

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
      scale: 1,
      timeout: LONG_TIMEOUT
    });

    const disposition = isInlinePreview(req) ? 'inline' : 'attachment';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `${disposition}; filename="Cahier-de-texte-2026-2027.pdf"`);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(pdf);
  } catch (error) {
    console.error('PDF_EXPORT_ERROR', error);
    return res.status(500).json({ error: errorMessage(error) });
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}
