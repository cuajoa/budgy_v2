import { Pool } from 'pg';
import { getPool } from '../database/connection';
import { IExpenseRepository, ExpenseFilters } from '@/domain/repositories/IExpenseRepository';
import { Expense, CreateExpenseDTO, UpdateExpenseDTO } from '@/domain/entities/Expense';

export class ExpenseRepository implements IExpenseRepository {
  private pool: Pool;

  constructor() {
    this.pool = getPool();
  }

  async findAll(filters?: ExpenseFilters): Promise<Expense[]> {
    let query = `
      SELECT id, company_id, provider_id, cost_center_id, expense_type_id, budget_period_id,
             company_area_id, invoice_number, invoice_date, amount_ars, amount_usd, exchange_rate,
             description, pdf_path, created_by, created_at, updated_at, deleted_at
      FROM expenses
      WHERE deleted_at IS NULL
    `;
    const values: any[] = [];
    let paramCount = 1;

    if (filters) {
      if (filters.companyId) {
        query += ` AND company_id = $${paramCount++}`;
        values.push(filters.companyId);
      }
      if (filters.providerId) {
        query += ` AND provider_id = $${paramCount++}`;
        values.push(filters.providerId);
      }
      if (filters.costCenterId) {
        query += ` AND cost_center_id = $${paramCount++}`;
        values.push(filters.costCenterId);
      }
      if (filters.expenseTypeId) {
        query += ` AND expense_type_id = $${paramCount++}`;
        values.push(filters.expenseTypeId);
      }
      if (filters.budgetPeriodId) {
        query += ` AND budget_period_id = $${paramCount++}`;
        values.push(filters.budgetPeriodId);
      }
      if (filters.startDate) {
        query += ` AND invoice_date >= $${paramCount++}`;
        values.push(filters.startDate);
      }
      if (filters.endDate) {
        query += ` AND invoice_date <= $${paramCount++}`;
        values.push(filters.endDate);
      }
    }

    query += ' ORDER BY invoice_date DESC';

    const result = await this.pool.query(query, values);
    return result.rows.map(this.mapRowToExpense);
  }

  async findById(id: number): Promise<Expense | null> {
    const result = await this.pool.query(
      `SELECT id, company_id, provider_id, cost_center_id, expense_type_id, budget_period_id,
              company_area_id, invoice_number, invoice_date, amount_ars, amount_usd, exchange_rate,
              description, pdf_path, created_by, created_at, updated_at, deleted_at
       FROM expenses WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    return result.rows.length > 0 ? this.mapRowToExpense(result.rows[0]) : null;
  }

  async create(data: CreateExpenseDTO): Promise<Expense> {
    const result = await this.pool.query(
      `INSERT INTO expenses (company_id, provider_id, cost_center_id, expense_type_id, budget_period_id,
                            company_area_id, invoice_number, invoice_date, amount_ars, amount_usd, exchange_rate,
                            description, pdf_path, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING id, company_id, provider_id, cost_center_id, expense_type_id, budget_period_id,
                 company_area_id, invoice_number, invoice_date, amount_ars, amount_usd, exchange_rate,
                 description, pdf_path, created_by, created_at, updated_at, deleted_at`,
      [
        data.companyId,
        data.providerId,
        data.costCenterId,
        data.expenseTypeId,
        data.budgetPeriodId,
        data.companyAreaId || null,
        data.invoiceNumber || null,
        data.invoiceDate,
        data.amountArs,
        data.amountUsd,
        data.exchangeRate,
        data.description || null,
        data.pdfPath || null,
        data.createdBy || null,
      ]
    );
    return this.mapRowToExpense(result.rows[0]);
  }

  async update(id: number, data: UpdateExpenseDTO): Promise<Expense> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.providerId !== undefined) {
      updates.push(`provider_id = $${paramCount++}`);
      values.push(data.providerId);
    }
    if (data.costCenterId !== undefined) {
      updates.push(`cost_center_id = $${paramCount++}`);
      values.push(data.costCenterId);
    }
    if (data.expenseTypeId !== undefined) {
      updates.push(`expense_type_id = $${paramCount++}`);
      values.push(data.expenseTypeId);
    }
    if (data.budgetPeriodId !== undefined) {
      updates.push(`budget_period_id = $${paramCount++}`);
      values.push(data.budgetPeriodId);
    }
    if (data.companyAreaId !== undefined) {
      updates.push(`company_area_id = $${paramCount++}`);
      values.push(data.companyAreaId || null);
    }
    if (data.invoiceNumber !== undefined) {
      updates.push(`invoice_number = $${paramCount++}`);
      values.push(data.invoiceNumber || null);
    }
    if (data.invoiceDate !== undefined) {
      updates.push(`invoice_date = $${paramCount++}`);
      values.push(data.invoiceDate);
    }
    if (data.amountArs !== undefined) {
      updates.push(`amount_ars = $${paramCount++}`);
      values.push(data.amountArs);
    }
    if (data.amountUsd !== undefined) {
      updates.push(`amount_usd = $${paramCount++}`);
      values.push(data.amountUsd);
    }
    if (data.exchangeRate !== undefined) {
      updates.push(`exchange_rate = $${paramCount++}`);
      values.push(data.exchangeRate);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(data.description || null);
    }
    if (data.pdfPath !== undefined) {
      updates.push(`pdf_path = $${paramCount++}`);
      values.push(data.pdfPath || null);
    }

    if (updates.length === 0) {
      const existing = await this.findById(id);
      if (!existing) throw new Error('Expense not found');
      return existing;
    }

    values.push(id);
    const result = await this.pool.query(
      `UPDATE expenses SET ${updates.join(', ')} WHERE id = $${paramCount} AND deleted_at IS NULL
       RETURNING id, company_id, provider_id, cost_center_id, expense_type_id, budget_period_id,
                 company_area_id, invoice_number, invoice_date, amount_ars, amount_usd, exchange_rate,
                 description, pdf_path, created_by, created_at, updated_at, deleted_at`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Expense not found');
    }

    return this.mapRowToExpense(result.rows[0]);
  }

  async delete(id: number): Promise<void> {
    const result = await this.pool.query(
      'UPDATE expenses SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (result.rowCount === 0) {
      throw new Error('Expense not found');
    }
  }

  async findByCompany(companyId: number): Promise<Expense[]> {
    return this.findAll({ companyId });
  }

  async findByCostCenter(costCenterId: number): Promise<Expense[]> {
    return this.findAll({ costCenterId });
  }

  async findByProvider(providerId: number): Promise<Expense[]> {
    return this.findAll({ providerId });
  }

  async findByExpenseType(expenseTypeId: number): Promise<Expense[]> {
    return this.findAll({ expenseTypeId });
  }

  private mapRowToExpense(row: any): Expense {
    return {
      id: row.id,
      companyId: row.company_id,
      providerId: row.provider_id,
      costCenterId: row.cost_center_id,
      expenseTypeId: row.expense_type_id,
      budgetPeriodId: row.budget_period_id,
      companyAreaId: row.company_area_id || undefined,
      invoiceNumber: row.invoice_number,
      invoiceDate: row.invoice_date,
      amountArs: parseFloat(row.amount_ars),
      amountUsd: parseFloat(row.amount_usd),
      exchangeRate: parseFloat(row.exchange_rate),
      description: row.description,
      pdfPath: row.pdf_path,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    };
  }
}

