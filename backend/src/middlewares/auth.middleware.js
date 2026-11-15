const passport = require('../config/passport');

const authenticateJWT = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'Error interno en la autenticacion', detalle: err.message });
    }
    if (!user) {
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
