/**
 * Pruebas de integracion profundas de la API - TP3 Programacion IV
 *
 * Las pruebas se ejecutan contra una base de datos temporal
 * (tp3_transporte_test) que se crea y se elimina automaticamente en cada
 * corrida, por lo que nunca tocan los datos reales de la aplicacion.
 *
 * Uso:
 *   cd backend
 *   npm test
 */

const path = require('path');
const fs = require('fs');
const assert = require('assert');
require('dotenv').config();

const mysql = require('mysql2/promise');
const request = require('supertest');

const TEST_DB = 'tp3_transporte_test';

const adminConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || ''
};

// ---------------------------------------------------------------------------
// Infraestructura minima de pruebas (sin dependencias extra)
// ---------------------------------------------------------------------------
const resultados = [];

async function test(nombre, fn) {
  try {
    await fn();
    resultados.push({ nombre, ok: true });
    console.log(`  OK    ${nombre}`);
  } catch (error) {
    resultados.push({ nombre, ok: false, error });
    console.log(`  FALLO ${nombre}`);
    console.log(`        ${error.message}`);
  }
}

function assertEstado(res, esperado, contexto = '') {
  assert.strictEqual(
    res.status,
    esperado,
    `${contexto} se esperaba HTTP ${esperado} y se recibio ${res.status}. Respuesta: ${JSON.stringify(res.body)}`
  );
}

// ---------------------------------------------------------------------------
// Preparacion de la base de datos temporal
// ---------------------------------------------------------------------------
async function prepararBaseDeDatos() {
  const admin = await mysql.createConnection(adminConfig);
  await admin.query(`DROP DATABASE IF EXISTS \`${TEST_DB}\``);
  await admin.query(`CREATE DATABASE \`${TEST_DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await admin.end();

  const sql = fs.readFileSync(path.join(__dirname, '..', 'database.sql'), 'utf8');
  const sentencias = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .filter((s) => !/^CREATE DATABASE/i.test(s) && !/^USE /i.test(s));

  const conexion = await mysql.createConnection({ ...adminConfig, database: TEST_DB, multipleStatements: true });
  for (const sentencia of sentencias) {
    await conexion.query(sentencia);
  }
  await conexion.end();

  // Importante: definir el nombre ANTES de requerir la app para que el pool
  // de conexiones apunte a la base temporal.
  process.env.DB_NAME = TEST_DB;
  process.env.NODE_ENV = 'test';
}

async function eliminarBaseDeDatos(pool) {
  try {
    await pool.end();
  } catch (_) {
    // el pool puede estar ya cerrado
  }

  const admin = await mysql.createConnection(adminConfig);
  await admin.query(`DROP DATABASE IF EXISTS \`${TEST_DB}\``);
  await admin.end();
}

// ---------------------------------------------------------------------------
// Datos de prueba
// ---------------------------------------------------------------------------
const usuarioBase = {
  nombre: 'Usuario Prueba',
  email: 'prueba.tp3@example.com',
  contrasena: 'secreto123'
};

const vehiculoBase = {
  marca: 'Volvo',
  modelo: 'FH 460',
  patente: 'ab123cd',
  anio: 2020,
  capacidad_carga: 25000
};

const conductorBase = {
  nombre: 'Juan',
  apellido: 'Perez',
  numero_documento: '30123456',
  numero_licencia: 'LIC-98765',
  fecha_alta_licencia: '2019-05-10',
  fecha_vencimiento_licencia: '2031-05-10'
};

// ---------------------------------------------------------------------------
// Suite principal
// ---------------------------------------------------------------------------
async function ejecutarPruebas(app, pool) {
  let token = '';
  let vehiculoId = 0;
  let conductorId = 0;
  let viajeId = 0;

  console.log('\n[Autenticacion]');

  await test('GET / responde el healthcheck', async () => {
    const res = await request(app).get('/');
    assertEstado(res, 200, 'healthcheck:');
    assert.ok(res.body.estado === 'online');
  });

  await test('POST /api/auth/register crea un usuario sin exponer la contrasena', async () => {
    const res = await request(app).post('/api/auth/register').send(usuarioBase);
    assertEstado(res, 201, 'registro:');
    assert.ok(res.body.usuario.id > 0);
    assert.strictEqual(res.body.usuario.email, usuarioBase.email);
    assert.strictEqual(res.body.usuario.contrasena, undefined);
  });

  await test('POST /api/auth/register rechaza un email repetido', async () => {
    const res = await request(app).post('/api/auth/register').send(usuarioBase);
    assertEstado(res, 400, 'registro duplicado:');
    assert.match(res.body.error, /registrado/i);
  });

  await test('POST /api/auth/register valida email y contrasena', async () => {
    const res = await request(app).post('/api/auth/register').send({
      nombre: 'Otro Usuario',
      email: 'no-es-un-email',
      contrasena: '123'
    });
    assertEstado(res, 400, 'registro invalido:');
    assert.ok(Array.isArray(res.body.detalles) && res.body.detalles.length >= 2);
  });

  await test('POST /api/auth/register no acepta numeros en el nombre', async () => {
    const res = await request(app).post('/api/auth/register').send({
      nombre: 'Usuario123',
      email: 'otro@example.com',
      contrasena: 'secreto123'
    });
    assertEstado(res, 400, 'nombre con numeros:');
  });

  await test('POST /api/auth/login rechaza credenciales incorrectas', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: usuarioBase.email,
      contrasena: 'incorrecta'
    });
    assertEstado(res, 401, 'login incorrecto:');
  });

  await test('POST /api/auth/login devuelve un token JWT valido', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: usuarioBase.email,
      contrasena: usuarioBase.contrasena
    });
    assertEstado(res, 200, 'login:');
    assert.ok(typeof res.body.token === 'string' && res.body.token.split('.').length === 3);
    token = res.body.token;
  });

  await test('GET /api/auth/perfil exige token', async () => {
    const res = await request(app).get('/api/auth/perfil');
    assertEstado(res, 401, 'perfil sin token:');
  });

  await test('GET /api/auth/perfil rechaza un token invalido', async () => {
    const res = await request(app)
      .get('/api/auth/perfil')
      .set('Authorization', 'Bearer token.falso.invalido');
    assertEstado(res, 401, 'perfil token invalido:');
  });

  await test('GET /api/auth/perfil devuelve el usuario autenticado', async () => {
    const res = await request(app).get('/api/auth/perfil').set('Authorization', `Bearer ${token}`);
    assertEstado(res, 200, 'perfil:');
    assert.strictEqual(res.body.usuario.email, usuarioBase.email);
  });

  console.log('\n[Vehiculos]');

  await test('las rutas de vehiculos exigen autenticacion', async () => {
    const res = await request(app).get('/api/vehiculos');
    assertEstado(res, 401, 'vehiculos sin token:');
  });

  await test('POST /api/vehiculos crea un vehiculo y normaliza la patente', async () => {
    const res = await request(app)
      .post('/api/vehiculos')
      .set('Authorization', `Bearer ${token}`)
      .send(vehiculoBase);
    assertEstado(res, 201, 'crear vehiculo:');
    assert.strictEqual(res.body.vehiculo.patente, 'AB123CD');
    vehiculoId = res.body.vehiculo.id;
  });

  await test('POST /api/vehiculos rechaza una patente repetida', async () => {
    const res = await request(app)
      .post('/api/vehiculos')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...vehiculoBase, patente: 'AB123CD' });
    assertEstado(res, 400, 'patente repetida:');
  });

  await test('POST /api/vehiculos rechaza año y capacidad invalidos', async () => {
    const res = await request(app)
      .post('/api/vehiculos')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...vehiculoBase, patente: 'XYZ999', anio: -100, capacidad_carga: 0 });
    assertEstado(res, 400, 'vehiculo invalido:');
    assert.ok(res.body.detalles.length >= 2);
  });

  await test('POST /api/vehiculos rechaza patentes con simbolos', async () => {
    const res = await request(app)
      .post('/api/vehiculos')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...vehiculoBase, patente: 'AB@#$12' });
    assertEstado(res, 400, 'patente invalida:');
  });

  await test('GET /api/vehiculos lista los vehiculos registrados', async () => {
    const res = await request(app).get('/api/vehiculos').set('Authorization', `Bearer ${token}`);
    assertEstado(res, 200, 'listar vehiculos:');
    assert.ok(res.body.some((v) => v.id === vehiculoId));
  });

  await test('GET /api/vehiculos/:id devuelve el vehiculo creado', async () => {
    const res = await request(app)
      .get(`/api/vehiculos/${vehiculoId}`)
      .set('Authorization', `Bearer ${token}`);
    assertEstado(res, 200, 'obtener vehiculo:');
    assert.strictEqual(res.body.patente, 'AB123CD');
  });

  await test('GET /api/vehiculos/:id devuelve 404 si no existe', async () => {
    const res = await request(app)
      .get('/api/vehiculos/999999')
      .set('Authorization', `Bearer ${token}`);
    assertEstado(res, 404, 'vehiculo inexistente:');
  });

  await test('GET /api/vehiculos/:id valida que el id sea numerico', async () => {
    const res = await request(app)
      .get('/api/vehiculos/abc')
      .set('Authorization', `Bearer ${token}`);
    assertEstado(res, 400, 'id invalido:');
  });

  await test('PUT /api/vehiculos/:id actualiza los datos', async () => {
    const res = await request(app)
      .put(`/api/vehiculos/${vehiculoId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...vehiculoBase, marca: 'Scania', patente: 'AB123CD' });
    assertEstado(res, 200, 'actualizar vehiculo:');
    assert.strictEqual(res.body.vehiculo.marca, 'Scania');
  });

  await test('PUT /api/vehiculos/:id impide usar la patente de otro vehiculo', async () => {
    const otro = await request(app)
      .post('/api/vehiculos')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...vehiculoBase, patente: 'OTRO111' });
    assertEstado(otro, 201, 'vehiculo auxiliar:');

    const res = await request(app)
      .put(`/api/vehiculos/${otro.body.vehiculo.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...vehiculoBase, patente: 'AB123CD' });
    assertEstado(res, 400, 'patente ocupada:');

    await request(app)
      .delete(`/api/vehiculos/${otro.body.vehiculo.id}`)
      .set('Authorization', `Bearer ${token}`);
  });

  console.log('\n[Conductores]');

  await test('POST /api/conductores crea un conductor', async () => {
    const res = await request(app)
      .post('/api/conductores')
      .set('Authorization', `Bearer ${token}`)
      .send(conductorBase);
    assertEstado(res, 201, 'crear conductor:');
    conductorId = res.body.conductor.id;
    assert.ok(conductorId > 0);
  });

  await test('POST /api/conductores rechaza documento y licencia repetidos', async () => {
    const res = await request(app)
      .post('/api/conductores')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...conductorBase, nombre: 'Pedro', numero_licencia: 'LIC-00001' });
    assertEstado(res, 400, 'documento repetido:');
  });

  await test('POST /api/conductores valida documento, nombre y fechas', async () => {
    const res = await request(app)
      .post('/api/conductores')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Pedro1',
        apellido: 'Gomez',
        numero_documento: 'ABC123',
        numero_licencia: 'LIC-11111',
        fecha_alta_licencia: 'no-es-fecha',
        fecha_vencimiento_licencia: '2031-01-01'
      });
    assertEstado(res, 400, 'conductor invalido:');
    assert.ok(res.body.detalles.length >= 3);
  });

  await test('POST /api/conductores exige un DNI de 7 u 8 digitos', async () => {
    const res = await request(app)
      .post('/api/conductores')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...conductorBase, numero_documento: '123', numero_licencia: 'LIC-22222' });
    assertEstado(res, 400, 'dni corto:');
  });

  await test('GET /api/conductores lista los conductores', async () => {
    const res = await request(app).get('/api/conductores').set('Authorization', `Bearer ${token}`);
    assertEstado(res, 200, 'listar conductores:');
    assert.ok(res.body.some((c) => c.id === conductorId));
  });

  await test('GET /api/conductores/:id devuelve el conductor creado', async () => {
    const res = await request(app)
      .get(`/api/conductores/${conductorId}`)
      .set('Authorization', `Bearer ${token}`);
    assertEstado(res, 200, 'obtener conductor:');
    assert.strictEqual(res.body.numero_documento, conductorBase.numero_documento);
  });

  await test('GET /api/conductores/:id devuelve 404 si no existe', async () => {
    const res = await request(app)
      .get('/api/conductores/999999')
      .set('Authorization', `Bearer ${token}`);
    assertEstado(res, 404, 'conductor inexistente:');
  });

  await test('PUT /api/conductores/:id actualiza los datos', async () => {
    const res = await request(app)
      .put(`/api/conductores/${conductorId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...conductorBase, apellido: 'Perez Gonzalez' });
    assertEstado(res, 200, 'actualizar conductor:');
    assert.strictEqual(res.body.conductor.apellido, 'Perez Gonzalez');
  });

  console.log('\n[Viajes]');

  await test('POST /api/viajes rechaza un vehiculo inexistente', async () => {
    const res = await request(app)
      .post('/api/viajes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        vehiculo_id: 999999,
        conductor_id: conductorId,
        fecha_salida: '2026-03-01 08:00:00',
        origen: 'La Rioja',
        destino: 'Cordoba',
        kilometros: 420
      });
    assertEstado(res, 404, 'viaje vehiculo inexistente:');
  });

  await test('POST /api/viajes rechaza un conductor inexistente', async () => {
    const res = await request(app)
      .post('/api/viajes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        vehiculo_id: vehiculoId,
        conductor_id: 999999,
        fecha_salida: '2026-03-01 08:00:00',
        origen: 'La Rioja',
        destino: 'Cordoba',
        kilometros: 420
      });
    assertEstado(res, 404, 'viaje conductor inexistente:');
  });

  await test('POST /api/viajes crea un viaje valido', async () => {
    const res = await request(app)
      .post('/api/viajes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        vehiculo_id: vehiculoId,
        conductor_id: conductorId,
        fecha_salida: '2026-03-01 08:00:00',
        fecha_llegada: '2026-03-01 18:30:00',
        origen: 'La Rioja',
        destino: 'Cordoba',
        kilometros: 420.5,
        observaciones: 'Viaje de prueba'
      });
    assertEstado(res, 201, 'crear viaje:');
    viajeId = res.body.viaje.id;
    assert.ok(viajeId > 0);
  });

  await test('POST /api/viajes rechaza kilometros no positivos', async () => {
    const res = await request(app)
      .post('/api/viajes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        vehiculo_id: vehiculoId,
        conductor_id: conductorId,
        fecha_salida: '2026-03-02 08:00:00',
        origen: 'La Rioja',
        destino: 'Cordoba',
        kilometros: 0
      });
    assertEstado(res, 400, 'km invalidos:');
  });

  await test('POST /api/viajes rechaza un origen compuesto solo por numeros', async () => {
    const res = await request(app)
      .post('/api/viajes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        vehiculo_id: vehiculoId,
        conductor_id: conductorId,
        fecha_salida: '2026-03-02 08:00:00',
        origen: '123456',
        destino: 'Cordoba',
        kilometros: 100
      });
    assertEstado(res, 400, 'origen invalido:');
  });

  await test('GET /api/viajes lista los viajes con datos relacionados', async () => {
    const res = await request(app).get('/api/viajes').set('Authorization', `Bearer ${token}`);
    assertEstado(res, 200, 'listar viajes:');
    const viaje = res.body.find((v) => v.id === viajeId);
    assert.ok(viaje);
    assert.strictEqual(viaje.vehiculo_patente, 'AB123CD');
    assert.strictEqual(viaje.conductor_apellido, 'Perez Gonzalez');
  });

  await test('GET /api/viajes?vehiculo_id= filtra por vehiculo', async () => {
    const res = await request(app)
      .get(`/api/viajes?vehiculo_id=${vehiculoId}`)
      .set('Authorization', `Bearer ${token}`);
    assertEstado(res, 200, 'filtrar viajes:');
    assert.ok(res.body.every((v) => v.vehiculo_id === vehiculoId));
  });

  await test('GET /api/viajes/historial/vehiculo/:id calcula los totales', async () => {
    const res = await request(app)
      .get(`/api/viajes/historial/vehiculo/${vehiculoId}`)
      .set('Authorization', `Bearer ${token}`);
    assertEstado(res, 200, 'historial vehiculo:');
    assert.strictEqual(res.body.total_viajes, 1);
    assert.strictEqual(Number(res.body.total_kilometros), 420.5);
  });

  await test('GET /api/viajes/historial/conductor/:id calcula los totales', async () => {
    const res = await request(app)
      .get(`/api/viajes/historial/conductor/${conductorId}`)
      .set('Authorization', `Bearer ${token}`);
    assertEstado(res, 200, 'historial conductor:');
    assert.strictEqual(res.body.total_viajes, 1);
    assert.strictEqual(Number(res.body.total_kilometros), 420.5);
  });

  await test('GET /api/viajes/historial devuelve 404 si el recurso no existe', async () => {
    const res = await request(app)
      .get('/api/viajes/historial/vehiculo/999999')
      .set('Authorization', `Bearer ${token}`);
    assertEstado(res, 404, 'historial inexistente:');
  });

  await test('GET /api/viajes/totales-kilometros agrupa por vehiculo y conductor', async () => {
    const res = await request(app)
      .get('/api/viajes/totales-kilometros')
      .set('Authorization', `Bearer ${token}`);
    assertEstado(res, 200, 'totales kilometros:');
    assert.ok(Array.isArray(res.body.por_vehiculo));
    assert.ok(Array.isArray(res.body.por_conductor));

    const vehiculo = res.body.por_vehiculo.find((v) => v.vehiculo_id === vehiculoId);
    assert.ok(vehiculo);
    assert.strictEqual(Number(vehiculo.total_kilometros), 420.5);
  });

  await test('GET /api/viajes/:id devuelve el viaje creado', async () => {
    const res = await request(app)
      .get(`/api/viajes/${viajeId}`)
      .set('Authorization', `Bearer ${token}`);
    assertEstado(res, 200, 'obtener viaje:');
    assert.strictEqual(res.body.origen, 'La Rioja');
  });

  await test('PUT /api/viajes/:id actualiza el viaje', async () => {
    const res = await request(app)
      .put(`/api/viajes/${viajeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        vehiculo_id: vehiculoId,
        conductor_id: conductorId,
        fecha_salida: '2026-03-01 08:00:00',
        fecha_llegada: '2026-03-01 20:00:00',
        origen: 'La Rioja',
        destino: 'Rosario',
        kilometros: 500,
        observaciones: 'Viaje actualizado'
      });
    assertEstado(res, 200, 'actualizar viaje:');
    assert.strictEqual(res.body.viaje.destino, 'Rosario');
    assert.strictEqual(Number(res.body.viaje.kilometros), 500);
  });

  await test('DELETE /api/viajes/:id elimina el viaje', async () => {
    const res = await request(app)
      .delete(`/api/viajes/${viajeId}`)
      .set('Authorization', `Bearer ${token}`);
    assertEstado(res, 200, 'eliminar viaje:');

    const repetido = await request(app)
      .delete(`/api/viajes/${viajeId}`)
      .set('Authorization', `Bearer ${token}`);
    assertEstado(repetido, 404, 'eliminar viaje inexistente:');
  });

  await test('DELETE /api/conductores/:id elimina el conductor', async () => {
    const res = await request(app)
      .delete(`/api/conductores/${conductorId}`)
      .set('Authorization', `Bearer ${token}`);
    assertEstado(res, 200, 'eliminar conductor:');

    const repetido = await request(app)
      .delete(`/api/conductores/${conductorId}`)
      .set('Authorization', `Bearer ${token}`);
    assertEstado(repetido, 404, 'eliminar conductor inexistente:');
  });

  await test('DELETE /api/vehiculos/:id elimina el vehiculo', async () => {
    const res = await request(app)
      .delete(`/api/vehiculos/${vehiculoId}`)
      .set('Authorization', `Bearer ${token}`);
    assertEstado(res, 200, 'eliminar vehiculo:');
  });

  await test('las rutas inexistentes responden 404', async () => {
    const res = await request(app).get('/api/ruta-que-no-existe');
    assertEstado(res, 404, 'ruta inexistente:');
  });

  // Evita que el pool quede colgado por la conexion usada en los tests
  await pool.query('SELECT 1');
}

// ---------------------------------------------------------------------------
// Ejecucion
// ---------------------------------------------------------------------------
async function main() {
  console.log('Preparando base de datos temporal...');
  await prepararBaseDeDatos();

  const app = require('../src/app');
  const pool = require('../src/config/db');

  try {
    await ejecutarPruebas(app, pool);
  } finally {
    await eliminarBaseDeDatos(pool);
  }

  const fallidos = resultados.filter((r) => !r.ok);
  const aprobados = resultados.length - fallidos.length;

  console.log('\n----------------------------------------');
  console.log(`Pruebas aprobadas: ${aprobados}/${resultados.length}`);

  if (fallidos.length > 0) {
    console.log('Pruebas fallidas:');
    for (const fallo of fallidos) {
      console.log(` - ${fallo.nombre}`);
    }
    process.exitCode = 1;
  } else {
    console.log('Todas las pruebas pasaron correctamente.');
  }
}

main().catch((error) => {
  console.error('\nError inesperado al ejecutar las pruebas:');
  console.error(error);
  process.exitCode = 1;
});
