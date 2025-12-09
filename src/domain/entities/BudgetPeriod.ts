export interface BudgetPeriod {
  id: number;
  description: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateBudgetPeriodDTO {
  description: string;
  startDate: Date;
  endDate: Date;
  isActive?: boolean;
}

export interface UpdateBudgetPeriodDTO {
  description?: string;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
}

