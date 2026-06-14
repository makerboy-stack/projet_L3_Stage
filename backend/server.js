const express = require('express')
const cors    = require('cors')
const path    = require('path')
require('dotenv').config()

const { sequelize } = require('./models')
const authRoutes        = require('./routes/auth.routes')
const adminRoutes       = require('./routes/admin.routes')
const ecoleRoutes       = require('./routes/ecole.routes')
const profilRoutes      = require('./routes/profil.routes')
const structureRoutes   = require('./routes/structure.routes')
const assignationRoutes = require('./routes/assignation.routes')
const encadrantRoutes   = require('./routes/encadrant.routes')
const stageRoutes       = require('./routes/stage.routes')
const messageRoutes     = require('./routes/message.routes')

const app = express()

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
  ],
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Fichiers uploadés accessibles via http://localhost:5000/uploads/memoires/fichier.pdf
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/auth',         authRoutes)
app.use('/api/admin',        adminRoutes)
app.use('/api/ecoles',       ecoleRoutes)
app.use('/api/profil',       profilRoutes)
app.use('/api/structure',    structureRoutes)
app.use('/api/assignations', assignationRoutes)
app.use('/api/encadrant',    encadrantRoutes)
app.use('/api/stage',        stageRoutes)
app.use('/api/messages',     messageRoutes)

app.get('/api/health', (req, res) =>
  res.json({ success: true, message: 'API opérationnelle', timestamp: new Date() })
)

app.use((req, res) =>
  res.status(404).json({ success: false, message: 'Route introuvable.' })
)

// Gestionnaire d'erreurs global (multer + autres)
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'Fichier trop volumineux. Maximum 20 Mo.' })
  }
  if (err.message?.includes('Format non autorisé')) {
    return res.status(400).json({ success: false, message: err.message })
  }
  console.error(err.stack)
  res.status(500).json({ success: false, message: 'Erreur interne du serveur.' })
})

const PORT = process.env.PORT || 5000

sequelize.authenticate()
  .then(() => {
    console.log('✅ MySQL connecté.')
    // sync({ force: false, alter: false }) = ne crée rien, ne modifie rien
    // Les tables sont gérées directement par database.sql
    return sequelize.sync({ force: false, alter: false })
  })
  .then(() => {
    console.log('✅ Connexion BDD OK.')
    app.listen(PORT, () => console.log(`🚀 Serveur sur http://localhost:${PORT}`))
  })
  .catch(err => {
    console.error('❌ Impossible de démarrer:', err.message)
    process.exit(1)
  })
