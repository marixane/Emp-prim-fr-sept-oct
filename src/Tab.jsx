import { useState } from 'react';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const HOURS = ['08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00'];
const CELL_COLORS = ['#fff3bf', '#d8f3dc', '#dbeafe', '#ffe4e6', '#ede9fe', '#cffafe', '#fef3c7', '#dcfce7', '#e0e7ff', '#fce7f3', '#ccfbf1', '#f5f5f4'];

const createCell = () => ({ text: '', room: 1, span: 1, hidden: false });
const cloneCell = (cell) => ({ ...normalizeCell(cell), hidden: false });
const clampRoom = (value) => Math.min(Math.max(Number(value) || 1, 1), 80);

const getCellColor = (text) => {
  const normalized = String(text ?? '').trim().toLowerCase();
  if (!normalized) return 'white';

  let hash = 0;
  for (let index = 0; index < normalized.length; index += 1) {
    hash = (hash * 31 + normalized.charCodeAt(index)) % CELL_COLORS.length;
  }

  return CELL_COLORS[hash];
};

const createRows = () => DAYS.map((day) => ({
  day,
  cells: HOURS.reduce((acc, hour) => ({ ...acc, [hour]: createCell() }), {})
}));

const normalizeCell = (cell) => {
  if (typeof cell === 'object' && cell !== null) {
    return {
      text: String(cell.text ?? ''),
      room: clampRoom(cell.room ?? 1),
      span: Math.max(Number(cell.span) || 1, 1),
      hidden: Boolean(cell.hidden)
    };
  }

  return { text: String(cell ?? ''), room: 1, span: 1, hidden: false };
};

export default function Tab() {
  const [school, setSchool] = useState('Établissement :');
  const [teacher, setTeacher] = useState('Professeur :');
  const [year, setYear] = useState('Année scolaire : 2026 / 2027');
  const [hours, setHours] = useState(HOURS);
  const [rows, setRows] = useState(createRows);
  const [copiedCell, setCopiedCell] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [draggedCell, setDraggedCell] = useState(null);
  const [dragOverCell, setDragOverCell] = useState(null);

  const validateOnEnter = (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    event.currentTarget.blur();
  };

  const updateHour = (index, value) => {
    const oldHour = hours[index];
    setHours((current) => current.map((hour, i) => i === index ? value : hour));
    setRows((current) => current.map((row) => {
      const nextCells = { ...row.cells, [value]: normalizeCell(row.cells[oldHour]) };
      delete nextCells[oldHour];
      return { ...row, cells: nextCells };
    }));
  };

  const updateDay = (index, value) => {
    setRows((current) => current.map((row, i) => i === index ? { ...row, day: value } : row));
  };

  const updateCellText = (dayIndex, hour, value) => {
    setRows((current) => current.map((row, i) => i === dayIndex ? {
      ...row,
      cells: { ...row.cells, [hour]: { ...normalizeCell(row.cells[hour]), text: value } }
    } : row));
  };

  const updateRoom = (dayIndex, hour, value) => {
    setRows((current) => current.map((row, i) => i === dayIndex ? {
      ...row,
      cells: { ...row.cells, [hour]: { ...normalizeCell(row.cells[hour]), room: clampRoom(value) } }
    } : row));
  };

  const canPasteCell = (row, hourIndex, cellToPaste) => {
    const sourceCell = normalizeCell(cellToPaste);
    if (!sourceCell.text.trim()) return false;
    if (hourIndex + sourceCell.span > hours.length) return false;

    for (let index = hourIndex; index < hourIndex + sourceCell.span; index += 1) {
      const target = normalizeCell(row.cells[hours[index]]);
      if (target.hidden || target.text.trim()) return false;
    }

    return true;
  };

  const duplicateCellTo = (dayIndex, hourIndex, cellToPaste) => {
    setRows((current) => current.map((row, i) => {
      if (i !== dayIndex || !canPasteCell(row, hourIndex, cellToPaste)) return row;
      const pasted = cloneCell(cellToPaste);
      const nextCells = { ...row.cells, [hours[hourIndex]]: pasted };

      for (let index = hourIndex + 1; index < hourIndex + pasted.span; index += 1) {
        nextCells[hours[index]] = { ...createCell(), hidden: true };
      }

      return { ...row, cells: nextCells };
    }));

    setCopiedCell(cloneCell(cellToPaste));
    setSelectedCell(`${dayIndex}-${hourIndex}`);
  };

  const handleCellClick = (dayIndex, hourIndex, cell) => {
    const normalized = normalizeCell(cell);
    if (!normalized.text.trim()) return;

    setCopiedCell(cloneCell(normalized));
    setSelectedCell(`${dayIndex}-${hourIndex}`);
  };

  const handleDragStart = (event, dayIndex, hourIndex, cell) => {
    const normalized = normalizeCell(cell);
    if (!normalized.text.trim()) {
      event.preventDefault();
      return;
    }

    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('text/plain', normalized.text);
    setDraggedCell(cloneCell(normalized));
    setCopiedCell(cloneCell(normalized));
    setSelectedCell(`${dayIndex}-${hourIndex}`);
  };

  const handleDragOver = (event, dayIndex, hourIndex, row, hasClass) => {
    if (!draggedCell || hasClass || !canPasteCell(row, hourIndex, draggedCell)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setDragOverCell(`${dayIndex}-${hourIndex}`);
  };

  const handleDrop = (event, dayIndex, hourIndex, row, hasClass) => {
    if (!draggedCell || hasClass || !canPasteCell(row, hourIndex, draggedCell)) return;
    event.preventDefault();
    duplicateCellTo(dayIndex, hourIndex, draggedCell);
    setDraggedCell(null);
    setDragOverCell(null);
  };

  return <main className="cahier-shell clean-cahier-shell">
    <section className="cahier-preview-zone">
      <div className="a4-page cahier-page">
        <header className="cahier-header">
          <input value={school} onChange={(e) => setSchool(e.target.value)} onKeyDown={validateOnEnter} />
          <h2>Cahier de texte</h2>
          <input value={teacher} onChange={(e) => setTeacher(e.target.value)} onKeyDown={validateOnEnter} />
          <input value={year} onChange={(e) => setYear(e.target.value)} onKeyDown={validateOnEnter} />
        </header>

        <table className="timetable-table">
          <thead>
            <tr>
              <th>Jour</th>
              {hours.map((hour, index) => <th key={`${hour}-${index}`}>
                <textarea value={hour} onChange={(e) => updateHour(index, e.target.value)} onKeyDown={validateOnEnter} rows="2" />
              </th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, dayIndex) => <tr key={dayIndex}>
              <td className="hour-cell day-cell">
                <textarea value={row.day} onChange={(e) => updateDay(dayIndex, e.target.value)} onKeyDown={validateOnEnter} rows="2" />
              </td>
              {hours.map((hour, hourIndex) => {
                const cell = normalizeCell(row.cells[hour]);
                if (cell.hidden) return null;
                const hasClass = Boolean(cell.text.trim());
                const cellKey = `${dayIndex}-${hourIndex}`;
                const canDropHere = !hasClass && draggedCell && canPasteCell(row, hourIndex, draggedCell);

                return <td key={`${hour}-${hourIndex}`} colSpan={cell.span}>
                  <div
                    className={`timetable-cell-content ${hasClass ? 'colored-cell draggable-cell clickable-cell' : ''} ${selectedCell === cellKey ? 'selected-cell' : ''} ${canDropHere || dragOverCell === cellKey ? 'drop-ready-cell' : ''}`}
                    style={hasClass ? { '--cell-color': getCellColor(cell.text) } : undefined}
                    draggable={hasClass}
                    onDragStart={(e) => handleDragStart(e, dayIndex, hourIndex, cell)}
                    onDragEnd={() => {
                      setDraggedCell(null);
                      setDragOverCell(null);
                    }}
                    onDragOver={(e) => handleDragOver(e, dayIndex, hourIndex, row, hasClass)}
                    onDragLeave={() => setDragOverCell(null)}
                    onDrop={(e) => handleDrop(e, dayIndex, hourIndex, row, hasClass)}
                    onClick={hasClass ? () => handleCellClick(dayIndex, hourIndex, cell) : undefined}
                    title={hasClass ? 'Cliquer pour sélectionner ou glisser pour dupliquer' : draggedCell ? 'Déposer ici pour dupliquer' : ''}
                  >
                    <textarea
                      value={cell.text}
                      onChange={(e) => updateCellText(dayIndex, hour, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onDragStart={(e) => e.preventDefault()}
                      onKeyDown={validateOnEnter}
                      placeholder="Classe / matière"
                      rows="4"
                    />
                    {hasClass && <label className="room-control" onClick={(e) => e.stopPropagation()}>
                      <span>Salle</span>
                      <input
                        type="number"
                        min="1"
                        max="80"
                        value={cell.room}
                        onChange={(e) => updateRoom(dayIndex, hour, e.target.value)}
                        onKeyDown={validateOnEnter}
                      />
                    </label>}
                  </div>
                </td>;
              })}
            </tr>)}
          </tbody>
        </table>

        <footer className="cahier-footer">
          <span>Signature :</span>
          <span>Observations :</span>
        </footer>
      </div>
    </section>
  </main>;
}
