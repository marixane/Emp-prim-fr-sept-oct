function isFreeModeActive() {
  var notes = document.querySelector('.note-scale-control:not(.homework-disabled-note)');
  if (!notes) return false;

  var title = document.querySelector('.title-line-top');
  var value = ((title && (title.value || title.textContent)) || '').trim();

  return value === 'Devoir libre' || value === 'Devoir à la maison' || value === 'فرض منزلي';
}

function updateDisplay(node, hidden) {
  if (!node) return;
  if (hidden) node.style.display = 'none';
  else node.style.display = '';
}

function syncFreeModeBodyClass() {
  if (!document.body) return;
  document.body.classList.toggle('no-title-points', isFreeModeActive());
}

function syncFreeModeBarRibbon(freeMode) {
  var button = document.querySelector('.bar-ribbon-toggle');
  if (!button) return;

  if (freeMode && button.classList.contains('on')) {
    button.click();
  }

  button.disabled = !!freeMode;
  button.setAttribute('aria-disabled', freeMode ? 'true' : 'false');
  button.style.pointerEvents = freeMode ? 'none' : '';
  button.style.opacity = freeMode ? '0.45' : '';
  button.style.cursor = freeMode ? 'not-allowed' : '';
  button.title = freeMode ? 'Barème désactivé en devoir libre' : '';
}

function cleanFreeModeExerciseTitles() {
  var freeMode = isFreeModeActive();
  syncFreeModeBodyClass();
  syncFreeModeBarRibbon(freeMode);

  document.querySelectorAll('.exam-exercise:not(.blank-exercise) .exercise-title-controls').forEach(function (title) {
    var span = title.querySelector('span:first-child');
    var text = (span && span.textContent) || '';
    var match = text.match(/(Exercice|تمرين)\s*(\d+)/i);

    if (freeMode && span && match) span.textContent = match[1] + ' ' + match[2] + ' :';

    title.querySelectorAll('button, strong, .points-decoration').forEach(function (node) {
      updateDisplay(node, freeMode);
    });
  });
}

function syncFreeModeClean() {
  cleanFreeModeExerciseTitles();
}

syncFreeModeClean();
setTimeout(syncFreeModeClean, 100);
setTimeout(syncFreeModeClean, 300);
setTimeout(syncFreeModeClean, 700);

window.setInterval(syncFreeModeClean, 400);

document.addEventListener('click', function () {
  setTimeout(syncFreeModeClean, 20);
  setTimeout(syncFreeModeClean, 80);
  setTimeout(syncFreeModeClean, 250);
});

document.addEventListener('input', function () {
  setTimeout(syncFreeModeClean, 80);
});

window.cleanFreeModeExerciseTitles = cleanFreeModeExerciseTitles;
window.syncFreeModeBodyClass = syncFreeModeBodyClass;
window.syncFreeModeBarRibbon = syncFreeModeBarRibbon;
