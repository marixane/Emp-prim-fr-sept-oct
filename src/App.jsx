import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const DEFAULT_EXERCISES = [
  { id: 'ex1', title: 'Exercice 1', points: '6 Pts', image: null, offsetY: 0 },
  { id: 'ex2', title: 'Exercice 2', points: '- Pts', image: null, offsetY: 0 },
  { id: 'ex3', title: 'Exercice 3', points: '- Pts', image: null, offsetY: 0 },
];

const clamp = (value, min, max) => Math.min(Math.max(Number(value), min), max);

function App() {
  const [studentLevel, setStudentLevel] = useState('2 Bac SPF');
  const [duration, setDuration] = useState('2 hs');
  const [testTitle, setTestTitle] = useState('Devoir individuel de Mathématique');
  const [testNumber, setTestNumber] = useState('N°: 1 Semestre: 1 Lycée El Jamai, Tanger');
  const [teacher, setTeacher] = useState('Prof Marwane.R');
  const [exercises, setExercises] = useState(DEFAULT_EXERCISES);
  const [isExporting, setIsExporting] = useState(false);
  const pageRef = useRef(null);

  const updateExercise = (id, field, value) => {
    setExercises((items) =>
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const updateOffset = (id, value) => {
    const safeValue = clamp(value, 0, 60);
    updateExercise(id, 'offsetY', safeValue);
  };

  const handleExerciseImage = (id, file) => {
    if (!file || !file.type.startsWith('image/')) return;

    updateExercise(id, 'image', {
      name: file.name,
      url: URL.createObjectURL(file),
    });
  };

  const clearExerciseImage = (id) => {
    updateExercise(id, 'image', null);
  };

  const exportPdf = async () => {
    if (!pageRef.current) return;

    setIsExporting(true);

    try {
      const canvas = await html2canvas(pageRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });

      const imageData = canvas.toDataURL('image/jpeg', 1);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.addImage(imageData, 'JPEG', 0, 0, 210, 297);
      pdf.save('devoir-a4.pdf');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="app-shell">
      <section className="panel">
        <p className="eyebrow">A4 Exam Maker</p>
        <h1>Créer une feuille A4 avec entête fixe</h1>
        <p className="intro">
          Les photos restent dans leur cadre. Tu peux descendre Exercice 2 et Exercice 3 sans sortir de la page.
        </p>

        <div className="form-group">
          <label>Niveau</label>
          <input value={studentLevel} onChange={(e) => setStudentLevel(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Durée</label>
          <input value={duration} onChange={(e) => setDuration(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Titre</label>
          <input value={testTitle} onChange={(e) => setTestTitle(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Informations</label>
          <input value={testNumber} onChange={(e) => setTestNumber(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Professeur</label>
          <input value={teacher} onChange={(e) => setTeacher(e.target.value)} />
        </div>

        <hr />

        {exercises.map((exercise, index) => (
          <div className="exercise-control" key={exercise.id}>
            <div className="two-cols">
              <div>
                <label>Nom exercice</label>
                <input
                  value={exercise.title}
                  onChange={(e) => updateExercise(exercise.id, 'title', e.target.value)}
                />
              </div>
              <div>
                <label>Points</label>
                <input
                  value={exercise.points}
                  onChange={(e) => updateExercise(exercise.id, 'points', e.target.value)}
                />
              </div>
            </div>

            {index > 0 && (
              <div className="form-group">
                <label>Position verticale de {exercise.title}</label>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={exercise.offsetY}
                  onChange={(e) => updateOffset(exercise.id, e.target.value)}
                />
                <small>{exercise.offsetY}px vers le bas</small>
              </div>
            )}

            <label>Photo pour {exercise.title}</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleExerciseImage(exercise.id, e.target.files?.[0])}
            />
            {exercise.image && (
              <button type="button" className="secondary" onClick={() => clearExerciseImage(exercise.id)}>
                Supprimer la photo
              </button>
            )}
          </div>
        ))}

        <button type="button" onClick={exportPdf} disabled={isExporting}>
          {isExporting ? 'Export en cours...' : 'Exporter PDF A4'}
        </button>
      </section>

      <section className="preview-zone">
        <div className="a4-page exam-page" ref={pageRef}>
          <header className="exam-header">
            <div className="student-box">
              <div className="small-badge">N°:</div>
              <strong>Nom</strong>
              <span>D'étudiant :</span>
              <div className="dotted-line" />
            </div>

            <div className="level-box">{studentLevel}</div>
            <div className="duration-box">{duration}</div>

            <div className="note-box">
              <strong>Note</strong>
              <div className="note-line" />
              <span>/20</span>
            </div>

            <div className="info-box">
              <strong>{testTitle}</strong>
              <span>{testNumber}</span>
              <div className="teacher-line">{teacher}</div>
            </div>
          </header>

          <p className="phone-rule">
            L'usage du téléphone portable est interdit, même comme calculatrice.
          </p>

          <div className="exercise-list">
            {exercises.map((exercise, index) => (
              <section
                className={`exam-exercise ex-${index + 1}`}
                key={exercise.id}
                style={{ marginTop: index > 0 ? `${exercise.offsetY}px` : '0px' }}
              >
                <div className="exercise-title">
                  {exercise.title} : * ( {exercise.points} ) *
                </div>
                <div className="exercise-body">
                  {exercise.image ? (
                    <img src={exercise.image.url} alt={exercise.image.name} />
                  ) : (
                    <div className="empty-zone">Photo de {exercise.title}</div>
                  )}
                </div>
                {index === 1 && <span className="side-mark top">1P</span>}
                {index === 1 && <span className="side-mark middle">1P</span>}
              </section>
            ))}
          </div>

          <div className="page-number">Page 1</div>
        </div>
      </section>
    </main>
  );
}

export default App;
