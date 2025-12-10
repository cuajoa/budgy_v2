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
      '004_add_company_areas.sql',
      '005_add_expense_companies.sql',
      '006_add_performance_indexes.sql',
    ];

    for (const file of migrationFiles) {
      const filePath = join(migrationDir, file);
      
      // Verificar si el archivo existe
      try {
        const sql = readFileSync(filePath, 'utf-8');
        
        console.log(`\n📄 Ejecutando migración: ${file}`);
        
        // Ejecutar el SQL completo, pero manejar errores de objetos existentes
        try {
          await pool.query(sql);
          console.log(`✓ Migración ${file} completada`);
        } catch (error) {
          const errorMessage = error.message || '';
          
          // Errores que podemos ignorar (objetos que ya existen)
          const ignorableErrors = [
            'already exists',
            'duplicate',
            'relation.*already exists',
            'constraint.*already exists',
            'index.*already exists',
            'trigger.*already exists',
            'function.*already exists',
          ];
          
          const isIgnorable = ignorableErrors.some(pattern => {
            const regex = new RegExp(pattern, 'i');
            return regex.test(errorMessage);
          });
          
          if (isIgnorable) {
            console.log(`⚠️  Algunos objetos ya existen en ${file}, continuando...`);
            console.log(`   Detalle: ${errorMessage.substring(0, 100)}`);
          } else {
            // Si es un error crítico, lanzarlo
            console.error(`❌ Error crítico en migración ${file}:`);
            console.error(`   ${errorMessage}`);
            throw error;
          }
        }
      } catch (fileError) {
        if (fileError.code === 'ENOENT') {
          console.log(`⚠️  Archivo ${file} no encontrado, omitiendo...`);
          continue;
        }
        throw fileError;
      }
    }
    
    console.log('\n✅ Todas las migraciones procesadas exitosamente');
  } catch (error) {
    console.error('\n❌ Error ejecutando migraciones:', error.message);
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

