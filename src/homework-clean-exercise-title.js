function isHomeworkMode() {
  var title = document.querySelector('.title-line-top');
  var value = String((title && (title.value || title.textContent)) || '');
  return value.indexOf('Devoir à la maison') !== -1 || value.indexOf('فرض منزلي') !== -1;
}

function cleanHomeworkExerciseTitles() {
  if (!isHomeworkMode()) return;

  document.querySelectorAll('.exercise-title-controls').forEach(function (title) {
    if (title.textContent.trim() === 'Exercice :') return;
    while (title.firstChild) title.removeChild(title.firstChild);
    var label = document.createElement('span');
    label.textContent = 'Exercice :';
    title.appendChild(label);
  });
}

cleanHomeworkExerciseTitles();
setTimeout(cleanHomeworkExerciseTitles, 100);
setTimeout(cleanHomeworkExerciseTitles, 400);
setInterval(cleanHomeworkExerciseTitles, 250);

new MutationObserver(function () {
  cleanHomeworkExerciseTitles();
}).observe(document.body, { childList: true, subtree: true, characterData: true });
