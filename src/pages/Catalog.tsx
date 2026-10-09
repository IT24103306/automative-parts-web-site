import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useCart } from '../hooks/useCart';
import { Link } from 'react-router-dom';
import { Search, Filter, Loader2, SearchX } from 'lucide-react';
import AutomotiveImage from '../components/AutomotiveImage';

const formatCompatibility = (comp: any): string => {
  if (!comp) return 'Universal Fit';
  try {
    const data = typeof comp === 'string' ? JSON.parse(comp) : comp;
    if (Array.isArray(data)) {
      return data.length > 0 ? String(data[0]) : 'Universal Fit';
    }
    if (typeof data === 'object' && data !== null) {
      const values = Object.values(data).filter(Boolean);
      if (values.length > 0) return values.join(' ');
    }
    return String(data);
  } catch (e) {
    return 'Universal Fit';
  }
};
export default function Catalog() {
  const { addItem } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [makeParam, setMakeParam] = useState('');
  const [modelParam, setModelParam] = useState('');
  const [yearParam, setYearParam] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('search')) setSearch(params.get('search')!);
    if (params.get('categoryId')) setSelectedCategory(params.get('categoryId')!);
    if (params.get('make')) setMakeParam(params.get('make')!);
    if (params.get('model')) setModelParam(params.get('model')!);
    if (params.get('year')) setYearParam(params.get('year')!);
  }, []);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.append('activeOnly', 'true');
      if (search) query.append('search', search);
      if (selectedCategory) query.append('categoryId', selectedCategory);
      if (makeParam) query.append('make', makeParam);
      if (modelParam) query.append('model', modelParam);
      if (yearParam) query.append('year', yearParam);
      query.append('page', page.toString());

      const [productsRes, categoriesRes] = await Promise.all([
        apiClient.get(`/products?${query.toString()}`),
        apiClient.get('/categories?activeOnly=true')
      ]);
      
      setProducts(productsRes.data.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Failed to load catalog', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [search, selectedCategory, makeParam, modelParam, yearParam, page]);

  return (
    <div className="min-h-screen bg-[#050505] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-neutral-900 pb-8 relative">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 blur-[100px] pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">Product Catalogue</h1>
            <p className="mt-2 text-neutral-400 font-medium">Find the exact part for your vehicle.</p>
          </div>
          
          <div className="mt-6 md:mt-0 w-full md:w-96 relative z-10">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-neutral-500" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search part number or keyword..."
              className="w-full bg-black border border-neutral-800 text-white pl-12 pr-4 py-4 rounded-sm text-sm focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(255,0,0,0.2)] transition-all font-mono"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-[#0a0a0a] border border-neutral-900 rounded-sm p-6 sticky top-28 shadow-xl">
              <div className="flex items-center space-x-2 mb-6 border-b border-neutral-800 pb-4">
                <Filter className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-black text-white uppercase tracking-wider">Filters</h3>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-[0.2em]">Categories</h4>
                <div className="space-y-1">
                  <button 
                    onClick={() => { setSelectedCategory(''); setPage(1); }}
                    className={`block w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest rounded-sm transition-all ${selectedCategory === '' ? 'bg-primary text-white shadow-[0_0_10px_rgba(255,0,0,0.3)]' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'}`}
                  >
                    All Categories
                  </button>
                  {categories.map((c) => (
                    <button 
                      key={c.id}
                      onClick={() => { setSelectedCategory(c.id); setPage(1); }}
                      className={`block w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest rounded-sm transition-all ${selectedCategory === c.id ? 'bg-primary text-white shadow-[0_0_10px_rgba(255,0,0,0.3)]' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="bg-[#0a0a0a] border border-neutral-900 p-16 text-center rounded-sm">
                <SearchX className="w-16 h-16 text-neutral-800 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">No Parts Found</h3>
                <p className="text-neutral-400 max-w-md mx-auto">Try adjusting your search criteria or selecting a different category.</p>
                <button onClick={() => { setSearch(''); setSelectedCategory(''); setMakeParam(''); setModelParam(''); setYearParam(''); window.history.replaceState({}, '', '/products'); }} className="mt-8 px-6 py-3 bg-neutral-900 text-white font-bold uppercase tracking-widest text-xs hover:bg-primary transition-colors rounded-sm">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="group flex flex-col metallic-panel hover:metallic-border red-glow-hover transition-all duration-500 rounded-sm overflow-hidden">
                    <div className="relative aspect-square bg-[#0a0a0a] p-6 flex items-center justify-center overflow-hidden">
                      {product.availability === 'OUT_OF_STOCK' && (
                        <div className="absolute top-4 right-4 z-30 bg-black/80 backdrop-blur border border-red-500/50 text-red-500 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-sm">
                          Out of Stock
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-tr from-black to-transparent z-0" />
                      
                      {/* Image handling */}
                      <div className="w-[85%] h-[85%] relative z-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-700 ease-out">
                        {product.images && product.images.length > 0 ? (
                          <AutomotiveImage 
                            src={product.images[0].url} 
                            alt={product.name} 
                            category={product.category?.name}
                            className="w-full h-full drop-shadow-2xl" 
                          />
                        ) : (
                          <AutomotiveImage 
                            alt={product.name} 
                            category={product.category?.name}
                            className="w-full h-full" 
                          />
                        )}
                      </div>
                      
                      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none" />
                    </div>
                    
                    <div className="p-6 flex flex-col flex-grow bg-gradient-to-b from-[#0a0a0a] to-[#050505]">
                      <span className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-1">{product.category?.name || 'CATEGORY'}</span>
                      <h3 className="text-sm font-bold text-white mb-2 leading-snug line-clamp-2">{product.name}</h3>
                      <div className="text-[10px] text-neutral-400 mb-4 font-mono space-y-1">
                        <p><span className="text-neutral-600">PN:</span> {product.partNumber}</p>
                        <p><span className="text-neutral-600">COMPATIBILITY:</span> {formatCompatibility(product.compatibility)}</p>
                        <p className={`${product.availability === 'OUT_OF_STOCK' ? 'text-red-500' : 'text-green-500'} mt-2`}>
                          ● {product.availability === 'OUT_OF_STOCK' ? 'OUT OF STOCK' : `IN STOCK (${product.stockQuantity || 15})`}
                        </p>
                      </div>
                      
                      <div className="mt-auto flex flex-col gap-3 pt-4 border-t border-neutral-900">
                        <span className="text-[11px] font-black text-white tracking-[0.1em] uppercase">PRICE ON ENQUIRY</span>
                        <div className="flex gap-2">
                          <Link to={`/products/${product.id}`} className="flex-1 py-2 text-center border border-neutral-700 text-white text-[9px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
                            VIEW DETAILS
                          </Link>
                          <button 
                            onClick={() => {
                              if (product.availability === 'OUT_OF_STOCK') {
                                alert(`${product.name} is currently out of stock and cannot be added to cart.`);
                                return;
                              }
                              addItem(product);
                              alert(`${product.name} added to cart!`);
                            }}
                            className="flex-1 py-2 text-center bg-primary text-white text-[9px] font-bold uppercase tracking-widest hover:bg-red-700 transition-colors"
                          >
                            ADD TO CART
                          </button>
                        </div>
                        <a href="#" className="w-full py-2 text-center bg-transparent border border-green-600 text-green-500 text-[9px] font-bold uppercase tracking-widest hover:bg-green-600 hover:text-white transition-colors">
                          WHATSAPP ENQUIRY
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
