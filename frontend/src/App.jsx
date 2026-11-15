import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePublica from './components/HomePublica';
import Login from './components/Login';
import VehiculosList from './components/VehiculosList';
import ConductoresList from './components/ConductoresList';
import ViajesList from './components/ViajesList';
import MetricasHistorial from './components/MetricasHistorial';
import { getStoredUser, setStoredToken, setStoredUser, authService } from './services/api';

export default function App() {
  const [usuario, setUsuario] = useState(getStoredUser());
  const [activeTab, setActiveTab] = useState('inicio');

  useEffect(() => {
    // Si tenemos token guardado, intentamos verificar perfil
    const checkAuth = async () => {
      try {
        const data = await authService.perfil();
        setUsuario(data.usuario);
        setStoredUser(data.usuario);
      } catch (err) {
        // Token vencido o invalido
        setStoredToken(null);
        setStoredUser(null);
        setUsuario(null);
      }
    };

    if (usuario) {
      checkAuth();
    }
  }, []);

  const handleLogout = () => {
    setStoredToken(null);
    setStoredUser(null);
    setUsuario(null);
    setActiveTab('inicio');
  };

  const handleAuthSuccess = (user) => {
    setUsuario(user);
    setActiveTab('vehiculos');
  };

  return (
    <div>
      <Navbar
        usuario={usuario}
        onLogout={handleLogout}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      <main>
        {activeTab === 'inicio' && (
          <HomePublica
            usuario={usuario}
            onGoToLogin={() => setActiveTab('login')}
            onGoToSection={(sec) => setActiveTab(sec)}
          />
        )}

        {activeTab === 'login' && !usuario && (
          <Login onAuthSuccess={handleAuthSuccess} />
        )}

        {/* Vistas protegidas para usuarios autenticados */}
        {usuario && activeTab === 'vehiculos' && <VehiculosList />}
        {usuario && activeTab === 'conductores' && <ConductoresList />}
        {usuario && activeTab === 'viajes' && <ViajesList />}
        {usuario && activeTab === 'estadisticas' && <MetricasHistorial />}
      </main>
    </div>
  );
}
