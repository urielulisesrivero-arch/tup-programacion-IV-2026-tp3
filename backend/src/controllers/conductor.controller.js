const ConductorModel = require('../models/conductor.model');

const ConductorController = {
  async getAll(req, res) {
    try {
      const conductores = await ConductorModel.getAll();
      return res.status(200).json(conductores);
    } catch (error) {
      console.error('Error al obtener conductores:', error);
      return res.status(500).json({ error: 'Error interno al obtener conductores.' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const conductor = await ConductorModel.getById(id);
      if (!conductor) {
        return res.status(404).json({ error: `No se encontro el conductor con id ${id}.` });
      }
      return res.status(200).json(conductor);
    } catch (error) {
      console.error('Error al obtener conductor:', error);
      return res.status(500).json({ error: 'Error interno al obtener conductor.' });
    }
  },

  async create(req, res) {
    try {
      const { nombre, apellido, numero_documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia } = req.body;

      const docExistente = await ConductorModel.findByDocumento(numero_documento);
      if (docExistente) {
        return res.status(400).json({ error: 'Ya existe un conductor con ese numero de documento.' });
      }

      const licExistente = await ConductorModel.findByLicencia(numero_licencia);
      if (licExistente) {
        return res.status(400).json({ error: 'Ya existe un conductor con ese numero de licencia.' });
      }

      const nuevoConductor = await ConductorModel.create({
        nombre,
        apellido,
        numero_documento,
        numero_licencia,
        fecha_alta_licencia,
        fecha_vencimiento_licencia
      });

      return res.status(201).json({
        mensaje: 'Conductor registrado exitosamente.',
        conductor: nuevoConductor
      });
    } catch (error) {
      console.error('Error al registrar conductor:', error);
      return res.status(500).json({ error: 'Error interno al registrar conductor.' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, apellido, numero_documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia } = req.body;

      const existe = await ConductorModel.getById(id);
      if (!existe) {
        return res.status(404).json({ error: `No se encontro el conductor con id ${id}.` });
      }

      const docOcupado = await ConductorModel.findByDocumento(numero_documento, id);
      if (docOcupado) {
        return res.status(400).json({ error: 'El numero de documento ya pertenece a otro conductor.' });
      }

      const licOcupada = await ConductorModel.findByLicencia(numero_licencia, id);
      if (licOcupada) {
        return res.status(400).json({ error: 'El numero de licencia ya pertenece a otro conductor.' });
      }

      const conductorActualizado = await ConductorModel.update(id, {
        nombre,
        apellido,
        numero_documento,
        numero_licencia,
        fecha_alta_licencia,
        fecha_vencimiento_licencia
      });

      return res.status(200).json({
        mensaje: 'Conductor actualizado exitosamente.',
        conductor: conductorActualizado
      });
    } catch (error) {
      console.error('Error al actualizar conductor:', error);
      return res.status(500).json({ error: 'Error interno al actualizar conductor.' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const existe = await ConductorModel.getById(id);
      if (!existe) {
        return res.status(404).json({ error: `No se encontro el conductor con id ${id}.` });
      }

      await ConductorModel.delete(id);
      return res.status(200).json({ mensaje: 'Conductor eliminado exitosamente.' });
    } catch (error) {
      console.error('Error al eliminar conductor:', error);
      return res.status(500).json({ error: 'Error interno al eliminar conductor.' });
    }
  }
};

module.exports = ConductorController;
