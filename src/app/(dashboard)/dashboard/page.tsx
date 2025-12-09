'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

interface Expense {
  id: number;
  companyId: number;
  costCenterId: number;
  invoiceDate: string;
  amountUsd: number;
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
        const companiesMap = new Map(companies.map((c: Company) => [c.id, c.name]));
        const costCentersMap = new Map(costCenters.map((cc: CostCenter) => [cc.id, cc.name]));

        // Agrupar por mes y compañía
        const byMonthAndCompany: Record<string, Record<string, number>> = {};
        const byMonthAndCostCenter: Record<string, Record<string, number>> = {};

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

          const companyName = companiesMap.get(expense.companyId) || `Compañía ${expense.companyId}`;
          const costCenterName = costCentersMap.get(expense.costCenterId) || `Centro ${expense.costCenterId}`;

          // Agrupar por compañía
          if (!byMonthAndCompany[monthKey]) {
            byMonthAndCompany[monthKey] = {};
          }
          byMonthAndCompany[monthKey][companyName] =
            (byMonthAndCompany[monthKey][companyName] || 0) + expense.amountUsd;

          // Agrupar por centro de costo
          if (!byMonthAndCostCenter[monthKey]) {
            byMonthAndCostCenter[monthKey] = {};
          }
          byMonthAndCostCenter[monthKey][costCenterName] =
            (byMonthAndCostCenter[monthKey][costCenterName] || 0) + expense.amountUsd;
        });

        // Obtener meses y ordenarlos por fecha (ascendente)
        const monthKeys = Object.keys(byMonthAndCompany);
        const sortedMonths = monthKeys.sort((a, b) => {
          const dateA = monthDateMap.get(a) || new Date(a);
          const dateB = monthDateMap.get(b) || new Date(b);
          return dateA.getTime() - dateB.getTime();
        });

        // Transformar datos para gráficos en orden ascendente
        const companyChartData = sortedMonths.map(monthKey => {
          const date = monthDateMap.get(monthKey) || new Date(monthKey);
          const monthDisplay = format(date, 'MMM yyyy').toLowerCase();
          const data: any = { month: monthDisplay };
          Object.keys(byMonthAndCompany[monthKey]).forEach(company => {
            data[company] = byMonthAndCompany[monthKey][company];
          });
          return data;
        });

        const costCenterChartData = sortedMonths.map(monthKey => {
          const date = monthDateMap.get(monthKey) || new Date(monthKey);
          const monthDisplay = format(date, 'MMM yyyy').toLowerCase();
          const data: any = { month: monthDisplay };
          Object.keys(byMonthAndCostCenter[monthKey]).forEach(center => {
            data[center] = byMonthAndCostCenter[monthKey][center];
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
          Evolución de gastos del último período
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
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`} />
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
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`} />
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
    </div>
  );
}
