require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Rutas de la API
app.use('/api/auth', authRoutes);

// Ruta principal (Raíz)
app.get('/', (req, res) => {
  res.send('Bienvenido a la API de IcaStay 🏨');
});

// Ruta de verificación de estado (Health Check)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    proyecto: 'IcaStay API',
    mensaje: 'Servidor Backend funcionando correctamente'
  });
});

// Encendemos el servidor verificando posibles errores de puerto
app.listen(PORT, (error) => {
  if (error) {
    console.error(`❌ Error al iniciar el servidor en el puerto ${PORT}:`, error.message);
    return;
  }
  console.log(`🚀 Servidor de IcaStay corriendo en http://localhost:${PORT}`);
});