const pool = require('../config/db');

const ConductorModel = {
  async getAll() {
    const [rows] = await pool.query('SELECT * FROM conductores ORDER BY id DESC');
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM conductores WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async findByDocumento(numero_documento, excludeId = null) {
    let query = 'SELECT * FROM conductores WHERE numero_documento = ?';
    const params = [numero_documento];
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    const [rows] = await pool.query(query, params);
    return rows[0] || null;
  },

  async findByLicencia(numero_licencia, excludeId = null) {
    let query = 'SELECT * FROM conductores WHERE numero_licencia = ?';
    const params = [numero_licencia];
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    const [rows] = await pool.query(query, params);
    return rows[0] || null;
  },

  async create({ nombre, apellido, numero_documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia }) {
    const [result] = await pool.query(
      `INSERT INTO conductores 
       (nombre, apellido, numero_documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, numero_documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia]
    );
    return {
      id: result.insertId,
      nombre,
      apellido,
      numero_documento,
      numero_licencia,
      fecha_alta_licencia,
      fecha_vencimiento_licencia
    };
  },

  async update(id, { nombre, apellido, numero_documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia }) {
    await pool.query(
      `UPDATE conductores 
       SET nombre = ?, apellido = ?, numero_documento = ?, numero_licencia = ?, 
           fecha_alta_licencia = ?, fecha_vencimiento_licencia = ? 
       WHERE id = ?`,
      [nombre, apellido, numero_documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia, id]
    );
    return this.getById(id);
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM conductores WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = ConductorModel;
