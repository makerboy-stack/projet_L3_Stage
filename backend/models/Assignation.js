const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Assignation = sequelize.define('Assignation', {
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  etudiant_id:         { type: DataTypes.INTEGER, allowNull: false },
  encadrant_id:        { type: DataTypes.INTEGER, allowNull: false },
  rp_id:               { type: DataTypes.INTEGER, allowNull: true },
  annee_universitaire: { type: DataTypes.STRING(20), allowNull: true },
  statut:              { type: DataTypes.ENUM('active','terminee','annulee'), defaultValue: 'active' },
  note_rp:             { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'assignations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})

module.exports = Assignation
