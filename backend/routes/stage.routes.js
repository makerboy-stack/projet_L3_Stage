const express = require('express')
const router  = express.Router()
const { monStage, declarerStage, monMemoire, soumettreMemoire, supprimerMemoire } = require('../controllers/stage.controller')
const { verifierToken, autoriserRoles } = require('../middlewares/auth.middleware')
const upload = require('../middlewares/upload.middleware')

router.use(verifierToken, autoriserRoles('etudiant'))

router.get('/mon-stage',      monStage)
router.post('/declarer',      declarerStage)
router.get('/mon-memoire',    monMemoire)

// upload.single('fichier') — le champ fichier s'appelle "fichier" dans le FormData
// Si pas de fichier (dépôt par lien), multer ignore et passe au controller
router.patch('/mon-memoire',  upload.single('fichier'), soumettreMemoire)
router.delete('/mon-memoire', supprimerMemoire)

module.exports = router
