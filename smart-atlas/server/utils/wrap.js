// Beklenmedik hata olursa sunucu çökmesin, 500 dönsün
module.exports = function wrap(fn) {
  return (req, res) => {
    fn(req, res).catch((err) => {
      console.error(err);
      res.status(500).json({ error: 'Sunucu hatası' });
    });
  };
};
