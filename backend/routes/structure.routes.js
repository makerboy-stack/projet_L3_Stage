const express = require('express')
const router = express.Router()
const {
  listerDepartements, listerFilieres, ecoleAvecStructure,
  creerDepartement, modifierDepartement, supprimerDepartement,
  creerFiliere, modifierFiliere, supprimerFiliere,
} = require('../controllers/structure.controller')
const { verifierToken, autoriserRoles } = require('../middlewares/auth.middleware')

// ── PUBLIC ────────────────────────────────────────────────────
router.get('/departements', listerDepartements)
router.get('/filieres',     listerFilieres)

// ── ADMIN ─────────────────────────────────────────────────────
router.get('/ecoles-structure', verifierToken, autoriserRoles('admin'), ecoleAvecStructure)

router.post('/departements',      verifierToken, autoriserRoles('admin'), creerDepartement)
router.patch('/departements/:id', verifierToken, autoriserRoles('admin'), modifierDepartement)
router.delete('/departements/:id',verifierToken, autoriserRoles('admin'), supprimerDepartement)

router.post('/filieres',       verifierToken, autoriserRoles('admin'), creerFiliere)
router.patch('/filieres/:id',  verifierToken, autoriserRoles('admin'), modifierFiliere)
router.delete('/filieres/:id', verifierToken, autoriserRoles('admin'), supprimerFiliere)

module.exports = router
