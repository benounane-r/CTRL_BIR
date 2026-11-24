require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const { seedAll } = require('./seedData');

async function run() {
  await connectDB();
  const r = await seedAll();
  console.log(`${r.elevators} asansör, ${r.classrooms} derslik, ${r.lessons} ders aralığı yüklendi`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
