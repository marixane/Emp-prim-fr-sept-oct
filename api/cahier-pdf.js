export default async function handler(req, res) {
  res.status(503).json({
    error: 'Export PDF serveur temporairement désactivé. Utilise Cmd + P puis Enregistrer en PDF pour le moment.'
  });
}
