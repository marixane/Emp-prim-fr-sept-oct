const getCahierPreviewZone = () => document.querySelector('.cahier-preview-zone');
const isCahierTab = () => document.body.classList.contains('cahier-tab-active');

const fitCahierScrollPanel = () => {
  if (!isCahierTab()) return;

  const zone = getCahierPreviewZone();
  const shell = document.querySelector('.cahier-shell');
  const tabs = document.querySelector('.app-tabs');
  if (!zone || !shell) return;

  const tabsBottom = Math.ceil(tabs?.getBoundingClientRect().bottom || 0);
  const availableHeight = Math.max(260, window.innerHeight - tabsBottom - 18);

  shell.style.height = `${availableHeight}px`;
  shell.style.maxHeight = `${availableHeight}px`;
  shell.style.overflow = 'hidden';

  zone.style.height = `${Math.max(220, availableHeight - 28)}px`;
  zone.style.maxHeight = `${Math.max(220, availableHeight - 28)}px`;
  zone.style.overflowY = 'scroll';
  zone.style.overflowX = 'auto';
  zone.style.webkitOverflowScrolling = 'touch';
  zone.style.overscrollBehavior = 'contain';
};

const wheelToCahierPanel = (event) => {
  if (!isCahierTab()) return;

  const zone = getCahierPreviewZone();
  if (!zone || zone.scrollHeight <= zone.clientHeight) return;

  const target = event.target;
  const isEditable = target?.closest?.('textarea, input, [contenteditable="true"]');
  if (isEditable) return;

  event.preventDefault();
  zone.scrollTop += event.deltaY;
  zone.scrollLeft += event.deltaX;
};

const keyToCahierPanel = (event) => {
  if (!isCahierTab()) return;

  const zone = getCahierPreviewZone();
  if (!zone) return;

  const target = event.target;
  const isEditable = target?.closest?.('textarea, input, [contenteditable="true"]');
  if (isEditable) return;

  const pageStep = zone.clientHeight * 0.85;
  const actions = {
    ArrowDown: () => { zone.scrollTop += 80; },
    ArrowUp: () => { zone.scrollTop -= 80; },
    PageDown: () => { zone.scrollTop += pageStep; },
    PageUp: () => { zone.scrollTop -= pageStep; },
    Home: () => { zone.scrollTop = 0; },
    End: () => { zone.scrollTop = zone.scrollHeight; },
    ' ': () => { zone.scrollTop += pageStep; }
  };

  if (!actions[event.key]) return;
  event.preventDefault();
  actions[event.key]();
};

const scheduleCahierFit = () => requestAnimationFrame(fitCahierScrollPanel);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleCahierFit, { once: true });
} else {
  scheduleCahierFit();
}

window.addEventListener('resize', scheduleCahierFit);
window.addEventListener('orientationchange', scheduleCahierFit);
window.addEventListener('wheel', wheelToCahierPanel, { passive: false, capture: true });
window.addEventListener('keydown', keyToCahierPanel, { capture: true });

new MutationObserver(scheduleCahierFit).observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class', 'style']
});
