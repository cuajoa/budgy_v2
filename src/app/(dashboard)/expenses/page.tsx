'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';
import { FileText, Download, Filter, X, Edit, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface Expense {
  id: number;
  companyId: number;
  providerId: number;
  costCenterId: number;
  expenseTypeId: number;
  budgetPeriodId: number;
  companyAreaId?: number;
  invoiceNumber?: string;
  invoiceDate: string;
  amountArs: number;
  amountUsd: number;
  exchangeRate: number;
  description?: string;
  pdfPath?: string;
  createdAt: string;
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

interface Provider {
  id: number;
  name: string;
}

interface ExpenseType {
  id: number;
  name: string;
}

interface CompanyArea {
  id: number;
  name: string;
  companyId: number;
}

interface BudgetPeriod {
  id: number;
  description: string;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [companyAreas, setCompanyAreas] = useState<CompanyArea[]>([]);
  const [budgetPeriods, setBudgetPeriods] = useState<BudgetPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [saving, setSaving] = useState(false);
  const [editFormData, setEditFormData] = useState({
    providerId: '',
    costCenterId: '',
    expenseTypeId: '',
    budgetPeriodId: '',
    companyAreaId: '',
    invoiceNumber: '',
    invoiceDate: '',
    amountArs: '',
    description: '',
  });
  const [filters, setFilters] = useState({
    companyId: '',
    costCenterId: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (filters.companyId) {
      fetch(`/api/cost-centers?companyId=${filters.companyId}`)
        .then((res) => res.json())
        .then((data) => setCostCenters(data))
        .catch((err) => console.error('Error cargando centros de costo:', err));
    } else {
      setCostCenters([]);
      setFilters((prev) => ({ ...prev, costCenterId: '' }));
    }
  }, [filters.companyId]);

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  const fetchInitialData = async () => {
    try {
      const [companiesRes, providersRes, expenseTypesRes, costCentersRes, areasRes, periodsRes] = await Promise.all([
        fetch('/api/companies'),
        fetch('/api/providers'),
        fetch('/api/expense-types'),
        fetch('/api/cost-centers'),
        fetch('/api/company-areas'),
        fetch('/api/budget-periods'),
      ]);

      const [companiesData, providersData, expenseTypesData, costCentersData, areasData, periodsData] = await Promise.all([
        companiesRes.json(),
        providersRes.json(),
        expenseTypesRes.json(),
        costCentersRes.json(),
        areasRes.json(),
        periodsRes.json(),
      ]);

      setCompanies(companiesData);
      setProviders(providersData);
      setExpenseTypes(expenseTypesData);
      setCostCenters(costCentersData);
      setCompanyAreas(areasData);
      setBudgetPeriods(periodsData);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    }
  };

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.companyId) {
        params.append('companyId', filters.companyId);
      }
      if (filters.costCenterId) {
        params.append('costCenterId', filters.costCenterId);
      }

      const response = await fetch(`/api/expenses?${params.toString()}`);
      const data = await response.json();
      // Asegurar que siempre sea un array
      setExpenses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando gastos:', error);
      setExpenses([]); // En caso de error, establecer array vacío
    } finally {
      setLoading(false);
    }
  };

  const getCompanyName = (companyId: number) => {
    return companies.find((c) => c.id === companyId)?.name || `Compañía ${companyId}`;
  };

  const getCostCenterName = (costCenterId: number) => {
    return costCenters.find((cc) => cc.id === costCenterId)?.name || 
           `Centro ${costCenterId}`;
  };

  const getProviderName = (providerId: number) => {
    return providers.find((p) => p.id === providerId)?.name || `Proveedor ${providerId}`;
  };

  const getExpenseTypeName = (expenseTypeId: number) => {
    return expenseTypes.find((et) => et.id === expenseTypeId)?.name || `Tipo ${expenseTypeId}`;
  };

  const getCompanyAreaName = (areaId?: number) => {
    if (!areaId) return '-';
    return companyAreas.find((a) => a.id === areaId)?.name || `Área ${areaId}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number, currency: 'ARS' | 'USD' = 'USD') => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const clearFilters = () => {
    setFilters({ companyId: '', costCenterId: '' });
  };

  const hasActiveFilters = filters.companyId || filters.costCenterId;

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setEditFormData({
      providerId: expense.providerId.toString(),
      costCenterId: expense.costCenterId.toString(),
      expenseTypeId: expense.expenseTypeId.toString(),
      budgetPeriodId: expense.budgetPeriodId.toString(),
      companyAreaId: expense.companyAreaId?.toString() || '',
      invoiceNumber: expense.invoiceNumber || '',
      invoiceDate: expense.invoiceDate.split('T')[0], // YYYY-MM-DD
      amountArs: expense.amountArs.toString(),
      description: expense.description || '',
    });
    // Cargar cost centers y areas para la compañía del gasto
    fetch(`/api/cost-centers?companyId=${expense.companyId}`)
      .then((res) => res.json())
      .then((data) => {
        const allCostCenters = [...costCenters, ...data.filter((cc: CostCenter) => !costCenters.find(c => c.id === cc.id))];
        setCostCenters(allCostCenters);
      });
    fetch(`/api/company-areas?companyId=${expense.companyId}`)
      .then((res) => res.json())
      .then((data) => {
        const allAreas = [...companyAreas, ...data.filter((a: CompanyArea) => !companyAreas.find(area => area.id === a.id))];
        setCompanyAreas(allAreas);
      });
  };

  const handleSaveEdit = async () => {
    if (!editingExpense) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/expenses/${editingExpense.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: parseInt(editFormData.providerId),
          costCenterId: parseInt(editFormData.costCenterId),
          expenseTypeId: parseInt(editFormData.expenseTypeId),
          budgetPeriodId: parseInt(editFormData.budgetPeriodId),
          companyAreaId: editFormData.companyAreaId ? parseInt(editFormData.companyAreaId) : undefined,
          invoiceNumber: editFormData.invoiceNumber || undefined,
          invoiceDate: editFormData.invoiceDate,
          amountArs: parseFloat(editFormData.amountArs),
          description: editFormData.description || undefined,
        }),
      });

      if (response.ok) {
        setEditingExpense(null);
        fetchExpenses();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error guardando:', error);
      alert('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const getBudgetPeriodName = (periodId: number) => {
    return budgetPeriods.find((p) => p.id === periodId)?.description || `Período ${periodId}`;
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Detalles de Gastos</h1>
          <p className="text-muted-foreground">
            Visualiza y filtra los gastos por compañía o centro de costo
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Compañía</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filters.companyId}
                onChange={(e) =>
                  setFilters({ ...filters, companyId: e.target.value, costCenterId: '' })
                }
              >
                <option value="">Todas las compañías</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Centro de Costo</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filters.costCenterId}
                onChange={(e) => setFilters({ ...filters, costCenterId: e.target.value })}
                disabled={!filters.companyId}
              >
                <option value="">
                  {filters.companyId ? 'Todos los centros de costo' : 'Primero selecciona una compañía'}
                </option>
                {costCenters
                  .filter((cc) => !filters.companyId || cc.companyId === parseInt(filters.companyId))
                  .map((cc) => (
                    <option key={cc.id} value={cc.id}>
                      {cc.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-end">
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  <X className="mr-2 h-4 w-4" />
                  Limpiar Filtros
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Gastos</CardTitle>
          <p className="text-sm text-muted-foreground">
            {expenses.length} {expenses.length === 1 ? 'gasto encontrado' : 'gastos encontrados'}
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Cargando gastos...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No se encontraron gastos</p>
              <p className="text-sm text-muted-foreground mt-2">
                {hasActiveFilters
                  ? 'Intenta ajustar los filtros o agrega nuevos gastos'
                  : 'Agrega tu primer gasto para comenzar'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Fecha</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Centro de Costo</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Área Asociada</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Proveedor</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Tipo</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Factura</th>
                    <th className="text-right p-3 text-sm font-medium text-muted-foreground">Monto ARS</th>
                    <th className="text-right p-3 text-sm font-medium text-muted-foreground">Monto USD</th>
                    <th className="text-right p-3 text-sm font-medium text-muted-foreground">Tipo Cambio</th>
                    <th className="text-center p-3 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // Asegurar que expenses sea un array
                    if (!Array.isArray(expenses) || expenses.length === 0) {
                      return null;
                    }

                    // Agrupar gastos por compañía y luego por centro de costo
                    const groupedByCompany = expenses.reduce((acc, expense) => {
                      const companyId = expense.companyId;
                      const costCenterId = expense.costCenterId;
                      
                      if (!acc[companyId]) {
                        acc[companyId] = {};
                      }
                      if (!acc[companyId][costCenterId]) {
                        acc[companyId][costCenterId] = [];
                      }
                      acc[companyId][costCenterId].push(expense);
                      return acc;
                    }, {} as Record<number, Record<number, Expense[]>>);

                    const rows: JSX.Element[] = [];
                    let totalArs = 0;
                    let totalUsd = 0;

                    // Ordenar compañías por nombre
                    const sortedCompanyIds = Object.keys(groupedByCompany)
                      .map(Number)
                      .sort((a, b) => getCompanyName(a).localeCompare(getCompanyName(b)));

                    sortedCompanyIds.forEach((companyId, companyIndex) => {
                      const companyExpenses = groupedByCompany[companyId];
                      let companyTotalArs = 0;
                      let companyTotalUsd = 0;

                      // Ordenar centros de costo por nombre
                      const sortedCostCenterIds = Object.keys(companyExpenses)
                        .map(Number)
                        .sort((a, b) => getCostCenterName(a).localeCompare(getCostCenterName(b)));

                      sortedCostCenterIds.forEach((costCenterId, costCenterIndex) => {
                        const costCenterExpenses = companyExpenses[costCenterId];
                        let costCenterTotalArs = 0;
                        let costCenterTotalUsd = 0;

                        // Agregar filas de gastos del centro de costo
                        costCenterExpenses.forEach((expense) => {
                          costCenterTotalArs += expense.amountArs;
                          costCenterTotalUsd += expense.amountUsd;
                          totalArs += expense.amountArs;
                          totalUsd += expense.amountUsd;

                          rows.push(
                            <tr
                              key={expense.id}
                              className="border-b hover:bg-accent/50 transition-colors"
                            >
                              <td className="p-3 text-sm">{formatDate(expense.invoiceDate)}</td>
                              <td className="p-3 text-sm">{getCostCenterName(expense.costCenterId)}</td>
                              <td className="p-3 text-sm text-muted-foreground">
                                {getCompanyAreaName(expense.companyAreaId)}
                              </td>
                              <td className="p-3 text-sm">{getProviderName(expense.providerId)}</td>
                              <td className="p-3 text-sm">{getExpenseTypeName(expense.expenseTypeId)}</td>
                              <td className="p-3 text-sm">
                                {expense.invoiceNumber || '-'}
                              </td>
                              <td className="p-3 text-sm text-right font-medium">
                                {formatCurrency(expense.amountArs, 'ARS')}
                              </td>
                              <td className="p-3 text-sm text-right font-medium">
                                {formatCurrency(expense.amountUsd, 'USD')}
                              </td>
                              <td className="p-3 text-sm text-right text-muted-foreground">
                                {expense.exchangeRate.toFixed(2)}
                              </td>
                              <td className="p-3 text-sm text-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(expense)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          );
                        });

                        // Subtotal por centro de costo
                        companyTotalArs += costCenterTotalArs;
                        companyTotalUsd += costCenterTotalUsd;

                        rows.push(
                          <tr
                            key={`subtotal-cc-${costCenterId}`}
                            className="border-t bg-muted/30 font-medium"
                          >
                            <td colSpan={6} className="p-3 text-sm text-right">
                              Subtotal {getCostCenterName(costCenterId)}:
                            </td>
                            <td className="p-3 text-sm text-right">
                              {formatCurrency(costCenterTotalArs, 'ARS')}
                            </td>
                            <td className="p-3 text-sm text-right">
                              {formatCurrency(costCenterTotalUsd, 'USD')}
                            </td>
                            <td></td>
                            <td></td>
                          </tr>
                        );
                      });

                      // Subtotal por compañía
                      rows.push(
                        <tr
                          key={`subtotal-company-${companyId}`}
                          className="border-t-2 bg-muted/50 font-semibold"
                        >
                          <td colSpan={6} className="p-3 text-sm">
                            Subtotal {getCompanyName(companyId)}:
                          </td>
                          <td className="p-3 text-sm text-right">
                            {formatCurrency(companyTotalArs, 'ARS')}
                          </td>
                          <td className="p-3 text-sm text-right">
                            {formatCurrency(companyTotalUsd, 'USD')}
                          </td>
                          <td></td>
                          <td></td>
                        </tr>
                      );
                    });

                    return rows;
                  })()}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-bold bg-primary/10">
                    <td colSpan={6} className="p-3 text-sm">
                      Total General:
                    </td>
                    <td className="p-3 text-sm text-right">
                      {formatCurrency(
                        expenses.reduce((sum, e) => sum + e.amountArs, 0),
                        'ARS'
                      )}
                    </td>
                    <td className="p-3 text-sm text-right">
                      {formatCurrency(
                        expenses.reduce((sum, e) => sum + e.amountUsd, 0),
                        'USD'
                      )}
                    </td>
                    <td></td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {editingExpense && (
        <Card>
          <CardHeader>
            <CardTitle>Editar Gasto</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveEdit();
              }}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Proveedor *</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editFormData.providerId}
                    onChange={(e) => setEditFormData({ ...editFormData, providerId: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Centro de Costo *</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editFormData.costCenterId}
                    onChange={(e) => setEditFormData({ ...editFormData, costCenterId: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {costCenters
                      .filter((cc) => cc.companyId === editingExpense.companyId)
                      .map((cc) => (
                        <option key={cc.id} value={cc.id}>
                          {cc.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de Gasto *</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editFormData.expenseTypeId}
                    onChange={(e) => setEditFormData({ ...editFormData, expenseTypeId: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {expenseTypes.map((et) => (
                      <option key={et.id} value={et.id}>
                        {et.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Período de Presupuesto *</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editFormData.budgetPeriodId}
                    onChange={(e) => setEditFormData({ ...editFormData, budgetPeriodId: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {budgetPeriods.map((bp) => (
                      <option key={bp.id} value={bp.id}>
                        {bp.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Área Asociada (Opcional)</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editFormData.companyAreaId}
                    onChange={(e) => setEditFormData({ ...editFormData, companyAreaId: e.target.value })}
                  >
                    <option value="">Ninguna</option>
                    {companyAreas
                      .filter((a) => a.companyId === editingExpense.companyId)
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Número de Factura</label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editFormData.invoiceNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, invoiceNumber: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha de Factura *</label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editFormData.invoiceDate}
                    onChange={(e) => setEditFormData({ ...editFormData, invoiceDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Monto en ARS *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editFormData.amountArs}
                    onChange={(e) => setEditFormData({ ...editFormData, amountArs: e.target.value })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    El monto en USD se recalculará automáticamente
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción</label>
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingExpense(null)}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

