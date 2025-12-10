import { NextRequest, NextResponse } from 'next/server';
import { BudgetPeriodRepository } from '@/infrastructure/repositories/BudgetPeriodRepository';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // AUTENTICACIÓN DESHABILITADA TEMPORALMENTE
    // const user = await getAuthUser(request);
    // if (!user) {
    //   return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    // }

    // if (!hasPermission(user, 'admin')) {
    //   return NextResponse.json({ error: 'No tiene permisos para editar períodos' }, { status: 403 });
    // }

    const { id } = await params;
    const body = await request.json();
    const budgetPeriodRepository = new BudgetPeriodRepository();
    const period = await budgetPeriodRepository.update(parseInt(id), body);

    return NextResponse.json(period);
  } catch (error) {
    console.error('Error actualizando período:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // AUTENTICACIÓN DESHABILITADA TEMPORALMENTE
    // const user = await getAuthUser(request);
    // if (!user) {
    //   return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    // }

    // if (!hasPermission(user, 'admin')) {
    //   return NextResponse.json({ error: 'No tiene permisos para eliminar períodos' }, { status: 403 });
    // }

    const { id } = await params;
    const budgetPeriodRepository = new BudgetPeriodRepository();
    await budgetPeriodRepository.delete(parseInt(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error eliminando período:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

