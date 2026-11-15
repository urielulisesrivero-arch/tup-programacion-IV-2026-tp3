const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');
require('dotenv').config();

const AuthController = {
  async register(req, res) {
    try {
      const { nombre, email, contrasena } = req.body;

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'El email ya se encuentra registrado.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(contrasena, salt);

      const nuevoUsuario = await UserModel.create({
        nombre,
        email,
        contrasena: hashedPassword
      });

      return res.status(201).json({
        mensaje: 'Usuario registrado con exito.',
        usuario: {
          id: nuevoUsuario.id,
          nombre: nuevoUsuario.nombre,
          email: nuevoUsuario.email
        }
      });
    } catch (error) {
      console.error('Error en register:', error);
      return res.status(500).json({ error: 'Error interno del servidor al registrar usuario.' });
    }
  },

  async login(req, res) {
    try {
      const { email, contrasena } = req.body;

      const usuario = await UserModel.findByEmail(email);
      if (!usuario) {
        return res.status(401).json({ error: 'Credenciales invalidas (email o contrasena incorrectos).' });
      }

      const match = await bcrypt.compare(contrasena, usuario.contrasena);
      if (!match) {
        return res.status(401).json({ error: 'Credenciales invalidas (email o contrasena incorrectos).' });
      }

      const payload = {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email
      };

      const secret = process.env.JWT_SECRET || 'super_secreto_jwt_tp3_programacion_iv';
      const token = jwt.sign(payload, secret, {
        expiresIn: process.env.JWT_EXPIRES_IN || '4h'
      });

      return res.status(200).json({
        mensaje: 'Inicio de sesion exitoso.',
        token,
        usuario: payload
      });
    } catch (error) {
      console.error('Error en login:', error);
      return res.status(500).json({ error: 'Error interno del servidor al iniciar sesion.' });
    }
  },

  async perfil(req, res) {
    try {
      return res.status(200).json({
        usuario: req.user
      });
    } catch (error) {
      console.error('Error en perfil:', error);
      return res.status(500).json({ error: 'Error interno del servidor al obtener perfil.' });
    }
  }
};

module.exports = AuthController;
