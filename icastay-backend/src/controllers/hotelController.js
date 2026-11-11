const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Obtener catálogo público con filtros y resumen de reseñas
const getHotels = async (req, res) => {
  try {
    const { zone, maxPrice, categoryTag, onlyPartners } = req.query;
    const filtros = {};

    if (zone && zone !== 'TODAS') filtros.zone = zone;
    if (maxPrice) filtros.pricePerNight = { lte: parseFloat(maxPrice) };
    if (categoryTag && categoryTag !== 'TODAS') filtros.categoryTag = categoryTag;
    if (onlyPartners === 'true') filtros.isPartner = true;

    const hoteles = await prisma.hotel.findMany({
      where: filtros,
      include: {
        reviews: {
          select: { rating: true },
        },
      },
      orderBy: [
        { isPartner: 'desc' },
        { isAvailable: 'desc' },
        { pricePerNight: 'asc' },
      ],
    });

    // Calculamos promedio de estrellas y cantidad de reseñas de forma segura
    const hotelesConEstadisticas = hoteles.map((h) => {
      const reviewsSeguras = h.reviews || []; // Evita errores si reviews es undefined
      const totalReviews = reviewsSeguras.length;
      const avgRating =
        totalReviews > 0
          ? Number((reviewsSeguras.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1))
          : null;
      
      // Extraemos reviews para no enviarlo crudo al frontend
      const { reviews, ...restoHotel } = h;
      return { ...restoHotel, totalReviews, avgRating };
    });

    res.status(200).json(hotelesConEstadisticas);
  } catch (error) {
    console.error('Error al obtener hoteles:', error);
    res.status(500).json({ error: 'Error interno al cargar el catálogo de hoteles.' });
  }
};
// 2. Obtener los hoteles que pertenecen al Partner autenticado (RF-06)
const getPartnerHotels = async (req, res) => {
  try {
    if (req.user.role !== 'HOTEL_PARTNER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso exclusivo para socios hoteleros.' });
    }

    const misHoteles = await prisma.hotel.findMany({
      where: { ownerId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(misHoteles);
  } catch (error) {
    console.error('Error al obtener hoteles del partner:', error);
    res.status(500).json({ error: 'Error al cargar tus alojamientos.' });
  }
};

// 3. Crear un nuevo Hotel Verificado por el Partner (RF-06)
const createPartnerHotel = async (req, res) => {
  try {
    if (req.user.role !== 'HOTEL_PARTNER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Solo un Hotel Partner puede registrar alojamientos.' });
    }

    const { name, description, zone, pricePerNight, imageUrl, categoryTag } = req.body;

    if (!name || !description || !zone || !pricePerNight || !imageUrl || !categoryTag) {
      return res.status(400).json({ error: 'Todos los campos del alojamiento son obligatorios.' });
    }

    const nuevoHotel = await prisma.hotel.create({
      data: {
        name,
        description,
        zone,
        pricePerNight: parseFloat(pricePerNight),
        imageUrl,
        categoryTag,
        isPartner: true,
        isAvailable: true,
        ownerId: req.user.id,
      },
    });

    res.status(201).json({
      mensaje: 'Alojamiento registrado con Sello de Garantía IcaStay',
      hotel: nuevoHotel,
    });
  } catch (error) {
    console.error('Error al crear hotel:', error);
    res.status(500).json({ error: 'Error interno al registrar el alojamiento.' });
  }
};

// 4. Editar información de un Hotel del Partner (RF-06)
const updatePartnerHotel = async (req, res) => {
  try {
    const hotelId = parseInt(req.params.id);
    const { name, description, zone, pricePerNight, imageUrl, categoryTag } = req.body;

    const hotelExistente = await prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotelExistente || hotelExistente.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para editar este alojamiento.' });
    }

    const hotelActualizado = await prisma.hotel.update({
      where: { id: hotelId },
      data: {
        name,
        description,
        zone,
        pricePerNight: parseFloat(pricePerNight),
        imageUrl,
        categoryTag,
      },
    });

    res.status(200).json({
      mensaje: 'Alojamiento actualizado correctamente',
      hotel: hotelActualizado,
    });
  } catch (error) {
    console.error('Error al actualizar hotel:', error);
    res.status(500).json({ error: 'Error interno al actualizar el alojamiento.' });
  }
};

// 5. Alternar disponibilidad inmediata del Hotel (RN-05)
const toggleHotelAvailability = async (req, res) => {
  try {
    const hotelId = parseInt(req.params.id);
    const { isAvailable } = req.body;

    const hotelExistente = await prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotelExistente || hotelExistente.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para modificar este alojamiento.' });
    }

    const hotelActualizado = await prisma.hotel.update({
      where: { id: hotelId },
      data: { isAvailable: Boolean(isAvailable) },
    });

    res.status(200).json({
      mensaje: `Disponibilidad actualizada a ${hotelActualizado.isAvailable ? 'Disponible' : 'Pausado'}`,
      hotel: hotelActualizado,
    });
  } catch (error) {
    console.error('Error al cambiar disponibilidad:', error);
    res.status(500).json({ error: 'No se pudo cambiar la disponibilidad.' });
  }
};

module.exports = {
  getHotels,
  getPartnerHotels,
  createPartnerHotel,
  updatePartnerHotel,
  toggleHotelAvailability,
};