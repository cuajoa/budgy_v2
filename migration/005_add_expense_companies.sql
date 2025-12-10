-- Migration 005: Agregar tabla de relación entre gastos y compañías adicionales
-- Descripción: Permite que un gasto se prorratee entre múltiples compañías

-- Tabla de relación muchos a muchos entre gastos y compañías
CREATE TABLE IF NOT EXISTS expense_companies (
    id SERIAL PRIMARY KEY,
    expense_id INTEGER NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(expense_id, company_id)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_expense_companies_expense_id ON expense_companies(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_companies_company_id ON expense_companies(company_id);

