const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Filiere = sequelize.define('Filiere', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  departement_id: { type: DataTypes.INTEGER, allowNull: false },
  nom:            { type: DataTypes.STRING(150), allowNull: false, validate: { notEmpty: true } },
  code:           { type: DataTypes.STRING(20), allowNull: true },
  niveaux:        { type: DataTypes.JSON, allowNull: true, defaultValue: ['L1','L2','L3','M1','M2'] },
  is_active:      { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'filieres',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})

module.exports = Filiere
