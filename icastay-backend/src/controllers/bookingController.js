const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Crear solicitud de reserva (Solo GUEST en Hoteles Partner)
const createBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { hotelId, checkIn, checkOut, guestsCount, notes } = req.body;

    if (!hotelId || !checkIn || !checkOut) {
      return res.status(400).json({ error: 'Hotel, fecha de ingreso y fecha de salida son obligatorios.' });
    }

    const fechaInicio = new Date(checkIn);
    const fechaFin = new Date(checkOut);

    // Regla de Negocio RN-03: Validar coherencia de fechas
    const diferenciaMs = fechaFin - fechaInicio;
    const nights = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      return res.status(400).json({ error: 'La fecha de salida debe ser al menos 1 día posterior a la fecha de ingreso.' });
    }

    // Verificar que el hotel exista y sea Partner Verificado (RN-02)
    const hotel = await prisma.hotel.findUnique({ where: { id: parseInt(hotelId) } });
    if (!hotel) {
      return res.status(404).json({ error: 'El hotel seleccionado no existe.' });
    }
    if (!hotel.isPartner) {
      return res.status(400).json({ error: 'Este alojamiento pertenece al directorio externo y no admite reservas internas.' });
    }

    const totalPrice = nights * hotel.pricePerNight;

    const nuevaReserva = await prisma.booking.create({
      data: {
        userId,
        hotelId: hotel.id,
        checkIn: fechaInicio,
        checkOut: fechaFin,
        guestsCount: parseInt(guestsCount) || 2,
        nights,
        totalPrice,
        notes: notes || null,
        status: 'PENDING',
      },
      include: {
        hotel: { select: { name: true, zone: true, imageUrl: true } },
      },
    });

    res.status(201).json({
      mensaje: 'Solicitud de reserva enviada al hotel',
      booking: nuevaReserva,
    });
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ error: 'Error interno al procesar la reserva.' });
  }
};

// 2. Obtener reservas del Huésped ("Mis Viajes")
const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const reservas = await prisma.booking.findMany({
      where: { userId },
      include: {
        hotel: {
          select: { name: true, zone: true, imageUrl: true, pricePerNight: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(reservas);
  } catch (error) {
    console.error('Error al obtener mis reservas:', error);
    res.status(500).json({ error: 'Error al obtener tu historial de reservas.' });
  }
};

// 3. Obtener reservas recibidas por el Hotel Partner ("Panel de Recepción")
const getPartnerBookings = async (req, res) => {
  try {
    const partnerId = req.user.id;

    if (req.user.role !== 'HOTEL_PARTNER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso exclusivo para socios hoteleros.' });
    }

    const reservasRecibidas = await prisma.booking.findMany({
      where: {
        hotel: { ownerId: partnerId },
      },
      include: {
        hotel: { select: { name: true, zone: true } },
        user: { select: { name: true, email: true, travelPreference: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(reservasRecibidas);
  } catch (error) {
    console.error('Error al obtener reservas del partner:', error);
    res.status(500).json({ error: 'Error al cargar las reservas del hotel.' });
  }
};

// 4. Actualizar estado de la reserva (Confirmar / Rechazar por Hotel o Cancelar por Huésped)
const updateBookingStatus = async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const { status } = req.body;
    const { id: userId, role } = req.user;

    const reserva = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { hotel: true },
    });

    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada.' });
    }

    // CASO A: El Huésped desea CANCELAR su propia reserva (RN-04)
    if (role === 'GUEST') {
      if (reserva.userId !== userId) {
        return res.status(403).json({ error: 'No tienes permiso sobre esta reserva.' });
      }
      if (status !== 'CANCELLED') {
        return res.status(403).json({ error: 'El huésped únicamente puede cancelar la solicitud.' });
      }
      if (reserva.status !== 'PENDING') {
        return res.status(400).json({
          error: 'Regla RN-04: Solo puedes cancelar una solicitud mientras se encuentra en estado PENDIENTE.',
        });
      }
    }

    // CASO B: El Hotel Partner desea CONFIRMAR o RECHAZAR la solicitud
    if (role === 'HOTEL_PARTNER') {
      if (reserva.hotel.ownerId !== userId) {
        return res.status(403).json({ error: 'Esta reserva no pertenece a ninguno de tus hoteles.' });
      }
      if (!['CONFIRMED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ error: 'Estado no válido para recepción hotelera.' });
      }
    }

    const reservaActualizada = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        hotel: { select: { name: true, zone: true, imageUrl: true } },
        user: { select: { name: true, email: true, travelPreference: true } },
      },
    });

    res.status(200).json({
      mensaje: `Estado de reserva actualizado a ${status}`,
      booking: reservaActualizada,
    });
  } catch (error) {
    console.error('Error al actualizar estado de reserva:', error);
    res.status(500).json({ error: 'Error interno al actualizar el estado.' });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getPartnerBookings,
  updateBookingStatus,
};