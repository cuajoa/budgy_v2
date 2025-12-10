import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, hasPermission } from '@/presentation/middleware/auth';
import { ExpenseRepository } from '@/infrastructure/repositories/ExpenseRepository';
import { ProviderRepository } from '@/infrastructure/repositories/ProviderRepository';
import { BudgetPeriodRepository } from '@/infrastructure/repositories/BudgetPeriodRepository';
import { ProcessInvoicePDFUseCase } from '@/application/use-cases/expense/ProcessInvoicePDFUseCase';
import { ExchangeRateService } from '@/infrastructure/services/ExchangeRateService';
import { OpenAIService } from '@/infrastructure/services/OpenAIService';

export async function POST(request: NextRequest) {
  try {
    // AUTENTICACIÓN DESHABILITADA TEMPORALMENTE
    const user = await getAuthUser(request); // Retorna usuario de desarrollo
    // if (!user) {
    //   return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    // }

    // Verificar permisos de escritura - DESHABILITADO
    // if (!hasPermission(user, 'admin') && !hasPermission(user, 'company') && !hasPermission(user, 'cost_center')) {
    //   return NextResponse.json({ error: 'No tiene permisos para cargar facturas' }, { status: 403 });
    // }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const companyId = parseInt(formData.get('companyId') as string);
    const costCenterId = parseInt(formData.get('costCenterId') as string);
    const expenseTypeId = parseInt(formData.get('expenseTypeId') as string);
    const budgetPeriodIdParam = formData.get('budgetPeriodId') as string;
    const budgetPeriodId = budgetPeriodIdParam ? parseInt(budgetPeriodIdParam) : null;
    const companyAreaIdParam = formData.get('companyAreaId') as string;
    const companyAreaId = companyAreaIdParam ? parseInt(companyAreaIdParam) : undefined;
    const additionalCompanyIdsParam = formData.get('additionalCompanyIds') as string;
    const additionalCompanyIds = additionalCompanyIdsParam 
      ? JSON.parse(additionalCompanyIdsParam) as number[]
      : undefined;

    if (!file || !companyId || !costCenterId || !expenseTypeId) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      );
    }

    // AUTENTICACIÓN DESHABILITADA - No verificar permisos de compañía
    // if (!hasPermission(user, 'admin')) {
    //   const userCompanyId = user.permissions?.find((p) => p.type === 'company')?.companyId;
    //   if (userCompanyId && userCompanyId !== companyId) {
    //     return NextResponse.json({ error: 'No autorizado para esta compañía' }, { status: 403 });
    //   }
    // }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const expenseRepository = new ExpenseRepository();
    const providerRepository = new ProviderRepository();
    const budgetPeriodRepository = new BudgetPeriodRepository();
    const openAIService = new OpenAIService();
    const exchangeRateService = new ExchangeRateService();

    // Primero extraer datos para validar duplicados
    const providers = await providerRepository.findAll();
    const providerNames = providers.map((p) => p.name);
    const extractedData = await openAIService.extractInvoiceData(buffer, providerNames);

    // Buscar proveedor
    let providerId: number | null = null;
    if (extractedData.providerName) {
      let existingProvider = extractedData.providerTaxId
        ? await providerRepository.findByTaxId(extractedData.providerTaxId.replace(/\D/g, ''))
        : null;

      if (!existingProvider) {
        existingProvider = providers.find(
          (p) => p.name.toLowerCase() === extractedData.providerName!.toLowerCase()
        ) || null;
      }

      if (existingProvider) {
        providerId = existingProvider.id;
      }
    }

    // Validar si la factura ya existe
    if (extractedData.invoiceNumber && providerId) {
      // Normalizar el número de factura antes de comparar
      const normalizedInvoiceNumber = extractedData.invoiceNumber.replace(/[\s-]/g, '').toUpperCase().trim();
      const existingExpense = await expenseRepository.findByInvoiceNumberAndProvider(
        normalizedInvoiceNumber,
        providerId
      );

      if (existingExpense) {
        return NextResponse.json(
          {
            error: 'Esta factura ya fue ingresada anteriormente',
            duplicate: true,
            existingExpenseId: existingExpense.id,
            invoiceNumber: extractedData.invoiceNumber,
            providerName: extractedData.providerName,
          },
          { status: 409 } // Conflict
        );
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const processInvoiceUseCase = new ProcessInvoicePDFUseCase(
      expenseRepository,
      providerRepository,
      budgetPeriodRepository,
      openAIService,
      exchangeRateService
    );

    const expense = await processInvoiceUseCase.execute(
      buffer,
      companyId,
      costCenterId,
      expenseTypeId,
      budgetPeriodId,
      user.id,
      companyAreaId,
      additionalCompanyIds
    );

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error procesando factura:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

