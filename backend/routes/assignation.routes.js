const express = require('express')
const router = express.Router()
const {
  listerAssignations, statsAssignations,
  etudiantsSansEncadrant, encadrantsDisponibles,
  creerAssignation, modifierAssignation, supprimerAssignation,
} = require('../controllers/assignation.controller')
const { verifierToken, autoriserRoles } = require('../middlewares/auth.middleware')

router.use(verifierToken, autoriserRoles('responsable_pedagogique'))

router.get('/',                         listerAssignations)
router.get('/stats',                    statsAssignations)
router.get('/etudiants-sans-encadrant', etudiantsSansEncadrant)
router.get('/encadrants-disponibles',   encadrantsDisponibles)
router.post('/',    creerAssignation)
router.patch('/:id',   modifierAssignation)
router.delete('/:id',  supprimerAssignation)

module.exports = router
