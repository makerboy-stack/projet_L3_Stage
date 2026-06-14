const path = require('path')
const fs   = require('fs')
const { Stage, Memoire } = require('../models')

// GET /api/stage/mon-stage
const monStage = async (req, res) => {
  try {
    const stage = await Stage.findOne({ where: { etudiant_id: req.user.id } })
    return res.status(200).json({ success: true, data: stage })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

// POST /api/stage/declarer
const declarerStage = async (req, res) => {
  try {
    const { a_stage, entreprise, secteur, sujet, lieu, date_debut, date_fin, encadrant_entreprise } = req.body
    let stage = await Stage.findOne({ where: { etudiant_id: req.user.id } })
    const payload = { a_stage, entreprise, secteur, sujet, lieu, date_debut, date_fin, encadrant_entreprise }
    if (stage) { Object.assign(stage, payload); await stage.save() }
    else { stage = await Stage.create({ etudiant_id: req.user.id, ...payload }) }
    return res.status(200).json({ success: true, message: 'Stage enregistré.', data: stage })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

// GET /api/stage/mon-memoire
const monMemoire = async (req, res) => {
  try {
    const m = await Memoire.findOne({ where: { etudiant_id: req.user.id } })
    return res.status(200).json({ success: true, data: m })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

// PATCH /api/stage/mon-memoire — soumettre/modifier (fichier uploadé OU lien)
// Bloqué si aptitude déjà décidée
const soumettreMemoire = async (req, res) => {
  try {
    const { titre, lien } = req.body   // lien = URL externe optionnelle
    const fichierUploade  = req.file   // fichier multer si présent

    if (!titre) {
      // Nettoyer le fichier uploadé si le titre manque
      if (fichierUploade) fs.unlinkSync(fichierUploade.path)
      return res.status(400).json({ success: false, message: 'Le titre est obligatoire.' })
    }

    // Vérifier qu'on a au moins un fichier ou un lien
    if (!fichierUploade && !lien) {
      return res.status(400).json({ success: false, message: 'Veuillez fournir un fichier ou un lien.' })
    }

    let m = await Memoire.findOne({ where: { etudiant_id: req.user.id } })

    // Bloquer si aptitude déjà décidée
    if (m && m.aptitude !== 'en_attente') {
      if (fichierUploade) fs.unlinkSync(fichierUploade.path)
      return res.status(403).json({
        success: false,
        message: `Impossible de modifier : l'encadrant a déjà rendu une décision (${m.aptitude}).`,
      })
    }

    // Si un nouveau fichier est uploadé et qu'il y avait déjà un ancien fichier, supprimer l'ancien
    if (fichierUploade && m && m.type_depot === 'fichier' && m.fichier_url) {
      const ancienChemin = path.join(__dirname, '..', m.fichier_url.replace('/uploads/', 'uploads/'))
      if (fs.existsSync(ancienChemin)) {
        try { fs.unlinkSync(ancienChemin) } catch { /* silencieux */ }
      }
    }

    // Construire les valeurs selon le mode de dépôt
    let fichier_url, type_depot
    if (fichierUploade) {
      // URL relative accessible via /uploads/memoires/nomfichier
      fichier_url = `/uploads/memoires/${fichierUploade.filename}`
      type_depot  = 'fichier'
    } else {
      fichier_url = lien
      type_depot  = 'lien'
    }

    const payload = {
      titre,
      fichier_url,
      type_depot,
      statut:     'soumis',
      date_depot: new Date(),
    }

    if (m) { Object.assign(m, payload); await m.save() }
    else    { m = await Memoire.create({ etudiant_id: req.user.id, ...payload }) }

    return res.status(200).json({ success: true, message: 'Mémoire soumis.', data: m })
  } catch (err) {
    // Nettoyer le fichier en cas d'erreur
    if (req.file) try { fs.unlinkSync(req.file.path) } catch { /* silencieux */ }
    console.error(err)
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

// DELETE /api/stage/mon-memoire — supprimer le mémoire (seulement si aptitude en_attente)
const supprimerMemoire = async (req, res) => {
  try {
    const m = await Memoire.findOne({ where: { etudiant_id: req.user.id } })
    if (!m) return res.status(404).json({ success: false, message: 'Aucun mémoire à supprimer.' })
    if (m.aptitude !== 'en_attente') {
      return res.status(403).json({
        success: false,
        message: 'Impossible de supprimer : la décision a déjà été rendue.',
      })
    }
    // Supprimer le fichier physique si c'était un upload
    if (m.type_depot === 'fichier' && m.fichier_url) {
      const chemin = path.join(__dirname, '..', m.fichier_url.replace('/uploads/', 'uploads/'))
      if (fs.existsSync(chemin)) try { fs.unlinkSync(chemin) } catch { /* silencieux */ }
    }
    await m.destroy()
    return res.status(200).json({ success: true, message: 'Mémoire supprimé.' })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

module.exports = { monStage, declarerStage, monMemoire, soumettreMemoire, supprimerMemoire }
