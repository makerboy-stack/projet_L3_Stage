const express = require('express')
const router = express.Router()
const { statsEncadrant, mesEtudiants, deciderAptitude } = require('../controllers/encadrant.controller')
const { verifierToken, autoriserRoles } = require('../middlewares/auth.middleware')

router.use(verifierToken, autoriserRoles('encadrant'))

router.get('/stats',        statsEncadrant)
router.get('/mes-etudiants', mesEtudiants)
router.patch('/memoires/:etudiant_id/aptitude', deciderAptitude)

module.exports = router
