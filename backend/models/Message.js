const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Message = sequelize.define('Message', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  expediteur_id:{ type: DataTypes.INTEGER, allowNull: false },
  destinataire_id: { type: DataTypes.INTEGER, allowNull: false },
  contenu:          { type: DataTypes.TEXT, allowNull: true },   // texte (peut être null si pièce jointe seule)
  fichier_url:      { type: DataTypes.STRING(500), allowNull: true },  // pièce jointe (optionnel)
  fichier_nom:      { type: DataTypes.STRING(200), allowNull: true },  // nom original du fichier
  lu:               { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'messages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})

module.exports = Message
