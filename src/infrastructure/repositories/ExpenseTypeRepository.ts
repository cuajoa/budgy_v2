import { Pool } from 'pg';
import { getPool } from '../database/connection';
import { ExpenseType, CreateExpenseTypeDTO, UpdateExpenseTypeDTO } from '@/domain/entities/ExpenseType';

export interface IExpenseTypeRepository {
  findAll(): Promise<ExpenseType[]>;
  findById(id: number): Promise<ExpenseType | null>;
  create(data: CreateExpenseTypeDTO): Promise<ExpenseType>;
  update(id: number, data: UpdateExpenseTypeDTO): Promise<ExpenseType>;
  delete(id: number): Promise<void>;
}

export class ExpenseTypeRepository implements IExpenseTypeRepository {
  private pool: Pool;

  constructor() {
    this.pool = getPool();
  }

  async findAll(): Promise<ExpenseType[]> {
    const result = await this.pool.query(
      'SELECT id, name, description, created_at, updated_at, deleted_at FROM expense_types WHERE deleted_at IS NULL ORDER BY name'
    );
    return result.rows.map(this.mapRowToExpenseType);
  }

  async findById(id: number): Promise<ExpenseType | null> {
    const result = await this.pool.query(
      'SELECT id, name, description, created_at, updated_at, deleted_at FROM expense_types WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    return result.rows.length > 0 ? this.mapRowToExpenseType(result.rows[0]) : null;
  }

  async create(data: CreateExpenseTypeDTO): Promise<ExpenseType> {
    const result = await this.pool.query(
      'INSERT INTO expense_types (name, description) VALUES ($1, $2) RETURNING id, name, description, created_at, updated_at, deleted_at',
      [data.name, data.description || null]
    );
    return this.mapRowToExpenseType(result.rows[0]);
  }

  async update(id: number, data: UpdateExpenseTypeDTO): Promise<ExpenseType> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(data.description || null);
    }

    if (updates.length === 0) {
      const existing = await this.findById(id);
      if (!existing) throw new Error('ExpenseType not found');
      return existing;
    }

    values.push(id);
    const result = await this.pool.query(
      `UPDATE expense_types SET ${updates.join(', ')} WHERE id = $${paramCount} AND deleted_at IS NULL RETURNING id, name, description, created_at, updated_at, deleted_at`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('ExpenseType not found');
    }

    return this.mapRowToExpenseType(result.rows[0]);
  }

  async delete(id: number): Promise<void> {
    const result = await this.pool.query(
      'UPDATE expense_types SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (result.rowCount === 0) {
      throw new Error('ExpenseType not found');
    }
  }

  private mapRowToExpenseType(row: any): ExpenseType {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    };
  }
}

