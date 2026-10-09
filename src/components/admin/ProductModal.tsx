import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { apiClient } from '../../api/client';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
  categories: any[];
  onSuccess: () => void;
}

export default function ProductModal({ isOpen, onClose, product, categories, onSuccess }: ProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    partNumber: '',
    SKU: '',
    brand: '',
    categoryId: '',
    description: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    stockQuantity: 0,
    lowStockThreshold: 5,
    availability: 'AVAILABLE',
    featured: false,
    active: true
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        partNumber: product.partNumber || '',
        SKU: product.SKU || '',
        brand: product.brand || '',
        categoryId: product.categoryId || '',
        description: product.description || '',
        vehicleMake: product.vehicleMake || '',
        vehicleModel: product.vehicleModel || '',
        vehicleYear: product.vehicleYear || '',
        stockQuantity: product.stockQuantity || 0,
        lowStockThreshold: product.lowStockThreshold || 5,
        availability: product.availability || 'AVAILABLE',
        featured: product.featured ?? false,
        active: product.active ?? true
      });
    } else {
      setFormData({
        name: '',
        partNumber: '',
        SKU: '',
        brand: '',
        categoryId: categories.length > 0 ? categories[0].id : '',
        description: '',
        vehicleMake: '',
        vehicleModel: '',
        vehicleYear: '',
        stockQuantity: 0,
        lowStockThreshold: 5,
        availability: 'AVAILABLE',
        featured: false,
        active: true
      });
    }
    setError('');
  }, [product, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.categoryId) {
      setError('Please select a category');
      setLoading(false);
      return;
    }

    try {
      if (product) {
        await apiClient.put(`/products/${product.id}`, formData);
      } else {
        await apiClient.post('/products', formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-black/80 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative inline-block w-full max-w-3xl p-6 overflow-hidden text-left align-middle transition-all transform bg-neutral-950 border border-neutral-800 shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-5 border-b border-neutral-900 pb-4">
            <h3 className="text-xl font-bold text-white">
              {product ? 'Edit Product' : 'Add New Product'}
            </h3>
            <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-3 mb-4 text-sm text-red-400 border border-red-900/50 rounded-lg bg-red-950/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-6">
              {/* Basic Details */}
              <div>
                <h4 className="text-sm font-semibold text-primary mb-3">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Product Name *</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Part Number *</label>
                    <input type="text" required value={formData.partNumber} onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })} className="w-full px-3 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">SKU *</label>
                    <input type="text" required value={formData.SKU} onChange={(e) => setFormData({ ...formData, SKU: e.target.value })} className="w-full px-3 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Brand *</label>
                    <input type="text" required value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="w-full px-3 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Category *</label>
                    <select required value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} className="w-full px-3 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:border-primary">
                      <option value="" disabled>Select a category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Description</label>
                    <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:border-primary resize-none" />
                  </div>
                </div>
              </div>

              {/* Vehicle Compatibility */}
              <div className="pt-4 border-t border-neutral-900">
                <h4 className="text-sm font-semibold text-primary mb-3">Vehicle Compatibility</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Make</label>
                    <input type="text" value={formData.vehicleMake} onChange={(e) => setFormData({ ...formData, vehicleMake: e.target.value })} placeholder="e.g. Toyota" className="w-full px-3 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Model</label>
                    <input type="text" value={formData.vehicleModel} onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })} placeholder="e.g. Corolla" className="w-full px-3 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Year</label>
                    <input type="text" value={formData.vehicleYear} onChange={(e) => setFormData({ ...formData, vehicleYear: e.target.value })} placeholder="e.g. 2018-2022" className="w-full px-3 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:border-primary" />
                  </div>
                </div>
              </div>

              {/* Inventory & Status */}
              <div className="pt-4 border-t border-neutral-900">
                <h4 className="text-sm font-semibold text-primary mb-3">Inventory & Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Stock Quantity</label>
                    <input type="number" min="0" value={formData.stockQuantity} onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Low Stock Threshold</label>
                    <input type="number" min="0" value={formData.lowStockThreshold} onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:border-primary" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Availability Status</label>
                    <select value={formData.availability} onChange={(e) => setFormData({ ...formData, availability: e.target.value })} className="w-full px-3 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:border-primary">
                      <option value="AVAILABLE">Available / Auto Calculate</option>
                      <option value="OUT_OF_STOCK">Out of Stock</option>
                      <option value="COMING_SOON">Coming Soon</option>
                      <option value="SPECIAL_ORDER">Special Order</option>
                    </select>
                    <p className="text-[10px] text-neutral-500 mt-1">If 'Available' is selected, status will be auto-calculated based on stock quantity.</p>
                  </div>
                  <div className="col-span-2 flex space-x-6 mt-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="w-4 h-4 text-primary bg-black border-neutral-800 rounded focus:ring-primary focus:ring-2" />
                      <span className="text-sm font-medium text-neutral-300">Active Product</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="w-4 h-4 text-primary bg-black border-neutral-800 rounded focus:ring-primary focus:ring-2" />
                      <span className="text-sm font-medium text-neutral-300">Featured</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-6 flex justify-end space-x-3 border-t border-neutral-900 sticky bottom-0 bg-neutral-950 pb-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-neutral-300 bg-transparent border border-neutral-700 rounded-md hover:bg-neutral-900 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {product ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
