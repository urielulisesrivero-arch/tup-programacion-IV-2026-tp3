import React, { useState, useEffect } from 'react';
import { conductorService } from '../services/api';

export default function ConductoresList() {
  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtro de búsqueda
  const [busqueda, setBusqueda] = useState('');

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

    const soloLetrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;

    // Validación: Nombre y Apellido sin números
    if (!formData.nombre.trim() || !soloLetrasRegex.test(formData.nombre.trim())) {
      setError('El nombre solo debe contener letras (no se permiten números ni caracteres especiales).');
      return;
    }

    if (!formData.apellido.trim() || !soloLetrasRegex.test(formData.apellido.trim())) {
      setError('El apellido solo debe contener letras (no se permiten números ni caracteres especiales).');
      return;
    }

    const dniLimpio = formData.numero_documento.trim();
    if (!/^\d{7,8}$/.test(dniLimpio)) {
      setError('El DNI debe contener únicamente entre 7 y 8 números (sin puntos, letras ni signos negativos).');
      return;
    }

    if (!formData.numero_licencia.trim()) {
      setError('El número de licencia es obligatorio.');
      return;
    }

    if (!formData.fecha_alta_licencia || !formData.fecha_vencimiento_licencia) {
      setError('Debe indicar las fechas de alta y vencimiento de la licencia.');
      return;
    }

    if (new Date(formData.fecha_vencimiento_licencia) <= new Date(formData.fecha_alta_licencia)) {
      setError('La fecha de vencimiento de la licencia debe ser posterior a la fecha de alta.');
      return;
    }

    try {
      const payload = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        numero_documento: dniLimpio,
        numero_licencia: formData.numero_licencia.trim().toUpperCase(),
        fecha_alta_licencia: formData.fecha_alta_licencia,
        fecha_vencimiento_licencia: formData.fecha_vencimiento_licencia
      };

      if (editingId) {
        await conductorService.update(editingId, payload);
        setSuccess('Conductor actualizado exitosamente.');
      } else {
        await conductorService.create(payload);
        setSuccess('Conductor registrado exitosamente.');
      }
      setShowModal(false);
      cargarConductores();
    } catch (err) {
      setError(err.message || 'Error al guardar conductor.');
    }
  };

  // Filtrado reactivo por nombre, apellido, DNI o licencia
  const conductoresFiltrados = conductores.filter((c) => {
    if (!busqueda.trim()) return true;
    const term = busqueda.toLowerCase().trim();
    const nombreCompleto = `${c.nombre} ${c.apellido}`.toLowerCase();
    const apellidoCompleto = `${c.apellido} ${c.nombre}`.toLowerCase();
    const dni = (c.numero_documento || '').toString();
    const licencia = (c.numero_licencia || '').toLowerCase();
    return (
      nombreCompleto.includes(term) ||
      apellidoCompleto.includes(term) ||
      dni.includes(term) ||
      licencia.includes(term)
    );
  });

  return (
    <div className="main-container">
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Conductores</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              Padrón de choferes registrados y licencias habilitadas
            </p>
          </div>
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            + Nuevo Conductor
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Buscador / Filtro */}
        <div style={{ marginBottom: '1.25rem' }}>
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Buscar conductor por nombre, apellido, DNI o número de licencia..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {loading ? (
          <p>Cargando conductores...</p>
        ) : conductoresFiltrados.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>
            {busqueda ? 'No se encontraron conductores con ese criterio de búsqueda.' : 'No hay conductores registrados.'}
          </p>
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
                {conductoresFiltrados.map((c) => (
                  <tr key={c.id}>
                    <td>#{c.id}</td>
                    <td><strong>{c.apellido}, {c.nombre}</strong></td>
                    <td><span className="badge badge-neutral">{c.numero_documento}</span></td>
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
                  <label>Nombre * (solo letras)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej. Juan"
                    value={formData.nombre}
                    onChange={(e) => {
                      // Filtrar números si intentan tipearlos
                      const sinNumeros = e.target.value.replace(/[0-9]/g, '');
                      setFormData({ ...formData, nombre: sinNumeros });
                    }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Apellido * (solo letras)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej. Pérez"
                    value={formData.apellido}
                    onChange={(e) => {
                      // Filtrar números si intentan tipearlos
                      const sinNumeros = e.target.value.replace(/[0-9]/g, '');
                      setFormData({ ...formData, apellido: sinNumeros });
                    }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>DNI (solo números, 7 a 8 dígitos) *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{7,8}"
                    maxLength="8"
                    className="form-control"
                    placeholder="Ej. 38445123"
                    value={formData.numero_documento}
                    onChange={(e) => {
                      // Solo permitir números positivos
                      const soloNumeros = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, numero_documento: soloNumeros });
                    }}
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
                  {editingId ? 'Guardar Cambios' : 'Registrar Conductor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
