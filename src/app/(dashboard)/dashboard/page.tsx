'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ExpenseData {
  month: string;
  company: string;
  amount: number;
}

interface CostCenterData {
  month: string;
  costCenter: string;
  amount: number;
}

export default function DashboardPage() {
  const [expenseData, setExpenseData] = useState<ExpenseData[]>([]);
  const [costCenterData, setCostCenterData] = useState<CostCenterData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Obtener gastos del último período
        const expensesResponse = await fetch('/api/expenses');
        const expenses = await expensesResponse.json();

        // Agrupar por mes y compañía
        const byMonthAndCompany: Record<string, Record<string, number>> = {};
        const byMonthAndCostCenter: Record<string, Record<string, number>> = {};

        expenses.forEach((expense: any) => {
          const month = new Date(expense.invoiceDate).toLocaleDateString('es-AR', { 
            year: 'numeric', 
            month: 'short' 
          });

          if (!byMonthAndCompany[month]) {
            byMonthAndCompany[month] = {};
          }
          if (!byMonthAndCostCenter[month]) {
            byMonthAndCostCenter[month] = {};
          }

          // Obtener nombre de compañía y centro de costo
          fetch(`/api/companies?id=${expense.companyId}`)
            .then(res => res.json())
            .then(companies => {
              const companyName = companies[0]?.name || `Compañía ${expense.companyId}`;
              byMonthAndCompany[month][companyName] = 
                (byMonthAndCompany[month][companyName] || 0) + expense.amountUsd;
            });

          fetch(`/api/cost-centers?id=${expense.costCenterId}`)
            .then(res => res.json())
            .then(centers => {
              const centerName = centers[0]?.name || `Centro ${expense.costCenterId}`;
              byMonthAndCostCenter[month][centerName] = 
                (byMonthAndCostCenter[month][centerName] || 0) + expense.amountUsd;
            });
        });

        // Transformar datos para gráficos
        const months = Object.keys(byMonthAndCompany);
        const companyChartData = months.map(month => {
          const data: any = { month };
          Object.keys(byMonthAndCompany[month]).forEach(company => {
            data[company] = byMonthAndCompany[month][company];
          });
          return data;
        });

        const costCenterChartData = months.map(month => {
          const data: any = { month };
          Object.keys(byMonthAndCostCenter[month]).forEach(center => {
            data[center] = byMonthAndCostCenter[month][center];
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gastos por Centro de Costo</CardTitle>
            <CardDescription>Evolución mensual en USD</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

