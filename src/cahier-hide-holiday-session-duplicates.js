const getDateInfo = (text) => {
  const match = String(text || '').match(/(\d{2})\/(\d{2})/);
  return match ? { day: Number(match[1]), month: Number(match[2]) } : null;
};

const compareDates = (left, right) => {
  if (left.month !== right.month) return left.month - right.month;
  return left.day - right.day;
};

const isSameDate = (left, right) => left?.day === right?.day && left?.month === right?.month;

const holidayRanges = () => Array.from(document.querySelectorAll('.homework-entry.cahier-extra-holiday-entry')).map((entry) => {
  const dateText = entry.querySelector('.homework-date')?.textContent || '';
  const dates = Array.from(dateText.matchAll(/(\d{2})\/(\d{2})/g)).map((match) => ({ day: Number(match[1]), month: Number(match[2]) }));
  return { start: dates[0], end: dates[1] || dates[0] };
}).filter((range) => range.start && range.end);

const isHolidayDate = (date, ranges) => ranges.some((range) => compareDates(date, range.start) >= 0 && compareDates(date, range.end) <= 0);

const hideHolidaySessionDuplicates = () => {
  if (!document.body.classList.contains('cahier-tab-active')) return;
  const ranges = holidayRanges();
  if (!ranges.length) return;

  document.querySelectorAll('.homework-entry:not(.cahier-extra-holiday-entry):not(.cahier-exam-entry)').forEach((entry) => {
    const date = getDateInfo(entry.querySelector('.homework-date')?.textContent || '');
    if (!date) return;

    const alreadyHasHolidaySameDay = Array.from(document.querySelectorAll('.homework-entry.cahier-extra-holiday-entry')).some((holiday) => {
      const holidayDate = getDateInfo(holiday.querySelector('.homework-date')?.textContent || '');
      return isSameDate(date, holidayDate);
    });

    if (alreadyHasHolidaySameDay || isHolidayDate(date, ranges)) entry.remove();
  });

  document.querySelectorAll('.homework-page').forEach((page) => {
    if (!page.querySelector('.homework-entry')) page.remove();
  });
};

const scheduleHolidayDuplicateFix = () => window.setTimeout(hideHolidaySessionDuplicates, 120);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleHolidayDuplicateFix, { once: true });
} else {
  scheduleHolidayDuplicateFix();
}

document.addEventListener('focusout', scheduleHolidayDuplicateFix, true);
document.addEventListener('drop', scheduleHolidayDuplicateFix, true);
document.addEventListener('click', (event) => {
  if (event.target?.closest?.('.timetable-table, .span-tools')) scheduleHolidayDuplicateFix();
}, true);
