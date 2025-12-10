import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, hasPermission } from '@/presentation/middleware/auth';
import { CompanyRepository } from '@/infrastructure/repositories/CompanyRepository';

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
    //   return NextResponse.json({ error: 'No tiene permisos para editar compañías' }, { status: 403 });
    // }

    const { id } = await params;
    const body = await request.json();
    const companyRepository = new CompanyRepository();
    const company = await companyRepository.update(parseInt(id), body);

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error actualizando compañía:', error);
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
    //   return NextResponse.json({ error: 'No tiene permisos para eliminar compañías' }, { status: 403 });
    // }

    const { id } = await params;
    const companyRepository = new CompanyRepository();
    await companyRepository.delete(parseInt(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error eliminando compañía:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

