const passport = require('../config/passport');

const authenticateJWT = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'Error interno en la autenticacion', detalle: err.message });
    }
    if (!user) {
      // El token es correcto pero el usuario ya no existe en la base: 403.
      // Sin token o con token invalido/vencido corresponde 401.
      if (info && /ya no existe/i.test(info.message || '')) {
        return res.status(403).json({
          error: 'La cuenta asociada al token ya no existe. Volve a registrarte o inicia sesion con otra cuenta.'
        });
      }
      return res.status(401).json({
        error: 'No autorizado. Debe iniciar sesion y proporcionar un token valido.'
      });
    }
    req.user = user;
    next();
  })(req, res, next);
};

module.exports = {
  authenticateJWT
};
