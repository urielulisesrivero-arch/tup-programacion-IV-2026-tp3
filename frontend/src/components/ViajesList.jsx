import React, { useState, useEffect } from 'react';
import { viajeService, vehiculoService, conductorService } from '../services/api';

export default function ViajesList() {
  const [viajes, setViajes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtros de visualización
  const [filtroVehiculo, setFiltroVehiculo] = useState('');
  const [filtroConductor, setFiltroConductor] = useState('');

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    vehiculo_id: '',
    conductor_id: '',
    fecha_salida: '',
    fecha_llegada: '',
    origen: '',
    destino: '',
    kilometros: '',
    observaciones: ''
  });

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');
      const [vData, vehData, condData] = await Promise.all([
        viajeService.getAll(),
        vehiculoService.getAll(),
        conductorService.getAll()
      ]);
      setViajes(vData);
      setVehiculos(vehData);
      setConductores(condData);
    } catch (err) {
      setError(err.message || 'Error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      vehiculo_id: vehiculos.length > 0 ? vehiculos[0].id : '',
      conductor_id: conductores.length > 0 ? conductores[0].id : '',
      fecha_salida: new Date().toISOString().slice(0, 16),
      fecha_llegada: '',
      origen: '',
      destino: '',
      kilometros: '',
      observaciones: ''
    });
    setShowModal(true);
    setError('');
  };

  const handleOpenEdit = (v) => {
    setEditingId(v.id);
    setFormData({
      vehiculo_id: v.vehiculo_id,
      conductor_id: v.conductor_id,
      fecha_salida: v.fecha_salida ? v.fecha_salida.slice(0, 16) : '',
      fecha_llegada: v.fecha_llegada ? v.fecha_llegada.slice(0, 16) : '',
      origen: v.origen,
      destino: v.destino,
      kilometros: v.kilometros,
      observaciones: v.observaciones || ''
    });
    setShowModal(true);
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`¿Seguro que querés cancelar o eliminar el viaje #${id}?`)) {
      return;
    }
    try {
      await viajeService.delete(id);
      setSuccess('Viaje eliminado exitosamente.');
      cargarDatos();
    } catch (err) {
      setError(err.message || 'Error al eliminar viaje.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.vehiculo_id || !formData.conductor_id) {
      setError('Debes asociar un vehículo y un conductor válidos.');
      return;
    }
    if (!formData.fecha_salida) {
      setError('La fecha y hora de salida es obligatoria.');
      return;
    }
    if (!formData.origen.trim() || !formData.destino.trim()) {
      setError('Origen y destino son obligatorios.');
      return;
    }
    if (!formData.kilometros || Number(formData.kilometros) <= 0) {
      setError('Los kilómetros recorridos deben ser un número mayor a 0.');
      return;
    }

    try {
      if (editingId) {
        await viajeService.update(editingId, formData);
        setSuccess('Viaje actualizado exitosamente.');
      } else {
        await viajeService.create(formData);
        setSuccess('Viaje registrado exitosamente.');
      }
      setShowModal(false);
      cargarDatos();
    } catch (err) {
      setError(err.message || 'Error al guardar viaje.');
    }
  };

  // Filtrado reactivo en frontend
  const viajesFiltrados = viajes.filter((v) => {
    if (filtroVehiculo && v.vehiculo_id.toString() !== filtroVehiculo.toString()) {
      return false;
    }
    if (filtroConductor && v.conductor_id.toString() !== filtroConductor.toString()) {
      return false;
    }
    return true;
  });

  return (
    <div className="main-container">
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Carga y Registro de Viajes</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              Asociación de vehículos, conductores y cálculo de recorridos
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleOpenCreate}
            disabled={vehiculos.length === 0 || conductores.length === 0}
          >
            + Cargar Viaje
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Barra de Filtros rápidos */}
        <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
          <div className="form-group">
            <label>Filtrar por Vehículo:</label>
            <select
              className="form-control"
              value={filtroVehiculo}
              onChange={(e) => setFiltroVehiculo(e.target.value)}
            >
              <option value="">Todos los vehículos</option>
              {vehiculos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.marca} {v.modelo} - {v.patente}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Filtrar por Conductor:</label>
            <select
              className="form-control"
              value={filtroConductor}
              onChange={(e) => setFiltroConductor(e.target.value)}
            >
              <option value="">Todos los conductores</option>
              {conductores.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.apellido}, {c.nombre} (DNI: {c.numero_documento})
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p>Cargando viajes...</p>
        ) : viajesFiltrados.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No se encontraron viajes con los filtros seleccionados.</p>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Vehículo</th>
                  <th>Conductor</th>
                  <th>Ruta</th>
                  <th>Salida / Llegada</th>
                  <th>Km</th>
                  <th>Observaciones</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {viajesFiltrados.map((v) => (
                  <tr key={v.id}>
                    <td>#{v.id}</td>
                    <td>
                      <strong>{v.vehiculo_marca} {v.vehiculo_modelo}</strong>
                      <br />
                      <small className="badge badge-info">{v.vehiculo_patente}</small>
                    </td>
                    <td>
                      {v.conductor_apellido}, {v.conductor_nombre}
                      <br />
                      <small style={{ color: 'var(--text-muted)' }}>DNI: {v.conductor_documento}</small>
                    </td>
                    <td>
                      <strong>{v.origen}</strong> → <strong>{v.destino}</strong>
                    </td>
                    <td>
                      Salida: {v.fecha_salida ? v.fecha_salida.replace('T', ' ').slice(0, 16) : '-'}
                      <br />
                      <small style={{ color: 'var(--text-muted)' }}>
                        Llegada: {v.fecha_llegada ? v.fecha_llegada.replace('T', ' ').slice(0, 16) : 'En tránsito'}
                      </small>
                    </td>
                    <td><strong>{Number(v.kilometros).toLocaleString()} km</strong></td>
                    <td style={{ maxWidth: '200px', fontSize: '0.85rem' }}>
                      {v.observaciones || '-'}
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(v)}>
                          Editar
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v.id)}>
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

      {/* Modal Alta / Edicion */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>
              {editingId ? 'Editar Viaje' : 'Registrar Nuevo Viaje'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Vehículo *</label>
                  <select
                    className="form-control"
                    value={formData.vehiculo_id}
                    onChange={(e) => setFormData({ ...formData, vehiculo_id: e.target.value })}
                    required
                  >
                    <option value="">Seleccione vehículo</option>
                    {vehiculos.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.marca} {v.modelo} ({v.patente})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Conductor *</label>
                  <select
                    className="form-control"
                    value={formData.conductor_id}
                    onChange={(e) => setFormData({ ...formData, conductor_id: e.target.value })}
                    required
                  >
                    <option value="">Seleccione conductor</option>
                    {conductores.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.apellido}, {c.nombre} (DNI: {c.numero_documento})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Origen *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej. La Rioja Capital"
                    value={formData.origen}
                    onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Destino *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej. Córdoba"
                    value={formData.destino}
                    onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Fecha y Hora de Salida *</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={formData.fecha_salida}
                    onChange={(e) => setFormData({ ...formData, fecha_salida: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Fecha y Hora de Llegada</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={formData.fecha_llegada}
                    onChange={(e) => setFormData({ ...formData, fecha_llegada: e.target.value })}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Kilómetros Recorridos *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    placeholder="Ej. 435.5"
                    value={formData.kilometros}
                    onChange={(e) => setFormData({ ...formData, kilometros: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Observaciones</label>
                  <textarea
                    className="form-control"
                    placeholder="Detalles del viaje, condiciones de carga, novedades en ruta..."
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Guardar Cambios' : 'Registrar Viaje'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
