const crypto = require('crypto');
const pool = require('../config/db');

const ENCRYPTION_KEY = process.env.MESSAGE_ENCRYPTION_KEY;
const IV_LENGTH = 16;

const encryptMessage = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = Buffer.from(ENCRYPTION_KEY, 'utf8').slice(0, 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

const decryptMessage = (text) => {
  const [ivHex, encryptedHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const key = Buffer.from(ENCRYPTION_KEY, 'utf8').slice(0, 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

const sendMessage = async (req, res) => {
  const { sender_email, receiver_email, message } = req.body;

  try {
    // Önce alıcı ve gönderici emaillerinin geçerli olduğunu kontrol et
    const userCheck = await pool.query(
      'SELECT email FROM users WHERE email IN ($1, $2)',
      [sender_email, receiver_email]
    );

    if (userCheck.rows.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz alıcı veya gönderici email adresi'
      });
    }

    const encryptedMessage = encryptMessage(message);
    const result = await pool.query(
      'INSERT INTO messages (sender_email, receiver_email, message) VALUES ($1, $2, $3) RETURNING *',
      [sender_email, receiver_email, encryptedMessage]
    );

    res.json({
      success: true,
      message: 'Mesaj başarıyla gönderildi',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Mesaj gönderme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Mesaj gönderilirken bir hata oluştu'
    });
  }
};

const getUserMessages = async (req, res) => {
  const { email } = req.params;

  try {
    const result = await pool.query(
      `SELECT m.*, 
        u1.adsoyad as sender_name, 
        u2.adsoyad as receiver_name 
      FROM messages m 
      JOIN users u1 ON m.sender_email = u1.email 
      JOIN users u2 ON m.receiver_email = u2.email 
      WHERE m.sender_email = $1 OR m.receiver_email = $1 
      ORDER BY m.created_at DESC`,
      [email]
    );

    // Mesajları çöz
    const decryptedMessages = result.rows.map(msg => ({
      ...msg,
      message: decryptMessage(msg.message)
    }));

    res.json(decryptedMessages);
  } catch (error) {
    console.error('Mesajları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Mesajlar getirilirken bir hata oluştu'
    });
  }
};

const getUnreadCount = async (req, res) => {
  const { email } = req.params;

  try {
    const result = await pool.query(
      'SELECT COUNT(*) FROM messages WHERE receiver_email = $1 AND is_read = false',
      [email]
    );

    res.json({
      success: true,
      unread_count: parseInt(result.rows[0].count)
    });
  } catch (error) {
    console.error('Okunmamış mesaj sayısı alma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Okunmamış mesaj sayısı alınırken bir hata oluştu'
    });
  }
};

const markAsRead = async (req, res) => {
  const { messageId } = req.params;

  try {
    await pool.query(
      'UPDATE messages SET is_read = true WHERE id = $1',
      [messageId]
    );

    res.json({
      success: true,
      message: 'Mesaj okundu olarak işaretlendi'
    });
  } catch (error) {
    console.error('Mesaj işaretleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Mesaj okundu olarak işaretlenirken bir hata oluştu'
    });
  }
};

const deleteConversation = async (req, res) => {
  const { userEmail, otherEmail } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM messages WHERE (sender_email = $1 AND receiver_email = $2) OR (sender_email = $2 AND receiver_email = $1)',
      [userEmail, otherEmail]
    );

    res.status(200).json({ message: 'Mesajlar başarıyla silindi.' });
  } catch (error) {
    console.error('Mesajlar silinirken hata:', error);
    res.status(500).json({ error: 'Mesajlar silinirken bir hata oluştu.' });
  }
};

module.exports = {
  sendMessage,
  getUserMessages,
  getUnreadCount,
  markAsRead,
  deleteConversation
}; 