let lastMobilePdfRun = 0;
let mobilePdfTouchArmed = false;

function ensureMobilePdfStyle() {
  let style = document.getElementById('mobile-pdf-touch-fix-style');
  if (!style) {
    style = document.createElement('style');
    style.id = 'mobile-pdf-touch-fix-style';
    document.head.appendChild(style);
  }
  style.textContent = `
    @media (max-width: 1200px) {
      .a4-footer-preview,
      .a4-footer-export {
        touch-action: manipulation !important;
        -webkit-user-select: none !important;
        user-select: none !important;
        -webkit-tap-highlight-color: transparent !important;
        cursor: pointer !important;
      }
      .a4-footer-preview::after,
      .a4-footer-export::after {
        content: '' !important;
        position: absolute !important;
        left: -14px !important;
        right: -14px !important;
        top: -14px !important;
        bottom: -14px !important;
        background: transparent !important;
        pointer-events: auto !important;
      }
    }
  `;
}

function getMobilePdfButton(target) {
  const button = target && target.closest && target.closest('.a4-footer-preview,.a4-footer-export');
  if (!button || button.disabled) return null;
  return {
    button,
    mode: button.classList.contains('a4-footer-export') ? 'download' : 'preview'
  };
}

function stopPdfTap(event) {
  const action = getMobilePdfButton(event.target);
  if (!action) return null;
  event.preventDefault();
  event.stopPropagation();
  if (event.stopImmediatePropagation) event.stopImmediatePropagation();
  return action;
}

function runMobilePdf(event) {
  const action = stopPdfTap(event);
  if (!action) return;

  const now = Date.now();
  if (now - lastMobilePdfRun < 700) return;
  lastMobilePdfRun = now;

  if (typeof window.startExamPdf === 'function') {
    window.startExamPdf(action.mode);
    return;
  }

  const fallbackText = action.mode === 'preview' ? 'Voir PDF' : 'Exporter PDF A4';
  const fallback = Array.from(document.querySelectorAll('.panel button')).find((button) =>
    String(button.textContent || '').trim().toLowerCase().includes(fallbackText.toLowerCase())
  );
  if (fallback && !fallback.disabled) fallback.click();
}

function armMobilePdf(event) {
  const action = stopPdfTap(event);
  if (!action) return;
  mobilePdfTouchArmed = true;
}

function finishMobilePdf(event) {
  const action = stopPdfTap(event);
  if (!action) return;
  if (!mobilePdfTouchArmed) return;
  mobilePdfTouchArmed = false;
  runMobilePdf(event);
}

ensureMobilePdfStyle();
setTimeout(ensureMobilePdfStyle, 300);
setTimeout(ensureMobilePdfStyle, 1000);
window.addEventListener('resize', ensureMobilePdfStyle);
document.addEventListener('touchstart', armMobilePdf, { capture: true, passive: false });
document.addEventListener('touchend', finishMobilePdf, { capture: true, passive: false });
document.addEventListener('pointerup', runMobilePdf, true);
document.addEventListener('dblclick', stopPdfTap, true);
document.addEventListener('gesturestart', function (event) {
  if (getMobilePdfButton(event.target)) event.preventDefault();
}, { capture: true, passive: false });
