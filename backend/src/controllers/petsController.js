const pool = require('../config/db');

// Kayıp hayvanları getir
const getLostPets = async (req, res) => {
    try {
        const query = `
            SELECT 
                lp.*,
                u.adsoyad,
                u.email,
                t.tur_name,
                b.cins_name,
                c.name as sehir,
                d.name as ilce
            FROM lost_pets lp
            JOIN users u ON lp.email = u.email
            JOIN tur t ON lp.tur = t.id
            JOIN cins b ON lp.cins = b.id
            JOIN cities c ON lp.city_id = c.id
            JOIN districts d ON lp.district_id = d.id
            WHERE lp.active = true
            ORDER BY lp.created_at DESC
        `;
        const result = await pool.query(query);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Kayıp hayvanları getirme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası oluştu.' });
    }
};

// Bulunan hayvanları getir
const getFoundPets = async (req, res) => {
    try {
        const query = `
            SELECT 
                fp.*,
                u.adsoyad,
                u.email,
                t.tur_name,
                b.cins_name,
                c.name as sehir,
                d.name as ilce
            FROM found_pets fp
            JOIN users u ON fp.email = u.email
            JOIN tur t ON fp.tur = t.id
            JOIN cins b ON fp.cins = b.id
            JOIN cities c ON fp.city_id = c.id
            JOIN districts d ON fp.district_id = d.id
            WHERE fp.active = true
            ORDER BY fp.created_at DESC
        `;
        const result = await pool.query(query);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Bulunan hayvanları getirme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası oluştu.' });
    }
};

// Kayıp hayvan ilanı ekle
const addLostPet = async (req, res) => {
    try {
        const { email, tur, cins, cinsiyet, sehir, ilce, kaybolma_tarihi, lost_image, description } = req.body;
        
        const query = `
            INSERT INTO lost_pets (email, tur, cins, cinsiyet, city_id, district_id, kaybolma_tarihi, lost_image, description, active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
            RETURNING *
        `;
        const values = [email, tur, cins, cinsiyet, sehir, ilce, kaybolma_tarihi, lost_image, description];
        
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Kayıp hayvan ilanı ekleme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası oluştu.' });
    }
};

// Bulunan hayvan ilanı ekle
const addFoundPet = async (req, res) => {
    try {
        const { email, tur, cins, cinsiyet, sehir, ilce, found_image, description } = req.body;
        
        const query = `
            INSERT INTO found_pets (email, tur, cins, cinsiyet, city_id, district_id, found_image, description, active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
            RETURNING *
        `;
        const values = [email, tur, cins, cinsiyet, sehir, ilce, found_image, description];
        
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Bulunan hayvan ilanı ekleme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası oluştu.' });
    }
};

// Tüm türleri getir
const getAllTypes = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tur ORDER BY tur_name');
        res.json(result.rows);
    } catch (error) {
        console.error('Türler getirilirken hata:', error);
        res.status(500).json({ error: 'Türler getirilirken bir hata oluştu' });
    }
};

// Belirli bir türe ait cinsleri getir
const getBreedsByType = async (req, res) => {
    const { turId } = req.params;
    try {
        const result = await pool.query('SELECT * FROM cins WHERE tur_id = $1 ORDER BY cins_name', [turId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Cinsler getirilirken hata:', error);
        res.status(500).json({ error: 'Cinsler getirilirken bir hata oluştu' });
    }
};

// Tüm şehirleri getir
const getAllCities = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM cities ORDER BY name');
        res.json(result.rows);
    } catch (error) {
        console.error('Şehirler getirilirken hata:', error);
        res.status(500).json({ error: 'Şehirler getirilirken bir hata oluştu' });
    }
};

// Belirli bir şehre ait ilçeleri getir
const getDistrictsByCity = async (req, res) => {
    const { cityId } = req.params;
    try {
        const result = await pool.query('SELECT * FROM districts WHERE city_id = $1 ORDER BY name', [cityId]);
        res.json(result.rows);
    } catch (error) {
        console.error('İlçeler getirilirken hata:', error);
        res.status(500).json({ error: 'İlçeler getirilirken bir hata oluştu' });
    }
};

// Kayıp hayvan detayını getir
const getLostPetDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT 
                lp.*,
                u.adsoyad,
                u.email,
                t.tur_name,
                b.cins_name,
                c.name as sehir,
                d.name as ilce
            FROM lost_pets lp
            JOIN users u ON lp.email = u.email
            JOIN tur t ON lp.tur = t.id
            JOIN cins b ON lp.cins = b.id
            JOIN cities c ON lp.city_id = c.id
            JOIN districts d ON lp.district_id = d.id
            WHERE lp.id = $1
        `;
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'İlan bulunamadı.' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Kayıp hayvan detayı getirme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası oluştu.' });
    }
};

// Bulunan hayvan detayını getir
const getFoundPetDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT 
                fp.*,
                u.adsoyad,
                u.email,
                t.tur_name,
                b.cins_name,
                c.name as sehir,
                d.name as ilce
            FROM found_pets fp
            JOIN users u ON fp.email = u.email
            JOIN tur t ON fp.tur = t.id
            JOIN cins b ON fp.cins = b.id
            JOIN cities c ON fp.city_id = c.id
            JOIN districts d ON fp.district_id = d.id
            WHERE fp.id = $1
        `;
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'İlan bulunamadı.' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Bulunan hayvan detayı getirme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası oluştu.' });
    }
};

// Kayıp hayvan ilanını sil
const deleteLostPet = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'DELETE FROM lost_pets WHERE id = $1 RETURNING *';
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'İlan bulunamadı.' });
        }

        res.json({ message: 'İlan başarıyla silindi.' });
    } catch (error) {
        console.error('Kayıp hayvan ilanı silme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası oluştu.' });
    }
};

// Bulunan hayvan ilanını sil
const deleteFoundPet = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'DELETE FROM found_pets WHERE id = $1 RETURNING *';
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'İlan bulunamadı.' });
        }

        res.json({ message: 'İlan başarıyla silindi.' });
    } catch (error) {
        console.error('Bulunan hayvan ilanı silme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası oluştu.' });
    }
};

// Kayıp hayvan ilanını güncelle
const updateLostPet = async (req, res) => {
    try {
        const { id } = req.params;
        const { tur, cins, cinsiyet, sehir, ilce, kaybolma_tarihi, description } = req.body;

        const query = `
            UPDATE lost_pets 
            SET tur = $1, cins = $2, cinsiyet = $3, city_id = $4, district_id = $5, 
                kaybolma_tarihi = $6, description = $7
            WHERE id = $8
            RETURNING *
        `;
        const values = [tur, cins, cinsiyet, sehir, ilce, kaybolma_tarihi, description, id];
        
        const result = await pool.query(query, values);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'İlan bulunamadı.' });
        }

        res.json({
            message: 'İlan başarıyla güncellendi',
            pet: result.rows[0]
        });
    } catch (error) {
        console.error('Kayıp hayvan ilanı güncelleme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası oluştu.' });
    }
};

// Bulunan hayvan ilanını güncelle
const updateFoundPet = async (req, res) => {
    try {
        const { id } = req.params;
        const { tur, cins, cinsiyet, sehir, ilce, description } = req.body;

        const query = `
            UPDATE found_pets 
            SET tur = $1, cins = $2, cinsiyet = $3, city_id = $4, district_id = $5, 
                description = $6
            WHERE id = $7
            RETURNING *
        `;
        const values = [tur, cins, cinsiyet, sehir, ilce, description, id];
        
        const result = await pool.query(query, values);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'İlan bulunamadı.' });
        }

        res.json({
            message: 'İlan başarıyla güncellendi',
            pet: result.rows[0]
        });
    } catch (error) {
        console.error('Bulunan hayvan ilanı güncelleme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası oluştu.' });
    }
};

// Kayıp hayvan ilanını aktif/pasif yap
const toggleLostPetActive = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            UPDATE lost_pets 
            SET active = NOT active 
            WHERE id = $1 
            RETURNING *
        `;
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'İlan bulunamadı.' });
        }

        res.json({
            message: `İlan ${result.rows[0].active ? 'aktif' : 'pasif'} duruma getirildi.`,
            pet: result.rows[0]
        });
    } catch (error) {
        console.error('İlan durumu güncelleme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası oluştu.' });
    }
};

// Bulunan hayvan ilanını aktif/pasif yap
const toggleFoundPetActive = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            UPDATE found_pets 
            SET active = NOT active 
            WHERE id = $1 
            RETURNING *
        `;
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'İlan bulunamadı.' });
        }

        res.json({
            message: `İlan ${result.rows[0].active ? 'aktif' : 'pasif'} duruma getirildi.`,
            pet: result.rows[0]
        });
    } catch (error) {
        console.error('İlan durumu güncelleme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası oluştu.' });
    }
};

// Kullanıcının kayıp ilanlarını getir
const getUserLostPets = async (req, res) => {
    try {
        const { email } = req.params;
        const query = `
            SELECT 
                lp.*,
                u.adsoyad,
                u.email,
                t.tur_name,
                b.cins_name,
                c.name as sehir,
                d.name as ilce
            FROM lost_pets lp
            JOIN users u ON lp.email = u.email
            JOIN tur t ON lp.tur = t.id
            JOIN cins b ON lp.cins = b.id
            JOIN cities c ON lp.city_id = c.id
            JOIN districts d ON lp.district_id = d.id
            WHERE lp.email = $1
            ORDER BY lp.created_at DESC
        `;
        const result = await pool.query(query, [email]);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Kullanıcının kayıp ilanlarını getirme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası oluştu.' });
    }
};

// Kullanıcının buldum ilanlarını getir
const getUserFoundPets = async (req, res) => {
    try {
        const { email } = req.params;
        const query = `
            SELECT 
                fp.*,
                u.adsoyad,
                u.email,
                t.tur_name,
                b.cins_name,
                c.name as sehir,
                d.name as ilce
            FROM found_pets fp
            JOIN users u ON fp.email = u.email
            JOIN tur t ON fp.tur = t.id
            JOIN cins b ON fp.cins = b.id
            JOIN cities c ON fp.city_id = c.id
            JOIN districts d ON fp.district_id = d.id
            WHERE fp.email = $1
            ORDER BY fp.created_at DESC
        `;
        const result = await pool.query(query, [email]);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Kullanıcının buldum ilanlarını getirme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası oluştu.' });
    }
};

module.exports = {
    getLostPets,
    getFoundPets,
    addLostPet,
    addFoundPet,
    getAllTypes,
    getBreedsByType,
    getAllCities,
    getDistrictsByCity,
    getLostPetDetail,
    getFoundPetDetail,
    deleteLostPet,
    deleteFoundPet,
    updateLostPet,
    updateFoundPet,
    toggleLostPetActive,
    toggleFoundPetActive,
    getUserLostPets,
    getUserFoundPets
}; 