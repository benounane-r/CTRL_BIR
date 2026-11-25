require('dotenv').config(); // .env dosyasını EN ÜSTTE yükle
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const elevatorRoutes = require('./routes/elevatorRoutes');
const classroomRoutes = require('./routes/classroomRoutes');
const faultRoutes = require('./routes/faultRoutes');
const roomRoutes = require('./routes/roomRoutes');
const densityRoutes = require('./routes/densityRoutes');
const demoRoutes = require('./routes/demoRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const app = express();
app.use(cors());         // React farklı porttan istek atabilsin
app.use(express.json()); // gelen JSON gövdesini okur

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Campus Facilities modülü
app.use('/api', elevatorRoutes);
app.use('/api', classroomRoutes);
app.use('/api', faultRoutes);
app.use('/api', roomRoutes);    // çalışma odaları + bildirimler
app.use('/api', densityRoutes);
app.use('/api', demoRoutes);
app.use('/api', libraryRoutes);
// Diğer modüller birleştirilirken buraya eklenecek (Library, Navigation vb.)

// Tanımsız /api yolları için JSON 404
app.use('/api', (req, res) => res.status(404).json({ error: 'Böyle bir API yok' }));

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Sunucu http://localhost:${PORT} adresinde`));
  })
  .catch((err) => {
    console.error('Başlatılamadı:', err.message);
    process.exit(1);
  });
