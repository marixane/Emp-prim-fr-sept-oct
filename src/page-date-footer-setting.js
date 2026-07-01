const DATE_STORAGE_KEY = 'exam-page-date-value';
const DATE_VISIBLE_KEY = 'exam-page-date-visible';
let calendarMonthDate = new Date();

function todayText() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return dd + '/' + mm + '/' + yyyy;
}

function textToDate(value) {
  const match = String(value || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return new Date();
  return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
}

function dateToText(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
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
  updateDateInputValue();
  updatePageDates();
}

function setDateVisible(visible) {
  localStorage.setItem(DATE_VISIBLE_KEY, visible ? 'true' : 'false');
  document.body.classList.toggle('hide-page-date', !visible);
  updateDateControlState();
}

function updateDateInputValue() {
  const input = document.querySelector('.page-date-input');
  if (input) input.value = getDateValue();
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
}

function closeDatePicker() {
  const picker = document.querySelector('.page-date-picker');
  if (picker) picker.classList.remove('open');
}

function toggleDatePicker() {
  const picker = document.querySelector('.page-date-picker');
  if (!picker) return;
  calendarMonthDate = textToDate(getDateValue());
  renderDatePicker();
  picker.classList.toggle('open');
}

function renderDatePicker() {
  const picker = document.querySelector('.page-date-picker');
  if (!picker) return;

  const year = calendarMonthDate.getFullYear();
  const month = calendarMonthDate.getMonth();
  const selected = textToDate(getDateValue());
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const dayNames = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const first = new Date(year, month, 1);
  const firstDay = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let html = '<div class="page-date-picker-head">' +
    '<button type="button" class="page-date-prev">‹</button>' +
    '<strong>' + monthNames[month] + ' ' + year + '</strong>' +
    '<button type="button" class="page-date-next">›</button>' +
    '</div><div class="page-date-weekdays">';

  dayNames.forEach(function (day) { html += '<span>' + day + '</span>'; });
  html += '</div><div class="page-date-days">';

  for (let i = 0; i < firstDay; i += 1) html += '<span class="empty"></span>';

  for (let day = 1; day <= daysInMonth; day += 1) {
    const current = new Date(year, month, day);
    const active = current.toDateString() === selected.toDateString() ? ' active' : '';
    html += '<button type="button" class="page-date-day' + active + '" data-day="' + day + '">' + day + '</button>';
  }

  html += '</div>';
  picker.innerHTML = html;
}

function ensureDateControl() {
  const panel = document.querySelector('.panel');
  if (!panel || panel.querySelector('.page-date-control')) return;

  const control = document.createElement('div');
  control.className = 'page-date-control';
  control.addEventListener('click', function (event) {
    if (event.target && event.target.closest && event.target.closest('.page-date-picker')) return;
    if (event.target && event.target.classList && event.target.classList.contains('page-date-input')) return;
    setDateVisible(!isDateVisible());
  });

  const title = document.createElement('span');
  title.className = 'page-date-title';
  title.textContent = 'Date :';

  const input = document.createElement('input');
  input.className = 'page-date-input';
  input.type = 'text';
  input.readOnly = true;
  input.value = getDateValue();
  input.addEventListener('click', function (event) {
    event.stopPropagation();
    if (!isDateVisible()) setDateVisible(true);
    toggleDatePicker();
  });

  const picker = document.createElement('div');
  picker.className = 'page-date-picker';
  picker.addEventListener('click', function (event) {
    event.stopPropagation();
    const prev = event.target.closest('.page-date-prev');
    const next = event.target.closest('.page-date-next');
    const dayButton = event.target.closest('.page-date-day');

    if (prev) {
      calendarMonthDate = new Date(calendarMonthDate.getFullYear(), calendarMonthDate.getMonth() - 1, 1);
      renderDatePicker();
      return;
    }

    if (next) {
      calendarMonthDate = new Date(calendarMonthDate.getFullYear(), calendarMonthDate.getMonth() + 1, 1);
      renderDatePicker();
      return;
    }

    if (dayButton) {
      const day = Number(dayButton.getAttribute('data-day'));
      const chosen = new Date(calendarMonthDate.getFullYear(), calendarMonthDate.getMonth(), day);
      setDateValue(dateToText(chosen));
      setDateVisible(true);
      closeDatePicker();
    }
  });

  control.appendChild(title);
  control.appendChild(input);
  control.appendChild(picker);

  const after = panel.querySelector('.form-group');
  if (after && after.nextSibling) panel.insertBefore(control, after.nextSibling);
  else panel.appendChild(control);

  renderDatePicker();
  updateDateControlState();
}

function syncPageDateFeature() {
  if (!document.body) return;
  document.body.classList.toggle('hide-page-date', !isDateVisible());
  ensureDateControl();
  updateDateInputValue();
  updatePageDates();
}

syncPageDateFeature();
setTimeout(syncPageDateFeature, 200);
setTimeout(syncPageDateFeature, 700);

document.addEventListener('click', function (event) {
  if (!event.target.closest || !event.target.closest('.page-date-control')) closeDatePicker();
  setTimeout(syncPageDateFeature, 80);
});

window.syncPageDateFeature = syncPageDateFeature;