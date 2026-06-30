window.__examLanguage = window.__examLanguage || 'fr';

const FR_HEADER = {
  rightTop: 'Lycée El jamai ,Tanger',
  rightBottom: 'Matière: Mathématique',
  individualTitle: 'Devoir individuel',
  freeTitle: 'Devoir libre',
  homeworkTitle: 'Devoir à la maison',
  subject: 'N° : 1 Semestre : 1',
  level: 'Classe : 2 Bac SPF'
};

const AR_HEADER = {
  rightTop: 'ثانوية الجامعي، طنجة',
  rightBottom: 'مادة : الرياضيات',
  individualTitle: 'فرض محروس',
  freeTitle: 'فرض منزلي',
  homeworkTitle: 'فرض منزلي',
  subject: 'رقم 1 الدورة 1',
  level: 'قسم : 2 باك ع.ف'
};

const DURATION_FR_TO_AR = {
  '30 min': '30 د',
  '1 h': '1 س',
  '1 h 30': '1 س 30 د',
  '2 h': '2 س',
  '2 h 30': '2 س 30 د',
  '3 h': '3 س',
  '3 h 30': '3 س 30 د',
  '4 h': '4 س'
};

const DURATION_AR_TO_FR = Object.fromEntries(
  Object.entries(DURATION_FR_TO_AR).map(([fr, ar]) => [ar, fr])
);

function setText(node, value) {
  if (!node || node.textContent === value) return;
  node.textContent = value;
}

function setInputValue(selector, value) {
  var input = document.querySelector(selector);
  if (!input || input.value === value) return;
  var setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
  if (setter) setter.call(input, value);
  else input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function syncHeaderLanguage() {
  var header = window.__examLanguage === 'ar' ? AR_HEADER : FR_HEADER;
  setInputValue('.right-line-top', header.rightTop);

  var rightBottom = document.querySelector('.right-line-bottom');
  if (rightBottom) {
    var currentRightBottom = rightBottom.value || '';
    var isRightBottom = currentRightBottom === 'N° : 1 Semestre : 1' || currentRightBottom === FR_HEADER.rightBottom || currentRightBottom === AR_HEADER.rightBottom;
    if (isRightBottom) setInputValue('.right-line-bottom', header.rightBottom);
  }

  var levelInput = document.querySelector('.inline-class-input');
  if (levelInput) {
    var currentLevel = levelInput.value || '';
    var isLevel = currentLevel === FR_HEADER.level || currentLevel === AR_HEADER.level;
    if (isLevel) setInputValue('.inline-class-input', header.level);
  }

  var titleTop = document.querySelector('.title-line-top');
  if (titleTop) {
    var currentTop = titleTop.value || '';
    var isIndividual = currentTop === FR_HEADER.individualTitle || currentTop === AR_HEADER.individualTitle;
    var isFree = currentTop === FR_HEADER.freeTitle || currentTop === AR_HEADER.freeTitle;
    var isHomework = currentTop === FR_HEADER.homeworkTitle || currentTop === AR_HEADER.homeworkTitle;
    if (isIndividual) setInputValue('.title-line-top', header.individualTitle);
    if (isFree) setInputValue('.title-line-top', header.freeTitle);
    if (isHomework) setInputValue('.title-line-top', header.homeworkTitle);
  }

  var titleMiddle = document.querySelector('.title-line-middle');
  if (titleMiddle) {
    var currentMiddle = titleMiddle.value || '';
    var isSubject = currentMiddle === 'Mathématique' || currentMiddle === FR_HEADER.subject || currentMiddle === 'الرياضيات' || currentMiddle === AR_HEADER.subject;
    if (isSubject) setInputValue('.title-line-middle', header.subject);
  }
}

function setIndividualHeaderTitle(isActive) {
  var titleTop = document.querySelector('.title-line-top');
  if (!titleTop) return;
  if (window.__examLanguage === 'ar') {
    setInputValue('.title-line-top', isActive ? AR_HEADER.freeTitle : AR_HEADER.individualTitle);
  } else {
    setInputValue('.title-line-top', isActive ? FR_HEADER.freeTitle : FR_HEADER.individualTitle);
  }
}

function syncPanelLabels() {
  var isArabic = window.__examLanguage === 'ar';

  var notesTitle = document.querySelector('.note-scale-title');
  setText(notesTitle, isArabic ? 'النقط :' : 'Notes :');

  var linesButton = document.querySelector('.pdf-lines-toggle');
  if (linesButton) {
    var linesVisible = linesButton.classList.contains('on');
    setText(linesButton, isArabic
      ? (linesVisible ? 'أسطر ظاهرة في PDF' : 'أسطر مخفية في PDF')
      : (linesVisible ? 'Lignes visibles dans le PDF' : 'Lignes masquées dans le PDF'));
  }

  var barButton = document.querySelector('.bar-ribbon-toggle');
  if (barButton) {
    var barVisible = barButton.classList.contains('on');
    setText(barButton, isArabic
      ? (barVisible ? 'سُلَّم التنقيط ظاهر' : 'سُلَّم التنقيط مخفي')
      : (barVisible ? 'Ruban de barème visible' : 'Ruban de barème masqué'));
  }

  var totalCounter = document.querySelector('.note-scale-counter');
  if (totalCounter) {
    var totalText = totalCounter.textContent || '';
    var nextTotalText = totalText
      .replace(/^Total\s*:/, isArabic ? 'المجموع :' : 'Total :')
      .replace(/^المجموع\s*:/, isArabic ? 'المجموع :' : 'Total :');
    setText(totalCounter, nextTotalText);
  }

  document.querySelectorAll('.page-number').forEach(function (pageNumber) {
    var pageText = pageNumber.textContent || '';
    var nextPageText = pageText
      .replace(/^Page\s+/, isArabic ? 'الصفحة ' : 'Page ')
      .replace(/^الصفحة\s+/, isArabic ? 'الصفحة ' : 'Page ');
    setText(pageNumber, nextPageText);
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
      syncLanguageMode();
      setIndividualHeaderTitle(document.body.classList.contains('no-title-points'));
    });

    var title = panel.querySelector('.eyebrow');
    if (title && title.nextSibling) panel.insertBefore(button, title.nextSibling);
    else panel.insertBefore(button, panel.firstChild);
  }

  var individualButton = document.querySelector('.individual-toggle');
  if (!individualButton) {
    individualButton = document.createElement('button');
    individualButton.className = 'individual-toggle';
    individualButton.type = 'button';
    individualButton.addEventListener('click', function () {
      document.body.classList.toggle('no-title-points');
      var active = document.body.classList.contains('no-title-points');
      setIndividualHeaderTitle(active);
      var barButton = document.querySelector('.bar-ribbon-toggle');
      if (barButton) barButton.click();
      syncLanguageButton();
      syncPanelLabels();
    });

    if (button.nextSibling) panel.insertBefore(individualButton, button.nextSibling);
    else panel.appendChild(individualButton);
  }

  var isActive = document.body.classList.contains('no-title-points');
  individualButton.classList.toggle('active', !isActive);
  setText(individualButton, window.__examLanguage === 'ar'
    ? (isActive ? 'فرض\nمنزلي' : 'فرض\nمحروس')
    : (isActive ? 'Devoir\nlibre' : 'Devoir\nindividuel'));
  setText(button, window.__examLanguage === 'ar' ? 'Français' : 'العربية');
}

function syncDurationLabels() {
  document.querySelectorAll('.tiny-duration-control strong').forEach(function (duration) {
    var text = (duration.textContent || '').trim();
    var next = window.__examLanguage === 'ar' ? DURATION_FR_TO_AR[text] : DURATION_AR_TO_FR[text];
    if (next) setText(duration, next);
  });
}

function scheduleDurationSync() {
  syncDurationLabels();
  setTimeout(syncDurationLabels, 0);
  setTimeout(syncDurationLabels, 40);
  setTimeout(syncDurationLabels, 120);
}

function bindDurationButtons() {
  document.querySelectorAll('.tiny-duration-control button').forEach(function (button) {
    if (button.dataset.durationSyncBound === 'true') return;
    button.dataset.durationSyncBound = 'true';
    button.addEventListener('click', scheduleDurationSync);
  });
}

function bindPanelButtons() {
  document.querySelectorAll('.pdf-lines-toggle, .bar-ribbon-toggle').forEach(function (button) {
    if (button.dataset.panelSyncBound === 'true') return;
    button.dataset.panelSyncBound = 'true';
    button.addEventListener('click', function () {
      setTimeout(syncPanelLabels, 0);
      setTimeout(syncPanelLabels, 40);
    });
  });
}

function syncExerciseTitles() {
  document.querySelectorAll('.exam-exercise:not(.blank-exercise) .exercise-title-controls > span:first-child').forEach(function (span) {
    var controls = span.closest('.exercise-title-controls');
    var text = span.textContent || '';
    var match = text.match(/(?:Exercice|\u062a\u0645\u0631\u064a\u0646)\s*(\d+)/i);
    if (!match) return;
    var isHomeworkTitle = controls && !controls.querySelector('button');
    var next = window.__examLanguage === 'ar'
      ? '\u062a\u0645\u0631\u064a\u0646 ' + match[1] + (isHomeworkTitle ? '' : ' :')
      : 'Exercice ' + match[1] + (isHomeworkTitle ? '' : ' :');
    setText(span, next);
  });
}

function syncLanguageMode() {
  document.body.classList.toggle('arabic-mode', window.__examLanguage === 'ar');
  document.documentElement.setAttribute('dir', 'ltr');
  syncLanguageButton();
  syncPanelLabels();
  syncHeaderLanguage();
  bindDurationButtons();
  bindPanelButtons();
  scheduleDurationSync();
  syncExerciseTitles();
  if (typeof formatExercisePointLabels === 'function') formatExercisePointLabels();
}

var queuedLanguageSync = false;
function queueLanguageSync() {
  if (queuedLanguageSync) return;
  queuedLanguageSync = true;
  requestAnimationFrame(function () {
    queuedLanguageSync = false;
    syncLanguageButton();
    syncPanelLabels();
    syncHeaderLanguage();
    bindDurationButtons();
    bindPanelButtons();
    syncDurationLabels();
    syncExerciseTitles();
  });
}

syncLanguageMode();
setTimeout(syncLanguageMode, 100);
setTimeout(syncLanguageMode, 400);

new MutationObserver(queueLanguageSync).observe(document.body, { childList: true, subtree: true });
