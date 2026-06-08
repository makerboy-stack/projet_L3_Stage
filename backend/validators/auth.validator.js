const { body } = require('express-validator');

// Validation inscription étudiant
const validerInscriptionEtudiant = [
  body('nom').trim().notEmpty().withMessage('Le nom est obligatoire.')
    .isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères.'),
  body('prenom').trim().notEmpty().withMessage('Le prénom est obligatoire.')
    .isLength({ min: 2 }).withMessage('Le prénom doit contenir au moins 2 caractères.'),
  body('email').trim().notEmpty().withMessage('L\'email est obligatoire.')
    .isEmail().withMessage('Format d\'email invalide.'),
  body('mot_de_passe').notEmpty().withMessage('Le mot de passe est obligatoire.')
    .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères.'),
  body('numero_etudiant').optional().trim().notEmpty().withMessage('Le numéro étudiant ne peut pas être vide.'),
  body('ecole_id').optional().isInt({ min: 1 }).withMessage('Identifiant d\'école invalide.'),
];

// Validation inscription personnel
const validerInscriptionPersonnel = [
  body('nom').trim().notEmpty().withMessage('Le nom est obligatoire.')
    .isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères.'),
  body('prenom').trim().notEmpty().withMessage('Le prénom est obligatoire.')
    .isLength({ min: 2 }).withMessage('Le prénom doit contenir au moins 2 caractères.'),
  body('email').trim().notEmpty().withMessage('L\'email est obligatoire.')
    .isEmail().withMessage('Format d\'email invalide.'),
  body('mot_de_passe').notEmpty().withMessage('Le mot de passe est obligatoire.')
    .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères.'),
  body('role').notEmpty().withMessage('Le rôle est obligatoire.')
    .isIn(['encadrant', 'responsable_pedagogique']).withMessage('Rôle invalide.'),
  body('grade').optional().trim().notEmpty().withMessage('Le grade ne peut pas être vide.'),
  body('specialite').optional().trim().notEmpty().withMessage('La spécialité ne peut pas être vide.'),
  body('ecole_id').optional().isInt({ min: 1 }).withMessage('Identifiant d\'école invalide.'),
];

// Validation connexion
const validerConnexion = [
  body('email').trim().notEmpty().withMessage('L\'email est obligatoire.')
    .isEmail().withMessage('Format d\'email invalide.'),
  body('mot_de_passe').notEmpty().withMessage('Le mot de passe est obligatoire.'),
];

module.exports = { validerInscriptionEtudiant, validerInscriptionPersonnel, validerConnexion };
