const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/authMiddleware');
const {
  createBooking,
  getMyBookings,
  getPartnerBookings,
  updateBookingStatus,
} = require('../controllers/bookingController');

// Todas las rutas de reservas requieren sesión activa (RN-01)
router.post('/', verificarToken, createBooking);
router.get('/my-bookings', verificarToken, getMyBookings);
router.get('/partner-bookings', verificarToken, getPartnerBookings);
router.patch('/:id/status', verificarToken, updateBookingStatus);

module.exports = router;