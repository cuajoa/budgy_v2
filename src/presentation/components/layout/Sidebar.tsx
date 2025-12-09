'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/presentation/lib/utils';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Settings,
  FileText,
  List
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Gastos',
    href: '/expenses',
    icon: FileText,
    children: [
      { title: 'Ver Gastos', href: '/expenses' },
      { title: 'Agregar Gasto', href: '/expenses/new' },
    ],
  },
  {
    title: 'Configuración',
    href: '/config',
    icon: Settings,
    children: [
      { title: 'Empresas', href: '/config/companies' },
      { title: 'Centros de Costo', href: '/config/cost-centers' },
      { title: 'Proveedores', href: '/config/providers' },
      { title: 'Tipos de Gasto', href: '/config/expense-types' },
      { title: 'Períodos de Presupuesto', href: '/config/budget-periods' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold">Budgy v2</h1>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Link>
              {item.children && isActive && (
                <div className="ml-8 mt-2 space-y-1">
                  {item.children.map((child) => {
                    const isChildActive = pathname === child.href;
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'block rounded-lg px-3 py-2 text-sm transition-colors',
                          isChildActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                      >
                        {child.title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

