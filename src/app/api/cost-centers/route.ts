import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, hasPermission } from '@/presentation/middleware/auth';
import { CostCenterRepository } from '@/infrastructure/repositories/CostCenterRepository';

export async function GET(request: NextRequest) {
  try {
    // AUTENTICACIÓN DESHABILITADA TEMPORALMENTE
    // const user = await getAuthUser(request);
    // if (!user) {
    //   return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    // }

    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId') ? parseInt(searchParams.get('companyId')!) : undefined;

    const costCenterRepository = new CostCenterRepository();
    let costCenters = await costCenterRepository.findAll(companyId);

    // AUTENTICACIÓN DESHABILITADA - No filtrar por permisos
    // if (!hasPermission(user, 'admin')) {
    //   const userCompanyId = user.permissions?.find((p) => p.type === 'company')?.companyId;
    //   const userCostCenterId = user.permissions?.find((p) => p.type === 'cost_center')?.costCenterId;

    //   if (userCompanyId) {
    //     costCenters = costCenters.filter((cc) => cc.companyId === userCompanyId);
    //   }
    //   if (userCostCenterId) {
    //     costCenters = costCenters.filter((cc) => cc.id === userCostCenterId);
    //   }
    // }

    return NextResponse.json(costCenters);
  } catch (error) {
    console.error('Error obteniendo centros de costo:', error);
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

    // if (!hasPermission(user, 'admin') && !hasPermission(user, 'company')) {
    //   return NextResponse.json({ error: 'No tiene permisos para crear centros de costo' }, { status: 403 });
    // }

    const body = await request.json();

    // AUTENTICACIÓN DESHABILITADA - No verificar permisos de compañía
    // if (!hasPermission(user, 'admin')) {
    //   const userCompanyId = user.permissions?.find((p) => p.type === 'company')?.companyId;
    //   if (userCompanyId && body.companyId !== userCompanyId) {
    //     return NextResponse.json({ error: 'No autorizado para esta compañía' }, { status: 403 });
    //   }
    // }

    const costCenterRepository = new CostCenterRepository();
    const costCenter = await costCenterRepository.create(body);

    return NextResponse.json(costCenter, { status: 201 });
  } catch (error) {
    console.error('Error creando centro de costo:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

