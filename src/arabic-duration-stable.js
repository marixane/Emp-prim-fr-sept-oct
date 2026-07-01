const D = String.fromCharCode(1583);
const S = String.fromCharCode(1587);
const ARABIC_DURATIONS = ['30 ' + D, '1 ' + S, '1 ' + S + ' 30 ' + D, '2 ' + S, '2 ' + S + ' 30 ' + D, '3 ' + S, '3 ' + S + ' 30 ' + D, '4 ' + S];
const FRENCH_DURATIONS = ['30 min', '1 h', '1 h 30', '2 h', '2 h 30', '3 h', '3 h 30', '4 h'];

function durationIndexFromText(text) {
  var value = String(text || '').trim();
  var frIndex = FRENCH_DURATIONS.indexOf(value);
  if (frIndex >= 0) return frIndex;
  var arIndex = ARABIC_DURATIONS.indexOf(value);
  if (arIndex >= 0) return arIndex;
  return -1;
}

function isArabicModeOn() {
  return window.__examLanguage === 'ar' || document.body.classList.contains('arabic-mode');
}

function paintArabicDuration() {
  if (!isArabicModeOn()) return;
  document.querySelectorAll('.tiny-duration-control strong').forEach(function (node) {
    var index = durationIndexFromText(node.textContent);
    if (index >= 0) node.textContent = ARABIC_DURATIONS[index];
  });
}

function fixDurationClick(event) {
  if (!isArabicModeOn()) return;
  var button = event.target && event.target.closest ? event.target.closest('.tiny-duration-control button') : null;
  if (!button) return;
  var control = button.closest('.tiny-duration-control');
  if (!control) return;
  var strong = control.querySelector('strong');
  if (!strong) return;
  var index = durationIndexFromText(strong.textContent);
  if (index >= 0) strong.textContent = FRENCH_DURATIONS[index];
  setTimeout(paintArabicDuration, 0);
  setTimeout(paintArabicDuration, 40);
  setTimeout(paintArabicDuration, 120);
  setTimeout(paintArabicDuration, 300);
}

paintArabicDuration();
setTimeout(paintArabicDuration, 250);
setTimeout(paintArabicDuration, 700);

document.addEventListener('click', function (event) {
  fixDurationClick(event);
  if (event.target && event.target.closest && event.target.closest('.language-toggle')) {
    setTimeout(paintArabicDuration, 40);
    setTimeout(paintArabicDuration, 120);
    setTimeout(paintArabicDuration, 300);
  }
});

window.paintArabicDuration = paintArabicDuration;
