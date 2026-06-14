const multer = require('multer')
const path   = require('path')
const fs     = require('fs')

// S'assurer que le dossier existe
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'memoires')
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR)
  },
  filename: (req, file, cb) => {
    // Nom unique : etudiant_{id}_{timestamp}.ext
    const ext = path.extname(file.originalname).toLowerCase()
    const nom = `etudiant_${req.user.id}_${Date.now()}${ext}`
    cb(null, nom)
  },
})

const fileFilter = (req, file, cb) => {
  const typesAutorises = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]
  if (typesAutorises.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Format non autorisé. Seuls PDF et Word (.doc, .docx) sont acceptés.'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 Mo max
})

module.exports = upload
