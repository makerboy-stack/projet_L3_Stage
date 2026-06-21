const { Message, User } = require('../models')
const { Op } = require('sequelize')
const path = require('path')
const fs   = require('fs')

// GET /api/messages/:interlocuteur_id — conversation
const getConversation = async (req, res) => {
  try {
    const moi   = req.user.id
    const autre = parseInt(req.params.interlocuteur_id)
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { expediteur_id: moi,   destinataire_id: autre },
          { expediteur_id: autre, destinataire_id: moi },
        ],
      },
      include: [
        { model: User, as: 'expediteur',   attributes: ['id','nom','prenom'] },
        { model: User, as: 'destinataire', attributes: ['id','nom','prenom'] },
      ],
      order: [['created_at','ASC']],
    })
    // Marquer comme lus
    await Message.update({ lu: true }, { where: { expediteur_id: autre, destinataire_id: moi, lu: false } })
    return res.status(200).json({ success: true, data: messages })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

// POST /api/messages/:destinataire_id — envoyer texte OU fichier
const envoyerMessage = async (req, res) => {
  try {
    const { contenu } = req.body
    const fichier = req.file

    // Il faut au moins du texte ou un fichier
    if (!contenu?.trim() && !fichier) {
      return res.status(400).json({ success: false, message: 'Message vide.' })
    }

    const msg = await Message.create({
      expediteur_id:   req.user.id,
      destinataire_id: parseInt(req.params.destinataire_id),
      contenu:         contenu?.trim() || null,
      fichier_url:     fichier ? `/uploads/messages/${fichier.filename}` : null,
      fichier_nom:     fichier ? fichier.originalname : null,
    })
    return res.status(201).json({ success: true, data: msg })
  } catch (err) {
    if (req.file) try { fs.unlinkSync(req.file.path) } catch {}
    console.error(err)
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

// GET /api/messages/non-lus
const nonLus = async (req, res) => {
  try {
    const count = await Message.count({ where: { destinataire_id: req.user.id, lu: false } })
    return res.status(200).json({ success: true, data: count })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

module.exports = { getConversation, envoyerMessage, nonLus }
