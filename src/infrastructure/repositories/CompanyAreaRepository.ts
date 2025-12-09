import { Pool } from 'pg';
import { getPool } from '../database/connection';
import { CompanyArea, CreateCompanyAreaDTO, UpdateCompanyAreaDTO } from '@/domain/entities/CompanyArea';

export interface ICompanyAreaRepository {
  findAll(companyId?: number): Promise<CompanyArea[]>;
  findById(id: number): Promise<CompanyArea | null>;
  create(data: CreateCompanyAreaDTO): Promise<CompanyArea>;
  update(id: number, data: UpdateCompanyAreaDTO): Promise<CompanyArea>;
  delete(id: number): Promise<void>;
}

export class CompanyAreaRepository implements ICompanyAreaRepository {
  private pool: Pool;

  constructor() {
    this.pool = getPool();
  }

  async findAll(companyId?: number): Promise<CompanyArea[]> {
    let query = `
      SELECT id, company_id, name, description, created_at, updated_at, deleted_at
      FROM company_areas
      WHERE deleted_at IS NULL
    `;
    const values: any[] = [];

    if (companyId) {
      query += ' AND company_id = $1';
      values.push(companyId);
    }

    query += ' ORDER BY name';

    const result = await this.pool.query(query, values);
    return result.rows.map(this.mapRowToCompanyArea);
  }

  async findById(id: number): Promise<CompanyArea | null> {
    const result = await this.pool.query(
      'SELECT id, company_id, name, description, created_at, updated_at, deleted_at FROM company_areas WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    return result.rows.length > 0 ? this.mapRowToCompanyArea(result.rows[0]) : null;
  }

  async create(data: CreateCompanyAreaDTO): Promise<CompanyArea> {
    const result = await this.pool.query(
      'INSERT INTO company_areas (company_id, name, description) VALUES ($1, $2, $3) RETURNING id, company_id, name, description, created_at, updated_at, deleted_at',
      [data.companyId, data.name, data.description || null]
    );
    return this.mapRowToCompanyArea(result.rows[0]);
  }

  async update(id: number, data: UpdateCompanyAreaDTO): Promise<CompanyArea> {
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
      if (!existing) throw new Error('CompanyArea not found');
      return existing;
    }

    values.push(id);
    const result = await this.pool.query(
      `UPDATE company_areas SET ${updates.join(', ')} WHERE id = $${paramCount} AND deleted_at IS NULL RETURNING id, company_id, name, description, created_at, updated_at, deleted_at`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('CompanyArea not found');
    }

    return this.mapRowToCompanyArea(result.rows[0]);
  }

  async delete(id: number): Promise<void> {
    const result = await this.pool.query(
      'UPDATE company_areas SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (result.rowCount === 0) {
      throw new Error('CompanyArea not found');
    }
  }

  private mapRowToCompanyArea(row: any): CompanyArea {
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

