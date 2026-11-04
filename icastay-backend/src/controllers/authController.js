const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// 1. Registro de usuario (Huésped o Hotel Partner)
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Por favor completa nombre, email y contraseña.' });
    }

    // Verificar si el correo ya existe en PostgreSQL
    const usuarioExistente = await prisma.user.findUnique({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'Este correo electrónico ya está registrado.' });
    }

    // Encriptar la contraseña (10 rondas de sal)
    const passwordHash = await bcrypt.hash(password, 10);

    // Permitimos rol GUEST o HOTEL_PARTNER (por defecto GUEST)
    const rolAsignado = role === 'HOTEL_PARTNER' ? 'HOTEL_PARTNER' : 'GUEST';

    const nuevoUsuario = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: rolAsignado,
      },
    });

    // Generar el token JWT automáticamente tras registrarse
    const token = jwt.sign(
      { id: nuevoUsuario.id, role: nuevoUsuario.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      token,
      user: {
        id: nuevoUsuario.id,
        name: nuevoUsuario.name,
        email: nuevoUsuario.email,
        role: nuevoUsuario.role,
        travelPreference: nuevoUsuario.travelPreference,
      },
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno al registrar el usuario.' });
  }
};

// 2. Inicio de sesión (Login)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await prisma.user.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    // Comparar contraseña escrita con el hash guardado en la BD
    const passwordValido = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    const token = jwt.sign(
      { id: usuario.id, role: usuario.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      user: {
        id: usuario.id,
        name: usuario.name,
        email: usuario.email,
        role: usuario.role,
        travelPreference: usuario.travelPreference,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno al iniciar sesión.' });
  }
};

// 3. Guardar preferencia del Onboarding Profiling (RF-02)
const updatePreferences = async (req, res) => {
  try {
    const { travelPreference } = req.body;
    const userId = req.user.id; // Viene del authMiddleware

    const usuarioActualizado = await prisma.user.update({
      where: { id: userId },
      data: { travelPreference },
    });

    res.status(200).json({
      mensaje: 'Preferencia de viaje actualizada',
      user: {
        id: usuarioActualizado.id,
        name: usuarioActualizado.name,
        email: usuarioActualizado.email,
        role: usuarioActualizado.role,
        travelPreference: usuarioActualizado.travelPreference,
      },
    });
  } catch (error) {
    console.error('Error actualizando preferencias:', error);
    res.status(500).json({ error: 'No se pudo actualizar la preferencia.' });
  }
};

module.exports = { register, login, updatePreferences };