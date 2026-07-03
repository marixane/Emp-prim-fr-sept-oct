let lastMobilePdfRun = 0;

function getMobilePdfButton(target) {
  const button = target && target.closest && target.closest('.a4-footer-preview,.a4-footer-export');
  if (!button || button.disabled) return null;
  return {
    button,
    mode: button.classList.contains('a4-footer-export') ? 'download' : 'preview'
  };
}

function runMobilePdf(event) {
  const action = getMobilePdfButton(event.target);
  if (!action) return;

  event.preventDefault();
  event.stopPropagation();
  if (event.stopImmediatePropagation) event.stopImmediatePropagation();

  const now = Date.now();
  if (now - lastMobilePdfRun < 500) return;
  lastMobilePdfRun = now;

  if (typeof window.startExamPdf === 'function') {
    window.startExamPdf(action.mode, action.button);
    return;
  }

  const fallbackText = action.mode === 'preview' ? 'Voir PDF' : 'Exporter PDF A4';
  const fallback = Array.from(document.querySelectorAll('.panel button')).find((button) =>
    String(button.textContent || '').trim().toLowerCase().includes(fallbackText.toLowerCase())
  );
  if (fallback && !fallback.disabled) fallback.click();
}

document.addEventListener('pointerdown', runMobilePdf, true);
document.addEventListener('touchstart', runMobilePdf, { capture: true, passive: false });
document.addEventListener('click', runMobilePdf, true);
