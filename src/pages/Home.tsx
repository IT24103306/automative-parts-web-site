import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { ArrowRight, Cpu, Disc } from 'lucide-react';
import { apiClient } from '../api/client';
import AutomotiveImage from '../components/AutomotiveImage';
import EngineeringHotspot from '../components/EngineeringHotspot';
import PreBookModal from '../components/PreBookModal';

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

const HeroVideo = () => {
  return (
    <div className="relative h-[95vh] w-full bg-black overflow-hidden flex items-center">
      <video
        className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        src="/videos/hero-exploded-car.mp4"
      >
      </video>

      {/* Cinematic Gradients to blend video into the background */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-80 z-10 pointer-events-none" />

      {/* Engineering HUD Overlays */}
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
        {/* Top Right HUD */}
        <div className="absolute top-[20%] right-[10%] hidden sm:flex items-center gap-3 opacity-70">
          <div className="w-16 h-[1px] bg-primary relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-white/50 animate-[shimmer_2s_infinite]" />
          </div>
          <span className="text-[9px] font-mono text-white tracking-widest">ENGINE BLOCK</span>
          <Cpu className="w-3 h-3 text-neutral-500" />
        </div>
        
        {/* Bottom Right HUD */}
        <div className="absolute bottom-[30%] right-[15%] hidden sm:flex items-center gap-3 opacity-70">
          <div className="w-24 h-[1px] bg-neutral-500 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-white/50 animate-[shimmer_3s_infinite]" />
          </div>
          <span className="text-[9px] font-mono text-white tracking-widest">BRAKE SYSTEM</span>
          <Disc className="w-3 h-3 text-neutral-500" />
        </div>

        {/* Center Top HUD */}
        <div className="absolute top-[30%] left-[45%] hidden sm:flex flex-col items-center gap-2 opacity-50">
          <span className="text-[8px] font-mono text-primary tracking-[0.3em]">SYSTEM DIAGNOSTICS</span>
          <div className="w-[1px] h-20 bg-gradient-to-b from-primary to-transparent" />
        </div>
      </div>

      <div className="relative z-30 w-full max-w-screen-2xl mx-auto flex items-center px-4 sm:px-8 lg:px-16 pointer-events-none">
        <div className="w-full lg:w-1/2 flex flex-col justify-center pointer-events-auto mt-20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-[2px] bg-primary shadow-[0_0_10px_rgba(255,0,0,0.8)]" />
            <h2 className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.4em]">
              AUTOMOTIVE PARTS • ENGINEERING • PERFORMANCE
            </h2>
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-[5.5rem] vibrant-heading leading-[0.85] mb-8">
            <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">ENGINEERED</span> <br />
            <span className="silver-text-gradient">FOR EVERY</span><br />
            <span className="text-white relative inline-block">
              JOURNEY.
              <div className="absolute -bottom-2 left-0 w-1/3 h-[3px] bg-primary shadow-[0_0_15px_rgba(255,0,0,0.6)]" />
            </span>
          </h1>
          
          <p className="text-sm text-neutral-400 font-mono tracking-wider mb-10 leading-relaxed max-w-md border-l border-neutral-800 pl-6">
            Premium automotive spare parts, precision and compatibility for every drive.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 mb-6">
            <a href="#configurator" className="btn-primary w-max text-center flex items-center gap-3">
              FIND YOUR PART
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link to="/products" className="btn-secondary w-max text-center">
              EXPLORE CATALOGUE
            </Link>
          </div>
          
          <a href="#" className="text-[10px] text-green-500 font-bold uppercase tracking-widest hover:text-green-400 transition-colors flex items-center w-max mt-4 group">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-3 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" /> 
            <span className="border-b border-transparent group-hover:border-green-500 transition-colors pb-1">WHATSAPP ENQUIRY</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const { addItem } = useCart();
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [isPreBookModalOpen, setIsPreBookModalOpen] = useState(false);

  useEffect(() => {
    apiClient.get('/products?featured=true&limit=8').then(res => {
      setFeaturedProducts(res.data.data);
    }).catch(console.error);

    apiClient.get('/categories').then(res => {
      setDbCategories(res.data.slice(0, 6));
    }).catch(console.error);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-black-graphite">
      <HeroVideo />

      {/* 02 INTERACTIVE ENGINEERING */}
      <section className="py-24 bg-gradient-black-graphite border-t border-[#8e8e8e]/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-end justify-between mb-16">
            <h2 className="text-4xl md:text-5xl vibrant-heading max-w-2xl">
              INTERACTIVE <br /><span className="silver-text-gradient">ENGINEERING.</span>
            </h2>
          </div>
          <div className="w-full aspect-[4/3] md:aspect-[21/9] bg-[#050505] border border-neutral-800 rounded-sm relative overflow-hidden group">
             <div className="absolute inset-0 bg-[url('/images/timing_belt_1791466207397.jpg')] bg-cover bg-center mix-blend-luminosity opacity-50 group-hover:scale-105 transition-transform duration-1000" />
             <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
             
             <EngineeringHotspot
               top="20%"
               left="10%"
               title="PISTON & CRANKSHAFT"
               description="High-performance forged internals designed to withstand extreme combustion pressures and deliver reliable power transfer."
               categoryId=""
               color="primary"
             />
             
             <EngineeringHotspot
               top="40%"
               left="15%"
               title="TIMING SYSTEM"
               description="Precision-engineered belts, chains, and tensioners ensuring perfect synchronization between crankshaft and camshafts."
               categoryId=""
               color="white"
             />

             <EngineeringHotspot
               top="30%"
               left="20%"
               title="COOLING & OIL"
               description="Advanced thermal management and lubrication components to maintain optimal operating temperatures under load."
               categoryId=""
               color="neutral"
             />

             <EngineeringHotspot
               top="60%"
               left="30%"
               title="ENGINE COMPONENTS"
               description="Complete range of gaskets, seals, and valvetrain parts manufactured to strict OEM tolerances."
               categoryId=""
               color="neutral"
             />
             
             <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end border-t border-neutral-800 pt-6">
                <div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-1">Internal Combustion</h3>
                  <p className="text-neutral-500 font-mono text-xs uppercase tracking-wide">PRECISION TOLERANCES. RELIABLE COMPONENTS.</p>
                </div>
                <a href="/products" className="text-[10px] text-primary font-bold uppercase tracking-widest hover:text-white transition-colors">
                  VIEW ENGINE PARTS →
                </a>
             </div>
          </div>
        </div>
      </section>

      {/* 03 AUTOMOTIVE SYSTEM CATEGORIES */}
      <section className="py-24 bg-gradient-black-graphite border-t border-[#8e8e8e]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <h2 className="text-3xl md:text-5xl vibrant-heading">SYSTEM CATEGORIES</h2>
            <Link to="/categories" className="hidden md:block text-[10px] font-bold text-primary uppercase tracking-[0.2em] hover:text-white transition-colors">
              VIEW ALL DIRECTORY →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dbCategories.map((cat: any) => (
              <div key={cat.id} className="group relative aspect-[4/3] premium-card overflow-hidden">
                {cat.imageUrl && (
                  <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity group-hover:scale-105 group-hover:opacity-60 transition-all duration-700" style={{ backgroundImage: `url(${cat.imageUrl})` }} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-2">{cat.name}</h3>
                  <p className="text-neutral-500 text-xs font-mono mb-6 line-clamp-2">{cat.description}</p>
                  <Link to={`/products?category=${cat.id}`} className="inline-flex items-center text-[10px] font-bold text-white uppercase tracking-[0.2em] group-hover:text-primary transition-colors">
                    EXPLORE CATEGORY <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 04 FEATURED PARTS */}
      <section className="py-24 bg-gradient-black-graphite border-t border-[#8e8e8e]/20 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl md:text-5xl vibrant-heading flex items-center">
              <span className="silver-text-gradient">FEATURED PARTS</span>
            </h2>
            <Link to="/products" className="hidden md:flex items-center text-primary font-bold hover:text-white transition-colors uppercase tracking-[0.2em] text-[10px]">
              View Full Catalogue <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.length > 0 ? featuredProducts.map((product) => (
              <div key={product.id} className="group flex flex-col premium-card overflow-hidden">
                <div className="relative aspect-square bg-[#030303] p-6 flex items-center justify-center overflow-hidden border-b border-neutral-900">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0a0a] to-transparent z-0" />
                  <div className="w-[85%] h-[85%] relative z-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-700 ease-out">
                    {product.images && product.images.length > 0 ? (
                      <AutomotiveImage
                        src={product.images[0].url}
                        alt={product.name}
                        category={product.category?.name}
                        className="w-full h-full mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-500 drop-shadow-xl object-contain"
                      />
                    ) : (
                      <AutomotiveImage
                        alt={product.name}
                        category={product.category?.name}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow bg-gradient-to-b from-[#0a0a0a] to-[#050505]">
                  <span className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-1">{product.category?.name || 'CATEGORY'}</span>
                  <h3 className="text-sm font-bold text-white mb-2 leading-snug line-clamp-2">{product.name}</h3>
                  <div className="text-[10px] text-neutral-400 mb-4 font-mono space-y-1">
                    <p><span className="text-neutral-600">PN:</span> {product.partNumber}</p>
                    <p><span className="text-neutral-600">COMPATIBILITY:</span> {formatCompatibility(product.compatibility)}</p>
                    <p className="text-green-500 mt-2">● IN STOCK</p>
                  </div>

                  <div className="mt-auto flex flex-col gap-3 pt-4 border-t border-neutral-900">
                    <span className="text-[11px] font-black text-white tracking-[0.1em] uppercase">PRICE ON ENQUIRY</span>
                    <div className="flex gap-2">
                      <Link to={`/products/${product.id}`} className="flex-1 py-2 text-center silver-border text-white text-[9px] font-bold uppercase tracking-widest hover:border-white transition-colors">
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
                        className="flex-1 py-2 text-center btn-primary text-[9px]"
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
            )) : (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="bg-[#0a0a0a] border border-neutral-900 aspect-[3/4] flex items-center justify-center p-6 text-center rounded-sm">
                  <div className="animate-pulse text-xs text-neutral-600 font-bold tracking-widest uppercase">
                    LOADING...
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 05 WHY NG MOTORS */}
      <section className="py-32 bg-gradient-black-silver relative border-t border-[#8e8e8e]/20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl md:text-6xl vibrant-heading mb-16 leading-tight max-w-2xl">
            PRECISION AND <br /><span className="silver-text-gradient">COMPATIBILITY.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="group relative aspect-[3/4] overflow-hidden rounded-sm bg-black border border-neutral-900 hover:border-neutral-700 transition-colors">
              <div className="absolute inset-0 bg-[url('/images/brake_disc_1791466289639.jpg')] bg-cover bg-center mix-blend-luminosity opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute bottom-10 left-10">
                <h3 className="text-3xl font-black text-white uppercase tracking-widest mb-2">Engineering</h3>
                <p className="text-neutral-400 text-xs font-mono tracking-wide uppercase">Built to exacting specifications.</p>
              </div>
            </div>
            <div className="flex flex-col gap-16">
              <div className="group relative aspect-video overflow-hidden rounded-sm bg-black border border-neutral-900 hover:border-neutral-700 transition-colors">
                <div className="absolute inset-0 bg-[url('/images/clutch_kit_1791466499039.jpg')] bg-cover bg-center mix-blend-luminosity opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-8 left-8">
                  <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-1">Reliable Sourcing</h3>
                  <p className="text-neutral-400 text-[10px] font-mono tracking-wide uppercase">Global supply network.</p>
                </div>
              </div>
              <div className="group relative flex-1 overflow-hidden rounded-sm bg-black border border-neutral-900 hover:border-neutral-700 transition-colors">
                <div className="absolute inset-0 bg-[url('/images/shock_absorber_1791466413366.jpg')] bg-cover bg-center mix-blend-luminosity opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-8 left-8">
                  <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-1">Customer Support</h3>
                  <p className="text-neutral-400 text-[10px] font-mono tracking-wide uppercase">Expertise when you need it.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 06 NEED A PART? */}
      <section className="py-24 bg-gradient-graphite-red border-t border-[#8e8e8e]/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/spark_plug_1791466164055.jpg')] bg-cover bg-center mix-blend-luminosity opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl vibrant-heading mb-8">
            <span className="silver-text-gradient">CAN'T FIND THE PART?</span>
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto mb-10 font-mono">
            Our global sourcing network can track down rare, vintage, or highly specific automotive components. Submit a request and our engineering team will handle the rest.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="btn-primary" onClick={() => setIsPreBookModalOpen(true)}>
              PRE-BOOK A PART
            </button>
            <a href="#" className="btn-secondary">
              WHATSAPP ENQUIRY
            </a>
          </div>
        </div>
      </section>

      {/* 07 FINAL CINEMATIC CTA */}
      <section className="py-32 bg-black border-t border-[#8e8e8e]/20 relative overflow-hidden group">
        <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-40 transition-opacity duration-1000">
          <video
            className="w-full h-full object-cover mix-blend-screen"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            src="/videos/hero-exploded-car.mp4"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-20">
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            YOUR VEHICLE.<br/>
            YOUR JOURNEY.<br/>
            <span className="text-[#ff0000]">THE RIGHT PARTS.</span>
          </h2>
          <div className="flex justify-center gap-6 mt-12">
            <a href="/products" className="btn-primary">
              EXPLORE AUTOMATE PARTS
            </a>
          </div>
        </div>
      </section>

      <PreBookModal 
        isOpen={isPreBookModalOpen} 
        onClose={() => setIsPreBookModalOpen(false)} 
      />
    </div>
  );
}
