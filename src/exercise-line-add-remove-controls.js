function getPageCards() {
  return Array.from(document.querySelectorAll('.page-count-card'));
}

function getVisibleExerciseCount(pageIndex) {
  var card = getPageCards()[pageIndex];
  var strong = card && card.querySelector('strong');
  var match = String((strong && strong.textContent) || '').match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function getRealExerciseCount(pageIndex) {
  var pageNode = document.querySelectorAll('.a4-page')[pageIndex];
  if (!pageNode) return getVisibleExerciseCount(pageIndex);
  return Array.from(pageNode.querySelectorAll('.exam-exercise')).filter(function (exercise) {
    return !exercise.classList.contains('blank-exercise');
  }).length;
}

function findCountButton(pageIndex, wanted) {
  var card = getPageCards()[pageIndex];
  if (!card) return null;
  var buttons = Array.from(card.querySelectorAll('.compact-control button'));
  return buttons.find(function (b) {
    var text = String(b.textContent || '').trim();
    return !b.disabled && (text === wanted || (wanted === '-' && text === '−'));
  }) || null;
}

function getPageIndexFromControl(control) {
  var page = control && control.closest && control.closest('.a4-page');
  if (!page) return 0;
  return Array.from(document.querySelectorAll('.a4-page')).indexOf(page);
}

function refreshSoon() {
  setTimeout(syncExerciseLineControls, 30);
  setTimeout(syncExerciseLineControls, 90);
  setTimeout(syncExerciseLineControls, 180);
  setTimeout(syncExerciseLineControls, 360);
}

function retryAddFirstExercise(pageIndex, triesLeft) {
  if (getRealExerciseCount(pageIndex) > 0 || triesLeft <= 0) {
    refreshSoon();
    return;
  }

  var button = findCountButton(pageIndex, '+');
  if (button) button.click();
  refreshSoon();

  setTimeout(function () {
    retryAddFirstExercise(pageIndex, triesLeft - 1);
  }, 120);
}

function clickExerciseCountButton(pageIndex, wanted) {
  var before = getRealExerciseCount(pageIndex);
  var button = findCountButton(pageIndex, wanted);
  if (!button) return false;

  button.click();
  refreshSoon();

  if ((wanted === '-' || wanted === '−') && before === 1) {
    setTimeout(function () {
      if (getRealExerciseCount(pageIndex) !== 0) clickExerciseCountButton(pageIndex, '-');
    }, 80);
  }

  if (wanted === '+' && before === 0) {
    setTimeout(function () {
      retryAddFirstExercise(pageIndex, 6);
    }, 80);
  }

  return true;
}

function runExerciseButtonOnce(event, pageIndex, wanted) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  var now = Date.now();
  var key = pageIndex + ':' + wanted;
  window.__exerciseButtonTapTimes = window.__exerciseButtonTapTimes || {};
  if (window.__exerciseButtonTapTimes[key] && now - window.__exerciseButtonTapTimes[key] < 220) return;
  window.__exerciseButtonTapTimes[key] = now;

  clickExerciseCountButton(pageIndex, wanted);
}

function installExerciseButtonImmediateTap() {
  if (window.__exerciseImmediateTapInstalled) return;
  window.__exerciseImmediateTapInstalled = true;

  function handle(event) {
    var button = event.target && event.target.closest && event.target.closest('.exercise-line-count-controls button');
    if (!button || button.disabled) return;
    var control = button.closest('.exercise-line-count-controls');
    var pageIndex = getPageIndexFromControl(control);
    if (pageIndex < 0) return;
    var wanted = button.classList.contains('minus') ? '-' : '+';
    runExerciseButtonOnce(event, pageIndex, wanted);
  }

  document.addEventListener('touchstart', handle, { passive: false, capture: true });
  document.addEventListener('pointerdown', function (event) {
    if (event.pointerType === 'touch') handle(event);
  }, { passive: false, capture: true });
}

function ensureExerciseLineControlStyle() {
  var css = '.exercise-line-count-controls{position:absolute!important;left:calc(50% + 0px)!important;top:3px!important;transform:translateX(-50%)!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:17px!important;column-gap:17px!important;pointer-events:auto!important;z-index:3000!important}.exercise-line-count-controls button{position:relative!important;z-index:3001!important;width:48px!important;min-width:48px!important;height:24px!important;min-height:24px!important;border-radius:6px!important;border:1px solid #64748b!important;background:#ffffff!important;color:#0f172a!important;font-size:17px!important;font-weight:900!important;line-height:1!important;padding:0!important;margin:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;cursor:pointer!important;box-sizing:border-box!important;box-shadow:0 1px 3px rgba(15,23,42,.18)!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important}.exercise-line-count-controls button:hover{background:#e0f2fe!important;border-color:#2563eb!important;color:#1d4ed8!important}.exercise-line-count-controls button.minus:hover{background:#fee2e2!important;border-color:#dc2626!important;color:#b91c1c!important}.exercise-line-count-controls button:disabled{opacity:.35!important;cursor:not-allowed!important}body.no-title-points .exercise-line-count-controls,body.no-title-points .exercise-line-count-controls button,body.arabic-mode .exercise-line-count-controls,body.arabic-mode .exercise-line-count-controls button{display:inline-flex!important}@media(max-width:1200px){.exercise-line-count-controls{left:calc(50% + 5px)!important;top:0px!important;gap:15px!important;column-gap:15px!important}.exercise-line-count-controls button{width:48px!important;min-width:48px!important;height:32px!important;min-height:32px!important;font-size:17px!important;border-radius:7px!important;touch-action:none!important}}@media print{.exercise-line-count-controls{display:none!important}}';
  var style = document.getElementById('exercise-line-add-remove-style');
  if (!style) {
    style = document.createElement('style');
    style.id = 'exercise-line-add-remove-style';
    document.head.appendChild(style);
  }
  style.textContent = css;
}

function makeExerciseLineControls(pageIndex) {
  var controls = document.createElement('div');
  controls.className = 'exercise-line-count-controls';

  var minus = document.createElement('button');
  minus.type = 'button';
  minus.className = 'minus';
  minus.textContent = '−';
  minus.title = 'Supprimer un exercice';

  var plus = document.createElement('button');
  plus.type = 'button';
  plus.className = 'plus';
  plus.textContent = '+';
  plus.title = 'Ajouter un exercice';

  minus.addEventListener('click', function (event) {
    runExerciseButtonOnce(event, pageIndex, '-');
  });

  plus.addEventListener('click', function (event) {
    runExerciseButtonOnce(event, pageIndex, '+');
  });

  controls.appendChild(minus);
  controls.appendChild(plus);
  return controls;
}

function syncExerciseLineControls() {
  ensureExerciseLineControlStyle();
  installExerciseButtonImmediateTap();

  document.querySelectorAll('.a4-page').forEach(function (pageNode, pageIndex) {
    pageNode.querySelectorAll('.exercise-line-count-controls').forEach(function (old) { old.remove(); });

    var allExercises = Array.from(pageNode.querySelectorAll('.exam-exercise'));
    var visibleExercises = allExercises.filter(function (exercise) {
      return !exercise.classList.contains('blank-exercise');
    });
    var target = visibleExercises[visibleExercises.length - 1] || allExercises[0] || pageNode;

    if (getComputedStyle(target).position === 'static') target.style.position = 'relative';

    var controls = makeExerciseLineControls(pageIndex);
    var count = getVisibleExerciseCount(pageIndex);
    var realCount = visibleExercises.length;
    var minus = controls.querySelector('.minus');
    var plus = controls.querySelector('.plus');
    if (minus) minus.disabled = realCount <= 0;
    if (plus) plus.disabled = count >= 6 || (pageIndex > 0 && getVisibleExerciseCount(0) === 0);

    target.appendChild(controls);
  });
}

syncExerciseLineControls();
setTimeout(syncExerciseLineControls, 100);
setTimeout(syncExerciseLineControls, 250);
setTimeout(syncExerciseLineControls, 700);
setInterval(syncExerciseLineControls, 700);
window.addEventListener('resize', syncExerciseLineControls);
window.syncExerciseLineControls = syncExerciseLineControls;
