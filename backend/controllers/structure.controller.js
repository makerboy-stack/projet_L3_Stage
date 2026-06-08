const { Ecole, Departement, Filiere } = require('../models')

// ── PUBLIC ────────────────────────────────────────────────────

const listerDepartements = async (req, res) => {
  try {
    const { ecole_id } = req.query
    const where = { is_active: true }
    if (ecole_id) where.ecole_id = ecole_id
    const depts = await Departement.findAll({ where, order: [['nom','ASC']] })
    return res.status(200).json({ success: true, data: depts })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

const listerFilieres = async (req, res) => {
  try {
    const { departement_id } = req.query
    const where = { is_active: true }
    if (departement_id) where.departement_id = departement_id
    const filieres = await Filiere.findAll({ where, order: [['nom','ASC']] })
    return res.status(200).json({ success: true, data: filieres })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

// ── ADMIN : arbre complet ─────────────────────────────────────

const ecoleAvecStructure = async (req, res) => {
  try {
    const ecoles = await Ecole.findAll({
      include: [{
        model: Departement, as: 'departements',
        include: [{ model: Filiere, as: 'filieres' }],
      }],
      order: [
        ['nom','ASC'],
        [{ model: Departement, as: 'departements' }, 'nom', 'ASC'],
      ],
    })
    return res.status(200).json({ success: true, data: ecoles })
  } catch (err) {
    console.error('ecoleAvecStructure:', err)
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

// ── ADMIN CRUD Departement ────────────────────────────────────

const creerDepartement = async (req, res) => {
  try {
    const { ecole_id, nom, code } = req.body
    if (!ecole_id || !nom) return res.status(400).json({ success: false, message: 'ecole_id et nom obligatoires.' })
    const d = await Departement.create({ ecole_id, nom: nom.trim(), code })
    return res.status(201).json({ success: true, data: d })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

const modifierDepartement = async (req, res) => {
  try {
    const d = await Departement.findByPk(req.params.id)
    if (!d) return res.status(404).json({ success: false, message: 'Introuvable.' })
    ;['nom','code','is_active'].forEach(c => { if (req.body[c] !== undefined) d[c] = req.body[c] })
    await d.save()
    return res.status(200).json({ success: true, data: d })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

const supprimerDepartement = async (req, res) => {
  try {
    const d = await Departement.findByPk(req.params.id)
    if (!d) return res.status(404).json({ success: false, message: 'Introuvable.' })
    await d.destroy()
    return res.status(200).json({ success: true, message: 'Département supprimé.' })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

// ── ADMIN CRUD Filiere ────────────────────────────────────────

const creerFiliere = async (req, res) => {
  try {
    const { departement_id, nom, code, niveaux } = req.body
    if (!departement_id || !nom) return res.status(400).json({ success: false, message: 'departement_id et nom obligatoires.' })
    const f = await Filiere.create({ departement_id, nom: nom.trim(), code, niveaux })
    return res.status(201).json({ success: true, data: f })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

const modifierFiliere = async (req, res) => {
  try {
    const f = await Filiere.findByPk(req.params.id)
    if (!f) return res.status(404).json({ success: false, message: 'Introuvable.' })
    ;['nom','code','niveaux','is_active'].forEach(c => { if (req.body[c] !== undefined) f[c] = req.body[c] })
    await f.save()
    return res.status(200).json({ success: true, data: f })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

const supprimerFiliere = async (req, res) => {
  try {
    const f = await Filiere.findByPk(req.params.id)
    if (!f) return res.status(404).json({ success: false, message: 'Introuvable.' })
    await f.destroy()
    return res.status(200).json({ success: true, message: 'Filière supprimée.' })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

module.exports = {
  listerDepartements, listerFilieres, ecoleAvecStructure,
  creerDepartement, modifierDepartement, supprimerDepartement,
  creerFiliere, modifierFiliere, supprimerFiliere,
}
