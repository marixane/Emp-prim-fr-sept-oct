const getProgressSchoolYear = () => {
  const now = new Date();
  return now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
};

const readSchoolDate = (value, startYear) => {
  const found = String(value || '').match(/[0-9]{1,2}\/[0-9]{1,2}/);
  if (!found) return null;
  const [day, month] = found[0].split('/').map(Number);
  return new Date(month >= 9 ? startYear : startYear + 1, month - 1, day);
};

const progressBetweenSeptemberAndMay = (date, startYear) => {
  const start = new Date(startYear, 8, 1);
  const end = new Date(startYear + 1, 4, 30);
  return Math.max(0, Math.min(100, Math.round(((date - start) / (end - start)) * 100)));
};

const refreshProgressBars = () => {
  const startYear = getProgressSchoolYear();
  const flagDates = ['19/10', '07/12', '15/03', '03/05'];

  document.querySelectorAll('.homework-page').forEach((page) => {
    const date = readSchoolDate(page.querySelector('.homework-date')?.textContent, startYear);
    const header = page.firstElementChild;
    const wrap = header?.children?.[1];
    const bar = wrap?.children?.[0];
    const label = wrap?.children?.[1];
    const fill = bar?.children?.[0];
    if (!date || !bar || !fill || !label) return;

    const percent = progressBetweenSeptemberAndMay(date, startYear);
    fill.style.width = percent + '%';
    label.textContent = percent + '%';

    Array.from(bar.querySelectorAll('span')).forEach((flag, index) => {
      const flagDate = readSchoolDate(flagDates[index], startYear);
      if (flagDate) flag.style.left = progressBetweenSeptemberAndMay(flagDate, startYear) + '%';
    });
  });
};

const runProgressRefresh = () => {
  refreshProgressBars();
  setTimeout(refreshProgressBars, 300);
  setTimeout(refreshProgressBars, 1000);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runProgressRefresh, { once: true });
} else {
  runProgressRefresh();
}

window.addEventListener('load', runProgressRefresh, { once: true });
