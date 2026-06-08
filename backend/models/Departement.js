const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Departement = sequelize.define('Departement', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ecole_id:  { type: DataTypes.INTEGER, allowNull: false },
  nom:       { type: DataTypes.STRING(150), allowNull: false, validate: { notEmpty: true } },
  code:      { type: DataTypes.STRING(20), allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'departements',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})

module.exports = Departement
