import { useMemo, useState } from 'react';
import MoroccoHolidaysPage from './MoroccoHolidaysPage';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const CALENDAR_DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const HOURS = ['08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00'];
const CELL_COLORS = ['#fff3bf', '#d8f3dc', '#dbeafe', '#ffe4e6', '#ede9fe', '#cffafe', '#fef3c7', '#dcfce7', '#e0e7ff', '#fce7f3'];
const HOMEWORK_COLORS = ['#66c43f', '#b34bd7', '#2f80ed', '#ff3f5f', '#f2994a'];
const GROUP_COLORS = ['#e0f2fe', '#dcfce7', '#fef3c7', '#fce7f3', '#ede9fe'];
const GROUP_TITLES = ['1 AC', '2 AC', '3 AC', 'Autres', 'Autres'];
const DOT_TEXT = Array.from({ length: 4 }, () => '.'.repeat(74)).join('\n');

const MANDATORY_EVENTS = [
  { start: '05/09', end: '06/09', label: 'Religieuse', text: 'Vacance religieuse : Aïd Al Mawlid Annabaoui', type: 'holiday' },
  { start: '19/10', end: '26/10', label: 'Scolaire', text: 'Vacance scolaire : Vacances intermédiaires 1', type: 'holiday' },
  { start: '06/11', end: '06/11', label: 'Nationale', text: 'Fête nationale : Marche Verte', type: 'holiday' },
  { start: '18/11', end: '18/11', label: 'Nationale', text: 'Fête nationale : Fête de l’Indépendance', type: 'holiday' },
  { start: '07/12', end: '14/12', label: 'Scolaire', text: 'Vacance scolaire : Vacances intermédiaires 2', type: 'holiday' },
  { start: '01/01', end: '01/01', label: 'Nationale', text: 'Fête nationale : Nouvel An', type: 'holiday' },
  { start: '11/01', end: '11/01', label: 'Nationale', text: 'Fête nationale : Manifeste de l’Indépendance', type: 'holiday' },
  { start: '14/01', end: '14/01', label: 'Nationale', text: 'Fête nationale : Nouvel An Amazigh', type: 'holiday' },
  { start: '20/01', end: '24/01', label: 'Primaire', text: 'Examen : Examen normalisé local', type: 'exam' },
  { start: '25/01', end: '01/02', label: 'Scolaire', text: 'Vacance scolaire : Vacances de mi-année', type: 'holiday' },
  { start: '15/03', end: '22/03', label: 'Scolaire', text: 'Vacance scolaire : Vacances intermédiaires 3', type: 'holiday' },
  { start: '20/03', end: '22/03', label: 'Religieuse', text: 'Vacance religieuse : Aïd Al-Fitr', type: 'holiday' },
  { start: '01/05', end: '01/05', label: 'Nationale', text: 'Fête nationale : Fête du Travail', type: 'holiday' },
  { start: '03/05', end: '10/05', label: 'Scolaire', text: 'Vacance scolaire : Vacances intermédiaires 4', type: 'holiday' },
  { start: '27/05', end: '30/05', label: 'Religieuse', text: 'Vacance religieuse : Aïd Al-Adha', type: 'holiday' },
  { start: '28/05', end: '29/05', label: 'Lycée', text: 'Examen : Examen régional 2 AC', type: 'exam' },
  { start: '01/06', end: '03/06', label: 'Lycée', text: 'Examen : Examen national 3 AC', type: 'exam' },
  { start: '16/06', end: '16/06', label: 'Religieuse', text: 'Vacance religieuse : 1er Moharram', type: 'holiday' },
  { start: '23/06', end: '24/06', label: 'Collège', text: 'Examen : Examen régional', type: 'exam' },
  { start: '25/06', end: '26/06', label: 'Primaire', text: 'Examen : Examen normalisé provincial', type: 'exam' },
  { start: '28/06', end: '29/06', label: 'Lycée', text: 'Rattrapage : 2 AC', type: 'exam' },
  { start: '01/07', end: '03/07', label: 'Lycée', text: 'Rattrapage : 3 AC', type: 'exam' },
  { start: '10/07', end: '10/07', label: 'Administration', text: 'Le procès-verbal de sortie', type: 'holiday' }
];

const createRows = () => DAYS.map((day) => ({ day, cells: HOURS.reduce((acc, hour) => ({ ...acc, [hour]: { text: '', room: 1 } }), {}) }));
const normalize = (text) => String(text || '').trim();
const getSchoolStartYear = () => new Date().getMonth() >= 8 ? new Date().getFullYear() : new Date().getFullYear() - 1;
const getSchoolYear = () => { const y = getSchoolStartYear(); return `Année scolaire : ${y} / ${y + 1}`; };
const getHourStart = (hour) => String(hour).split('-')[0].trim();
const getMondayBasedDayIndex = (date) => (date.getDay() + 6) % 7;
const formatMonthDate = (date) => `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
const getDisplayDay = (date, rows) => getMondayBasedDayIndex(date) < rows.length ? String(rows[getMondayBasedDayIndex(date)]?.day || DAYS[getMondayBasedDayIndex(date)]).toUpperCase() : CALENDAR_DAYS[date.getDay()].toUpperCase();
const getMonthDateAsSchoolDate = (monthDate) => { const [d, m] = monthDate.split('/').map(Number); const y = getSchoolStartYear(); return new Date(m >= 9 ? y : y + 1, m - 1, d); };
const getSchoolDates = () => { const y = getSchoolStartYear(); const dates = []; const current = new Date(y, 8, 1); const end = new Date(y, 9, 31); while (current <= end) { dates.push(new Date(current)); current.setDate(current.getDate() + 1); } return dates; };
const getEventStart = (monthDate) => MANDATORY_EVENTS.filter((event) => event.start === monthDate);
const isInsideEventAfterStart = (monthDate) => MANDATORY_EVENTS.some((event) => { const d = getMonthDateAsSchoolDate(monthDate); return d > getMonthDateAsSchoolDate(event.start) && d <= getMonthDateAsSchoolDate(event.end); });
const chunkEntries = (entries, size) => entries.reduce((pages, entry, index) => { if (index % size === 0) pages.push([]); pages[pages.length - 1].push(entry); return pages; }, []);
const getClassLevel = (className) => { const n = String(className).toUpperCase().replace(/[\s-]/g, ''); if (n.startsWith('1AC')) return 0; if (n.startsWith('2AC')) return 1; if (n.startsWith('3AC')) return 2; return 0; };
const getCellColor = (text) => { const n = String(text || '').toLowerCase().replace(/[\s-]/g, ''); if (!n) return 'white'; let h = 2166136261; for (let i = 0; i < n.length; i += 1) { h ^= n.charCodeAt(i); h = Math.imul(h, 16777619); } return CELL_COLORS[Math.abs(h) % CELL_COLORS.length]; };

const dotTextStyle = { color: 'rgba(63, 64, 80, 0.28)', fontSize: '22px', fontWeight: 900, lineHeight: 1.35, letterSpacing: '1px', whiteSpace: 'pre-wrap', overflow: 'hidden' };
const holidayTextStyle = { color: '#9a3412', fontSize: '21px', fontWeight: 900, lineHeight: 1.25, textAlign: 'center', background: 'linear-gradient(90deg, rgba(254,215,170,0.38), rgba(254,243,199,0.62))', borderRadius: '12px', margin: '8px 18px', padding: '10px 16px', overflow: 'hidden' };
const examTextStyle = { color: '#1e3a8a', fontSize: '20px', fontWeight: 900, lineHeight: 1.25, textAlign: 'center', background: 'linear-gradient(90deg, rgba(191,219,254,0.45), rgba(219,234,254,0.82))', borderRadius: '12px', margin: '8px 18px', padding: '10px 16px', overflow: 'hidden' };
const sessionLineStyle = { display: 'grid', gridTemplateColumns: '52px 1fr', alignItems: 'center', gap: '6px', minHeight: '24px', padding: '4px 7px', border: '1px solid rgba(63, 64, 80, 0.18)', borderRadius: '8px', background: 'rgba(63, 64, 80, 0.045)', color: '#343545', fontFamily: 'Arial, sans-serif', lineHeight: 1, overflow: 'hidden' };
const sessionHourStyle = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '72px', height: '22px', borderRadius: '999px', background: 'var(--homework-color)', color: 'white', fontSize: '12px', fontWeight: 900, whiteSpace: 'nowrap' };
const sessionClassStyle = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '14px', fontWeight: 900, textTransform: 'uppercase' };

const buildHomeworkGroups = (rows, hours) => {
  const sessionsByDay = rows.map((row) => hours.reduce((list, hour) => {
    const text = normalize(row.cells[hour]?.text);
    if (text) list.push({ hour: getHourStart(hour), className: text });
    return list;
  }, []));

  const classNames = [];
  sessionsByDay.flat().forEach((session) => { if (!classNames.includes(session.className)) classNames.push(session.className); });
  const groups = GROUP_TITLES.map((title) => ({ title, classes: [] }));
  classNames.forEach((className) => groups[getClassLevel(className)].classes.push(className));

  return groups.map((group, groupIndex) => {
    if (!group.classes.length) return null;
    const classSet = new Set(group.classes);
    const entries = getSchoolDates().flatMap((date) => {
      const dayIndex = getMondayBasedDayIndex(date);
      const monthDate = formatMonthDate(date);
      if (isInsideEventAfterStart(monthDate)) return [];

      const eventEntries = getEventStart(monthDate).map((event, eventIndex) => {
        const endDate = getMonthDateAsSchoolDate(event.end);
        const displayDate = event.start === event.end ? `${getDisplayDay(date, rows)} ${event.start}` : `${getDisplayDay(date, rows)} ${event.start} - ${getDisplayDay(endDate, rows)} ${event.end}`;
        return { date: displayDate, sessions: [{ hour: event.label, className: '' }], text: event.text, isHoliday: event.type === 'holiday', isExam: event.type === 'exam', color: event.type === 'exam' ? '#38bdf8' : '#f97316', eventKey: `${event.start}-${eventIndex}` };
      });
      if (eventEntries.length) return eventEntries;
      if (dayIndex >= rows.length) return [];
      const sessions = (sessionsByDay[dayIndex] || []).filter((session) => classSet.has(session.className));
      if (!sessions.length) return [];
      return [{ date: `${getDisplayDay(date, rows)} ${monthDate}`, sessions, text: DOT_TEXT, isHoliday: false, isExam: false, color: HOMEWORK_COLORS[dayIndex % HOMEWORK_COLORS.length] }];
    });
    return { title: GROUP_TITLES[groupIndex], color: GROUP_COLORS[groupIndex], classes: group.classes, pages: chunkEntries(entries, 5) };
  }).filter(Boolean);
};

export default function TabStable() {
  const [school, setSchool] = useState('Établissement :');
  const [teacher, setTeacher] = useState('Professeur :');
  const [hours, setHours] = useState(HOURS);
  const [rows, setRows] = useState(createRows);
  const [generatedRows, setGeneratedRows] = useState(createRows);
  const [generatedHours, setGeneratedHours] = useState(HOURS);
  const [version, setVersion] = useState(0);
  const schoolYear = getSchoolYear();

  const validateOnEnter = (event) => { if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur(); } };
  const updateCellText = (dayIndex, hour, value) => setRows((current) => current.map((row, index) => index === dayIndex ? { ...row, cells: { ...row.cells, [hour]: { ...row.cells[hour], text: value } } } : row));
  const updateRoom = (dayIndex, hour, value) => setRows((current) => current.map((row, index) => index === dayIndex ? { ...row, cells: { ...row.cells, [hour]: { ...row.cells[hour], room: value } } } : row));
  const generatePages = () => { setGeneratedRows(JSON.parse(JSON.stringify(rows))); setGeneratedHours([...hours]); setVersion((value) => value + 1); };

  const tableClasses = rows.reduce((classes, row) => { hours.forEach((hour) => { const text = normalize(row.cells[hour]?.text); if (text && !classes.includes(text)) classes.push(text); }); return classes; }, []);
  const classGroups = GROUP_TITLES.map((title) => ({ title, classes: [] }));
  tableClasses.forEach((className) => classGroups[getClassLevel(className)].classes.push(className));
  const homeworkGroups = useMemo(() => buildHomeworkGroups(generatedRows, generatedHours), [generatedRows, generatedHours, version]);
  const totalHours = rows.reduce((total, row) => total + hours.reduce((sub, hour) => sub + (normalize(row.cells[hour]?.text) ? 1 : 0), 0), 0);

  return <main className="cahier-shell clean-cahier-shell">
    <section className="cahier-preview-zone">
      <MoroccoHolidaysPage />
      <div className="a4-page cahier-page">
        <header className="cahier-header">
          <input value={school} onChange={(e) => setSchool(e.target.value)} onKeyDown={validateOnEnter} />
          <h2>Cahier de texte</h2>
          <input value={teacher} onChange={(e) => setTeacher(e.target.value)} onKeyDown={validateOnEnter} />
          <input value={schoolYear} readOnly aria-label="Année scolaire automatique" />
        </header>
        <button type="button" className="no-print" onClick={generatePages} style={{ margin: '0 auto 8px', width: '220px', display: 'block', background: '#16a34a' }}>Actualiser les pages</button>
        <div className="total-hours-control"><span>Total heures :</span><strong>{totalHours} h</strong></div>
        <table className="timetable-table">
          <thead><tr><th>Jour</th>{hours.map((hour, index) => <th key={index}><textarea value={hour} onChange={(e) => setHours((current) => current.map((item, i) => i === index ? e.target.value : item))} onKeyDown={validateOnEnter} rows="2" /></th>)}</tr></thead>
          <tbody>{rows.map((row, dayIndex) => <tr key={dayIndex}>
            <td className="hour-cell day-cell"><textarea value={row.day} onChange={(e) => setRows((current) => current.map((item, i) => i === dayIndex ? { ...item, day: e.target.value } : item))} onKeyDown={validateOnEnter} rows="2" /></td>
            {hours.map((hour) => {
              const cell = row.cells[hour] || { text: '', room: 1 };
              const hasClass = Boolean(normalize(cell.text));
              return <td key={hour}><div className={`timetable-cell-content ${hasClass ? 'colored-cell' : ''}`} style={hasClass ? { '--cell-color': getCellColor(cell.text) } : undefined}>
                <textarea value={cell.text} onChange={(e) => updateCellText(dayIndex, hour, e.target.value)} onKeyDown={validateOnEnter} placeholder="Classe" rows="4" />
                {hasClass && <label className="room-control"><span>Salle</span><input type="number" min="1" max="80" value={cell.room} onChange={(e) => updateRoom(dayIndex, hour, e.target.value)} onKeyDown={validateOnEnter} /></label>}
              </div></td>;
            })}
          </tr>)}</tbody>
        </table>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginTop: '10px' }}>
          {classGroups.map((group, index) => <div key={index} style={{ minHeight: '192px', padding: '11px 9px', border: '2px solid rgba(17,17,17,.55)', borderRadius: '14px', background: `linear-gradient(180deg, ${GROUP_COLORS[index]}, white)`, overflow: 'hidden' }}>
            <div style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 900, textAlign: 'center', textTransform: 'uppercase' }}>{group.title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', fontSize: '10px', fontWeight: 800, textAlign: 'center' }}>{group.classes.length ? group.classes.map((className) => <span key={className} style={{ padding: '7px 9px', borderRadius: '9px', border: '1px solid rgba(17,17,17,.22)', background: getCellColor(className), fontSize: '12px', fontWeight: 900 }}>{className}</span>) : 'Déposer ici'}</div>
          </div>)}
        </div>
        <footer className="cahier-footer"><span>Signature :</span><span>Observations :</span></footer>
      </div>
      {homeworkGroups.map((group, groupIndex) => group.pages.map((pageEntries, pageIndex) => <div className="a4-page cahier-page homework-page" key={`${groupIndex}-${pageIndex}`} style={{ '--group-color': group.color, position: 'relative', paddingTop: '60px' }}>
        <div style={{ position: 'absolute', top: '10px', left: '50px', right: '18px', height: '42px', display: 'grid', gridTemplateColumns: '230px 1fr', alignItems: 'center', gap: '18px', borderRadius: '12px', background: 'var(--group-color)', color: '#111827', padding: '0 18px', boxShadow: '0 2px 6px rgba(17,17,17,.12)' }}>
          <div style={{ fontSize: '20px', fontWeight: 900, textTransform: 'uppercase' }}>{group.title}</div>
          <div style={{ fontSize: '12px', fontWeight: 900, textAlign: 'right' }}>Cahier généré</div>
        </div>
        {pageEntries.map((entry) => <section className={`homework-entry ${entry.isExam ? 'cahier-exam-entry' : ''} ${entry.isHoliday ? 'cahier-extra-holiday-entry' : ''}`} key={`${entry.date}-${entry.eventKey || entry.text}`} style={{ '--homework-color': entry.color }}>
          <div className="homework-date" contentEditable suppressContentEditableWarning onKeyDown={validateOnEnter}>{entry.date}</div>
          <div className="homework-content"><div className="homework-subject" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '6px', padding: '8px 10px', textAlign: 'center', overflow: 'hidden' }}>{entry.sessions.map((session) => <div key={`${entry.date}-${session.hour}-${session.className}`} style={sessionLineStyle}><span style={sessionHourStyle}>{session.hour}</span><span style={sessionClassStyle}>{session.className}</span></div>)}</div><div className="homework-text" contentEditable suppressContentEditableWarning onKeyDown={validateOnEnter} style={entry.isHoliday ? holidayTextStyle : entry.isExam ? examTextStyle : dotTextStyle}>{entry.text}</div></div>
        </section>)}
      </div>))}
    </section>
  </main>;
}
