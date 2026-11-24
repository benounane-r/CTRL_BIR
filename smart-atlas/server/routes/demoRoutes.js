const express = require('express');
const wrap = require('../utils/wrap');
const { seedAll } = require('../seed/seedData');

const router = express.Router();

// POST /api/demo/reset -> demo verisini başa döndürür (Admin sayfasındaki "Demo verisini sıfırla" butonu)
router.post(
  '/demo/reset',
  wrap(async (req, res) => {
    const result = await seedAll();
    res.json({ ok: true, ...result });
  })
);

module.exports = router;
