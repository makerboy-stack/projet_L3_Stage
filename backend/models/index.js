const sequelize   = require('../config/database')
const User        = require('./User')
const Ecole       = require('./Ecole')
const Departement = require('./Departement')
const Filiere     = require('./Filiere')
const Assignation = require('./Assignation')
const Stage       = require('./Stage')
const Memoire     = require('./Memoire')
const Message     = require('./Message')

// ── Ecole → Departement ──
Ecole.hasMany(Departement,   { foreignKey: 'ecole_id',       as: 'departements' })
Departement.belongsTo(Ecole, { foreignKey: 'ecole_id',       as: 'ecole' })

// ── Departement → Filiere ──
Departement.hasMany(Filiere,   { foreignKey: 'departement_id', as: 'filieres' })
Filiere.belongsTo(Departement, { foreignKey: 'departement_id', as: 'departement' })

// ── User → Ecole ──
User.belongsTo(Ecole, { foreignKey: 'ecole_id', as: 'ecoleInfo' })
Ecole.hasMany(User,   { foreignKey: 'ecole_id', as: 'utilisateurs' })

// ── User → Departement ──
User.belongsTo(Departement, { foreignKey: 'departement_id', as: 'departementInfo' })
Departement.hasMany(User,   { foreignKey: 'departement_id', as: 'membres' })

// ── User → Filiere ──
User.belongsTo(Filiere, { foreignKey: 'filiere_id', as: 'filiereInfo' })
Filiere.hasMany(User,   { foreignKey: 'filiere_id', as: 'etudiants' })

// ── Assignation ──
Assignation.belongsTo(User, { foreignKey: 'etudiant_id',  as: 'etudiant' })
Assignation.belongsTo(User, { foreignKey: 'encadrant_id', as: 'encadrant' })
Assignation.belongsTo(User, { foreignKey: 'rp_id',        as: 'rp' })
User.hasOne(Assignation,    { foreignKey: 'etudiant_id',  as: 'assignation' })
User.hasMany(Assignation,   { foreignKey: 'encadrant_id', as: 'assignationsEncadrant' })

// ── Stage ──
Stage.belongsTo(User, { foreignKey: 'etudiant_id', as: 'etudiant' })
User.hasOne(Stage,    { foreignKey: 'etudiant_id', as: 'stage' })

// ── Memoire ──
Memoire.belongsTo(User, { foreignKey: 'etudiant_id', as: 'etudiant' })
User.hasOne(Memoire,    { foreignKey: 'etudiant_id', as: 'memoire' })

// ── Message ──
Message.belongsTo(User, { foreignKey: 'expediteur_id',   as: 'expediteur' })
Message.belongsTo(User, { foreignKey: 'destinataire_id', as: 'destinataire' })
User.hasMany(Message,   { foreignKey: 'expediteur_id',   as: 'messagesEnvoyes' })
User.hasMany(Message,   { foreignKey: 'destinataire_id', as: 'messagesRecus' })

module.exports = { sequelize, User, Ecole, Departement, Filiere, Assignation, Stage, Memoire, Message }
