import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

let pdfDirectBusy = false;

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

function copyTextareaValues(original, clone) {
  const originalFields = original.querySelectorAll('textarea, input');
  const cloneFields = clone.querySelectorAll('textarea, input');
  originalFields.forEach(function (field, index) {
    const copy = cloneFields[index];
    if (!copy) return;
    copy.value = field.value;
    copy.textContent = field.value;
    copy.setAttribute('value', field.value);
  });
}

function stretchExtraPageForPdf(clone) {
  const list = clone.querySelector('.exercise-list');
  if (!list) return;
  const exercises = Array.from(list.querySelectorAll('.exam-exercise')).filter(function (exercise) {
    return !exercise.classList.contains('blank-exercise');
  });
  if (!exercises.length) return;

  const pageHeight = 1123;
  const footerGap = 62;
  const top = list.offsetTop || 0;
  const gap = Math.max(0, (exercises.length - 1) * 2);
  const available = Math.max(120, pageHeight - top - footerGap);
  const base = Math.floor((available - gap) / exercises.length);
  const last = Math.max(15, available - gap - base * (exercises.length - 1));

  list.style.setProperty('height', available + 'px', 'important');
  list.style.setProperty('min-height', available + 'px', 'important');
  list.style.setProperty('max-height', available + 'px', 'important');
  list.style.setProperty('display', 'flex', 'important');
  list.style.setProperty('flex-direction', 'column', 'important');
  list.style.setProperty('gap', '2px', 'important');
  list.style.setProperty('overflow', 'hidden', 'important');

  exercises.forEach(function (exercise, index) {
    const h = index === exercises.length - 1 ? last : base;
    exercise.style.setProperty('height', h + 'px', 'important');
    exercise.style.setProperty('min-height', '15px', 'important');
    exercise.style.setProperty('flex', '0 0 ' + h + 'px', 'important');
    exercise.style.setProperty('overflow', 'hidden', 'important');
  });
}

function addPdfBottomBorder(clone) {
  const bottomLine = document.createElement('div');
  bottomLine.className = 'pdf-page-bottom-border';
  bottomLine.style.setProperty('position', 'absolute', 'important');
  bottomLine.style.setProperty('left', '0', 'important');
  bottomLine.style.setProperty('right', '0', 'important');
  bottomLine.style.setProperty('bottom', '0', 'important');
  bottomLine.style.setProperty('height', '1px', 'important');
  bottomLine.style.setProperty('background', '#000', 'important');
  bottomLine.style.setProperty('z-index', '999999', 'important');
  bottomLine.style.setProperty('pointer-events', 'none', 'important');
  clone.appendChild(bottomLine);
}

function preparePdfClone(original) {
  const clone = original.cloneNode(true);
  copyTextareaValues(original, clone);

  clone.classList.add('is-exporting', 'pdf-clone-page');
  clone.classList.remove('second-page');
  clone.style.setProperty('position', 'relative', 'important');
  clone.style.setProperty('left', '0', 'important');
  clone.style.setProperty('top', '0', 'important');
  clone.style.setProperty('width', '794px', 'important');
  clone.style.setProperty('height', '1123px', 'important');
  clone.style.setProperty('min-width', '794px', 'important');
  clone.style.setProperty('min-height', '1123px', 'important');
  clone.style.setProperty('max-width', '794px', 'important');
  clone.style.setProperty('max-height', 'none', 'important');
  clone.style.setProperty('margin', '0', 'important');
  clone.style.setProperty('transform', 'none', 'important');
  clone.style.setProperty('scale', '1', 'important');
  clone.style.setProperty('translate', '0 0', 'important');
  clone.style.setProperty('box-sizing', 'border-box', 'important');
  clone.style.setProperty('overflow', 'hidden', 'important');

  clone.querySelectorAll('.photo-overlay-tools, .mask-delete-button, .mask-resize-handle, .bar-buttons, .exercise-line-count-overlay, .page-number-safe-controls').forEach(function (el) {
    el.remove();
  });

  const linesToggle = document.querySelector('.pdf-lines-toggle');
  const hideLines = linesToggle && String(linesToggle.textContent || '').toLowerCase().includes('masquées');
  clone.classList.toggle('no-pdf-lines', !!hideLines);

  if (original.classList.contains('second-page')) stretchExtraPageForPdf(clone);
  addPdfBottomBorder(clone);

  return clone;
}

function createHiddenPdfWorkspace() {
  const workspace = document.createElement('div');
  workspace.className = 'pdf-hidden-workspace';
  workspace.style.setProperty('position', 'absolute', 'important');
  workspace.style.setProperty('left', '0', 'important');
  workspace.style.setProperty('top', '0', 'important');
  workspace.style.setProperty('width', '794px', 'important');
  workspace.style.setProperty('height', '1123px', 'important');
  workspace.style.setProperty('min-width', '794px', 'important');
  workspace.style.setProperty('min-height', '1123px', 'important');
  workspace.style.setProperty('overflow', 'visible', 'important');
  workspace.style.setProperty('background', '#fff', 'important');
  workspace.style.setProperty('z-index', '-10000', 'important');
  workspace.style.setProperty('pointer-events', 'none', 'important');
  document.body.appendChild(workspace);
  return workspace;
}

async function makeOriginalPdf() {
  const visiblePages = Array.from(document.querySelectorAll('.preview-zone .a4-page'));
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const previousOriginalSize = document.body.classList.contains('pdf-original-size-now');
  document.body.classList.add('pdf-original-size-now');

  try {
    for (let index = 0; index < visiblePages.length; index += 1) {
      const workspace = createHiddenPdfWorkspace();
      const clone = preparePdfClone(visiblePages[index]);
      workspace.appendChild(clone);

      await wait(120);

      const canvas = await html2canvas(clone, {
        scale: 2,
        x: 0,
        y: 0,
        width: 794,
        height: 1123,
        windowWidth: 794,
        windowHeight: 1400,
        scrollX: 0,
        scrollY: 0,
        backgroundColor: '#fff',
        useCORS: true
      });

      workspace.remove();

      if (index) pdf.addPage('a4', 'portrait');
      pdf.addImage(canvas.toDataURL('image/jpeg', 1), 'JPEG', 0, 0, 210, 297);
    }
  } finally {
    if (!previousOriginalSize) document.body.classList.remove('pdf-original-size-now');
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
    button.disabled = false;
    button.textContent = previousText;
    pdfDirectBusy = false;
  }
}

document.addEventListener('click', function (event) {
  const action = getPdfButton(event.target);
  if (!action) return;

  event.preventDefault();
  event.stopPropagation();
  if (event.stopImmediatePropagation) event.stopImmediatePropagation();

  const previewWindow = action.mode === 'preview' ? window.open('', '_blank') : null;
  runDirectPdf(action.button, action.mode, previewWindow);
}, true);
