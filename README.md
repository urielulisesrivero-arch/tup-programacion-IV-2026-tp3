# Trabajo Práctico N.º 3 - Sistema de Gestión de Transporte, Conductores y Viajes

Este proyecto corresponde al **Trabajo Práctico N.º 3 de Programación IV** de la Tecnicatura Universitaria en Programación (Universidad Tecnológica Nacional – Facultad Regional La Rioja).

La aplicación es un sistema web completo (Frontend y Backend) para la administración y trazabilidad de una empresa de transporte logístico. Permite gestionar unidades vehiculares, legajos de conductores, asignación de viajes y consulta de estadísticas de kilómetros recorridos.

---

## 🗂️ Estructura del Proyecto

El repositorio está organizado en dos componentes claramente desacoplados:

```text
tup-programacion-IV-2026-tp3/
│
├── backend/                  # Servidor de API REST en Node.js + Express
│   ├── src/
│   │   ├── config/           # Conexión a base de datos MySQL (mysql2) y estrategia Passport JWT
│   │   ├── controllers/      # Controladores de lógica de negocio (Auth, Vehículos, Conductores, Viajes)
│   │   ├── middlewares/      # Middlewares de autenticación (Passport) y control de validaciones
│   │   ├── models/           # Consultas y persistencia SQL
│   │   ├── routes/           # Rutas expuestas por la API REST
│   │   ├── validators/       # Esquemas de validación exhaustivos con express-validator
│   │   └── app.js            # Punto de entrada de la aplicación Express
│   ├── tests/                # Pruebas de integración con Supertest (npm test)
│   ├── .env.example          # Plantilla de variables de entorno
│   ├── api.http              # Archivo HTTP para pruebas directas de endpoints (REST Client)
│   ├── database.sql          # Script DDL con la creación de tablas y relaciones
│   └── package.json
│
├── frontend/                 # Aplicación cliente construida en Vite + React (JavaScript)
│   ├── src/
│   │   ├── components/       # Componentes de UI (Navbar, Login, Vehículos, Conductores, Viajes, Métricas)
│   │   ├── services/         # Cliente HTTP centralizado (fetch) consumiendo la API REST
│   │   ├── App.jsx           # Componente principal y control de navegación
│   │   ├── index.css         # Estilos en CSS puro (sin dependencias ni librerías externas)
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore                # Reglas de exclusión (node_modules, .env, PDFs)
└── README.md                 # Documentación técnica y guía de puesta en marcha
```

---

## 🚀 Requerimientos y Tecnologías

### Backend
- **Node.js** (v18 o superior)
- **Express.js** para el servidor web y enrutamiento
- **MySQL** como motor relacional con conexión vía `mysql2/promise`
- **Passport.js & passport-jwt** para protección de rutas mediante JWT
- **jsonwebtoken** para generación de tokens con expiración configurada a 4 horas
- **bcryptjs** para encriptación unidireccional con salt de contraseñas
- **express-validator** para saneamiento y validación estricta en todas las rutas (GET, POST, PUT, DELETE)

### Frontend
- **React 18** con **Vite**
- **JavaScript estándar**
- **CSS puro**: Variables CSS, flexbox, grid responsivo y componentes estilizados a mano sin Bootstrap ni Tailwind
- Comunicación con el backend mediante `fetch` nativo

---

## ⚙️ Puesta en Marcha

### 1. Base de Datos MySQL
1. Abrí tu gestor de base de datos MySQL (por ejemplo phpMyAdmin, MySQL Workbench o DBeaver).
2. Ejecutá el script ubicado en:
   ```bash
   backend/database.sql
   ```
   Esto creará la base de datos `tp3_transporte` junto con las tablas `usuarios`, `vehiculos`, `conductores` y `viajes` con sus claves foráneas correspondientes.

### 2. Configurar y Ejecutar el Backend
1. Ingresá a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Instalá las dependencias:
   ```bash
   npm install
   ```
3. Creá tu archivo de variables de entorno `.env` a partir del ejemplo:
   ```bash
   cp .env.example .env
   ```
   *(Asegurate de verificar el host, usuario, contraseña y puerto de tu MySQL local)*.
4. Iniciá el servidor:
   ```bash
   npm run dev
   # o en producción: npm start
   ```
   El backend iniciará en `http://localhost:3000`.

### 3. Configurar y Ejecutar el Frontend
1. Abrí otra terminal y posicionate en la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instalá las dependencias:
   ```bash
   npm install
   ```
3. Iniciá el entorno de desarrollo:
   ```bash
   npm run dev
   ```
4. Abrí en tu navegador la URL indicada (habitualmente `http://localhost:5173`).

---

## 🧪 Pruebas de la API (REST Client)
Dentro de `backend/api.http` contás con todas las peticiones preparadas para probar cada endpoint directamente desde VS Code o cualquier cliente compatible:
- Registro y Login de usuarios
- Obtención de token JWT
- Operaciones CRUD completas para Vehículos
- Operaciones CRUD completas para Conductores
- Registro de Viajes vinculando un vehículo y un conductor
- Consultas de historial por vehículo y por conductor
- Estadísticas y sumatoria de kilómetros totales

---

## ✅ Pruebas Automatizadas
El backend incluye una suite de pruebas de integración con **Supertest** que recorre los flujos principales de la API: registro y login, rutas protegidas con JWT, CRUD de vehículos y conductores, registro de viajes, historial y cálculo de kilómetros totales, además de los casos de validación y de error (400, 401, 403 y 404).

Para ejecutarlas:
```bash
cd backend
npm test
```

Las pruebas crean una base de datos temporal (`tp3_transporte_test`), ejecutan el script `database.sql` sobre ella y la eliminan al finalizar. **No modifican los datos de la base `tp3_transporte`**, por lo que se pueden correr sin riesgo en cualquier momento.

---

## 🔒 Seguridad y Validaciones
- **Contraseñas**: Almacenadas con hash criptográfico bcrypt (cost factor 10). Las respuestas de la API nunca devuelven la contraseña ni en texto plano ni en hash.
- **Tokens JWT**: Duración de 4 horas (`JWT_EXPIRES_IN=4h`).
- **Control de Acceso**: Middleware de Passport para rechazar con HTTP 401 cualquier intento no autenticado a los recursos CRUD.
- **Respuestas HTTP**: Control granular con códigos 200 (OK), 201 (Created), 400 (Bad Request / errores de validación o datos duplicados), 401 (Unauthorized), 403 (Forbidden / token válido de una cuenta eliminada), 404 (Not Found) y 500 (Internal Server Error). No se utiliza 409 (Conflict) porque los datos duplicados se informan con 400.
- **Validaciones en Frontend**: Campos requeridos, tipos de datos numéricos positivos y validación de formatos antes del despacho de peticiones.
