const { Ecole } = require('../models');

// ── PUBLIC : lister les écoles actives (utilisé par les formulaires d'inscription) ──
const listerEcolesPublic = async (req, res) => {
  try {
    const ecoles = await Ecole.findAll({
      where: { is_active: true },
      attributes: ['id', 'nom', 'sigle', 'ville'],
      order: [['nom', 'ASC']],
    });
    return res.status(200).json({ success: true, data: ecoles });
  } catch (error) {
    console.error('Erreur listerEcolesPublic:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// ── ADMIN : lister toutes les écoles (actives + inactives) ──
const listerEcolesAdmin = async (req, res) => {
  try {
    const ecoles = await Ecole.findAll({ order: [['nom', 'ASC']] });
    return res.status(200).json({ success: true, data: ecoles });
  } catch (error) {
    console.error('Erreur listerEcolesAdmin:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// ── ADMIN : créer une école ──
const creerEcole = async (req, res) => {
  try {
    const { nom, sigle, ville, pays, description } = req.body;

    if (!nom || !nom.trim()) {
      return res.status(400).json({ success: false, message: 'Le nom de l\'école est obligatoire.' });
    }

    const existante = await Ecole.findOne({ where: { nom: nom.trim() } });
    if (existante) {
      return res.status(409).json({ success: false, message: 'Une école avec ce nom existe déjà.' });
    }

    const ecole = await Ecole.create({ nom: nom.trim(), sigle, ville, pays, description });
    return res.status(201).json({ success: true, message: 'École créée.', data: ecole });
  } catch (error) {
    console.error('Erreur creerEcole:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// ── ADMIN : modifier une école ──
const modifierEcole = async (req, res) => {
  try {
    const { id } = req.params;
    const ecole = await Ecole.findByPk(id);
    if (!ecole) return res.status(404).json({ success: false, message: 'École introuvable.' });

    const { nom, sigle, ville, pays, description, is_active } = req.body;
    if (nom !== undefined) ecole.nom = nom.trim();
    if (sigle !== undefined) ecole.sigle = sigle;
    if (ville !== undefined) ecole.ville = ville;
    if (pays !== undefined) ecole.pays = pays;
    if (description !== undefined) ecole.description = description;
    if (is_active !== undefined) ecole.is_active = is_active;

    await ecole.save();
    return res.status(200).json({ success: true, message: 'École mise à jour.', data: ecole });
  } catch (error) {
    console.error('Erreur modifierEcole:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// ── ADMIN : supprimer une école ──
const supprimerEcole = async (req, res) => {
  try {
    const { id } = req.params;
    const ecole = await Ecole.findByPk(id);
    if (!ecole) return res.status(404).json({ success: false, message: 'École introuvable.' });

    await ecole.destroy();
    return res.status(200).json({ success: true, message: 'École supprimée.' });
  } catch (error) {
    console.error('Erreur supprimerEcole:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

module.exports = {
  listerEcolesPublic,
  listerEcolesAdmin,
  creerEcole,
  modifierEcole,
  supprimerEcole,
};
