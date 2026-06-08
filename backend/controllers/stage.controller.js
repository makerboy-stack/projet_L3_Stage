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
    if (stage) {
      Object.assign(stage, payload)
      await stage.save()
    } else {
      stage = await Stage.create({ etudiant_id: req.user.id, ...payload })
    }
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

// PATCH /api/stage/mon-memoire
const soumettreMemoire = async (req, res) => {
  try {
    const { titre } = req.body
    if (!titre) return res.status(400).json({ success: false, message: 'Le titre est obligatoire.' })
    let m = await Memoire.findOne({ where: { etudiant_id: req.user.id } })
    if (m) {
      m.titre = titre; m.statut = 'soumis'; m.date_depot = new Date()
      await m.save()
    } else {
      m = await Memoire.create({ etudiant_id: req.user.id, titre, statut: 'soumis', date_depot: new Date() })
    }
    return res.status(200).json({ success: true, message: 'Mémoire soumis.', data: m })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

module.exports = { monStage, declarerStage, monMemoire, soumettreMemoire }
