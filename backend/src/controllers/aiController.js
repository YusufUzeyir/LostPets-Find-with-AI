const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const AI_SERVICE_URL = 'http://localhost:5001/predict';

const classifyImage = async (req, res) => {
    console.log('AI sınıflandırma isteği alındı');
    
    try {
        // Dosya kontrolü
        if (!req.file) {
            console.log('Hata: Dosya yüklenmedi');
            return res.status(400).json({ error: 'Resim yüklenmedi' });
        }

        console.log('Yüklenen dosya bilgileri:', {
            filename: req.file.originalname,
            size: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`,
            mimetype: req.file.mimetype
        });

        // Dosya tipi kontrolü
        if (!req.file.mimetype.startsWith('image/')) {
            console.log('Hata: Geçersiz dosya tipi -', req.file.mimetype);
            return res.status(400).json({ error: 'Sadece resim dosyaları yüklenebilir' });
        }
        
        // Dosya boyutu kontrolü
        const fileSize = req.file.size / (1024 * 1024); // MB cinsinden
        if (fileSize > 10) {
            console.log('Hata: Dosya boyutu çok büyük -', fileSize.toFixed(2), 'MB');
            return res.status(400).json({ error: 'Dosya boyutu çok büyük (max: 10MB)' });
        }

        // FormData oluşturma
        console.log('FormData hazırlanıyor...');
        const formData = new FormData();
        formData.append('image', fs.createReadStream(req.file.path));

        // AI servisine istek
        console.log('AI servisine istek gönderiliyor:', AI_SERVICE_URL);
        const response = await axios.post(AI_SERVICE_URL, formData, {
            headers: {
                ...formData.getHeaders()
            },
            timeout: 30000, // 30 saniye timeout
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        console.log('AI servisi yanıtı alındı:', response.data);

        // Yanıt kontrolü
        if (!response.data || !response.data.class || !response.data.subclass) {
            console.log('Hata: Geçersiz AI servisi yanıtı -', response.data);
            throw new Error('AI servisi geçersiz yanıt döndü');
        }

        // Frontend için yanıtı hazırla
        const result = {
            message: `Hayvan türü: ${response.data.class}, Cinsi: ${response.data.subclass}`,
            confidence: response.data.confidence,
            subclass_confidence: response.data.subclass_confidence,
            all_predictions: response.data.all_predictions || []
        };

        console.log('Frontend\'e gönderilen yanıt:', result);
        res.json(result);

    } catch (error) {
        console.error('AI servisi hatası:', {
            message: error.message,
            code: error.code,
            response: error.response?.data
        });

        let errorMessage = 'Hayvan türü ve cinsi tespit edilemedi';
        
        if (error.code === 'ECONNREFUSED') {
            errorMessage = 'AI servisi şu anda çalışmıyor, lütfen daha sonra tekrar deneyin';
            console.error('AI servisine bağlanılamadı');
        } else if (error.response) {
            errorMessage = error.response.data.error || errorMessage;
            console.error('AI servisi hata detayı:', error.response.data);
        }

        res.status(500).json({ 
            error: errorMessage,
            details: error.message
        });
    } finally {
        // Geçici dosyayı temizle
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (err) => {
                if (err) {
                    console.error('Geçici dosya silinirken hata:', err);
                } else {
                    console.log('Geçici dosya silindi:', req.file.path);
                }
            });
        }
    }
};

module.exports = {
    classifyImage
}; 