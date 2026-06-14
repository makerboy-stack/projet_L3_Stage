const express = require('express')
const router  = express.Router()
const { inscrireEtudiant, inscrirePersonnel, connexion, deconnexion, demanderResetMotDePasse, reinitialiserMotDePasse } = require('../controllers/auth.controller')
const { verifierToken } = require('../middlewares/auth.middleware')
const { validerInscriptionEtudiant, validerInscriptionPersonnel, validerConnexion } = require('../validators/auth.validator')

router.post('/inscription/etudiant',  validerInscriptionEtudiant,  inscrireEtudiant)
router.post('/inscription/personnel', validerInscriptionPersonnel, inscrirePersonnel)
router.post('/connexion', validerConnexion, connexion)
router.post('/deconnexion', verifierToken, deconnexion)

// Mot de passe oublié
router.post('/mot-de-passe-oublie',  demanderResetMotDePasse)
router.post('/reinitialiser-mot-de-passe', reinitialiserMotDePasse)

// GET /api/auth/profil — retourne le profil complet avec associations
router.get('/profil', verifierToken, async (req, res) => {
  try {
    const { User, Ecole, Departement, Filiere, Assignation, Stage, Memoire } = require('../models')
    const include = [
      { model: Ecole,       as: 'ecoleInfo',       attributes: ['id','nom','sigle'] },
      { model: Departement, as: 'departementInfo', attributes: ['id','nom','code'] },
    ]
    if (req.user.role === 'etudiant') {
      include.push({ model: Filiere, as: 'filiereInfo', attributes: ['id','nom','code','niveaux'] })
      include.push({
        model: Assignation, as: 'assignation', required: false,
        include: [{ model: User, as: 'encadrant', attributes: ['id','nom','prenom','email','grade','specialite','telephone'] }],
      })
      include.push({ model: Stage,   as: 'stage',   required: false })
      include.push({ model: Memoire, as: 'memoire', required: false })
    }
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['mot_de_passe'] }, include })
    return res.status(200).json({ success: true, data: user })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
})

module.exports = router
