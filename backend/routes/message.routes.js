const express = require('express')
const router  = express.Router()
const { getConversation, envoyerMessage, nonLus } = require('../controllers/message.controller')
const { verifierToken } = require('../middlewares/auth.middleware')

router.use(verifierToken)

router.get('/non-lus',                  nonLus)
router.get('/:interlocuteur_id',        getConversation)
router.post('/:destinataire_id',        envoyerMessage)

module.exports = router
