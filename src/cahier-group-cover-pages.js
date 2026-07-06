const GROUP_COVER_COLORS = ['#38bdf8', '#34d399', '#fbbf24', '#f472b6', '#a78bfa'];

const getHomeworkPageTitleForCover = (page) => String(
  page.querySelector('.homework-page > div:first-child > div:first-child')?.textContent ||
  page.firstElementChild?.firstElementChild?.textContent ||
  ''
).trim();

const setHomeworkPageTitleForCover = (page, title) => {
  const titleNode = page.querySelector('.homework-page > div:first-child > div:first-child') || page.firstElementChild?.firstElementChild;
  if (titleNode && title) titleNode.textContent = title;
};

const getHomeworkPageDateForCover = (page) => {
  const dateText = String(page.querySelector('.homework-date')?.textContent || '');
  const match = dateText.match(/\b(\d{2})\/(\d{2})\b/);
  if (!match) return 99999;
  const day = Number(match[1]);
  const month = Number(match[2]);
  return (month >= 9 ? 0 : 10000) + month * 100 + day;
};

const splitVisibleHomeworkBlocks = () => {
  const visiblePages = Array.from(document.querySelectorAll('.homework-page.cahier-visible-group-page'));
  const blocks = [];
  let currentBlock = null;

  visiblePages.forEach((page) => {
    const title = getHomeworkPageTitleForCover(page);
    const firstDate = getHomeworkPageDateForCover(page);
    const isJulyContinuation = page.dataset.cahierJulyComplete === 'true';
    const startsNewBlock = !currentBlock || (!isJulyContinuation && (firstDate < currentBlock.lastDate || (title !== currentBlock.title && firstDate <= currentBlock.lastDate)));

    if (startsNewBlock) {
      currentBlock = { title, pages: [], lastDate: -1 };
      blocks.push(currentBlock);
    }

    currentBlock.pages.push(page);
    currentBlock.lastDate = Math.max(currentBlock.lastDate, firstDate);
  });

  return blocks;
};

const getFilledGroupClassesForCover = () => {
  const timetablePage = Array.from(document.querySelectorAll('.cahier-page'))
    .find((page) => page.querySelector('.timetable-table'));

  const groupsWrap = Array.from(timetablePage?.children || []).find((child) => {
    const style = String(child.getAttribute('style') || '');
    return style.includes('grid-template-columns: repeat(5');
  });

  return Array.from(groupsWrap?.children || []).map((group, index) => ({
    title: String(group.children?.[0]?.textContent || '').trim(),
    color: GROUP_COVER_COLORS[index % GROUP_COVER_COLORS.length],
    classes: Array.from(group.children?.[1]?.querySelectorAll('span') || [])
      .map((span) => String(span.textContent || '').trim())
      .filter(Boolean)
  })).filter((group) => group.title && group.classes.length);
};

const normalizeClassForCover = (text) => String(text || '').trim().toLowerCase().replace(/\s+/g, '');

const getBlockTextForCover = (block) => normalizeClassForCover(block.pages.map((page) => page.textContent || '').join(' '));

const getGroupForBlock = (block, filledGroups, usedTitles) => {
  const blockText = getBlockTextForCover(block);
  const exact = filledGroups.find((group) => !usedTitles.has(group.title) && group.classes.some((className) => blockText.includes(normalizeClassForCover(className))));
  if (exact) return exact;

  const byTitle = filledGroups.find((group) => !usedTitles.has(group.title) && normalizeClassForCover(block.title) === normalizeClassForCover(group.title));
  if (byTitle) return byTitle;

  return filledGroups.find((group) => !usedTitles.has(group.title)) || null;
};

const buildClassesPanel = (classes) => {
  const panel = document.createElement('div');
  panel.className = 'cahier-group-cover-classes-panel';

  classes.forEach((className, index) => {
    const badge = document.createElement('div');
    badge.className = 'cahier-group-cover-class-badge';
    badge.style.setProperty('--class-index', String(index));
    badge.textContent = className;
    panel.append(badge);
  });

  return panel;
};

const buildGroupCoverPage = (title, index, classes, color) => {
  const page = document.createElement('div');
  page.className = 'a4-page cahier-page cahier-group-cover-page';
  page.style.setProperty('--group-cover-color', color);

  const card = document.createElement('div');
  card.className = 'cahier-group-cover-card';

  const titleNode = document.createElement('div');
  titleNode.className = 'cahier-group-cover-title';
  titleNode.textContent = title;

  const classesPanel = buildClassesPanel(classes);

  const subtitle = document.createElement('div');
  subtitle.className = 'cahier-group-cover-subtitle';
  subtitle.textContent = 'Suivi pédagogique annuel 2025-2026';

  const icons = document.createElement('div');
  icons.className = 'cahier-group-cover-icons';
  ['✏️', '📖', '📐', '🧮', '🎓'].forEach((icon) => {
    const span = document.createElement('span');
    span.textContent = icon;
    icons.append(span);
  });

  card.append(titleNode, classesPanel, subtitle, icons);
  page.append(card);
  return page;
};

const applyThemeToBlockPages = (pages, color, title) => {
  pages.forEach((page) => {
    page.classList.add('cahier-themed-group-page');
    page.style.setProperty('--group-cover-color', color);
    setHomeworkPageTitleForCover(page, title);
  });
};

const normalizeSessionText = (text) => String(text || '').trim().toLowerCase().replace(/\s+/g, '');

const getTimetableDurationMap = () => {
  const map = new Map();
  const table = document.querySelector('.timetable-table');
  if (!table) return map;

  Array.from(table.querySelectorAll('tbody tr')).forEach((row) => {
    const day = normalizeSessionText(row.querySelector('.day-cell textarea')?.value || row.querySelector('.day-cell')?.textContent || '');
    Array.from(row.querySelectorAll('td[colspan]')).forEach((cell) => {
      const textarea = cell.querySelector('textarea');
      const className = normalizeSessionText(textarea?.value || textarea?.textContent || '');
      if (!day || !className) return;
      const duration = Math.max(Number(cell.getAttribute('colspan')) || 1, 1);
      const key = `${day}|${className}`;
      map.set(key, Math.max(map.get(key) || 1, duration));
    });
  });

  return map;
};

const applySessionDurationBadges = () => {
  const durationMap = getTimetableDurationMap();

  document.querySelectorAll('.homework-entry:not(.cahier-exam-entry):not(.cahier-extra-holiday-entry)').forEach((entry) => {
    const dayText = normalizeSessionText(String(entry.querySelector('.homework-date')?.textContent || '').split(/\s+/)[0]);
    entry.querySelectorAll('.homework-subject > div').forEach((sessionRow) => {
      const spans = sessionRow.querySelectorAll('span');
      if (spans.length < 2) return;
      sessionRow.querySelector('.cahier-session-duration')?.remove();
      const className = normalizeSessionText(spans[1]?.textContent || '');
      const duration = durationMap.get(`${dayText}|${className}`) || 1;
      const badge = document.createElement('span');
      badge.className = 'cahier-session-duration';
      badge.textContent = `${duration}h`;
      sessionRow.append(badge);
    });
  });
};

const applyGroupCoverPages = () => {
  if (!document.body.classList.contains('cahier-tab-active')) return;
  document.querySelectorAll('.cahier-group-cover-page').forEach((page) => page.remove());
  document.querySelectorAll('.homework-page.cahier-themed-group-page').forEach((page) => page.classList.remove('cahier-themed-group-page'));

  const blocks = splitVisibleHomeworkBlocks();
  const filledGroups = getFilledGroupClassesForCover();
  const usedTitles = new Set();

  blocks.forEach((block, index) => {
    if (!block.pages.length) return;
    const group = getGroupForBlock(block, filledGroups, usedTitles);
    if (!group?.classes?.length) {
      block.pages.forEach((page) => { page.style.display = 'none'; });
      return;
    }
    usedTitles.add(group.title);
    const color = group.color || GROUP_COVER_COLORS[index % GROUP_COVER_COLORS.length];
    applyThemeToBlockPages(block.pages, color, group.title);
    const firstPageIsJuly = block.pages[0]?.dataset.cahierJulyComplete === 'true';
    if (!firstPageIsJuly) {
      const cover = buildGroupCoverPage(group.title, index, group.classes, color);
      block.pages[0].before(cover);
    }
  });

  applySessionDurationBadges();
};

let groupCoverPagesRaf = 0;
const scheduleGroupCoverPages = () => {
  if (groupCoverPagesRaf) return;
  groupCoverPagesRaf = window.requestAnimationFrame(() => {
    groupCoverPagesRaf = 0;
    applyGroupCoverPages();
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleGroupCoverPages, { once: true });
} else {
  scheduleGroupCoverPages();
}

window.setTimeout(scheduleGroupCoverPages, 300);
window.setTimeout(scheduleGroupCoverPages, 900);
window.setTimeout(scheduleGroupCoverPages, 1800);
window.setTimeout(scheduleGroupCoverPages, 2600);
window.setTimeout(scheduleGroupCoverPages, 4200);

document.addEventListener('input', (event) => {
  if (event.target?.closest?.('.timetable-table')) window.setTimeout(scheduleGroupCoverPages, 180);
}, { passive: true });
document.addEventListener('drop', () => window.setTimeout(scheduleGroupCoverPages, 220), { passive: true });
document.addEventListener('mouseup', () => window.setTimeout(scheduleGroupCoverPages, 220), { passive: true });

new MutationObserver(scheduleGroupCoverPages).observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class', 'style']
});
