import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import MoroccoHolidaysPage from './MoroccoHolidaysPage';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const PRIMARY_ARABIC_DAYS = ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const PRIMARY_LEVEL_OPTIONS = [
  'المستوى الأول',
  'المستوى الثاني',
  'المستوى الثالث',
  'المستوى الرابع',
  'المستوى الخامس',
  'المستوى السادس',
];
const getPrimaryHeaderLevelLabel = (level) => {
  if (level === 'المستوى الأول') return 'الأول';
  if (level === 'المستوى الثاني') return 'الثاني';
  if (level === 'المستوى الثالث') return 'الثالث';
  if (level === 'المستوى الرابع') return 'الرابع';
  if (level === 'المستوى الخامس') return 'الخامس';
  if (level === 'المستوى السادس') return 'السادس';
  return level;
};
const createPrimaryLevelRows = () => [PRIMARY_LEVEL_OPTIONS[0], PRIMARY_LEVEL_OPTIONS[1]];
const CALENDAR_DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const HOURS = [
  '09H00 - 09H35', '09H35 - 10H10', '10H10 - 10H45', '10H45 - 11H15',
  '11H30 - 12H05', '12H05 - 12H40', '12H40 - 13H10', '13H10 - 13H40',
  '13H45 - 14H20', '14H20 - 14H55', '14H55 - 15H30', '15H30 - 16H00',
  '16H15 - 16H50', '16H50 - 17H25', '17H25 - 17H55', '17H55 - 18H25'
];
const PRIMARY_TIME_SECTIONS = [
  { start: 0, end: 4, label: '', kind: 'period' },
  { start: 4, end: 8, label: 'فترة الاستراحة 15 د', kind: 'break' },
  { start: 8, end: 12, label: 'ما بين الأفواج 20 د', kind: 'midday' },
  { start: 12, end: 16, label: 'فترة الاستراحة 15 د', kind: 'break' }
];
const getPrimaryTimeSection = (hourIndex) => hourIndex < 4 ? 0 : hourIndex < 8 ? 1 : hourIndex < 12 ? 2 : 3;
// مزامنة اقتراحية فقط: المجموعة الأولى من أربع حصص تقترح نفس المواد
// للمجموعة التي تلي الاستراحة، من دون تغيير أي خانة سبق تعديلها يدويا.
const getFollowingPairedSection = (sectionIndex) => sectionIndex === 0 ? 1 : sectionIndex === 2 ? 3 : -1;
const CELL_COLORS = ['#fff3bf', '#d8f3dc', '#dbeafe', '#ffe4e6', '#ede9fe', '#cffafe', '#fef3c7', '#dcfce7', '#e0e7ff', '#fce7f3', '#ccfbf1', '#f5f5f4', '#fbcfe8', '#bfdbfe', '#bbf7d0', '#fed7aa', '#ddd6fe', '#bae6fd', '#fecdd3', '#ccfbf1'];
const TIMETABLE_SUBJECTS = [
  'الرياضيات',
  'الاستماع والحديث',
  'القراءة',
  'الكتابة',
  'التربية الإسلامية',
  'التربية البدنية',
  'النشاط العلمي',
  'التربية الفنية',
  'الأمازيغية',
  'التواصل الشفهي',
  'الصرف والتحويل',
  'التراكيب',
  'الإملاء',
  'الشكل والتطبيقات',
  'الجغرافيا',
  'التاريخ',
  'الدعم / أنشطة الحياة المدرسية',
  'مشروع الوحدة',
  'التربية المدنية',
  'التعبير الكتابي',
  'Activités orales',
  'Activités de lecture',
  'Graphisme/ Écriture',
  'Comptine/ chant',
  'Poésie',
  'Projet de classe',
];
const TIMETABLE_SUBJECT_ALIASES = new Map([
  ['رياضيات', 'الرياضيات'],
  ['الاستماع و الحديث', 'الاستماع والحديث'],
  ['تربية إسلامية', 'التربية الإسلامية'],
  ['تربية بدنية', 'التربية البدنية'],
  ['نشاط علمي', 'النشاط العلمي'],
  ['تربية فنية', 'التربية الفنية'],
  ['أمازيغية', 'الأمازيغية'],
  ['صرف و تحويل', 'الصرف والتحويل'],
  ['صرف وتحويل', 'الصرف والتحويل'],
  ['تراكيب', 'التراكيب'],
  ['املاء', 'الإملاء'],
  ['إملاء', 'الإملاء'],
  ['شكل و تطبيقات', 'الشكل والتطبيقات'],
  ['شكل وتطبيقات', 'الشكل والتطبيقات'],
  ['جغرافيا', 'الجغرافيا'],
  ['الدعم /أنشطة الحياة المدرسية', 'الدعم / أنشطة الحياة المدرسية'],
  ['تربية مدنية', 'التربية المدنية'],
  ['تعبير كتابي', 'التعبير الكتابي'],
]);
const normalizeTimetableSubject = (subject) => {
  const cleanSubject = String(subject ?? '').trim();
  return TIMETABLE_SUBJECT_ALIASES.get(cleanSubject) ?? cleanSubject;
};
const FRENCH_TIMETABLE_SUBJECTS = new Set([
  'Activités orales',
  'Activités de lecture',
  'Graphisme/ Écriture',
  'Comptine/ chant',
  'Poésie',
  'Projet de classe',
]);
const getSubjectSequenceLabel = (subject, sequence) => {
  const cleanSubject = String(subject || '').trim();
  if (!cleanSubject || !sequence) return '';
  const prefix = FRENCH_TIMETABLE_SUBJECTS.has(cleanSubject) ? `S${sequence}` : `ح${sequence}`;
  return `(${prefix})`;
};
const getHomeworkSubjectDisplay = (subject) => String(subject || '').trim() === 'Projet de classe'
  ? 'Projet de\nclasse'
  : String(subject || '').trim();
const getHomeworkSubjectSizeClass = (subject) => {
  const compactLength = getHomeworkSubjectDisplay(subject).replace(/\s+/g, '').length;
  if (compactLength >= 22) return 'cahier-session-subject-long';
  if (compactLength >= 16) return 'cahier-session-subject-medium';
  return '';
};
const formatSubjectSequence = (subject, sequence) => {
  const cleanSubject = String(subject || '').trim();
  if (!cleanSubject || !sequence) return cleanSubject;
  return `${getSubjectSequenceLabel(cleanSubject, sequence)} ${cleanSubject}`;
};
// Une couleur propre à chacun des six jours : le samedi ne reprend plus le vert du lundi.
const HOMEWORK_COLORS = ['#66c43f', '#b34bd7', '#2f80ed', '#ff3f5f', '#f2994a', '#14b8a6'];
const NOTEBOOK_COLOR = '#e0f2fe';
const DOT_TEXT = Array.from({ length: 3 }, () => '.'.repeat(74)).join('\n');
const MANDATORY_EVENTS = [
  { start: '05/09', end: '06/09', label: 'Religieuse', text: 'Vacance religieuse : Aïd Al Mawlid Annabaoui', type: 'holiday' },
  { start: '19/10', end: '26/10', label: 'Scolaire', text: 'Vacance scolaire : Vacances intermédiaires 1', type: 'holiday' },
  { start: '31/10', end: '31/10', label: 'Nationale', text: 'Fête nationale : Fête de l’Unité', type: 'holiday' },
  { start: '06/11', end: '06/11', label: 'Nationale', text: 'Fête nationale : Marche Verte', type: 'holiday' },
  { start: '18/11', end: '18/11', label: 'Nationale', text: 'Fête nationale : Fête de l’Indépendance', type: 'holiday' },
  { start: '07/12', end: '14/12', label: 'Scolaire', text: 'Vacance scolaire : Vacances intermédiaires 2', type: 'holiday' },
  { start: '01/01', end: '01/01', label: 'Nationale', text: 'Fête nationale : Nouvel An', type: 'holiday' },
  { start: '11/01', end: '11/01', label: 'Nationale', text: 'Fête nationale : Manifeste de l’Indépendance', type: 'holiday' },
  { start: '14/01', end: '14/01', label: 'Nationale', text: 'Fête nationale : Nouvel An Amazigh', type: 'holiday' },
  { start: '25/01', end: '01/02', label: 'Scolaire', text: 'Vacance scolaire : Vacances de mi-année', type: 'holiday' },
  { start: '15/03', end: '22/03', label: 'Scolaire', text: 'Vacance scolaire : Vacances intermédiaires 3', type: 'holiday' },
  { start: '20/03', end: '22/03', label: 'Religieuse', text: 'Vacance religieuse : Aïd Al-Fitr', type: 'holiday' },
  { start: '01/05', end: '01/05', label: 'Nationale', text: 'Fête nationale : Fête du Travail', type: 'holiday' },
  { start: '03/05', end: '10/05', label: 'Scolaire', text: 'Vacance scolaire : Vacances intermédiaires 4', type: 'holiday' },
  { start: '27/05', end: '30/05', label: 'Religieuse', text: 'Vacance religieuse : Aïd Al-Adha', type: 'holiday' },
  { start: '16/06', end: '16/06', label: 'Religieuse', text: 'Vacance religieuse : 1er Moharram', type: 'holiday' },
  { start: '20/01', end: '24/01', label: 'Primaire', text: 'Examen : Examen normalisé local', type: 'exam' },
  { start: '23/06', end: '24/06', label: 'Primaire', text: 'Examen : Examen normalisé provincial', type: 'exam' },
  { start: '10/07', end: '10/07', label: 'Primaire', text: 'Signature du Procès-verbal de sortie', type: 'exam' },
];
const EXAM_EVENTS = [
  { start: '20/01', end: '24/01', label: 'Primaire', text: 'Examen : Examen normalisé local' },
  { start: '29/05', end: '30/05', label: 'Lycée', text: 'Examen : Examen régional 1ère Bac' },
  { start: '01/06', end: '04/06', label: 'Lycée', text: 'Examen : Examen national 2ème Bac' },
  { start: '16/06', end: '17/06', label: 'Collège', text: 'Examen : Examen régional' },
  { start: '23/06', end: '24/06', label: 'Primaire', text: 'Examen : Examen normalisé provincial' },
  { start: '03/07', end: '04/07', label: 'Lycée', text: 'Rattrapage : 1ère Bac' },
  { start: '06/07', end: '09/07', label: 'Lycée', text: 'Rattrapage : 2ème Bac' },
  { start: '10/07', end: '10/07', label: 'Lycée', text: 'Signature du Procès-verbal de sortie' }
];
const SCHOOL_PROGRESS_FLAGS = [
  { label: 'العطلة البينية الأولى', eventText: 'Vacances intermédiaires 1' },
  { label: 'العطلة البينية الثانية', eventText: 'Vacances intermédiaires 2' },
  { label: 'عطلة منتصف السنة الدراسية', eventText: 'Vacances de mi-année' },
  { label: 'العطلة البينية الرابعة', eventText: 'Vacances intermédiaires 4' }
];

const snapToFive = (value, fallback = 40, minimum = 5, maximum = 240) => {
  const numericValue = Number(value);
  const safeValue = Number.isFinite(numericValue) ? numericValue : fallback;
  return Math.min(Math.max(Math.round(safeValue / 5) * 5, minimum), maximum);
};
const createCell = (minutes = 30) => ({ text: '', minutes: snapToFive(minutes), span: 1, hidden: false });
const clampMinutes = (value) => snapToFive(value);
const normalizeCell = (cell) => typeof cell === 'object' && cell !== null ? {
  text: normalizeTimetableSubject(cell.text),
  minutes: clampMinutes(cell.minutes ?? 30),
  span: Math.max(Number(cell.span) || 1, 1),
  hidden: Boolean(cell.hidden)
} : { text: normalizeTimetableSubject(cell), minutes: 30, span: 1, hidden: false };
const cloneCell = (cell) => ({ ...normalizeCell(cell), hidden: false });

const dotTextStyle = { color: 'rgba(63, 64, 80, 0.28)', fontSize: '22px', fontWeight: 900, lineHeight: 1.35, letterSpacing: '1px', whiteSpace: 'pre-wrap', overflow: 'hidden' };
const holidayTextStyle = { color: '#9a3412', fontSize: '21px', fontWeight: 900, lineHeight: 1.25, letterSpacing: '0.2px', textAlign: 'center', justifyContent: 'center', background: 'linear-gradient(90deg, rgba(254,215,170,0.38), rgba(254,243,199,0.62))', borderRadius: '12px', margin: '8px 18px', padding: '10px 16px', overflow: 'hidden' };
const examTextStyle = { color: '#1e3a8a', fontSize: '20px', fontWeight: 900, lineHeight: 1.25, letterSpacing: '0.2px', textAlign: 'center', justifyContent: 'center', background: 'linear-gradient(90deg, rgba(191,219,254,0.45), rgba(219,234,254,0.82))', border: '1px solid rgba(37,99,235,0.28)', borderRadius: '12px', margin: '8px 18px', padding: '10px 16px', overflow: 'hidden' };
const subjectTextStyle = { display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'center', gap: '6px', padding: '8px 10px', textAlign: 'center', overflow: 'hidden' };
const sessionLineStyle = { display: 'grid', gridTemplateColumns: '52px 1fr', alignItems: 'center', gap: '6px', minHeight: '24px', padding: '4px 7px', border: '1px solid rgba(63, 64, 80, 0.18)', borderRadius: '8px', background: 'rgba(63, 64, 80, 0.045)', color: '#343545', fontFamily: 'Arial, sans-serif', lineHeight: 1, overflow: 'hidden' };
const sessionHourStyle = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '72px', height: '22px', borderRadius: '999px', background: 'var(--homework-color)', color: 'white', fontSize: '12px', fontWeight: 900, whiteSpace: 'nowrap' };
const sessionClassStyle = { display: 'block', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '14px', fontWeight: 900, textTransform: 'uppercase' };
const getSessionNameFontSize = (name) => String(name || '').trim().length > 17 ? 14 : String(name || '').trim().length > 12 ? 22 : 24;
// Chaque matière dispose toujours de deux lignes de rédaction placées en face.
const getDottedLinesPerSession = () => 2;
const SESSION_BREAK_BOUNDARIES = [
  { beforeStart: 0, beforeEnd: 4, afterStart: 4, afterEnd: 8, label: 'فترة الاستراحة 15 د', kind: 'break' },
  { beforeStart: 4, beforeEnd: 8, afterStart: 8, afterEnd: 12, label: 'ما بين الأفواج 20 د', kind: 'midday' },
  { beforeStart: 8, beforeEnd: 12, afterStart: 12, afterEnd: 16, label: 'فترة الاستراحة 15 د', kind: 'break' }
];
const getSessionBreakMarkers = (sessions, hourList) => SESSION_BREAK_BOUNDARIES.flatMap((boundary) => {
  const beforeIndexes = sessions.map((session, index) => ({ session, index })).filter(({ session }) => session.hourIndex >= boundary.beforeStart && session.hourIndex < boundary.beforeEnd);
  const afterIndexes = sessions.map((session, index) => ({ session, index })).filter(({ session }) => session.hourIndex >= boundary.afterStart && session.hourIndex < boundary.afterEnd);
  if (!beforeIndexes.length || !afterIndexes.length) return [];
  const afterIndex = afterIndexes[0].index;
  const minutes = getClockDuration(
    getHourEnd(hourList[boundary.beforeEnd - 1]),
    getHourStart(hourList[boundary.afterStart])
  );
  const labelPrefix = boundary.kind === 'midday' ? 'ما بين الأفواج' : 'فترة الاستراحة';
  return [{ ...boundary, afterIndex, label: `${labelPrefix} ${minutes} د`, position: (afterIndex / sessions.length) * 100 }];
});
const getSessionGridTemplate = (sessions, markers) => {
  const markerIndexes = new Set(markers.map((marker) => marker.afterIndex));
  return sessions.flatMap((session, sessionIndex) => [
    'minmax(0, 1fr)',
    markerIndexes.has(sessionIndex + 1) ? '28px' : null
  ]).filter(Boolean).join(' ');
};
const getSessionGridRow = (sessionIndex, markers) => sessionIndex + 1
  + markers.filter((marker) => marker.afterIndex <= sessionIndex).length;
const getBreakGridRow = (marker, markers) => marker.afterIndex + 1
  + markers.filter((candidate) => candidate.afterIndex < marker.afterIndex).length;
const formatHomeworkDateRtl = (value) => String(value || '').replace(
  /\b(\d{2})\/(\d{2})(?:\/(\d{4}))?\b/g,
  (_, day, month, explicitYear) => {
    const startYear = getSchoolStartYear();
    const year = explicitYear || (Number(month) >= 9 ? startYear : startYear + 1);
    // L'isolation LTR conserve strictement l'ordre AAAA/MM/JJ dans le texte RTL.
    return `\u2066${year}/${month}/${day}\u2069`;
  }
);
const getHomeworkDayPeriod = (entry) => {
  const firstHourIndex = (entry.sessions || [])
    .map((session) => session.hourIndex)
    .filter(Number.isFinite)
    .sort((first, second) => first - second)[0];
  if (!Number.isFinite(firstHourIndex)) return '';
  return firstHourIndex >= 8 ? 'مساءً' : 'صباحاً';
};
const examListWrapStyle = { marginTop: '85px', border: 0, borderRadius: 0, overflow: 'visible', background: 'transparent' };
const examListTableStyle = { width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px', fontFamily: 'Arial, sans-serif', background: 'transparent' };
const examListHeaderCellStyle = { padding: '12px 14px', border: 0, background: '#111827', color: 'white', fontSize: '13px', fontWeight: 900, textAlign: 'left', textTransform: 'uppercase' };
const examListCellStyle = { padding: '14px', borderTop: '1px solid rgba(17,17,17,0.08)', borderBottom: '1px solid rgba(17,17,17,0.08)', background: 'white', color: '#111827', fontSize: '14px', fontWeight: 800, textAlign: 'left', lineHeight: 1.2 };
const groupHomeworkHeaderStyle = { position: 'absolute', top: '30px', left: '-110px', right: 'auto', width: '80%', height: '42px', display: 'grid', gridTemplateColumns: '230px 1fr', alignItems: 'center', gap: '18px', borderRadius: '12px', background: 'var(--group-color)', color: '#111827', padding: '0 18px', boxSizing: 'border-box', boxShadow: '0 2px 6px rgba(17, 17, 17, 0.12)' };
const groupHomeworkTitleStyle = { fontSize: '20px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.4px', textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
const groupCoverPageStyle = { position: 'relative', display: 'block', padding: 0, background: 'linear-gradient(180deg, var(--group-color), #ffffff 78%)', borderLeft: '14px solid var(--group-color)', overflow: 'hidden', textAlign: 'center' };
const groupCoverBrandStyle = { position: 'absolute', top: '92px', left: '50%', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateX(-50%)', fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap' };
const groupCoverBrandMainStyle = { position: 'relative', color: '#1565c0', fontSize: '42px', fontWeight: 1000, lineHeight: 0.95, letterSpacing: '-1.2px' };
const groupCoverBrandDotStyle = { position: 'absolute', top: '-7px', right: '-14px', width: '11px', height: '11px', borderRadius: '999px', background: '#f47b55' };
const groupCoverBrandSubStyle = { marginTop: '5px', color: '#f47b55', fontSize: '16px', fontWeight: 1000, lineHeight: 1, letterSpacing: '1.8px' };
const groupCoverIconsStyle = { position: 'absolute', top: '180px', left: '50%', zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', transform: 'translateX(-50%)' };
const groupCoverTitleStyle = { position: 'absolute', top: '50%', left: '50%', zIndex: 2, width: 'calc(100% - 116px)', maxWidth: '680px', margin: 0, padding: '34px 20px', borderRadius: '28px', transform: 'translate(-50%, -50%)', background: 'var(--group-color)', color: '#111827', fontSize: '60px', fontWeight: 900, lineHeight: 1.05, textTransform: 'uppercase', boxShadow: '0 18px 35px rgba(17, 24, 39, 0.16)' };
const progressWrapStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 46px',
  alignItems: 'center',
  gap: '10px',
  width: '120%',
  marginLeft: '-20%',
  boxSizing: 'border-box'
};
const progressBarStyle = { position: 'relative', height: '12px', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.85)', border: '1px solid rgba(17, 24, 39, 0.12)', boxShadow: 'inset 0 1px 3px rgba(17, 24, 39, 0.10)' };
const progressFillStyle = { position: 'absolute', top: 0, left: 0, bottom: 0, borderRadius: '999px', background: 'linear-gradient(90deg, #22c55e, #16a34a)' };
const progressFlagStyle = { position: 'absolute', top: '-15px', transform: 'translateX(-50%)', fontSize: '13px', lineHeight: 1, filter: 'drop-shadow(0 1px 1px rgba(17, 24, 39, 0.25))' };
const progressPercentStyle = { fontSize: '12px', fontWeight: 900, textAlign: 'right', color: '#111827' };

const EducationIcon = ({ kind, color }) => <span aria-hidden="true" style={{ width: '48px', height: '48px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '15px', background: 'rgba(255,255,255,0.82)', border: `2px solid ${color}`, color: '#1e3a8a', boxShadow: '0 6px 14px rgba(17,24,39,0.11)' }}>
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {kind === 'book' && <>
      <path d="M3.5 5.5c3 0 5.2.8 8.5 3v11c-3.3-2.2-5.5-3-8.5-3z" />
      <path d="M20.5 5.5c-3 0-5.2.8-8.5 3v11c3.3-2.2 5.5-3 8.5-3z" />
    </>}
    {kind === 'pencil' && <>
      <path d="m4 20 4.1-1.1L19 8l-3-3L5.1 15.9z" />
      <path d="m13.8 7.2 3 3" />
      <path d="m4.8 16.2 3 3" />
    </>}
    {kind === 'cap' && <>
      <path d="m3 9 9-5 9 5-9 5z" />
      <path d="M7 12.3v4.2c3 2.2 7 2.2 10 0v-4.2" />
      <path d="M21 9v6" />
    </>}
  </svg>
</span>;

const fitTimetableClassText = (textarea) => {
  if (!textarea) return;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const computedStyle = window.getComputedStyle(textarea);
  const availableWidth = Math.max(textarea.clientWidth - 8, 1);
  const availableHeight = Math.max(textarea.clientHeight - 4, 1);
  // Les cellules sont volontairement compactes : partir d'une taille modérée
  // évite que les matières sur deux lignes touchent les métadonnées du bas.
  let fontSize = 14.5;
  const getVisualLineCount = () => {
    context.font = `${computedStyle.fontWeight} ${fontSize}px ${computedStyle.fontFamily}`;
    return String(textarea.value || '').split('\n').reduce((count, line) => (
      count + Math.max(1, Math.ceil(context.measureText(line || ' ').width / availableWidth))
    ), 0);
  };

  while (fontSize > 8 && (getVisualLineCount() * fontSize * 1.05) > availableHeight) {
    fontSize -= 0.5;
  }

  textarea.style.setProperty('--timetable-class-font-size', `${fontSize}px`);
  textarea.style.setProperty('padding-top', '2px', 'important');
  textarea.style.setProperty('padding-bottom', '0', 'important');
  textarea.scrollLeft = 0;
  textarea.scrollTop = 0;
};

const fitLastAssignmentLabel = (element) => {
  if (!element) return;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const style = window.getComputedStyle(element);
  const dateFontSize = Number.parseFloat(style.fontSize) || 24;
  const dateText = String(element.textContent || '').trim();
  context.font = `${style.fontWeight} ${dateFontSize}px ${style.fontFamily}`;
  const remainingWidth = Math.max(element.clientWidth - context.measureText(dateText).width - 22, 1);
  const assignmentLabel = element.dataset.assignmentWeekLabel || '';
  let labelFontSize = dateFontSize;

  while (labelFontSize > 5) {
    context.font = `${style.fontWeight} ${labelFontSize}px ${style.fontFamily}`;
    if (context.measureText(assignmentLabel).width <= remainingWidth) break;
    labelFontSize -= 0.5;
  }

  element.style.setProperty('--last-assignment-label-size', `${labelFontSize}px`);
};

const TimetableClassInput = memo(function TimetableClassInput({ span, value, sequence, placeholder, style, ...props }) {
  const inputRef = useRef(null);

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return undefined;

    fitTimetableClassText(input);
    const observer = new ResizeObserver(() => fitTimetableClassText(input));
    observer.observe(input);

    return () => observer.disconnect();
  }, [span, value]);

  const isFrenchSubject = FRENCH_TIMETABLE_SUBJECTS.has(value);
  return <select ref={inputRef} value={value} style={{ ...style, direction: isFrenchSubject ? 'ltr' : 'rtl' }} {...props}>
    <option value="">{placeholder || 'اختر المادة'}</option>
    {TIMETABLE_SUBJECTS.map((subject) => <option value={subject} key={subject}>{subject}</option>)}
  </select>;
}, (previous, next) => previous.span === next.span
  && previous.value === next.value
  && previous.sequence === next.sequence
  && previous.placeholder === next.placeholder
  && previous.style === next.style
  && previous['aria-label'] === next['aria-label']);

const getCellColor = (text) => {
  const normalized = String(text ?? '').toLowerCase().replace(/[\s-]/g, '').trim();
  if (!normalized) return 'white';
  let hash = 2166136261;
  for (let index = 0; index < normalized.length; index += 1) {
    hash ^= normalized.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return CELL_COLORS[Math.abs(hash) % CELL_COLORS.length];
};

const SCHOOL_START_YEAR = 2026;
const getSchoolStartYear = () => SCHOOL_START_YEAR;
const getSchoolYear = () => {
  const startYear = getSchoolStartYear();
  return `Année scolaire : ${startYear} / ${startYear + 1}`;
};
const getMonthDateAsSchoolDate = (monthDate) => {
  const [day, month] = String(monthDate).split('/').map(Number);
  const year = month >= 9 ? SCHOOL_START_YEAR : SCHOOL_START_YEAR + 1;
  return new Date(Date.UTC(year, month - 1, day));
};
// Modèle unique de progression du cahier. Aucun script externe ne vient le
// recalculer après le rendu : la page du 01/09 vaut 0 %, celle du 10/07 vaut
// 100 %, et toutes les pages intermédiaires sont réparties régulièrement.
const createHomeworkProgress = (pages) => {
  const findPage = (predicate) => pages.findIndex((entries) => entries.some(predicate));
  const foundStart = findPage((entry) => entry.progressDate === '01/09');
  const foundEnd = findPage((entry) => entry.progressDate === '31/10');
  const startIndex = foundStart >= 0 ? foundStart : 0;
  const endIndex = foundEnd >= startIndex ? foundEnd : Math.max(pages.length - 1, startIndex);
  const pageDistance = Math.max(endIndex - startIndex, 1);
  const exactPercentAt = (pageIndex) => Math.min(100, Math.max(0, ((pageIndex - startIndex) / pageDistance) * 100));

  const flags = SCHOOL_PROGRESS_FLAGS.map((flag) => {
    const vacationPage = findPage((entry) => String(entry.text || '').includes(flag.eventText));
    return { ...flag, percent: exactPercentAt(vacationPage >= 0 ? vacationPage : startIndex) };
  });

  return {
    exactPercentAt,
    integerPercentAt: (pageIndex) => Math.floor(exactPercentAt(pageIndex)),
    flags
  };
};
const getHourStart = (hour) => String(hour ?? '').split('-')[0].trim();
const getHourEnd = (hour) => String(hour ?? '').split('-')[1]?.trim() || getHourStart(hour);
const formatDisplayedClock = (value) => String(value ?? '').trim().replace(/H/i, ':');
const parseClockMinutes = (value) => {
  const match = String(value ?? '').trim().match(/^(\d{1,2})\s*(?:H|:)\s*(\d{2})$/i);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
};
const formatClockMinutes = (value) => {
  const normalized = ((Number(value) % (24 * 60)) + (24 * 60)) % (24 * 60);
  return `${String(Math.floor(normalized / 60)).padStart(2, '0')}:${String(normalized % 60).padStart(2, '0')}`;
};
const normalizeClockToFive = (value, fallback) => {
  const parsed = parseClockMinutes(value);
  const fallbackMinutes = parseClockMinutes(fallback) ?? 0;
  return formatClockMinutes(snapToFive(parsed, fallbackMinutes, 0, (24 * 60) - 5));
};
const getClockDuration = (startValue, endValue) => {
  const start = parseClockMinutes(startValue);
  const end = parseClockMinutes(endValue);
  if (start == null || end == null) return 0;
  return Math.max(end - start, 0);
};
const StepTimeInput = ({ value, onCommit, onKeyDown, ...props }) => {
  const getDisplayValue = (clockValue) => normalizeClockToFive(clockValue, clockValue);
  const [draft, setDraft] = useState(() => getDisplayValue(value));
  useEffect(() => setDraft(getDisplayValue(value)), [value]);
  const commit = (rawValue) => {
    const normalized = normalizeClockToFive(rawValue, value);
    const acceptedValue = onCommit(normalized);
    setDraft(getDisplayValue(acceptedValue ?? normalized));
  };
  const shift = (delta) => {
    const current = parseClockMinutes(draft) ?? parseClockMinutes(value) ?? 0;
    commit(formatClockMinutes(current + delta));
  };
  return <span className="primary-step-time-control">
    <button type="button" className="no-print" onMouseDown={(event) => event.preventDefault()} onClick={() => shift(-5)} aria-label="Diminuer de 5 minutes">−</button>
    <input {...props} type="text" inputMode="numeric" value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={(event) => commit(event.target.value)} onKeyDown={(event) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      shift(event.key === 'ArrowUp' ? 5 : -5);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      event.currentTarget.blur();
      return;
    }
    onKeyDown?.(event);
    }} />
    <button type="button" className="no-print" onMouseDown={(event) => event.preventDefault()} onClick={() => shift(5)} aria-label="Augmenter de 5 minutes">+</button>
  </span>;
};
const FiveMinuteNumberInput = ({ value, onCommit, onKeyDown, ...props }) => {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const commit = (rawValue) => {
    const normalized = snapToFive(rawValue, value);
    setDraft(normalized);
    onCommit(normalized);
  };
  return <input {...props} type="number" min="5" max="240" step="5" value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={(event) => commit(event.target.value)} onKeyDown={(event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.currentTarget.blur();
      return;
    }
    onKeyDown?.(event);
  }} />;
};
const getSectionMinuteAllocation = (hourList, sectionIndex) => {
  const section = PRIMARY_TIME_SECTIONS[sectionIndex];
  const slotCount = section.end - section.start;
  const start = parseClockMinutes(getHourStart(hourList[section.start]));
  let end = parseClockMinutes(getHourEnd(hourList[section.end - 1]));
  if (start == null || end == null || slotCount <= 0) return Array(slotCount).fill(40);
  if (end <= start) end += 24 * 60;
  const total = snapToFive(Math.max(end - start, slotCount * 5), 40, slotCount * 5, 24 * 60);
  const totalUnits = total / 5;
  const baseUnits = Math.floor(totalUnits / slotCount);
  const remainderUnits = totalUnits % slotCount;
  return Array.from({ length: slotCount }, (_, index) => (baseUnits + (index < remainderUnits ? 1 : 0)) * 5);
};
const getAllocatedCellMinutes = (hourList, hourIndex, span = 1) => {
  const sectionIndex = getPrimaryTimeSection(hourIndex);
  const section = PRIMARY_TIME_SECTIONS[sectionIndex];
  const allocation = getSectionMinuteAllocation(hourList, sectionIndex);
  const offset = hourIndex - section.start;
  return allocation.slice(offset, offset + Math.max(Number(span) || 1, 1)).reduce((sum, minutes) => sum + minutes, 0);
};
const getSectionTotalMinutes = (hourList, sectionIndex) => getSectionMinuteAllocation(hourList, sectionIndex).reduce((sum, minutes) => sum + minutes, 0);
const capSectionMinutes = (cells, hourList, sectionIndex, preferredHour = '') => {
  const section = PRIMARY_TIME_SECTIONS[sectionIndex];
  const sectionTotal = getSectionTotalMinutes(hourList, sectionIndex);
  const anchors = hourList.slice(section.start, section.end)
    .map((hour) => ({ hour, cell: normalizeCell(cells[hour]) }))
    .filter(({ cell }) => !cell.hidden && cell.text.trim());
  // Avant que les quatre matières soient remplies, aucune égalisation n'est
  // imposée. Dès que les quatre le sont, leur somme doit rester exactement
  // égale à la durée de la période bleue.
  if (anchors.length < 4) return cells;

  let difference = sectionTotal - anchors.reduce((sum, anchor) => sum + anchor.cell.minutes, 0);
  if (difference === 0) return cells;

  const nextCells = { ...cells };
  const preferred = anchors.find((anchor) => anchor.hour === preferredHour);
  // On conserve autant que possible la valeur que l'utilisateur vient de
  // modifier et on équilibre d'abord les autres séances.
  const adjustmentOrder = [
    ...anchors.slice().reverse().filter((anchor) => anchor !== preferred),
    preferred
  ].filter(Boolean);

  adjustmentOrder.forEach(({ hour }) => {
    if (difference === 0) return;
    const cell = normalizeCell(nextCells[hour]);
    if (difference > 0) {
      nextCells[hour] = { ...cell, minutes: cell.minutes + difference };
      difference = 0;
      return;
    }
    const reducible = Math.max(cell.minutes - 5, 0);
    const reduction = Math.min(reducible, -difference);
    nextCells[hour] = { ...cell, minutes: cell.minutes - reduction };
    difference += reduction;
  });
  return nextCells;
};
const groupConsecutiveSessionLevels = (sessions) => sessions.reduce((groups, session, sessionIndex) => {
  const section = Number.isFinite(session.hourIndex) ? getPrimaryTimeSection(session.hourIndex) : -1;
  const lastGroup = groups[groups.length - 1];
  if (lastGroup?.level === session.level && lastGroup?.section === section) {
    lastGroup.count += 1;
    lastGroup.endIndex = sessionIndex;
  } else {
    groups.push({ level: session.level, section, count: 1, startIndex: sessionIndex, endIndex: sessionIndex });
  }
  return groups;
}, []);
const getLevelRailLabel = (level, sessionCount) => {
  const cleanLevel = String(level || '').trim();
  if (sessionCount > 1 || !cleanLevel) return cleanLevel;
  return cleanLevel.split(/\s+/).at(-1) || cleanLevel;
};
const createRows = () => DAYS.map((day) => ({
  day,
  cells: HOURS.reduce((acc, hour, hourIndex) => ({ ...acc, [hour]: createCell(getAllocatedCellMinutes(HOURS, hourIndex, 1)) }), {})
}));
const getMondayBasedDayIndex = (date) => (date.getDay() + 6) % 7;
const getDisplayDay = (date, rows) => getMondayBasedDayIndex(date) < rows.length ? String(rows[getMondayBasedDayIndex(date)]?.day || DAYS[getMondayBasedDayIndex(date)]).toUpperCase() : CALENDAR_DAYS[date.getDay()].toUpperCase();
const formatMonthDate = (date) => `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
const getSchoolHomeworkDates = () => {
  const startYear = getSchoolStartYear();
  const dates = [];
  const current = new Date(startYear, 8, 1);
  const end = new Date(startYear, 9, 31);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};
const makeEmptyHomeworkEntry = (date, rows) => {
  const dayIndex = getMondayBasedDayIndex(date);
  const monthDate = formatMonthDate(date);
  return {
    date: `${getDisplayDay(date, rows)} ${monthDate}/${date.getFullYear()}`,
    sessions: [],
    text: DOT_TEXT,
    isHoliday: false,
    isExam: false,
    isHalfWeekPlaceholder: true,
    progressDate: monthDate,
    color: HOMEWORK_COLORS[dayIndex % HOMEWORK_COLORS.length]
  };
};
// Une journée complète par feuille. Les vacances et les événements suivent la
// même règle afin qu'aucune seconde journée ne puisse partager leur page.
const buildOneDayPages = (entries) => entries.map((entry) => [entry]);
const getMandatoryEventStart = (monthDate) => {
  const events = MANDATORY_EVENTS.filter((event) => event.start === monthDate);
  const priorityExam = events.find((event) => event.type === 'exam');
  return priorityExam ? [priorityExam] : events;
};
const isInsideMandatoryEventAfterStart = (monthDate) => MANDATORY_EVENTS.some((event) => {
  const date = getMonthDateAsSchoolDate(monthDate);
  return date > getMonthDateAsSchoolDate(event.start) && date <= getMonthDateAsSchoolDate(event.end);
});
export default function Tab({ primaryLevelRows: controlledPrimaryLevelRows, onPrimaryLevelRowsChange }) {
  const [school, setSchool] = useState('Établissement :');
  const [teacher, setTeacher] = useState('Professeur :');
  const [hours, setHours] = useState(HOURS);
  const [primaryDayLabels, setPrimaryDayLabels] = useState(PRIMARY_ARABIC_DAYS);
  const [internalPrimaryLevelRows, setInternalPrimaryLevelRows] = useState(createPrimaryLevelRows);
  const primaryLevelRows = controlledPrimaryLevelRows ?? internalPrimaryLevelRows;
  const setPrimaryLevelRows = onPrimaryLevelRowsChange ?? setInternalPrimaryLevelRows;
  const [primarySectionLevels, setPrimarySectionLevels] = useState(() => (
    PRIMARY_TIME_SECTIONS.map(() => DAYS.map(() => ''))
  ));
  const [rows, setRows] = useState(createRows);
  const [generatedData, setGeneratedData] = useState(null);
  const [copiedCell, setCopiedCell] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [draggedCell, setDraggedCell] = useState(null);
  const [dragOverCell, setDragOverCell] = useState(null);
  const schoolYear = getSchoolYear();

  const generatePages = () => {
    setGeneratedData(JSON.parse(JSON.stringify({ rows, hours, primarySectionLevels })));
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => window.dispatchEvent(new Event('cahier-pages-generated')));
    });
  };

  const invalidateGeneratedPages = () => setGeneratedData(null);

  const validateOnEnter = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.currentTarget.blur();
    }
  };

  const rebuildPrimarySection = (section, startValue, endValue) => {
    const sectionIndex = PRIMARY_TIME_SECTIONS.indexOf(section);
    const slotCount = section.end - section.start;
    const start = parseClockMinutes(startValue);
    let end = parseClockMinutes(endValue);
    if (sectionIndex < 0 || start == null || end == null || slotCount <= 0) return;
    if (end <= start) end += 24 * 60;
    const total = snapToFive(end - start, slotCount * 5, slotCount * 5, 24 * 60);
    const totalUnits = total / 5;
    const baseUnits = Math.floor(totalUnits / slotCount);
    const remainderUnits = totalUnits % slotCount;
    const allocations = Array.from({ length: slotCount }, (_, index) => (baseUnits + (index < remainderUnits ? 1 : 0)) * 5);
    invalidateGeneratedPages();
    let cursor = start;
    const nextSectionHours = allocations.map((minutes) => {
      const next = `${formatClockMinutes(cursor)} - ${formatClockMinutes(cursor + minutes)}`;
      cursor += minutes;
      return next;
    });
    const previousSectionHours = hours.slice(section.start, section.end);
    setHours((current) => current.map((hour, index) => (
      index >= section.start && index < section.end ? nextSectionHours[index - section.start] : hour
    )));
    setRows((current) => current.map((row) => {
      const savedCells = previousSectionHours.map((hour) => normalizeCell(row.cells[hour]));
      const nextCells = { ...row.cells };
      previousSectionHours.forEach((hour) => delete nextCells[hour]);
      nextSectionHours.forEach((hour, index) => { nextCells[hour] = savedCells[index]; });
      return { ...row, cells: nextCells };
    }));
  };
  const updatePrimarySectionStart = (section, value) => {
    const sectionIndex = PRIMARY_TIME_SECTIONS.indexOf(section);
    const proposedStart = parseClockMinutes(value);
    const sectionEnd = parseClockMinutes(getHourEnd(hours[section.end - 1]));
    if (sectionIndex < 0 || proposedStart == null || sectionEnd == null) return getHourStart(hours[section.start]);
    const minimumStart = sectionIndex > 0
      ? parseClockMinutes(getHourEnd(hours[PRIMARY_TIME_SECTIONS[sectionIndex - 1].end - 1]))
      : 0;
    const maximumStart = sectionEnd - ((section.end - section.start) * 5);
    const currentStart = parseClockMinutes(getHourStart(hours[section.start])) ?? proposedStart;
    const lowerBound = minimumStart ?? 0;
    const boundedStart = lowerBound <= maximumStart
      ? Math.min(Math.max(proposedStart, lowerBound), maximumStart)
      : currentStart;
    const acceptedStart = formatClockMinutes(boundedStart);
    rebuildPrimarySection(section, acceptedStart, getHourEnd(hours[section.end - 1]));
    return acceptedStart;
  };
  const updatePrimarySectionEnd = (section, value) => {
    const sectionIndex = PRIMARY_TIME_SECTIONS.indexOf(section);
    const proposedEnd = parseClockMinutes(value);
    const sectionStart = parseClockMinutes(getHourStart(hours[section.start]));
    if (sectionIndex < 0 || proposedEnd == null || sectionStart == null) return getHourEnd(hours[section.end - 1]);
    const nextSection = PRIMARY_TIME_SECTIONS[sectionIndex + 1];
    const maximumEnd = nextSection
      ? parseClockMinutes(getHourStart(hours[nextSection.start]))
      : (24 * 60) - 5;
    const minimumEnd = sectionStart + ((section.end - section.start) * 5);
    const currentEnd = parseClockMinutes(getHourEnd(hours[section.end - 1])) ?? proposedEnd;
    const upperBound = maximumEnd ?? proposedEnd;
    const boundedEnd = minimumEnd <= upperBound
      ? Math.min(Math.max(proposedEnd, minimumEnd), upperBound)
      : currentEnd;
    const acceptedEnd = formatClockMinutes(boundedEnd);
    rebuildPrimarySection(section, getHourStart(hours[section.start]), acceptedEnd);
    return acceptedEnd;
  };
  const getPrimaryBoundaryMinutes = (sectionIndex) => {
    if (sectionIndex <= 0) return 0;
    const previousSection = PRIMARY_TIME_SECTIONS[sectionIndex - 1];
    const currentSection = PRIMARY_TIME_SECTIONS[sectionIndex];
    return getClockDuration(
      getHourEnd(hours[previousSection.end - 1]),
      getHourStart(hours[currentSection.start])
    );
  };
  const updatePrimaryBoundaryMinutes = (sectionIndex, value) => {
    if (sectionIndex <= 0) return;
    const previousSection = PRIMARY_TIME_SECTIONS[sectionIndex - 1];
    const currentSection = PRIMARY_TIME_SECTIONS[sectionIndex];
    const previousEnd = parseClockMinutes(getHourEnd(hours[previousSection.end - 1]));
    if (previousEnd == null) return;
    updatePrimarySectionStart(currentSection, formatClockMinutes(previousEnd + snapToFive(value, getPrimaryBoundaryMinutes(sectionIndex))));
  };
  const updateDay = (index, value) => {
    invalidateGeneratedPages();
    setPrimaryDayLabels((current) => current.map((day, i) => i === index ? value : day));
  };
  const updatePrimaryLevel = (levelRowIndex, value) => {
    invalidateGeneratedPages();
    setPrimaryLevelRows((current) => current.map((level, rowIndex) => rowIndex === levelRowIndex ? value : level));
  };
  const updatePrimarySectionLevel = (sectionIndex, dayIndex, value) => {
    invalidateGeneratedPages();
    const pairedSectionIndex = getFollowingPairedSection(sectionIndex);
    const otherLevel = primaryLevelRows.find((level) => level && level !== value) || '';
    setPrimarySectionLevels((current) => current.map((sectionLevels, index) => {
      if (index === sectionIndex) {
        return sectionLevels.map((level, currentDayIndex) => currentDayIndex === dayIndex ? value : level);
      }
      if (value && otherLevel && index === pairedSectionIndex && !current[index]?.[dayIndex]) {
        return sectionLevels.map((level, currentDayIndex) => currentDayIndex === dayIndex ? otherLevel : level);
      }
      return sectionLevels;
    }));
  };
  useEffect(() => {
    const availableLevels = [...new Set(primaryLevelRows.filter(Boolean))];
    setPrimarySectionLevels((current) => PRIMARY_TIME_SECTIONS.map((section, sectionIndex) => (
      DAYS.map((day, dayIndex) => {
        const selectedLevel = current[sectionIndex]?.[dayIndex] || '';
        return !selectedLevel || availableLevels.includes(selectedLevel) ? selectedLevel : '';
      })
    )));
  }, [primaryLevelRows]);
  const updateCellText = (dayIndex, hour, value) => {
    invalidateGeneratedPages();
    const hourIndex = hours.indexOf(hour);
    const sectionIndex = getPrimaryTimeSection(hourIndex);
    setRows((current) => current.map((row, i) => {
      if (i !== dayIndex) return row;
      const cell = normalizeCell(row.cells[hour]);
      // Toute nouvelle matière commence à 30 minutes, puis reste modifiable
      // par pas de cinq minutes dans la limite de la période bleue.
      const minutes = !cell.text.trim() && value.trim() ? 30 : cell.minutes;
      let nextCells = { ...row.cells, [hour]: { ...cell, text: value, minutes } };
      nextCells = capSectionMinutes(nextCells, hours, sectionIndex, hour);

      // نسخ المادة لأول مرة إلى الخانة المناظرة بعد الاستراحة
      // (0→4، 1→5، 8→12...) مع إبقاء النسخة قابلة للتعديل بعد ذلك.
      const pairedSectionIndex = getFollowingPairedSection(sectionIndex);
      const pairedHourIndex = pairedSectionIndex >= 0 ? hourIndex + 4 : -1;
      const pairedHour = pairedHourIndex >= 0 ? hours[pairedHourIndex] : null;
      if (value.trim() && pairedHour) {
        const pairedCell = normalizeCell(nextCells[pairedHour]);
        if (!pairedCell.hidden && !pairedCell.text.trim()) {
          nextCells = {
            ...nextCells,
            [pairedHour]: { ...pairedCell, text: value, minutes: 30 }
          };
          nextCells = capSectionMinutes(nextCells, hours, pairedSectionIndex, pairedHour);
        }
      }

      return { ...row, cells: nextCells };
    }));
  };
  const updateMinutes = (dayIndex, hour, value) => {
    invalidateGeneratedPages();
    const hourIndex = hours.indexOf(hour);
    const sectionIndex = getPrimaryTimeSection(hourIndex);
    setRows((current) => current.map((row, i) => {
      if (i !== dayIndex) return row;
      const edited = normalizeCell(row.cells[hour]);
      if (edited.hidden || !edited.text.trim()) return row;
      const nextCells = { ...row.cells, [hour]: { ...edited, minutes: clampMinutes(value) } };
      return { ...row, cells: capSectionMinutes(nextCells, hours, sectionIndex, hour) };
    }));
  };

  useEffect(() => {
    setRows((current) => current.map((row) => {
      const nextCells = { ...row.cells };
      hours.forEach((hour, hourIndex) => {
        const cell = normalizeCell(nextCells[hour]);
        if (!cell.hidden) nextCells[hour] = { ...cell, minutes: getAllocatedCellMinutes(hours, hourIndex, cell.span) };
      });
      return { ...row, cells: nextCells };
    }));
  }, [hours]);

  const subjectSequenceByCell = new Map();
  const subjectOccurrenceCounts = new Map();
  rows.forEach((row, dayIndex) => {
    hours.forEach((hour, hourIndex) => {
      const cell = normalizeCell(row.cells[hour]);
      const subject = cell.text.trim();
      if (cell.hidden || !subject) return;
      // La progression d'une matière est propre à chaque niveau. Ainsi,
      // الرياضيات peut être en ح2 au niveau 1 tout en commençant à ح1 au niveau 2.
      const level = primarySectionLevels[getPrimaryTimeSection(hourIndex)]?.[dayIndex]
        || '';
      const occurrenceKey = JSON.stringify([level, subject]);
      const nextOccurrence = (subjectOccurrenceCounts.get(occurrenceKey) || 0) + 1;
      subjectOccurrenceCounts.set(occurrenceKey, nextOccurrence);
      subjectSequenceByCell.set(`${dayIndex}-${hourIndex}`, nextOccurrence);
    });
  });

  const generatedRows = generatedData?.rows ?? [];
  const generatedHours = generatedData?.hours ?? [];
  const generatedPrimarySectionLevels = generatedData?.primarySectionLevels ?? [];
  const generatedSubjectSequenceByCell = new Map();
  const generatedSubjectOccurrenceCounts = new Map();
  generatedRows.forEach((row, dayIndex) => {
    generatedHours.forEach((hour, hourIndex) => {
      const cell = normalizeCell(row.cells[hour]);
      const subject = cell.text.trim();
      if (cell.hidden || !subject) return;
      const level = generatedPrimarySectionLevels[getPrimaryTimeSection(hourIndex)]?.[dayIndex] || '';
      const occurrenceKey = JSON.stringify([level, subject]);
      const nextOccurrence = (generatedSubjectOccurrenceCounts.get(occurrenceKey) || 0) + 1;
      generatedSubjectOccurrenceCounts.set(occurrenceKey, nextOccurrence);
      generatedSubjectSequenceByCell.set(`${dayIndex}-${hourIndex}`, nextOccurrence);
    });
  });

  const sessionsByDay = generatedRows.map((row, dayIndex) => {
    // Sur les fiches, l'heure de chaque matière dépend de la durée réelle de
    // la matière précédente. Chaque période repart de sa propre heure de
    // début afin que les récréations et l'intervalle entre groupes restent
    // exactement à leur place.
    // La première séance de chaque période reprend exactement l'heure inscrite
    // dans la colonne bleue. Les matières suivantes de la même période sont
    // ensuite calculées en cumulant leurs durées réelles.
    const sectionCursors = PRIMARY_TIME_SECTIONS.map((section) => (
      parseClockMinutes(getHourStart(generatedHours[section.start]))
    ));

    return generatedHours.reduce((list, hour, hourIndex) => {
      const cell = normalizeCell(row.cells[hour]);
      const subject = cell.text.trim();
      if (!cell.hidden && subject) {
        const sectionIndex = getPrimaryTimeSection(hourIndex);
        const fallbackStart = parseClockMinutes(getHourStart(hour)) ?? 0;
        const startMinutes = sectionCursors[sectionIndex] ?? fallbackStart;
        const sequence = generatedSubjectSequenceByCell.get(`${dayIndex}-${hourIndex}`);
        list.push({
          hour: formatDisplayedClock(formatClockMinutes(startMinutes)),
          hourIndex,
          level: generatedPrimarySectionLevels[sectionIndex]?.[dayIndex] || '',
          className: formatSubjectSequence(subject, sequence),
          subjectName: subject,
          sequenceLabel: getSubjectSequenceLabel(subject, sequence),
          sequencePrefix: FRENCH_TIMETABLE_SUBJECTS.has(subject) ? 'S' : 'ح',
          sequenceNumber: sequence,
          duration: `${cell.minutes} د`
        });
        sectionCursors[sectionIndex] = startMinutes + cell.minutes;
      }
      return list;
    }, []);
  });

  const homeworkEntries = generatedData ? getSchoolHomeworkDates().flatMap((date) => {
    const dayIndex = getMondayBasedDayIndex(date);
    const monthDate = formatMonthDate(date);
    const sessions = dayIndex < generatedRows.length ? (sessionsByDay[dayIndex] ?? []) : [];
    // Le 05/09 est à la fois le premier samedi scolaire et le début du Mawlid.
    // Lorsqu'un emploi du samedi existe, la journée d'enseignement doit gagner :
    // elle ne doit pas être remplacée ensuite par la fiche de vacances.
    const isFirstTeachingSaturday = monthDate === '05/09' && dayIndex === 5 && sessions.length > 0;

    const eventEntries = (isFirstTeachingSaturday ? [] : getMandatoryEventStart(monthDate)).map((event, eventIndex) => {
      const endDate = getMonthDateAsSchoolDate(event.end);
      const displayDate = event.start === event.end ? `${getDisplayDay(date, generatedRows)} ${event.start}` : `${getDisplayDay(date, generatedRows)} ${event.start} - ${getDisplayDay(endDate, generatedRows)} ${event.end}`;
      return { date: displayDate, sessions: [{ hour: event.label, className: '', duration: '' }], text: event.text, isHoliday: event.type === 'holiday', isExam: event.type === 'exam', isMidYearHoliday: event.text.includes('Vacances de mi-année'), progressDate: event.start, color: event.type === 'exam' ? '#38bdf8' : '#f97316', eventKey: `${event.start}-${eventIndex}` };
    });

    if (eventEntries.length) return eventEntries;
    if (isInsideMandatoryEventAfterStart(monthDate)) return [];
    if (dayIndex >= generatedRows.length) return [];
    if (!sessions.length) return [makeEmptyHomeworkEntry(date, generatedRows)];
    return [{ date: `${getDisplayDay(date, generatedRows)} ${monthDate}`, sessions, text: DOT_TEXT, isHoliday: false, isExam: false, progressDate: monthDate, color: HOMEWORK_COLORS[dayIndex % HOMEWORK_COLORS.length] }];
  }).filter(Boolean) : [];
  const homeworkPages = buildOneDayPages(homeworkEntries);
  const homeworkProgress = createHomeworkProgress(homeworkPages);

  const findFirstTeachingEntry = (pages, startDay, endDay, month) => pages
    .flat()
    .reduce((target, entry) => {
      if (entry.isHoliday || entry.isExam || entry.isHalfWeekPlaceholder) return target;
      const [day, entryMonth] = String(entry.progressDate || '').split('/').map(Number);
      if (entryMonth !== month || day < startDay || day > endDay) return target;
      if (!target || day < target.day) return { day, entry };
      return target;
    }, null)?.entry;

  const assignmentWeekLabels = new Map();
  const firstSemesterTarget = findFirstTeachingEntry(homeworkPages, 4, 9, 1);
  if (firstSemesterTarget) assignmentWeekLabels.set(firstSemesterTarget, '"Sem.Du Dernier.Devoir.S1"');
  const secondSemesterTarget = findFirstTeachingEntry(homeworkPages, 14, 19, 6);
  if (secondSemesterTarget) assignmentWeekLabels.set(secondSemesterTarget, '"Sem.Du Dernier.Devoir.S2"');

  useLayoutEffect(() => {
    const elements = [...document.querySelectorAll('.homework-date[data-assignment-week-label]')];
    if (!elements.length) return undefined;

    let frame = 0;
    const scheduleFit = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => elements.forEach(fitLastAssignmentLabel));
    };
    const resizeObserver = new ResizeObserver(scheduleFit);
    const mutationObserver = new MutationObserver(scheduleFit);
    elements.forEach((element) => {
      resizeObserver.observe(element);
      mutationObserver.observe(element, { childList: true, characterData: true, subtree: true });
    });
    scheduleFit();

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [generatedData]);

  const canExtendLeft = (row, hourIndex) => hourIndex > 0 && getPrimaryTimeSection(hourIndex - 1) === getPrimaryTimeSection(hourIndex) && Boolean(normalizeCell(row.cells[hours[hourIndex]]).text.trim()) && !normalizeCell(row.cells[hours[hourIndex - 1]]).hidden && !normalizeCell(row.cells[hours[hourIndex - 1]]).text.trim();
  const canExtendRight = (row, hourIndex) => {
    const cell = normalizeCell(row.cells[hours[hourIndex]]);
    const nextIndex = hourIndex + cell.span;
    return Boolean(cell.text.trim()) && nextIndex < hours.length && getPrimaryTimeSection(hourIndex) === getPrimaryTimeSection(nextIndex) && !normalizeCell(row.cells[hours[nextIndex]]).hidden && !normalizeCell(row.cells[hours[nextIndex]]).text.trim();
  };
  const canPasteCell = (row, hourIndex, cellToPaste) => {
    const sourceCell = normalizeCell(cellToPaste);
    if (!sourceCell.text.trim() || hourIndex + sourceCell.span > hours.length || getPrimaryTimeSection(hourIndex) !== getPrimaryTimeSection(hourIndex + sourceCell.span - 1)) return false;
    for (let index = hourIndex; index < hourIndex + sourceCell.span; index += 1) {
      const target = normalizeCell(row.cells[hours[index]]);
      if (target.hidden || target.text.trim()) return false;
    }
    return true;
  };

  const duplicateCellTo = (dayIndex, hourIndex, cellToPaste) => {
    setRows((current) => current.map((row, i) => {
      if (i !== dayIndex || !canPasteCell(row, hourIndex, cellToPaste)) return row;
      const pasted = { ...cloneCell(cellToPaste), minutes: getAllocatedCellMinutes(hours, hourIndex, normalizeCell(cellToPaste).span) };
      const nextCells = { ...row.cells, [hours[hourIndex]]: pasted };
      for (let index = hourIndex + 1; index < hourIndex + pasted.span; index += 1) nextCells[hours[index]] = { ...createCell(), hidden: true };
      return { ...row, cells: nextCells };
    }));
    setCopiedCell(cloneCell(cellToPaste));
    setSelectedCell(`${dayIndex}-${hourIndex}`);
  };

  const handleCellClick = (dayIndex, hourIndex, cell) => {
    const normalized = normalizeCell(cell);
    if (!normalized.text.trim()) return;
    setCopiedCell(cloneCell(normalized));
    setSelectedCell(`${dayIndex}-${hourIndex}`);
  };
  const handleDragStart = (event, dayIndex, hourIndex, cell) => {
    const normalized = normalizeCell(cell);
    if (!normalized.text.trim()) return event.preventDefault();
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('text/plain', normalized.text);
    setDraggedCell(cloneCell(normalized));
    setCopiedCell(cloneCell(normalized));
    setSelectedCell(`${dayIndex}-${hourIndex}`);
  };
  const handleDragOver = (event, dayIndex, hourIndex, row, hasClass) => {
    if (!draggedCell || hasClass || !canPasteCell(row, hourIndex, draggedCell)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setDragOverCell(`${dayIndex}-${hourIndex}`);
  };
  const handleDrop = (event, dayIndex, hourIndex, row, hasClass) => {
    if (!draggedCell || hasClass || !canPasteCell(row, hourIndex, draggedCell)) return;
    event.preventDefault();
    duplicateCellTo(dayIndex, hourIndex, draggedCell);
    setDraggedCell(null);
    setDragOverCell(null);
  };

  const extendCellLeft = (dayIndex, hourIndex) => {
    if (hourIndex <= 0) return;
    setRows((current) => current.map((row, i) => {
      if (i !== dayIndex || !canExtendLeft(row, hourIndex)) return row;
      const cell = normalizeCell(row.cells[hours[hourIndex]]);
      const nextSpan = cell.span + 1;
      return { ...row, cells: { ...row.cells, [hours[hourIndex - 1]]: { ...cell, span: nextSpan, minutes: getAllocatedCellMinutes(hours, hourIndex - 1, nextSpan), hidden: false }, [hours[hourIndex]]: { ...createCell(), hidden: true } } };
    }));
  };
  const extendCellRight = (dayIndex, hourIndex) => setRows((current) => current.map((row, i) => {
    if (i !== dayIndex || !canExtendRight(row, hourIndex)) return row;
    const cell = normalizeCell(row.cells[hours[hourIndex]]);
    const nextSpan = cell.span + 1;
    return { ...row, cells: { ...row.cells, [hours[hourIndex]]: { ...cell, span: nextSpan, minutes: getAllocatedCellMinutes(hours, hourIndex, nextSpan), hidden: false }, [hours[hourIndex + cell.span]]: { ...createCell(), hidden: true } } };
  }));
  const shrinkCellLeft = (dayIndex, hourIndex) => setRows((current) => current.map((row, i) => {
    if (i !== dayIndex) return row;
    const cell = normalizeCell(row.cells[hours[hourIndex]]);
    if (cell.span <= 1 || hourIndex + 1 >= hours.length) return row;
    const nextSpan = cell.span - 1;
    return { ...row, cells: { ...row.cells, [hours[hourIndex]]: createCell(getAllocatedCellMinutes(hours, hourIndex, 1)), [hours[hourIndex + 1]]: { ...cell, span: nextSpan, minutes: getAllocatedCellMinutes(hours, hourIndex + 1, nextSpan), hidden: false } } };
  }));
  const shrinkCellRight = (dayIndex, hourIndex) => setRows((current) => current.map((row, i) => {
    if (i !== dayIndex) return row;
    const cell = normalizeCell(row.cells[hours[hourIndex]]);
    if (cell.span <= 1) return row;
    const nextSpan = cell.span - 1;
    return { ...row, cells: { ...row.cells, [hours[hourIndex]]: { ...cell, span: nextSpan, minutes: getAllocatedCellMinutes(hours, hourIndex, nextSpan), hidden: false }, [hours[hourIndex + cell.span - 1]]: createCell(getAllocatedCellMinutes(hours, hourIndex + cell.span - 1, 1)) } };
  }));
  const deleteCell = (dayIndex, hourIndex) => {
    setRows((current) => current.map((row, i) => {
      if (i !== dayIndex) return row;
      const cell = normalizeCell(row.cells[hours[hourIndex]]);
      const nextCells = { ...row.cells, [hours[hourIndex]]: createCell() };
      for (let index = hourIndex + 1; index < hourIndex + cell.span && index < hours.length; index += 1) nextCells[hours[index]] = createCell();
      return { ...row, cells: nextCells };
    }));
    setCopiedCell(null);
    setSelectedCell(null);
  };

  return <main className="cahier-shell clean-cahier-shell">
    <section className="cahier-preview-zone">
      <div className="a4-page cahier-page primary-timetable-page">
        <header className="cahier-header">
          <input value={school} onChange={(e) => setSchool(e.target.value)} onKeyDown={validateOnEnter} />
          <h2>استعمال الزمن الأسبوعي</h2>
          <input value={teacher} onChange={(e) => setTeacher(e.target.value)} onKeyDown={validateOnEnter} />
          <input value={schoolYear} readOnly aria-label="Année scolaire automatique" />
        </header>
        <div className="primary-timetable-layout">
          <aside className="primary-period-side-column" aria-label="الفترات الدراسية">
            <div className="primary-period-side-spacer" aria-hidden="true" />
            <div className="primary-period-side-label primary-period-side-morning">الفترة الصباحية</div>
            <div className="primary-period-side-label primary-period-side-afternoon">الفترة المسائية</div>
          </aside>
          <table className="primary-timetable-table" aria-label="استعمال الزمن قابل للتعديل">
          <colgroup>
            <col className="primary-fixed-time-column" />
            {rows.map((row, dayIndex) => <col className="primary-fixed-day-column" key={`primary-column-${dayIndex}`} />)}
          </colgroup>
          <thead>
            <tr>
              <th className="primary-time-heading">الأيام</th>
              {primaryDayLabels.map((day, dayIndex) => <th key={`primary-day-${dayIndex}`}><textarea value={day} onChange={(e) => updateDay(dayIndex, e.target.value)} onKeyDown={validateOnEnter} rows="1" aria-label={`اليوم ${dayIndex + 1}`} dir="rtl" /></th>)}
            </tr>
            {primaryLevelRows.map((level, levelRowIndex) => <tr className="primary-sequence-row primary-level-row" key={`primary-level-row-${levelRowIndex}`}>
              <th>
                <select className="primary-level-select" value={level} onChange={(event) => updatePrimaryLevel(levelRowIndex, event.target.value)} aria-label={`اختيار المستوى ${levelRowIndex + 1}`} dir="rtl">
                  {PRIMARY_LEVEL_OPTIONS.map((option) => <option value={option} key={option}>{getPrimaryHeaderLevelLabel(option)}</option>)}
                </select>
              </th>
              {rows.map((row, dayIndex) => <th className="primary-sequence-number" key={`primary-sequence-${levelRowIndex}-${dayIndex}`}>{dayIndex + 1}</th>)}
            </tr>)}
          </thead>
          {PRIMARY_TIME_SECTIONS.map((section, sectionIndex) => <tbody className="primary-time-section" key={`primary-section-${sectionIndex}`}>
            {section.label && <tr className={`primary-marker-row primary-marker-${section.kind}`}><td colSpan={rows.length + 1}>
              <div className="primary-marker-duration-control">
                <span>{section.kind === 'midday' ? 'ما بين الأفواج' : 'فترة الاستراحة'}</span>
                <strong className="primary-marker-duration-value">{getPrimaryBoundaryMinutes(sectionIndex)}</strong>
                <span>د</span>
              </div>
            </td></tr>}
            {hours.slice(section.start, section.end).map((hour, offset) => {
              const hourIndex = section.start + offset;
              return <tr className={`primary-time-row ${offset === 0 ? 'primary-section-first-row' : ''}`} key={`primary-hour-${hourIndex}`}>
                {offset === 0 && <th className="primary-time-cell primary-period-time-cell" rowSpan={section.end - section.start}>
                  <div className="primary-period-time-range">
                    <StepTimeInput value={getHourStart(hours[section.start])} onCommit={(value) => updatePrimarySectionStart(section, value)} aria-label={`بداية الفترة ${sectionIndex + 1}`} />
                    <span aria-hidden="true">↓</span>
                    <strong className="primary-period-duration">{getClockDuration(getHourStart(hours[section.start]), getHourEnd(hours[section.end - 1]))} د</strong>
                    <StepTimeInput value={getHourEnd(hours[section.end - 1])} onCommit={(value) => updatePrimarySectionEnd(section, value)} aria-label={`نهاية الفترة ${sectionIndex + 1}`} />
                  </div>
                </th>}
                {rows.map((row, dayIndex) => {
                  const cell = normalizeCell(row.cells[hour]);
                  if (cell.hidden) return null;
                  const hasClass = Boolean(cell.text.trim());
                  const cellKey = `${dayIndex}-${hourIndex}`;
                  const subjectSequence = subjectSequenceByCell.get(cellKey);
                  const canDropHere = !hasClass && draggedCell && canPasteCell(row, hourIndex, draggedCell);
                  const hostsSectionLevel = offset === 0;
                  const sectionHasClass = hours.slice(section.start, section.end).some((sectionHour) => {
                    const sectionCell = normalizeCell(row.cells[sectionHour]);
                    return !sectionCell.hidden && Boolean(sectionCell.text.trim());
                  });
                  const selectedSectionLevel = primarySectionLevels[sectionIndex]?.[dayIndex] || '';
                  const selectedSectionLevelTone = PRIMARY_LEVEL_OPTIONS.indexOf(selectedSectionLevel) + 1;
                  return <td className={hostsSectionLevel ? 'primary-section-first-cell' : undefined} key={`primary-cell-${dayIndex}-${hourIndex}`} rowSpan={cell.span} data-day-index={dayIndex} data-hour-index={hourIndex}>
                    {hostsSectionLevel && <select className={`primary-section-level-select ${sectionHasClass ? '' : 'primary-section-level-empty'}`} data-level-tone={selectedSectionLevelTone || 0} value={selectedSectionLevel} onChange={(event) => updatePrimarySectionLevel(sectionIndex, dayIndex, event.target.value)} aria-label={`مستوى ${primaryDayLabels[dayIndex]} للفترة ${sectionIndex + 1}`} dir="rtl">
                      <option value="">-</option>
                      {[...new Set(primaryLevelRows.filter(Boolean))].map((level) => <option value={level} key={`${sectionIndex}-${dayIndex}-${level}`}>{level}</option>)}
                    </select>}
                    <div className={`timetable-cell-content ${hasClass ? 'colored-cell draggable-cell clickable-cell' : ''} ${selectedCell === cellKey ? 'selected-cell' : ''} ${canDropHere || dragOverCell === cellKey ? 'drop-ready-cell' : ''}`} style={hasClass ? { '--cell-color': getCellColor(cell.text) } : undefined} draggable={hasClass} onDragStart={(e) => handleDragStart(e, dayIndex, hourIndex, cell)} onDragEnd={() => { setDraggedCell(null); setDragOverCell(null); }} onDragOver={(e) => handleDragOver(e, dayIndex, hourIndex, row, hasClass)} onDragLeave={() => setDragOverCell(null)} onDrop={(e) => handleDrop(e, dayIndex, hourIndex, row, hasClass)} onClick={hasClass ? () => handleCellClick(dayIndex, hourIndex, cell) : undefined} title={hasClass ? 'Cliquer pour sélectionner ou glisser pour dupliquer' : draggedCell ? 'Déposer ici pour dupliquer' : ''}>
                    {hasClass && <div className="span-tools no-print" onClick={(e) => e.stopPropagation()}><button type="button" onClick={() => extendCellLeft(dayIndex, hourIndex)} disabled={!canExtendLeft(row, hourIndex)} title="Étendre vers le haut">↑</button><button type="button" className={`span-remove-button ${cell.span <= 1 ? 'span-tool-placeholder' : ''}`} onClick={() => shrinkCellLeft(dayIndex, hourIndex)} disabled={cell.span <= 1} title="Réduire depuis le haut">⇣</button><button type="button" className="cell-delete-button" onClick={() => deleteCell(dayIndex, hourIndex)} title="Supprimer la cellule">×</button><button type="button" className={`span-remove-button ${cell.span <= 1 ? 'span-tool-placeholder' : ''}`} onClick={() => shrinkCellRight(dayIndex, hourIndex)} disabled={cell.span <= 1} title="Réduire depuis le bas">⇡</button><button type="button" onClick={() => extendCellRight(dayIndex, hourIndex)} disabled={!canExtendRight(row, hourIndex)} title="Étendre vers le bas">↓</button></div>}
                    <TimetableClassInput className="timetable-class-input timetable-subject-select" span={cell.span} value={cell.text} sequence={subjectSequence} onChange={(e) => updateCellText(dayIndex, hour, e.target.value)} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onDragStart={(e) => e.preventDefault()} onKeyDown={(e) => e.stopPropagation()} placeholder="اختر المادة" aria-label={`المادة ${primaryDayLabels[dayIndex]} ${hour}`} />
                    {hasClass && <label className="room-control session-minutes-control" onClick={(e) => e.stopPropagation()}>
                      <span className="session-minutes-value"><FiveMinuteNumberInput value={cell.minutes} onCommit={(value) => updateMinutes(dayIndex, hour, value)} aria-label={`مدة الحصة ${primaryDayLabels[dayIndex]} ${hour}`} /><span>د</span></span>
                      <span className="session-sequence-label">{getSubjectSequenceLabel(cell.text, subjectSequence)}</span>
                    </label>}
                  </div></td>;
                })}
              </tr>;
            })}
          </tbody>)}
          </table>
        </div>
        <table className="timetable-table timetable-compatibility-source" aria-hidden="true">
          <thead><tr><th>Jour</th>{hours.map((hour, index) => <th key={`compat-hour-${index}`}><textarea value={hour} readOnly rows="2" tabIndex="-1" /></th>)}</tr></thead>
          <tbody>{rows.map((row, dayIndex) => <tr key={`compat-day-${dayIndex}`}>
            <td className="hour-cell day-cell"><textarea value={row.day} readOnly rows="2" tabIndex="-1" /></td>
            {hours.map((hour, hourIndex) => {
              const cell = normalizeCell(row.cells[hour]);
              if (cell.hidden) return null;
              const sequence = subjectSequenceByCell.get(`${dayIndex}-${hourIndex}`);
              return <td key={`compat-cell-${dayIndex}-${hourIndex}`} colSpan={cell.span} data-minutes={cell.minutes}><textarea value={formatSubjectSequence(cell.text, sequence)} readOnly tabIndex="-1" placeholder="Classe" /></td>;
            })}
          </tr>)}</tbody>
        </table>
        <footer className="cahier-footer"><span>Signature :</span><span>Observations :</span></footer>
      </div>
      {generatedData && [
        <div className="a4-page cahier-page homework-cover-page" key="homework-cover" style={{ ...groupCoverPageStyle, '--group-color': NOTEBOOK_COLOR }}>
          <div className="cahier-activities-brand" style={groupCoverBrandStyle}>
            <span style={groupCoverBrandMainStyle}>Activités<span style={groupCoverBrandDotStyle} /></span>
            <span style={groupCoverBrandSubStyle}>PÉDAGOGIQUES</span>
          </div>
          <div className="cahier-education-icons" style={groupCoverIconsStyle}>
            <EducationIcon kind="book" color={NOTEBOOK_COLOR} />
            <EducationIcon kind="pencil" color={NOTEBOOK_COLOR} />
            <EducationIcon kind="cap" color={NOTEBOOK_COLOR} />
          </div>
          <h1 className="cahier-group-main-title" style={groupCoverTitleStyle}>الأنشطة التربوية</h1>
        </div>,
        ...homeworkPages.map((pageEntries, pageIndex) => <div className="a4-page cahier-page homework-page cahier-two-entry-page" key={`homework-page-${pageIndex}`} style={{ '--group-color': NOTEBOOK_COLOR, position: 'relative', paddingTop: '60px' }}>
          <div className="cahier-progress-header" style={groupHomeworkHeaderStyle}>
            <div style={groupHomeworkTitleStyle}>التسلسل البيداغوجي</div>
            <div style={progressWrapStyle}>
              <div style={progressBarStyle}>
                <div style={{ ...progressFillStyle, width: `${homeworkProgress.exactPercentAt(pageIndex)}%` }} />
                {homeworkProgress.flags.map((flag) => <span key={flag.label} style={{ ...progressFlagStyle, left: `${flag.percent}%` }} title={flag.label} aria-label={flag.label}>⚑</span>)}
              </div>
              <div style={progressPercentStyle}>{homeworkProgress.integerPercentAt(pageIndex)}%</div>
            </div>
          </div>
          {pageEntries.map((entry) => <section className={`homework-entry ${entry.isExam ? 'cahier-exam-entry' : ''} ${entry.isHoliday ? 'cahier-extra-holiday-entry' : ''} ${entry.isMidYearHoliday ? 'cahier-midyear-holiday-entry' : ''} ${entry.isHalfWeekPlaceholder ? 'cahier-halfweek-placeholder-entry' : ''}`} key={`${entry.date}-${entry.eventKey || entry.text}`} style={{ '--homework-color': entry.isMidYearHoliday ? '#16a34a' : entry.color }}>
            <div className="homework-date" data-assignment-week-label={assignmentWeekLabels.get(entry)} data-day-period={getHomeworkDayPeriod(entry)} contentEditable suppressContentEditableWarning onKeyDown={validateOnEnter}>{formatHomeworkDateRtl(entry.date)}</div>
            {entry.isMidYearHoliday ? <div className="homework-content cahier-midyear-holiday-content">
              <div className="cahier-midyear-school-panel">
                <div className="cahier-midyear-icons">
                  <EducationIcon kind="book" color="#16a34a" />
                  <EducationIcon kind="pencil" color="#16a34a" />
                  <EducationIcon kind="cap" color="#16a34a" />
                </div>
                <div className="cahier-midyear-school-label">Deuxième Semestre</div>
              </div>
              <div className="cahier-midyear-message" contentEditable suppressContentEditableWarning onKeyDown={validateOnEnter}>
                <span>Vacances scolaires</span>
                <strong>Vacances de mi-année</strong>
              </div>
            </div> : <div className={`homework-content ${entry.sessions.length ? 'cahier-sessions-content' : ''}`} style={entry.sessions.length ? { '--session-count': entry.sessions.length, '--session-grid-template': getSessionGridTemplate(entry.sessions, getSessionBreakMarkers(entry.sessions, generatedHours)) } : undefined}>
              <div className={`homework-subject ${entry.sessions.length ? 'cahier-session-list' : ''}`} contentEditable={entry.sessions.length === 0} suppressContentEditableWarning onKeyDown={validateOnEnter} style={entry.sessions.length ? { ...subjectTextStyle, '--session-count': entry.sessions.length } : undefined}>
                {entry.sessions.map((session, sessionIndex) => <div className="cahier-session-row" key={`${entry.date}-${session.hour}-${session.className}`} style={{ ...sessionLineStyle, gridRow: getSessionGridRow(sessionIndex, getSessionBreakMarkers(entry.sessions, generatedHours)) }}><span className="cahier-session-hour" style={sessionHourStyle}>{session.hour}</span><div className="cahier-session-details"><span className="cahier-session-name" style={sessionClassStyle}><span className="cahier-session-sequence" aria-label={session.sequenceLabel}><span className="cahier-session-sequence-number">{session.sequenceNumber}</span></span><span className={`cahier-session-subject ${FRENCH_TIMETABLE_SUBJECTS.has(session.subjectName) ? 'cahier-session-subject-fr' : ''} ${getHomeworkSubjectSizeClass(session.subjectName)}`.trim()}>{getHomeworkSubjectDisplay(session.subjectName)}</span></span><span className="cahier-session-duration">{session.duration ?? '40 د'}</span></div></div>)}
              </div>
              {entry.sessions.length && !entry.isHoliday && !entry.isExam ? <div className="homework-text cahier-session-notes" contentEditable suppressContentEditableWarning onKeyDown={validateOnEnter} style={{ '--session-count': entry.sessions.length }}>{entry.sessions.map((session, sessionIndex) => <div className="cahier-session-note-row" style={{ gridRow: getSessionGridRow(sessionIndex, getSessionBreakMarkers(entry.sessions, generatedHours)) }} key={`${entry.date}-note-${session.hour}-${sessionIndex}`}>{Array.from({ length: getDottedLinesPerSession(entry.sessions.length) }, (_, lineIndex) => <span className="cahier-session-dot-line" key={`${entry.date}-note-line-${sessionIndex}-${lineIndex}`} />)}</div>)}</div> : <div className="homework-text" contentEditable suppressContentEditableWarning onKeyDown={validateOnEnter} style={entry.isHoliday ? holidayTextStyle : entry.isExam ? examTextStyle : dotTextStyle}>{entry.text}</div>}
              {entry.sessions.length && !entry.isHoliday && !entry.isExam && <div className="cahier-session-levels-rail" aria-label="المستويات">{groupConsecutiveSessionLevels(entry.sessions).map((levelGroup, levelGroupIndex) => <span className="cahier-session-level-rail-item" style={{ '--level-session-count': levelGroup.count, gridRow: `${getSessionGridRow(levelGroup.startIndex, getSessionBreakMarkers(entry.sessions, generatedHours))} / ${getSessionGridRow(levelGroup.endIndex, getSessionBreakMarkers(entry.sessions, generatedHours)) + 1}` }} key={`${entry.date}-level-${levelGroup.level}-${levelGroupIndex}`}><span>{getLevelRailLabel(levelGroup.level, levelGroup.count)}</span></span>)}</div>}
              {entry.sessions.length > 1 && !entry.isHoliday && !entry.isExam && <div className="cahier-session-separators" aria-hidden="true">{entry.sessions.slice(1).map((session, separatorIndex) => <span key={`${entry.date}-separator-${session.hour}-${separatorIndex}`} style={{ gridRow: getSessionGridRow(separatorIndex + 1, getSessionBreakMarkers(entry.sessions, generatedHours)) }} />)}</div>}
              {entry.sessions.length > 1 && !entry.isHoliday && !entry.isExam && getSessionBreakMarkers(entry.sessions, generatedHours).length > 0 && <div className="cahier-session-break-markers" aria-label="فترات الاستراحة">{getSessionBreakMarkers(entry.sessions, generatedHours).map((marker, markerIndex, markers) => <span className={`cahier-session-break-marker-${marker.kind}`} key={`${entry.date}-break-${markerIndex}`} style={{ gridRow: getBreakGridRow(marker, markers) }}>{marker.label}</span>)}</div>}
            </div>}
          </section>)}
        </div>)
      ]}
      <div id="cahier-exams-groups-page" className="a4-page cahier-page cahier-exams-groups-page">
        <div className="cahier-exams-groups-main-title">Liste des examens</div>
        <section className="cahier-exams-list" style={examListWrapStyle}>
          <table style={examListTableStyle}>
            <colgroup><col style={{ width: '18%' }} /><col style={{ width: '18%' }} /><col style={{ width: '18%' }} /><col style={{ width: '46%' }} /></colgroup>
            <thead><tr><th style={{ ...examListHeaderCellStyle, borderRadius: '12px 0 0 12px' }}>Cycle</th><th style={examListHeaderCellStyle}>Date de</th><th style={examListHeaderCellStyle}>Date à</th><th style={{ ...examListHeaderCellStyle, borderRadius: '0 12px 12px 0' }}>Examen</th></tr></thead>
            <tbody>{EXAM_EVENTS.map((exam) => <tr key={`${exam.start}-${exam.end}-${exam.text}`}><td style={{ ...examListCellStyle, borderLeft: '1px solid rgba(17,17,17,0.08)', borderRadius: '12px 0 0 12px', fontWeight: 900 }}>{exam.label}</td><td style={examListCellStyle}>{exam.start}</td><td style={examListCellStyle}>{exam.end}</td><td style={{ ...examListCellStyle, borderRight: '1px solid rgba(17,17,17,0.08)', borderRadius: '0 12px 12px 0', fontWeight: 900 }}>{exam.text.replace('Examen : ', '').replace('Rattrapage : ', 'Rattrapage - ')}</td></tr>)}</tbody>
          </table>
        </section>
      </div>
      <MoroccoHolidaysPage />
    </section>
    <button type="button" className="cahier-generate-pages-button no-print" onClick={generatePages}>توليد الصفحات</button>
  </main>;
}
