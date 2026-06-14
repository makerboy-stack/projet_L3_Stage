const { Message, User } = require('../models')
const { Op } = require('sequelize')

// GET /api/messages/:interlocuteur_id — conversation avec un utilisateur
const getConversation = async (req, res) => {
  try {
    const moi = req.user.id
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
      order: [['created_at', 'ASC']],
    })

    // Marquer les messages reçus comme lus
    await Message.update(
      { lu: true },
      { where: { expediteur_id: autre, destinataire_id: moi, lu: false } }
    )

    return res.status(200).json({ success: true, data: messages })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

// POST /api/messages/:destinataire_id — envoyer un message
const envoyerMessage = async (req, res) => {
  try {
    const { contenu } = req.body
    if (!contenu?.trim()) return res.status(400).json({ success: false, message: 'Contenu vide.' })

    const msg = await Message.create({
      expediteur_id:   req.user.id,
      destinataire_id: parseInt(req.params.destinataire_id),
      contenu: contenu.trim(),
    })

    return res.status(201).json({ success: true, data: msg })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

// GET /api/messages/non-lus — nb de messages non lus
const nonLus = async (req, res) => {
  try {
    const count = await Message.count({ where: { destinataire_id: req.user.id, lu: false } })
    return res.status(200).json({ success: true, data: count })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

module.exports = { getConversation, envoyerMessage, nonLus }
