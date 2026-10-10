import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Users, Settings, LogOut, Calendar, Menu, X } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

export default function AdminLayout() {
  const { token, logout, admin } = useAdminAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        "fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 bg-neutral-950 border-r border-neutral-900 flex flex-col transform transition-transform duration-300 md:relative md:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-neutral-900">
          <Link to="/admin" className="flex items-center">
            <img src="/images/ng-motors-logo.png" alt="NG Motors Admin" className="h-8 w-auto object-contain" />
          </Link>
          <button className="md:hidden text-neutral-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-6 w-6" />
          </button>
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
                  onClick={() => setMobileMenuOpen(false)}
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
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between h-16 px-4 border-b border-neutral-900 bg-neutral-950">
          <Link to="/admin" className="flex items-center">
            <img src="/images/ng-motors-logo.png" alt="NG Motors Admin" className="h-8 w-auto object-contain" />
          </Link>
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="text-neutral-400 hover:text-white"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>
        
        <main className="flex-1 overflow-y-auto bg-black p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
