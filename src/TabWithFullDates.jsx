import { memo, useLayoutEffect } from 'react';
import Tab from './Tab.jsx';

const SCHOOL_START_YEAR = 2026;
const SCHOOL_END_YEAR = 2027;
const SCHOOL_END_DATE = new Date(2026, 9, 31);
const DATE_PATTERN = /\b(\d{2})\/(\d{2})(?![\s/]?\d{4})\b/g;
const FULL_DATE_PATTERN = /\b(\d{2})\/(\d{2})\/(\d{4})\b/;
const YEAR_FIRST_DATE_PATTERN = /\b(\d{4})\/(\d{2})\/(\d{2})\b/;
const DUPLICATED_YEAR_FIRST_DATE_PATTERN = /\b(\d{4})\/(\d{2})\/(\d{2})\/(\d{4})\b/g;
const DAY_NAMES = ['DIMANCHE', 'LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];

const CANONICAL_EVENTS = [
  { start: '05/09/2026', end: '06/09/2026', label: 'Religieuse', text: 'Vacance religieuse : Aïd Al Mawlid Annabaoui', type: 'holiday' },
  { start: '18/10/2026', end: '25/10/2026', label: 'Scolaire', text: 'Vacance scolaire : Vacances intermédiaires 1', type: 'holiday' },
  { start: '31/10/2026', end: '31/10/2026', label: 'Nationale', text: 'Fête nationale : Fête de l’Unité', type: 'holiday' },
  { start: '06/11/2026', end: '06/11/2026', label: 'Nationale', text: 'Fête nationale : Marche Verte', type: 'holiday' },
  { start: '18/11/2026', end: '18/11/2026', label: 'Nationale', text: 'Fête nationale : Fête de l’Indépendance', type: 'holiday' },
  { start: '06/12/2026', end: '13/12/2026', label: 'Scolaire', text: 'Vacance scolaire : Vacances intermédiaires 2', type: 'holiday' },
  { start: '01/01/2027', end: '01/01/2027', label: 'Nationale', text: 'Fête nationale : Nouvel An', type: 'holiday' },
  { start: '11/01/2027', end: '11/01/2027', label: 'Nationale', text: 'Fête nationale : Manifeste de l’Indépendance', type: 'holiday' },
  { start: '14/01/2027', end: '14/01/2027', label: 'Nationale', text: 'Fête nationale : Nouvel An Amazigh', type: 'holiday' },
  { start: '24/01/2027', end: '31/01/2027', label: 'Scolaire', text: 'Vacance scolaire : Vacances de mi-année', type: 'holiday' },
  { start: '15/03/2027', end: '22/03/2027', label: 'Scolaire', text: 'Vacance scolaire : Vacances intermédiaires 3', type: 'holiday' },
  { start: '20/03/2027', end: '22/03/2027', label: 'Religieuse', text: 'Vacance religieuse : Aïd Al-Fitr', type: 'holiday' },
  { start: '01/05/2027', end: '01/05/2027', label: 'Nationale', text: 'Fête nationale : Fête du Travail', type: 'holiday' },
  { start: '09/05/2027', end: '16/05/2027', label: 'Scolaire', text: 'Vacance scolaire : Vacances intermédiaires 4', type: 'holiday' },
  { start: '27/05/2027', end: '30/05/2027', label: 'Religieuse', text: 'Vacance religieuse : Aïd Al-Adha', type: 'holiday' },
  { start: '16/06/2027', end: '16/06/2027', label: 'Religieuse', text: 'Vacance religieuse : 1er Moharram', type: 'holiday' },
  { start: '20/01/2027', end: '24/01/2027', label: 'Primaire', text: 'Examen : Examen normalisé local', type: 'exam' },
  { start: '23/06/2027', end: '24/06/2027', label: 'Primaire', text: 'Examen : Examen normalisé provincial', type: 'exam' },
  { start: '10/07/2027', end: '10/07/2027', label: 'Primaire', text: 'Signature du Procès-verbal de sortie', type: 'exam' },
];

const getYearForMonth = (month) => Number(month) >= 9 ? SCHOOL_START_YEAR : SCHOOL_END_YEAR;
const normalizeDateSeparators = (text) => String(text ?? '').replace(/\b(\d{2})\/(\d{2})\s+(2026|2027)\b/g, '$1/$2/$3');
const addSchoolYearToDates = (text) => {
  const normalizedText = normalizeDateSeparators(text)
    .replace(DUPLICATED_YEAR_FIRST_DATE_PATTERN, '$1/$2/$3');
  // Une date déjà affichée en AAAA/MM/JJ est complète : ne jamais lui ajouter
  // une seconde année à partir de sa portion MM/JJ.
  if (YEAR_FIRST_DATE_PATTERN.test(normalizedText)) return normalizedText;
  return normalizedText.replace(DATE_PATTERN, (_, day, month) => `${day}/${month}/${getYearForMonth(month)}`);
};
const parseDate = (value) => {
  const [day, month, year] = String(value).split('/').map(Number);
  return new Date(year, month - 1, day);
};
const formatDate = (date) => `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
const getFirstDisplayedDate = (text) => {
  const normalizedText = addSchoolYearToDates(text);
  const yearFirstMatch = normalizedText.match(YEAR_FIRST_DATE_PATTERN);
  if (yearFirstMatch) return new Date(Number(yearFirstMatch[1]), Number(yearFirstMatch[2]) - 1, Number(yearFirstMatch[3]));
  const match = normalizedText.match(FULL_DATE_PATTERN);
  return match ? parseDate(match[0]) : null;
};
const getDayAndDate = (value) => {
  const date = parseDate(value);
  return `${DAY_NAMES[date.getDay()]} ${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
};
const getEventDateLabel = (event) => event.start === event.end ? getDayAndDate(event.start) : `${getDayAndDate(event.start)} - ${getDayAndDate(event.end)}`;
const isSameDate = (a, b) => a && b && a.getTime() === b.getTime();
const isInside = (date, event) => date >= parseDate(event.start) && date <= parseDate(event.end);
const isEventEntry = (entry) => entry.classList.contains('cahier-extra-holiday-entry') || entry.classList.contains('cahier-exam-entry') || /Vacance|Fête nationale|Examen|Rattrapage|Procès-verbal/i.test(entry.querySelector('.homework-text')?.textContent || '');

const hasSaturdayClass = () => {
  const saturdayRow = [...document.querySelectorAll('.timetable-table tbody tr')].find((row) => {
    const dayField = row.querySelector('.day-cell textarea');
    return String(dayField?.value || '').trim().toUpperCase() === 'SAMEDI';
  });

  if (!saturdayRow) return false;

  return [...saturdayRow.querySelectorAll('td:not(.day-cell) textarea')]
    .some((textarea) => String(textarea.value || '').trim().length > 0);
};

const setEventEntry = (entry, event) => {
  const dateElement = entry.querySelector('.homework-date');
  const textElement = entry.querySelector('.homework-text');
  const subjectElement = entry.querySelector('.homework-subject');
  if (dateElement) dateElement.textContent = getEventDateLabel(event);
  if (textElement) textElement.textContent = event.text;
  if (subjectElement) subjectElement.innerHTML = `<div style="display:grid;grid-template-columns:52px 1fr;align-items:center;gap:6px;min-height:24px;padding:4px 7px;border:1px solid rgba(63,64,80,.18);border-radius:8px;background:rgba(63,64,80,.045);font-family:Arial,sans-serif;line-height:1"><span style="display:inline-flex;align-items:center;justify-content:center;min-width:72px;height:22px;border-radius:999px;background:var(--homework-color);color:white;font-size:12px;font-weight:900;white-space:nowrap">${event.label}</span><span></span></div>`;
  entry.classList.toggle('cahier-exam-entry', event.type === 'exam');
  entry.classList.toggle('cahier-extra-holiday-entry', event.type === 'holiday');
  entry.dataset.canonicalEvent = `${event.start}|${event.text}`;
};

const fixEntries = (root = document) => {
  const entries = [...root.querySelectorAll?.('.homework-entry') || []];
  const saturdayHasClass = hasSaturdayClass();

  entries.forEach((entry) => {
    const dateElement = entry.querySelector('.homework-date');
    if (!dateElement) return;
    const fullText = addSchoolYearToDates(dateElement.textContent);
    if (dateElement.textContent !== fullText) dateElement.textContent = fullText;
    const firstDate = getFirstDisplayedDate(fullText);
    if (!firstDate || firstDate > SCHOOL_END_DATE) {
      if (firstDate && firstDate > SCHOOL_END_DATE) entry.classList.add('cahier-dom-hidden');
      return;
    }

    if (formatDate(firstDate) === '05/09/2026' && !saturdayHasClass) {
      entry.classList.add('cahier-dom-hidden');
      return;
    }

    // Le noyau génère désormais directement le premier samedi lorsqu'il
    // contient des séances. Ne pas le reconvertir en page de vacances ici.
    if (
      formatDate(firstDate) === '05/09/2026'
      && saturdayHasClass
      && entry.querySelector('.cahier-session-row')
    ) {
      entry.classList.remove('cahier-dom-hidden', 'cahier-extra-holiday-entry', 'cahier-exam-entry');
      return;
    }

    const currentText = entry.querySelector('.homework-text')?.textContent || '';
    const matchingByText = CANONICAL_EVENTS.find((event) => {
      const key = event.text.replace(/^.*?:\s*/, '').toLowerCase();
      return currentText.toLowerCase().includes(key);
    });
    if (matchingByText) {
      setEventEntry(entry, matchingByText);
      return;
    }

    const startingEvents = CANONICAL_EVENTS.filter((event) => isSameDate(firstDate, parseDate(event.start)));
    if (startingEvents.length && !isEventEntry(entry)) {
      setEventEntry(entry, startingEvents[0]);
      return;
    }

    const blockingEvent = CANONICAL_EVENTS.find((event) => event.type === 'holiday' && isInside(firstDate, event));
    if (blockingEvent && !isSameDate(firstDate, parseDate(blockingEvent.start)) && !isEventEntry(entry)) entry.classList.add('cahier-dom-hidden');
  });

  const groupCovers = [...root.querySelectorAll?.('.homework-cover-page') || []];
  groupCovers.forEach((cover) => {
    const eventKeys = new Set();
    let page = cover.nextElementSibling;

    while (page && !page.classList.contains('homework-cover-page')) {
      if (page.classList.contains('homework-page')) {
        page.querySelectorAll('.homework-entry[data-canonical-event]').forEach((entry) => {
          const key = entry.dataset.canonicalEvent;
          if (eventKeys.has(key)) entry.classList.add('cahier-dom-hidden');
          else eventKeys.add(key);
        });
      }
      page = page.nextElementSibling;
    }
  });

  const eventStartDates = new Set(CANONICAL_EVENTS.map((event) => event.start));
  document.querySelectorAll('.homework-entry').forEach((entry) => {
    if (isEventEntry(entry)) return;
    const firstDate = getFirstDisplayedDate(entry.querySelector('.homework-date')?.textContent || '');
    if (firstDate && formatDate(firstDate) === '05/09/2026' && saturdayHasClass) return;
    if (firstDate && eventStartDates.has(formatDate(firstDate))) entry.classList.add('cahier-dom-hidden');
  });
};

const updateDisplayedDates = (root = document) => {
  root.querySelectorAll?.('.homework-entry, .homework-page').forEach((element) => {
    element.classList.remove('cahier-dom-hidden');
  });

  root.querySelectorAll?.('.cahier-header input[aria-label="Année scolaire automatique"]').forEach((input) => {
    if (input.value !== 'Année scolaire : 2026 / 2027') input.value = 'Année scolaire : 2026 / 2027';
  });

  fixEntries(root);

  root.querySelectorAll?.('.cahier-exams-list tbody tr').forEach((row) => {
    Array.from(row.cells).slice(0, 2).forEach((cell) => {
      const nextText = addSchoolYearToDates(cell.textContent);
      if (cell.textContent !== nextText) cell.textContent = nextText;
    });
  });

  root.querySelectorAll?.('.holidays-page td').forEach((cell) => {
    const nextText = addSchoolYearToDates(cell.textContent);
    if (cell.textContent !== nextText) cell.textContent = nextText;
  });

  document.querySelectorAll('.homework-page').forEach((page) => {
    if (!page.querySelector('.homework-entry:not(.cahier-dom-hidden)')) page.classList.add('cahier-dom-hidden');
  });
};

function TabWithFullDates(props) {
  useLayoutEffect(() => {
    updateDisplayedDates();
    const handlePagesGenerated = () => updateDisplayedDates();
    window.addEventListener('cahier-pages-generated', handlePagesGenerated);
    return () => window.removeEventListener('cahier-pages-generated', handlePagesGenerated);
  }, []);

  return <>
    <style>{`
      .homework-date {
        border-bottom: 2px dotted rgba(63, 64, 80, 0.5) !important;
        padding-bottom: 8px !important;
      }

      .cahier-dom-hidden {
        display: none !important;
      }
    `}</style>
    <Tab {...props} />
  </>;
}

export default memo(TabWithFullDates);
