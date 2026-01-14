const { Pool } = require('pg');
require('dotenv').config();

// Extraer host de SUPABASE_URL
const supabaseUrl = process.env.SUPABASE_URL;
const projectRef = supabaseUrl ? supabaseUrl.split('//')[1].split('.')[0] : '';

const pool = new Pool({
  host: process.env.DB_HOST || `db.${projectRef}.supabase.co`,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'postgres',
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('✅ Conexión exitosa a PostgreSQL (Supabase)');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en la base de datos:', err);
});

module.exports = pool;
