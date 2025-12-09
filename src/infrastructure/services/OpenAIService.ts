import OpenAI from 'openai';
import pdfParse from 'pdf-parse';

export interface ExtractedInvoiceData {
  providerName?: string;
  providerTaxId?: string; // CUIT del proveedor
  invoiceNumber?: string;
  invoiceDate?: string;
  amount?: number;
  currency?: string;
  description?: string;
}

export class OpenAIService {
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY no está configurada');
    }
    this.client = new OpenAI({ apiKey });
  }

  async extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(pdfBuffer);
      return data.text;
    } catch (error) {
      throw new Error(`Error al extraer texto del PDF: ${error}`);
    }
  }

  async extractInvoiceData(pdfBuffer: Buffer, providers: string[]): Promise<ExtractedInvoiceData> {
    try {
      // Extraer texto del PDF
      const text = await this.extractTextFromPDF(pdfBuffer);

      // Preparar prompt para OpenAI
      const providersList = providers.length > 0 ? providers.join(', ') : 'desconocido';
      
      const prompt = `Eres un asistente experto en extraer información de facturas argentinas. Analiza el siguiente texto extraído de un PDF de factura y extrae la información relevante.

Texto de la factura:
${text}

Lista de proveedores conocidos: ${providersList}

IMPORTANTE - ESTRUCTURA DE LA FACTURA:
Las facturas argentinas tienen DOS secciones principales:

1. **SECCIÓN DEL PROVEEDOR (QUIEN EMITIÓ LA FACTURA)** - Primera parte, generalmente en la parte superior izquierda:
   - Contiene "Razón Social:" con el nombre del proveedor (ej: "CARBAJAL MARIO ENRIQUE" o "CPS Comunicaciones S.A.")
   - Contiene "CUIT:" o "C.U.I.T.:" con el CUIT del proveedor (ej: "20322670088" o "30-69685097-2")
   - Puede tener "Domicilio Comercial:" y "Condición frente al IVA:"
   - Esta es la información del VENDEDOR/PROVEEDOR que emitió la factura

2. **SECCIÓN DEL CLIENTE (A QUIÉN LE FACTURÓ)** - Segunda parte, generalmente en la parte superior derecha o más abajo:
   - Contiene "Apellido y Nombre / Razón Social:" o "Cliente:" con el nombre del cliente (ej: "LATIN SECURITIES S. A." o "DELTA ASSET MANAGEMENT")
   - Contiene "CUIT:" con el CUIT del cliente
   - Esta es la información del COMPRADOR/CLIENTE

INSTRUCCIONES CRÍTICAS PARA CADA CAMPO:

**providerName y providerTaxId:**
- El proveedor es QUIEN EMITIÓ la factura, NO el cliente
- Busca la PRIMERA sección que contiene "Razón Social:" (sin "Apellido y Nombre" antes)
- El CUIT del proveedor está en la MISMA sección que el "Razón Social:" del proveedor
- NO uses los datos de la sección del cliente (que puede tener "LATIN SECURITIES" o "DELTA")
- El proveedor generalmente aparece ANTES en el documento que el cliente

**invoiceNumber:**
- Busca el número de factura cerca de etiquetas como: "Factura N°", "Comp. Nro:", "Número de Factura", "Nro Factura", etc.
- Puede tener formato como "A - 0018 - 00411103" o simplemente números

**invoiceDate (CRÍTICO):**
- La fecha de la factura SIEMPRE está cerca del número de factura
- Busca etiquetas como: "Fecha:", "Fecha de Emisión:", "Fecha de Factura:", "Fecha de Venta:", etc.
- La fecha generalmente está en la misma línea o muy cerca del número de factura
- **EXCLUYE EXPLÍCITAMENTE:** "INICIO DE ACTIVIDADES", "Fecha de Inicio", "Fecha de Alta", o cualquier otra fecha que no sea la fecha de emisión de la factura
- **NO uses** la fecha de "INICIO DE ACTIVIDADES" - esa es una fecha administrativa del proveedor, NO la fecha de la factura
- Si encuentras múltiples fechas, usa SOLO la que está asociada al número de factura
- Formato esperado: DD/MM/YYYY o similar, convertir a YYYY-MM-DD

**amount (CRÍTICO):**
- Busca específicamente el label "TOTAL" (puede estar como "Total:", "TOTAL:", "Total a Pagar:", etc.)
- El monto TOTAL es el valor final que incluye todos los impuestos
- Si hay múltiples totales, usa el "TOTAL" final (generalmente el último)
- Puede estar en ARS o USD - extrae el valor numérico sin símbolos
- Si hay dos totales (uno en ARS y otro en USD), extrae ambos y determina la moneda
- Remueve puntos de miles (ej: "512.528,32" -> 512528.32) y usa punto como decimal
- Si el total está en formato "u$s 353.47" o "$ 512,528.32", extrae el número correspondiente

**currency:**
- Determina si el monto principal está en ARS (pesos argentinos) o USD (dólares)
- Generalmente las facturas argentinas están en ARS, pero algunas pueden estar en USD
- Si el total muestra "u$s" o "USD", la moneda es USD
- Si el total muestra "$" o "ARS", la moneda es ARS

**description:**
- Extrae una descripción breve del producto o servicio facturado
- Puede estar en una sección "Descripción", "Concepto", "Detalle", etc.
- Si hay múltiples ítems, usa el concepto principal o el primero

Extrae la siguiente información en formato JSON:
{
  "providerName": "nombre del proveedor extraído del campo 'Razón Social:' de la SECCIÓN DEL PROVEEDOR (quien emitió la factura), NO del cliente. Usa el valor exacto encontrado.",
  "providerTaxId": "CUIT del proveedor extraído del campo 'CUIT:' o 'C.U.I.T.:' de la MISMA sección del proveedor (solo números, sin guiones ni espacios)",
  "invoiceNumber": "número de factura encontrado cerca de etiquetas como 'Factura N°', 'Comp. Nro:', etc.",
  "invoiceDate": "fecha de emisión de la factura en formato YYYY-MM-DD. DEBE estar cerca del número de factura. EXCLUYE 'INICIO DE ACTIVIDADES' y otras fechas administrativas.",
  "amount": número del monto TOTAL de la factura (buscar específicamente el label 'TOTAL'). Solo el número, sin símbolos, sin puntos de miles, usar punto como decimal si aplica (ej: 512528.32 o 353.47)",
  "currency": "ARS o USD según el monto extraído (si dice 'u$s' o 'USD' es USD, si dice '$' es ARS)",
  "description": "descripción breve del producto/servicio facturado"
}

Si algún campo no se puede determinar, usa null. Responde SOLO con el JSON, sin texto adicional.`;

      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente experto en extraer información estructurada de facturas. Siempre respondes en formato JSON válido.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No se recibió respuesta de OpenAI');
      }

      const extractedData = JSON.parse(content) as ExtractedInvoiceData;
      return extractedData;
    } catch (error) {
      throw new Error(`Error al extraer datos de la factura: ${error}`);
    }
  }
}

