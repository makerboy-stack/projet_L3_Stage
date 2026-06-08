const express = require('express');
const router = express.Router();
const {
  listerEcolesPublic,
  listerEcolesAdmin,
  creerEcole,
  modifierEcole,
  supprimerEcole,
} = require('../controllers/ecole.controller');
const { verifierToken, autoriserRoles } = require('../middlewares/auth.middleware');

// ── PUBLIC (accessible sans token, pour remplir les selects d'inscription) ──
// GET /api/ecoles
router.get('/', listerEcolesPublic);

// ── ADMIN (token + rôle admin requis) ──
// GET /api/ecoles/admin/liste
router.get('/admin/liste', verifierToken, autoriserRoles('admin'), listerEcolesAdmin);

// POST /api/ecoles
router.post('/', verifierToken, autoriserRoles('admin'), creerEcole);

// PATCH /api/ecoles/:id
router.patch('/:id', verifierToken, autoriserRoles('admin'), modifierEcole);

// DELETE /api/ecoles/:id
router.delete('/:id', verifierToken, autoriserRoles('admin'), supprimerEcole);

module.exports = router;
