import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookMarked,
  Package,
  BarChart3,
  Users,
  Clock,
  Accessibility,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['admin', 'faculty', 'student'],
  },
  {
    label: 'My Bookings',
    href: '/my-bookings',
    icon: <BookMarked className="w-5 h-5" />,
    roles: ['faculty', 'student', 'admin'],
  },
  {
    label: 'Resources',
    href: '/resources',
    icon: <Package className="w-5 h-5" />,
    roles: ['admin', 'faculty', 'student'],
  },
  {
    label: 'Availability',
    href: '/availability',
    icon: <Clock className="w-5 h-5" />,
    roles: ['faculty'],
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    label: 'Manage Resources',
    href: '/admin/resources',
    icon: <Users className="w-5 h-5" />,
    roles: ['admin'],
  },
];

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const filteredItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col border-r border-slate-200 bg-sidebar">
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-2">
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                )}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

// Mobile navigation component
export function MobileNav() {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const filteredItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <nav className="lg:hidden border-t border-slate-200 bg-white">
      <div className="flex items-center gap-1 px-6 py-2 overflow-x-auto">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
