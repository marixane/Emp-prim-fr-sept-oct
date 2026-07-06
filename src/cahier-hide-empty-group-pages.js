const ensureEmptyGroupPageStyle = () => {
  if (document.getElementById('cahier-empty-group-page-style')) return;
  const style = document.createElement('style');
  style.id = 'cahier-empty-group-page-style';
  style.textContent = 'body.cahier-tab-active .homework-page{display:block!important;} body.cahier-tab-active .homework-page.cahier-page-hidden-after-limit{display:none!important;} body.cahier-tab-active .homework-entry.cahier-entry-hidden-after-limit{display:none!important;}';
  document.head.appendChild(style);
};

const getCahierEntryDate = (entry) => {
  const text = String(entry?.querySelector?.('.homework-date')?.textContent || '');
  const match = text.match(/(\d{2})\/(\d{2})/);
  if (!match) return null;
  return { day: Number(match[1]), month: Number(match[2]) };
};

const getCahierPageTitle = (page) => String(
  page?.querySelector?.('.homework-page > div:first-child > div:first-child')?.textContent ||
  page?.firstElementChild?.firstElementChild?.textContent ||
  ''
).trim();

const getProgressPercentToJulyFirst = (date) => {
  const start = new Date(2026, 8, 1);
  const end = new Date(2027, 6, 1);
  const current = new Date(date?.month >= 9 ? 2026 : 2027, (date?.month || 9) - 1, date?.day || 1);
  return Math.min(100, Math.max(0, Math.round(((current - start) / (end - start)) * 100)));
};

const setHeaderProgress = (header, percent) => {
  const progressFill = header?.children?.[1]?.children?.[0]?.children?.[0];
  const progressText = header?.children?.[1]?.children?.[1];
  if (progressFill) progressFill.style.setProperty('width', `${percent}%`, 'important');
  if (progressText) progressText.textContent = `${percent}%`;
};

const fixCahierProgressBars = () => {
  document.querySelectorAll('.homework-page').forEach((page) => {
    const date = getCahierEntryDate(page.querySelector('.homework-entry:not(.cahier-entry-hidden-after-limit)')) || { day: 1, month: 9 };
    setHeaderProgress(page.firstElementChild, getProgressPercentToJulyFirst(date));
  });
};

const findPreviousNormalPage = (page) => {
  let node = page.previousElementSibling;
  while (node) {
    if (node.classList?.contains('homework-page') && node.dataset.cahierJulyComplete !== 'true' && !node.classList.contains('cahier-page-hidden-after-limit')) return node;
    node = node.previousElementSibling;
  }
  return null;
};

const normalizeJulyHeaders = () => {
  document.querySelectorAll('.homework-page[data-cahier-july-complete="true"]').forEach((page) => {
    const source = findPreviousNormalPage(page);
    const sourceHeader = source?.firstElementChild;
    if (!sourceHeader) return;

    const clonedHeader = sourceHeader.cloneNode(true);
    setHeaderProgress(clonedHeader, 100);
    if (page.firstElementChild) page.replaceChild(clonedHeader, page.firstElementChild);
    else page.prepend(clonedHeader);

    page.classList.add('cahier-themed-group-page');
    page.style.setProperty('--group-color', source.style.getPropertyValue('--group-color') || page.style.getPropertyValue('--group-color'));
    page.style.setProperty('--group-cover-color', source.style.getPropertyValue('--group-cover-color') || source.style.getPropertyValue('--group-color') || page.style.getPropertyValue('--group-color'));
  });
};

const getFilledGroupsFromBoxes = () => {
  const tablePage = document.querySelector('.timetable-table')?.closest('.cahier-page');
  const wrap = Array.from(tablePage?.children || []).find((child) => String(child.getAttribute('style') || '').includes('grid-template-columns: repeat(5'));
  const groups = new Map();
  Array.from(wrap?.children || []).forEach((box) => {
    const title = String(box.children?.[0]?.textContent || '').trim();
    const classes = Array.from(box.children?.[1]?.querySelectorAll('span') || []).map((span) => String(span.textContent || '').trim()).filter(Boolean);
    if (title && classes.length) groups.set(title, classes);
  });
  return groups;
};

const rebuildCoverBadges = (panel, classes) => {
  if (!panel || !classes?.length) return;
  panel.innerHTML = '';
  classes.forEach((className, index) => {
    const badge = document.createElement('div');
    badge.className = 'cahier-group-cover-class-badge';
    badge.style.setProperty('--class-index', String(index));
    badge.textContent = className;
    panel.append(badge);
  });
};

const fixGroupCoverTitles = () => {
  const groups = getFilledGroupsFromBoxes();
  document.querySelectorAll('.cahier-group-cover-page').forEach((cover) => {
    const nextPage = cover.nextElementSibling?.classList?.contains('homework-page') ? cover.nextElementSibling : null;
    const title = getCahierPageTitle(nextPage);
    if (!title || !groups.has(title)) return;

    const titleNode = cover.querySelector('.cahier-group-cover-title');
    if (titleNode) titleNode.textContent = title;
    rebuildCoverBadges(cover.querySelector('.cahier-group-cover-classes-panel'), groups.get(title));
  });
};

const applyCahierEndLimit = () => {
  document.querySelectorAll('.homework-entry').forEach((entry) => {
    const date = getCahierEntryDate(entry);
    const afterLimit = date?.month === 7 && date.day > 10;
    entry.classList.toggle('cahier-entry-hidden-after-limit', Boolean(afterLimit));
  });

  normalizeJulyHeaders();
  fixGroupCoverTitles();

  document.querySelectorAll('.homework-page').forEach((page) => {
    const visibleEntries = Array.from(page.querySelectorAll('.homework-entry')).filter((entry) => !entry.classList.contains('cahier-entry-hidden-after-limit'));
    page.classList.toggle('cahier-page-hidden-after-limit', visibleEntries.length === 0);
  });

  fixCahierProgressBars();
};

const applyEmptyGroupPageVisibility = () => {
  if (!document.body.classList.contains('cahier-tab-active')) return;
  ensureEmptyGroupPageStyle();
  document.querySelectorAll('.homework-page').forEach((page) => page.classList.add('cahier-visible-group-page'));
  applyCahierEndLimit();
};

let emptyGroupPagesRaf = 0;
const scheduleEmptyGroupPageVisibility = () => {
  if (emptyGroupPagesRaf) return;
  emptyGroupPagesRaf = window.requestAnimationFrame(() => {
    emptyGroupPagesRaf = 0;
    applyEmptyGroupPageVisibility();
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleEmptyGroupPageVisibility, { once: true });
} else {
  scheduleEmptyGroupPageVisibility();
}

window.setTimeout(scheduleEmptyGroupPageVisibility, 150);
window.setTimeout(scheduleEmptyGroupPageVisibility, 500);
window.setTimeout(scheduleEmptyGroupPageVisibility, 1200);
window.setTimeout(scheduleEmptyGroupPageVisibility, 2200);
window.setTimeout(scheduleEmptyGroupPageVisibility, 3600);
window.setTimeout(scheduleEmptyGroupPageVisibility, 5600);
window.setTimeout(scheduleEmptyGroupPageVisibility, 7600);
window.setTimeout(scheduleEmptyGroupPageVisibility, 10000);

document.addEventListener('input', (event) => {
  if (event.target?.closest?.('.timetable-table')) window.setTimeout(scheduleEmptyGroupPageVisibility, 120);
}, { passive: true });
document.addEventListener('drop', () => window.setTimeout(scheduleEmptyGroupPageVisibility, 150), { passive: true });
document.addEventListener('mouseup', () => window.setTimeout(scheduleEmptyGroupPageVisibility, 150), { passive: true });
