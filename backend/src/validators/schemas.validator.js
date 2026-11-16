const { body, param, query } = require('express-validator');

const registerValidation = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres.'),
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio.')
    .isEmail().withMessage('Debe ingresar un email valido.')
    .normalizeEmail(),
  body('contrasena')
    .notEmpty().withMessage('La contrasena es obligatoria.')
    .isLength({ min: 6 }).withMessage('La contrasena debe tener al menos 6 caracteres.')
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio.')
    .isEmail().withMessage('Debe ingresar un email valido.')
    .normalizeEmail(),
  body('contrasena')
    .notEmpty().withMessage('La contrasena es obligatoria.')
];

const vehiculoValidation = [
  body('marca')
    .trim()
    .notEmpty().withMessage('La marca es obligatoria.')
    .isLength({ max: 100 }).withMessage('La marca no puede superar los 100 caracteres.'),
  body('modelo')
    .trim()
    .notEmpty().withMessage('El modelo es obligatorio.')
    .isLength({ max: 100 }).withMessage('El modelo no puede superar los 100 caracteres.'),
  body('patente')
    .trim()
    .notEmpty().withMessage('La patente es obligatoria.')
    .matches(/^[A-Z0-9\s-]+$/i).withMessage('La patente contiene caracteres invalidos.')
    .isLength({ min: 6, max: 15 }).withMessage('La patente debe tener entre 6 y 15 caracteres.'),
  body('anio')
    .notEmpty().withMessage('El anio es obligatorio.')
    .isInt({ min: 1950, max: 2030 }).withMessage('El anio debe ser un numero positivo entre 1950 y 2030.'),
  body('capacidad_carga')
    .notEmpty().withMessage('La capacidad de carga es obligatoria.')
    .isFloat({ min: 0.01 }).withMessage('La capacidad de carga debe ser un numero positivo mayor a 0.')
];

const conductorValidation = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.')
    .isLength({ max: 100 }).withMessage('El nombre no puede superar los 100 caracteres.'),
  body('apellido')
    .trim()
    .notEmpty().withMessage('El apellido es obligatorio.')
    .isLength({ max: 100 }).withMessage('El apellido no puede superar los 100 caracteres.'),
  body('numero_documento')
    .trim()
    .notEmpty().withMessage('El numero de documento es obligatorio.')
    .matches(/^[0-9]{7,8}$/).withMessage('El numero de documento debe tener exactamente 7 u 8 digitos numericos positivos.'),
  body('numero_licencia')
    .trim()
    .notEmpty().withMessage('El numero de licencia es obligatorio.')
    .isLength({ min: 4, max: 50 }).withMessage('El numero de licencia debe tener entre 4 y 50 caracteres.'),
  body('fecha_alta_licencia')
    .notEmpty().withMessage('La fecha de alta de licencia es obligatoria.')
    .isDate().withMessage('La fecha de alta de licencia debe tener formato de fecha valido (YYYY-MM-DD).'),
  body('fecha_vencimiento_licencia')
    .notEmpty().withMessage('La fecha de vencimiento de licencia es obligatoria.')
    .isDate().withMessage('La fecha de vencimiento de licencia debe tener formato de fecha valido (YYYY-MM-DD).')
];

const viajeValidation = [
  body('vehiculo_id')
    .notEmpty().withMessage('El id del vehiculo es obligatorio.')
    .isInt({ min: 1 }).withMessage('El id del vehiculo debe ser un entero positivo.'),
  body('conductor_id')
    .notEmpty().withMessage('El id del conductor es obligatorio.')
    .isInt({ min: 1 }).withMessage('El id del conductor debe ser un entero positivo.'),
  body('fecha_salida')
    .notEmpty().withMessage('La fecha y hora de salida es obligatoria.')
    .isISO8601().withMessage('La fecha de salida debe tener formato valido ISO 8601 / YYYY-MM-DD HH:MM:SS.'),
  body('fecha_llegada')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage('La fecha de llegada debe tener formato valido ISO 8601.'),
  body('origen')
    .trim()
    .notEmpty().withMessage('El origen es obligatorio.')
    .isLength({ max: 150 }).withMessage('El origen no puede superar los 150 caracteres.'),
  body('destino')
    .trim()
    .notEmpty().withMessage('El destino es obligatorio.')
    .isLength({ max: 150 }).withMessage('El destino no puede superar los 150 caracteres.'),
  body('kilometros')
    .notEmpty().withMessage('Los kilometros son obligatorios.')
    .isFloat({ min: 0.1 }).withMessage('Los kilometros deben ser un numero positivo mayor a 0.'),
  body('observaciones')
    .optional({ nullable: true })
    .trim()
];

const idParamValidation = [
  param('id')
    .notEmpty().withMessage('El ID es requerido.')
    .isInt({ min: 1 }).withMessage('El ID debe ser un numero entero positivo.')
];

const vehiculoIdParamValidation = [
  param('vehiculo_id')
    .notEmpty().withMessage('El ID del vehiculo es requerido.')
    .isInt({ min: 1 }).withMessage('El ID del vehiculo debe ser un numero entero positivo.')
];

const conductorIdParamValidation = [
  param('conductor_id')
    .notEmpty().withMessage('El ID del conductor es requerido.')
    .isInt({ min: 1 }).withMessage('El ID del conductor debe ser un numero entero positivo.')
];

module.exports = {
  registerValidation,
  loginValidation,
  vehiculoValidation,
  conductorValidation,
  viajeValidation,
  idParamValidation,
  vehiculoIdParamValidation,
  conductorIdParamValidation
};
