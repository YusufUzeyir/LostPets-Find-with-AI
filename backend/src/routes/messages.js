const express = require('express');
const router = express.Router();
const { sendMessage, getUserMessages, getUnreadCount, markAsRead, deleteConversation } = require('../controllers/messageController');

// Mesaj gönder
router.post('/send', sendMessage);

// Kullanıcının mesajlarını getir
router.get('/user/:email', getUserMessages);

// Okunmamış mesaj sayısını getir
router.get('/unread/:email', getUnreadCount);

// Mesajları okundu olarak işaretle
router.put('/mark-read/:messageId', markAsRead);

// İki kullanıcı arasındaki tüm mesajları sil
router.delete('/conversation/:userEmail/:otherEmail', deleteConversation);

module.exports = router; 