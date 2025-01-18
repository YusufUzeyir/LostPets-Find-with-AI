const express = require('express');
const router = express.Router();
const multer = require('multer');
const { classifyImage } = require('../controllers/aiController');

// Multer yapılandırması
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Resim sınıflandırma endpoint'i
router.post('/classify', upload.single('image'), classifyImage);

module.exports = router; 