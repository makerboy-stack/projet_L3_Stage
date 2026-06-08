const express = require('express')
const router = express.Router()
const { monStage, declarerStage, monMemoire, soumettreMemoire } = require('../controllers/stage.controller')
const { verifierToken, autoriserRoles } = require('../middlewares/auth.middleware')

router.use(verifierToken, autoriserRoles('etudiant'))

router.get('/mon-stage',      monStage)
router.post('/declarer',      declarerStage)
router.get('/mon-memoire',    monMemoire)
router.patch('/mon-memoire',  soumettreMemoire)

module.exports = router
