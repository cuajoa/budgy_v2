import { readFileSync } from 'fs';
import { join } from 'path';
import { getPool } from './connection';

export async function runMigrations(): Promise<void> {
  const pool = getPool();
  const migrationDir = join(process.cwd(), 'migration');
  
  try {
    // Leer archivos de migración en orden
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

