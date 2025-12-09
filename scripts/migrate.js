// Este script ejecuta las migraciones de base de datos
// Requiere que las variables de entorno estén configuradas en .env
require('dotenv').config({ path: '.env.local' });
require('dotenv').config(); // También intenta cargar .env

const { readFileSync } = require('fs');
const { join } = require('path');
const { Pool } = require('pg');

const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'budgy',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

const pool = new Pool(poolConfig);

async function runMigrations() {
  const migrationDir = join(process.cwd(), 'migration');
  
  try {
    const migrationFiles = [
      '001_create_schema.sql',
      '002_insert_initial_data.sql',
      '003_create_stored_procedures.sql',
    ];

    for (const file of migrationFiles) {
      const filePath = join(migrationDir, file);
      const sql = readFileSync(filePath, 'utf-8');
      
      console.log(`Ejecutando migración: ${file}`);
      await pool.query(sql);
      console.log(`Migración ${file} completada`);
    }
    
    console.log('Todas las migraciones completadas exitosamente');
  } catch (error) {
    console.error('Error ejecutando migraciones:', error);
    throw error;
  }
}

async function closePool() {
  await pool.end();
}

async function main() {
  try {
    await runMigrations();
    await closePool();
    process.exit(0);
  } catch (error) {
    console.error('Error en migración:', error);
    await closePool();
    process.exit(1);
  }
}

main();

