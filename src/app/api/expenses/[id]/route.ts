import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, hasPermission } from '@/presentation/middleware/auth';
import { ExpenseRepository } from '@/infrastructure/repositories/ExpenseRepository';
import { ExchangeRateService } from '@/infrastructure/services/ExchangeRateService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    const expenseRepository = new ExpenseRepository();
    const expense = await expenseRepository.findById(parseInt(params.id));

    if (!expense) {
      return NextResponse.json({ error: 'Gasto no encontrado' }, { status: 404 });
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error obteniendo gasto:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    const body = await request.json();
    const expenseRepository = new ExpenseRepository();
    const exchangeRateService = new ExchangeRateService();

    // Si se actualiza amountArs o invoiceDate, recalcular amountUsd y exchangeRate
    if (body.amountArs !== undefined || body.invoiceDate !== undefined) {
      const existingExpense = await expenseRepository.findById(parseInt(params.id));
      if (!existingExpense) {
        return NextResponse.json({ error: 'Gasto no encontrado' }, { status: 404 });
      }

      const invoiceDate = body.invoiceDate ? new Date(body.invoiceDate) : existingExpense.invoiceDate;
      const amountArs = body.amountArs !== undefined ? body.amountArs : existingExpense.amountArs;

      // Obtener tipo de cambio para la fecha
      let exchangeRate = body.exchangeRate;
      if (!exchangeRate) {
        try {
          exchangeRate = await exchangeRateService.getExchangeRate(invoiceDate);
        } catch (error) {
          console.error('Error obteniendo tipo de cambio:', error);
          exchangeRate = existingExpense.exchangeRate;
        }
      }

      // Recalcular USD
      const amountUsd = exchangeRateService.convertArsToUsd(amountArs, exchangeRate);

      body.amountUsd = amountUsd;
      body.exchangeRate = exchangeRate;
    }

    const expense = await expenseRepository.update(parseInt(params.id), body);

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error actualizando gasto:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    const expenseRepository = new ExpenseRepository();
    await expenseRepository.delete(parseInt(params.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error eliminando gasto:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

