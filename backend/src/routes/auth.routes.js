const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { registerValidation, loginValidation } = require('../validators/schemas.validator');
const { handleValidationErrors } = require('../middlewares/validator.middleware');
const { authenticateJWT } = require('../middlewares/auth.middleware');

router.post('/register', registerValidation, handleValidationErrors, AuthController.register);
router.post('/login', loginValidation, handleValidationErrors, AuthController.login);
router.get('/perfil', authenticateJWT, AuthController.perfil);

module.exports = router;
