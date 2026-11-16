const ViajeModel = require('../models/viaje.model');
const VehiculoModel = require('../models/vehiculo.model');
const ConductorModel = require('../models/conductor.model');

const ViajeController = {
  async getAll(req, res) {
    try {
      const { vehiculo_id, conductor_id } = req.query;
      const viajes = await ViajeModel.getAll({ vehiculo_id, conductor_id });

      return res.status(200).json(viajes);
    } catch (error) {
      console.error('Error al obtener viajes:', error);
      return res.status(500).json({ error: 'Error interno al obtener viajes.' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const viaje = await ViajeModel.getById(id);
      if (!viaje) {
        return res.status(404).json({ error: `No se encontro el viaje con id ${id}.` });
      }
      return res.status(200).json(viaje);
    } catch (error) {
      console.error('Error al obtener viaje:', error);
      return res.status(500).json({ error: 'Error interno al obtener viaje.' });
    }
  },

  async getHistorialByVehiculo(req, res) {
    try {
      const { vehiculo_id } = req.params;
      const vehiculo = await VehiculoModel.getById(vehiculo_id);
      if (!vehiculo) {
        return res.status(404).json({ error: `No se encontro el vehiculo con id ${vehiculo_id}.` });
      }

      const viajes = await ViajeModel.getByVehiculo(vehiculo_id);
      const totalKm = viajes.reduce((acc, curr) => acc + Number(curr.kilometros || 0), 0);

      return res.status(200).json({
        vehiculo,
        total_kilometros: totalKm,
        total_viajes: viajes.length,
        viajes
      });
    } catch (error) {
      console.error('Error al obtener historial por vehiculo:', error);
      return res.status(500).json({ error: 'Error interno al obtener historial de viajes por vehiculo.' });
    }
  },

  async getHistorialByConductor(req, res) {
    try {
      const { conductor_id } = req.params;
      const conductor = await ConductorModel.getById(conductor_id);
      if (!conductor) {
        return res.status(404).json({ error: `No se encontro el conductor con id ${conductor_id}.` });
      }

      const viajes = await ViajeModel.getByConductor(conductor_id);
      const totalKm = viajes.reduce((acc, curr) => acc + Number(curr.kilometros || 0), 0);

      return res.status(200).json({
        conductor,
        total_kilometros: totalKm,
        total_viajes: viajes.length,
        viajes
      });
    } catch (error) {
      console.error('Error al obtener historial por conductor:', error);
      return res.status(500).json({ error: 'Error interno al obtener historial de viajes por conductor.' });
    }
  },

  async getTotalesKm(req, res) {
    try {
      const vehiculos = await ViajeModel.getTotalesKilometrosPorVehiculo();
      const conductores = await ViajeModel.getTotalesKilometrosPorConductor();

      return res.status(200).json({
        por_vehiculo: vehiculos,
        por_conductor: conductores
      });
    } catch (error) {
      console.error('Error al obtener totales de km:', error);
      return res.status(500).json({ error: 'Error interno al obtener estadisticas de kilometros.' });
    }
  },

  async create(req, res) {
    try {
      const {
        vehiculo_id,
        conductor_id,
        fecha_salida,
        fecha_llegada,
        origen,
        destino,
        kilometros,
        observaciones
      } = req.body;

      const vehiculo = await VehiculoModel.getById(vehiculo_id);
      if (!vehiculo) {
        return res.status(404).json({ error: `El vehiculo especificado (id: ${vehiculo_id}) no existe.` });
      }

      const conductor = await ConductorModel.getById(conductor_id);
      if (!conductor) {
        return res.status(404).json({ error: `El conductor especificado (id: ${conductor_id}) no existe.` });
      }

      const nuevoViaje = await ViajeModel.create({
        vehiculo_id: Number(vehiculo_id),
        conductor_id: Number(conductor_id),
        fecha_salida,
        fecha_llegada: fecha_llegada || null,
        origen,
        destino,
        kilometros: Number(kilometros),
        observaciones: observaciones || null
      });

      return res.status(201).json({
        mensaje: 'Viaje registrado exitosamente.',
        viaje: nuevoViaje
      });
    } catch (error) {
      console.error('Error al crear viaje:', error);
      return res.status(500).json({ error: 'Error interno al crear viaje.' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        vehiculo_id,
        conductor_id,
        fecha_salida,
        fecha_llegada,
        origen,
        destino,
        kilometros,
        observaciones
      } = req.body;

      const existe = await ViajeModel.getById(id);
      if (!existe) {
        return res.status(404).json({ error: `No se encontro el viaje con id ${id}.` });
      }

      const vehiculo = await VehiculoModel.getById(vehiculo_id);
      if (!vehiculo) {
        return res.status(404).json({ error: `El vehiculo especificado (id: ${vehiculo_id}) no existe.` });
      }

      const conductor = await ConductorModel.getById(conductor_id);
      if (!conductor) {
        return res.status(404).json({ error: `El conductor especificado (id: ${conductor_id}) no existe.` });
      }

      const viajeActualizado = await ViajeModel.update(id, {
        vehiculo_id: Number(vehiculo_id),
        conductor_id: Number(conductor_id),
        fecha_salida,
        fecha_llegada: fecha_llegada || null,
        origen,
        destino,
        kilometros: Number(kilometros),
        observaciones: observaciones || null
      });

      return res.status(200).json({
        mensaje: 'Viaje actualizado exitosamente.',
        viaje: viajeActualizado
      });
    } catch (error) {
      console.error('Error al actualizar viaje:', error);
      return res.status(500).json({ error: 'Error interno al actualizar viaje.' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const existe = await ViajeModel.getById(id);
      if (!existe) {
        return res.status(404).json({ error: `No se encontro el viaje con id ${id}.` });
      }

      await ViajeModel.delete(id);
      return res.status(200).json({ mensaje: 'Viaje eliminado exitosamente.' });
    } catch (error) {
      console.error('Error al eliminar viaje:', error);
      return res.status(500).json({ error: 'Error interno al eliminar viaje.' });
    }
  }
};

module.exports = ViajeController;
