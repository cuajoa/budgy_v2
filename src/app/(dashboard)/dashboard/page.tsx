'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

interface Expense {
  id: number;
  companyId: number;
  costCenterId: number;
  invoiceDate: string;
  amountUsd: number;
  additionalCompanyIds?: number[]; // IDs de compañías adicionales para prorrateo
}

interface Company {
  id: number;
  name: string;
}

interface CostCenter {
  id: number;
  name: string;
  companyId: number;
}

export default function DashboardPage() {
  const [expenseData, setExpenseData] = useState<any[]>([]);
  const [costCenterData, setCostCenterData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Cargar todos los datos necesarios en paralelo
        const [expensesRes, companiesRes, costCentersRes] = await Promise.all([
          fetch('/api/expenses'),
          fetch('/api/companies'),
          fetch('/api/cost-centers'),
        ]);

        const [expenses, companies, costCenters] = await Promise.all([
          expensesRes.json(),
          companiesRes.json(),
          costCentersRes.json(),
        ]);

        // Crear mapas para búsqueda rápida
        const companiesMap = new Map<number, string>(companies.map((c: Company) => [c.id, c.name]));
        const costCentersMap = new Map<number, string>(costCenters.map((cc: CostCenter) => [cc.id, cc.name]));

        // Agrupar por mes y compañía
        const byMonthAndCompany: Record<string, Record<string, number>> = {};
        const byMonthAndCostCenter: Record<string, Record<string, number>> = {};

        // Helper para agregar valor a compañía del mes
        const addToMonthCompany = (monthKey: string, companyName: string, amount: number): void => {
          if (!byMonthAndCompany[monthKey]) {
            byMonthAndCompany[monthKey] = {} as Record<string, number>;
          }
          const monthData = byMonthAndCompany[monthKey] as Record<string, number>;
          monthData[companyName] = (monthData[companyName] || 0) + amount;
        };

        // Helper para agregar valor a centro de costo del mes
        const addToMonthCostCenter = (monthKey: string, costCenterName: string, amount: number): void => {
          if (!byMonthAndCostCenter[monthKey]) {
            byMonthAndCostCenter[monthKey] = {} as Record<string, number>;
          }
          const monthData = byMonthAndCostCenter[monthKey] as Record<string, number>;
          monthData[costCenterName] = (monthData[costCenterName] || 0) + amount;
        };

        // Crear un mapa de fechas para ordenamiento
        const monthDateMap = new Map<string, Date>();

        expenses.forEach((expense: Expense) => {
          const date = new Date(expense.invoiceDate);
          // Usar formato YYYY-MM para ordenamiento, luego formatear para display
          const monthKey = format(date, 'yyyy-MM');
          const monthDisplay = format(date, 'MMM yyyy').toLowerCase();

          // Guardar la fecha para ordenamiento
          if (!monthDateMap.has(monthKey)) {
            monthDateMap.set(monthKey, date);
          }

          const companyNameValue = companiesMap.get(expense.companyId);
          const companyName: string = companyNameValue ? String(companyNameValue) : `Compañía ${expense.companyId}`;
          const costCenterNameValue = costCentersMap.get(expense.costCenterId);
          const costCenterName: string = costCenterNameValue ? String(costCenterNameValue) : `Centro ${expense.costCenterId}`;

          // Calcular compañías para prorrateo
          // Si hay compañías adicionales, incluir también la compañía principal
          const companiesToProrate = expense.additionalCompanyIds && expense.additionalCompanyIds.length > 0
            ? [expense.companyId, ...expense.additionalCompanyIds]
            : [expense.companyId];
          
          // Calcular el monto prorrateado por compañía
          const proratedAmount = expense.amountUsd / companiesToProrate.length;

          // Agrupar por compañía con prorrateo
          companiesToProrate.forEach(companyId => {
            const companyName = companiesMap.get(companyId);
            const proratedCompanyName: string = companyName ? String(companyName) : `Compañía ${companyId}`;
            addToMonthCompany(monthKey, proratedCompanyName, proratedAmount);
          });

          // Agrupar por centro de costo (sin prorrateo, se mantiene el monto completo)
          addToMonthCostCenter(monthKey, costCenterName, expense.amountUsd);
        });

        // Obtener todas las compañías únicas de todos los meses
        const allCompanies = new Set<string>();
        Object.values(byMonthAndCompany).forEach(monthData => {
          Object.keys(monthData).forEach(company => allCompanies.add(company));
        });

        // Obtener meses y ordenarlos por fecha (ascendente)
        const monthKeys = Object.keys(byMonthAndCompany);
        const sortedMonths = monthKeys.sort((a, b) => {
          const dateA = monthDateMap.get(a) || new Date(a);
          const dateB = monthDateMap.get(b) || new Date(b);
          return dateA.getTime() - dateB.getTime();
        });

        // Transformar datos para gráficos en orden ascendente
        // Asegurar que todas las compañías aparezcan en todos los meses
        const companyChartData = sortedMonths.map(monthKey => {
          const date = monthDateMap.get(monthKey) || new Date(monthKey);
          const monthDisplay = format(date, 'MMM yyyy').toLowerCase();
          const data: any = { month: monthDisplay };
          
          // Incluir todas las compañías, con 0 si no tienen gastos en ese mes
          const monthCompanyData = byMonthAndCompany[monthKey] || ({} as Record<string, number>);
          allCompanies.forEach(company => {
            data[company] = monthCompanyData[company] || 0;
          });
          
          return data;
        });

        const costCenterChartData = sortedMonths.map(monthKey => {
          const date = monthDateMap.get(monthKey) || new Date(monthKey);
          const monthDisplay = format(date, 'MMM yyyy').toLowerCase();
          const data: any = { month: monthDisplay };
          const monthCostCenterData = byMonthAndCostCenter[monthKey] || ({} as Record<string, number>);
          Object.keys(monthCostCenterData).forEach(center => {
            data[center] = monthCostCenterData[center];
          });
          return data;
        });

        setExpenseData(companyChartData);
        setCostCenterData(costCenterChartData);
        setLoading(false);
      } catch (error) {
        console.error('Error cargando datos:', error);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Formateador para valores en USD
  const formatUsd = (value: number) => {
    return `$${value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Formateador para el eje Y
  const formatYAxis = (tickItem: number) => {
    return `$${(tickItem / 1000).toFixed(0)}k`;
  };

  // Formateador para tooltips
  const formatTooltip = (value: number, name: string) => {
    return [`${formatUsd(value)} USD`, name];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Evolución de gastos del último período (en USD)
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Compañía</CardTitle>
            <CardDescription>Evolución mensual en USD</CardDescription>
          </CardHeader>
          <CardContent>
            {expenseData.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No hay datos para mostrar</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expenseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis 
                    tickFormatter={formatYAxis}
                    label={{ value: 'Monto (USD)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip formatter={formatTooltip} />
                  <Legend />
                  {expenseData.length > 0 && Object.keys(expenseData[0]).filter(k => k !== 'month').map((company, index) => (
                    <Bar key={company} dataKey={company} fill={`hsl(${index * 60}, 70%, 50%)`} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gastos por Centro de Costo</CardTitle>
            <CardDescription>Evolución mensual en USD</CardDescription>
          </CardHeader>
          <CardContent>
            {costCenterData.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No hay datos para mostrar</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={costCenterData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis 
                    tickFormatter={formatYAxis}
                    label={{ value: 'Monto (USD)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip formatter={formatTooltip} />
                  <Legend />
                  {costCenterData.length > 0 && Object.keys(costCenterData[0]).filter(k => k !== 'month').map((center, index) => (
                    <Bar key={center} dataKey={center} fill={`hsl(${index * 40 + 180}, 70%, 50%)`} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de líneas por compañía */}
      <Card>
        <CardHeader>
          <CardTitle>Evolución de Gastos por Compañía</CardTitle>
          <CardDescription>Evolución mensual en USD - Vista de líneas</CardDescription>
        </CardHeader>
        <CardContent>
          {expenseData.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">No hay datos para mostrar</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={expenseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  tickFormatter={formatYAxis}
                  label={{ value: 'Monto (USD)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip formatter={formatTooltip} />
                <Legend />
                {expenseData.length > 0 && Object.keys(expenseData[0]).filter(k => k !== 'month').map((company, index) => (
                  <Line 
                    key={company} 
                    type="monotone" 
                    dataKey={company} 
                    stroke={`hsl(${index * 60}, 70%, 50%)`}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
