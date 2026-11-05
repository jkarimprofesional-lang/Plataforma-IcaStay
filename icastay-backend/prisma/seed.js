const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando carga de hoteles de IcaStay...');

  // 1. Creamos un usuario Hotel Partner de prueba para administrar los hoteles verificados
  const passwordHash = await bcrypt.hash('partner123', 10);
  const socioHotelero = await prisma.user.upsert({
    where: { email: 'recepcion@icastaypartner.com' },
    update: {},
    create: {
      name: 'Grupo Hotelero Ica Premium',
      email: 'recepcion@icastaypartner.com',
      passwordHash,
      role: 'HOTEL_PARTNER',
    },
  });

  // 2. Limpiamos hoteles previos para no duplicar si corremos el seed dos veces
  await prisma.hotel.deleteMany();

  // 3. Insertamos el catálogo híbrido (Partners Verificados + Directorio)
  await prisma.hotel.createMany({
    data: [
      {
        name: 'Desert Oasis Glamping & Resort',
        description: 'Carpas de lujo frente a las dunas de la Huacachina con fogata nocturna y salida directa a tubulares.',
        zone: 'HUACACHINA',
        pricePerNight: 320,
        imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
        categoryTag: 'AVENTURA',
        isPartner: true,
        ownerId: socioHotelero.id,
      },
      {
        name: 'Hacienda Viñas del Sol Boutique',
        description: 'Alojamiento exclusivo entre viñedos tradicionales de Ica. Incluye cata privada de pisco y cenas románticas.',
        zone: 'VINEDOS',
        pricePerNight: 450,
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        categoryTag: 'PAREJA',
        isPartner: true,
        ownerId: socioHotelero.id,
      },
      {
        name: 'Paracas Bay Luxury Suites',
        description: 'Resort familiar frente a la bahía de Paracas con piscina temperada y embarcadero privado a Islas Ballestas.',
        zone: 'PARACAS',
        pricePerNight: 520,
        imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
        categoryTag: 'FAMILIA',
        isPartner: true,
        ownerId: socioHotelero.id,
      },
      {
        name: 'Ica Business Center Hotel',
        description: 'Ubicado a dos cuadras de la Plaza de Armas de Ica. Fibra óptica de alta velocidad y salas de directorio.',
        zone: 'ICA_CENTRO',
        pricePerNight: 180,
        imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
        categoryTag: 'NEGOCIOS',
        isPartner: true,
        ownerId: socioHotelero.id,
      },
      // --- HOTELES DE DIRECTORIO (No Verificados - RN-02) ---
      {
        name: 'Hostal Las Dunas Clásico',
        description: 'Hospedaje tradicional cerca del balneario de Huacachina. Información referencial de directorio público.',
        zone: 'HUACACHINA',
        pricePerNight: 110,
        imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
        categoryTag: 'AVENTURA',
        isPartner: false,
        externalUrl: 'https://www.google.com/maps/search/hoteles+huacachina+ica',
      },
      {
        name: 'Hotel Sol de Nazca Mirador',
        description: 'Alojamiento de paso cerca al aeródromo María Reiche. Aún no integrado al sistema de reservas IcaStay.',
        zone: 'NAZCA',
        pricePerNight: 150,
        imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
        categoryTag: 'FAMILIA',
        isPartner: false,
        externalUrl: 'https://www.google.com/maps/search/hoteles+nazca+ica',
      },
    ],
  });

  console.log('✅ ¡Catálogo de 6 hoteles en Ica insertado correctamente en PostgreSQL!');
}

main()
  .catch((e) => {
    console.error('❌ Error al ejecutar el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });