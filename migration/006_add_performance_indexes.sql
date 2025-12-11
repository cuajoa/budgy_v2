-- Migration 006: Agregar índices para optimizar consultas
-- Descripción: Crea índices adicionales para mejorar el rendimiento de las consultas más frecuentes

-- ============================================
-- ÍNDICES PARA TABLA EXPENSES
-- ============================================

-- Índice compuesto para consultas filtradas por compañía y ordenadas por fecha
-- Usado en: findAll con filtro por companyId, dashboard (agrupación por mes y compañía)
CREATE INDEX IF NOT EXISTS idx_expenses_company_date 
ON expenses(company_id, invoice_date DESC) 
WHERE deleted_at IS NULL;

-- Índice compuesto para consultas filtradas por centro de costo y ordenadas por fecha
-- Usado en: findAll con filtro por costCenterId, dashboard (agrupación por mes y centro de costo)
CREATE INDEX IF NOT EXISTS idx_expenses_cost_center_date 
ON expenses(cost_center_id, invoice_date DESC) 
WHERE deleted_at IS NULL;

-- Índice compuesto para consultas filtradas por proveedor y ordenadas por fecha
-- Usado en: findAll con filtro por providerId
CREATE INDEX IF NOT EXISTS idx_expenses_provider_date 
ON expenses(provider_id, invoice_date DESC) 
WHERE deleted_at IS NULL;

-- Índice compuesto para consultas filtradas por tipo de gasto y ordenadas por fecha
-- Usado en: findAll con filtro por expenseTypeId
CREATE INDEX IF NOT EXISTS idx_expenses_expense_type_date 
ON expenses(expense_type_id, invoice_date DESC) 
WHERE deleted_at IS NULL;

-- Índice compuesto para consultas filtradas por período de presupuesto y ordenadas por fecha
-- Usado en: findAll con filtro por budgetPeriodId
CREATE INDEX IF NOT EXISTS idx_expenses_budget_period_date 
ON expenses(budget_period_id, invoice_date DESC) 
WHERE deleted_at IS NULL;

-- Índice para consultas por rango de fechas (usado en dashboard para agrupar por mes)
-- Usado en: findAll con filtros startDate/endDate, dashboard (agrupación mensual)
CREATE INDEX IF NOT EXISTS idx_expenses_date_range 
ON expenses(invoice_date DESC) 
WHERE deleted_at IS NULL;

-- Índice para búsqueda de facturas duplicadas
-- Usado en: findByInvoiceNumberAndProvider (aunque usa funciones, el índice ayuda)
CREATE INDEX IF NOT EXISTS idx_expenses_invoice_provider 
ON expenses(provider_id, invoice_number) 
WHERE deleted_at IS NULL AND invoice_number IS NOT NULL;

-- Índice para consultas por created_at (usado en findByInvoiceNumberAndProvider ORDER BY)
CREATE INDEX IF NOT EXISTS idx_expenses_created_at 
ON expenses(created_at DESC) 
WHERE deleted_at IS NULL;

-- Índice compuesto para consultas que filtran por múltiples campos comunes
-- Optimiza consultas con filtros combinados (company + cost_center, etc.)
CREATE INDEX IF NOT EXISTS idx_expenses_company_cost_center 
ON expenses(company_id, cost_center_id, invoice_date DESC) 
WHERE deleted_at IS NULL;

-- ============================================
-- ÍNDICES PARA TABLA EXPENSE_COMPANIES
-- ============================================

-- Índice compuesto para consultas que buscan gastos por compañía adicional
-- Usado en: dashboard (prorrateo), findAll con filtro por companyId que incluye adicionales
CREATE INDEX IF NOT EXISTS idx_expense_companies_company_expense 
ON expense_companies(company_id, expense_id);

-- ============================================
-- ÍNDICES PARA TABLA PROVIDERS
-- ============================================

-- Índice para búsqueda por tax_id (CUIT) normalizado
-- Usado en: findByTaxId (aunque usa funciones, el índice ayuda)
CREATE INDEX IF NOT EXISTS idx_providers_tax_id 
ON providers(tax_id) 
WHERE deleted_at IS NULL AND tax_id IS NOT NULL;

-- Índice para consultas que filtran por deleted_at
CREATE INDEX IF NOT EXISTS idx_providers_deleted_at 
ON providers(deleted_at) 
WHERE deleted_at IS NULL;

-- ============================================
-- ÍNDICES PARA TABLA BUDGET_PERIODS
-- ============================================

-- Índice compuesto para búsqueda del período activo
-- Usado en: findActive (WHERE is_active = true AND deleted_at IS NULL)
CREATE INDEX IF NOT EXISTS idx_budget_periods_active 
ON budget_periods(is_active, start_date DESC) 
WHERE deleted_at IS NULL;

-- Índice para consultas ordenadas por fecha de inicio
CREATE INDEX IF NOT EXISTS idx_budget_periods_start_date 
ON budget_periods(start_date DESC) 
WHERE deleted_at IS NULL;

-- ============================================
-- ÍNDICES PARA TABLA COST_CENTERS
-- ============================================

-- Índice compuesto para consultas filtradas por compañía
-- Usado en: findAll con filtro por companyId
CREATE INDEX IF NOT EXISTS idx_cost_centers_company_deleted 
ON cost_centers(company_id, deleted_at) 
WHERE deleted_at IS NULL;

-- ============================================
-- ÍNDICES PARA TABLA COMPANY_AREAS
-- ============================================

-- Índice compuesto para consultas filtradas por compañía
-- Usado en: findAll con filtro por companyId
CREATE INDEX IF NOT EXISTS idx_company_areas_company_deleted 
ON company_areas(company_id, deleted_at) 
WHERE deleted_at IS NULL;

-- ============================================
-- ÍNDICES PARA OTRAS TABLAS
-- ============================================

-- Índice para companies (deleted_at)
CREATE INDEX IF NOT EXISTS idx_companies_deleted_at 
ON companies(deleted_at) 
WHERE deleted_at IS NULL;

-- Índice para expense_types (deleted_at)
CREATE INDEX IF NOT EXISTS idx_expense_types_deleted_at 
ON expense_types(deleted_at) 
WHERE deleted_at IS NULL;

-- ============================================
-- COMENTARIOS SOBRE LOS ÍNDICES
-- ============================================
-- 
-- Índices parciales (WHERE deleted_at IS NULL):
-- - Reducen el tamaño del índice al excluir registros eliminados
-- - Mejoran el rendimiento en consultas que siempre filtran por deleted_at IS NULL
-- - Son más eficientes en espacio y velocidad
--
-- Índices compuestos:
-- - Optimizan consultas que filtran por múltiples columnas
-- - El orden de las columnas es importante: primero las más selectivas
-- - Incluyen ORDER BY en el índice cuando es posible
--
-- Índices con funciones:
-- - Algunas consultas usan funciones (REPLACE, UPPER, TRIM) que no pueden usar índices directamente
-- - Los índices en las columnas base aún ayudan al optimizador
-- - Considerar índices funcionales si PostgreSQL lo soporta (versión 12+)



