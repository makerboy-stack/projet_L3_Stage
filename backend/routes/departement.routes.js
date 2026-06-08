const express = require('express')
const router = express.Router()
const c = require('../controllers/departement.controller')
const { verifierToken, autoriserRoles } = require('../middlewares/auth.middleware')

// PUBLIC
router.get('/ecole/:ecole_id',      c.listerParEcole)
router.get('/:dept_id/filieres',    c.listerFilieresParDept)

// ADMIN
router.get('/',                     verifierToken, autoriserRoles('admin'), c.listerTous)
router.post('/',                    verifierToken, autoriserRoles('admin'), c.creer)
router.patch('/:id',                verifierToken, autoriserRoles('admin'), c.modifier)
router.delete('/:id',               verifierToken, autoriserRoles('admin'), c.supprimer)
router.post('/filieres',            verifierToken, autoriserRoles('admin'), c.creerFiliere)
router.patch('/filieres/:id',       verifierToken, autoriserRoles('admin'), c.modifierFiliere)
router.delete('/filieres/:id',      verifierToken, autoriserRoles('admin'), c.supprimerFiliere)

module.exports = router
