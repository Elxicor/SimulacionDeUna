const { Pool } = require('pg');
require('dotenv').config();

// Extraer project ref de SUPABASE_URL
const supabaseUrl = process.env.SUPABASE_URL;
const projectRef = supabaseUrl ? supabaseUrl.split('//')[1].split('.')[0] : '';

// En producción, usar el pooler de Supabase (puerto 6543) que tiene mejor soporte IPv4
// Host alternativo: aws-0-us-east-1.pooler.supabase.com en lugar de db.*.supabase.co
const isProduction = process.env.NODE_ENV === 'production';
const host = process.env.DB_HOST || `db.${projectRef}.supabase.co`;
const port = parseInt(process.env.DB_PORT) || (isProduction ? 6543 : 5432);
const user = process.env.DB_USER || 'postgres';
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME || 'postgres';

console.log('🔧 Configurando conexión a PostgreSQL:');
console.log(`   Host: ${host}`);
console.log(`   Port: ${port}`);
console.log(`   Database: ${database}`);
console.log(`   User: ${user}`);
console.log(`   Environment: ${process.env.NODE_ENV}`);

const dbConfig = {
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

const pool = new Pool(dbConfig);

pool.on('connect', () => {
  console.log('✅ Conexión exitosa a PostgreSQL (Supabase)');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en la base de datos:', err);
});

module.exports = pool;
