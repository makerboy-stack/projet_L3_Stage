const express = require('express')
const router = express.Router()
const { monProfilComplet, mettreAJourProfil } = require('../controllers/profil.controller')
const { verifierToken } = require('../middlewares/auth.middleware')

router.use(verifierToken)
router.get('/moi',   monProfilComplet)
router.patch('/moi', mettreAJourProfil)

module.exports = router
