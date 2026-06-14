const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { User } = require('../models');
require('dotenv').config();

const genererToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// ─────────────────────────────────────────────────────────────
// INSCRIPTION ÉTUDIANT
// ─────────────────────────────────────────────────────────────
const inscrireEtudiant = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { nom, prenom, email, mot_de_passe, numero_etudiant, ecole_id, telephone } = req.body;

    const emailExiste = await User.findOne({ where: { email } });
    if (emailExiste) {
      return res.status(409).json({ success: false, message: 'Cet email est déjà utilisé.' });
    }

    if (numero_etudiant) {
      const numExiste = await User.findOne({ where: { numero_etudiant } });
      if (numExiste) {
        return res.status(409).json({ success: false, message: 'Ce numéro étudiant est déjà enregistré.' });
      }
    }

    const etudiant = await User.create({
      nom, prenom, email, mot_de_passe,
      role: 'etudiant',
      numero_etudiant,
      ecole_id: ecole_id || null,
      telephone,
    });

    const token = genererToken(etudiant.id);
    return res.status(201).json({
      success: true,
      message: 'Inscription réussie.',
      token,
      user: etudiant.toSafeJSON(),
    });
  } catch (error) {
    console.error('Erreur inscription étudiant:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur lors de l\'inscription.' });
  }
};

// ─────────────────────────────────────────────────────────────
// INSCRIPTION PERSONNEL (Encadrant ou Responsable Pédagogique)
// ─────────────────────────────────────────────────────────────
const inscrirePersonnel = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { nom, prenom, email, mot_de_passe, role, grade, specialite, telephone, ecole_id } = req.body;

    const rolesAutorises = ['encadrant', 'responsable_pedagogique'];
    if (!rolesAutorises.includes(role)) {
      return res.status(400).json({ success: false, message: 'Rôle invalide.' });
    }

    const emailExiste = await User.findOne({ where: { email } });
    if (emailExiste) {
      return res.status(409).json({ success: false, message: 'Cet email est déjà utilisé.' });
    }

    const personnel = await User.create({
      nom, prenom, email, mot_de_passe,
      role, grade, specialite, telephone,
      ecole_id: ecole_id || null,
    });

    const token = genererToken(personnel.id);
    return res.status(201).json({
      success: true,
      message: `Inscription réussie en tant que ${role === 'encadrant' ? 'Encadrant' : 'Responsable Pédagogique'}.`,
      token,
      user: personnel.toSafeJSON(),
    });
  } catch (error) {
    console.error('Erreur inscription personnel:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur lors de l\'inscription.' });
  }
};

// ─────────────────────────────────────────────────────────────
// CONNEXION (commune à tous les rôles)
// ─────────────────────────────────────────────────────────────
const connexion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, mot_de_passe } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Votre compte a été désactivé. Contactez l\'administration.' });
    }

    const motDePasseValide = await user.verifierMotDePasse(mot_de_passe);
    if (!motDePasseValide) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect.' });
    }

    const token = genererToken(user.id);
    return res.status(200).json({
      success: true,
      message: 'Connexion réussie.',
      token,
      user: user.toSafeJSON(),
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur lors de la connexion.' });
  }
};

// ─────────────────────────────────────────────────────────────
// PROFIL (utilisateur connecté)
// ─────────────────────────────────────────────────────────────
const monProfil = async (req, res) => {
  try {
    return res.status(200).json({ success: true, user: req.user.toSafeJSON() });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// ─────────────────────────────────────────────────────────────
// DÉCONNEXION
// ─────────────────────────────────────────────────────────────
const deconnexion = (req, res) => {
  return res.status(200).json({ success: true, message: 'Déconnexion réussie.' });
};

// ─────────────────────────────────────────────────────────────
// MOT DE PASSE OUBLIÉ — étape 1 : vérifier l'email
// ─────────────────────────────────────────────────────────────
const demanderResetMotDePasse = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ success: false, message: 'Email obligatoire.' })

    const user = await User.findOne({ where: { email } })
    // On répond toujours "ok" pour ne pas révéler si l'email existe
    if (!user) {
      return res.status(200).json({ success: true, message: 'Si cet email existe, un code a été généré.' })
    }

    // Générer un code à 6 chiffres valable 15 minutes
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiration = new Date(Date.now() + 15 * 60 * 1000)

    user.reset_code        = code
    user.reset_code_expiry = expiration
    await user.save()

    // En production → envoyer par email. Ici on le retourne pour le dev
    console.log(`🔑 Code reset pour ${email}: ${code}`)

    return res.status(200).json({
      success: true,
      message: 'Code de réinitialisation généré.',
      // En production : ne pas retourner le code ! Envoyer par email.
      // Pour le dev/démo, on le retourne pour pouvoir tester :
      code_dev: process.env.NODE_ENV === 'production' ? undefined : code,
    })
  } catch (error) {
    console.error('demanderResetMotDePasse:', error)
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

// ─────────────────────────────────────────────────────────────
// MOT DE PASSE OUBLIÉ — étape 2 : vérifier le code + nouveau mdp
// ─────────────────────────────────────────────────────────────
const reinitialiserMotDePasse = async (req, res) => {
  try {
    const { email, code, nouveau_mot_de_passe } = req.body
    if (!email || !code || !nouveau_mot_de_passe)
      return res.status(400).json({ success: false, message: 'Email, code et nouveau mot de passe obligatoires.' })
    if (nouveau_mot_de_passe.length < 6)
      return res.status(400).json({ success: false, message: 'Le mot de passe doit contenir au moins 6 caractères.' })

    const user = await User.findOne({ where: { email } })
    if (!user || !user.reset_code)
      return res.status(400).json({ success: false, message: 'Code invalide ou expiré.' })

    if (user.reset_code !== code)
      return res.status(400).json({ success: false, message: 'Code incorrect.' })

    if (new Date() > new Date(user.reset_code_expiry))
      return res.status(400).json({ success: false, message: 'Le code a expiré. Faites une nouvelle demande.' })

    user.mot_de_passe      = nouveau_mot_de_passe // bcrypt dans le hook beforeUpdate
    user.reset_code        = null
    user.reset_code_expiry = null
    await user.save()

    return res.status(200).json({ success: true, message: 'Mot de passe réinitialisé avec succès.' })
  } catch (error) {
    console.error('reinitialiserMotDePasse:', error)
    return res.status(500).json({ success: false, message: 'Erreur serveur.' })
  }
}

module.exports = { inscrireEtudiant, inscrirePersonnel, connexion, monProfil, deconnexion, demanderResetMotDePasse, reinitialiserMotDePasse };
