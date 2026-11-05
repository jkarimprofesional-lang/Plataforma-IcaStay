require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/', (req, res) => {
  res.send('Bienvenido a la API de IcaStay 🏨');
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    proyecto: 'IcaStay API',
    mensaje: 'Servidor Backend funcionando correctamente'
  });
});

app.listen(PORT, (error) => {
  if (error) {
    console.error(`❌ Error al iniciar el servidor en el puerto ${PORT}:`, error.message);
    return;
  }
  console.log(`🚀 Servidor de IcaStay corriendo en http://localhost:${PORT}`);
});