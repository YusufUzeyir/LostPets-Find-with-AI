const express = require('express');
const cors = require('cors');
const aiRoutes = require('./routes/ai');

const app = express();

// CORS ayarları
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static('uploads'));

// AI route'unu ekle
app.use('/api/ai', aiRoutes);

// Diğer route'lar...

// Port ayarı
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
});

module.exports = app; 