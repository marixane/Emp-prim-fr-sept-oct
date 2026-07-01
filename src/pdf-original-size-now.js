import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

let pdfDirectBusy = false;

function lockOriginalPdfSize() {
  document.body.classList.add('pdf-original-size-now');
  document.documentElement.style.setProperty('--sheet-scale', '1');
  document.documentElement.style.setProperty('--sheet-columns', '1');

  document.querySelectorAll('.a4-page, .exam-page').forEach(function (page) {
    page.classList.add('is-exporting');
    page.style.setProperty('transform', 'none', 'important');
    page.style.setProperty('scale', '1', 'important');
    page.style.setProperty('width', '794px', 'important');
    page.style.setProperty('height', '1123px', 'important');
    page.style.setProperty('min-width', '794px', 'important');
    page.style.setProperty('min-height', '1123px', 'important');
    page.style.setProperty('max-width', '794px', 'important');
    page.style.setProperty('max-height', '1123px', 'important');
    page.style.setProperty('margin', '0', 'important');
  });
}

function unlockOriginalPdfSize() {
  document.body.classList.remove('pdf-original-size-now');
  document.querySelectorAll('.a4-page, .exam-page').forEach(function (page) {
    page.classList.remove('is-exporting');
    page.classList.remove('no-pdf-lines');
    page.style.removeProperty('transform');
    page.style.removeProperty('scale');
    page.style.removeProperty('width');
    page.style.removeProperty('height');
    page.style.removeProperty('min-width');
    page.style.removeProperty('min-height');
    page.style.removeProperty('max-width');
    page.style.removeProperty('max-height');
    page.style.removeProperty('margin');
  });
  if (window.syncTwoPageView) window.syncTwoPageView();
}

function enableOriginalPdfSizeNow() {
  lockOriginalPdfSize();

  clearInterval(window.__pdfOriginalSizeInterval);
  window.__pdfOriginalSizeInterval = setInterval(lockOriginalPdfSize, 20);

  clearTimeout(window.__pdfOriginalSizeTimer);
  window.__pdfOriginalSizeTimer = setTimeout(function () {
    clearInterval(window.__pdfOriginalSizeInterval);
    unlockOriginalPdfSize();
  }, 15000);
}

function getPdfButton(target) {
  const button = target && target.closest && target.closest('button');
  if (!button || button.disabled) return null;
  const text = String(button.textContent || '').trim().toLowerCase();
  if (text.includes('voir pdf')) return { button: button, mode: 'preview' };
  if (text.includes('exporter pdf')) return { button: button, mode: 'download' };
  return null;
}

function wait(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

async function makeOriginalPdf() {
  enableOriginalPdfSizeNow();
  await wait(300);

  const pages = Array.from(document.querySelectorAll('.preview-zone .a4-page'));
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  for (let index = 0; index < pages.length; index += 1) {
    const node = pages[index];
    node.querySelectorAll('textarea').forEach(function (field) { field.blur(); });

    const canvas = await html2canvas(node, {
      scale: 2,
      width: 794,
      height: 1123,
      windowWidth: 794,
      windowHeight: 1123,
      scrollX: 0,
      scrollY: 0,
      backgroundColor: '#fff',
      ignoreElements: function (el) {
        return el.classList?.contains('photo-overlay-tools') || el.classList?.contains('mask-delete-button') || el.classList?.contains('mask-resize-handle') || el.classList?.contains('bar-buttons');
      }
    });

    if (index) pdf.addPage('a4', 'portrait');
    pdf.addImage(canvas.toDataURL('image/jpeg', 1), 'JPEG', 0, 0, 210, 297);
  }

  return pdf;
}

async function runDirectPdf(button, mode, previewWindow) {
  if (pdfDirectBusy) return;
  pdfDirectBusy = true;
  const previousText = button.textContent;
  button.disabled = true;
  button.textContent = mode === 'preview' ? 'Préparation...' : 'Export en cours...';

  try {
    const pdf = await makeOriginalPdf();
    if (mode === 'preview') {
      const url = pdf.output('bloburl');
      if (previewWindow) previewWindow.location.href = url;
      else window.open(url, '_blank');
    } else {
      pdf.save('devoir-a4.pdf');
    }
  } finally {
    clearInterval(window.__pdfOriginalSizeInterval);
    unlockOriginalPdfSize();
    button.disabled = false;
    button.textContent = previousText;
    pdfDirectBusy = false;
  }
}

document.addEventListener('pointerdown', function (event) {
  if (getPdfButton(event.target)) enableOriginalPdfSizeNow();
}, true);

document.addEventListener('mousedown', function (event) {
  if (getPdfButton(event.target)) enableOriginalPdfSizeNow();
}, true);

document.addEventListener('click', function (event) {
  const action = getPdfButton(event.target);
  if (!action) return;

  event.preventDefault();
  event.stopPropagation();
  if (event.stopImmediatePropagation) event.stopImmediatePropagation();

  const previewWindow = action.mode === 'preview' ? window.open('', '_blank') : null;
  runDirectPdf(action.button, action.mode, previewWindow);
}, true);

window.enableOriginalPdfSizeNow = enableOriginalPdfSizeNow;
window.lockOriginalPdfSize = lockOriginalPdfSize;
