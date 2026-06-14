const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Memoire = sequelize.define('Memoire', {
  id:                    { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  etudiant_id:           { type: DataTypes.INTEGER, allowNull: false },
  titre:                 { type: DataTypes.STRING(300), allowNull: true },
  fichier_url:           { type: DataTypes.STRING(1000), allowNull: true }, // URL ou lien externe
  type_depot:            { type: DataTypes.ENUM('fichier','lien'), allowNull: true }, // 'fichier' ou 'lien'
  date_depot:            { type: DataTypes.DATE, allowNull: true },
  statut:                { type: DataTypes.ENUM('non_soumis','soumis','valide','rejete'), defaultValue: 'non_soumis' },
  commentaire_encadrant: { type: DataTypes.TEXT, allowNull: true },
  aptitude:              { type: DataTypes.ENUM('en_attente','apte','non_apte'), defaultValue: 'en_attente' },
  motif_refus:           { type: DataTypes.TEXT, allowNull: true },
  date_decision:         { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'memoires',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})

module.exports = Memoire
