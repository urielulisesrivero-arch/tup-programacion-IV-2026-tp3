const express = require('express');
const cors = require('cors');
const passport = require('./config/passport');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const vehiculoRoutes = require('./routes/vehiculo.routes');
const conductorRoutes = require('./routes/conductor.routes');
const viajeRoutes = require('./routes/viaje.routes');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Endpoint base / healthcheck
app.get('/', (req, res) => {
  res.status(200).json({
    mensaje: 'API de Gestion de Transporte - TP3 Programacion IV',
    version: '1.0.0',
    estado: 'online'
  });
});

// Rutas principales de la API
app.use('/api/auth', authRoutes);
app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/conductores', conductorRoutes);
app.use('/api/viajes', viajeRoutes);

// Manejo de rutas inexistentes (404)
app.use((req, res, next) => {
  res.status(404).json({
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// Manejo centralizado de errores (500)
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Ocurrio un error inesperado en el servidor.'
  });
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
  });
}

module.exports = app;
