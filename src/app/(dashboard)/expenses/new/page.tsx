'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';
import { Upload, FileText } from 'lucide-react';

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

export default function NewExpensePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [activePeriod, setActivePeriod] = useState<BudgetPeriod | null>(null);
  const [formData, setFormData] = useState({
    companyId: '',
    costCenterId: '',
    expenseTypeId: '',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [companiesRes, expenseTypesRes, periodsRes] = await Promise.all([
          fetch('/api/companies'),
          fetch('/api/expense-types'),
          fetch('/api/budget-periods?active=true'),
        ]);

        const [companiesData, expenseTypesData, periodsData] = await Promise.all([
          companiesRes.json(),
          expenseTypesRes.json(),
          periodsRes.json(),
        ]);

        setCompanies(companiesData);
        setExpenseTypes(expenseTypesData);
        // Tomar el primer período activo (debería haber solo uno)
        if (periodsData && periodsData.length > 0) {
          setActivePeriod(periodsData[0]);
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    if (formData.companyId) {
      fetch(`/api/cost-centers?companyId=${formData.companyId}`)
        .then(res => res.json())
        .then(data => setCostCenters(data))
        .catch(err => console.error('Error cargando centros de costo:', err));
    } else {
      setCostCenters([]);
      setFormData(prev => ({ ...prev, costCenterId: '' }));
    }
  }, [formData.companyId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Por favor selecciona un archivo PDF');
      return;
    }

    if (!activePeriod) {
      alert('No hay un período de presupuesto activo. Por favor, crea uno en Configuración.');
      setUploading(false);
      return;
    }

    setUploading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);
      formDataToSend.append('companyId', formData.companyId);
      formDataToSend.append('costCenterId', formData.costCenterId);
      formDataToSend.append('expenseTypeId', formData.expenseTypeId);
      formDataToSend.append('budgetPeriodId', activePeriod.id.toString());

      const response = await fetch('/api/expenses/upload', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar la factura');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agregar Gasto</h1>
        <p className="text-muted-foreground">
          Carga una factura PDF para procesarla automáticamente
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nueva Factura</CardTitle>
          <CardDescription>
            Arrastra un archivo PDF o haz clic para seleccionar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Compañía</label>
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
                <label className="text-sm font-medium">Centro de Costo</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.costCenterId}
                  onChange={(e) => setFormData({ ...formData, costCenterId: e.target.value })}
                  required
                  disabled={!formData.companyId}
                >
                  <option value="">{formData.companyId ? 'Seleccionar...' : 'Primero selecciona una compañía'}</option>
                  {costCenters.map((cc) => (
                    <option key={cc.id} value={cc.id}>
                      {cc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Gasto</label>
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

              {activePeriod && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Período de Presupuesto</label>
                  <div className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                    {activePeriod.description} (Activo)
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Se utilizará automáticamente el período activo
                  </p>
                </div>
              )}
            </div>

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
              <Button type="submit" disabled={uploading || !file}>
                {uploading ? 'Procesando...' : 'Cargar Factura'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

