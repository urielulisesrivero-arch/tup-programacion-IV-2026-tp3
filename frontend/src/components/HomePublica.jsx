import React from 'react';

export default function HomePublica({ usuario, onGoToLogin, onGoToSection }) {
  return (
    <div className="main-container">
      <div className="card" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.25rem', color: 'var(--secondary)', marginBottom: '1rem' }}>
          Tu flota, tus viajes y tus números en un solo lugar
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto 1.5rem auto' }}>
          Ruta Clara reúne todo lo que necesitás para organizar el día a día de una empresa de transporte:
          vehículos, conductores y viajes, con el historial de kilómetros siempre a mano.
        </p>

        {usuario ? (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => onGoToSection('vehiculos')}>
              🚗 Administrar Vehículos
            </button>
            <button className="btn btn-primary" onClick={() => onGoToSection('conductores')}>
              👨‍✈️ Administrar Conductores
            </button>
            <button className="btn btn-primary" onClick={() => onGoToSection('viajes')}>
              🗺️ Registrar y Ver Viajes
            </button>
            <button className="btn btn-secondary" onClick={() => onGoToSection('estadisticas')}>
              📊 Ver Métricas e Historial
            </button>
          </div>
        ) : (
          <div>
            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
              Iniciá sesión para cargar vehículos, sumar conductores y registrar los viajes de la empresa.
            </p>
            <button className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }} onClick={onGoToLogin}>
              Iniciar sesión
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '0.75rem' }}>🚗 Vehículos de la empresa</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Cargá cada unidad con su marca, modelo, patente, año y capacidad de carga. El sistema controla que no se repitan las patentes.
          </p>
        </div>

        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '0.75rem' }}>👨‍✈️ Conductores y licencias</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Sumá a los choferes con su documento y licencia, y tené siempre a mano las fechas de alta y de vencimiento.
          </p>
        </div>

        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '0.75rem' }}>🛣️ Viajes y kilómetros</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Asigná un vehículo y un conductor a cada viaje. Después consultá el historial y el total de kilómetros por unidad o por chofer.
          </p>
        </div>
      </div>
    </div>
  );
}
