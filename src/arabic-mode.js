window.__examLanguage = window.__examLanguage || localStorage.getItem('examLanguage') || 'fr';

const AR_TRANSLATIONS = [
  [/Réglages\s*:/g, 'الإعدادات :'],
  [/Exporter PDF/g, 'تصدير PDF'],
  [/Lignes/g, 'الأسطر'],
  [/Barème/g, 'سلم التنقيط'],
  [/Choisir date/g, 'اختيار التاريخ'],
  [/Sur 20/g, 'على 20'],
  [/Sur 10/g, 'على 10'],
  [/Notes/g, 'النقط'],
  [/Total/g, 'المجموع'],
  [/Exercice\s*(\d+)\s*:/g, 'تمرين $1 :'],
  [/Exercice\s*(\d+)/g, 'تمرين $1'],
  [/Classe\s*:/g, 'القسم :'],
  [/Durée\s*:/g, 'المدة :'],
  [/Devoir individuel/g, 'فرض فردي'],
  [/Mathématique/g, 'الرياضيات'],
  [/Lycée El jamai ,Tanger/g, 'ثانوية الجامعي، طنجة'],
  [/Lycée El jamai, Tanger/g, 'ثانوية الجامعي، طنجة'],
  [/N°\s*:\s*1\s*Semestre\s*:\s*1/g, 'رقم : 1  الدورة : 1'],
  [/N°/g, 'رقم'],
  [/Semestre/g, 'الدورة'],
  [/Page\s*(\d+)/g, 'الصفحة $1'],
  [/(\d+)\s*Exs/g, '$1 تمارين'],
  [/(\d+)\s*Ex/g, '$1 تمرين'],
  [/(\d+)\s*Pts/g, '$1 نقط'],
  [/(\d+)\s*Pt/g, '$1 نقطة']
];

const FR_TRANSLATIONS = [
  [/الإعدادات\s*:/g, 'Réglages :'],
  [/تصدير PDF/g, 'Exporter PDF'],
  [/الأسطر/g, 'Lignes'],
  [/سلم التنقيط/g, 'Barème'],
  [/اختيار التاريخ/g, 'Choisir date'],
  [/على 20/g, 'Sur 20'],
  [/على 10/g, 'Sur 10'],
  [/النقط/g, 'Notes'],
  [/المجموع/g, 'Total'],
  [/تمرين\s*(\d+)\s*:/g, 'Exercice $1 :'],
  [/تمرين\s*(\d+)/g, 'Exercice $1'],
  [/القسم\s*:/g, 'Classe :'],
  [/المدة\s*:/g, 'Durée :'],
  [/فرض فردي/g, 'Devoir individuel'],
  [/الرياضيات/g, 'Mathématique'],
  [/ثانوية الجامعي، طنجة/g, 'Lycée El jamai ,Tanger'],
  [/رقم\s*:\s*1\s*الدورة\s*:\s*1/g, 'N° : 1 Semestre : 1'],
  [/رقم/g, 'N°'],
  [/الدورة/g, 'Semestre'],
  [/الصفحة\s*(\d+)/g, 'Page $1'],
  [/(\d+)\s*تمارين/g, '$1 Exs'],
  [/(\d+)\s*تمرين/g, '$1 Ex'],
  [/(\d+)\s*نقط/g, '$1 Pts'],
  [/(\d+)\s*نقطة/g, '$1 Pt']
];

function translateText(text) {
  let next = text;
  const list = window.__examLanguage === 'ar' ? AR_TRANSLATIONS : FR_TRANSLATIONS;
  list.forEach(([pattern, replacement]) => {
    next = next.replace(pattern, replacement);
  });
  return next;
}

function translateNode(node) {
  if (!node || !node.textContent) return;
  const next = translateText(node.textContent);
  if (next !== node.textContent) node.textContent = next;
}

function translateInputs() {
  document.querySelectorAll('textarea, input[type="text"]').forEach(function (input) {
    if (!input.value) return;
    const next = translateText(input.value);
    if (next !== input.value) {
      input.value = next;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
}

function syncLanguageButton() {
  var panel = document.querySelector('.panel');
  if (!panel) return;
  var button = document.querySelector('.language-toggle');
  if (!button) {
    button = document.createElement('button');
    button.className = 'language-toggle';
    button.type = 'button';
    button.addEventListener('click', function () {
      window.__examLanguage = window.__examLanguage === 'ar' ? 'fr' : 'ar';
      localStorage.setItem('examLanguage', window.__examLanguage);
      syncLanguage();
    });
    var title = panel.querySelector('.eyebrow');
    if (title && title.nextSibling) panel.insertBefore(button, title.nextSibling);
    else panel.insertBefore(button, panel.firstChild);
  }
  button.textContent = window.__examLanguage === 'ar' ? 'Français' : 'العربية';
}

function syncLanguage() {
  document.body.classList.toggle('arabic-mode', window.__examLanguage === 'ar');
  document.documentElement.setAttribute('dir', window.__examLanguage === 'ar' ? 'rtl' : 'ltr');
  syncLanguageButton();
  translateInputs();
  document.querySelectorAll('button, strong, span, .eyebrow, .page-date-title, .exercise-title-controls, .bar-ribbon-toggle, .pdf-lines-toggle').forEach(translateNode);
}

syncLanguage();
setTimeout(syncLanguage, 100);
setTimeout(syncLanguage, 400);
setInterval(syncLanguage, 500);

new MutationObserver(function () {
  syncLanguage();
}).observe(document.body, { childList: true, subtree: true, characterData: true });
