const { Departement, Filiere, Ecole } = require('../models')

// ── PUBLIC : départements d'une école ──
const listerParEcole = async (req, res) => {
  try {
    const { ecole_id } = req.params
    const depts = await Departement.findAll({
      where: { ecole_id, is_active: true },
      attributes: ['id', 'nom', 'code'],
      order: [['nom', 'ASC']],
    })
    return res.json({ success: true, data: depts })
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

// ── PUBLIC : filières d'un département ──
const listerFilieresParDept = async (req, res) => {
  try {
    const { dept_id } = req.params
    const filieres = await Filiere.findAll({
      where: { departement_id: dept_id, is_active: true },
      attributes: ['id', 'nom', 'code', 'niveaux'],
      order: [['nom', 'ASC']],
    })
    return res.json({ success: true, data: filieres })
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

// ── ADMIN : liste tous les départements (avec filieres) ──
const listerTous = async (req, res) => {
  try {
    const { ecole_id } = req.query
    const where = {}
    if (ecole_id) where.ecole_id = ecole_id
    const depts = await Departement.findAll({
      where,
      include: [
        { model: Filiere, as: 'filieres', attributes: ['id', 'nom', 'code', 'niveaux', 'is_active'] },
        { model: Ecole, as: 'ecole', attributes: ['id', 'nom', 'sigle'] },
      ],
      order: [['nom', 'ASC']],
    })
    return res.json({ success: true, data: depts })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

// ── ADMIN : créer département ──
const creer = async (req, res) => {
  try {
    const { ecole_id, nom, code } = req.body
    if (!ecole_id || !nom) return res.status(400).json({ success: false, message: 'ecole_id et nom sont obligatoires.' })
    const dept = await Departement.create({ ecole_id, nom: nom.trim(), code })
    return res.status(201).json({ success: true, data: dept })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

// ── ADMIN : modifier département ──
const modifier = async (req, res) => {
  try {
    const dept = await Departement.findByPk(req.params.id)
    if (!dept) return res.status(404).json({ success: false, message: 'Département introuvable.' })
    const { nom, code, is_active } = req.body
    if (nom !== undefined) dept.nom = nom.trim()
    if (code !== undefined) dept.code = code
    if (is_active !== undefined) dept.is_active = is_active
    await dept.save()
    return res.json({ success: true, data: dept })
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

// ── ADMIN : supprimer département ──
const supprimer = async (req, res) => {
  try {
    const dept = await Departement.findByPk(req.params.id)
    if (!dept) return res.status(404).json({ success: false, message: 'Département introuvable.' })
    await dept.destroy()
    return res.json({ success: true, message: 'Département supprimé.' })
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

// ── ADMIN : créer filière ──
const creerFiliere = async (req, res) => {
  try {
    const { departement_id, nom, code, niveaux } = req.body
    if (!departement_id || !nom) return res.status(400).json({ success: false, message: 'departement_id et nom sont obligatoires.' })
    const filiere = await Filiere.create({ departement_id, nom: nom.trim(), code, niveaux: niveaux || ['L1','L2','L3','M1','M2'] })
    return res.status(201).json({ success: true, data: filiere })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

// ── ADMIN : modifier filière ──
const modifierFiliere = async (req, res) => {
  try {
    const f = await Filiere.findByPk(req.params.id)
    if (!f) return res.status(404).json({ success: false, message: 'Filière introuvable.' })
    const { nom, code, niveaux, is_active } = req.body
    if (nom !== undefined) f.nom = nom.trim()
    if (code !== undefined) f.code = code
    if (niveaux !== undefined) f.niveaux = niveaux
    if (is_active !== undefined) f.is_active = is_active
    await f.save()
    return res.json({ success: true, data: f })
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

// ── ADMIN : supprimer filière ──
const supprimerFiliere = async (req, res) => {
  try {
    const f = await Filiere.findByPk(req.params.id)
    if (!f) return res.status(404).json({ success: false, message: 'Filière introuvable.' })
    await f.destroy()
    return res.json({ success: true, message: 'Filière supprimée.' })
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

module.exports = { listerParEcole, listerFilieresParDept, listerTous, creer, modifier, supprimer, creerFiliere, modifierFiliere, supprimerFiliere }
