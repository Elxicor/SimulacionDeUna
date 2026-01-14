const { Pool } = require('pg');
require('dotenv').config();

let dbConfig;

// Si existe DATABASE_URL (Render/producción), usarla directamente
if (process.env.DATABASE_URL) {
  console.log('🔧 Usando DATABASE_URL para conexión');
  dbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000
  };
} else {
  // Configuración manual para desarrollo
  const supabaseUrl = process.env.SUPABASE_URL;
  const projectRef = supabaseUrl ? supabaseUrl.split('//')[1].split('.')[0] : '';
  
  const host = process.env.DB_HOST || `db.${projectRef}.supabase.co`;
  const port = parseInt(process.env.DB_PORT) || 5432;
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME || 'postgres';
  
  console.log('🔧 Configurando conexión a PostgreSQL:');
  console.log(`   Host: ${host}`);
  console.log(`   Port: ${port}`);
  console.log(`   Database: ${database}`);
  console.log(`   User: ${user}`);
  
  dbConfig = {
    host,
    port,
    user,
    password,
    database,
    ssl: {
      rejectUnauthorized: false
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000
  };
}

const pool = new Pool(dbConfig);

pool.on('connect', () => {
  console.log('✅ Conexión exitosa a PostgreSQL (Supabase)');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en la base de datos:', err);
});

module.exports = pool;
