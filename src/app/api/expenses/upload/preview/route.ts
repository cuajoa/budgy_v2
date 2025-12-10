import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/presentation/middleware/auth';
import { ProviderRepository } from '@/infrastructure/repositories/ProviderRepository';
import { BudgetPeriodRepository } from '@/infrastructure/repositories/BudgetPeriodRepository';
import { ExpenseRepository } from '@/infrastructure/repositories/ExpenseRepository';
import { OpenAIService } from '@/infrastructure/services/OpenAIService';
import { ExchangeRateService } from '@/infrastructure/services/ExchangeRateService';
import { parse } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó archivo' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const providerRepository = new ProviderRepository();
    const budgetPeriodRepository = new BudgetPeriodRepository();
    const expenseRepository = new ExpenseRepository();
    const openAIService = new OpenAIService();
    const exchangeRateService = new ExchangeRateService();

    // Obtener lista de proveedores para ayudar a OpenAI
    const providers = await providerRepository.findAll();
    const providerNames = providers.map((p) => p.name);

    // Extraer datos de la factura usando OpenAI
    const extractedData = await openAIService.extractInvoiceData(buffer, providerNames);

    // Buscar proveedor existente o preparar datos para crear uno nuevo
    let providerId: number | null = null;
    let providerName = extractedData.providerName || '';
    let providerTaxId = extractedData.providerTaxId || '';

    if (extractedData.providerName) {
      // Primero buscar por taxId (CUIT) si está disponible
      let existingProvider = extractedData.providerTaxId
        ? await providerRepository.findByTaxId(extractedData.providerTaxId.replace(/\D/g, ''))
        : null;

      // Si no se encontró por taxId, buscar por nombre (case insensitive)
      if (!existingProvider) {
        existingProvider = providers.find(
          (p) => p.name.toLowerCase() === extractedData.providerName!.toLowerCase()
        ) || null;
      }

      if (existingProvider) {
        providerId = existingProvider.id;
        providerName = existingProvider.name;
        providerTaxId = existingProvider.taxId || extractedData.providerTaxId || '';
      }
    }

    // Validar si la factura ya existe (solo si tenemos número de factura y proveedor)
    let existingExpense = null;
    if (extractedData.invoiceNumber && providerId) {
      // Normalizar el número de factura antes de comparar
      const normalizedInvoiceNumber = extractedData.invoiceNumber.replace(/[\s-]/g, '').toUpperCase().trim();
      existingExpense = await expenseRepository.findByInvoiceNumberAndProvider(
        normalizedInvoiceNumber,
        providerId
      );
    }

    // Obtener período activo
    const activePeriod = await budgetPeriodRepository.findActive();

    // Parsear fecha
    let invoiceDate: Date;
    if (extractedData.invoiceDate) {
      try {
        invoiceDate = parse(extractedData.invoiceDate, 'yyyy-MM-dd', new Date());
      } catch {
        invoiceDate = new Date();
      }
    } else {
      invoiceDate = new Date();
    }

    // Obtener tipo de cambio para la fecha
    let exchangeRate = 0;
    try {
      exchangeRate = await exchangeRateService.getExchangeRate(invoiceDate);
    } catch (error) {
      console.error('Error obteniendo tipo de cambio:', error);
    }

    // Calcular montos
    let amountArs = extractedData.amount || 0;
    let amountUsd = 0;

    if (extractedData.currency === 'USD') {
      amountUsd = amountArs;
      amountArs = exchangeRateService.convertUsdToArs(amountUsd, exchangeRate);
    } else {
      // Asumimos ARS por defecto
      amountUsd = exchangeRateService.convertArsToUsd(amountArs, exchangeRate);
    }

    // Retornar datos extraídos para preview
    return NextResponse.json({
      providerId,
      providerName,
      providerTaxId,
      invoiceNumber: extractedData.invoiceNumber || '',
      invoiceDate: invoiceDate.toISOString().split('T')[0], // YYYY-MM-DD
      amountArs,
      amountUsd,
      exchangeRate,
      description: extractedData.description || '',
      budgetPeriodId: activePeriod?.id || null,
      budgetPeriodDescription: activePeriod?.description || null,
      isDuplicate: existingExpense !== null,
      existingExpenseId: existingExpense?.id || null,
      existingExpenseDate: existingExpense?.invoiceDate ? new Date(existingExpense.invoiceDate).toISOString().split('T')[0] : null,
    });
  } catch (error) {
    console.error('Error procesando preview de factura:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

