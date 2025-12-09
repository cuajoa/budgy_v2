import { ExpenseRepository } from '@/infrastructure/repositories/ExpenseRepository';
import { Expense, CreateExpenseDTO } from '@/domain/entities/Expense';
import { ExchangeRateService } from '@/infrastructure/services/ExchangeRateService';

export class CreateExpenseUseCase {
  constructor(
    private expenseRepository: ExpenseRepository,
    private exchangeRateService: ExchangeRateService
  ) {}

  async execute(data: CreateExpenseDTO): Promise<Expense> {
    // Validar que el monto en USD sea correcto si no se proporciona
    let amountUsd = data.amountUsd;
    let exchangeRate = data.exchangeRate;

    // Si no se proporciona el tipo de cambio, obtenerlo para la fecha
    if (!exchangeRate) {
      exchangeRate = await this.exchangeRateService.getExchangeRate(data.invoiceDate);
    }

    // Si no se proporciona el monto en USD, calcularlo
    if (!amountUsd && data.amountArs) {
      amountUsd = this.exchangeRateService.convertArsToUsd(data.amountArs, exchangeRate);
    }

    const expenseData: CreateExpenseDTO = {
      ...data,
      amountUsd,
      exchangeRate,
    };

    return await this.expenseRepository.create(expenseData);
  }
}

