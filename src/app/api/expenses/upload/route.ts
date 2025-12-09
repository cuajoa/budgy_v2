import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, hasPermission } from '@/presentation/middleware/auth';
import { ExpenseRepository } from '@/infrastructure/repositories/ExpenseRepository';
import { ProviderRepository } from '@/infrastructure/repositories/ProviderRepository';
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
    const budgetPeriodId = parseInt(formData.get('budgetPeriodId') as string);

    if (!file || !companyId || !costCenterId || !expenseTypeId || !budgetPeriodId) {
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
    const openAIService = new OpenAIService();
    const exchangeRateService = new ExchangeRateService();

    const processInvoiceUseCase = new ProcessInvoicePDFUseCase(
      expenseRepository,
      providerRepository,
      openAIService,
      exchangeRateService
    );

    const expense = await processInvoiceUseCase.execute(
      buffer,
      companyId,
      costCenterId,
      expenseTypeId,
      budgetPeriodId,
      user.id
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

