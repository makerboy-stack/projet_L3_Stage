const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Stage = sequelize.define('Stage', {
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  etudiant_id:          { type: DataTypes.INTEGER, allowNull: false },
  a_stage:              { type: DataTypes.BOOLEAN, defaultValue: false },
  entreprise:           { type: DataTypes.STRING(200), allowNull: true },
  secteur:              { type: DataTypes.STRING(100), allowNull: true },
  sujet:                { type: DataTypes.TEXT, allowNull: true },
  lieu:                 { type: DataTypes.STRING(200), allowNull: true },
  date_debut:           { type: DataTypes.DATEONLY, allowNull: true },
  date_fin:             { type: DataTypes.DATEONLY, allowNull: true },
  statut:               { type: DataTypes.ENUM('en_cours','termine'), defaultValue: 'en_cours' },
  encadrant_entreprise: { type: DataTypes.STRING(150), allowNull: true },
}, {
  tableName: 'stages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})

module.exports = Stage
