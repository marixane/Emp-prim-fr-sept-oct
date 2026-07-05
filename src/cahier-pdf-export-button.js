const PDF_BUTTON_ID = 'cahier-pdf-export-button';

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

const waitForFonts = async () => {
  if (document.fonts?.ready) {
    try { await document.fonts.ready; } catch { /* ignore */ }
  }
};

const setButtonStatus = (button, text) => {
  button.textContent = text;
  button.setAttribute('aria-label', text);
};

const getCurrentCssText = () => Array.from(document.styleSheets)
  .map((sheet) => {
    try {
      return Array.from(sheet.cssRules || []).map((rule) => rule.cssText).join('\n');
    } catch {
      return '';
    }
  })
  .filter(Boolean)
  .join('\n')
  .replace(/<\/style/gi, '<\\/style');

const wrapCssForPdf = (css) => `${'<' + 'style'}>${css}${'<' + '/style'}>`;

const GROUP_TITLES_FOR_PDF = ['tronc commun', '1ères bac', '1eres bac', '2ème bac', '2eme bac', 'autres'];
const normalizeText = (text) => String(text || '').replace(/\s+/g, ' ').trim().toLowerCase();

const isVisiblePage = (page) => {
  const rect = page.getBoundingClientRect();
  const style = window.getComputedStyle(page);
  return rect.width > 50 && rect.height > 50 && style.display !== 'none' && style.visibility !== 'hidden';
};

const canonicalGroupTitle = (title) => {
  const text = normalizeText(title);
  if (text === '1eres bac') return '1ères bac';
  if (text === '2eme bac') return '2ème bac';
  return text;
};

const getFilledGroupTitles = () => {
  const tablePage = document.querySelector('.timetable-table')?.closest('.cahier-page');
  if (!tablePage) return new Set();

  const groupGrid = Array.from(tablePage.querySelectorAll('div'))
    .find((node) => {
      const children = Array.from(node.children || []);
      return children.length === 5 && children.some((child) => /tronc commun/i.test(child.textContent || ''));
    });

  if (!groupGrid) return new Set();

  return new Set(Array.from(groupGrid.children).reduce((titles, groupBox) => {
    const children = Array.from(groupBox.children || []);
    const title = canonicalGroupTitle(children[0]?.textContent || '');
    const classesText = normalizeText(children[1]?.textContent || '');
    const hasRealClass = classesText && classesText !== 'déposer ici';
    if (title && hasRealClass) titles.push(title);
    return titles;
  }, []));
};

const getHomeworkPageTitle = (page) => {
  const directTitle = canonicalGroupTitle(page.querySelector(':scope > div > div')?.textContent || '');
  if (GROUP_TITLES_FOR_PDF.includes(directTitle)) return directTitle;

  const candidates = Array.from(page.querySelectorAll('div'))
    .slice(0, 24)
    .map((node) => canonicalGroupTitle(node.textContent || ''));

  return candidates.find((text) => GROUP_TITLES_FOR_PDF.includes(text)) || '';
};

const shouldExportPage = (page, filledGroupTitles) => {
  if (!page.classList.contains('homework-page')) return true;
  if (!filledGroupTitles.size) return false;
  const title = getHomeworkPageTitle(page);
  return filledGroupTitles.has(title);
};

const prepareCloneInputs = (root) => {
  root.querySelectorAll(`#${PDF_BUTTON_ID}, script, style, link`).forEach((node) => node.remove());
  root.querySelectorAll('textarea').forEach((textarea) => {
    textarea.textContent = textarea.value;
    textarea.setAttribute('value', textarea.value);
  });
  root.querySelectorAll('input').forEach((input) => input.setAttribute('value', input.value));
};

const cloneA4PagesHtml = () => {
  const zone = document.querySelector('.cahier-preview-zone');
  if (!zone) return '';

  const filledGroupTitles = getFilledGroupTitles();
  const pages = Array.from(zone.querySelectorAll('.a4-page, .cahier-page'))
    .filter(isVisiblePage)
    .filter((page) => shouldExportPage(page, filledGroupTitles));

  const exportZone = document.createElement('div');
  exportZone.className = 'cahier-preview-zone';

  if (pages.length) {
    pages.forEach((page) => {
      const clone = page.cloneNode(true);
      prepareCloneInputs(clone);
      exportZone.append(clone);
    });
  } else {
    throw new Error('Aucune page du groupe rempli trouvée');
  }

  return `${wrapCssForPdf(getCurrentCssText())}${exportZone.outerHTML}`;
};

const downloadBlob = (blob) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Cahier-de-texte-2026-2027.pdf';
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
};

const downloadCahierPdf = async (button) => {
  const originalText = button.textContent;
  button.disabled = true;
  document.body.classList.add('cahier-pdf-exporting');

  try {
    setButtonStatus(button, 'Préparation...');
    await waitForFonts();
    await wait(250);

    const html = cloneA4PagesHtml();
    if (!html) throw new Error('Pages A4 introuvables');

    setButtonStatus(button, 'Génération PDF...');
    const response = await fetch('/api/cahier-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html, baseUrl: window.location.origin })
    });

    if (!response.ok) {
      let message = 'Erreur génération PDF';
      try {
        const data = await response.json();
        message = data.error || message;
      } catch { /* ignore */ }
      throw new Error(message);
    }

    setButtonStatus(button, 'Téléchargement...');
    const blob = await response.blob();
    downloadBlob(blob);
    setButtonStatus(button, 'PDF téléchargé');
    await wait(700);
  } catch (error) {
    alert(`Erreur PDF : ${error?.message || 'export impossible'}`);
  } finally {
    document.body.classList.remove('cahier-pdf-exporting');
    button.disabled = false;
    button.textContent = originalText;
  }
};

const ensureCahierPdfButton = () => {
  let button = document.getElementById(PDF_BUTTON_ID);
  if (!button) {
    button = document.createElement('button');
    button.id = PDF_BUTTON_ID;
    button.type = 'button';
    button.className = 'cahier-pdf-export-button';
    button.textContent = 'Télécharger PDF';
    button.title = 'Télécharger les pages A4 en PDF couleur';
    button.addEventListener('click', () => downloadCahierPdf(button));
    document.body.append(button);
  }
  button.hidden = !document.body.classList.contains('cahier-tab-active');
};

const scheduleCahierPdfButton = () => window.requestAnimationFrame(ensureCahierPdfButton);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleCahierPdfButton, { once: true });
} else {
  scheduleCahierPdfButton();
}

new MutationObserver(scheduleCahierPdfButton).observe(document.body, {
  attributes: true,
  attributeFilter: ['class'],
  childList: true,
  subtree: false
});
