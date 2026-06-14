const { User, Ecole } = require('../models')
const { Op } = require('sequelize')

// ── STATS ──────────────────────────────────────────────────────
const obtenirStats = async (req, res) => {
  try {
    const [totalEtudiants, totalEncadrants, totalRP, totalActifs, totalInactifs] = await Promise.all([
      User.count({ where: { role: 'etudiant' } }),
      User.count({ where: { role: 'encadrant' } }),
      User.count({ where: { role: 'responsable_pedagogique' } }),
      User.count({ where: { is_active: true, role: { [Op.ne]: 'admin' } } }),
      User.count({ where: { is_active: false } }),
    ])
    return res.status(200).json({
      success: true,
      data: { totalEtudiants, totalEncadrants, totalRP, totalActifs, totalInactifs, totalUtilisateurs: totalEtudiants + totalEncadrants + totalRP },
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

// ── LISTE UTILISATEURS ─────────────────────────────────────────
const listerUtilisateurs = async (req, res) => {
  try {
    const { role, is_active, search } = req.query
    const where = { role: { [Op.ne]: 'admin' } }
    if (role) where.role = role
    if (is_active !== undefined && is_active !== '') where.is_active = is_active === 'true'
    if (search) {
      where[Op.or] = [
        { nom:   { [Op.like]: `%${search}%` } },
        { prenom:{ [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ]
    }
    const users = await User.findAll({
      where,
      attributes: { exclude: ['mot_de_passe'] },
      include: [{ model: Ecole, as: 'ecoleInfo', attributes: ['id', 'nom', 'sigle'] }],
      order: [['created_at', 'DESC']],
    })
    return res.status(200).json({ success: true, data: users })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

// ── OBTENIR UN UTILISATEUR ─────────────────────────────────────
const obtenirUtilisateur = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['mot_de_passe'] },
      include: [{ model: Ecole, as: 'ecoleInfo', attributes: ['id', 'nom', 'sigle'] }],
    })
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' })
    return res.status(200).json({ success: true, data: user })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

// ── MODIFIER UN UTILISATEUR ────────────────────────────────────
const modifierUtilisateur = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' })
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Impossible de modifier un admin.' })
    const champs = ['nom', 'prenom', 'telephone', 'ecole_id', 'grade', 'specialite']
    champs.forEach(c => { if (req.body[c] !== undefined) user[c] = req.body[c] })
    await user.save()
    return res.status(200).json({ success: true, message: 'Utilisateur mis à jour.', data: user.toSafeJSON() })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

// ── BASCULER STATUT ────────────────────────────────────────────
const basculerStatutCompte = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' })
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Impossible de modifier un admin.' })
    user.is_active = !user.is_active
    await user.save()
    return res.status(200).json({ success: true, message: `Compte ${user.is_active ? 'activé' : 'désactivé'}.`, data: user.toSafeJSON() })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

// ── SUPPRIMER UN UTILISATEUR ───────────────────────────────────
const supprimerUtilisateur = async (req, res) => {
  try {
    const { sequelize, Assignation, Stage, Memoire, Message } = require('../models')

    const user = await User.findByPk(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' })
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Impossible de supprimer un admin.' })

    const id = user.id

    // Supprimer toutes les données liées dans le bon ordre (FK)
    await Message.destroy({ where: { [Op.or]: [{ expediteur_id: id }, { destinataire_id: id }] } })
    await Memoire.destroy({ where: { etudiant_id: id } })
    await Stage.destroy({ where: { etudiant_id: id } })

    // Pour les encadrants : annuler leurs assignations actives
    if (user.role === 'encadrant') {
      await Assignation.destroy({ where: { encadrant_id: id } })
    }
    // Pour les étudiants : supprimer leur assignation
    await Assignation.destroy({ where: { etudiant_id: id } })

    await user.destroy()

    return res.status(200).json({ success: true, message: 'Utilisateur supprimé avec succès.' })
  } catch (err) {
    console.error('Erreur supprimerUtilisateur:', err)
    return res.status(500).json({ success: false, message: 'Erreur serveur lors de la suppression.' })
  }
}

module.exports = { obtenirStats, listerUtilisateurs, obtenirUtilisateur, modifierUtilisateur, basculerStatutCompte, supprimerUtilisateur }
