import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, hasPermission } from '@/presentation/middleware/auth';
import { CostCenterRepository } from '@/infrastructure/repositories/CostCenterRepository';

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

    // if (!hasPermission(user, 'admin') && !hasPermission(user, 'company')) {
    //   return NextResponse.json({ error: 'No tiene permisos para editar centros de costo' }, { status: 403 });
    // }

    const { id } = await params;
    const body = await request.json();
    const costCenterRepository = new CostCenterRepository();
    const costCenter = await costCenterRepository.update(parseInt(id), body);

    return NextResponse.json(costCenter);
  } catch (error) {
    console.error('Error actualizando centro de costo:', error);
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

    // if (!hasPermission(user, 'admin') && !hasPermission(user, 'company')) {
    //   return NextResponse.json({ error: 'No tiene permisos para eliminar centros de costo' }, { status: 403 });
    // }

    const { id } = await params;
    const costCenterRepository = new CostCenterRepository();
    await costCenterRepository.delete(parseInt(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error eliminando centro de costo:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

