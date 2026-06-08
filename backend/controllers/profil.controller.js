const { User, Ecole, Departement, Filiere, Assignation, Stage, Memoire } = require('../models')

// GET /api/profil/moi — profil complet avec associations
const monProfilComplet = async (req, res) => {
  try {
    const include = [
      { model: Ecole,       as: 'ecoleInfo',       attributes: ['id','nom','sigle'] },
      { model: Departement, as: 'departementInfo', attributes: ['id','nom','code'] },
    ]
    if (req.user.role === 'etudiant') {
      include.push({ model: Filiere, as: 'filiereInfo', attributes: ['id','nom','code','niveaux'] })
      include.push({
        model: Assignation, as: 'assignation', required: false,
        include: [{
          model: User, as: 'encadrant',
          attributes: ['id','nom','prenom','email','grade','specialite','telephone'],
        }],
      })
      include.push({ model: Stage,   as: 'stage',   required: false })
      include.push({ model: Memoire, as: 'memoire', required: false })
    }
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['mot_de_passe'] },
      include,
    })
    return res.status(200).json({ success: true, data: user })
  } catch (err) {
    console.error('monProfilComplet:', err)
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

// PATCH /api/profil/moi — compléter profil après inscription
const mettreAJourProfil = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    const champs = ['departement_id','filiere_id','niveau','annee_universitaire','grade','specialite','telephone']
    champs.forEach(c => { if (req.body[c] !== undefined) user[c] = req.body[c] })

    // Calculer si profil complet
    if (user.role === 'etudiant') {
      user.profil_complet = !!(user.departement_id && user.filiere_id && user.niveau && user.annee_universitaire)
    } else {
      user.profil_complet = !!(user.grade && user.departement_id)
    }
    await user.save()
    return res.status(200).json({ success: true, message: 'Profil mis à jour.', data: user.toSafeJSON() })
  } catch (err) {
    console.error('mettreAJourProfil:', err)
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

module.exports = { monProfilComplet, mettreAJourProfil }
