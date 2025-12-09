import { Pool } from 'pg';
import { getPool } from '../database/connection';
import { ICompanyRepository } from '@/domain/repositories/ICompanyRepository';
import { Company, CreateCompanyDTO, UpdateCompanyDTO } from '@/domain/entities/Company';

export class CompanyRepository implements ICompanyRepository {
  private pool: Pool;

  constructor() {
    this.pool = getPool();
  }

  async findAll(): Promise<Company[]> {
    const result = await this.pool.query(
      'SELECT id, name, cuit, created_at, updated_at, deleted_at FROM companies WHERE deleted_at IS NULL ORDER BY name'
    );
    return result.rows.map(this.mapRowToCompany);
  }

  async findById(id: number): Promise<Company | null> {
    const result = await this.pool.query(
      'SELECT id, name, cuit, created_at, updated_at, deleted_at FROM companies WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    return result.rows.length > 0 ? this.mapRowToCompany(result.rows[0]) : null;
  }

  async create(data: CreateCompanyDTO): Promise<Company> {
    const result = await this.pool.query(
      'INSERT INTO companies (name, cuit) VALUES ($1, $2) RETURNING id, name, cuit, created_at, updated_at, deleted_at',
      [data.name, data.cuit || null]
    );
    return this.mapRowToCompany(result.rows[0]);
  }

  async update(id: number, data: UpdateCompanyDTO): Promise<Company> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.cuit !== undefined) {
      updates.push(`cuit = $${paramCount++}`);
      values.push(data.cuit || null);
    }

    if (updates.length === 0) {
      const existing = await this.findById(id);
      if (!existing) throw new Error('Company not found');
      return existing;
    }

    values.push(id);
    const result = await this.pool.query(
      `UPDATE companies SET ${updates.join(', ')} WHERE id = $${paramCount} AND deleted_at IS NULL RETURNING id, name, cuit, created_at, updated_at, deleted_at`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Company not found');
    }

    return this.mapRowToCompany(result.rows[0]);
  }

  async delete(id: number): Promise<void> {
    const result = await this.pool.query(
      'UPDATE companies SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (result.rowCount === 0) {
      throw new Error('Company not found');
    }
  }

  private mapRowToCompany(row: any): Company {
    return {
      id: row.id,
      name: row.name,
      cuit: row.cuit,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    };
  }
}

