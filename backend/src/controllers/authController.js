const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Kullanıcı kaydı
const register = async (req, res) => {
    try {
        console.log('Register isteği geldi:', req.body);
        const { adsoyad, email, password } = req.body;

        // Basit validasyon
        if (!adsoyad || !email || !password) {
            return res.status(400).json({ message: 'Tüm alanları doldurun' });
        }

        // Şifre hashleme
        const hashedPassword = await bcrypt.hash(password, 10);

        // Kullanıcı oluşturma
        const query = 'INSERT INTO users (adsoyad, email, password) VALUES ($1, $2, $3) RETURNING *';
        const values = [adsoyad, email, hashedPassword];
        
        console.log('SQL Query:', query);
        console.log('Values:', values);

        const result = await pool.query(query, values);
        console.log('Veritabanı sonucu:', result.rows[0]);

        res.status(201).json({
            message: 'Kayıt başarılı',
            user: {
                id: result.rows[0].id,
                adsoyad: result.rows[0].adsoyad,
                email: result.rows[0].email,
                profile_image: result.rows[0].profile_image
            }
        });
    } catch (error) {
        console.error('Kayıt hatası:', error);
        res.status(500).json({ message: 'Kayıt sırasında bir hata oluştu', error: error.message });
    }
};

// Kullanıcı girişi
const login = async (req, res) => {
    try {
        console.log('Login isteği geldi:', req.body);
        const { email, password } = req.body;

        // Basit validasyon
        if (!email || !password) {
            console.log('Validasyon hatası: email veya şifre eksik');
            return res.status(400).json({ message: 'Email ve şifre gerekli' });
        }

        // Kullanıcıyı bul
        const query = 'SELECT * FROM users WHERE email = $1';
        console.log('SQL Query:', query);
        console.log('Email:', email);
        
        const result = await pool.query(query, [email]);
        console.log('Veritabanı sonucu:', result.rows);

        if (result.rows.length === 0) {
            console.log('Kullanıcı bulunamadı');
            return res.status(401).json({ message: 'Geçersiz email veya şifre' });
        }

        // Şifre kontrolü
        console.log('Şifre kontrolü yapılıyor...');
        const validPassword = await bcrypt.compare(password, result.rows[0].password);
        console.log('Şifre doğru mu?', validPassword);

        if (!validPassword) {
            console.log('Şifre yanlış');
            return res.status(401).json({ message: 'Geçersiz email veya şifre' });
        }

        console.log('Giriş başarılı, kullanıcı bilgileri gönderiliyor');
        res.json({
            message: 'Giriş başarılı',
            user: {
                id: result.rows[0].id,
                adsoyad: result.rows[0].adsoyad,
                email: result.rows[0].email,
                profile_image: result.rows[0].profile_image
            }
        });
    } catch (error) {
        console.error('Giriş hatası:', error);
        res.status(500).json({ message: 'Giriş sırasında bir hata oluştu', error: error.message });
    }
};

// Profil güncelleme
const updateProfile = async (req, res) => {
    try {
        const { userId, adsoyad, email, currentPassword, newPassword, profile_image } = req.body;

        // Kullanıcıyı bul
        const userQuery = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [userId]
        );

        if (userQuery.rows.length === 0) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }

        const user = userQuery.rows[0];

        // Şifre değişikliği yapılıyorsa kontrol et
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: 'Mevcut şifre gerekli.' });
            }

            // Mevcut şifreyi kontrol et
            const isValidPassword = await bcrypt.compare(currentPassword, user.password);
            if (!isValidPassword) {
                return res.status(400).json({ message: 'Mevcut şifre yanlış.' });
            }

            // Yeni şifreyi hashle
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Kullanıcı bilgilerini güncelle (şifre dahil)
            await pool.query(
                'UPDATE users SET adsoyad = $1, email = $2, password = $3, profile_image = $4 WHERE id = $5',
                [adsoyad, email, hashedPassword, profile_image, userId]
            );
        } else {
            // Kullanıcı bilgilerini güncelle (şifre hariç)
            await pool.query(
                'UPDATE users SET adsoyad = $1, email = $2, profile_image = $3 WHERE id = $4',
                [adsoyad, email, profile_image, userId]
            );
        }

        // Güncellenmiş kullanıcı bilgilerini getir
        const updatedUserQuery = await pool.query(
            'SELECT id, adsoyad, email, profile_image FROM users WHERE id = $1',
            [userId]
        );

        res.json({
            message: 'Profil başarıyla güncellendi.',
            user: updatedUserQuery.rows[0]
        });
    } catch (error) {
        console.error('Profil güncelleme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası oluştu.' });
    }
};

module.exports = {
    register,
    login,
    updateProfile
}; 