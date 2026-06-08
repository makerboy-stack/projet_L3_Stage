const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ecole = sequelize.define('Ecole', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nom: {
    type: DataTypes.STRING(200),
    allowNull: false,
    unique: true,
    validate: { notEmpty: true },
  },
  sigle: {
    type: DataTypes.STRING(20),
    allowNull: true, // ex: ESP, UCAD, EPT
  },
  ville: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  pays: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'Sénégal',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'ecoles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Ecole;
