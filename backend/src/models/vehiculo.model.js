const pool = require('../config/db');

const VehiculoModel = {
  async getAll({ marca, patente } = {}) {
    const condiciones = [];
    const params = [];

    if (marca) {
      condiciones.push('marca LIKE ?');
      params.push(`%${marca}%`);
    }
    if (patente) {
      condiciones.push('patente LIKE ?');
      params.push(`%${patente}%`);
    }

    const where = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';
    const [rows] = await pool.query(`SELECT * FROM vehiculos ${where} ORDER BY id DESC`, params);
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM vehiculos WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async findByPatente(patente, excludeId = null) {
    let query = 'SELECT * FROM vehiculos WHERE patente = ?';
    const params = [patente];
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    const [rows] = await pool.query(query, params);
    return rows[0] || null;
  },

  async create({ marca, modelo, patente, anio, capacidad_carga }) {
    const [result] = await pool.query(
      'INSERT INTO vehiculos (marca, modelo, patente, anio, capacidad_carga) VALUES (?, ?, ?, ?, ?)',
      [marca, modelo, patente, anio, capacidad_carga]
    );
    return { id: result.insertId, marca, modelo, patente, anio, capacidad_carga };
  },

  async update(id, { marca, modelo, patente, anio, capacidad_carga }) {
    await pool.query(
      'UPDATE vehiculos SET marca = ?, modelo = ?, patente = ?, anio = ?, capacidad_carga = ? WHERE id = ?',
      [marca, modelo, patente, anio, capacidad_carga, id]
    );
    return this.getById(id);
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM vehiculos WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = VehiculoModel;
