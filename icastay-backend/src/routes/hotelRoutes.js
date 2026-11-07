const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/authMiddleware');
const {
  getHotels,
  getPartnerHotels,
  createPartnerHotel,
  updatePartnerHotel,
  toggleHotelAvailability,
} = require('../controllers/hotelController');

// Ruta pública
router.get('/', getHotels);

// Rutas protegidas de Autogestión Partner (Fase 6 - v2.0)
router.get('/my-hotels', verificarToken, getPartnerHotels);
router.post('/', verificarToken, createPartnerHotel);
router.put('/:id', verificarToken, updatePartnerHotel);
router.patch('/:id/availability', verificarToken, toggleHotelAvailability);

module.exports = router;