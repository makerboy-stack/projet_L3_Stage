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

module.exports = { inscrireEtudiant, inscrirePersonnel, connexion, monProfil, deconnexion };
