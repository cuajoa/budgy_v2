import { NextRequest, NextResponse } from 'next/server';
import { CompanyAreaRepository } from '@/infrastructure/repositories/CompanyAreaRepository';

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
    //   return NextResponse.json({ error: 'No tiene permisos para editar áreas' }, { status: 403 });
    // }

    const body = await request.json();
    const companyAreaRepository = new CompanyAreaRepository();
    const area = await companyAreaRepository.update(parseInt(params.id), body);

    return NextResponse.json(area);
  } catch (error) {
    console.error('Error actualizando área de compañía:', error);
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
    //   return NextResponse.json({ error: 'No tiene permisos para eliminar áreas' }, { status: 403 });
    // }

    const companyAreaRepository = new CompanyAreaRepository();
    await companyAreaRepository.delete(parseInt(params.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error eliminando área de compañía:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

