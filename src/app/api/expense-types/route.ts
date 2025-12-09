import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, hasPermission } from '@/presentation/middleware/auth';
import { ExpenseTypeRepository } from '@/infrastructure/repositories/ExpenseTypeRepository';

export async function GET(request: NextRequest) {
  try {
    // AUTENTICACIÓN DESHABILITADA TEMPORALMENTE
    // const user = await getAuthUser(request);
    // if (!user) {
    //   return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    // }

    const expenseTypeRepository = new ExpenseTypeRepository();
    const expenseTypes = await expenseTypeRepository.findAll();

    return NextResponse.json(expenseTypes);
  } catch (error) {
    console.error('Error obteniendo tipos de gasto:', error);
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
    //   return NextResponse.json({ error: 'No tiene permisos para crear tipos de gasto' }, { status: 403 });
    // }

    const body = await request.json();
    const expenseTypeRepository = new ExpenseTypeRepository();
    const expenseType = await expenseTypeRepository.create(body);

    return NextResponse.json(expenseType, { status: 201 });
  } catch (error) {
    console.error('Error creando tipo de gasto:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

