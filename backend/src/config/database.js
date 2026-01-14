const { Pool } = require('pg');
const dns = require('dns');
require('dotenv').config();

// Forzar IPv4 globalmente en Node.js para evitar problemas con Render
dns.setDefaultResultOrder('ipv4first');

// Extraer host de SUPABASE_URL
const supabaseUrl = process.env.SUPABASE_URL;
const projectRef = supabaseUrl ? supabaseUrl.split('//')[1].split('.')[0] : '';

// Usar puerto 6543 (Transaction pooler mode) que es más compatible con IPv4
const dbConfig = {
  host: process.env.DB_HOST || `db.${projectRef}.supabase.co`,
  port: parseInt(process.env.DB_PORT) || 6543,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'postgres',
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
};

console.log('🔧 Configurando conexión a PostgreSQL:');
console.log(`   Host: ${dbConfig.host}`);
console.log(`   Port: ${dbConfig.port}`);
console.log(`   Database: ${dbConfig.database}`);
console.log(`   User: ${dbConfig.user}`);

const pool = new Pool(dbConfig);

pool.on('connect', () => {
  console.log('✅ Conexión exitosa a PostgreSQL (Supabase)');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en la base de datos:', err);
});

module.exports = pool;
