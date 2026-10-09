import { MapPin, Phone, MessageCircle, Clock, Mail, Send } from 'lucide-react';
import { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { apiClient } from '../api/client';

export default function Contact() {
  const { settings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    whatsapp: '',
    partRequired: '',
    vehicle: '',
    message: ''
  });

  const handleWhatsApp = () => {
    const text = `Hi, I have an inquiry regarding NG Motors.`;
    const number = settings?.whatsapp?.replace(/\D/g, '') || '';
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, '_blank');
  };
  
  const handleCall = () => {
    const number = settings?.phone?.replace(/\D/g, '') || '';
    window.location.href = `tel:${number}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/enquiries', formData);
      setSuccess(true);
      setFormData({
        customerName: '',
        phone: '',
        whatsapp: '',
        partRequired: '',
        vehicle: '',
        message: ''
      });
    } catch (err) {
      console.error(err);
      alert('Failed to send enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-28 pb-20 relative overflow-hidden">
      <div className="absolute top-1/4 left-0 w-1/3 h-96 bg-primary/5 blur-[150px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight mb-4">Contact Us</h1>
          <p className="text-neutral-400 max-w-2xl mx-auto text-lg">Get in touch with our team for parts inquiries, technical support, or order assistance.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#0a0a0a] to-black border border-neutral-900 p-8 rounded-sm">
              <h2 className="text-xl font-black text-white uppercase tracking-wider mb-8">Reach Out Directly</h2>
              
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center rounded-sm mr-6 flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-1">Our Location</h3>
                    <p className="text-neutral-400">57, Kurunegala Road,<br/>Galewela</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center rounded-sm mr-6 flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-1">Phone</h3>
                    <p className="text-neutral-400">077 751 7600</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center rounded-sm mr-6 flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-1">Email</h3>
                    <p className="text-neutral-400">info@ngmotors.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center rounded-sm mr-6 flex-shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-1">Business Hours</h3>
                    <p className="text-neutral-400">Mon - Sat: 8:30 AM - 6:00 PM<br/>Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col h-full">
            <div className="bg-[#0a0a0a] border border-neutral-900 rounded-sm p-8 flex-1">
              <h2 className="text-xl font-black text-white uppercase tracking-wider mb-8">Quick Enquiry</h2>
              
              {success ? (
                <div className="text-center py-12 h-full flex flex-col justify-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50">
                    <Send className="w-8 h-8 text-green-500 ml-1" />
                  </div>
                  <h3 className="text-xl font-bold text-white uppercase mb-2">Message Sent</h3>
                  <p className="text-neutral-400 mb-8">Thank you. We will get back to you shortly.</p>
                  <button onClick={() => setSuccess(false)} className="text-primary hover:text-white uppercase tracking-widest text-xs font-bold transition-colors">
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input required name="customerName" value={formData.customerName} onChange={handleChange} placeholder="Full Name *" className="w-full bg-black border border-neutral-800 text-white p-3 font-mono text-sm focus:border-primary focus:outline-none rounded-sm" />
                    <input required name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number *" className="w-full bg-black border border-neutral-800 text-white p-3 font-mono text-sm focus:border-primary focus:outline-none rounded-sm" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="WhatsApp Number (Optional)" className="w-full bg-black border border-neutral-800 text-white p-3 font-mono text-sm focus:border-primary focus:outline-none rounded-sm" />
                    <input required name="vehicle" value={formData.vehicle} onChange={handleChange} placeholder="Vehicle Make & Model *" className="w-full bg-black border border-neutral-800 text-white p-3 font-mono text-sm focus:border-primary focus:outline-none rounded-sm" />
                  </div>
                  <input required name="partRequired" value={formData.partRequired} onChange={handleChange} placeholder="Part Required *" className="w-full bg-black border border-neutral-800 text-white p-3 font-mono text-sm focus:border-primary focus:outline-none rounded-sm" />
                  <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Additional Details / Message" rows={4} className="w-full bg-black border border-neutral-800 text-white p-3 font-mono text-sm focus:border-primary focus:outline-none rounded-sm resize-none"></textarea>
                  
                  <div className="pt-2 flex flex-wrap gap-4">
                    <button type="submit" disabled={loading} className="flex-1 min-w-[150px] flex items-center justify-center px-6 py-4 bg-primary text-white font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-colors disabled:opacity-50 rounded-sm">
                      <Send className="w-4 h-4 mr-2" /> Send Enquiry
                    </button>
                    <button type="button" onClick={handleWhatsApp} className="flex-1 min-w-[150px] flex items-center justify-center px-6 py-4 bg-[#121212] border border-neutral-700 text-white font-black uppercase tracking-widest text-xs hover:border-green-500 hover:text-green-500 transition-colors rounded-sm">
                      <MessageCircle className="w-4 h-4 mr-2 text-green-500" /> WhatsApp
                    </button>
                    <button type="button" onClick={handleCall} className="flex-1 min-w-[150px] flex items-center justify-center px-6 py-4 bg-[#121212] border border-neutral-700 text-white font-black uppercase tracking-widest text-xs hover:border-blue-500 hover:text-blue-500 transition-colors rounded-sm">
                      <Phone className="w-4 h-4 mr-2 text-blue-500" /> Call
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
