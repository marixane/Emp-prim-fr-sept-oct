function applyMobilePhoneForce() {
  var existing = document.getElementById('mobile-phone-force-style');
  if (existing) existing.remove();

  var viewportWidth = Math.max(240, Math.round(window.visualViewport?.width || window.innerWidth || document.documentElement.clientWidth || 0));
  var viewportHeight = Math.max(320, Math.round(window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight || 0));
  var availableWidth = Math.max(240, viewportWidth - 18);
  var mobileScale = Math.min(1, Math.max(0.32, availableWidth / 794));
  var scaledWidth = Math.ceil(794 * mobileScale);
  var scaledPageHeight = 1123 * mobileScale;
  var pageCount = Math.max(1, document.querySelectorAll('.preview-zone .a4-page').length || document.querySelectorAll('.a4-page').length || 1);
  var gap = 6;
  var pagesOverflow = (pageCount * scaledPageHeight + Math.max(0, pageCount - 1) * gap) > (viewportHeight + 2);
  var needsVerticalScroll = pageCount > 1 || pagesOverflow;
  var bottomRoom = needsVerticalScroll ? 18 : 0;
  var mobileA4Gap = -Math.max(0, Math.round(1123 * (1 - mobileScale) - bottomRoom));
  var previewOverflowY = needsVerticalScroll ? 'auto' : 'hidden';
  var previewPaddingBottom = needsVerticalScroll ? 12 : 0;
  var lastPageBottom = mobileA4Gap;

  var style = document.createElement('style');
  style.id = 'mobile-phone-force-style';
  style.textContent = `
    @media (max-width: 1200px) {
      html,
      body,
      #root {
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
        overflow-x: hidden !important;
      }

      body .education-top-navbar {
        display: none !important;
      }

      body .app-shell {
        width: 100vw !important;
        height: 100vh !important;
        min-width: 100vw !important;
        max-width: 100vw !important;
        min-height: 100vh !important;
        max-height: 100vh !important;
        display: grid !important;
        grid-template-columns: 100vw !important;
        grid-template-rows: 100vh !important;
        gap: 0 !important;
        padding: 0 !important;
        margin: 0 !important;
        overflow: hidden !important;
        overflow-x: hidden !important;
        flex-direction: initial !important;
        flex-wrap: initial !important;
        align-items: stretch !important;
      }

      body .panel {
        position: fixed !important;
        left: -10000px !important;
        top: 0 !important;
        width: 1px !important;
        min-width: 1px !important;
        max-width: 1px !important;
        height: 1px !important;
        min-height: 1px !important;
        max-height: 1px !important;
        opacity: 0 !important;
        overflow: hidden !important;
        pointer-events: none !important;
        display: block !important;
        padding: 0 !important;
        margin: 0 !important;
        border: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
      }

      body .panel::-webkit-scrollbar {
        width: 0 !important;
        height: 0 !important;
      }

      body .page-date-control,
      body .page-date-picker,
      body .page-date-title,
      body .page-date-input,
      body .page-date-toggle,
      body .page-date-toggle-button,
      body .panel .eyebrow,
      body .panel h1,
      body .panel .intro,
      body .panel .form-group > label,
      body .exercise-count-section h2,
      body .note-scale-title,
      body .note-scale-counter,
      body .page-count-card label {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
        min-height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
      }

      body .panel .form-group,
      body .assignment-control,
      body .note-scale-control,
      body .note-scale-buttons,
      body .exercise-count-section,
      body .page-count-grid,
      body .page-count-card,
      body .page-count-card .compact-control {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        gap: 5px !important;
        border: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
        box-sizing: border-box !important;
      }

      body .panel button,
      body .assignment-control button,
      body .note-scale-button,
      body .pdf-lines-toggle,
      body .bar-ribbon-toggle,
      body .panel > button:not(.pdf-lines-toggle):not(.bar-ribbon-toggle),
      body .page-count-card .compact-control button {
        width: 30px !important;
        min-width: 30px !important;
        max-width: 30px !important;
        height: 30px !important;
        min-height: 30px !important;
        padding: 0 !important;
        margin: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        border-radius: 9px !important;
        font-size: 0 !important;
        overflow: hidden !important;
        box-sizing: border-box !important;
      }

      body .panel button::before,
      body .assignment-control button::before,
      body .note-scale-button::before,
      body .pdf-lines-toggle::before,
      body .bar-ribbon-toggle::before,
      body .page-count-card .compact-control button::before {
        position: static !important;
        width: auto !important;
        height: auto !important;
        background: transparent !important;
        border: 0 !important;
        box-shadow: none !important;
        font-size: 14px !important;
        font-weight: 900 !important;
        color: currentColor !important;
      }

      body .assignment-control button:nth-child(1)::before { content: 'I' !important; }
      body .assignment-control button:nth-child(2)::before { content: 'M' !important; }
      body .note-scale-button:nth-child(1)::before { content: '10' !important; font-size: 12px !important; }
      body .note-scale-button:nth-child(2)::before { content: '20' !important; font-size: 12px !important; }
      body .pdf-lines-toggle::before { content: 'L' !important; }
      body .bar-ribbon-toggle::before { content: 'Pts' !important; font-size: 10px !important; }
      body .pdf-lines-toggle::after,
      body .bar-ribbon-toggle::after { content: '' !important; display: none !important; }

      body .page-count-card .compact-control strong {
        width: 30px !important;
        min-width: 30px !important;
        max-width: 30px !important;
        height: 22px !important;
        line-height: 22px !important;
        padding: 0 !important;
        border-radius: 7px !important;
        font-size: 11px !important;
      }

      body .page-count-card .compact-control strong::after { content: '' !important; display: none !important; }
      body .page-count-card .compact-control button:first-child::before { content: '-' !important; }
      body .page-count-card .compact-control button:last-child::before { content: '+' !important; }
      body .panel > button.secondary::before { content: 'PDF' !important; font-size: 9px !important; }

      body .preview-zone {
        grid-column: 1 !important;
        width: 100vw !important;
        min-width: 100vw !important;
        max-width: 100vw !important;
        flex: 0 0 100vw !important;
        flex-shrink: 1 !important;
        height: 100vh !important;
        min-height: 100vh !important;
        max-height: 100vh !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: flex-start !important;
        justify-content: flex-start !important;
        justify-items: start !important;
        gap: ${gap}px !important;
        padding: 0 0 ${previewPaddingBottom}px 0 !important;
        margin: 0 !important;
        overflow-y: ${previewOverflowY} !important;
        overflow-x: hidden !important;
        overscroll-behavior-y: contain !important;
        -webkit-overflow-scrolling: touch !important;
        box-sizing: border-box !important;
        background: #e8edf4 !important;
        border-left: 0 !important;
        transform: none !important;
      }

      body .preview-zone .a4-page,
      body .a4-page {
        position: relative !important;
        left: 50% !important;
        transform: scale(${mobileScale}) translateX(-50%) !important;
        transform-origin: top left !important;
        width: 794px !important;
        min-width: 794px !important;
        max-width: 794px !important;
        margin: 0 0 ${mobileA4Gap}px 0 !important;
        flex: 0 0 auto !important;
        translate: 0 0 !important;
      }

      body .preview-zone .a4-page::before,
      body .a4-page::before {
        content: '' !important;
        display: block !important;
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: ${scaledWidth}px !important;
        height: 1px !important;
        pointer-events: none !important;
        opacity: 0 !important;
      }

      body .exam-page.has-bar-ribbon .exam-exercise .exercise-body {
        border-left: 0 !important;
        box-shadow: none !important;
        padding-left: 0 !important;
        background: repeating-linear-gradient(white 0px, white 28px, #ddd 29px) !important;
      }

      body .exam-page.has-bar-ribbon .exam-exercise .exercise-body::before {
        content: '' !important;
        display: block !important;
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        bottom: 0 !important;
        width: 29px !important;
        background: rgba(15, 23, 42, 0.08) !important;
        border-right: 1px solid rgba(15, 23, 42, 0.18) !important;
        z-index: 1 !important;
        pointer-events: none !important;
      }

      body .exam-page.has-bar-ribbon .exam-exercise .exercise-body::after,
      body .exam-page.has-bar-ribbon .exam-exercise::before,
      body .exam-page.has-bar-ribbon .exam-exercise::after {
        display: none !important;
        content: none !important;
        width: 0 !important;
        background: transparent !important;
        border: 0 !important;
        box-shadow: none !important;
      }

      body .bar-mark {
        background: transparent !important;
        border: 0 !important;
        box-shadow: none !important;
        color: #111 !important;
      }

      body .preview-zone .a4-page:last-child,
      body .a4-page:last-child {
        margin-bottom: ${lastPageBottom}px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

var lastMobilePageCount = 0;
var mobileRefreshTimer = null;

function scheduleMobilePhoneForce() {
  if (mobileRefreshTimer) clearTimeout(mobileRefreshTimer);
  applyMobilePhoneForce();
  requestAnimationFrame(applyMobilePhoneForce);
  setTimeout(applyMobilePhoneForce, 80);
  setTimeout(applyMobilePhoneForce, 250);
  setTimeout(applyMobilePhoneForce, 600);
  mobileRefreshTimer = setTimeout(applyMobilePhoneForce, 1200);
}

function watchMobilePageCount() {
  var count = document.querySelectorAll('.preview-zone .a4-page').length || document.querySelectorAll('.a4-page').length || 0;
  if (count !== lastMobilePageCount) {
    lastMobilePageCount = count;
    scheduleMobilePhoneForce();
  }
}

scheduleMobilePhoneForce();
setTimeout(scheduleMobilePhoneForce, 1800);
setInterval(watchMobilePageCount, 300);
window.addEventListener('load', scheduleMobilePhoneForce);
window.addEventListener('resize', scheduleMobilePhoneForce);
window.addEventListener('orientationchange', function () {
  setTimeout(scheduleMobilePhoneForce, 80);
});
