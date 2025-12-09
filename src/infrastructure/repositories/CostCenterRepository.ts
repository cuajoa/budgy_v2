import { Pool } from 'pg';
import { getPool } from '../database/connection';
import { CostCenter, CreateCostCenterDTO, UpdateCostCenterDTO } from '@/domain/entities/CostCenter';

export interface ICostCenterRepository {
  findAll(companyId?: number): Promise<CostCenter[]>;
  findById(id: number): Promise<CostCenter | null>;
  create(data: CreateCostCenterDTO): Promise<CostCenter>;
  update(id: number, data: UpdateCostCenterDTO): Promise<CostCenter>;
  delete(id: number): Promise<void>;
}

export class CostCenterRepository implements ICostCenterRepository {
  private pool: Pool;

  constructor() {
    this.pool = getPool();
  }

  async findAll(companyId?: number): Promise<CostCenter[]> {
    let query = 'SELECT id, company_id, name, description, created_at, updated_at, deleted_at FROM cost_centers WHERE deleted_at IS NULL';
    const values: any[] = [];
    
    if (companyId) {
      query += ' AND company_id = $1';
      values.push(companyId);
    }
    
    query += ' ORDER BY name';
    const result = await this.pool.query(query, values);
    return result.rows.map(this.mapRowToCostCenter);
  }

  async findById(id: number): Promise<CostCenter | null> {
    const result = await this.pool.query(
      'SELECT id, company_id, name, description, created_at, updated_at, deleted_at FROM cost_centers WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    return result.rows.length > 0 ? this.mapRowToCostCenter(result.rows[0]) : null;
  }

  async create(data: CreateCostCenterDTO): Promise<CostCenter> {
    const result = await this.pool.query(
      'INSERT INTO cost_centers (company_id, name, description) VALUES ($1, $2, $3) RETURNING id, company_id, name, description, created_at, updated_at, deleted_at',
      [data.companyId, data.name, data.description || null]
    );
    return this.mapRowToCostCenter(result.rows[0]);
  }

  async update(id: number, data: UpdateCostCenterDTO): Promise<CostCenter> {
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
      if (!existing) throw new Error('CostCenter not found');
      return existing;
    }

    values.push(id);
    const result = await this.pool.query(
      `UPDATE cost_centers SET ${updates.join(', ')} WHERE id = $${paramCount} AND deleted_at IS NULL RETURNING id, company_id, name, description, created_at, updated_at, deleted_at`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('CostCenter not found');
    }

    return this.mapRowToCostCenter(result.rows[0]);
  }

  async delete(id: number): Promise<void> {
    const result = await this.pool.query(
      'UPDATE cost_centers SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (result.rowCount === 0) {
      throw new Error('CostCenter not found');
    }
  }

  private mapRowToCostCenter(row: any): CostCenter {
    return {
      id: row.id,
      companyId: row.company_id,
      name: row.name,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    };
  }
}

