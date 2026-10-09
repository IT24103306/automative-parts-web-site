import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { Plus, Edit2, Trash2, Search, Image as ImageIcon } from 'lucide-react';
import ProductModal from '../../components/admin/ProductModal';
import ProductImagesModal from '../../components/admin/ProductImagesModal';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImagesModalOpen, setIsImagesModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const fetchProductsAndCategories = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        apiClient.get('/products'),
        apiClient.get('/categories')
      ]);
      setProducts(productsRes.data.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  const handleDelete = async (product: any) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await apiClient.delete(`/products/${product.id}`);
      fetchProductsAndCategories();
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.error?.includes('deactivate')) {
        if (window.confirm('This product has associated orders and cannot be deleted. Would you like to deactivate it instead?')) {
          try {
            await apiClient.put(`/products/${product.id}`, { active: false });
            fetchProductsAndCategories();
          } catch (updateError: any) {
            alert('Failed to deactivate product: ' + (updateError.response?.data?.error || ''));
          }
        }
      } else {
        alert(error.response?.data?.error || 'Failed to delete product');
      }
    }
  };

  const openAddModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const openImagesModal = (product: any) => {
    setSelectedProduct(product);
    setIsImagesModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white tracking-tight">Products</h1>
        <button 
          onClick={openAddModal}
          className="bg-primary hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </button>
      </div>

      <div className="bg-neutral-950 border border-neutral-900 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-neutral-900 flex items-center justify-between">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-neutral-500" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              className="bg-black border border-neutral-800 text-white pl-10 pr-4 py-2 rounded-md text-sm focus:outline-none focus:border-primary transition-colors w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-900 text-neutral-400">
              <tr>
                <th className="px-6 py-3 font-medium">Part Number</th>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Brand</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Stock</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-neutral-500">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-neutral-500">
                    No products found. Add your first product to get started.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-neutral-900/50">
                    <td className="px-6 py-4 font-medium text-white">{product.partNumber}</td>
                    <td className="px-6 py-4 text-neutral-300">{product.name}</td>
                    <td className="px-6 py-4 text-neutral-300">{product.brand}</td>
                    <td className="px-6 py-4 text-neutral-300">{product.category?.name}</td>
                    <td className="px-6 py-4 text-neutral-300">
                      {product.stockQuantity}
                      {product.availability === 'OUT_OF_STOCK' && <span className="ml-2 text-xs text-red-500 font-bold">(Out)</span>}
                      {product.availability === 'LOW_STOCK' && <span className="ml-2 text-xs text-yellow-500 font-bold">(Low)</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        product.active ? 'bg-green-900/30 text-green-400 border border-green-900/50' : 'bg-red-900/30 text-red-400 border border-red-900/50'
                      }`}>
                        {product.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openImagesModal(product)} className="text-neutral-400 hover:text-blue-400 mr-3" title="Manage Images">
                        <ImageIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => openEditModal(product)} className="text-neutral-400 hover:text-white mr-3" title="Edit Product">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(product)} className="text-neutral-400 hover:text-red-500" title="Delete Product">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        categories={categories}
        onSuccess={fetchProductsAndCategories}
      />

      {selectedProduct && (
        <ProductImagesModal
          isOpen={isImagesModalOpen}
          onClose={() => setIsImagesModalOpen(false)}
          productId={selectedProduct.id}
        />
      )}
    </div>
  );
}
