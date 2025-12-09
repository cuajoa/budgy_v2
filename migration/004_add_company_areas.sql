-- Migration 004: Agregar tabla de áreas de compañía y relación con gastos
-- Descripción: Agrega la tabla de áreas asociadas de compañía y la relación opcional con expenses

-- Tabla de áreas de compañía
CREATE TABLE IF NOT EXISTS company_areas (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    UNIQUE(company_id, name)
);

-- Agregar columna de área asociada a expenses (opcional)
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS company_area_id INTEGER NULL REFERENCES company_areas(id) ON DELETE SET NULL;

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_company_areas_company_id ON company_areas(company_id);
CREATE INDEX IF NOT EXISTS idx_expenses_company_area_id ON expenses(company_area_id);

-- Trigger para actualizar updated_at en company_areas (idempotente)
DROP TRIGGER IF EXISTS update_company_areas_updated_at ON company_areas;
CREATE TRIGGER update_company_areas_updated_at BEFORE UPDATE ON company_areas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

