function ensureBarRibbonPageStyle() {
  var style = document.getElementById('bar-ribbon-page-position-style');
  if (!style) {
    style = document.createElement('style');
    style.id = 'bar-ribbon-page-position-style';
    document.head.appendChild(style);
  }

  style.textContent = '.a4-page{position:relative!important}.a4-proxy-control{position:absolute!important;right:auto!important;inset-inline-start:auto!important;inset-inline-end:auto!important;z-index:1000!important;pointer-events:auto!important;margin:0!important;padding:0!important;border-radius:7px!important;border:1px solid #64748b!important;background:#ffffff!important;color:#0f172a!important;box-shadow:0 1px 3px rgba(15,23,42,.18)!important;line-height:1!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;box-sizing:border-box!important;white-space:nowrap!important;overflow:hidden!important;cursor:pointer!important;direction:ltr!important;unicode-bidi:isolate!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important}.a4-proxy-control:hover{background:#e0f2fe!important;border-color:#2563eb!important;color:#1d4ed8!important}.a4-top-control{top:calc(var(--exam-header-height,104px) - 12px)!important;bottom:auto!important;transform:translateX(-50%)!important;width:42px!important;min-width:42px!important;height:42px!important;min-height:42px!important}.a4-text-control{font-size:12px!important;font-weight:900!important}.a4-icon-control{font-size:0!important}.a4-bar-proxy,body.arabic-mode .a4-bar-proxy{left:calc(100% - 279px)!important;right:auto!important}.a4-lines-proxy,body.arabic-mode .a4-lines-proxy{left:calc(100% - 232px)!important;right:auto!important}.a4-lang-proxy,body.arabic-mode .a4-lang-proxy{left:calc(100% - 185px)!important;right:auto!important}.a4-free-proxy,body.arabic-mode .a4-free-proxy{left:calc(100% - 138px)!important;right:auto!important}.a4-note-toggle-proxy,body.arabic-mode .a4-note-toggle-proxy{left:calc(100% - 91px)!important;right:auto!important}.a4-note10-proxy,.a4-note20-proxy{display:none!important}.a4-bar-proxy:after{content:""!important;width:9px!important;height:14px!important;display:block!important;border-left:3px solid currentColor!important;border-right:3px solid currentColor!important;border-top:2px solid currentColor!important;border-bottom:2px solid currentColor!important;box-sizing:border-box!important}.a4-lines-proxy:after{content:""!important;width:15px!important;height:12px!important;display:block!important;background:repeating-linear-gradient(to bottom,currentColor 0,currentColor 2px,transparent 2px,transparent 5px)!important;border-top:1px solid currentColor!important;border-bottom:1px solid currentColor!important;box-sizing:border-box!important}.a4-footer-preview,body.arabic-mode .a4-footer-preview{left:calc(50% + 54px)!important;right:auto!important;bottom:8px!important;width:42px!important;height:22px!important;font-size:10px!important;font-weight:900!important}.a4-footer-export,body.arabic-mode .a4-footer-export{left:calc(50% - 100px)!important;right:auto!important;bottom:8px!important;width:34px!important;min-width:34px!important;height:22px!important;font-size:0!important;font-weight:900!important}.a4-footer-export:before{content:"↓"!important;font-size:18px!important;font-weight:900!important;line-height:1!important}.a4-footer-two-page,body.arabic-mode .a4-footer-two-page{left:calc(50% + 104px)!important;right:auto!important;bottom:8px!important;width:28px!important;height:22px!important}.a4-proxy-control:disabled{opacity:.35!important;cursor:not-allowed!important}.exam-page.is-exporting .a4-proxy-control{display:none!important}@media print{.a4-proxy-control{display:none!important}}';
}

function getOriginal(selector) {
  return document.querySelector('.panel ' + selector);
}

function findByText(selector, texts) {
  return Array.from(document.querySelectorAll('.panel ' + selector)).find(function (button) {
    return texts.indexOf(String(button.textContent || '').trim()) !== -1;
  }) || null;
}

function getAssignmentButtons() {
  return Array.from(document.querySelectorAll('.panel .assignment-control button'));
}

function getIndividualButton() {
  return getAssignmentButtons()[0] || findByText('button', ['Individuel']) || null;
}

function getHomeworkButton() {
  return getAssignmentButtons()[1] || findByText('button', ['À la maison']) || null;
}

function findNoteScaleOriginal(label) {
  return Array.from(document.querySelectorAll('.panel .note-scale-button')).find(function (button) {
    var text = String(button.textContent || '').trim();
    return text === label || text === label.replace('/', '/ ') || text === 'Sur ' + label.replace('/', '');
  }) || null;
}

function getRealNoteScale() {
  var b10 = findNoteScaleOriginal('/10');
  var b20 = findNoteScaleOriginal('/20');
  if (b10 && b10.classList.contains('active')) return '/10';
  if (b20 && b20.classList.contains('active')) return '/20';
  return '/20';
}

function clickNoteTotalOnly(label) {
  var target = findNoteScaleOriginal(label);
  if (!target || target.disabled) return false;
  if (target.classList.contains('active')) return true;
  target.click();
  return true;
}

function isHomeworkMode() {
  var homework = getHomeworkButton();
  return !!(homework && homework.disabled);
}

function updateAssignmentButton(button) {
  if (!button) return;
  var homeworkMode = isHomeworkMode();
  button.textContent = homeworkMode ? 'I' : 'M';
  button.title = homeworkMode ? 'Passer en devoir individuel' : 'Passer en devoir à la maison';
  button.setAttribute('aria-label', button.title);
  button.disabled = false;
}

function clickAssignmentToggle(button) {
  var homeworkMode = isHomeworkMode();
  var target = homeworkMode ? getIndividualButton() : getHomeworkButton();
  if (target && !target.disabled) target.click();
  setTimeout(function () { updateAssignmentButton(button); }, 30);
  setTimeout(function () { updateAssignmentButton(button); }, 120);
  setTimeout(syncA4ProxyControls, 80);
  setTimeout(syncA4ProxyControls, 250);
}

function updateToggleButton(button, scale) {
  if (!button) return;
  var next = scale === '/20' ? '/10' : '/20';
  button.textContent = scale;
  button.title = 'Basculer la note ' + next;
  button.setAttribute('aria-label', button.title);
  button.disabled = false;
}

function clickNoteToggle(button) {
  var currentScale = getRealNoteScale();
  var targetScale = currentScale === '/20' ? '/10' : '/20';
  updateToggleButton(button, targetScale);
  clickNoteTotalOnly(targetScale);
  setTimeout(syncA4ProxyControls, 30);
  setTimeout(syncA4ProxyControls, 90);
  setTimeout(syncA4ProxyControls, 180);
}

function runProxyAction(button, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  if (!button || button.disabled) return;
  var now = Date.now();
  if (button._lastProxyRun && now - button._lastProxyRun < 350) return;
  button._lastProxyRun = now;
  if (typeof button._proxyAction === 'function') button._proxyAction(button);
  setTimeout(syncA4ProxyControls, 80);
  setTimeout(syncA4ProxyControls, 250);
}

function makeProxy(classes, title, text, action) {
  var page = document.querySelector('.a4-page');
  if (!page) return null;
  var mainClass = classes.split(' ')[classes.split(' ').length - 1];
  var button = page.querySelector('.' + mainClass);
  if (!button) {
    button = document.createElement('button');
    button.type = 'button';
    button.className = 'a4-proxy-control ' + classes;
    button.addEventListener('pointerdown', function (event) {
      runProxyAction(button, event);
    });
    button.addEventListener('touchstart', function (event) {
      runProxyAction(button, event);
    }, { passive: false });
    button.addEventListener('click', function (event) {
      runProxyAction(button, event);
    });
    page.appendChild(button);
  }
  button._proxyAction = action;
  button.title = title;
  button.setAttribute('aria-label', title);
  if (typeof text === 'string') button.textContent = text;
  return button;
}

function syncA4ProxyControls() {
  ensureBarRibbonPageStyle();
  var page = document.querySelector('.a4-page');
  if (!page) return;

  makeProxy('a4-top-control a4-icon-control a4-bar-proxy', 'Ruban de barème', '', function () {
    var b = getOriginal('.bar-ribbon-toggle');
    if (b && !b.disabled) b.click();
  });

  makeProxy('a4-top-control a4-icon-control a4-lines-proxy', 'Lignes PDF', '', function () {
    if (typeof window.cycleExamLineMode === 'function') {
      window.cycleExamLineMode();
      return;
    }
    var b = getOriginal('.pdf-lines-toggle');
    if (b && !b.disabled) b.click();
  });

  makeProxy('a4-top-control a4-text-control a4-lang-proxy', window.__examLanguage === 'ar' ? 'Français' : 'Arabe', window.__examLanguage === 'ar' ? 'Fr' : 'Ar', function () {
    var b = getOriginal('.language-toggle');
    if (b && !b.disabled) b.click();
  });

  var assignmentProxy = makeProxy('a4-top-control a4-text-control a4-free-proxy', isHomeworkMode() ? 'Passer en devoir individuel' : 'Passer en devoir à la maison', isHomeworkMode() ? 'I' : 'M', function (button) {
    clickAssignmentToggle(button);
  });
  updateAssignmentButton(assignmentProxy);

  var currentScale = getRealNoteScale();
  var nextScale = currentScale === '/20' ? '/10' : '/20';
  var noteToggle = makeProxy('a4-top-control a4-text-control a4-note-toggle-proxy', 'Basculer la note ' + nextScale, currentScale, function (button) {
    clickNoteToggle(button);
  });
  updateToggleButton(noteToggle, currentScale);

  var old10 = page.querySelector('.a4-note10-proxy');
  if (old10) old10.remove();
  var old20 = page.querySelector('.a4-note20-proxy');
  if (old20) old20.remove();

  var preview = findByText('button', ['Voir PDF', 'Préparation...']);
  var previewProxy = makeProxy('a4-footer-preview', 'Voir PDF', preview && preview.textContent.trim() === 'Préparation...' ? '...' : 'PDF', function () {
    if (typeof window.startExamPdf === 'function') {
      window.startExamPdf('preview');
      return;
    }
    var b = findByText('button', ['Voir PDF', 'Préparation...']);
    if (b && !b.disabled) b.click();
  });
  if (previewProxy && preview) previewProxy.disabled = preview.disabled;

  var exportButton = findByText('button.secondary', ['Exporter PDF A4', 'Export en cours...']);
  var exportProxy = makeProxy('a4-footer-export', 'Exporter PDF A4', '', function () {
    if (typeof window.startExamPdf === 'function') {
      window.startExamPdf('download');
      return;
    }
    var b = findByText('button.secondary', ['Exporter PDF A4', 'Export en cours...']);
    if (b && !b.disabled) b.click();
  });
  if (exportProxy && exportButton) exportProxy.disabled = exportButton.disabled;

  var two = getOriginal('.two-page-view-toggle');
  var twoProxy = makeProxy('a4-footer-two-page', 'Affichage côte à côte', '', function () {
    var b = getOriginal('.two-page-view-toggle');
    if (b && !b.disabled) b.click();
  });
  if (twoProxy && two) {
    twoProxy.disabled = two.disabled;
    twoProxy.innerHTML = two.innerHTML;
  }
}

syncA4ProxyControls();
setTimeout(syncA4ProxyControls, 100);
setTimeout(syncA4ProxyControls, 300);
setTimeout(syncA4ProxyControls, 700);
setInterval(syncA4ProxyControls, 500);
window.addEventListener('resize', syncA4ProxyControls);
window.moveBarRibbonToggleToPage = syncA4ProxyControls;
window.syncA4ProxyControls = syncA4ProxyControls;
