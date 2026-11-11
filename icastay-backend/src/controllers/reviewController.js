const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Obtener reseñas de un hotel con desglose por estrellas (1★ a 5★)
const getHotelReviews = async (req, res) => {
  try {
    const hotelId = parseInt(req.params.hotelId);

    const reviews = await prisma.review.findMany({
      where: { hotelId },
      include: {
        user: {
          select: { name: true, travelPreference: true },
        },
      },
      // Orden comercial inteligente: Primero las destacadas por el hotel, luego las estadías verificadas, luego las más recientes
      orderBy: [
        { isFeatured: 'desc' },
        { isVerifiedStay: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Calculamos estadísticas detalladas de 1 a 5 estrellas
    const total = reviews.length;
    const avgRating =
      total > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1))
        : 0;

    const conteoEstrellas = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      if (conteoEstrellas[r.rating] !== undefined) {
        conteoEstrellas[r.rating] += 1;
      }
    });

    res.status(200).json({
      total,
      avgRating,
      conteoEstrellas,
      reviews,
    });
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    res.status(500).json({ error: 'Error interno al cargar las reseñas del alojamiento.' });
  }
};

// 2. Publicar una nueva reseña con verificación antifraude automática (RN-07)
const createReview = async (req, res) => {
  try {
    const hotelId = parseInt(req.params.hotelId);
    const userId = req.user.id;
    const { rating, comment } = req.body;

    const calificacion = parseInt(rating);
    if (!calificacion || calificacion < 1 || calificacion > 5 || !comment?.trim()) {
      return res.status(400).json({
        error: 'Debes seleccionar una calificación entre 1 y 5 estrellas y escribir un comentario.',
      });
    }

    // Regla de Negocio RN-07: Comprobamos en BD si el usuario tiene una reserva CONFIRMED y PAID en este hotel
    const estadiaPagada = await prisma.booking.findFirst({
      where: {
        userId,
        hotelId,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
      },
    });

    const isVerifiedStay = Boolean(estadiaPagada);

    const nuevaReview = await prisma.review.create({
      data: {
        rating: calificacion,
        comment: comment.trim(),
        isVerifiedStay,
        userId,
        hotelId,
      },
      include: {
        user: { select: { name: true, travelPreference: true } },
      },
    });

    res.status(201).json({
      mensaje: isVerifiedStay
        ? 'Reseña publicada con insignia de Huésped Verificado'
        : 'Reseña publicada correctamente',
      review: nuevaReview,
    });
  } catch (error) {
    console.error('Error al crear reseña:', error);
    res.status(500).json({ error: 'Error interno al publicar la reseña.' });
  }
};

// 3. Herramienta Comercial del Hotel Partner: Destacar reseña o responder oficialmente
const manageReviewByPartner = async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    const { isFeatured, partnerReply } = req.body;

    const reviewExistente = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { hotel: true },
    });

    if (!reviewExistente) {
      return res.status(404).json({ error: 'Reseña no encontrada.' });
    }

    if (reviewExistente.hotel.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Solo el socio propietario de este hotel puede gestionar o responder sus reseñas.',
      });
    }

    const dataActualizar = {};
    if (typeof isFeatured === 'boolean') {
      dataActualizar.isFeatured = isFeatured;
    }
    if (partnerReply !== undefined) {
      dataActualizar.partnerReply = partnerReply.trim() || null;
      dataActualizar.repliedAt = partnerReply.trim() ? new Date() : null;
    }

    const reviewActualizada = await prisma.review.update({
      where: { id: reviewId },
      data: dataActualizar,
      include: {
        user: { select: { name: true, travelPreference: true } },
      },
    });

    res.status(200).json({
      mensaje: 'Preferencia comercial de reseña actualizada',
      review: reviewActualizada,
    });
  } catch (error) {
    console.error('Error al gestionar reseña:', error);
    res.status(500).json({ error: 'Error interno al actualizar la reseña.' });
  }
};

module.exports = {
  getHotelReviews,
  createReview,
  manageReviewByPartner,
};