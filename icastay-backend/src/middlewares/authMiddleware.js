const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  // El token viaja en la cabecera "Authorization: Bearer <token>"
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodificado; // Guardamos id y role del usuario en la petición
    next(); // Permitimos que continúe hacia el controlador
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};

module.exports = { verificarToken };