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

IMPORTANTE: 
- El nombre del proveedor debe extraerse del campo "Razón Social:" que aparece en el encabezado de la factura
- El CUIT (tax_id) del proveedor debe extraerse del campo "CUIT:" que aparece en el encabezado de la factura
- Si encuentras "Razón Social:" en el texto, usa ese valor exacto para providerName
- Si encuentras "CUIT:" en el texto, usa ese valor exacto para providerTaxId

Extrae la siguiente información en formato JSON:
{
  "providerName": "nombre del proveedor extraído del campo 'Razón Social:' del encabezado (debe coincidir con uno de la lista si es posible, pero usa el valor exacto de 'Razón Social:')",
  "providerTaxId": "CUIT del proveedor extraído del campo 'CUIT:' del encabezado (solo números, sin guiones)",
  "invoiceNumber": "número de factura",
  "invoiceDate": "fecha de factura en formato YYYY-MM-DD",
  "amount": número del monto (solo el número, sin símbolos),
  "currency": "ARS o USD",
  "description": "descripción breve del gasto"
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

