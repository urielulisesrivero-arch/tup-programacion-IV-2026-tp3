const pool = require('../config/db');

const UserModel = {
  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT id, nombre, email, created_at FROM usuarios WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create({ nombre, email, contrasena }) {
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, email, contrasena) VALUES (?, ?, ?)',
      [nombre, email, contrasena]
    );
    return { id: result.insertId, nombre, email };
  }
};

module.exports = UserModel;
