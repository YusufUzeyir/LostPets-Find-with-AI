const express = require('express');
const router = express.Router();
const { register, login, updateProfile } = require('../controllers/authController');

// Kayıt rotası
router.post('/register', register);

// Giriş rotası
router.post('/login', login);

// Profil güncelleme rotası
router.put('/update-profile', updateProfile);

module.exports = router; 