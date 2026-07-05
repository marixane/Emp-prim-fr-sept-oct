const GROUP_COVER_COLORS = ['#38bdf8', '#34d399', '#fbbf24', '#f472b6', '#a78bfa'];
const GROUP_COVER_LOGO_PATH = '/Logo_AR_TM_V.png';

const getHomeworkPageTitleForCover = (page) => String(
  page.querySelector('.homework-page > div:first-child > div:first-child')?.textContent ||
  page.firstElementChild?.firstElementChild?.textContent ||
  ''
).trim();

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
    const startsNewBlock = !currentBlock || firstDate < currentBlock.lastDate || (title !== currentBlock.title && firstDate <= currentBlock.lastDate);

    if (startsNewBlock) {
      currentBlock = { title, pages: [], lastDate: -1 };
      blocks.push(currentBlock);
    }

    currentBlock.pages.push(page);
    currentBlock.lastDate = firstDate;
  });

  return blocks;
};

const buildGroupCoverPage = (title, index) => {
  const page = document.createElement('div');
  page.className = 'a4-page cahier-page cahier-group-cover-page';
  page.style.setProperty('--group-cover-color', GROUP_COVER_COLORS[index % GROUP_COVER_COLORS.length]);

  const card = document.createElement('div');
  card.className = 'cahier-group-cover-card';

  const logoRow = document.createElement('div');
  logoRow.className = 'cahier-group-cover-logo-row';

  const leftLogo = document.createElement('span');
  leftLogo.className = 'cahier-group-cover-logo';
  leftLogo.textContent = '🏫';

  const officialLogo = document.createElement('img');
  officialLogo.className = 'cahier-group-cover-official-logo';
  officialLogo.src = GROUP_COVER_LOGO_PATH;
  officialLogo.alt = 'Logo scolaire';

  const rightLogo = document.createElement('span');
  rightLogo.className = 'cahier-group-cover-logo';
  rightLogo.textContent = '📚';

  logoRow.append(leftLogo, officialLogo, rightLogo);

  const titleNode = document.createElement('div');
  titleNode.className = 'cahier-group-cover-title';
  titleNode.textContent = title;

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

  card.append(logoRow, titleNode, subtitle, icons);
  page.append(card);
  return page;
};

const applyGroupCoverPages = () => {
  if (!document.body.classList.contains('cahier-tab-active')) return;
  document.querySelectorAll('.cahier-group-cover-page').forEach((page) => page.remove());

  const blocks = splitVisibleHomeworkBlocks();
  blocks.forEach((block, index) => {
    if (!block.pages.length) return;
    const cover = buildGroupCoverPage(block.title, index);
    block.pages[0].before(cover);
  });
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
