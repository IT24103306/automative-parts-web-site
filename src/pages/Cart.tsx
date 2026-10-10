import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { Trash2, Plus, Minus, ArrowRight, ArrowLeft, ShoppingCart } from 'lucide-react';
import AutomotiveImage from '../components/AutomotiveImage';

export default function Cart() {
  const { items, removeItem, updateQuantity } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#050505] pt-32 pb-20 flex flex-col items-center px-4 justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center">
          <ShoppingCart className="w-16 h-16 text-neutral-800 mb-6" />
          <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-4 text-center">Your Enquiry Cart is Empty</h1>
          <p className="text-neutral-400 mb-8 text-center max-w-md font-medium">Browse our catalogue to add premium automotive parts to your enquiry list.</p>
          <Link to="/products" className="px-8 py-4 bg-primary text-white font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-colors rounded-sm shadow-[0_0_15px_rgba(255,0,0,0.3)]">
            Return to Catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-28 pb-20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-64 bg-primary/5 blur-[150px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-10 border-b border-neutral-900 pb-8">Order Enquiry Cart</h1>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1 space-y-4">
            {items.map((item) => (
              <div key={item.product.id} className="metallic-panel rounded-sm p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6 group hover:metallic-border transition-all">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-[#0a0a0a] rounded-sm flex-shrink-0 flex items-center justify-center overflow-hidden relative border border-neutral-900">
                  <div className="absolute inset-0 bg-gradient-to-tr from-black to-transparent z-0" />
                  {item.product.images && item.product.images.length > 0 ? (
                    <AutomotiveImage 
                      src={item.product.images[0].url} 
                      alt={item.product.name}
                      category={item.product.category?.name}
                      className="absolute inset-0 w-full h-full p-2 relative z-10 group-hover:scale-110 transition-transform duration-500" 
                    />
                  ) : (
                    <AutomotiveImage 
                      alt={item.product.name}
                      category={item.product.category?.name}
                      className="absolute inset-0 w-full h-full relative z-10" 
                    />
                  )}
                </div>
                
                <div className="flex-1 text-center sm:text-left">
                  <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{item.product.brand}</span>
                  <h3 className="text-lg font-bold text-white line-clamp-1 mb-1">{item.product.name}</h3>
                  <p className="text-xs text-neutral-500 font-mono mb-2">PN: <span className="text-neutral-300">{item.product.partNumber}</span></p>
                  <p className="text-[10px] text-white font-black uppercase tracking-widest">Price on Enquiry</p>
                </div>

                <div className="flex items-center space-x-6 w-full sm:w-auto justify-between sm:justify-start mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-neutral-900">
                  <div className="flex items-center border border-neutral-800 rounded-sm bg-black">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-2.5 text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors rounded-l-sm">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center text-white text-sm font-bold font-mono">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-2.5 text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors rounded-r-sm">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <button onClick={() => removeItem(item.product.id)} className="p-2.5 text-neutral-500 hover:text-white hover:bg-red-600 transition-colors rounded-sm bg-black border border-neutral-800">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <Link to="/products" className="inline-flex items-center text-neutral-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mt-6">
              <ArrowLeft className="w-4 h-4 mr-2" /> Continue Browsing
            </Link>
          </div>

          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="bg-gradient-to-br from-[#0a0a0a] to-black border border-neutral-800 rounded-sm p-8 sticky top-28 shadow-2xl">
              <h3 className="text-lg font-black text-white uppercase tracking-wider mb-6 pb-6 border-b border-neutral-900">Enquiry Summary</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Total Items</span>
                  <span className="text-white font-bold font-mono bg-neutral-900 px-3 py-1 rounded-sm border border-neutral-800">{items.reduce((acc, i) => acc + i.quantity, 0)}</span>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-neutral-900">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Estimated Total</span>
                  <span className="text-primary font-black text-right text-xs uppercase tracking-widest leading-tight">Price will be<br/>confirmed by<br/>NG Motors</span>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 p-4 rounded-sm mb-8 text-[10px] text-neutral-400 leading-relaxed font-medium">
                By proceeding, you will submit an order request. Our team will verify part compatibility, confirm the final price, and contact you with Cash on Delivery or Bank Transfer payment instructions.
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="w-full flex items-center justify-center px-6 py-4 bg-primary text-white font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all rounded-sm shadow-[0_0_15px_rgba(255,0,0,0.3)] mb-4"
              >
                Checkout <ArrowRight className="w-4 h-4 ml-3" />
              </button>
              <button 
                onClick={() => navigate('/contact')}
                className="w-full flex items-center justify-center px-6 py-4 bg-transparent border border-neutral-700 text-white font-black uppercase tracking-widest text-xs hover:border-white transition-all rounded-sm"
              >
                Request Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
