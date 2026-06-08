const { Op } = require('sequelize')
const { User, Assignation, Memoire, Stage, Ecole, Filiere } = require('../models')

// GET /api/encadrant/stats
const statsEncadrant = async (req, res) => {
  try {
    const nbEtudiants = await Assignation.count({
      where: { encadrant_id: req.user.id, statut: 'active' },
    })
    const ids = (await Assignation.findAll({
      where: { encadrant_id: req.user.id, statut: 'active' },
      attributes: ['etudiant_id'],
    })).map(a => a.etudiant_id)

    let aptes = 0, nonAptes = 0, memoiresDeposes = 0
    if (ids.length) {
      aptes           = await Memoire.count({ where: { etudiant_id: ids, aptitude: 'apte' } })
      nonAptes        = await Memoire.count({ where: { etudiant_id: ids, aptitude: 'non_apte' } })
      memoiresDeposes = await Memoire.count({ where: { etudiant_id: ids, statut: { [Op.in]: ['soumis','valide','rejete'] } } })
    }
    return res.status(200).json({ success: true, data: { nbEtudiants, aptes, nonAptes, memoiresDeposes } })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

// GET /api/encadrant/mes-etudiants
const mesEtudiants = async (req, res) => {
  try {
    const assignations = await Assignation.findAll({
      where: { encadrant_id: req.user.id, statut: 'active' },
      include: [{
        model: User, as: 'etudiant',
        attributes: { exclude: ['mot_de_passe'] },
        include: [
          { model: Ecole,   as: 'ecoleInfo',   attributes: ['id','nom','sigle'] },
          { model: Filiere, as: 'filiereInfo', attributes: ['id','nom'] },
          { model: Stage,   as: 'stage',   required: false },
          { model: Memoire, as: 'memoire', required: false },
        ],
      }],
    })
    const data = assignations.map(a => ({
      ...a.etudiant.toSafeJSON(),
      assignation_id: a.id,
    }))
    return res.status(200).json({ success: true, data })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

// PATCH /api/encadrant/memoires/:etudiant_id/aptitude
const deciderAptitude = async (req, res) => {
  try {
    const { aptitude, motif_refus, commentaire } = req.body
    if (!['apte','non_apte'].includes(aptitude))
      return res.status(400).json({ success: false, message: 'Valeur aptitude invalide.' })

    let memoire = await Memoire.findOne({ where: { etudiant_id: req.params.etudiant_id } })
    if (!memoire) memoire = await Memoire.create({ etudiant_id: req.params.etudiant_id })

    memoire.aptitude      = aptitude
    memoire.date_decision = new Date()
    if (motif_refus)  memoire.motif_refus          = motif_refus
    if (commentaire)  memoire.commentaire_encadrant = commentaire
    await memoire.save()

    return res.status(200).json({ success: true, message: `Étudiant déclaré ${aptitude}.`, data: memoire })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

module.exports = { statsEncadrant, mesEtudiants, deciderAptitude }
