import React from 'react';

export default function HomePublica({ usuario, onGoToLogin, onGoToSection }) {
  return (
    <div className="main-container">
      <div className="card" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.25rem', color: 'var(--secondary)', marginBottom: '1rem' }}>
          Sistema Integral de Gestión de Transporte y Flotas
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto 1.5rem auto' }}>
          Plataforma web académica desarrollada para el Trabajo Práctico N.º 3 de Programación IV (UTN FRLaR).
          Permite gestionar vehículos, registrar conductores, asociar viajes y auditar métricas de kilómetros en tiempo real.
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
              Para acceder a las operaciones de creación, edición y administración de flota, iniciá sesión con tu cuenta.
            </p>
            <button className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }} onClick={onGoToLogin}>
              Ingresar al Sistema
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '0.75rem' }}>🚗 Control de Vehículos</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Alta, modificación y baja de unidades vehiculares con validación de patente única, modelo, marca, año y capacidad de carga.
          </p>
        </div>

        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '0.75rem' }}>👨‍✈️ Legajos de Conductores</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Registro de choferes, DNI, licencias profesionales y control estricto de las fechas de vigencia y vencimiento.
          </p>
        </div>

        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '0.75rem' }}>🛣️ Seguimiento de Viajes</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Asociación de vehículo y conductor para cada viaje, control de kilómetros recorridos, origen, destino y trazabilidad.
          </p>
        </div>
      </div>
    </div>
  );
}
