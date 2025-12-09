import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/presentation/middleware/auth';
import { ProviderRepository } from '@/infrastructure/repositories/ProviderRepository';

export async function GET(request: NextRequest) {
  try {
    // AUTENTICACIÓN DESHABILITADA TEMPORALMENTE
    // const user = await getAuthUser(request);
    // if (!user) {
    //   return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    // }

    const providerRepository = new ProviderRepository();
    const providers = await providerRepository.findAll();

    return NextResponse.json(providers);
  } catch (error) {
    console.error('Error obteniendo proveedores:', error);
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

    const body = await request.json();
    const providerRepository = new ProviderRepository();
    const provider = await providerRepository.create(body);

    return NextResponse.json(provider, { status: 201 });
  } catch (error) {
    console.error('Error creando proveedor:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

