export interface ExpenseType {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateExpenseTypeDTO {
  name: string;
  description?: string;
}

export interface UpdateExpenseTypeDTO {
  name?: string;
  description?: string;
}

