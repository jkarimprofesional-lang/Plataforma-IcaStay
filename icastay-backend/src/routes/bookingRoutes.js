
const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/authMiddleware');
const {
  createBooking,
  getMyBookings,
  getPartnerBookings,
  updateBookingStatus,
  payBooking,
} = require('../controllers/bookingController');

router.post('/', verificarToken, createBooking);
router.get('/my-bookings', verificarToken, getMyBookings);
router.get('/partner-bookings', verificarToken, getPartnerBookings);
router.patch('/:id/status', verificarToken, updateBookingStatus);
router.patch('/:id/pay', verificarToken, payBooking);

module.exports = router;