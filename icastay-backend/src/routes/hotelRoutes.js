const express = require('express');
const router = express.Router();
const { getHotels } = require('../controllers/hotelController');

// Ruta pública: cualquier visitante puede explorar el directorio (RN-01)
router.get('/', getHotels);

module.exports = router;