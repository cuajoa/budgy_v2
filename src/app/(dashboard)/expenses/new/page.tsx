'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';
import { Upload, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface Company {
  id: number;
  name: string;
}

interface CostCenter {
  id: number;
  name: string;
  companyId: number;
}

interface ExpenseType {
  id: number;
  name: string;
}

interface BudgetPeriod {
  id: number;
  description: string;
}

interface CompanyArea {
  id: number;
  name: string;
  companyId: number;
}

interface Provider {
  id: number;
  name: string;
  taxId?: string;
}

interface PreviewData {
  providerId: number | null;
  providerName: string;
  providerTaxId: string;
  invoiceNumber: string;
  invoiceDate: string;
  amountArs: number;
  amountUsd: number;
  exchangeRate: number;
  description: string;
  budgetPeriodId: number | null;
  budgetPeriodDescription: string | null;
}

export default function NewExpensePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [companyAreas, setCompanyAreas] = useState<CompanyArea[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [budgetPeriods, setBudgetPeriods] = useState<BudgetPeriod[]>([]);
  const [formData, setFormData] = useState({
    companyId: '',
    costCenterId: '',
    expenseTypeId: '',
    companyAreaId: '',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [companiesRes, expenseTypesRes, periodsRes, providersRes] = await Promise.all([
          fetch('/api/companies'),
          fetch('/api/expense-types'),
          fetch('/api/budget-periods'),
          fetch('/api/providers'),
        ]);

        const [companiesData, expenseTypesData, periodsData, providersData] = await Promise.all([
          companiesRes.json(),
          expenseTypesRes.json(),
          periodsRes.json(),
          providersRes.json(),
        ]);

        setCompanies(companiesData);
        setExpenseTypes(expenseTypesData);
        setBudgetPeriods(periodsData);
        setProviders(providersData);
      } catch (error) {
        console.error('Error cargando datos:', error);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    if (formData.companyId) {
      Promise.all([
        fetch(`/api/cost-centers?companyId=${formData.companyId}`).then(res => res.json()),
        fetch(`/api/company-areas?companyId=${formData.companyId}`).then(res => res.json()),
      ])
        .then(([costCentersData, areasData]) => {
          setCostCenters(costCentersData);
          setCompanyAreas(areasData);
        })
        .catch(err => console.error('Error cargando datos:', err));
    } else {
      setCostCenters([]);
      setCompanyAreas([]);
      setFormData(prev => ({ ...prev, costCenterId: '', companyAreaId: '' }));
    }
  }, [formData.companyId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreviewData(null); // Reset preview cuando se cambia el archivo
    }
  };

  const handleProcessFile = async () => {
    if (!file) {
      alert('Por favor selecciona un archivo PDF');
      return;
    }

    setProcessing(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);

      const response = await fetch('/api/expenses/upload/preview', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewData(data);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la factura');
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!previewData) return;

    if (!formData.companyId || !formData.costCenterId || !formData.expenseTypeId) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    if (!previewData.budgetPeriodId) {
      alert('No hay un período de presupuesto activo. Por favor, crea uno en Configuración.');
      return;
    }

    setSaving(true);
    try {
      // Si el proveedor no existe, necesitamos crearlo primero
      let providerId = previewData.providerId;
      if (!providerId && previewData.providerName) {
        const createProviderResponse = await fetch('/api/providers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: previewData.providerName,
            taxId: previewData.providerTaxId || undefined,
          }),
        });
        if (createProviderResponse.ok) {
          const newProvider = await createProviderResponse.json();
          providerId = newProvider.id;
        } else {
          throw new Error('Error al crear el proveedor');
        }
      }

      if (!providerId) {
        throw new Error('No se pudo determinar el proveedor');
      }

      // Crear el gasto
      const expenseResponse = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: parseInt(formData.companyId),
          providerId,
          costCenterId: parseInt(formData.costCenterId),
          expenseTypeId: parseInt(formData.expenseTypeId),
          budgetPeriodId: previewData.budgetPeriodId,
          companyAreaId: formData.companyAreaId ? parseInt(formData.companyAreaId) : undefined,
          invoiceNumber: previewData.invoiceNumber || undefined,
          invoiceDate: previewData.invoiceDate,
          amountArs: previewData.amountArs,
          amountUsd: previewData.amountUsd,
          exchangeRate: previewData.exchangeRate,
          description: previewData.description || undefined,
        }),
      });

      if (expenseResponse.ok) {
        router.push('/expenses');
      } else {
        const error = await expenseResponse.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar el gasto');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number, currency: 'ARS' | 'USD' = 'USD') => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agregar Gasto</h1>
        <p className="text-muted-foreground">
          Carga una factura PDF para procesarla automáticamente
        </p>
      </div>

      {!previewData ? (
        <Card>
          <CardHeader>
            <CardTitle>Nueva Factura</CardTitle>
            <CardDescription>
              Arrastra un archivo PDF o haz clic para seleccionar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Archivo PDF</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-muted-foreground/25 hover:bg-accent">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {file ? (
                        <>
                          <FileText className="w-10 h-10 mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">{file.name}</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 mb-2 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Haz clic para cargar</span> o arrastra el archivo
                          </p>
                          <p className="text-xs text-muted-foreground">PDF (MAX. 10MB)</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleProcessFile}
                  disabled={processing || !file}
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    'Procesar Factura'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Vista Previa de Factura
              </CardTitle>
              <CardDescription>
                Revisa y edita los datos extraídos antes de guardar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Información del Proveedor */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Información del Proveedor</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nombre del Proveedor</label>
                      <input
                        type="text"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={previewData.providerName}
                        onChange={(e) =>
                          setPreviewData({ ...previewData, providerName: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">CUIT (Opcional)</label>
                      <input
                        type="text"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={previewData.providerTaxId}
                        onChange={(e) =>
                          setPreviewData({ ...previewData, providerTaxId: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Información de la Factura */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Información de la Factura</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Número de Factura</label>
                      <input
                        type="text"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={previewData.invoiceNumber}
                        onChange={(e) =>
                          setPreviewData({ ...previewData, invoiceNumber: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Fecha de Factura</label>
                      <input
                        type="date"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={previewData.invoiceDate}
                        onChange={(e) => {
                          const newDate = e.target.value;
                          setPreviewData({ ...previewData, invoiceDate: newDate });
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Montos */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Montos</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Monto en ARS</label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={previewData.amountArs}
                        onChange={(e) => {
                          const newAmountArs = parseFloat(e.target.value) || 0;
                          const newAmountUsd = newAmountArs / previewData.exchangeRate;
                          setPreviewData({
                            ...previewData,
                            amountArs: newAmountArs,
                            amountUsd: newAmountUsd,
                          });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Monto en USD</label>
                      <div className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                        {formatCurrency(previewData.amountUsd, 'USD')}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Calculado automáticamente
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tipo de Cambio</label>
                      <div className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                        {previewData.exchangeRate.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Descripción</label>
                  <textarea
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                    value={previewData.description}
                    onChange={(e) =>
                      setPreviewData({ ...previewData, description: e.target.value })
                    }
                  />
                </div>

                {/* Campos de Clasificación */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Clasificación</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Compañía *</label>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.companyId}
                        onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                        required
                      >
                        <option value="">Seleccionar...</option>
                        {companies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Centro de Costo *</label>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.costCenterId}
                        onChange={(e) => setFormData({ ...formData, costCenterId: e.target.value })}
                        required
                        disabled={!formData.companyId}
                      >
                        <option value="">
                          {formData.companyId ? 'Seleccionar...' : 'Primero selecciona una compañía'}
                        </option>
                        {costCenters.map((cc) => (
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
                        value={formData.expenseTypeId}
                        onChange={(e) => setFormData({ ...formData, expenseTypeId: e.target.value })}
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
                      <label className="text-sm font-medium">Período de Presupuesto</label>
                      <div className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                        {previewData.budgetPeriodDescription || 'No hay período activo'}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Área Asociada (Opcional)</label>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.companyAreaId}
                        onChange={(e) => setFormData({ ...formData, companyAreaId: e.target.value })}
                        disabled={!formData.companyId}
                      >
                        <option value="">
                          {formData.companyId ? 'Ninguna (opcional)' : 'Primero selecciona una compañía'}
                        </option>
                        {companyAreas.map((area) => (
                          <option key={area.id} value={area.id}>
                            {area.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setPreviewData(null);
                      setFile(null);
                    }}
                  >
                    Volver
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || !formData.companyId || !formData.costCenterId || !formData.expenseTypeId}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar Gasto'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
