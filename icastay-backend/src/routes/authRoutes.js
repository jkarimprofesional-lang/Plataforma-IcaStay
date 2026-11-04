const express = require('express');
const router = express.Router();
const { register, login, updatePreferences } = require('../controllers/authController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Rutas públicas
router.post('/register', register);
router.post('/login', login);

// Ruta protegida (requiere token JWT)
router.put('/preferences', verificarToken, updatePreferences);

module.exports = router;