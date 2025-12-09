import { Pool } from 'pg';
import { getPool } from '../database/connection';
import { BudgetPeriod, CreateBudgetPeriodDTO, UpdateBudgetPeriodDTO } from '@/domain/entities/BudgetPeriod';

export interface IBudgetPeriodRepository {
  findAll(): Promise<BudgetPeriod[]>;
  findById(id: number): Promise<BudgetPeriod | null>;
  findActive(): Promise<BudgetPeriod | null>;
  create(data: CreateBudgetPeriodDTO): Promise<BudgetPeriod>;
  update(id: number, data: UpdateBudgetPeriodDTO): Promise<BudgetPeriod>;
  delete(id: number): Promise<void>;
}

export class BudgetPeriodRepository implements IBudgetPeriodRepository {
  private pool: Pool;

  constructor() {
    this.pool = getPool();
  }

  async findAll(): Promise<BudgetPeriod[]> {
    const result = await this.pool.query(
      'SELECT id, description, start_date, end_date, is_active, created_at, updated_at, deleted_at FROM budget_periods WHERE deleted_at IS NULL ORDER BY start_date DESC'
    );
    return result.rows.map(this.mapRowToBudgetPeriod);
  }

  async findById(id: number): Promise<BudgetPeriod | null> {
    const result = await this.pool.query(
      'SELECT id, description, start_date, end_date, is_active, created_at, updated_at, deleted_at FROM budget_periods WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    return result.rows.length > 0 ? this.mapRowToBudgetPeriod(result.rows[0]) : null;
  }

  async findActive(): Promise<BudgetPeriod | null> {
    const result = await this.pool.query(
      'SELECT id, description, start_date, end_date, is_active, created_at, updated_at, deleted_at FROM budget_periods WHERE is_active = true AND deleted_at IS NULL ORDER BY start_date DESC LIMIT 1'
    );
    return result.rows.length > 0 ? this.mapRowToBudgetPeriod(result.rows[0]) : null;
  }

  async create(data: CreateBudgetPeriodDTO): Promise<BudgetPeriod> {
    const result = await this.pool.query(
      'INSERT INTO budget_periods (description, start_date, end_date, is_active) VALUES ($1, $2, $3, $4) RETURNING id, description, start_date, end_date, is_active, created_at, updated_at, deleted_at',
      [data.description, data.startDate, data.endDate, data.isActive ?? true]
    );
    return this.mapRowToBudgetPeriod(result.rows[0]);
  }

  async update(id: number, data: UpdateBudgetPeriodDTO): Promise<BudgetPeriod> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(data.description);
    }
    if (data.startDate !== undefined) {
      updates.push(`start_date = $${paramCount++}`);
      values.push(data.startDate);
    }
    if (data.endDate !== undefined) {
      updates.push(`end_date = $${paramCount++}`);
      values.push(data.endDate);
    }
    if (data.isActive !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(data.isActive);
    }

    if (updates.length === 0) {
      const existing = await this.findById(id);
      if (!existing) throw new Error('BudgetPeriod not found');
      return existing;
    }

    values.push(id);
    const result = await this.pool.query(
      `UPDATE budget_periods SET ${updates.join(', ')} WHERE id = $${paramCount} AND deleted_at IS NULL RETURNING id, description, start_date, end_date, is_active, created_at, updated_at, deleted_at`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('BudgetPeriod not found');
    }

    return this.mapRowToBudgetPeriod(result.rows[0]);
  }

  async delete(id: number): Promise<void> {
    const result = await this.pool.query(
      'UPDATE budget_periods SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (result.rowCount === 0) {
      throw new Error('BudgetPeriod not found');
    }
  }

  private mapRowToBudgetPeriod(row: any): BudgetPeriod {
    return {
      id: row.id,
      description: row.description,
      startDate: row.start_date,
      endDate: row.end_date,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    };
  }
}

