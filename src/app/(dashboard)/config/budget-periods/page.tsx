'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';
import { Plus, Pencil, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface BudgetPeriod {
  id: number;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function BudgetPeriodsPage() {
  const [periods, setPeriods] = useState<BudgetPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BudgetPeriod | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    startDate: '',
    endDate: '',
    isActive: false,
  });

  useEffect(() => {
    fetchPeriods();
  }, []);

  const fetchPeriods = async () => {
    try {
      const response = await fetch('/api/budget-periods');
      const data = await response.json();
      setPeriods(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editing ? `/api/budget-periods/${editing.id}` : '/api/budget-periods';
      const method = editing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
        }),
      });

      if (response.ok) {
        setShowForm(false);
        setEditing(null);
        setFormData({ description: '', startDate: '', endDate: '', isActive: false });
        fetchPeriods();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (period: BudgetPeriod) => {
    setEditing(period);
    // Convertir las fechas al formato YYYY-MM-DD para los inputs
    const startDate = period.startDate ? new Date(period.startDate).toISOString().split('T')[0] : '';
    const endDate = period.endDate ? new Date(period.endDate).toISOString().split('T')[0] : '';
    setFormData({
      description: period.description,
      startDate,
      endDate,
      isActive: period.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este período de presupuesto?')) return;

    try {
      const response = await fetch(`/api/budget-periods/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchPeriods();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Períodos de Presupuesto</h1>
          <p className="text-muted-foreground">Gestiona los períodos de presupuesto del sistema</p>
        </div>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditing(null);
            setFormData({ description: '', startDate: '', endDate: '', isActive: false });
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Período
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editing ? 'Editar' : 'Nuevo'} Período de Presupuesto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ej: Q1 2024, Enero-Marzo 2024"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha de Inicio</label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha de Fin</label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  Período Activo
                </label>
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditing(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista de Períodos de Presupuesto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {periods.map((period) => (
              <div
                key={period.id}
                className={`flex items-center justify-between rounded-lg border p-4 ${
                  period.isActive ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{period.description}</p>
                    {period.isActive && (
                      <span className="rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                        Activo
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(period.startDate)} - {formatDate(period.endDate)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(period)}
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(period.id)}
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {periods.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No hay períodos de presupuesto registrados
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

