import React, { useState, useEffect } from 'react';
import { viajeService, vehiculoService, conductorService } from '../services/api';

export default function MetricasHistorial() {
  const [totales, setTotales] = useState({ por_vehiculo: [], por_conductor: [] });
  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selector para consulta individual de historial
  const [selectedVehiculoId, setSelectedVehiculoId] = useState('');
  const [historialVehiculo, setHistorialVehiculo] = useState(null);

  const [selectedConductorId, setSelectedConductorId] = useState('');
  const [historialConductor, setHistorialConductor] = useState(null);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');
      const [totalesData, vehData, condData] = await Promise.all([
        viajeService.getTotalesKm(),
        vehiculoService.getAll(),
        conductorService.getAll()
      ]);
      setTotales(totalesData);
      setVehiculos(vehData);
      setConductores(condData);
    } catch (err) {
      setError(err.message || 'Error al cargar estadísticas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleBuscarHistorialVehiculo = async (id) => {
    setSelectedVehiculoId(id);
    if (!id) {
      setHistorialVehiculo(null);
      return;
    }
    try {
      const data = await viajeService.getHistorialVehiculo(id);
      setHistorialVehiculo(data);
    } catch (err) {
      setError(err.message || 'Error al obtener historial del vehículo.');
    }
  };

  const handleBuscarHistorialConductor = async (id) => {
    setSelectedConductorId(id);
    if (!id) {
      setHistorialConductor(null);
      return;
    }
    try {
      const data = await viajeService.getHistorialConductor(id);
      setHistorialConductor(data);
    } catch (err) {
      setError(err.message || 'Error al obtener historial del conductor.');
    }
  };

  const totalKmGeneral = (totales.por_vehiculo || []).reduce(
    (acc, v) => acc + Number(v.total_kilometros || 0),
    0
  );

  return (
    <div className="main-container">
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Tarjeta de métricas generales */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Kilómetros Totales de Flota</div>
          <div className="stat-value">{totalKmGeneral.toLocaleString()} km</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Vehículos Operativos</div>
          <div className="stat-value">{vehiculos.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Conductores Registrados</div>
          <div className="stat-value">{conductores.length}</div>
        </div>
      </div>

      {/* Totales agrupados por vehículo */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '1rem' }}>
          📊 Kilómetros Recorridos por Vehículo
        </h3>
        {loading ? (
          <p>Calculando estadísticas...</p>
        ) : totales.por_vehiculo.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No hay datos suficientes de viajes.</p>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Vehículo</th>
                  <th>Patente</th>
                  <th>Viajes Realizados</th>
                  <th>Total Kilómetros</th>
                </tr>
              </thead>
              <tbody>
                {totales.por_vehiculo.map((v) => (
                  <tr key={v.vehiculo_id}>
                    <td><strong>{v.marca} {v.modelo}</strong></td>
                    <td><span className="badge badge-info">{v.patente}</span></td>
                    <td>{v.total_viajes} viajes</td>
                    <td><strong style={{ color: 'var(--primary)' }}>{Number(v.total_kilometros).toLocaleString()} km</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Totales agrupados por conductor */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '1rem' }}>
          👨‍✈️ Kilómetros Recorridos por Conductor
        </h3>
        {loading ? (
          <p>Calculando estadísticas...</p>
        ) : totales.por_conductor.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No hay datos suficientes de viajes.</p>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Conductor</th>
                  <th>DNI</th>
                  <th>Viajes Realizados</th>
                  <th>Total Kilómetros</th>
                </tr>
              </thead>
              <tbody>
                {totales.por_conductor.map((c) => (
                  <tr key={c.conductor_id}>
                    <td><strong>{c.apellido}, {c.nombre}</strong></td>
                    <td>{c.numero_documento}</td>
                    <td>{c.total_viajes} viajes</td>
                    <td><strong style={{ color: 'var(--success)' }}>{Number(c.total_kilometros).toLocaleString()} km</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Consulta de Historial Específico */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Historial por vehiculo */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '0.75rem' }}>
            🔍 Historial por Vehículo
          </h3>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <select
              className="form-control"
              value={selectedVehiculoId}
              onChange={(e) => handleBuscarHistorialVehiculo(e.target.value)}
            >
              <option value="">Seleccione un vehículo para ver su historial</option>
              {vehiculos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.marca} {v.modelo} ({v.patente})
                </option>
              ))}
            </select>
          </div>

          {historialVehiculo && (
            <div>
              <div className="alert alert-info">
                <strong>Total acumulado:</strong> {Number(historialVehiculo.total_kilometros).toLocaleString()} km en {historialVehiculo.total_viajes} viajes.
              </div>
              <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                {historialVehiculo.viajes.map((viaje) => (
                  <li key={viaje.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                    <div><strong>{viaje.origen} → {viaje.destino}</strong> ({Number(viaje.kilometros).toLocaleString()} km)</div>
                    <small style={{ color: 'var(--text-muted)' }}>
                      Conductor: {viaje.conductor_apellido}, {viaje.conductor_nombre} | Salida: {viaje.fecha_salida ? viaje.fecha_salida.slice(0, 10) : '-'}
                    </small>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Historial por conductor */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '0.75rem' }}>
            🔍 Historial por Conductor
          </h3>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <select
              className="form-control"
              value={selectedConductorId}
              onChange={(e) => handleBuscarHistorialConductor(e.target.value)}
            >
              <option value="">Seleccione un conductor para ver su historial</option>
              {conductores.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.apellido}, {c.nombre} (DNI: {c.numero_documento})
                </option>
              ))}
            </select>
          </div>

          {historialConductor && (
            <div>
              <div className="alert alert-info">
                <strong>Total acumulado:</strong> {Number(historialConductor.total_kilometros).toLocaleString()} km en {historialConductor.total_viajes} viajes.
              </div>
              <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                {historialConductor.viajes.map((viaje) => (
                  <li key={viaje.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                    <div><strong>{viaje.origen} → {viaje.destino}</strong> ({Number(viaje.kilometros).toLocaleString()} km)</div>
                    <small style={{ color: 'var(--text-muted)' }}>
                      Vehículo: {viaje.vehiculo_marca} {viaje.vehiculo_modelo} ({viaje.vehiculo_patente}) | Salida: {viaje.fecha_salida ? viaje.fecha_salida.slice(0, 10) : '-'}
                    </small>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
