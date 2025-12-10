import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/presentation/middleware/auth';
import { ProviderRepository } from '@/infrastructure/repositories/ProviderRepository';

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

    const { id } = await params;
    const body = await request.json();
    const providerRepository = new ProviderRepository();
    const provider = await providerRepository.update(parseInt(id), body);

    return NextResponse.json(provider);
  } catch (error) {
    console.error('Error actualizando proveedor:', error);
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

    const { id } = await params;
    const providerRepository = new ProviderRepository();
    await providerRepository.delete(parseInt(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error eliminando proveedor:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

