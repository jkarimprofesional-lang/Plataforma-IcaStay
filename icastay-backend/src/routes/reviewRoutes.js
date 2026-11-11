const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/authMiddleware');
const {
  getHotelReviews,
  createReview,
  manageReviewByPartner,
} = require('../controllers/reviewController');

// Público: Cualquiera puede leer y filtrar las reseñas de un hotel
router.get('/hotel/:hotelId', getHotelReviews);

// Protegido: Publicar reseña (calcula automáticamente RN-07)
router.post('/hotel/:hotelId', verificarToken, createReview);

// Protegido (Solo Hotel Partner dueño): Fijar reseña como destacada o responder oficialmente
router.patch('/:id/manage', verificarToken, manageReviewByPartner);

module.exports = router;