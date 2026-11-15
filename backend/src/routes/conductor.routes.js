const express = require('express');
const router = express.Router();
const ConductorController = require('../controllers/conductor.controller');
const { authenticateJWT } = require('../middlewares/auth.middleware');
const { conductorValidation, idParamValidation } = require('../validators/schemas.validator');
const { handleValidationErrors } = require('../middlewares/validator.middleware');

// Todas las rutas CRUD de conductores requieren autenticacion con JWT y validaciones
router.use(authenticateJWT);

router.get('/', ConductorController.getAll);
router.get('/:id', idParamValidation, handleValidationErrors, ConductorController.getById);
router.post('/', conductorValidation, handleValidationErrors, ConductorController.create);
router.put('/:id', idParamValidation, conductorValidation, handleValidationErrors, ConductorController.update);
router.delete('/:id', idParamValidation, handleValidationErrors, ConductorController.delete);

module.exports = router;
