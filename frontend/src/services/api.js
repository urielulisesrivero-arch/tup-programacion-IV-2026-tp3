/**
 * Modulo central para llamadas a la API REST del backend con fetch
 */

const API_BASE_URL = 'http://localhost:3000/api';

export function getStoredToken() {
  return localStorage.getItem('tp3_token');
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem('tp3_token', token);
  } else {
    localStorage.removeItem('tp3_token');
  }
}

export function getStoredUser() {
  const user = localStorage.getItem('tp3_user');
  try {
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem('tp3_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('tp3_user');
  }
}

export async function apiRequest(endpoint, { method = 'GET', body = null, token = null } = {}) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };

  const activeToken = token || getStoredToken();
  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`;
  }

  const config = {
    method,
    headers
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.error || (data?.detalles ? data.detalles.map(d => `${d.campo}: ${d.mensaje}`).join(', ') : 'Error en la solicitud');
    const error = new Error(errorMsg);
    error.status = response.status;
    error.detalles = data?.detalles;
    throw error;
  }

  return data;
}

// Servicios de Autenticación
export const authService = {
  login: (email, contrasena) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: { email, contrasena }
    }),
  register: (nombre, email, contrasena) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: { nombre, email, contrasena }
    }),
  perfil: () => apiRequest('/auth/perfil')
};

// Servicios de Vehículos
export const vehiculoService = {
  getAll: () => apiRequest('/vehiculos'),
  getById: (id) => apiRequest(`/vehiculos/${id}`),
  create: (data) => apiRequest('/vehiculos', { method: 'POST', body: data }),
  update: (id, data) => apiRequest(`/vehiculos/${id}`, { method: 'PUT', body: data }),
  delete: (id) => apiRequest(`/vehiculos/${id}`, { method: 'DELETE' })
};

// Servicios de Conductores
export const conductorService = {
  getAll: () => apiRequest('/conductores'),
  getById: (id) => apiRequest(`/conductores/${id}`),
  create: (data) => apiRequest('/conductores', { method: 'POST', body: data }),
  update: (id, data) => apiRequest(`/conductores/${id}`, { method: 'PUT', body: data }),
  delete: (id) => apiRequest(`/conductores/${id}`, { method: 'DELETE' })
};

// Servicios de Viajes
export const viajeService = {
  getAll: () => apiRequest('/viajes'),
  getById: (id) => apiRequest(`/viajes/${id}`),
  create: (data) => apiRequest('/viajes', { method: 'POST', body: data }),
  update: (id, data) => apiRequest(`/viajes/${id}`, { method: 'PUT', body: data }),
  delete: (id) => apiRequest(`/viajes/${id}`, { method: 'DELETE' }),
  getTotalesKm: () => apiRequest('/viajes/totales-kilometros'),
  getHistorialVehiculo: (vehiculoId) => apiRequest(`/viajes/historial/vehiculo/${vehiculoId}`),
  getHistorialConductor: (conductorId) => apiRequest(`/viajes/historial/conductor/${conductorId}`)
};
