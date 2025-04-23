const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres.kpdscchbrgbrtfdkjpjs',
  host: 'aws-0-us-east-1.pooler.supabase.com',
  database: 'postgres',
  password: 'XO7pdGpegDA9tVOR',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

(async () => {
  try {
    const client = await pool.connect();
    console.log('Conectado exitosamente a Supabase');
    client.release();
  } catch (err) {
    console.error('Error al conectar con Supabase:', err.stack);
  }
})();

module.exports = pool;
