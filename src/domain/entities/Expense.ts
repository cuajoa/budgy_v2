export interface Expense {
  id: number;
  companyId: number;
  providerId: number;
  costCenterId: number;
  expenseTypeId: number;
  budgetPeriodId: number;
  companyAreaId?: number; // Área asociada de la compañía (opcional)
  invoiceNumber?: string;
  invoiceDate: Date;
  amountArs: number;
  amountUsd: number;
  exchangeRate: number;
  description?: string;
  pdfPath?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateExpenseDTO {
  companyId: number;
  providerId: number;
  costCenterId: number;
  expenseTypeId: number;
  budgetPeriodId: number;
  companyAreaId?: number; // Área asociada de la compañía (opcional)
  invoiceNumber?: string;
  invoiceDate: Date;
  amountArs: number;
  amountUsd: number;
  exchangeRate: number;
  description?: string;
  pdfPath?: string;
  createdBy?: string;
}

export interface UpdateExpenseDTO {
  providerId?: number;
  costCenterId?: number;
  expenseTypeId?: number;
  budgetPeriodId?: number;
  companyAreaId?: number; // Área asociada de la compañía (opcional)
  invoiceNumber?: string;
  invoiceDate?: Date;
  amountArs?: number;
  amountUsd?: number;
  exchangeRate?: number;
  description?: string;
  pdfPath?: string;
}

