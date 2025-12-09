-- Migration 003: Crear stored procedures para consultas complejas
-- Descripción: Procedimientos almacenados para reportes y consultas optimizadas

-- Procedimiento para obtener resumen de gastos por centro de costo
CREATE OR REPLACE FUNCTION get_expenses_by_cost_center(
    p_company_id INTEGER DEFAULT NULL,
    p_cost_center_id INTEGER DEFAULT NULL,
    p_period_id INTEGER DEFAULT NULL,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    cost_center_id INTEGER,
    cost_center_name VARCHAR(255),
    company_name VARCHAR(255),
    total_usd DECIMAL(15, 2),
    expense_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cc.id AS cost_center_id,
        cc.name AS cost_center_name,
        c.name AS company_name,
        COALESCE(SUM(e.amount_usd), 0) AS total_usd,
        COUNT(e.id) AS expense_count
    FROM cost_centers cc
    INNER JOIN companies c ON cc.company_id = c.id
    LEFT JOIN expenses e ON e.cost_center_id = cc.id
        AND (p_company_id IS NULL OR e.company_id = p_company_id)
        AND (p_cost_center_id IS NULL OR e.cost_center_id = p_cost_center_id)
        AND (p_period_id IS NULL OR e.budget_period_id = p_period_id)
        AND (p_start_date IS NULL OR e.invoice_date >= p_start_date)
        AND (p_end_date IS NULL OR e.invoice_date <= p_end_date)
        AND e.deleted_at IS NULL
    WHERE cc.deleted_at IS NULL
        AND c.deleted_at IS NULL
        AND (p_company_id IS NULL OR cc.company_id = p_company_id)
        AND (p_cost_center_id IS NULL OR cc.id = p_cost_center_id)
    GROUP BY cc.id, cc.name, c.name
    ORDER BY total_usd DESC;
END;
$$ LANGUAGE plpgsql;

-- Procedimiento para obtener resumen de gastos por tipo
CREATE OR REPLACE FUNCTION get_expenses_by_type(
    p_company_id INTEGER DEFAULT NULL,
    p_type_id INTEGER DEFAULT NULL,
    p_period_id INTEGER DEFAULT NULL,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    expense_type_id INTEGER,
    expense_type_name VARCHAR(255),
    total_usd DECIMAL(15, 2),
    expense_count BIGINT,
    percentage DECIMAL(5, 2)
) AS $$
DECLARE
    v_total DECIMAL(15, 2);
BEGIN
    -- Calcular total para porcentajes
    SELECT COALESCE(SUM(amount_usd), 0) INTO v_total
    FROM expenses
    WHERE deleted_at IS NULL
        AND (p_company_id IS NULL OR company_id = p_company_id)
        AND (p_type_id IS NULL OR expense_type_id = p_type_id)
        AND (p_period_id IS NULL OR budget_period_id = p_period_id)
        AND (p_start_date IS NULL OR invoice_date >= p_start_date)
        AND (p_end_date IS NULL OR invoice_date <= p_end_date);

    RETURN QUERY
    SELECT 
        et.id AS expense_type_id,
        et.name AS expense_type_name,
        COALESCE(SUM(e.amount_usd), 0) AS total_usd,
        COUNT(e.id) AS expense_count,
        CASE 
            WHEN v_total > 0 THEN (COALESCE(SUM(e.amount_usd), 0) * 100.0 / v_total)
            ELSE 0
        END AS percentage
    FROM expense_types et
    LEFT JOIN expenses e ON e.expense_type_id = et.id
        AND e.deleted_at IS NULL
        AND (p_company_id IS NULL OR e.company_id = p_company_id)
        AND (p_type_id IS NULL OR e.expense_type_id = p_type_id)
        AND (p_period_id IS NULL OR e.budget_period_id = p_period_id)
        AND (p_start_date IS NULL OR e.invoice_date >= p_start_date)
        AND (p_end_date IS NULL OR e.invoice_date <= p_end_date)
    WHERE et.deleted_at IS NULL
    GROUP BY et.id, et.name
    ORDER BY total_usd DESC;
END;
$$ LANGUAGE plpgsql;

-- Procedimiento para obtener resumen de gastos por proveedor
CREATE OR REPLACE FUNCTION get_expenses_by_provider(
    p_company_id INTEGER DEFAULT NULL,
    p_provider_id INTEGER DEFAULT NULL,
    p_period_id INTEGER DEFAULT NULL,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    provider_id INTEGER,
    provider_name VARCHAR(255),
    total_usd DECIMAL(15, 2),
    expense_count BIGINT,
    avg_amount_usd DECIMAL(15, 2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS provider_id,
        p.name AS provider_name,
        COALESCE(SUM(e.amount_usd), 0) AS total_usd,
        COUNT(e.id) AS expense_count,
        CASE 
            WHEN COUNT(e.id) > 0 THEN COALESCE(AVG(e.amount_usd), 0)
            ELSE 0
        END AS avg_amount_usd
    FROM providers p
    LEFT JOIN expenses e ON e.provider_id = p.id
        AND e.deleted_at IS NULL
        AND (p_company_id IS NULL OR e.company_id = p_company_id)
        AND (p_provider_id IS NULL OR e.provider_id = p_provider_id)
        AND (p_period_id IS NULL OR e.budget_period_id = p_period_id)
        AND (p_start_date IS NULL OR e.invoice_date >= p_start_date)
        AND (p_end_date IS NULL OR e.invoice_date <= p_end_date)
    WHERE p.deleted_at IS NULL
        AND (p_provider_id IS NULL OR p.id = p_provider_id)
    GROUP BY p.id, p.name
    HAVING COUNT(e.id) > 0 OR p_provider_id IS NOT NULL
    ORDER BY total_usd DESC;
END;
$$ LANGUAGE plpgsql;

-- Procedimiento para obtener resumen de gastos por compañía
CREATE OR REPLACE FUNCTION get_expenses_by_company(
    p_company_id INTEGER DEFAULT NULL,
    p_period_id INTEGER DEFAULT NULL,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    company_id INTEGER,
    company_name VARCHAR(255),
    total_usd DECIMAL(15, 2),
    expense_count BIGINT,
    avg_amount_usd DECIMAL(15, 2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id AS company_id,
        c.name AS company_name,
        COALESCE(SUM(e.amount_usd), 0) AS total_usd,
        COUNT(e.id) AS expense_count,
        CASE 
            WHEN COUNT(e.id) > 0 THEN COALESCE(AVG(e.amount_usd), 0)
            ELSE 0
        END AS avg_amount_usd
    FROM companies c
    LEFT JOIN expenses e ON e.company_id = c.id
        AND e.deleted_at IS NULL
        AND (p_company_id IS NULL OR e.company_id = p_company_id)
        AND (p_period_id IS NULL OR e.budget_period_id = p_period_id)
        AND (p_start_date IS NULL OR e.invoice_date >= p_start_date)
        AND (p_end_date IS NULL OR e.invoice_date <= p_end_date)
    WHERE c.deleted_at IS NULL
        AND (p_company_id IS NULL OR c.id = p_company_id)
    GROUP BY c.id, c.name
    ORDER BY total_usd DESC;
END;
$$ LANGUAGE plpgsql;

