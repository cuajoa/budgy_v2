import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, hasPermission } from '@/presentation/middleware/auth';
import { BudgetPeriodRepository } from '@/infrastructure/repositories/BudgetPeriodRepository';

export async function GET(request: NextRequest) {
  try {
    // AUTENTICACIÓN DESHABILITADA TEMPORALMENTE
    // const user = await getAuthUser(request);
    // if (!user) {
    //   return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    // }

    const budgetPeriodRepository = new BudgetPeriodRepository();
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get('active') === 'true';

    const periods = activeOnly
      ? [await budgetPeriodRepository.findActive()].filter(Boolean)
      : await budgetPeriodRepository.findAll();

    return NextResponse.json(periods);
  } catch (error) {
    console.error('Error obteniendo períodos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // AUTENTICACIÓN DESHABILITADA TEMPORALMENTE
    // const user = await getAuthUser(request);
    // if (!user) {
    //   return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    // }

    // if (!hasPermission(user, 'admin')) {
    //   return NextResponse.json({ error: 'No tiene permisos para crear períodos' }, { status: 403 });
    // }

    const body = await request.json();
    const budgetPeriodRepository = new BudgetPeriodRepository();
    const period = await budgetPeriodRepository.create(body);

    return NextResponse.json(period, { status: 201 });
  } catch (error) {
    console.error('Error creando período:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

