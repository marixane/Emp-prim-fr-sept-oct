import { useEffect, useLayoutEffect, useState } from 'react';
import CoverPage from './CoverPage.jsx';
import TabWithFullDates from './TabWithFullDates.jsx';
import { scheduleFullDates } from './force-full-cahier-dates.js';

const removeOldFirstPages = () => {
  document.querySelectorAll('.a4-page').forEach((page) => {
    const text = String(page.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
    const isOldCover = text.includes('mon cahier') || text.includes("classes remplies dans l'emploi du temps");
    if (isOldCover) page.remove();
  });
};

const refreshLayout = () => {
  removeOldFirstPages();
};

export default function App() {
  const [primaryLevelRows, setPrimaryLevelRows] = useState(() => ['Niveau 1', 'Niveau 2']);

  useEffect(() => {
    document.body.classList.add('cahier-tab-active');
    document.body.classList.remove('devoir-tab-active');

    let scheduled = false;
    const scheduleRefresh = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        refreshLayout();
      });
    };

    window.addEventListener('cahier-pages-generated', scheduleRefresh);
    scheduleRefresh();

    return () => {
      window.removeEventListener('cahier-pages-generated', scheduleRefresh);
      document.body.classList.remove('cahier-tab-active');
    };
  }, []);

  useLayoutEffect(() => {
    const cleanupFullDates = scheduleFullDates();
    refreshLayout();

    return cleanupFullDates;
  }, []);

  return <>
    <style>{`
      .timetable-table .timetable-cell-content.colored-cell .timetable-class-input {
        display: block !important;
        justify-self: stretch !important;
        min-width: 0 !important;
        width: 100% !important;
        height: 26px !important;
        min-height: 26px !important;
        max-height: 26px !important;
        margin: 0 !important;
        padding: 0 2px !important;
        font-size: var(--timetable-class-font-size, 14px) !important;
        font-weight: 900 !important;
        line-height: 26px !important;
        text-align: center !important;
        text-indent: 0 !important;
        direction: ltr !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        resize: none !important;
      }

      .timetable-table .timetable-cell-content.colored-cell {
        grid-template-columns: minmax(0, 1fr) !important;
      }

      body.cahier-tab-active .timetable-table .timetable-cell-content.colored-cell .span-tools {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        justify-self: stretch !important;
        min-width: 0 !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 1px !important;
        gap: 2px !important;
        transform: none !important;
      }

      body.cahier-tab-active .timetable-table .timetable-cell-content.colored-cell .span-tools button {
        flex: 0 1 16px !important;
        width: 16px !important;
        min-width: 0 !important;
        max-width: 16px !important;
        padding: 0 !important;
        font-size: 10px !important;
      }

      body.cahier-tab-active .timetable-table .timetable-cell-content.colored-cell .room-control {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        justify-self: stretch !important;
        min-width: 0 !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 2px 0 !important;
        gap: 4px !important;
        transform: none !important;
      }

      body.cahier-tab-active .timetable-table .timetable-cell-content.colored-cell .room-control input {
        flex: 0 0 24px !important;
        width: 24px !important;
        min-width: 24px !important;
        max-width: 24px !important;
        margin: 0 !important;
        padding: 0 !important;
        text-align: center !important;
      }

      .homework-date[data-assignment-week-label] {
        position: relative;
        white-space: nowrap !important;
      }

      .homework-date[data-assignment-week-label]::after {
        content: attr(data-assignment-week-label);
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        color: inherit;
        font-family: inherit;
        font-size: var(--last-assignment-label-size, 1em);
        font-weight: inherit;
        line-height: inherit;
        letter-spacing: inherit;
        text-transform: none;
        white-space: nowrap;
      }

      .homework-cover-page .cahier-group-cover-class-chip {
        min-height: 50px !important;
        padding: 10px 14px !important;
        font-size: clamp(20px, 2.8vw, 24px) !important;
        line-height: 1.05 !important;
      }
    `}</style>
    <CoverPage primaryLevelRows={primaryLevelRows} />
    <TabWithFullDates primaryLevelRows={primaryLevelRows} onPrimaryLevelRowsChange={setPrimaryLevelRows} />
  </>;
}
