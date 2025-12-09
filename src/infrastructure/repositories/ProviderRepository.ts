import { Pool } from 'pg';
import { getPool } from '../database/connection';
import { Provider, CreateProviderDTO, UpdateProviderDTO } from '@/domain/entities/Provider';

export interface IProviderRepository {
  findAll(): Promise<Provider[]>;
  findById(id: number): Promise<Provider | null>;
  findByTaxId(taxId: string): Promise<Provider | null>;
  create(data: CreateProviderDTO): Promise<Provider>;
  update(id: number, data: UpdateProviderDTO): Promise<Provider>;
  delete(id: number): Promise<void>;
}

export class ProviderRepository implements IProviderRepository {
  private pool: Pool;

  constructor() {
    this.pool = getPool();
  }

  async findAll(): Promise<Provider[]> {
    const result = await this.pool.query(
      'SELECT id, name, tax_id, contact_email, contact_phone, created_at, updated_at, deleted_at FROM providers WHERE deleted_at IS NULL ORDER BY name'
    );
    return result.rows.map(this.mapRowToProvider);
  }

  async findById(id: number): Promise<Provider | null> {
    const result = await this.pool.query(
      'SELECT id, name, tax_id, contact_email, contact_phone, created_at, updated_at, deleted_at FROM providers WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    return result.rows.length > 0 ? this.mapRowToProvider(result.rows[0]) : null;
  }

  async findByTaxId(taxId: string): Promise<Provider | null> {
    // Normalizar el taxId removiendo guiones y espacios para comparar
    const normalizedTaxId = taxId.replace(/\D/g, '');
    const result = await this.pool.query(
      'SELECT id, name, tax_id, contact_email, contact_phone, created_at, updated_at, deleted_at FROM providers WHERE REPLACE(REPLACE(tax_id, \'-\', \'\'), \' \', \'\') = $1 AND deleted_at IS NULL',
      [normalizedTaxId]
    );
    return result.rows.length > 0 ? this.mapRowToProvider(result.rows[0]) : null;
  }

  async create(data: CreateProviderDTO): Promise<Provider> {
    const result = await this.pool.query(
      'INSERT INTO providers (name, tax_id, contact_email, contact_phone) VALUES ($1, $2, $3, $4) RETURNING id, name, tax_id, contact_email, contact_phone, created_at, updated_at, deleted_at',
      [data.name, data.taxId || null, data.contactEmail || null, data.contactPhone || null]
    );
    return this.mapRowToProvider(result.rows[0]);
  }

  async update(id: number, data: UpdateProviderDTO): Promise<Provider> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.taxId !== undefined) {
      updates.push(`tax_id = $${paramCount++}`);
      values.push(data.taxId || null);
    }
    if (data.contactEmail !== undefined) {
      updates.push(`contact_email = $${paramCount++}`);
      values.push(data.contactEmail || null);
    }
    if (data.contactPhone !== undefined) {
      updates.push(`contact_phone = $${paramCount++}`);
      values.push(data.contactPhone || null);
    }

    if (updates.length === 0) {
      const existing = await this.findById(id);
      if (!existing) throw new Error('Provider not found');
      return existing;
    }

    values.push(id);
    const result = await this.pool.query(
      `UPDATE providers SET ${updates.join(', ')} WHERE id = $${paramCount} AND deleted_at IS NULL RETURNING id, name, tax_id, contact_email, contact_phone, created_at, updated_at, deleted_at`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Provider not found');
    }

    return this.mapRowToProvider(result.rows[0]);
  }

  async delete(id: number): Promise<void> {
    const result = await this.pool.query(
      'UPDATE providers SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (result.rowCount === 0) {
      throw new Error('Provider not found');
    }
  }

  private mapRowToProvider(row: any): Provider {
    return {
      id: row.id,
      name: row.name,
      taxId: row.tax_id,
      contactEmail: row.contact_email,
      contactPhone: row.contact_phone,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    };
  }
}

