'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface CompanyArea {
  id: number;
  companyId: number;
  name: string;
  description?: string;
}

interface Company {
  id: number;
  name: string;
}

export default function CompanyAreasPage() {
  const [areas, setAreas] = useState<CompanyArea[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CompanyArea | null>(null);
  const [formData, setFormData] = useState({ companyId: '', name: '', description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [areasRes, companiesRes] = await Promise.all([
        fetch('/api/company-areas'),
        fetch('/api/companies'),
      ]);
      const areasData = await areasRes.json();
      const companiesData = await companiesRes.json();
      setAreas(areasData);
      setCompanies(companiesData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editing ? `/api/company-areas/${editing.id}` : '/api/company-areas';
      const method = editing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          companyId: parseInt(formData.companyId),
        }),
      });

      if (response.ok) {
        setShowForm(false);
        setEditing(null);
        setFormData({ companyId: '', name: '', description: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (area: CompanyArea) => {
    setEditing(area);
    setFormData({
      companyId: area.companyId.toString(),
      name: area.name,
      description: area.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta área?')) return;

    try {
      const response = await fetch(`/api/company-areas/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Áreas de Compañía</h1>
          <p className="text-muted-foreground">Gestiona las áreas asociadas de las compañías</p>
        </div>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditing(null);
            setFormData({ companyId: '', name: '', description: '' });
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Área
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editing ? 'Editar' : 'Nueva'} Área de Compañía</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Compañía</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.companyId}
                  onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                  required
                  disabled={!!editing}
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
                <label className="text-sm font-medium">Nombre</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción (Opcional)</label>
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
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
          <CardTitle>Lista de Áreas de Compañía</CardTitle>
        </CardHeader>
        <CardContent>
          {areas.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay áreas de compañía registradas
            </p>
          ) : (
            <div className="space-y-6">
              {companies.map((company) => {
                const companyAreas = areas.filter((area) => area.companyId === company.id);

                if (companyAreas.length === 0) return null;

                return (
                  <div key={company.id} className="space-y-3">
                    <div className="border-b pb-2">
                      <h3 className="text-lg font-semibold">{company.name}</h3>
                    </div>
                    <div className="space-y-2 pl-4">
                      {companyAreas.map((area) => (
                        <div
                          key={area.id}
                          className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{area.name}</p>
                            {area.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {area.description}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(area)}
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(area.id)}
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

