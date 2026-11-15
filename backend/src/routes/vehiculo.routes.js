const express = require('express');
const router = express.Router();
const VehiculoController = require('../controllers/vehiculo.controller');
const { authenticateJWT } = require('../middlewares/auth.middleware');
const { vehiculoValidation, idParamValidation } = require('../validators/schemas.validator');
const { handleValidationErrors } = require('../middlewares/validator.middleware');

// Todas las rutas CRUD de vehiculos requieren autenticacion con JWT y validaciones
router.use(authenticateJWT);

router.get('/', VehiculoController.getAll);
router.get('/:id', idParamValidation, handleValidationErrors, VehiculoController.getById);
router.post('/', vehiculoValidation, handleValidationErrors, VehiculoController.create);
router.put('/:id', idParamValidation, vehiculoValidation, handleValidationErrors, VehiculoController.update);
router.delete('/:id', idParamValidation, handleValidationErrors, VehiculoController.delete);

module.exports = router;
