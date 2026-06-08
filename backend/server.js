const express = require('express')
const cors    = require('cors')
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

app.use('/api/auth',         authRoutes)
app.use('/api/admin',        adminRoutes)
app.use('/api/ecoles',       ecoleRoutes)
app.use('/api/profil',       profilRoutes)
app.use('/api/structure',    structureRoutes)
app.use('/api/assignations', assignationRoutes)
app.use('/api/encadrant',    encadrantRoutes)
app.use('/api/stage',        stageRoutes)

app.get('/api/health', (req, res) =>
  res.json({ success: true, message: 'API opérationnelle', timestamp: new Date() })
)

app.use((req, res) =>
  res.status(404).json({ success: false, message: 'Route introuvable.' })
)
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ success: false, message: 'Erreur interne du serveur.' })
})

const PORT = process.env.PORT || 5000
sequelize.authenticate()
  .then(() => {
    console.log('✅ MySQL connecté.')
    return sequelize.sync({ alter: true })
  })
  .then(() => {
    console.log('✅ Tables synchronisées.')
    app.listen(PORT, () => console.log(`🚀 Serveur sur http://localhost:${PORT}`))
  })
  .catch(err => {
    console.error('❌ Impossible de démarrer:', err.message)
    process.exit(1)
  })
