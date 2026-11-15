import React, { useState, useEffect } from 'react';
import { vehiculoService } from '../services/api';

export default function VehiculosList() {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    patente: '',
    anio: '',
    capacidad_carga: ''
  });

  const cargarVehiculos = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await vehiculoService.getAll();
      setVehiculos(data);
    } catch (err) {
      setError(err.message || 'Error al cargar el listado de vehículos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarVehiculos();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      marca: '',
      modelo: '',
      patente: '',
      anio: new Date().getFullYear(),
      capacidad_carga: ''
    });
    setShowModal(true);
    setError('');
  };

  const handleOpenEdit = (v) => {
    setEditingId(v.id);
    setFormData({
      marca: v.marca,
      modelo: v.modelo,
      patente: v.patente,
      anio: v.anio,
      capacidad_carga: v.capacidad_carga
    });
    setShowModal(true);
    setError('');
  };

  const handleDelete = async (id, patente) => {
    if (!window.confirm(`¿Seguro que querés eliminar el vehículo con patente ${patente}?`)) {
      return;
    }
    try {
      await vehiculoService.delete(id);
      setSuccess('Vehículo eliminado correctamente.');
      cargarVehiculos();
    } catch (err) {
      setError(err.message || 'Error al eliminar vehículo.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones de frontend
    if (!formData.marca.trim() || !formData.modelo.trim() || !formData.patente.trim()) {
      setError('Marca, modelo y patente son campos obligatorios.');
      return;
    }
    if (!formData.anio || Number(formData.anio) < 1900 || Number(formData.anio) > 2100) {
      setError('Por favor ingresá un año válido.');
      return;
    }
    if (!formData.capacidad_carga || Number(formData.capacidad_carga) <= 0) {
      setError('La capacidad de carga debe ser mayor a 0 kg.');
      return;
    }

    try {
      if (editingId) {
        await vehiculoService.update(editingId, formData);
        setSuccess('Vehículo actualizado exitosamente.');
      } else {
        await vehiculoService.create(formData);
        setSuccess('Vehículo registrado exitosamente.');
      }
      setShowModal(false);
      cargarVehiculos();
    } catch (err) {
      setError(err.message || 'Error al guardar vehículo.');
    }
  };

  return (
    <div className="main-container">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Gestión de Vehículos</h2>
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            + Nuevo Vehículo
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {loading ? (
          <p>Cargando vehículos...</p>
        ) : vehiculos.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No hay vehículos registrados en la base de datos.</p>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Patente</th>
                  <th>Año</th>
                  <th>Capacidad (kg)</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {vehiculos.map((v) => (
                  <tr key={v.id}>
                    <td>#{v.id}</td>
                    <td><strong>{v.marca}</strong></td>
                    <td>{v.modelo}</td>
                    <td><span className="badge badge-info">{v.patente}</span></td>
                    <td>{v.anio}</td>
                    <td>{Number(v.capacidad_carga).toLocaleString()} kg</td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(v)}>
                          Editar
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v.id, v.patente)}>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>
              {editingId ? 'Editar Vehículo' : 'Registrar Nuevo Vehículo'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Marca *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej. Mercedes-Benz"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Modelo *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej. Actros 2045"
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Patente *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej. AE123CD"
                    value={formData.patente}
                    onChange={(e) => setFormData({ ...formData, patente: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Año *</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="2023"
                    value={formData.anio}
                    onChange={(e) => setFormData({ ...formData, anio: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <label>Capacidad de Carga (kg) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    placeholder="Ej. 18000.5"
                    value={formData.capacidad_carga}
                    onChange={(e) => setFormData({ ...formData, capacidad_carga: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Guardar Cambios' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
