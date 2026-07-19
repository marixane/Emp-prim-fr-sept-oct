const ARABIC_REPLACEMENTS = [
  ['Les fêtes religieuses sont gardées selon les dates hijri indiquées dans le PDF officiel.', 'يُعتمد في الأعياد الدينية على التواريخ الهجرية المبينة في المقرر الرسمي.'],
  ['Éducation nationale marocaine · Année scolaire', 'التربية الوطنية المغربية · الموسم الدراسي'],
  ['Signature du Procès-verbal de sortie', 'توقيع محضر الخروج'],
  ['Vacance religieuse : Aïd Al Mawlid Annabaoui', 'عطلة دينية: عيد المولد النبوي'],
  ['Vacance scolaire : Vacances intermédiaires 1', 'عطلة مدرسية: العطلة البينية الأولى'],
  ['Vacance scolaire : Vacances intermédiaires 2', 'عطلة مدرسية: العطلة البينية الثانية'],
  ['Vacance scolaire : Vacances intermédiaires 4', 'عطلة مدرسية: العطلة البينية الرابعة'],
  ['Vacance scolaire : Vacances de mi-année', 'عطلة مدرسية: عطلة منتصف السنة الدراسية'],
  ['Fête nationale : Manifeste de l’Indépendance', 'عطلة وطنية: ذكرى تقديم وثيقة الاستقلال'],
  ['Fête nationale : Fête de l’Indépendance', 'عطلة وطنية: عيد الاستقلال'],
  ['Fête nationale : Nouvel An Amazigh', 'عطلة وطنية: رأس السنة الأمازيغية'],
  ['Fête nationale : Fête de l’Unité', 'عطلة وطنية: عيد الوحدة'],
  ['Fête nationale : Marche Verte', 'عطلة وطنية: ذكرى المسيرة الخضراء'],
  ['Fête nationale : Fête du Travail', 'عطلة وطنية: عيد الشغل'],
  ['Fête nationale : Nouvel An', 'عطلة وطنية: رأس السنة الميلادية'],
  ['Examen : Examen normalisé provincial', 'امتحان: الامتحان الموحد الإقليمي'],
  ['Examen : Examen normalisé local', 'امتحان: الامتحان الموحد المحلي'],
  ['Examen : Examen régional', 'امتحان: الامتحان الجهوي'],
  ['Examen régional', 'الامتحان الجهوي'],
  ['Enseignement secondaire collégial', 'التعليم الابتدائي'],
  ['Manifeste de l’Indépendance', 'ذكرى تقديم وثيقة الاستقلال'],
  ['Examen normalisé provincial', 'الامتحان الموحد الإقليمي'],
  ['Examen normalisé local', 'الامتحان الموحد المحلي'],
  ['Examen régional 1ère Bac', 'الامتحان الجهوي للسنة الأولى بكالوريا'],
  ['Examen national 2ème Bac', 'الامتحان الوطني للسنة الثانية بكالوريا'],
  ['Rattrapage - 1ère Bac', 'الدورة الاستدراكية للسنة الأولى بكالوريا'],
  ['Rattrapage - 2ème Bac', 'الدورة الاستدراكية للسنة الثانية بكالوريا'],
  ['Vacances intermédiaires 1', 'العطلة البينية الأولى'],
  ['Vacances intermédiaires 2', 'العطلة البينية الثانية'],
  ['Vacances intermédiaires 4', 'العطلة البينية الرابعة'],
  ['Vacances de mi-année', 'عطلة منتصف السنة الدراسية'],
  ['Fête de l’Indépendance', 'عيد الاستقلال'],
  ['Nouvel An Amazigh', 'رأس السنة الأمازيغية'],
  ['Fête du Travail', 'عيد الشغل'],
  ['Fête de l’Unité', 'عيد الوحدة'],
  ['Marche Verte', 'ذكرى المسيرة الخضراء'],
  ['Nouvel An', 'رأس السنة الميلادية'],
  ['Aïd Al Mawlid Annabaoui', 'عيد المولد النبوي'],
  ['Aïd Al-Fitr', 'عيد الفطر'],
  ['Aïd Al-Adha', 'عيد الأضحى'],
  ['1er Moharram', 'فاتح محرم'],
  ['29 Ramadan - 2 Chawwal 1448', '29 رمضان - 2 شوال 1448'],
  ['09-11 Dhou Al-Hijja 1448', '09-11 ذو الحجة 1448'],
  ['01 Moharram 1449', '01 محرم 1449'],
  ['Sem.Du Dernier.Devoir.S1', 'أسبوع آخر فرض للدورة الأولى'],
  ['Sem.Du Dernier.Devoir.S2', 'أسبوع آخر فرض للدورة الثانية'],
  ['ACTIVITÉS PÉDAGOGIQUES', 'الأنشطة التربوية'],
  ['Activités pédagogiques', 'الأنشطة التربوية'],
  ['PÉDAGOGIQUES', 'التربوية'],
  ['Activités', 'الأنشطة'],
  ['LISTE DES EXAMENS', 'لائحة الامتحانات'],
  ['VACANCES SCOLAIRES', 'العطل المدرسية'],
  ['CAHIER DE TEXTES', 'دفتر النصوص'],
  ['Académie régionale', 'الأكاديمية الجهوية'],
  ['Direction provinciale', 'المديرية الإقليمية'],
  ['Année scolaire', 'الموسم الدراسي'],
  ['Établissement', 'المؤسسة'],
  ['Classes du groupe', 'أقسام المجموعة'],
  ['Aucune classe affectée', 'لا توجد أقسام مسندة'],
  ['Classes', 'الأقسام'],
  ['Matière', 'المادة'],
  ['Nom', 'الاسم'],
  ['CYCLE', 'السلك'],
  ['DATE DE', 'من تاريخ'],
  ['DATE À', 'إلى تاريخ'],
  ['EXAMEN', 'الامتحان'],
  ['VACANCE / FÊTE', 'العطلة / المناسبة'],
  ['DURÉE', 'المدة'],
  ['TYPE', 'النوع'],
  ['DATE', 'التاريخ'],
  ['Primaire', 'ابتدائي'],
  ['Collège', 'إعدادي'],
  ['Lycée', 'ثانوي'],
  ['Scolaire', 'مدرسية'],
  ['Nationale', 'وطنية'],
  ['Religieuse', 'دينية'],
  ['Vacance', 'عطلة'],
  ['N°', 'الرقم'],
  ['8 jours', '8 أيام'],
  ['3 à 4 jours', 'من 3 إلى 4 أيام'],
  ['3 jours', '3 أيام'],
  ['1 jour', 'يوم واحد'],
  ['Télécharger PDF', 'تحميل PDF'],
  ['Aperçu PDF', 'معاينة PDF'],
  ['Deuxième Semestre', 'الدورة الثانية'],
  ['1 AC', 'المستوى الأول'],
  ['2 AC', 'المستوى الثاني'],
  ['3 AC', 'المستوى الثالث'],
  ['Lundi', 'الاثنين'],
  ['Mardi', 'الثلاثاء'],
  ['Mercredi', 'الأربعاء'],
  ['Jeudi', 'الخميس'],
  ['Vendredi', 'الجمعة'],
  ['Samedi', 'السبت'],
  ['Dimanche', 'الأحد'],
];

// La structure de ce projet reste celle du modèle primaire, mais tous les
// textes sont maintenant fournis directement en français par React.
ARABIC_REPLACEMENTS.length = 0;

const replacementRegexes = ARABIC_REPLACEMENTS
  .sort((a, b) => b[0].length - a[0].length)
  .map(([source, target]) => [new RegExp(source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), target]);

function translateText(value) {
  let translated = value;
  for (const [pattern, target] of replacementRegexes) translated = translated.replace(pattern, target);
  return translated;
}

function isExcludedPage(node, excludedPage) {
  if (!excludedPage || node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.TEXT_NODE) return false;
  const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  return element === excludedPage || excludedPage.contains(element);
}

function isProtectedTimetableSubject(node) {
  const element = node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement;
  return Boolean(element?.closest?.('.cahier-session-subject'));
}

function translateTree(root, excludedPage) {
  if (!root || isExcludedPage(root, excludedPage) || isProtectedTimetableSubject(root)) return;

  if (root.nodeType === Node.TEXT_NODE) {
    const next = translateText(root.nodeValue || '');
    if (next !== root.nodeValue) root.nodeValue = next;
    return;
  }

  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return;

  if (root.nodeType === Node.ELEMENT_NODE) {
    for (const attr of ['placeholder', 'title', 'aria-label', 'value']) {
      if (!root.hasAttribute?.(attr)) continue;
      const current = root.getAttribute(attr);
      const next = translateText(current || '');
      if (next !== current) root.setAttribute(attr, next);
    }
  }

  for (const child of root.childNodes) translateTree(child, excludedPage);
}

let applyingArabic = false;

function applyArabicVersion() {
  if (applyingArabic) return;
  applyingArabic = true;
  try {
    const pages = [...document.querySelectorAll('.a4-page')];
    const excludedPage = pages[1] || null;

    pages.forEach((page, index) => {
      const isExcluded = index === 1;
      page.classList.toggle('emp-ar-excluded-page', isExcluded);
      page.classList.toggle('emp-ar-translated-page', !isExcluded);
      if (!isExcluded) {
        page.setAttribute('dir', 'ltr');
        page.setAttribute('lang', 'fr');
      } else {
        page.removeAttribute('dir');
        page.removeAttribute('lang');
      }
    });

    // Le projet français n'a aucun texte à traduire. Les classes de mise en
    // page doivent toutefois être posées sur chaque page générée.
    if (replacementRegexes.length) translateTree(document.body, excludedPage);
  } finally {
    applyingArabic = false;
  }
}

function startArabicVersion() {
  document.documentElement.lang = 'fr';
  document.body.classList.add('emp-primaire-ar');
  applyArabicVersion();
  requestAnimationFrame(() => requestAnimationFrame(applyArabicVersion));
  window.setTimeout(applyArabicVersion, 250);
  window.addEventListener('cahier-pages-generated', applyArabicVersion);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startArabicVersion, { once: true });
else startArabicVersion();
