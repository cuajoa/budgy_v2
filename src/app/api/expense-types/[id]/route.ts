import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, hasPermission } from '@/presentation/middleware/auth';
import { ExpenseTypeRepository } from '@/infrastructure/repositories/ExpenseTypeRepository';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // AUTENTICACIÓN DESHABILITADA TEMPORALMENTE
    // const user = await getAuthUser(request);
    // if (!user) {
    //   return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    // }

    // if (!hasPermission(user, 'admin')) {
    //   return NextResponse.json({ error: 'No tiene permisos para editar tipos de gasto' }, { status: 403 });
    // }

    const body = await request.json();
    const expenseTypeRepository = new ExpenseTypeRepository();
    const expenseType = await expenseTypeRepository.update(parseInt(params.id), body);

    return NextResponse.json(expenseType);
  } catch (error) {
    console.error('Error actualizando tipo de gasto:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // AUTENTICACIÓN DESHABILITADA TEMPORALMENTE
    // const user = await getAuthUser(request);
    // if (!user) {
    //   return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    // }

    // if (!hasPermission(user, 'admin')) {
    //   return NextResponse.json({ error: 'No tiene permisos para eliminar tipos de gasto' }, { status: 403 });
    // }

    const expenseTypeRepository = new ExpenseTypeRepository();
    await expenseTypeRepository.delete(parseInt(params.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error eliminando tipo de gasto:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

