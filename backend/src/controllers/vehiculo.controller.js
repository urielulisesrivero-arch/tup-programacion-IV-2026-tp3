const VehiculoModel = require('../models/vehiculo.model');

const VehiculoController = {
  async getAll(req, res) {
    try {
      const vehiculos = await VehiculoModel.getAll();
      return res.status(200).json(vehiculos);
    } catch (error) {
      console.error('Error al obtener vehiculos:', error);
      return res.status(500).json({ error: 'Error interno al obtener vehiculos.' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const vehiculo = await VehiculoModel.getById(id);
      if (!vehiculo) {
        return res.status(404).json({ error: `No se encontro el vehiculo con id ${id}.` });
      }
      return res.status(200).json(vehiculo);
    } catch (error) {
      console.error('Error al obtener vehiculo:', error);
      return res.status(500).json({ error: 'Error interno al obtener vehiculo.' });
    }
  },

  async create(req, res) {
    try {
      const { marca, modelo, patente, anio, capacidad_carga } = req.body;

      const existente = await VehiculoModel.findByPatente(patente);
      if (existente) {
        return res.status(400).json({ error: 'Ya existe un vehiculo registrado con esa patente.' });
      }

      const nuevoVehiculo = await VehiculoModel.create({
        marca,
        modelo,
        patente: patente.toUpperCase(),
        anio: Number(anio),
        capacidad_carga: Number(capacidad_carga)
      });

      return res.status(201).json({
        mensaje: 'Vehiculo creado exitosamente.',
        vehiculo: nuevoVehiculo
      });
    } catch (error) {
      console.error('Error al crear vehiculo:', error);
      return res.status(500).json({ error: 'Error interno al crear vehiculo.' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { marca, modelo, patente, anio, capacidad_carga } = req.body;

      const existe = await VehiculoModel.getById(id);
      if (!existe) {
        return res.status(404).json({ error: `No se encontro el vehiculo con id ${id}.` });
      }

      const patenteOcupada = await VehiculoModel.findByPatente(patente, id);
      if (patenteOcupada) {
        return res.status(400).json({ error: 'La patente ya pertenece a otro vehiculo.' });
      }

      const vehiculoActualizado = await VehiculoModel.update(id, {
        marca,
        modelo,
        patente: patente.toUpperCase(),
        anio: Number(anio),
        capacidad_carga: Number(capacidad_carga)
      });

      return res.status(200).json({
        mensaje: 'Vehiculo actualizado exitosamente.',
        vehiculo: vehiculoActualizado
      });
    } catch (error) {
      console.error('Error al actualizar vehiculo:', error);
      return res.status(500).json({ error: 'Error interno al actualizar vehiculo.' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const existe = await VehiculoModel.getById(id);
      if (!existe) {
        return res.status(404).json({ error: `No se encontro el vehiculo con id ${id}.` });
      }

      await VehiculoModel.delete(id);
      return res.status(200).json({ mensaje: 'Vehiculo eliminado exitosamente.' });
    } catch (error) {
      console.error('Error al eliminar vehiculo:', error);
      return res.status(500).json({ error: 'Error interno al eliminar vehiculo.' });
    }
  }
};

module.exports = VehiculoController;
