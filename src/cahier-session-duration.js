const durationText = (span) => `${Math.max(Number(span) || 1, 1)}h`;

const clean = (value) => String(value || '').trim().toUpperCase().replace(/\s+/g, ' ');

const getTimetableDurations = () => {
  const rows = Array.from(document.querySelectorAll('.timetable-table tbody tr'));
  const map = new Map();

  rows.forEach((row) => {
    const day = clean(row.querySelector('.day-cell textarea')?.value || row.querySelector('.day-cell')?.textContent);
    let hourIndex = 0;

    Array.from(row.children).slice(1).forEach((cell) => {
      const text = clean(cell.querySelector('textarea')?.value || cell.textContent);
      if (!text) {
        hourIndex += Number(cell.colSpan) || 1;
        return;
      }

      const header = document.querySelector(`.timetable-table thead th:nth-child(${hourIndex + 2}) textarea`);
      const hour = clean((header?.value || header?.textContent || '').split('-')[0]);
      const span = Number(cell.colSpan) || 1;
      map.set(`${day}|${hour}|${text}`, durationText(span));
      hourIndex += span;
    });
  });

  return map;
};

const getEntryDay = (entry) => clean((entry.querySelector('.homework-date')?.textContent || '').split(' ')[0]);

const applySessionDurations = () => {
  if (!document.body.classList.contains('cahier-tab-active')) return;

  const durations = getTimetableDurations();
  document.querySelectorAll('.homework-entry:not(.cahier-extra-holiday-entry):not(.cahier-exam-entry)').forEach((entry) => {
    const day = getEntryDay(entry);

    entry.querySelectorAll('.homework-subject > div').forEach((line) => {
      const spans = line.querySelectorAll('span');
      const hour = clean(spans[0]?.textContent);
      const className = clean(spans[1]?.textContent);
      const duration = durations.get(`${day}|${hour}|${className}`) || '1h';

      let durationNode = line.querySelector('.cahier-session-duration');
      if (!durationNode) {
        durationNode = document.createElement('span');
        durationNode.className = 'cahier-session-duration';
        line.append(durationNode);
      }
      durationNode.textContent = duration;
    });
  });
};

const scheduleSessionDurations = () => window.setTimeout(applySessionDurations, 80);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleSessionDurations, { once: true });
} else {
  scheduleSessionDurations();
}

document.addEventListener('focusout', scheduleSessionDurations, true);
document.addEventListener('drop', scheduleSessionDurations, true);
document.addEventListener('click', (event) => {
  if (event.target?.closest?.('.span-tools, .timetable-table')) scheduleSessionDurations();
}, true);
