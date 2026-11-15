const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const pool = require('./db');
require('dotenv').config();

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'super_secreto_jwt_tp3_programacion_iv'
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const [rows] = await pool.query(
        'SELECT id, nombre, email FROM usuarios WHERE id = ?',
        [jwt_payload.id]
      );

      if (rows.length > 0) {
        return done(null, rows[0]);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

module.exports = passport;
