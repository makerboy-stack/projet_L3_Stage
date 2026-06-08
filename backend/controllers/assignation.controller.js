const { Op } = require('sequelize')
const { User, Assignation, Ecole, Filiere, Stage, Memoire } = require('../models')

const INC_ETU = [
  { model: User, as: 'etudiant', attributes: { exclude: ['mot_de_passe'] },
    include: [
      { model: Ecole,  as: 'ecoleInfo',   attributes: ['id','nom','sigle'] },
      { model: Filiere,as: 'filiereInfo', attributes: ['id','nom'] },
      { model: Stage,  as: 'stage',   required: false },
      { model: Memoire,as: 'memoire', required: false },
    ],
  },
]
const INC_ENC = [
  { model: User, as: 'encadrant', attributes: ['id','nom','prenom','email','grade','specialite','telephone'] },
]

// GET /api/assignations
const listerAssignations = async (req, res) => {
  try {
    const ass = await Assignation.findAll({
      include: [...INC_ETU, ...INC_ENC],
      order: [['created_at','DESC']],
    })
    return res.status(200).json({ success: true, data: ass })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

// GET /api/assignations/stats
const statsAssignations = async (req, res) => {
  try {
    const totalEtudiants  = await User.count({ where: { role: 'etudiant', is_active: true } })
    const avecEncadrant   = await Assignation.count({ where: { statut: 'active' } })
    const sansEncadrant   = Math.max(0, totalEtudiants - avecEncadrant)
    const totalEncadrants = await User.count({ where: { role: 'encadrant', is_active: true } })
    return res.status(200).json({ success: true, data: { totalEtudiants, avecEncadrant, sansEncadrant, totalEncadrants } })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

// GET /api/assignations/etudiants-sans-encadrant
const etudiantsSansEncadrant = async (req, res) => {
  try {
    const actives = await Assignation.findAll({ where: { statut: 'active' }, attributes: ['etudiant_id'] })
    const ids = actives.map(a => a.etudiant_id)
    const where = { role: 'etudiant', is_active: true }
    if (ids.length) where.id = { [Op.notIn]: ids }
    const etudiants = await User.findAll({
      where,
      attributes: { exclude: ['mot_de_passe'] },
      include: [
        { model: Ecole,   as: 'ecoleInfo',   attributes: ['id','nom','sigle'] },
        { model: Filiere, as: 'filiereInfo', attributes: ['id','nom'] },
      ],
    })
    return res.status(200).json({ success: true, data: etudiants })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

// GET /api/assignations/encadrants-disponibles
const encadrantsDisponibles = async (req, res) => {
  try {
    const encadrants = await User.findAll({
      where: { role: 'encadrant', is_active: true },
      attributes: { exclude: ['mot_de_passe'] },
      include: [{
        model: Assignation, as: 'assignationsEncadrant',
        where: { statut: 'active' }, required: false,
      }],
    })
    const data = encadrants.map(e => ({
      ...e.toSafeJSON(),
      nb_etudiants: e.assignationsEncadrant?.length ?? 0,
    }))
    return res.status(200).json({ success: true, data })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

// POST /api/assignations
const creerAssignation = async (req, res) => {
  try {
    const { etudiant_id, encadrant_id, annee_universitaire } = req.body
    if (!etudiant_id || !encadrant_id)
      return res.status(400).json({ success: false, message: 'etudiant_id et encadrant_id obligatoires.' })
    const existante = await Assignation.findOne({ where: { etudiant_id, statut: 'active' } })
    if (existante)
      return res.status(409).json({ success: false, message: 'Cet étudiant a déjà un encadrant actif.' })
    const ass = await Assignation.create({
      etudiant_id, encadrant_id,
      rp_id: req.user.id,
      annee_universitaire,
      statut: 'active',
    })
    return res.status(201).json({ success: true, message: 'Assignation créée.', data: ass })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

// PATCH /api/assignations/:id
const modifierAssignation = async (req, res) => {
  try {
    const ass = await Assignation.findByPk(req.params.id)
    if (!ass) return res.status(404).json({ success: false, message: 'Assignation introuvable.' })
    ;['encadrant_id','statut','note_rp','annee_universitaire'].forEach(c => {
      if (req.body[c] !== undefined) ass[c] = req.body[c]
    })
    await ass.save()
    return res.status(200).json({ success: true, data: ass })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

// DELETE /api/assignations/:id
const supprimerAssignation = async (req, res) => {
  try {
    const ass = await Assignation.findByPk(req.params.id)
    if (!ass) return res.status(404).json({ success: false, message: 'Assignation introuvable.' })
    await ass.destroy()
    return res.status(200).json({ success: true, message: 'Assignation supprimée.' })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

module.exports = {
  listerAssignations, statsAssignations,
  etudiantsSansEncadrant, encadrantsDisponibles,
  creerAssignation, modifierAssignation, supprimerAssignation,
}
