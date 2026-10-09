import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { Package, FolderTree, ShoppingCart, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    orders: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Quick workaround to get counts since we don't have a /stats endpoint yet
        const [productsRes, categoriesRes] = await Promise.all([
          apiClient.get('/products?limit=1'),
          apiClient.get('/categories')
        ]);
        
        setStats({
          products: productsRes.data.pagination?.total || 0,
          categories: categoriesRes.data.length || 0,
          orders: 0
        });
      } catch (error) {
        console.error('Error fetching stats', error);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-400">Total Products</p>
              <p className="mt-2 text-3xl font-bold text-white">{stats.products}</p>
            </div>
            <div className="h-12 w-12 bg-neutral-900 rounded-full flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-400">Categories</p>
              <p className="mt-2 text-3xl font-bold text-white">{stats.categories}</p>
            </div>
            <div className="h-12 w-12 bg-neutral-900 rounded-full flex items-center justify-center">
              <FolderTree className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-400">Pending Orders</p>
              <p className="mt-2 text-3xl font-bold text-white">{stats.orders}</p>
            </div>
            <div className="h-12 w-12 bg-neutral-900 rounded-full flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-8 flex flex-col items-center justify-center text-center">
        <AlertTriangle className="h-12 w-12 text-neutral-500 mb-4" />
        <h3 className="text-lg font-medium text-white">Welcome to NG Motors Admin</h3>
        <p className="mt-2 text-neutral-400 max-w-md">
          Use the sidebar to manage products, categories, orders, and site settings. All data updates immediately across the storefront.
        </p>
      </div>
    </div>
  );
}
