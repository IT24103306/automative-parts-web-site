import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { apiClient } from '../../api/client';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: any;
  onSuccess: () => void;
}

export default function CategoryModal({ isOpen, onClose, category, onSuccess }: CategoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order: 0,
    isActive: true,
    imageUrl: ''
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        order: category.order || 0,
        isActive: category.isActive ?? true,
        imageUrl: category.imageUrl || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        order: 0,
        isActive: true,
        imageUrl: ''
      });
    }
    setError('');
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (category) {
        await apiClient.put(`/categories/${category.id}`, formData);
      } else {
        await apiClient.post('/categories', formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-black/80 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative inline-block w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-neutral-950 border border-neutral-800 shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-bold text-white">
              {category ? 'Edit Category' : 'Add Category'}
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:border-primary transition-colors"
                placeholder="e.g. Engine Parts"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:border-primary transition-colors resize-none"
                placeholder="Category description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Display Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              
              <div className="flex flex-col justify-end">
                <label className="flex items-center space-x-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-primary bg-black border-neutral-800 rounded focus:ring-primary focus:ring-2"
                  />
                  <span className="text-sm font-medium text-neutral-300">Active Category</span>
                </label>
              </div>
            </div>

            <div className="pt-4 mt-6 flex justify-end space-x-3 border-t border-neutral-900">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-neutral-300 bg-transparent border border-neutral-700 rounded-md hover:bg-neutral-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {category ? 'Save Changes' : 'Create Category'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
