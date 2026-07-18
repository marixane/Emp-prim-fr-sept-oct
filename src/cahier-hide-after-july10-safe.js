const SCHOOL_START = new Date(2026, 8, 1, 12, 0, 0, 0);
const SCHOOL_END = new Date(2026, 9, 31, 12, 0, 0, 0);

const FLAG_DATES = [
  { title: 'Vacances intermédiaires 1', date: new Date(2026, 9, 18, 12, 0, 0, 0) },
  { title: 'Vacances intermédiaires 2', date: new Date(2026, 11, 6, 12, 0, 0, 0) },
  { title: 'Vacances intermédiaires 3', date: new Date(2027, 2, 21, 12, 0, 0, 0) },
  { title: 'Vacances intermédiaires 4', date: new Date(2027, 4, 9, 12, 0, 0, 0) }
];

const getPercent = (date) => {
  const value = ((date - SCHOOL_START) / (SCHOOL_END - SCHOOL_START)) * 100;
  return Math.min(100, Math.max(0, value));
};

const getDateFromText = (text) => {
  const match = String(text || '').match(/(\d{1,2})\/(\d{1,2})/);
  if (!match) return SCHOOL_START;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = month >= 9 ? 2026 : 2027;
  return new Date(year, month - 1, day, 12, 0, 0, 0);
};

const isAfterJuly10 = (text) => {
  const match = String(text || '').match(/(\d{1,2})\/07(?:\/\d{4})?/);
  return match ? Number(match[1]) > 10 : false;
};

const updateProgressBar = (page, entries) => {
  if (!entries.length) return;

  const firstVisibleEntry = entries.find((entry) => !entry.hidden);
  if (!firstVisibleEntry) return;

  const dateText = firstVisibleEntry.querySelector('.homework-date')?.textContent || '';
  const percent = Math.round(getPercent(getDateFromText(dateText)));

  const header = page.firstElementChild;
  const progressWrap = header?.children?.[1];
  const bar = progressWrap?.children?.[0];
  const percentNode = progressWrap?.children?.[1];
  const fill = bar?.children?.[0];

  if (fill) fill.style.width = `${percent}%`;
  if (percentNode) percentNode.textContent = `${percent}%`;

  if (bar) {
    const flagNodes = Array.from(bar.querySelectorAll('span'));
    FLAG_DATES.forEach((flag, index) => {
      const node = flagNodes[index];
      if (!node) return;
      node.style.left = `${getPercent(flag.date)}%`;
      node.title = flag.title;
      node.setAttribute('aria-label', flag.title);
    });
  }
};

const updateJulyVisibility = () => {
  document.querySelectorAll('.homework-page').forEach((page) => {
    const entries = Array.from(page.querySelectorAll('.homework-entry'));

    entries.forEach((entry) => {
      const dateText = entry.querySelector('.homework-date')?.textContent || '';
      const shouldHide = isAfterJuly10(dateText);
      entry.hidden = shouldHide;

      if (shouldHide) {
        entry.style.setProperty('display', 'none', 'important');
      } else {
        entry.style.removeProperty('display');
      }
    });

    const hasVisibleEntry = entries.some((entry) => !entry.hidden);
    page.hidden = entries.length > 0 && !hasVisibleEntry;

    if (page.hidden) {
      page.style.setProperty('display', 'none', 'important');
    } else {
      page.style.removeProperty('display');
      updateProgressBar(page, entries);
    }
  });
};

let scheduled = false;
const scheduleUpdate = () => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    updateJulyVisibility();
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleUpdate, { once: true });
} else {
  scheduleUpdate();
}

new MutationObserver(scheduleUpdate).observe(document.documentElement, {
  childList: true,
  subtree: true
});
