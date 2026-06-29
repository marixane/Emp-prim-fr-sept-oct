import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const MAX_PAGES = 6;
const MAX_EX = 6;
const TOTAL = 20;
const H1 = 990;
const HN = 840;
const MIN_H = 120;
const DURATIONS = ['30 min', '1 h', '1 h 30', '2 h', '2 h 30', '3 h', '3 h 30', '4 h'];
const IND_TITLE_TOP = 'Devoir individuel';
const HOME_TITLE_TOP = 'Devoir à la maison';
const TITLE_MIDDLE = 'Mathématique';
const TITLE_BOTTOM = 'N° : 1 Semestre : 1';

const clamp = (v, a, b) => Math.min(Math.max(Number(v), a), b);
const fmt = (v) => {
  const n = Math.round(Number(v) * 100) / 100;
  return `${Number.isInteger(n) ? n : String(n).replace('.', ',')} ${n === 1 ? 'Point' : 'Points'}`;
};
const pts = (n) => {
  if (!n) return [];
  if (n === 3) return [7, 7, 6];
  const base = Math.round((TOTAL / n) / 0.25) * 0.25;
  const arr = Array.from({ length: n }, () => base);
  arr[n - 1] = Math.round((arr[n - 1] + TOTAL - arr.reduce((s, x) => s + x, 0)) * 100) / 100;
  return arr;
};
const ex = (i, p = 5) => ({ id: `${Date.now()}-${i}-${Math.random()}`, points: p, image: null, zoom: 100, x: 0, y: 0, masks: [] });
const blankEx = () => ({ ...ex(0, 0), blank: true });
const exs = (n) => pts(n).map((p, i) => ex(i, p));
const heights = (n, h) => n ? Array.from({ length: n }, (_, i) => i === n - 1 ? h - Math.floor(h / n) * (n - 1) : Math.floor(h / n)) : [];
const visibleCount = (p) => p.filter((e) => !e.blank).length;
const profSize = (t) => t.length > 38 ? 12 : t.length > 26 ? 14 : 16;

export default function App6() {
  const [kind, setKind] = useState('individual');
  const [titleTop, setTitleTop] = useState(IND_TITLE_TOP);
  const [titleMiddle, setTitleMiddle] = useState(TITLE_MIDDLE);
  const [titleBottom, setTitleBottom] = useState(TITLE_BOTTOM);
  const [level, setLevel] = useState('Classes : 2 Bac SPF');
  const [teacher, setTeacher] = useState('Prof : Marwane.R\nLycée El jamai ,Tanger');
  const [duration, setDuration] = useState(3);
  const [pages, setPages] = useState([exs(3), ...Array.from({ length: MAX_PAGES - 1 }, () => [])]);
  const [hs, setHs] = useState([heights(3, H1), ...Array.from({ length: MAX_PAGES - 1 }, () => [])]);
  const [totalLocked, setTotalLocked] = useState(true);
  const [pdfLines, setPdfLines] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [drag, setDrag] = useState(null);
  const [resize, setResize] = useState(null);
  const pageRefs = useRef([]);
  const fileRefs = useRef({});

  const active = pages.map((p, i) => ({ p, i })).filter(({ p, i }) => i === 0 || p.length).map(({ i }) => i);
  const all = active.flatMap((i) => pages[i].filter((e) => !e.blank).map((e, j) => ({ e, page: i, index: pages[i].findIndex((item) => item.id === e.id), realIndex: j })));
  const total = Math.round(all.reduce((s, x) => s + x.e.points, 0) * 100) / 100;
  const startNum = (page) => pages.slice(0, page).reduce((s, p) => s + visibleCount(p), 1);

  const updateEx = (page, id, updates) => {
    setPages((cur) => cur.map((p, pi) => pi === page ? p.map((e) => e.id === id ? { ...e, ...updates } : e) : p));
  };
  const updateMask = (page, exId, maskId, updates) => {
    setPages((cur) => cur.map((p, pi) => pi === page ? p.map((e) => e.id === exId ? {
      ...e,
      masks: (e.masks ?? []).map((m) => m.id === maskId ? {
        ...m,
        ...updates,
        x: clamp(updates.x ?? m.x, 0, 720),
        y: clamp(updates.y ?? m.y, 0, 980),
        width: clamp(updates.width ?? m.width, 24, 720),
        height: clamp(updates.height ?? m.height, 18, 980),
      } : m),
    } : e) : p));
  };
  const balance = (next) => {
    const pos = next.flatMap((p, pi) => p.map((item, ei) => item.blank ? null : { pi, ei }).filter(Boolean));
    const p = pts(pos.length);
    return next.map((page, pi) => page.map((item, ei) => {
      if (item.blank) return item;
      return { ...item, masks: item.masks ?? [], points: p[pos.findIndex((x) => x.pi === pi && x.ei === ei)] ?? item.points };
    }));
  };
  const changeTotalLock = (checked) => {
    setTotalLocked(checked);
    if (checked) setPages((cur) => balance(cur));
  };
  const setCount = (page, d) => {
    if (page > 0 && d > 0 && visibleCount(pages[0]) === 0) return;
    const current = visibleCount(pages[page]);
    const n = clamp(current + d, 0, MAX_EX);
    setPages((cur) => {
      const next = cur.map((p, i) => {
        if (n === 0 && i > page) return [];
        if (i !== page) return p;
        if (n === 0 && page === 0) return p.length === 1 && p[0]?.blank ? p : [blankEx()];
        const real = p.filter((item) => !item.blank);
        return Array.from({ length: n }, (_, j) => real[j] ? { ...real[j], masks: real[j].masks ?? [] } : ex(j));
      });
      return totalLocked ? balance(next) : next;
    });
    setHs((cur) => cur.map((p, i) => {
      if (n === 0 && i > page) return [];
      if (i !== page) return p;
      if (n === 0 && page === 0) return [H1];
      return heights(n, i === 0 ? H1 : HN);
    }));
  };
  const pointPeer = (page, index) => {
    const k = all.findIndex((x) => x.page === page && x.index === index);
    if (k < 0 || all.length < 2) return null;
    return k < all.length - 1 ? all[k + 1] : all[k - 1];
  };
  const canChangePoint = (page, index, d) => {
    const current = pages[page][index];
    if (!current || current.blank) return false;
    const next = Math.round((current.points + d * 0.25) * 100) / 100;
    if (!totalLocked) return next >= 1 && next <= 20;
    const peer = pointPeer(page, index);
    if (!peer) return false;
    const peerNext = Math.round((peer.e.points - d * 0.25) * 100) / 100;
    return next >= 1 && next <= 20 && peerNext >= 1 && peerNext <= 20;
  };
  const changePoint = (page, index, d) => {
    if (!canChangePoint(page, index, d)) return;
    if (!totalLocked) {
      setPages((cur) => cur.map((p, pi) => p.map((e, ei) => pi === page && ei === index ? { ...e, points: Math.round((e.points + d * 0.25) * 100) / 100 } : e)));
      return;
    }
    const peer = pointPeer(page, index);
    if (!peer) return;
    const a = pages[page][index].points + d * 0.25;
    const b = peer.e.points - d * 0.25;
    setPages((cur) => cur.map((p, pi) => p.map((e, ei) => {
      if (pi === page && ei === index) return { ...e, points: Math.round(a * 100) / 100 };
      if (pi === peer.page && ei === peer.index) return { ...e, points: Math.round(b * 100) / 100 };
      return e;
    })));
  };
  const changeImage = (page, id, file) => {
    if (!file) return;
    updateEx(page, id, { image: { name: file.name, url: URL.createObjectURL(file) }, zoom: 100, x: 0, y: 0, masks: [] });
  };
  const clearImage = (page, id) => updateEx(page, id, { image: null, zoom: 100, x: 0, y: 0, masks: [] });
  const addMask = (page, id) => {
    const e = pages[page].find((item) => item.id === id);
    if (!e) return;
    updateEx(page, id, { masks: [...(e.masks ?? []), { id: `mask-${Date.now()}`, x: 120, y: 90, width: 160, height: 60 }] });
  };
  const deleteMask = (page, exId, maskId) => {
    const e = pages[page].find((item) => item.id === exId);
    if (!e) return;
    updateEx(page, exId, { masks: (e.masks ?? []).filter((m) => m.id !== maskId) });
  };
  const startPhotoDrag = (ev, page, e) => {
    ev.preventDefault();
    ev.stopPropagation();
    setResize(null);
    setDrag({ type: 'photo', page, id: e.id, sx: ev.clientX, sy: ev.clientY, x: e.x ?? 0, y: e.y ?? 0 });
  };
  const startMaskDrag = (ev, page, exId, mask) => {
    ev.preventDefault();
    ev.stopPropagation();
    setResize(null);
    setDrag({ type: 'mask-move', page, exId, maskId: mask.id, sx: ev.clientX, sy: ev.clientY, x: mask.x, y: mask.y });
  };
  const startMaskResize = (ev, page, exId, mask) => {
    ev.preventDefault();
    ev.stopPropagation();
    setResize(null);
    setDrag({ type: 'mask-resize', page, exId, maskId: mask.id, sx: ev.clientX, sy: ev.clientY, width: mask.width, height: mask.height });
  };
  const moveDrag = (ev) => {
    if (!drag) return;
    const dx = ev.clientX - drag.sx;
    const dy = ev.clientY - drag.sy;
    if (drag.type === 'photo') updateEx(drag.page, drag.id, { x: clamp(drag.x + dx, -250, 250), y: clamp(drag.y + dy, -250, 250) });
    if (drag.type === 'mask-move') updateMask(drag.page, drag.exId, drag.maskId, { x: drag.x + dx, y: drag.y + dy });
    if (drag.type === 'mask-resize') updateMask(drag.page, drag.exId, drag.maskId, { width: drag.width + dx, height: drag.height + dy });
  };
  const startResize = (ev, page, lower) => {
    ev.preventDefault();
    ev.stopPropagation();
    setDrag(null);
    setResize({ page, upper: lower - 1, lower, sy: ev.clientY, start: hs[page] });
  };
  const moveResize = (ev) => {
    if (!resize) return;
    const dy = ev.clientY - resize.sy;
    const max = resize.start[resize.lower] - MIN_H;
    const min = MIN_H - resize.start[resize.upper];
    const safe = clamp(dy, min, max);
    const next = resize.start.map((h, i) => i === resize.upper ? Math.round(h + safe) : i === resize.lower ? Math.round(h - safe) : h);
    setHs((cur) => cur.map((p, i) => i === resize.page ? next : p));
  };
  const stopMove = () => {
    setDrag(null);
    setResize(null);
  };
  const makePdf = async () => {
    setExporting(true);
    stopMove();
    await new Promise((r) => setTimeout(r, 120));
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    for (let k = 0; k < active.length; k += 1) {
      const node = pageRefs.current[active[k]];
      node.querySelectorAll('textarea').forEach((field) => field.blur());
      const canvas = await html2canvas(node, { scale: 2, backgroundColor: '#fff', ignoreElements: (el) => el.classList?.contains('photo-overlay-tools') || el.classList?.contains('mask-delete-button') || el.classList?.contains('mask-resize-handle') });
      if (k) pdf.addPage('a4', 'portrait');
      pdf.addImage(canvas.toDataURL('image/jpeg', 1), 'JPEG', 0, 0, 210, 297);
    }
    return pdf;
  };
  const preview = async () => { try { const pdf = await makePdf(); window.open(pdf.output('bloburl'), '_blank'); } finally { setExporting(false); } };
  const download = async () => { try { const pdf = await makePdf(); pdf.save('devoir-a4.pdf'); } finally { setExporting(false); } };

  const renderList = (page) => <div className="exercise-list">{pages[page].map((e, i) => <section className={`exam-exercise ex-${i + 1} ${e.blank ? 'blank-exercise' : ''}`} key={e.id} style={{ height: `${hs[page][i]}px` }}>
    {!e.blank && i > 0 && <button type="button" className="resize-handle" onMouseDown={(ev) => startResize(ev, page, i)} aria-label="Modifier la hauteur" />}
    {!e.blank && <div className="exercise-title exercise-title-controls">{kind === 'homework' ? <span>Exercice {startNum(page) + visibleCount(pages[page].slice(0, i))}</span> : <><span>Exercice {startNum(page) + visibleCount(pages[page].slice(0, i))} : </span><span className="points-decoration">* (</span><button onClick={() => changePoint(page, i, -1)} disabled={!canChangePoint(page, i, -1)}>−</button><strong>{fmt(e.points)}</strong><button onClick={() => changePoint(page, i, 1)} disabled={!canChangePoint(page, i, 1)}>+</button><span className="points-decoration">) *</span></>}</div>}
    <div className="exercise-body clickable-photo-zone" onClick={() => !e.image && fileRefs.current[e.id]?.click()}>
      {e.image && <div className="photo-overlay-tools" onClick={(ev) => ev.stopPropagation()}><button type="button" className="photo-tool-button" onClick={() => fileRefs.current[e.id]?.click()}>Changer photo</button><button type="button" className="photo-tool-button" onClick={() => addMask(page, e.id)}>Rectangle blanc</button><button type="button" className="photo-tool-button danger" onClick={() => clearImage(page, e.id)}>Supprimer</button><label className="photo-zoom-control">Zoom <input type="range" min="60" max="220" value={e.zoom ?? 100} onChange={(ev) => updateEx(page, e.id, { zoom: clamp(ev.target.value, 60, 220) })} /><span>{e.zoom ?? 100}%</span></label></div>}
      {e.image ? <><img className="draggable-photo" src={e.image.url ?? e.image} alt={e.image.name ?? 'exercice'} draggable="false" onMouseDown={(ev) => startPhotoDrag(ev, page, e)} style={{ transform: `translate(${e.x ?? 0}px, ${e.y ?? 0}px) scale(${(e.zoom ?? 100) / 100})` }} />{(e.masks ?? []).map((m) => <div className="white-mask" key={m.id} onMouseDown={(ev) => startMaskDrag(ev, page, e.id, m)} style={{ left: `${m.x}px`, top: `${m.y}px`, width: `${m.width}px`, height: `${m.height}px` }}><button type="button" className="mask-delete-button" onMouseDown={(ev) => ev.stopPropagation()} onClick={(ev) => { ev.stopPropagation(); deleteMask(page, e.id, m.id); }}>×</button><span className="mask-resize-handle" onMouseDown={(ev) => startMaskResize(ev, page, e.id, m)} /></div>)}</> : <div className="empty-zone">Clique ici pour choisir la photo</div>}
    </div>
  </section>)}</div>;

  return <main className={`app-shell ${resize ? 'is-resizing' : ''}`} onMouseMove={(ev) => { moveDrag(ev); moveResize(ev); }} onMouseUp={stopMove} onMouseLeave={stopMove}>
    <section className="panel">
      <p className="eyebrow">A4 Exam Maker</p><h1>Créer une feuille A4 avec entête fixe</h1><p className="intro">Choisis le type de devoir, puis le nombre d’exercices par page.</p>
      <div className="form-group"><label>Type de devoir</label><div className="duration-control compact-control assignment-control"><button onClick={() => { setKind('individual'); setTitleTop(IND_TITLE_TOP); }} disabled={kind === 'individual'}>Individuel</button><button onClick={() => { setKind('homework'); setTitleTop(HOME_TITLE_TOP); }} disabled={kind === 'homework'}>À la maison</button></div></div>
      {kind !== 'homework' && <><label className="total-mode-control"><input type="checkbox" checked={totalLocked} onChange={(ev) => changeTotalLock(ev.target.checked)} />{totalLocked ? 'Total bloqué : ' : 'Total libre : '}{fmt(total)}</label><p className={`points-total ${totalLocked ? 'locked' : 'free'}`}>{totalLocked ? 'Total général bloqué : ' : 'Total général libre : '}{fmt(total)}</p></>}
      <button type="button" className={`pdf-lines-toggle ${pdfLines ? 'on' : 'off'}`} onClick={() => setPdfLines((v) => !v)}>{pdfLines ? 'Lignes visibles dans le PDF' : 'Lignes masquées dans le PDF'}</button>
      <section className="exercise-count-section"><h2>Nombre d’exercices</h2><div className="page-count-grid">{pages.map((p, i) => <div className="page-count-card" key={i}><label>Page {i + 1}</label><div className="duration-control compact-control"><button onClick={() => setCount(i, -1)} disabled={visibleCount(p) === 0}>−</button><strong>{visibleCount(p)}</strong><button onClick={() => setCount(i, 1)} disabled={visibleCount(p) === MAX_EX || (i > 0 && visibleCount(pages[0]) === 0)}>+</button></div></div>)}</div></section>
      {active.flatMap((page) => pages[page].map((e) => <input key={e.id} ref={(n) => { fileRefs.current[e.id] = n; }} className="hidden-file-input" type="file" accept="image/*" onChange={(ev) => changeImage(page, e.id, ev.target.files?.[0])} />))}
      <button onClick={preview} disabled={exporting}>{exporting ? 'Préparation...' : 'Voir PDF'}</button><button className="secondary" onClick={download} disabled={exporting}>{exporting ? 'Export en cours...' : 'Exporter PDF A4'}</button>
    </section>
    <section className="preview-zone">{active.map((page, order) => <div className={`a4-page exam-page ${page === 0 ? '' : 'second-page'} ${exporting ? 'is-exporting' : ''} ${exporting && !pdfLines ? 'no-pdf-lines' : ''}`} key={page} ref={(n) => { pageRefs.current[page] = n; }}>{page === 0 && <header className="exam-header three-cell-header"><div className="header-cell left-header-cell class-duration-header"><textarea className="inline-class-input" value={level} onChange={(e) => setLevel(e.target.value)} rows="1" /><div className="tiny-duration-control"><button onClick={() => setDuration((d) => clamp(d - 1, 0, DURATIONS.length - 1))}>−</button><strong>{DURATIONS[duration]}</strong><button onClick={() => setDuration((d) => clamp(d + 1, 0, DURATIONS.length - 1))}>+</button></div></div><div className="header-cell middle-header-cell split-title-cell"><textarea className="inline-title-input title-line title-line-top" value={titleTop} onChange={(e) => setTitleTop(e.target.value)} rows="1" /><textarea className="inline-title-input title-line title-line-middle" value={titleMiddle} onChange={(e) => setTitleMiddle(e.target.value)} rows="1" /><textarea className="inline-title-input title-line title-line-bottom" value={titleBottom} onChange={(e) => setTitleBottom(e.target.value)} rows="1" /></div><div className="header-cell right-header-cell"><textarea className="inline-prof-input" value={teacher} onChange={(e) => setTeacher(e.target.value)} rows="2" style={{ fontSize: `${profSize(teacher)}px` }} /></div></header>}{renderList(page)}<div className="page-number">Page {order + 1}/{active.length}</div></div>)}</section>
  </main>;
}
