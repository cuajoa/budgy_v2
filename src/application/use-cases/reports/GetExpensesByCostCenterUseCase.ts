import { Pool } from 'pg';
import { getPool } from '@/infrastructure/database/connection';

export interface CostCenterExpenseSummary {
  costCenterId: number;
  costCenterName: string;
  companyName: string;
  totalUsd: number;
  expenseCount: number;
}

export class GetExpensesByCostCenterUseCase {
  private pool: Pool;

  constructor() {
    this.pool = getPool();
  }

  async execute(filters?: {
    companyId?: number;
    costCenterId?: number;
    periodId?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<CostCenterExpenseSummary[]> {
    const result = await this.pool.query(
      'SELECT * FROM get_expenses_by_cost_center($1, $2, $3, $4, $5)',
      [
        filters?.companyId || null,
        filters?.costCenterId || null,
        filters?.periodId || null,
        filters?.startDate || null,
        filters?.endDate || null,
      ]
    );

    return result.rows.map((row) => ({
      costCenterId: row.cost_center_id,
      costCenterName: row.cost_center_name,
      companyName: row.company_name,
      totalUsd: parseFloat(row.total_usd),
      expenseCount: parseInt(row.expense_count),
    }));
  }
}

