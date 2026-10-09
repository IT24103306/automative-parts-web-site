import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useCart } from '../hooks/useCart';
import { useSettings } from '../hooks/useSettings';
import { ShoppingCart, MessageCircle, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, Truck, X, Calendar } from 'lucide-react';
import PreBookModal from '../components/PreBookModal';
import AutomotiveImage from '../components/AutomotiveImage';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { settings } = useSettings();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPreBookOpen, setIsPreBookOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await apiClient.get(`/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Failed to load product', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-28 flex justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mt-20" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black pt-28 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-white mb-4">Product Not Found</h2>
        <Link to="/products" className="text-primary hover:text-red-400">Return to Catalogue</Link>
      </div>
    );
  }

  const handleWhatsApp = () => {
    const text = `Hi ${settings?.companyName || 'NG Motors'}, I'm inquiring about the price and availability of:\n\nPart: ${product.name}\nPN: ${product.partNumber}\nBrand: ${product.brand}`;
    
    // Remove non-numeric characters from the configured whatsapp number
    const number = settings?.whatsapp?.replace(/\D/g, '') || '';
    
    if (!number) {
      alert("WhatsApp contact is currently unavailable. Please call us directly.");
      return;
    }
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link to="/products" className="inline-flex items-center text-neutral-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Catalogue
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Visual Side */}
          <div className="space-y-6">
            <div className="aspect-square bg-[#0a0a0a] metallic-panel rounded-sm flex items-center justify-center p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-black to-transparent z-0" />
              {/* Product Image */}
              <div className="w-[85%] h-[85%] rounded-md relative z-10 flex flex-col items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-105">
                {product.images && product.images.length > 0 ? (
                  <AutomotiveImage 
                    src={product.images.find((img: any) => img.isPrimary)?.url || product.images[0].url} 
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
            </div>
            
            {/* Gallery thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-4 overflow-x-auto pb-2 custom-scrollbar">
                {product.images.map((img: any) => (
                  <div key={img.id} className={`w-20 h-20 flex-shrink-0 bg-[#0a0a0a] cursor-pointer overflow-hidden rounded-sm transition-all ${img.isPrimary ? 'border-2 border-primary shadow-[0_0_10px_rgba(255,0,0,0.3)]' : 'border border-neutral-800 hover:border-neutral-600'}`}>
                    <AutomotiveImage src={img.url} alt="thumbnail" className="w-full h-full object-cover opacity-80 hover:opacity-100" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Side */}
          <div className="flex flex-col justify-center">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{product.category?.name}</span>
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">{product.brand}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase leading-none mb-4">{product.name}</h1>
              
              <div className="flex flex-wrap gap-4 text-sm font-mono text-neutral-400 mb-8">
                <div className="bg-[#0a0a0a] px-3 py-1.5 border border-neutral-800 rounded-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                  PN: <span className="text-white font-bold">{product.partNumber}</span>
                </div>
                {product.sku && (
                  <div className="bg-[#0a0a0a] px-3 py-1.5 border border-neutral-800 rounded-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                    SKU: <span className="text-white font-bold">{product.SKU}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0a0a0a] to-black border border-neutral-800 p-6 sm:p-8 rounded-sm mb-8 shadow-xl">
              <div className="flex items-center justify-between mb-6 border-b border-neutral-900 pb-6">
                <div>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-bold mb-1">Current Price</p>
                  <p className="text-2xl font-black text-white uppercase tracking-widest">Price on Enquiry</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-bold mb-2">Availability</p>
                  <div className="flex items-center justify-end">
                    {product.availability === 'IN_STOCK' ? (
                      <><CheckCircle2 className="w-4 h-4 text-green-500 mr-2" /><span className="text-green-500 font-black text-xs uppercase tracking-widest">In Stock</span></>
                    ) : product.availability === 'LOW_STOCK' ? (
                      <><AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" /><span className="text-yellow-500 font-black text-xs uppercase tracking-widest">Low Stock</span></>
                    ) : (
                      <><X className="w-4 h-4 text-red-500 mr-2" /><span className="text-red-500 font-black text-xs uppercase tracking-widest">Out of Stock</span></>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {product.availability === 'OUT_OF_STOCK' || product.availability === 'COMING_SOON' || product.availability === 'SPECIAL_ORDER' ? (
                  <button 
                    onClick={() => setIsPreBookOpen(true)}
                    className="w-full flex items-center justify-center px-6 py-4 bg-primary text-white font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-colors rounded-sm shadow-[0_0_15px_rgba(255,0,0,0.3)]"
                  >
                    <Calendar className="w-4 h-4 mr-3" /> Pre-Book / Request
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      addItem(product);
                      navigate('/cart');
                    }}
                    className="w-full flex items-center justify-center px-6 py-4 bg-primary text-white font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-colors rounded-sm shadow-[0_0_15px_rgba(255,0,0,0.3)]"
                  >
                    <ShoppingCart className="w-4 h-4 mr-3" /> Add to Enquiry Cart
                  </button>
                )}
                
                <button 
                  onClick={handleWhatsApp}
                  className="w-full flex items-center justify-center px-6 py-4 bg-black/50 backdrop-blur border border-neutral-700 text-white font-black uppercase tracking-widest text-xs hover:border-green-500 hover:text-green-500 hover:bg-green-500/10 transition-colors rounded-sm"
                >
                  <MessageCircle className="w-4 h-4 mr-3" /> WhatsApp Us
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-10 text-sm text-neutral-400">
              <div className="flex items-start">
                <ShieldCheck className="w-5 h-5 mr-3 text-neutral-500 flex-shrink-0" />
                <p>Designed for exact fitment and reliable performance.</p>
              </div>
              <div className="flex items-start">
                <Truck className="w-5 h-5 mr-3 text-neutral-500 flex-shrink-0" />
                <p>Island-wide delivery available via couriers.</p>
              </div>
            </div>

            {/* Tabs for Description & Specs */}
            <div className="border-t border-neutral-900 pt-8">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Product Details</h3>
              <div className="prose prose-invert max-w-none text-neutral-400 text-sm leading-relaxed mb-8">
                {product.description ? (
                  <p>{product.description}</p>
                ) : (
                  <p>No description provided for this product.</p>
                )}
              </div>

              {/* Vehicle Compatibility Table */}
              {(product.vehicleMake || product.vehicleModel || product.vehicleYear) && (
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Compatibility</h3>
                  <table className="w-full text-sm text-left">
                    <tbody className="divide-y divide-neutral-900">
                      {product.vehicleMake && (
                        <tr><th className="py-3 text-neutral-400 font-normal">Make</th><td className="py-3 font-medium text-white">{product.vehicleMake}</td></tr>
                      )}
                      {product.vehicleModel && (
                        <tr><th className="py-3 text-neutral-400 font-normal">Model</th><td className="py-3 font-medium text-white">{product.vehicleModel}</td></tr>
                      )}
                      {product.vehicleYear && (
                        <tr><th className="py-3 text-neutral-400 font-normal">Year</th><td className="py-3 font-medium text-white">{product.vehicleYear}</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <PreBookModal 
        isOpen={isPreBookOpen} 
        onClose={() => setIsPreBookOpen(false)} 
        initialProduct={product}
      />
    </div>
  );
}
