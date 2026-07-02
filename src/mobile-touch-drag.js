function ensureMobileTouchDragStyle() {
  var style = document.getElementById('mobile-touch-drag-style');
  if (!style) {
    style = document.createElement('style');
    style.id = 'mobile-touch-drag-style';
    document.head.appendChild(style);
  }

  style.textContent = '@media (max-width:1200px){.resize-handle,.draggable-photo,.white-mask,.mask-resize-handle,.bar-mark{touch-action:none!important;-webkit-user-select:none!important;user-select:none!important}.resize-handle{pointer-events:auto!important}}';
}

function getTouchPoint(event) {
  var touch = event.touches && event.touches[0] ? event.touches[0] : event.changedTouches && event.changedTouches[0] ? event.changedTouches[0] : null;
  if (!touch) return null;
  return { clientX: touch.clientX, clientY: touch.clientY, screenX: touch.screenX, screenY: touch.screenY };
}

function makeMouseEvent(type, point) {
  return new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: point.clientX,
    clientY: point.clientY,
    screenX: point.screenX,
    screenY: point.screenY,
    buttons: type === 'mouseup' ? 0 : 1,
    button: 0,
  });
}

function isTouchDragTarget(target) {
  return !!(target && target.closest && target.closest('.resize-handle,.draggable-photo,.white-mask,.mask-resize-handle,.bar-mark'));
}

function installMobileTouchDrag() {
  ensureMobileTouchDragStyle();
  if (window.__mobileTouchDragInstalled) return;
  window.__mobileTouchDragInstalled = true;

  var activeTarget = null;

  document.addEventListener('touchstart', function (event) {
    if (!window.matchMedia('(max-width: 1200px)').matches) return;
    if (!isTouchDragTarget(event.target)) return;
    var point = getTouchPoint(event);
    if (!point) return;
    activeTarget = event.target.closest('.resize-handle,.draggable-photo,.white-mask,.mask-resize-handle,.bar-mark');
    event.preventDefault();
    activeTarget.dispatchEvent(makeMouseEvent('mousedown', point));
  }, { passive: false, capture: true });

  document.addEventListener('touchmove', function (event) {
    if (!activeTarget) return;
    var point = getTouchPoint(event);
    if (!point) return;
    event.preventDefault();
    document.dispatchEvent(makeMouseEvent('mousemove', point));
    var shell = document.querySelector('.app-shell');
    if (shell) shell.dispatchEvent(makeMouseEvent('mousemove', point));
  }, { passive: false, capture: true });

  function finishTouch(event) {
    if (!activeTarget) return;
    var point = getTouchPoint(event) || { clientX: 0, clientY: 0, screenX: 0, screenY: 0 };
    event.preventDefault();
    document.dispatchEvent(makeMouseEvent('mouseup', point));
    var shell = document.querySelector('.app-shell');
    if (shell) shell.dispatchEvent(makeMouseEvent('mouseup', point));
    activeTarget = null;
  }

  document.addEventListener('touchend', finishTouch, { passive: false, capture: true });
  document.addEventListener('touchcancel', finishTouch, { passive: false, capture: true });
}

installMobileTouchDrag();
setTimeout(installMobileTouchDrag, 100);
setTimeout(installMobileTouchDrag, 500);
