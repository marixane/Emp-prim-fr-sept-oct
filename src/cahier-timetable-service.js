const CLASS_NAME = 'cahier-timetable-toolbar';

const findPage = () => document.querySelector('.timetable-table, .primary-timetable-table')?.closest('.a4-page, .cahier-page');

const resetButton = (button, role) => {
  if (!button) return;
  /* Les anciens boutons reçoivent un style 3D vert directement dans l’attribut
     style. Le retirer permet à la nouvelle barre d’appliquer un thème homogène. */
  button.removeAttribute('style');
  button.classList.add('cahier-timetable-toolbar-button', `cahier-timetable-${role}-button`);
};

const syncToolbar = () => {
  const page = findPage();
  const preview = document.getElementById('cahier-pdf-preview-stable');
  const download = document.getElementById('cahier-pdf-button-stable');
  if (!page || !preview || !download) return;
  page.classList.add('cahier-service-page');

  let toolbar = page.querySelector(`:scope > .${CLASS_NAME}`);
  if (!toolbar) {
    toolbar = document.createElement('div');
    toolbar.className = `${CLASS_NAME} no-print`;
    toolbar.setAttribute('aria-label', 'Commandes du cahier de texte');
    page.append(toolbar);
  }

  resetButton(preview, 'preview');
  resetButton(download, 'download');
  const option = document.querySelector('.cahier-lines-per-page-control, .cahier-class-grouping-control');
  const desired = option ? [preview, option, download] : [preview, download];
  if (option) {
    option.classList.add('cahier-timetable-toolbar-option', 'no-print');
  }
  const current = Array.from(toolbar.children);
  const alreadyOrdered = current.length === desired.length && desired.every((node, index) => current[index] === node);
  if (!alreadyOrdered) toolbar.append(...desired);
  toolbar.classList.toggle('has-option', Boolean(option));
};

let timer = 0;
const schedule = () => {
  clearTimeout(timer);
  timer = setTimeout(syncToolbar, 0);
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once: true });
else schedule();
new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
window.addEventListener('resize', schedule);
window.addEventListener('cahier-pages-generated', schedule);
