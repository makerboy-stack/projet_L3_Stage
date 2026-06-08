const express = require('express')
const router = express.Router()
const {
  obtenirStats,
  listerUtilisateurs,
  obtenirUtilisateur,
  modifierUtilisateur,
  basculerStatutCompte,
  supprimerUtilisateur,
} = require('../controllers/admin.controller')
const { verifierToken, autoriserRoles } = require('../middlewares/auth.middleware')

// Toutes les routes admin nécessitent JWT + rôle 'admin'
router.use(verifierToken, autoriserRoles('admin'))

// GET /api/admin/stats
router.get('/stats', obtenirStats)

// GET /api/admin/utilisateurs
router.get('/utilisateurs', listerUtilisateurs)

// GET /api/admin/utilisateurs/:id
router.get('/utilisateurs/:id', obtenirUtilisateur)

// PATCH /api/admin/utilisateurs/:id
router.patch('/utilisateurs/:id', modifierUtilisateur)

// PATCH /api/admin/utilisateurs/:id/statut
router.patch('/utilisateurs/:id/statut', basculerStatutCompte)

// DELETE /api/admin/utilisateurs/:id
router.delete('/utilisateurs/:id', supprimerUtilisateur)

module.exports = router
