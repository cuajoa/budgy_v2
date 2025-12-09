export interface CostCenter {
  id: number;
  companyId: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateCostCenterDTO {
  companyId: number;
  name: string;
  description?: string;
}

export interface UpdateCostCenterDTO {
  name?: string;
  description?: string;
}

