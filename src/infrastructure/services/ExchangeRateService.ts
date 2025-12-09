export interface ExchangeRateResponse {
  rate: number;
  date: Date;
}

interface BluelyticsResponse {
  oficial: {
    value_avg: number;
    value_sell: number;
    value_buy: number;
  };
  blue: {
    value_avg: number;
    value_sell: number;
    value_buy: number;
  };
}

export class ExchangeRateService {
  /**
   * Obtiene el tipo de cambio blue para una fecha específica desde bluelytics.com.ar
   * @param date Fecha para la cual obtener el tipo de cambio
   * @returns Tipo de cambio blue (value_avg)
   */
  async getExchangeRate(date: Date): Promise<number> {
    try {
      // Formatear la fecha como YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      const response = await fetch(
        `https://api.bluelytics.com.ar/v2/historical?day=${dateString}`
      );

      if (!response.ok) {
        throw new Error(`Error al obtener tipo de cambio: ${response.statusText}`);
      }

      const data: BluelyticsResponse = await response.json();

      // Usar el valor promedio del dólar blue
      if (!data.blue || !data.blue.value_avg) {
        throw new Error('No se encontró el tipo de cambio blue para la fecha especificada');
      }

      return data.blue.value_avg;
    } catch (error) {
      console.error('Error obteniendo tipo de cambio desde bluelytics:', error);
      // En caso de error, lanzar el error para que se maneje en el caso de uso
      throw new Error(
        `No se pudo obtener el tipo de cambio para la fecha ${date.toISOString().split('T')[0]}: ${
          error instanceof Error ? error.message : 'Error desconocido'
        }`
      );
    }
  }

  /**
   * Convierte ARS a USD usando el tipo de cambio
   */
  convertArsToUsd(amountArs: number, exchangeRate: number): number {
    if (exchangeRate <= 0) {
      throw new Error('El tipo de cambio debe ser mayor a cero');
    }
    return amountArs / exchangeRate;
  }

  /**
   * Convierte USD a ARS usando el tipo de cambio
   */
  convertUsdToArs(amountUsd: number, exchangeRate: number): number {
    return amountUsd * exchangeRate;
  }
}
