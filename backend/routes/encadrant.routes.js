const express = require('express')
const router  = express.Router()
const {
  statsEncadrant, mesEtudiants, tousEtudiants,
  sAssigner, seDesassigner, deciderAptitude,
} = require('../controllers/encadrant.controller')
const { verifierToken, autoriserRoles } = require('../middlewares/auth.middleware')

router.use(verifierToken, autoriserRoles('encadrant'))

router.get('/stats',                              statsEncadrant)
router.get('/mes-etudiants',                      mesEtudiants)
router.get('/tous-etudiants',                     tousEtudiants)
router.post('/s-assigner/:etudiant_id',           sAssigner)
router.delete('/s-desassigner/:etudiant_id',      seDesassigner)
router.patch('/memoires/:etudiant_id/aptitude',   deciderAptitude)

module.exports = router
