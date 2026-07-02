function getFooterInfo(node) {
  var match = String((node && node.textContent) || '').match(/Page\s+(\d+)\s*\/\s*(\d+)/i);
  if (!match) return null;
  return { current: Number(match[1]), total: Number(match[2]) };
}

function getCountCards() {
  return Array.from(document.querySelectorAll('.page-count-card'));
}

function getCardCount(card) {
  var strong = card && card.querySelector('strong');
  var match = String((strong && strong.textContent) || '').match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function clickCardButton(card, wanted) {
  if (!card) return false;
  var buttons = Array.from(card.querySelectorAll('.compact-control button'));
  var button = buttons.find(function (b) {
    var text = String(b.textContent || '').trim();
    return !b.disabled && (text === wanted || (wanted === '-' && text === '−'));
  });
  if (!button) return false;
  button.click();
  return true;
}

function addPage(total) {
  clickCardButton(getCountCards()[total], '+');
}

function removeLastPage(total) {
  if (total <= 1) return;
  var index = total - 1;

  function removeOneExercise() {
    var card = getCountCards()[index];
    if (!card || getCardCount(card) <= 0) return;
    if (!clickCardButton(card, '-')) return;
    setTimeout(removeOneExercise, 90);
  }

  removeOneExercise();
}

function ensurePageControlStyle() {
  if (document.getElementById('safe-page-controls-style')) return;
  var style = document.createElement('style');
  style.id = 'safe-page-controls-style';
  style.textContent = '.page-number{pointer-events:auto!important;z-index:90!important}.page-number-safe-controls{position:absolute!important;right:88px!important;bottom:12px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:12px!important;pointer-events:auto!important;z-index:999!important}.page-number-safe-controls button{width:48px!important;min-width:48px!important;height:24px!important;min-height:24px!important;border-radius:6px!important;border:1px solid #64748b!important;background:#ffffff!important;color:#0f172a!important;font-size:17px!important;font-weight:900!important;line-height:1!important;padding:0!important;margin:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;cursor:pointer!important;box-sizing:border-box!important;box-shadow:0 1px 3px rgba(15,23,42,.18)!important}.page-number-safe-controls button:hover{background:#e0f2fe!important;border-color:#2563eb!important;color:#1d4ed8!important}.page-number-safe-controls button.minus:hover{background:#fee2e2!important;border-color:#dc2626!important;color:#b91c1c!important}.page-number-safe-controls button:disabled{opacity:.35!important;cursor:not-allowed!important}@media(max-width:1200px){.page-number-safe-controls{right:78px!important;bottom:10px!important;gap:10px!important}.page-number-safe-controls button{width:42px!important;min-width:42px!important;height:22px!important;min-height:22px!important;font-size:15px!important;border-radius:5px!important}}@media print{.page-number-safe-controls{display:none!important}}';
  document.head.appendChild(style);
}

function makeControls(pageNode) {
  var controls = document.createElement('div');
  controls.className = 'page-number-safe-controls';

  var minus = document.createElement('button');
  minus.type = 'button';
  minus.className = 'minus';
  minus.textContent = '−';
  minus.title = 'Supprimer la dernière page';

  var plus = document.createElement('button');
  plus.type = 'button';
  plus.className = 'plus';
  plus.textContent = '+';
  plus.title = 'Ajouter une page';

  minus.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    var pageNumber = pageNode.querySelector('.page-number');
    var info = getFooterInfo(pageNumber);
    if (info) removeLastPage(info.total);
  });

  plus.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    var pageNumber = pageNode.querySelector('.page-number');
    var info = getFooterInfo(pageNumber);
    if (info) addPage(info.total);
  });

  controls.appendChild(minus);
  controls.appendChild(plus);
  return controls;
}

function syncPageNumberControls() {
  ensurePageControlStyle();

  document.querySelectorAll('.a4-page').forEach(function (pageNode) {
    var pageNumber = pageNode.querySelector('.page-number');
    var info = getFooterInfo(pageNumber);
    if (!info) return;

    var controls = pageNode.querySelector(':scope > .page-number-safe-controls');
    if (!controls) {
      controls = makeControls(pageNode);
      pageNode.appendChild(controls);
    }

    var minus = controls.querySelector('.minus');
    if (minus) minus.disabled = info.total <= 1;
  });
}

syncPageNumberControls();
setTimeout(syncPageNumberControls, 200);
setTimeout(syncPageNumberControls, 700);
setTimeout(syncPageNumberControls, 1200);
setInterval(syncPageNumberControls, 500);
window.addEventListener('resize', syncPageNumberControls);
