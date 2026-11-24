// Ayarlanabilir sayılar. server.js dotenv'i önce yüklediği için process.env değerleri .env'den gelir.
module.exports = {
  // "Dolu" bildirilen çalışma odası bu kadar saat sonra otomatik "Boş" olur (0 = kapalı)
  ROOM_AUTO_FREE_HOURS:
    process.env.ROOM_AUTO_FREE_HOURS !== undefined ? Number(process.env.ROOM_AUTO_FREE_HOURS) : 3,
  // Öğrenci yoğunluk bildirimleri kaç dakika boyunca geçerli sayılır
  REPORT_WINDOW_MINUTES: 30
};
