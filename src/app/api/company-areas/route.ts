import { NextRequest, NextResponse } from 'next/server';
import { CompanyAreaRepository } from '@/infrastructure/repositories/CompanyAreaRepository';

export async function GET(request: NextRequest) {
  try {
    // AUTENTICACIÓN DESHABILITADA TEMPORALMENTE
    // const user = await getAuthUser(request);
    // if (!user) {
    //   return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    // }

    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId') ? parseInt(searchParams.get('companyId')!) : undefined;

    const companyAreaRepository = new CompanyAreaRepository();
    const areas = await companyAreaRepository.findAll(companyId);

    return NextResponse.json(areas);
  } catch (error) {
    console.error('Error obteniendo áreas de compañía:', error);
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
    //   return NextResponse.json({ error: 'No tiene permisos para crear áreas' }, { status: 403 });
    // }

    const body = await request.json();
    const companyAreaRepository = new CompanyAreaRepository();
    const area = await companyAreaRepository.create(body);

    return NextResponse.json(area, { status: 201 });
  } catch (error) {
    console.error('Error creando área de compañía:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

