const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const bcrypt = require('bcryptjs')

const User = sequelize.define('User', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nom:       { type: DataTypes.STRING(100), allowNull: false, validate: { notEmpty: true } },
  prenom:    { type: DataTypes.STRING(100), allowNull: false, validate: { notEmpty: true } },
  email:     { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
  mot_de_passe: { type: DataTypes.STRING(255), allowNull: false },

  role: {
    type: DataTypes.ENUM('etudiant', 'encadrant', 'responsable_pedagogique', 'admin'),
    allowNull: false,
  },

  // Clés étrangères
  ecole_id:         { type: DataTypes.INTEGER, allowNull: true },
  departement_id:   { type: DataTypes.INTEGER, allowNull: true }, // commun étudiant + encadrant

  // Champs étudiant
  numero_etudiant:     { type: DataTypes.STRING(20), allowNull: true, unique: true },
  filiere_id:          { type: DataTypes.INTEGER, allowNull: true },
  niveau:              { type: DataTypes.STRING(10), allowNull: true }, // ex: L3
  annee_universitaire: { type: DataTypes.STRING(20), allowNull: true }, // ex: 2024-2025

  // Champs enseignant
  grade:     { type: DataTypes.STRING(100), allowNull: true },
  specialite:{ type: DataTypes.STRING(150), allowNull: true },

  // Commun
  telephone:       { type: DataTypes.STRING(20), allowNull: true },
  profil_complet:  { type: DataTypes.BOOLEAN, defaultValue: false },
  is_active:       { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (u) => { if (u.mot_de_passe) u.mot_de_passe = await bcrypt.hash(u.mot_de_passe, 12) },
    beforeUpdate: async (u) => { if (u.changed('mot_de_passe')) u.mot_de_passe = await bcrypt.hash(u.mot_de_passe, 12) },
  },
})

User.prototype.verifierMotDePasse = async function (mdp) {
  return bcrypt.compare(mdp, this.mot_de_passe)
}

User.prototype.toSafeJSON = function () {
  const v = { ...this.get() }
  delete v.mot_de_passe
  return v
}

module.exports = User
