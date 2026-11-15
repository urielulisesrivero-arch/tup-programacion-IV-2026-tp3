import React, { useState, useEffect } from 'react';
import { conductorService } from '../services/api';

export default function ConductoresList() {
  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    numero_documento: '',
    numero_licencia: '',
    fecha_alta_licencia: '',
    fecha_vencimiento_licencia: ''
  });

  const cargarConductores = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await conductorService.getAll();
      setConductores(data);
    } catch (err) {
      setError(err.message || 'Error al cargar los conductores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarConductores();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      nombre: '',
      apellido: '',
      numero_documento: '',
      numero_licencia: '',
      fecha_alta_licencia: '',
      fecha_vencimiento_licencia: ''
    });
    setShowModal(true);
    setError('');
  };

  const handleOpenEdit = (c) => {
    setEditingId(c.id);
    setFormData({
      nombre: c.nombre,
      apellido: c.apellido,
      numero_documento: c.numero_documento,
      numero_licencia: c.numero_licencia,
      fecha_alta_licencia: c.fecha_alta_licencia ? c.fecha_alta_licencia.split('T')[0] : '',
      fecha_vencimiento_licencia: c.fecha_vencimiento_licencia ? c.fecha_vencimiento_licencia.split('T')[0] : ''
    });
    setShowModal(true);
    setError('');
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Seguro que querés dar de baja a ${nombre}?`)) {
      return;
    }
    try {
      await conductorService.delete(id);
      setSuccess('Conductor eliminado correctamente.');
      cargarConductores();
    } catch (err) {
      setError(err.message || 'Error al eliminar conductor.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      setError('Nombre y apellido son obligatorios.');
      return;
    }
    if (!formData.numero_documento.trim() || !formData.numero_licencia.trim()) {
      setError('Documento y número de licencia son obligatorios.');
      return;
    }
    if (!formData.fecha_alta_licencia || !formData.fecha_vencimiento_licencia) {
      setError('Debe indicar las fechas de alta y vencimiento de la licencia.');
      return;
    }

    try {
      if (editingId) {
        await conductorService.update(editingId, formData);
        setSuccess('Conductor actualizado exitosamente.');
      } else {
        await conductorService.create(formData);
        setSuccess('Conductor registrado exitosamente.');
      }
      setShowModal(false);
      cargarConductores();
    } catch (err) {
      setError(err.message || 'Error al guardar conductor.');
    }
  };

  return (
    <div className="main-container">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Gestión de Conductores</h2>
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            + Nuevo Conductor
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {loading ? (
          <p>Cargando conductores...</p>
        ) : conductores.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No hay conductores registrados.</p>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre y Apellido</th>
                  <th>DNI</th>
                  <th>N° Licencia</th>
                  <th>Alta Licencia</th>
                  <th>Vencimiento</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {conductores.map((c) => (
                  <tr key={c.id}>
                    <td>#{c.id}</td>
                    <td><strong>{c.apellido}, {c.nombre}</strong></td>
                    <td>{c.numero_documento}</td>
                    <td><span className="badge badge-info">{c.numero_licencia}</span></td>
                    <td>{c.fecha_alta_licencia ? c.fecha_alta_licencia.split('T')[0] : '-'}</td>
                    <td>{c.fecha_vencimiento_licencia ? c.fecha_vencimiento_licencia.split('T')[0] : '-'}</td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(c)}>
                          Editar
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id, `${c.nombre} ${c.apellido}`)}>
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
              {editingId ? 'Editar Conductor' : 'Registrar Nuevo Conductor'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej. Juan"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Apellido *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej. Pérez"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Número de Documento (DNI) *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej. 38445123"
                    value={formData.numero_documento}
                    onChange={(e) => setFormData({ ...formData, numero_documento: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Número de Licencia *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej. LIC-B2-1234"
                    value={formData.numero_licencia}
                    onChange={(e) => setFormData({ ...formData, numero_licencia: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Fecha Alta de Licencia *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.fecha_alta_licencia}
                    onChange={(e) => setFormData({ ...formData, fecha_alta_licencia: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Fecha Vencimiento Licencia *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.fecha_vencimiento_licencia}
                    onChange={(e) => setFormData({ ...formData, fecha_vencimiento_licencia: e.target.value })}
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
