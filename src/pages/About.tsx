import { ShieldCheck, Truck, Cpu, Settings } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-[#050505] pt-28 pb-20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-64 bg-primary/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-64 bg-neutral-800/10 blur-[150px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight mb-4">About NG Motors</h1>
          <p className="text-neutral-400 max-w-2xl mx-auto text-lg">Your trusted partner for genuine automotive spare parts in Galewela and beyond.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div className="metallic-panel rounded-sm aspect-square md:aspect-[4/3] flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-black to-transparent z-0" />
            <div className="relative z-10 text-center p-8">
              <Settings className="w-20 h-20 text-primary mx-auto mb-6 animate-[spin_10s_linear_infinite]" />
              <h3 className="text-2xl font-black text-white uppercase tracking-widest">Premium Quality</h3>
              <p className="text-neutral-500 mt-4 text-sm leading-relaxed max-w-sm">We specialize in providing high-quality spare parts to ensure the optimal performance and safety of your vehicle.</p>
            </div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay z-0"></div>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-wider border-b border-neutral-900 pb-4">Our Commitment</h2>
            <div className="prose prose-invert text-neutral-400">
              <p>At NG Motors (PVT) LTD, we understand that finding the right part for your vehicle can be a challenge. That's why we have built a comprehensive catalogue of premium automotive spare parts tailored to meet the exacting standards of our customers.</p>
              <p>Located at 57, Kurunegala Road, Galewela, we serve our community and beyond with dedication and expertise.</p>
              <p>Our team is committed to helping you find exactly what you need quickly and efficiently. We do not just sell parts; we provide solutions that keep you safely on the road.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0a0a0a] border border-neutral-900 p-8 text-center rounded-sm hover:border-primary transition-colors">
            <ShieldCheck className="w-10 h-10 text-primary mx-auto mb-4" />
            <h4 className="text-lg font-bold text-white uppercase tracking-wider mb-2">Quality Assurance</h4>
            <p className="text-sm text-neutral-500">Every part we sell is carefully verified for quality and compatibility.</p>
          </div>
          <div className="bg-[#0a0a0a] border border-neutral-900 p-8 text-center rounded-sm hover:border-primary transition-colors">
            <Cpu className="w-10 h-10 text-primary mx-auto mb-4" />
            <h4 className="text-lg font-bold text-white uppercase tracking-wider mb-2">Expert Knowledge</h4>
            <p className="text-sm text-neutral-500">Our team possesses deep automotive knowledge to assist your purchases.</p>
          </div>
          <div className="bg-[#0a0a0a] border border-neutral-900 p-8 text-center rounded-sm hover:border-primary transition-colors">
            <Truck className="w-10 h-10 text-primary mx-auto mb-4" />
            <h4 className="text-lg font-bold text-white uppercase tracking-wider mb-2">Reliable Supply</h4>
            <p className="text-sm text-neutral-500">Consistent stock availability to ensure you get your parts when you need them.</p>
          </div>
        </div>
        
      </div>
    </div>
  );
}
