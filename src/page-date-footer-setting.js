const DATE_STORAGE_KEY = 'exam-page-date-value';
const DATE_VISIBLE_KEY = 'exam-page-date-visible';

function todayText() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return dd + '/' + mm + '/' + yyyy;
}

function getDateValue() {
  return localStorage.getItem(DATE_STORAGE_KEY) || todayText();
}

function isDateVisible() {
  return localStorage.getItem(DATE_VISIBLE_KEY) !== 'false';
}

function setDateValue(value) {
  localStorage.setItem(DATE_STORAGE_KEY, value || '');
  updatePageDates();
}

function setDateVisible(visible) {
  localStorage.setItem(DATE_VISIBLE_KEY, visible ? 'true' : 'false');
  document.body.classList.toggle('hide-page-date', !visible);
  updateDateControlState();
}

function updatePageDates() {
  const value = getDateValue();
  document.querySelectorAll('.a4-page').forEach(function (page) {
    let node = page.querySelector(':scope > .page-date');
    if (!node) {
      node = document.createElement('div');
      node.className = 'page-date';
      page.appendChild(node);
    }
    node.textContent = value;
  });
}

function updateDateControlState() {
  const control = document.querySelector('.page-date-control');
  if (!control) return;
  const visible = isDateVisible();
  control.classList.toggle('on', visible);
  control.classList.toggle('off', !visible);
  const button = control.querySelector('.page-date-toggle-button');
  if (button) button.textContent = visible ? 'Date visible' : 'Date masquée';
}

function ensureDateControl() {
  const panel = document.querySelector('.panel');
  if (!panel || panel.querySelector('.page-date-control')) return;

  const control = document.createElement('div');
  control.className = 'page-date-control';

  const title = document.createElement('span');
  title.className = 'page-date-title';
  title.textContent = 'Date bas de page';

  const input = document.createElement('input');
  input.className = 'page-date-input';
  input.type = 'text';
  input.value = getDateValue();
  input.placeholder = 'jj/mm/aaaa';
  input.addEventListener('input', function () {
    setDateValue(input.value);
  });

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'page-date-toggle-button';
  button.addEventListener('click', function () {
    setDateVisible(!isDateVisible());
  });

  control.appendChild(title);
  control.appendChild(input);
  control.appendChild(button);

  const after = panel.querySelector('.form-group');
  if (after && after.nextSibling) panel.insertBefore(control, after.nextSibling);
  else panel.appendChild(control);

  updateDateControlState();
}

function syncPageDateFeature() {
  if (!document.body) return;
  document.body.classList.toggle('hide-page-date', !isDateVisible());
  ensureDateControl();
  updatePageDates();
}

syncPageDateFeature();
setTimeout(syncPageDateFeature, 200);
setTimeout(syncPageDateFeature, 700);

document.addEventListener('click', function () {
  setTimeout(syncPageDateFeature, 80);
});

window.syncPageDateFeature = syncPageDateFeature;
