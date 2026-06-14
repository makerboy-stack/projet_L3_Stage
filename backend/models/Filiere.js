const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Filiere = sequelize.define('Filiere', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  departement_id: { type: DataTypes.INTEGER, allowNull: false },
  nom:            { type: DataTypes.STRING(150), allowNull: false, validate: { notEmpty: true } },
  code:           { type: DataTypes.STRING(20), allowNull: true },
  niveaux: {
    type: DataTypes.TEXT,  // TEXT au lieu de JSON pour compatibilité MySQL 5.x
    allowNull: true,
    defaultValue: '["L1","L2","L3","M1","M2"]',
    get() {
      const val = this.getDataValue('niveaux')
      if (!val) return ['L1','L2','L3','M1','M2']
      if (Array.isArray(val)) return val
      try { return JSON.parse(val) } catch { return ['L1','L2','L3','M1','M2'] }
    },
    set(val) {
      this.setDataValue('niveaux', Array.isArray(val) ? JSON.stringify(val) : val)
    },
  },
  is_active:      { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'filieres',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})

module.exports = Filiere
