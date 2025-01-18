const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const petsRoutes = require('./routes/pets');
const messageRoutes = require('./routes/messages');
const aiRoutes = require('./routes/ai');

const app = express();

// CORS ayarları
app.use(cors({
    origin: 'http://localhost:3000', // Frontend'in adresi
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Uploads klasörü için static middleware
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Request logger middleware
app.use((req, res, next) => {
    console.log('------------------------');
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    if (req.file) {
        console.log('File:', {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });
    }
    if (!req.file && req.body) console.log('Body:', req.body);
    console.log('------------------------');
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pets', petsRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Lost Pets API çalışıyor' });
});

// Hata yakalama middleware'i
app.use((err, req, res, next) => {
    console.error('Hata:', err.stack);
    res.status(500).json({
        message: 'Bir hata oluştu',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
}); 