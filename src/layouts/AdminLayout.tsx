import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Users, Settings, LogOut, Calendar } from 'lucide-react';
import clsx from 'clsx';

export default function AdminLayout() {
  const { token, logout, admin } = useAdminAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: FolderTree },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Pre-Bookings', href: '/admin/pre-bookings', icon: Calendar },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 bg-neutral-950 border-r border-neutral-900 flex flex-col">
        <div className="flex items-center h-16 px-6 border-b border-neutral-900">
          <span className="text-xl font-bold tracking-tight text-white">
            <span className="text-primary mr-2">NG</span>Admin
          </span>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-3 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                              (item.href !== '/admin' && location.pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    isActive ? 'bg-neutral-900 text-white' : 'text-neutral-400 hover:bg-neutral-900/50 hover:text-white',
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors'
                  )}
                >
                  <Icon
                    className={clsx(
                      isActive ? 'text-primary' : 'text-neutral-500 group-hover:text-neutral-300',
                      'flex-shrink-0 -ml-1 mr-3 h-5 w-5'
                    )}
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-neutral-900">
          <div className="flex items-center mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-bold text-primary">
              {admin?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3 truncate">
              <p className="text-sm font-medium text-white">{admin?.name}</p>
              <p className="text-xs text-neutral-500 truncate">{admin?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-neutral-400 hover:bg-neutral-900 hover:text-white rounded-md transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5 text-neutral-500" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-black p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
