import { Expense, CreateExpenseDTO, UpdateExpenseDTO } from '../entities/Expense';

export interface IExpenseRepository {
  findAll(filters?: ExpenseFilters): Promise<Expense[]>;
  findById(id: number): Promise<Expense | null>;
  create(data: CreateExpenseDTO): Promise<Expense>;
  update(id: number, data: UpdateExpenseDTO): Promise<Expense>;
  delete(id: number): Promise<void>;
  findByCompany(companyId: number): Promise<Expense[]>;
  findByCostCenter(costCenterId: number): Promise<Expense[]>;
  findByProvider(providerId: number): Promise<Expense[]>;
  findByExpenseType(expenseTypeId: number): Promise<Expense[]>;
}

export interface ExpenseFilters {
  companyId?: number;
  providerId?: number;
  costCenterId?: number;
  expenseTypeId?: number;
  budgetPeriodId?: number;
  startDate?: Date;
  endDate?: Date;
}

