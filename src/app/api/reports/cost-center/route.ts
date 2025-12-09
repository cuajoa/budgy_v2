import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, hasPermission } from '@/presentation/middleware/auth';
import { GetExpensesByCostCenterUseCase } from '@/application/use-cases/reports/GetExpensesByCostCenterUseCase';

export async function GET(request: NextRequest) {
  try {
    // AUTENTICACIÓN DESHABILITADA TEMPORALMENTE
    // const user = await getAuthUser(request);
    // if (!user) {
    //   return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    // }

    // Verificar permisos de visualización - DESHABILITADO
    // if (!hasPermission(user, 'admin') && !hasPermission(user, 'viewer') && !hasPermission(user, 'company') && !hasPermission(user, 'cost_center')) {
    //   return NextResponse.json({ error: 'No tiene permisos para ver reportes' }, { status: 403 });
    // }

    const searchParams = request.nextUrl.searchParams;
    const filters = {
      companyId: searchParams.get('companyId') ? parseInt(searchParams.get('companyId')!) : undefined,
      costCenterId: searchParams.get('costCenterId') ? parseInt(searchParams.get('costCenterId')!) : undefined,
      periodId: searchParams.get('periodId') ? parseInt(searchParams.get('periodId')!) : undefined,
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
    };

    // AUTENTICACIÓN DESHABILITADA - No aplicar filtros de permisos
    // if (!hasPermission(user, 'admin')) {
    //   const userCompanyId = user.permissions?.find((p) => p.type === 'company')?.companyId;
    //   if (userCompanyId) {
    //     filters.companyId = userCompanyId;
    //   }
    //   const userCostCenterId = user.permissions?.find((p) => p.type === 'cost_center')?.costCenterId;
    //   if (userCostCenterId) {
    //     filters.costCenterId = userCostCenterId;
    //   }
    // }

    const useCase = new GetExpensesByCostCenterUseCase();
    const results = await useCase.execute(filters);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error obteniendo reporte:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

