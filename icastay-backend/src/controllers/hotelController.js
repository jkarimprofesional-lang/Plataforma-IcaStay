const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener catálogo de hoteles con filtros dinámicos (RF-03)
const getHotels = async (req, res) => {
  try {
    const { zone, maxPrice, categoryTag, onlyPartners } = req.query;

    // Construimos el filtro dinámicamente según lo que envíe el usuario
    const filtros = {};

    if (zone && zone !== 'TODAS') {
      filtros.zone = zone;
    }

    if (maxPrice) {
      filtros.pricePerNight = { lte: parseFloat(maxPrice) }; // lte = menor o igual que
    }

    if (categoryTag && categoryTag !== 'TODAS') {
      filtros.categoryTag = categoryTag;
    }

    if (onlyPartners === 'true') {
      filtros.isPartner = true;
    }

    const hoteles = await prisma.hotel.findMany({
      where: filtros,
      // Mostramos primero los Hoteles Partners Verificados y luego por menor precio
      orderBy: [
        { isPartner: 'desc' },
        { pricePerNight: 'asc' },
      ],
    });

    res.status(200).json(hoteles);
  } catch (error) {
    console.error('Error al obtener hoteles:', error);
    res.status(500).json({ error: 'Error interno al cargar el catálogo de hoteles.' });
  }
};

module.exports = { getHotels };