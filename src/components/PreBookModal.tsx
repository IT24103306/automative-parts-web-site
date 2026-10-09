import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { apiClient } from '../api/client';

interface PreBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduct?: any;
}

export default function PreBookModal({ isOpen, onClose, initialProduct }: PreBookModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    whatsapp: '',
    email: '',
    vehicleMake: initialProduct?.vehicleMake || '',
    vehicleModel: initialProduct?.vehicleModel || '',
    vehicleYear: initialProduct?.vehicleYear || '',
    partName: initialProduct?.name || '',
    partNumber: initialProduct?.partNumber || '',
    quantity: '1',
    preferredDate: '',
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/pre-bookings', formData);
      setSuccess(true);
    } catch (error) {
      console.error('Failed to submit pre-booking', error);
      alert('Failed to submit pre-booking request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0a0a0a] border border-neutral-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Pre-Book / Request Part</h2>
          <p className="text-neutral-400 text-sm mb-8">
            {success ? 'Your request has been received.' : 'Please provide details about the part you are looking for. NG Motors will contact you to confirm availability and price.'}
          </p>

          {success ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50">
                <Search className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white uppercase mb-2">Request Submitted</h3>
              <p className="text-neutral-400 mb-8">We will contact you shortly.</p>
              <button 
                onClick={onClose}
                className="px-8 py-4 bg-neutral-900 text-white font-bold uppercase tracking-widest text-xs hover:bg-neutral-800 transition-colors rounded-sm"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Full Name *</label>
                  <input required name="customerName" value={formData.customerName} onChange={handleChange} className="w-full bg-black border border-neutral-800 text-white p-3 font-mono text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Phone Number *</label>
                  <input required name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-black border border-neutral-800 text-white p-3 font-mono text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">WhatsApp Number</label>
                  <input name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="w-full bg-black border border-neutral-800 text-white p-3 font-mono text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-black border border-neutral-800 text-white p-3 font-mono text-sm focus:border-primary focus:outline-none" />
                </div>
              </div>

              <div className="border-t border-neutral-900 pt-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Vehicle & Part Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Make *</label>
                    <input required name="vehicleMake" value={formData.vehicleMake} onChange={handleChange} placeholder="e.g. Toyota" className="w-full bg-black border border-neutral-800 text-white p-3 font-mono text-sm focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Model *</label>
                    <input required name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} placeholder="e.g. Corolla" className="w-full bg-black border border-neutral-800 text-white p-3 font-mono text-sm focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Year *</label>
                    <input required name="vehicleYear" value={formData.vehicleYear} onChange={handleChange} placeholder="e.g. 2015" className="w-full bg-black border border-neutral-800 text-white p-3 font-mono text-sm focus:border-primary focus:outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Part Name *</label>
                    <input required name="partName" value={formData.partName} onChange={handleChange} className="w-full bg-black border border-neutral-800 text-white p-3 font-mono text-sm focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Part Number / SKU</label>
                    <input name="partNumber" value={formData.partNumber} onChange={handleChange} className="w-full bg-black border border-neutral-800 text-white p-3 font-mono text-sm focus:border-primary focus:outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Quantity</label>
                    <input type="number" min="1" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full bg-black border border-neutral-800 text-white p-3 font-mono text-sm focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Preferred Date (Optional)</label>
                    <input type="date" name="preferredDate" value={formData.preferredDate} onChange={handleChange} className="w-full bg-black border border-neutral-800 text-white p-3 font-mono text-sm focus:border-primary focus:outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Additional Notes</label>
                  <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full bg-black border border-neutral-800 text-white p-3 font-mono text-sm focus:border-primary focus:outline-none"></textarea>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-4">
                <button type="button" onClick={onClose} className="px-6 py-4 border border-neutral-800 text-white font-bold uppercase tracking-widest text-xs hover:bg-neutral-900 transition-colors rounded-sm">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="px-8 py-4 bg-primary text-white font-bold uppercase tracking-widest text-xs hover:bg-red-700 transition-colors disabled:opacity-50 rounded-sm">
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
