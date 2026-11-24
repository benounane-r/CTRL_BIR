const mongoose = require('mongoose');

// MongoDB'ye bağlanır. Adres .env dosyasındaki MONGO_URI'den gelir.
async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI tanımlı değil. .env dosyasını kontrol et.');
  }
  await mongoose.connect(uri);
  console.log('MongoDB bağlantısı başarılı');
}

module.exports = connectDB;
