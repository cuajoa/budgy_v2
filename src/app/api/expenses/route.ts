import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, hasPermission } from '@/presentation/middleware/auth';
import { ExpenseRepository } from '@/infrastructure/repositories/ExpenseRepository';
import { CreateExpenseUseCase } from '@/application/use-cases/expense/CreateExpenseUseCase';
import { ExchangeRateService } from '@/infrastructure/services/ExchangeRateService';

export async function GET(request: NextRequest) {
  try {
    // AUTENTICACIÓN DESHABILITADA TEMPORALMENTE
    // const user = await getAuthUser(request);
    // if (!user) {
    //   return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    // }
    const user = await getAuthUser(request); // Retorna usuario de desarrollo

    const expenseRepository = new ExpenseRepository();
    const searchParams = request.nextUrl.searchParams;

    const filters = {
      companyId: searchParams.get('companyId') ? parseInt(searchParams.get('companyId')!) : undefined,
      providerId: searchParams.get('providerId') ? parseInt(searchParams.get('providerId')!) : undefined,
      costCenterId: searchParams.get('costCenterId') ? parseInt(searchParams.get('costCenterId')!) : undefined,
      expenseTypeId: searchParams.get('expenseTypeId') ? parseInt(searchParams.get('expenseTypeId')!) : undefined,
      budgetPeriodId: searchParams.get('budgetPeriodId') ? parseInt(searchParams.get('budgetPeriodId')!) : undefined,
    };

    // AUTENTICACIÓN DESHABILITADA - No aplicar filtros de permisos
    // if (!hasPermission(user, 'admin')) {
    //   if (user.permissions?.some((p) => p.type === 'company' && filters.companyId)) {
    //     // Usuario solo puede ver su compañía
    //     const userCompanyId = user.permissions.find((p) => p.type === 'company')?.companyId;
    //     if (userCompanyId !== filters.companyId) {
    //       return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    //     }
    //   }
    // }

    const expenses = await expenseRepository.findAll(filters);
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error obteniendo gastos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // AUTENTICACIÓN DESHABILITADA TEMPORALMENTE
    const user = await getAuthUser(request); // Retorna usuario de desarrollo
    // if (!user) {
    //   return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    // }

    // Verificar permisos de escritura - DESHABILITADO
    // if (!hasPermission(user, 'admin') && !hasPermission(user, 'company') && !hasPermission(user, 'cost_center')) {
    //   return NextResponse.json({ error: 'No tiene permisos para crear gastos' }, { status: 403 });
    // }

    const body = await request.json();
    const expenseRepository = new ExpenseRepository();
    const exchangeRateService = new ExchangeRateService();
    const createExpenseUseCase = new CreateExpenseUseCase(expenseRepository, exchangeRateService);

    const expense = await createExpenseUseCase.execute({
      ...body,
      createdBy: user.id,
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error creando gasto:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

