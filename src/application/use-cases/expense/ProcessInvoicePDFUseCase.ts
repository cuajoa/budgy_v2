import { ExpenseRepository } from '@/infrastructure/repositories/ExpenseRepository';
import { ProviderRepository } from '@/infrastructure/repositories/ProviderRepository';
import { OpenAIService, ExtractedInvoiceData } from '@/infrastructure/services/OpenAIService';
import { ExchangeRateService } from '@/infrastructure/services/ExchangeRateService';
import { Expense, CreateExpenseDTO } from '@/domain/entities/Expense';
import { format, parse } from 'date-fns';

export class ProcessInvoicePDFUseCase {
  constructor(
    private expenseRepository: ExpenseRepository,
    private providerRepository: ProviderRepository,
    private openAIService: OpenAIService,
    private exchangeRateService: ExchangeRateService
  ) {}

  async execute(
    pdfBuffer: Buffer,
    companyId: number,
    costCenterId: number,
    expenseTypeId: number,
    budgetPeriodId: number,
    userId: string
  ): Promise<Expense> {
    // Obtener lista de proveedores para ayudar a OpenAI
    const providers = await this.providerRepository.findAll();
    const providerNames = providers.map((p) => p.name);

    // Extraer datos de la factura usando OpenAI
    const extractedData = await this.openAIService.extractInvoiceData(pdfBuffer, providerNames);

    // Buscar o crear proveedor
    let providerId: number;
    if (extractedData.providerName) {
      const existingProvider = providers.find(
        (p) => p.name.toLowerCase() === extractedData.providerName!.toLowerCase()
      );
      if (existingProvider) {
        providerId = existingProvider.id;
      } else {
        // Crear nuevo proveedor si no existe
        const newProvider = await this.providerRepository.create({
          name: extractedData.providerName,
        });
        providerId = newProvider.id;
      }
    } else {
      throw new Error('No se pudo identificar el proveedor de la factura');
    }

    // Parsear fecha
    let invoiceDate: Date;
    if (extractedData.invoiceDate) {
      try {
        invoiceDate = parse(extractedData.invoiceDate, 'yyyy-MM-dd', new Date());
      } catch {
        invoiceDate = new Date();
      }
    } else {
      invoiceDate = new Date();
    }

    // Obtener tipo de cambio para la fecha
    const exchangeRate = await this.exchangeRateService.getExchangeRate(invoiceDate);

    // Calcular montos
    let amountArs = extractedData.amount || 0;
    let amountUsd = 0;

    if (extractedData.currency === 'USD') {
      amountUsd = amountArs;
      amountArs = this.exchangeRateService.convertUsdToArs(amountUsd, exchangeRate);
    } else {
      // Asumimos ARS por defecto
      amountUsd = this.exchangeRateService.convertArsToUsd(amountArs, exchangeRate);
    }

    // Crear el gasto
    const expenseData: CreateExpenseDTO = {
      companyId,
      providerId,
      costCenterId,
      expenseTypeId,
      budgetPeriodId,
      invoiceNumber: extractedData.invoiceNumber,
      invoiceDate,
      amountArs,
      amountUsd,
      exchangeRate,
      description: extractedData.description,
      createdBy: userId,
    };

    return await this.expenseRepository.create(expenseData);
  }
}

