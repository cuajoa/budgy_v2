import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, hasPermission } from '@/presentation/middleware/auth';
import { CompanyRepository } from '@/infrastructure/repositories/CompanyRepository';

export async function GET(request: NextRequest) {
  try {
    // AUTENTICACIÓN DESHABILITADA TEMPORALMENTE
    // const user = await getAuthUser(request);
    // if (!user) {
    //   return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    // }

    const companyRepository = new CompanyRepository();
    const companies = await companyRepository.findAll();

    // AUTENTICACIÓN DESHABILITADA - No filtrar por permisos
    // if (!hasPermission(user, 'admin')) {
    //   const userCompanyId = user.permissions?.find((p) => p.type === 'company')?.companyId;
    //   if (userCompanyId) {
    //     return NextResponse.json(companies.filter((c) => c.id === userCompanyId));
    //   }
    //   return NextResponse.json([]);
    // }

    return NextResponse.json(companies);
  } catch (error) {
    console.error('Error obteniendo compañías:', error);
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
    //   return NextResponse.json({ error: 'No tiene permisos para crear compañías' }, { status: 403 });
    // }

    const body = await request.json();
    const companyRepository = new CompanyRepository();
    const company = await companyRepository.create(body);

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error('Error creando compañía:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

