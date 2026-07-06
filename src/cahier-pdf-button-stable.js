const PDF_BUTTON_ID = 'cahier-pdf-button-stable';
const A4_WIDTH = '210mm';
const A4_HEIGHT = '297mm';

const EXPORT_CSS = `
  @page { size: ${A4_WIDTH} ${A4_HEIGHT}; margin: 0; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box !important; }
  html, body { margin: 0 !important; padding: 0 !important; background: white !important; overflow: visible !important; }
  .cahier-preview-zone { display: block !important; width: ${A4_WIDTH} !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; transform: none !important; zoom: 1 !important; }
  .a4-page, .cahier-page {
    display: block !important;
    position: relative !important;
    width: ${A4_WIDTH} !important;
    min-width: ${A4_WIDTH} !important;
    max-width: ${A4_WIDTH} !important;
    height: ${A4_HEIGHT} !important;
    min-height: ${A4_HEIGHT} !important;
    max-height: ${A4_HEIGHT} !important;
    margin: 0 !important;
    padding-left: inherit;
    transform: none !important;
    scale: 1 !important;
    zoom: 1 !important;
    overflow: hidden !important;
    box-shadow: none !important;
    break-after: page !important;
    page-break-after: always !important;
  }
  .a4-page:last-child, .cahier-page:last-child { break-after: auto !important; page-break-after: auto !important; }
  #${PDF_BUTTON_ID}, .app-tabs, .no-print, button { display: none !important; }
`;

const getCss = () => Array.from(document.styleSheets).map((sheet) => {
  try { return Array.from(sheet.cssRules || []).map((rule) => rule.cssText).join('\n'); }
  catch { return ''; }
}).filter(Boolean).join('\n');

const prepareClone = (clone) => {
  clone.querySelectorAll(`#${PDF_BUTTON_ID}, script, style, link`).forEach((node) => node.remove());
  clone.querySelectorAll('textarea').forEach((textarea) => {
    textarea.textContent = textarea.value;
    textarea.setAttribute('value', textarea.value);
  });
  clone.querySelectorAll('input').forEach((input) => input.setAttribute('value', input.value));
  clone.style.setProperty('width', A4_WIDTH, 'important');
  clone.style.setProperty('height', A4_HEIGHT, 'important');
  clone.style.setProperty('margin', '0', 'important');
  clone.style.setProperty('transform', 'none', 'important');
  clone.style.setProperty('zoom', '1', 'important');
  clone.style.setProperty('overflow', 'hidden', 'important');
};

const buildExportHtml = () => {
  const pages = Array.from(document.querySelectorAll('.cahier-preview-zone .a4-page, .cahier-preview-zone .cahier-page')).filter((page) => {
    const rect = page.getBoundingClientRect();
    const style = window.getComputedStyle(page);
    return rect.width > 50 && rect.height > 50 && style.display !== 'none' && style.visibility !== 'hidden';
  });

  if (!pages.length) throw new Error('Aucune page A4 trouvée');

  const zone = document.createElement('div');
  zone.className = 'cahier-preview-zone';
  zone.style.setProperty('width', A4_WIDTH, 'important');
  zone.style.setProperty('display', 'block', 'important');
  zone.style.setProperty('margin', '0', 'important');
  zone.style.setProperty('padding', '0', 'important');

  pages.forEach((page) => {
    const clone = page.cloneNode(true);
    prepareClone(clone);
    zone.append(clone);
  });

  return `<style>${getCss()}\n${EXPORT_CSS}</style>${zone.outerHTML}`;
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

const exportPdf = async (button) => {
  const original = button.textContent;
  button.disabled = true;
  button.textContent = 'Préparation PDF...';

  try {
    if (document.fonts?.ready) await document.fonts.ready;
    const html = buildExportHtml();
    button.textContent = 'Génération PDF...';

    const response = await fetch('/api/cahier-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html, baseUrl: window.location.origin })
    });

    if (!response.ok) {
      let message = 'Erreur génération PDF';
      try { message = (await response.json()).error || message; } catch { /* ignore */ }
      throw new Error(message);
    }

    button.textContent = 'Téléchargement...';
    downloadBlob(await response.blob());
    button.textContent = 'PDF téléchargé';
    window.setTimeout(() => { button.textContent = original; }, 900);
  } catch (error) {
    alert(`Erreur PDF : ${error?.message || 'export impossible'}`);
    button.textContent = original;
  } finally {
    button.disabled = false;
  }
};

const styleButton = (button) => {
  button.hidden = false;
  button.style.cssText = `
    position: fixed !important;
    right: 22px !important;
    bottom: 22px !important;
    z-index: 2147483647 !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    pointer-events: auto !important;
    border: 0 !important;
    border-radius: 999px !important;
    padding: 14px 22px !important;
    min-width: 190px !important;
    background: #16a34a !important;
    color: white !important;
    font: 900 15px Arial, sans-serif !important;
    box-shadow: 0 10px 25px rgba(0,0,0,.28) !important;
    cursor: pointer !important;
  `;
};

const createButton = () => {
  if (document.getElementById(PDF_BUTTON_ID)) return;
  const button = document.createElement('button');
  button.id = PDF_BUTTON_ID;
  button.type = 'button';
  button.textContent = 'Télécharger PDF';
  button.title = 'Télécharger toutes les pages A4 en PDF';
  styleButton(button);
  button.addEventListener('click', () => exportPdf(button));
  document.body.append(button);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createButton, { once: true });
} else {
  createButton();
}
