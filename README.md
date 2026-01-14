# DeUna - Sistema de Pagos con Códigos Únicos

## 📋 Descripción

Sistema de pagos peer-to-peer que permite a los usuarios generar códigos de pago únicos y realizar transacciones de forma segura utilizando códigos de 6 dígitos con expiración automática.

## 🏗️ Arquitectura

El proyecto está dividido en dos partes principales:

- **Backend**: API REST desarrollada con Node.js y Express
- **Frontend**: Aplicación web desarrollada con React y Vite

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Entorno de ejecución
- **Express** - Framework web
- **PostgreSQL** (Supabase) - Base de datos
- **bcryptjs** - Encriptación de contraseñas y PINs
- **jsonwebtoken** - Autenticación JWT
- **pg** - Cliente PostgreSQL
- **dotenv** - Variables de entorno
- **nodemon** - Desarrollo

### Frontend
- **React 18** - Biblioteca UI
- **Vite** - Build tool
- **React Router DOM** - Enrutamiento
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Estilos
- **React Hot Toast** - Notificaciones
- **React Icons** - Iconos

## 📁 Estructura del Proyecto

```
SimulacionDeUna/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js              # Configuración de PostgreSQL
│   │   ├── controllers/
│   │   │   ├── authController.js        # Autenticación y registro
│   │   │   ├── codigosPagoController.js # Gestión de códigos
│   │   │   ├── transaccionesController.js
│   │   │   └── usuariosController.js
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js        # Verificación JWT
│   │   │   └── validationMiddleware.js
│   │   ├── models/
│   │   │   ├── CodigoPago.js
│   │   │   ├── Negocio.js
│   │   │   ├── Transaccion.js
│   │   │   └── Usuario.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── codigosPagoRoutes.js
│   │   │   ├── transaccionesRoutes.js
│   │   │   └── usuariosRoutes.js
│   │   ├── services/
│   │   │   ├── codigoService.js
│   │   │   └── transaccionService.js
│   │   ├── utils/
│   │   │   ├── helpers.js
│   │   │   └── validators.js
│   │   └── app.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── auth/
    │   │   │   ├── Login.jsx             # Inicio de sesión
    │   │   │   └── Register.jsx          # Registro de usuarios
    │   │   ├── common/
    │   │   │   ├── Header.jsx            # Barra de navegación
    │   │   │   ├── Loading.jsx
    │   │   │   └── Modal.jsx
    │   │   ├── negocio/
    │   │   │   └── GenerarCodigo.jsx     # Generar códigos de pago
    │   │   └── pago/
    │   │       ├── IngresarCodigo.jsx    # Ingresar código para pagar
    │   │       ├── ConfirmarPago.jsx     # Confirmar transacción
    │   │       └── ResultadoPago.jsx     # Resultado final
    │   ├── contexts/
    │   │   └── AuthContext.jsx           # Contexto de autenticación
    │   ├── hooks/
    │   │   └── useAuth.js
    │   ├── services/
    │   │   ├── api.js                    # Cliente Axios
    │   │   ├── authService.js
    │   │   └── codigoService.js
    │   ├── utils/
    │   │   ├── formatters.js
    │   │   └── validators.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

## 🗄️ Base de Datos

### Tablas Principales

#### usuarios
```sql
CREATE TABLE usuarios (
    usu_id SERIAL PRIMARY KEY,
    usu_cedula VARCHAR(10) UNIQUE NOT NULL,
    usu_nombre VARCHAR(100) NOT NULL,
    usu_apellido VARCHAR(100) NOT NULL,
    usu_telefono VARCHAR(15),
    usu_email VARCHAR(100) UNIQUE NOT NULL,
    usu_password_hash VARCHAR(255) NOT NULL,
    usu_pin_hash VARCHAR(255) NOT NULL,
    usu_saldo DECIMAL(12,2) DEFAULT 0.00,
    usu_activo BOOLEAN DEFAULT TRUE,
    usu_fecha_registro TIMESTAMP DEFAULT NOW()
);
```

#### negocios
```sql
CREATE TABLE negocios (
    neg_id SERIAL PRIMARY KEY,
    neg_ruc VARCHAR(13) UNIQUE NOT NULL,
    neg_razon_social VARCHAR(200) NOT NULL,
    neg_nombre_comercial VARCHAR(200) NOT NULL,
    neg_telefono VARCHAR(15),
    neg_email VARCHAR(100),
    neg_direccion TEXT,
    neg_categoria VARCHAR(100),
    neg_usuario_id INTEGER REFERENCES usuarios(usu_id),
    neg_activo BOOLEAN DEFAULT TRUE,
    neg_fecha_registro TIMESTAMP DEFAULT NOW()
);
```

#### codigos_pago
```sql
CREATE TABLE codigos_pago (
    cod_id SERIAL PRIMARY KEY,
    cod_codigo VARCHAR(6) UNIQUE NOT NULL,
    cod_negocio_id INTEGER REFERENCES negocios(neg_id),
    cod_usuario_generador_id INTEGER REFERENCES usuarios(usu_id),
    cod_monto DECIMAL(12,2) NOT NULL,
    cod_descripcion TEXT,
    cod_estado VARCHAR(20) DEFAULT 'ACTIVO',
    cod_fecha_generacion TIMESTAMP DEFAULT NOW(),
    cod_fecha_expiracion TIMESTAMP NOT NULL,
    cod_usuario_pagador_id INTEGER REFERENCES usuarios(usu_id),
    cod_fecha_pago TIMESTAMP
);
```

#### transacciones
```sql
CREATE TABLE transacciones (
    tra_id SERIAL PRIMARY KEY,
    tra_codigo_pago_id INTEGER REFERENCES codigos_pago(cod_id),
    tra_codigo_referencia VARCHAR(20) UNIQUE DEFAULT generar_codigo_referencia(),
    tra_usuario_origen_id INTEGER REFERENCES usuarios(usu_id),
    tra_negocio_destino_id INTEGER REFERENCES negocios(neg_id),
    tra_monto DECIMAL(12,2) NOT NULL,
    tra_descripcion TEXT,
    tra_estado VARCHAR(20) DEFAULT 'COMPLETADO',
    tra_fecha_hora TIMESTAMP DEFAULT NOW(),
    tra_saldo_anterior_origen DECIMAL(12,2),
    tra_saldo_nuevo_origen DECIMAL(12,2)
);
```

#### intentos_pago
```sql
CREATE TABLE intentos_pago (
    int_id SERIAL PRIMARY KEY,
    int_codigo VARCHAR(6) NOT NULL,
    int_usuario_id INTEGER REFERENCES usuarios(usu_id),
    int_resultado VARCHAR(50) NOT NULL,
    int_mensaje TEXT,
    int_fecha_hora TIMESTAMP DEFAULT NOW()
);
```

### Funciones SQL

#### Generar código único de 6 dígitos
```sql
CREATE OR REPLACE FUNCTION generar_codigo_unico()
RETURNS VARCHAR(6) AS $$
DECLARE
    nuevo_codigo VARCHAR(6);
    existe BOOLEAN;
BEGIN
    LOOP
        nuevo_codigo := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
        SELECT EXISTS(SELECT 1 FROM codigos_pago 
                      WHERE cod_codigo = nuevo_codigo 
                      AND cod_estado = 'ACTIVO') INTO existe;
        EXIT WHEN NOT existe;
    END LOOP;
    RETURN nuevo_codigo;
END;
$$ LANGUAGE plpgsql;
```

#### Expirar códigos vencidos
```sql
CREATE OR REPLACE FUNCTION expirar_codigos_vencidos()
RETURNS void AS $$
BEGIN
    UPDATE codigos_pago
    SET cod_estado = 'EXPIRADO'
    WHERE cod_estado = 'ACTIVO'
    AND cod_fecha_expiracion < NOW();
END;
$$ LANGUAGE plpgsql;
```

## 🔐 API Endpoints

### Autenticación

#### POST `/api/auth/registrar`
Registrar nuevo usuario
```json
{
  "cedula": "1234567890",
  "nombre": "Juan",
  "apellido": "Pérez",
  "telefono": "0987654321",
  "email": "juan@example.com",
  "password": "password123",
  "pin": "1234"
}
```

#### POST `/api/auth/login`
Iniciar sesión
```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```

#### GET `/api/auth/verificar`
Verificar token JWT (requiere autenticación)

### Códigos de Pago

#### POST `/api/codigos/generar`
Generar nuevo código (requiere autenticación)
```json
{
  "negocioId": 1,
  "monto": 25.50,
  "descripcion": "Pago de servicio"
}
```

#### GET `/api/codigos/validar/:codigo`
Validar código antes de pagar (requiere autenticación)

#### POST `/api/codigos/:codigo/pagar`
Realizar pago con código (requiere autenticación)
```json
{
  "pin": "1234"
}
```

### Usuarios

#### GET `/api/usuarios/perfil`
Obtener perfil del usuario autenticado (requiere autenticación)

#### GET `/api/usuarios/:id`
Obtener información de un usuario (requiere autenticación)

#### PUT `/api/usuarios/perfil`
Actualizar perfil (requiere autenticación)

### Transacciones

#### GET `/api/transacciones/historial`
Obtener historial de transacciones (requiere autenticación)

#### GET `/api/transacciones/:id`
Obtener detalle de transacción (requiere autenticación)

## 🚀 Instalación y Configuración

### Requisitos Previos
- Node.js 18+ 
- PostgreSQL o cuenta en Supabase
- npm o yarn

### Backend

1. **Instalar dependencias**
```bash
cd backend
npm install
```

2. **Configurar variables de entorno**

Crear archivo `.env`:
```env
# Servidor
PORT=5000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_KEY=tu_service_key

# Base de datos
DB_HOST=db.tu-proyecto.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=postgres
DB_SSL=true

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura
JWT_EXPIRES_IN=24h

# Códigos
CODIGO_EXPIRATION_MINUTES=3
```

3. **Ejecutar servidor**
```bash
npm run dev
```

### Frontend

1. **Instalar dependencias**
```bash
cd frontend
npm install
```

2. **Configurar variables de entorno**

Crear archivo `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

3. **Ejecutar aplicación**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000` o el puerto que Vite asigne.

## 💡 Flujo de Uso

### 1. Registro e Inicio de Sesión
- El usuario se registra con sus datos personales
- Crea una contraseña y un PIN de 4 dígitos
- Recibe saldo inicial de $100.00

### 2. Generar Código (Cobrar)
- Usuario A quiere recibir un pago
- Accede a la sección "Cobrar" desde el header
- Ingresa el monto a cobrar y una descripción opcional
- Sistema genera código de 6 dígitos válido por 3 minutos
- Usuario A comparte el código con el pagador

### 3. Pagar con Código
- Usuario B recibe el código de 6 dígitos
- Accede a la sección "Pagar" desde el header
- Ingresa el código recibido
- Revisa los detalles del pago (monto, beneficiario)
- Confirma ingresando su PIN de 4 dígitos
- Sistema procesa la transacción

### 4. Resultado de Transacción
- Se muestra confirmación del pago exitoso
- Detalle del monto pagado y nuevo saldo
- Opción para descargar comprobante
- Botón para volver al inicio

## 🔒 Seguridad

### Autenticación
- Contraseñas encriptadas con bcrypt (10 rounds)
- PINs encriptados con bcrypt
- Tokens JWT con expiración de 24 horas
- Middleware de autenticación en rutas protegidas

### Validaciones
- Validación de email único
- Validación de cédula única
- PIN de exactamente 4 dígitos
- Códigos con expiración automática (3 minutos)
- Verificación de saldo antes de transacciones
- Transacciones atómicas con PostgreSQL

### Protección de Transacciones
- Uso de transacciones SQL (BEGIN/COMMIT/ROLLBACK)
- Bloqueo optimista con FOR UPDATE
- Registro de intentos de pago (exitosos y fallidos)
- Validación de PIN antes de procesar pagos

## 🎨 Características del Frontend

### Navegación
- Header con navegación entre "Pagar" y "Cobrar"
- Indicador visual del modo activo
- Información del usuario y saldo en tiempo real
- Botón de cerrar sesión

### Componentes Interactivos
- Inputs de código con auto-focus
- Temporizador de expiración de códigos
- Notificaciones toast para feedback
- Animaciones y transiciones suaves
- Diseño responsive con Tailwind CSS

### Gestión de Estado
- Context API para autenticación global
- LocalStorage para persistencia de sesión
- Hooks personalizados para lógica reutilizable

## 📊 Modelos de Datos

### Usuario
- Información personal (cédula, nombre, apellido)
- Contacto (teléfono, email)
- Seguridad (contraseña hash, PIN hash)
- Saldo actual
- Estado activo/inactivo

### Código de Pago
- Código único de 6 dígitos
- Monto y descripción
- Asociación a negocio y usuario generador
- Estados: ACTIVO, USADO, EXPIRADO, CANCELADO
- Fechas de generación y expiración
- Usuario pagador (una vez usado)

### Transacción
- Código de referencia único
- Usuario origen y destino
- Monto transferido
- Saldos antes y después
- Estado de la transacción
- Timestamp

## 🔄 Flujo de Transacciones

```
1. Usuario genera código
   ↓
2. Sistema crea registro con estado ACTIVO
   ↓
3. Código expira automáticamente después de 3 minutos
   ↓
4. Pagador ingresa código
   ↓
5. Sistema valida:
   - Código existe y está ACTIVO
   - No ha expirado
   - Usuario tiene saldo suficiente
   ↓
6. Pagador confirma con PIN
   ↓
7. Sistema ejecuta transacción atómica:
   - Resta saldo del pagador
   - Suma saldo al receptor
   - Marca código como USADO
   - Crea registro de transacción
   - Registra intento exitoso
   ↓
8. Muestra confirmación y nuevo saldo
```

## 🐛 Solución de Problemas

### Backend no conecta a la base de datos
- Verificar credenciales en `.env`
- Comprobar que Supabase está activo
- Revisar firewall y reglas de red

### Frontend no muestra datos
- Verificar que backend esté corriendo
- Comprobar VITE_API_URL en `.env`
- Revisar consola del navegador para errores

### Error "Código expirado"
- Los códigos solo son válidos por 3 minutos
- Generar un código nuevo si ha expirado

### Saldo no se actualiza
- Verificar que la columna `cod_usuario_generador_id` existe
- Generar códigos nuevos después de agregar la columna
- Revisar logs del backend para errores

## 📝 Notas de Desarrollo

### Convenciones de Código
- Prefijos en nombres de columnas según tabla (ej: `usu_`, `cod_`, `tra_`)
- Nombres de variables en camelCase
- Nombres de archivos en camelCase o kebab-case
- Comentarios descriptivos en código complejo

### Mejoras Futuras
- [ ] Implementar recuperación de contraseña
- [ ] Agregar historial de transacciones en frontend
- [ ] Implementar notificaciones push
- [ ] Agregar gráficos de estadísticas
- [ ] Soporte para múltiples negocios por usuario
- [ ] Implementar límites de transacción diarios
- [ ] Agregar verificación en dos pasos
- [ ] Exportar comprobantes en PDF

## 📄 Licencia

Este proyecto fue desarrollado con fines educativos para la materia de Sistemas Avanzados de Base de Datos.

## 👥 Autor

Erick Tufiño - Quinto Semestre - Universidad

---

**Fecha de creación:** Enero 2026  
**Última actualización:** Enero 14, 2026
