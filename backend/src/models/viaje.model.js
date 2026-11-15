const pool = require('../config/db');

const ViajeModel = {
  async getAll() {
    const query = `
      SELECT 
        v.id, v.vehiculo_id, v.conductor_id,
        v.fecha_salida, v.fecha_llegada, v.origen, v.destino, v.kilometros, v.observaciones,
        veh.marca AS vehiculo_marca, veh.modelo AS vehiculo_modelo, veh.patente AS vehiculo_patente,
        c.nombre AS conductor_nombre, c.apellido AS conductor_apellido, c.numero_documento AS conductor_documento
      FROM viajes v
      INNER JOIN vehiculos veh ON v.vehiculo_id = veh.id
      INNER JOIN conductores c ON v.conductor_id = c.id
      ORDER BY v.fecha_salida DESC
    `;
    const [rows] = await pool.query(query);
    return rows;
  },

  async getById(id) {
    const query = `
      SELECT 
        v.id, v.vehiculo_id, v.conductor_id,
        v.fecha_salida, v.fecha_llegada, v.origen, v.destino, v.kilometros, v.observaciones,
        veh.marca AS vehiculo_marca, veh.modelo AS vehiculo_modelo, veh.patente AS vehiculo_patente,
        c.nombre AS conductor_nombre, c.apellido AS conductor_apellido, c.numero_documento AS conductor_documento
      FROM viajes v
      INNER JOIN vehiculos veh ON v.vehiculo_id = veh.id
      INNER JOIN conductores c ON v.conductor_id = c.id
      WHERE v.id = ?
    `;
    const [rows] = await pool.query(query, [id]);
    return rows[0] || null;
  },

  async getByVehiculo(vehiculoId) {
    const query = `
      SELECT 
        v.id, v.vehiculo_id, v.conductor_id,
        v.fecha_salida, v.fecha_llegada, v.origen, v.destino, v.kilometros, v.observaciones,
        veh.marca AS vehiculo_marca, veh.modelo AS vehiculo_modelo, veh.patente AS vehiculo_patente,
        c.nombre AS conductor_nombre, c.apellido AS conductor_apellido
      FROM viajes v
      INNER JOIN vehiculos veh ON v.vehiculo_id = veh.id
      INNER JOIN conductores c ON v.conductor_id = c.id
      WHERE v.vehiculo_id = ?
      ORDER BY v.fecha_salida DESC
    `;
    const [rows] = await pool.query(query, [vehiculoId]);
    return rows;
  },

  async getByConductor(conductorId) {
    const query = `
      SELECT 
        v.id, v.vehiculo_id, v.conductor_id,
        v.fecha_salida, v.fecha_llegada, v.origen, v.destino, v.kilometros, v.observaciones,
        veh.marca AS vehiculo_marca, veh.modelo AS vehiculo_modelo, veh.patente AS vehiculo_patente,
        c.nombre AS conductor_nombre, c.apellido AS conductor_apellido
      FROM viajes v
      INNER JOIN vehiculos veh ON v.vehiculo_id = veh.id
      INNER JOIN conductores c ON v.conductor_id = c.id
      WHERE v.conductor_id = ?
      ORDER BY v.fecha_salida DESC
    `;
    const [rows] = await pool.query(query, [conductorId]);
    return rows;
  },

  async getTotalesKilometrosPorVehiculo() {
    const query = `
      SELECT 
        veh.id AS vehiculo_id,
        veh.marca,
        veh.modelo,
        veh.patente,
        COALESCE(SUM(v.kilometros), 0) AS total_kilometros,
        COUNT(v.id) AS total_viajes
      FROM vehiculos veh
      LEFT JOIN viajes v ON veh.id = v.vehiculo_id
      GROUP BY veh.id, veh.marca, veh.modelo, veh.patente
      ORDER BY total_kilometros DESC
    `;
    const [rows] = await pool.query(query);
    return rows;
  },

  async getTotalesKilometrosPorConductor() {
    const query = `
      SELECT 
        c.id AS conductor_id,
        c.nombre,
        c.apellido,
        c.numero_documento,
        COALESCE(SUM(v.kilometros), 0) AS total_kilometros,
        COUNT(v.id) AS total_viajes
      FROM conductores c
      LEFT JOIN viajes v ON c.id = v.conductor_id
      GROUP BY c.id, c.nombre, c.apellido, c.numero_documento
      ORDER BY total_kilometros DESC
    `;
    const [rows] = await pool.query(query);
    return rows;
  },

  async create({ vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilometros, observaciones }) {
    const [result] = await pool.query(
      `INSERT INTO viajes 
       (vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilometros, observaciones) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [vehiculo_id, conductor_id, fecha_salida, fecha_llegada || null, origen, destino, kilometros, observaciones || null]
    );
    return this.getById(result.insertId);
  },

  async update(id, { vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilometros, observaciones }) {
    await pool.query(
      `UPDATE viajes 
       SET vehiculo_id = ?, conductor_id = ?, fecha_salida = ?, fecha_llegada = ?, 
           origen = ?, destino = ?, kilometros = ?, observaciones = ? 
       WHERE id = ?`,
      [vehiculo_id, conductor_id, fecha_salida, fecha_llegada || null, origen, destino, kilometros, observaciones || null, id]
    );
    return this.getById(id);
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM viajes WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = ViajeModel;
