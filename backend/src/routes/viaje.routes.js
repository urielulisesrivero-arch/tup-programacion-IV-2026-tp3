const express = require('express');
const router = express.Router();
const ViajeController = require('../controllers/viaje.controller');
const { authenticateJWT } = require('../middlewares/auth.middleware');
const {
  viajeValidation,
  idParamValidation,
  vehiculoIdParamValidation,
  conductorIdParamValidation
} = require('../validators/schemas.validator');
const { handleValidationErrors } = require('../middlewares/validator.middleware');

// Todas las rutas CRUD y consultas de viajes requieren autenticacion con JWT
router.use(authenticateJWT);

// Totales / estadisticas de kilometros recorridos
router.get('/totales-kilometros', ViajeController.getTotalesKm);

// Historial por vehiculo o por conductor
router.get('/historial/vehiculo/:vehiculo_id', vehiculoIdParamValidation, handleValidationErrors, ViajeController.getHistorialByVehiculo);
router.get('/historial/conductor/:conductor_id', conductorIdParamValidation, handleValidationErrors, ViajeController.getHistorialByConductor);

// CRUD general
router.get('/', ViajeController.getAll);
router.get('/:id', idParamValidation, handleValidationErrors, ViajeController.getById);
router.post('/', viajeValidation, handleValidationErrors, ViajeController.create);
router.put('/:id', idParamValidation, viajeValidation, handleValidationErrors, ViajeController.update);
router.delete('/:id', idParamValidation, handleValidationErrors, ViajeController.delete);

module.exports = router;
