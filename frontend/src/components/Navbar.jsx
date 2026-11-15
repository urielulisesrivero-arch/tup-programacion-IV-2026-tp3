import React from 'react';

export default function Navbar({ usuario, onLogout, activeTab, onSelectTab }) {
  return (
    <header>
      <div className="navbar">
        <div className="navbar-brand">
          <span>🚚</span>
          <span>TransPorte IV - Gestión de Flota</span>
        </div>
        <div className="navbar-user">
          {usuario ? (
            <>
              <span>Usuario: <strong>{usuario.nombre}</strong></span>
              <button className="btn btn-secondary btn-sm" onClick={onLogout}>
                Cerrar Sesión
              </button>
            </>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => onSelectTab('login')}>
              Iniciar Sesión
            </button>
          )}
        </div>
      </div>

      <nav className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'inicio' ? 'active' : ''}`}
          onClick={() => onSelectTab('inicio')}
        >
          Inicio Público
        </button>
        {usuario && (
          <>
            <button
              className={`tab-btn ${activeTab === 'vehiculos' ? 'active' : ''}`}
              onClick={() => onSelectTab('vehiculos')}
            >
              Vehículos
            </button>
            <button
              className={`tab-btn ${activeTab === 'conductores' ? 'active' : ''}`}
              onClick={() => onSelectTab('conductores')}
            >
              Conductores
            </button>
            <button
              className={`tab-btn ${activeTab === 'viajes' ? 'active' : ''}`}
              onClick={() => onSelectTab('viajes')}
            >
              Viajes
            </button>
            <button
              className={`tab-btn ${activeTab === 'estadisticas' ? 'active' : ''}`}
              onClick={() => onSelectTab('estadisticas')}
            >
              Métricas & Historiales
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
