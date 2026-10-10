import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Phone, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { useSettings } from '../hooks/useSettings';
import { normalizeSriLankaPhone, toWhatsAppNumber } from '../utils/contact';

export default function StoreLayout() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { settings } = useSettings();
  const { getCartCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Categories', href: '/categories' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <header 
        className={clsx(
          'fixed top-0 w-full z-50 transition-all duration-500 border-b',
          isScrolled ? 'bg-black/80 backdrop-blur-xl border-neutral-900/50 py-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)]' : 'bg-gradient-to-b from-black via-black/80 to-transparent border-transparent py-6'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 md:space-x-4 group">
              <img src="/images/ng-motors-logo.png" alt="NG Motors" className="h-10 md:h-12 w-auto object-contain transition-transform duration-500 group-hover:scale-105" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-10">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={clsx(
                    'text-xs font-bold uppercase tracking-widest transition-all duration-300 relative py-2',
                    location.pathname === link.href ? 'text-white' : 'text-neutral-400 hover:silver-text-gradient group'
                  )}
                >
                  {link.name}
                  <span className={clsx(
                    'absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary to-transparent transition-transform duration-300 origin-left shadow-[0_0_10px_rgba(255,0,0,0.5)]',
                    location.pathname === link.href ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  )}></span>
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4 md:space-x-6">
              <a 
                href={settings?.phone ? `tel:${normalizeSriLankaPhone(settings.phone)}` : undefined}
                onClick={(e) => { if (!normalizeSriLankaPhone(settings?.phone)) { e.preventDefault(); alert('Phone contact is currently unavailable.'); } }}
                className="hidden md:flex items-center text-white hover:text-primary transition-colors"
                title="Call Owner"
              >
                <Phone className="h-5 w-5" />
              </a>
              <a 
                href={settings?.whatsapp ? `https://wa.me/${toWhatsAppNumber(settings.whatsapp)}` : undefined}
                onClick={(e) => { if (!toWhatsAppNumber(settings?.whatsapp)) { e.preventDefault(); alert('WhatsApp contact is currently unavailable.'); } }}
                target="_blank" rel="noopener noreferrer"
                className="hidden md:flex items-center text-white hover:text-green-500 transition-colors"
                title="WhatsApp Owner"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              <Link to="/admin/login" className="hidden md:flex items-center text-white hover:text-primary transition-colors" title="Admin Login">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z" /></svg>
              </Link>
              <Link to="/cart" className="relative text-white hover:text-primary transition-colors" title="Cart">
                <ShoppingCart className="h-6 w-6" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {getCartCount()}
                  </span>
                )}
              </Link>
              <button 
                className="md:hidden text-white"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex flex-col pt-20 px-6"
          >
            <button 
              className="absolute top-6 right-6 text-neutral-400 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-8 w-8" />
            </button>
            <nav className="flex flex-col space-y-6 text-2xl font-semibold mt-10">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    'transition-colors',
                    location.pathname === link.href ? 'text-primary' : 'text-white hover:text-primary'
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow flex flex-col pb-16 md:pb-0">
        <Outlet />
      </main>

      <footer className="bg-gradient-black-graphite border-t border-[#8e8e8e]/20 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <Link to="/" className="inline-flex mb-6 opacity-90 hover:opacity-100 transition-opacity">
                <img src="/images/ng-motors-logo.png" alt="NG Motors (Pvt) Ltd" className="h-16 w-auto max-w-full object-contain" />
              </Link>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Premium Automotive Spare Parts.<br/>Quality, Reliability, Performance.
              </p>
            </div>
            <div>
              <h4 className="silver-text-gradient font-semibold mb-4 text-lg">Quick Links</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><Link to="/products" className="hover:text-primary transition-colors">All Products</Link></li>
                <li><Link to="/categories" className="hover:text-primary transition-colors">Categories</Link></li>
                <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="silver-text-gradient font-semibold mb-4 text-lg">Support</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                <li><a href={settings?.whatsapp ? `https://wa.me/${toWhatsAppNumber(settings.whatsapp)}` : undefined} onClick={(e) => { if (!toWhatsAppNumber(settings?.whatsapp)) e.preventDefault(); }} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">WhatsApp Enquiry</a></li>
                <li><Link to="/admin/login" className="hover:text-primary transition-colors">Admin Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="silver-text-gradient font-semibold mb-4 text-lg">Contact</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li>57, Kurunegala Road</li>
                <li>Galewela, Sri Lanka</li>
                <li className="mt-4"><a href={settings?.whatsapp ? `https://wa.me/${toWhatsAppNumber(settings.whatsapp)}` : undefined} onClick={(e) => { if (!toWhatsAppNumber(settings?.whatsapp)) e.preventDefault(); }} target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">WhatsApp Us</a></li>
                {settings?.phone && <li><a href={`tel:${normalizeSriLankaPhone(settings.phone)}`} className="hover:text-white transition-colors">{settings.phone}</a></li>}
              </ul>
            </div>
          </div>
          <div className="border-t border-[#8e8e8e]/20 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-500 text-sm">© 2026 NG Motors (Pvt) Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-black/95 backdrop-blur-xl border-t border-neutral-900 px-4 py-3 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
        <a 
          href={settings?.phone ? `tel:${normalizeSriLankaPhone(settings.phone)}` : undefined}
          onClick={(e) => { if (!normalizeSriLankaPhone(settings?.phone)) { e.preventDefault(); alert('Phone contact is currently unavailable.'); } }}
          className="flex-1 flex flex-col items-center justify-center text-neutral-400 hover:text-white transition-colors border-r border-neutral-800"
        >
          <Phone className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Call</span>
        </a>
        <a 
          href={settings?.whatsapp ? `https://wa.me/${toWhatsAppNumber(settings.whatsapp)}` : undefined}
          onClick={(e) => { if (!toWhatsAppNumber(settings?.whatsapp)) { e.preventDefault(); alert('WhatsApp contact is currently unavailable.'); } }}
          target="_blank" rel="noopener noreferrer"
          className="flex-1 flex flex-col items-center justify-center text-green-500 hover:text-green-400 transition-colors border-r border-neutral-800"
        >
          <MessageCircle className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-widest">WhatsApp</span>
        </a>
        <Link 
          to="/cart"
          className="flex-1 flex flex-col items-center justify-center text-white hover:text-primary transition-colors relative"
        >
          <ShoppingCart className="w-5 h-5 mb-1" />
          {getCartCount() > 0 && (
            <span className="absolute top-0 right-1/4 flex h-3 w-3 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-white">
              {getCartCount()}
            </span>
          )}
          <span className="text-[10px] font-bold uppercase tracking-widest">Cart</span>
        </Link>
      </div>
    </div>
  );
}
