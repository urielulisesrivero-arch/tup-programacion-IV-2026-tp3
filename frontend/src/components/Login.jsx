import React, { useState } from 'react';
import { authService, setStoredToken, setStoredUser } from '../services/api';

export default function Login({ onAuthSuccess }) {
  const [esRegistro, setEsRegistro] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    contrasena: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Validaciones en el frontend
    if (!formData.email.trim() || !formData.contrasena.trim()) {
      setError('Por favor completá todos los campos requeridos.');
      return;
    }
    if (esRegistro && !formData.nombre.trim()) {
      setError('Por favor ingresá tu nombre completo.');
      return;
    }
    if (formData.contrasena.length < 6) {
      setError('La contraseña debe tener un mínimo de 6 caracteres.');
      return;
    }

    try {
      setLoading(true);
      if (esRegistro) {
        await authService.register(formData.nombre, formData.email, formData.contrasena);
        setSuccessMsg('¡Usuario registrado con éxito! Ahora podés iniciar sesión.');
        setEsRegistro(false);
        setFormData({ nombre: '', email: formData.email, contrasena: '' });
      } else {
        const data = await authService.login(formData.email, formData.contrasena);
        setStoredToken(data.token);
        setStoredUser(data.usuario);
        onAuthSuccess(data.usuario);
      }
    } catch (err) {
      setError(err.message || 'Error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">
          {esRegistro ? 'Crear Cuenta' : 'Iniciar Sesión'}
        </h2>
        <p className="auth-subtitle">
          {esRegistro
            ? 'Completá tus datos para acceder al sistema'
            : 'Ingresá tus credenciales para administrar la flota'}
        </p>

        {error && <div className="alert alert-danger">{error}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        <form onSubmit={handleSubmit}>
          {esRegistro && (
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Nombre y Apellido *</label>
              <input
                type="text"
                name="nombre"
                className="form-control"
                placeholder="Ej. Uriel Rivero"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Correo Electrónico *</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="tuemail@ejemplo.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Contraseña * (mínimo 6 caracteres)</label>
            <input
              type="password"
              name="contrasena"
              className="form-control"
              placeholder="••••••••"
              value={formData.contrasena}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem' }}
            disabled={loading}
          >
            {loading ? 'Procesando...' : esRegistro ? 'Registrarme' : 'Entrar'}
          </button>
        </form>

        <div className="auth-toggle">
          {esRegistro ? (
            <>
              ¿Ya tenés cuenta?
              <button
                type="button"
                onClick={() => {
                  setEsRegistro(false);
                  setError('');
                }}
              >
                Iniciá sesión aquí
              </button>
            </>
          ) : (
            <>
              ¿No tenés una cuenta todavía?
              <button
                type="button"
                onClick={() => {
                  setEsRegistro(true);
                  setError('');
                }}
              >
                Registrate acá
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
