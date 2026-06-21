const express = require('express')
const router  = express.Router()
const multer  = require('multer')
const path    = require('path')
const fs      = require('fs')
const { getConversation, envoyerMessage, nonLus } = require('../controllers/message.controller')
const { verifierToken } = require('../middlewares/auth.middleware')

// Dossier pour les fichiers partagés dans les messages
const msgDir = path.join(__dirname, '..', 'uploads', 'messages')
if (!fs.existsSync(msgDir)) fs.mkdirSync(msgDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, msgDir),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `msg_${req.user.id}_${Date.now()}${ext}`)
  },
})

const fileFilter = (req, file, cb) => {
  // Accepter PDF, Word, images
  const ok = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg','image/png','image/gif',
  ]
  ok.includes(file.mimetype) ? cb(null, true) : cb(new Error('Format non autorisé.'), false)
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }) // 10 Mo

router.use(verifierToken)

router.get('/non-lus',           nonLus)
router.get('/:interlocuteur_id', getConversation)
router.post('/:destinataire_id', upload.single('fichier'), envoyerMessage)

module.exports = router
