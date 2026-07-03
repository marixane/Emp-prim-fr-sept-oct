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

function pressCardButton(card, wanted) {
  if (!card) return false;
  var buttons = Array.from(card.querySelectorAll('.compact-control button'));
  var button = buttons.find(function (b) {
    var text = String(b.textContent || '').trim();
    return !b.disabled && (text === wanted || (wanted === '-' && text === '−'));
  });
  if (!button) return false;
  button.click();
  setTimeout(syncPageNumberControls, 60);
  setTimeout(syncPageNumberControls, 180);
  setTimeout(syncPageNumberControls, 420);
  return true;
}

function addPage(total) {
  pressCardButton(getCountCards()[total], '+');
}

function removeLastPage(total) {
  if (total <= 1) return;
  var index = total - 1;

  function removeOneExercise() {
    var card = getCountCards()[index];
    if (!card || getCardCount(card) <= 0) {
      setTimeout(syncPageNumberControls, 120);
      return;
    }
    if (!pressCardButton(card, '-')) return;
    setTimeout(removeOneExercise, 90);
  }

  removeOneExercise();
}

function ensurePageControlStyle() {
  var style = document.getElementById('safe-page-controls-style');
  if (!style) {
    style = document.createElement('style');
    style.id = 'safe-page-controls-style';
    document.head.appendChild(style);
  }

  style.textContent = '.page-number{pointer-events:auto!important;z-index:90!important}.page-number-safe-controls{position:fixed!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:12px!important;pointer-events:auto!important;z-index:100000!important;transform:translateX(-50%)!important}.page-number-safe-controls button{width:48px!important;min-width:48px!important;height:24px!important;min-height:24px!important;border-radius:6px!important;border:1px solid #64748b!important;background:#ffffff!important;color:#0f172a!important;font-size:17px!important;font-weight:900!important;line-height:1!important;padding:0!important;margin:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;cursor:pointer!important;box-sizing:border-box!important;box-shadow:0 2px 5px rgba(15,23,42,.22)!important;-webkit-tap-highlight-color:transparent!important}.page-number-safe-controls button:hover{background:#e0f2fe!important;border-color:#2563eb!important;color:#1d4ed8!important}.page-number-safe-controls button.minus:hover{background:#fee2e2!important;border-color:#dc2626!important;color:#b91c1c!important}.page-number-safe-controls button:disabled{opacity:.35!important;cursor:not-allowed!important}@media(max-width:1200px){.page-number-safe-controls{gap:10px!important}.page-number-safe-controls button{width:46px!important;min-width:46px!important;height:28px!important;min-height:28px!important;font-size:17px!important;border-radius:6px!important;touch-action:none!important}}@media print{.page-number-safe-controls{display:none!important}}';
}

function runPageButton(event, pageNode, action) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  var now = Date.now();
  if (runPageButton.last && now - runPageButton.last < 180) return;
  runPageButton.last = now;
  var pageNumber = pageNode.querySelector('.page-number');
  var info = getFooterInfo(pageNumber);
  if (!info) return;
  if (action === 'add') addPage(info.total);
  if (action === 'remove') removeLastPage(info.total);
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

  minus.addEventListener('pointerdown', function (event) { runPageButton(event, pageNode, 'remove'); });
  plus.addEventListener('pointerdown', function (event) { runPageButton(event, pageNode, 'add'); });
  minus.addEventListener('click', function (event) { event.preventDefault(); event.stopPropagation(); });
  plus.addEventListener('click', function (event) { event.preventDefault(); event.stopPropagation(); });

  controls.appendChild(minus);
  controls.appendChild(plus);
  return controls;
}

function syncPageNumberControls() {
  ensurePageControlStyle();
  document.querySelectorAll('.page-number-safe-controls').forEach(function (old) { old.remove(); });

  document.querySelectorAll('.a4-page').forEach(function (pageNode) {
    var pageNumber = pageNode.querySelector('.page-number');
    var info = getFooterInfo(pageNumber);
    if (!info) return;
    var rect = pageNode.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    var controls = makeControls(pageNode);
    controls.style.left = (rect.left + rect.width / 2 + 128) + 'px';
    controls.style.top = (rect.bottom - 32) + 'px';

    var minus = controls.querySelector('.minus');
    if (minus) minus.disabled = info.total <= 1;

    document.body.appendChild(controls);
  });
}

syncPageNumberControls();
setTimeout(syncPageNumberControls, 200);
setTimeout(syncPageNumberControls, 700);
setTimeout(syncPageNumberControls, 1200);
setInterval(syncPageNumberControls, 500);
window.addEventListener('resize', syncPageNumberControls);
window.addEventListener('scroll', syncPageNumberControls, true);
window.syncPageNumberControls = syncPageNumberControls;
