import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useSettings } from '../hooks/useSettings';
import { apiClient } from '../api/client';
import { Loader2, CheckCircle2, Building2, Banknote, UploadCloud, X } from 'lucide-react';

export default function Checkout() {
  const { items, clearCart } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    deliveryAddress: '',
    city: '',
    notes: '',
    paymentMethod: 'COD'
  });
  
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>('');
  const [transactionRef, setTransactionRef] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    setReceiptFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setReceiptPreview(url);
    } else {
      setReceiptPreview('');
    }
  };

  const removeFile = () => {
    setReceiptFile(null);
    if (receiptPreview) {
      URL.revokeObjectURL(receiptPreview);
      setReceiptPreview('');
    }
  };
  
  useEffect(() => {
    if (settings) {
      if (!settings.codEnabled && settings.bankTransferEnabled) {
        setFormData(prev => ({ ...prev, paymentMethod: 'BANK_TRANSFER' }));
      }
    }
  }, [settings]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<any>(null);

  if (items.length === 0 && !success) {
    navigate('/cart');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.paymentMethod === 'BANK_TRANSFER') {
      if (!receiptFile || !transactionRef) {
        setError('Please upload your payment receipt and provide the transaction reference.');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      let orderId = submittedOrder?.orderId;
      
      if (!orderId) {
        const res = await apiClient.post('/orders', {
          customer: {
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
          },
          deliveryAddress: formData.deliveryAddress,
          city: formData.city,
          notes: formData.notes,
          paymentMethod: formData.paymentMethod,
          items: items.map(i => ({ productId: i.product.id, quantity: i.quantity }))
        });
        orderId = res.data.orderId;
        setSubmittedOrder(res.data);
      }

      if (formData.paymentMethod === 'BANK_TRANSFER' && receiptFile) {
        const fd = new FormData();
        fd.append('receipt', receiptFile);
        fd.append('transactionRef', transactionRef);
        await apiClient.post(`/orders/track/${orderId}/payment`, fd);
      }
      
      setSuccess(true);
      clearCart();
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred during submission. You can safely try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#050505] pt-32 pb-20 flex flex-col items-center px-4">
        <div className="metallic-panel p-10 md:p-16 max-w-2xl w-full text-center border-t-4 border-t-green-500 rounded-sm shadow-2xl">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-8 animate-pulse" />
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">Order Submitted Successfully</h1>
          
          <div className="bg-black/50 border border-neutral-800 p-6 rounded-sm mb-8 text-left">
            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4 border-b border-neutral-800 pb-2">Next Steps</h3>
            <ol className="text-sm text-neutral-300 space-y-4 font-medium">
              <li className="flex items-start"><span className="text-primary font-bold mr-3">01.</span> Our parts specialists are reviewing your request to verify precise stock and compatibility.</li>
              <li className="flex items-start"><span className="text-primary font-bold mr-3">02.</span> We will contact you at <strong className="ml-1 text-white">{formData.phone}</strong> to confirm the final exact pricing and delivery schedule.</li>
              {formData.paymentMethod === 'BANK_TRANSFER' ? (
                <li className="flex items-start"><span className="text-primary font-bold mr-3">03.</span> Your payment receipt has been submitted and is pending verification by our team.</li>
              ) : (
                <li className="flex items-start"><span className="text-primary font-bold mr-3">03.</span> You will pay via Cash on Delivery once the parts arrive at your location.</li>
              )}
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate(`/order/${submittedOrder?.orderId}`)} className="w-full sm:w-auto px-10 py-4 bg-primary text-white font-black uppercase tracking-widest text-sm hover:bg-red-700 transition-colors rounded-sm shadow-[0_0_20px_rgba(255,0,0,0.3)]">
              Track Order Status
            </button>
            <button onClick={() => navigate('/products')} className="w-full sm:w-auto px-10 py-4 bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-neutral-300 transition-colors rounded-sm">
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-12 border-b border-neutral-900 pb-8">
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-2">Checkout</h1>
          <p className="text-neutral-400 text-lg">Provide your details to initiate the parts sourcing and verification process.</p>
        </div>

        {error && (
          <div className="p-4 mb-8 text-sm font-bold tracking-wide text-red-400 border border-red-900/50 rounded-sm bg-red-950/20 flex items-center">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-3" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Contact Info */}
          <div className="metallic-panel border border-neutral-900 rounded-sm p-6 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none" />
            <h3 className="text-xl font-black text-white uppercase tracking-wider mb-8 flex items-center relative z-10">
              <span className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center mr-3 text-sm text-neutral-400">01</span>
              Contact Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Full Name *</label>
                <input required disabled={!!submittedOrder} type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-4 bg-black border border-neutral-800 rounded-sm text-white focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(255,0,0,0.1)] transition-all disabled:opacity-50" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Phone Number *</label>
                <input required disabled={!!submittedOrder} type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-4 bg-black border border-neutral-800 rounded-sm text-white focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(255,0,0,0.1)] transition-all disabled:opacity-50" placeholder="077 123 4567" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Email Address (Optional)</label>
                <input type="email" disabled={!!submittedOrder} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-4 bg-black border border-neutral-800 rounded-sm text-white focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(255,0,0,0.1)] transition-all disabled:opacity-50" placeholder="john@example.com" />
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="metallic-panel border border-neutral-900 rounded-sm p-6 sm:p-10 relative overflow-hidden">
            <h3 className="text-xl font-black text-white uppercase tracking-wider mb-8 flex items-center relative z-10">
              <span className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center mr-3 text-sm text-neutral-400">02</span>
              Delivery Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Delivery Address *</label>
                <input required disabled={!!submittedOrder} type="text" value={formData.deliveryAddress} onChange={(e) => setFormData({...formData, deliveryAddress: e.target.value})} className="w-full px-4 py-4 bg-black border border-neutral-800 rounded-sm text-white focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(255,0,0,0.1)] transition-all disabled:opacity-50" placeholder="House/Company No, Street Name" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">City *</label>
                <input required disabled={!!submittedOrder} type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-4 bg-black border border-neutral-800 rounded-sm text-white focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(255,0,0,0.1)] transition-all disabled:opacity-50" placeholder="Colombo" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Part Specification Notes (Optional)</label>
                <textarea rows={3} disabled={!!submittedOrder} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full px-4 py-4 bg-black border border-neutral-800 rounded-sm text-white focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(255,0,0,0.1)] transition-all resize-none disabled:opacity-50" placeholder="Provide vehicle VIN, chassis number, or specific fitment requirements..." />
              </div>
            </div>
          </div>

          {/* Payment Preference */}
          <div className="metallic-panel border border-neutral-900 rounded-sm p-6 sm:p-10 relative overflow-hidden">
            <h3 className="text-xl font-black text-white uppercase tracking-wider mb-8 flex items-center relative z-10">
              <span className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center mr-3 text-sm text-neutral-400">03</span>
              Payment Preference
            </h3>
            
            <div className="space-y-4 relative z-10">
              {settings?.codEnabled && (
                <label className={`flex items-start p-6 border rounded-sm transition-all ${!submittedOrder ? 'cursor-pointer hover:border-neutral-600' : 'opacity-80'} ${formData.paymentMethod === 'COD' ? 'border-primary bg-primary/5 shadow-[0_0_20px_rgba(255,0,0,0.1)]' : 'border-neutral-800 bg-black'}`}>
                  <div className="flex h-5 items-center">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="COD" 
                      disabled={!!submittedOrder}
                      checked={formData.paymentMethod === 'COD'} 
                      onChange={() => setFormData({...formData, paymentMethod: 'COD'})} 
                      className="h-4 w-4 text-primary bg-black border-neutral-700 focus:ring-primary focus:ring-offset-black" 
                    />
                  </div>
                  <div className="ml-4">
                    <span className="block text-sm font-bold uppercase tracking-widest text-white mb-1 flex items-center">
                      <Banknote className="w-4 h-4 mr-2 text-neutral-400" /> Cash on Delivery (COD)
                    </span>
                    <span className="block text-sm text-neutral-500 leading-relaxed">Pay in cash directly to our delivery personnel when your automotive parts arrive. Subject to regional availability.</span>
                  </div>
                </label>
              )}

              {settings?.bankTransferEnabled && (
                <label className={`flex items-start p-6 border rounded-sm transition-all ${!submittedOrder ? 'cursor-pointer hover:border-neutral-600' : 'opacity-80'} ${formData.paymentMethod === 'BANK_TRANSFER' ? 'border-primary bg-primary/5 shadow-[0_0_20px_rgba(255,0,0,0.1)]' : 'border-neutral-800 bg-black'}`}>
                  <div className="flex h-5 items-center">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="BANK_TRANSFER" 
                      disabled={!!submittedOrder}
                      checked={formData.paymentMethod === 'BANK_TRANSFER'} 
                      onChange={() => setFormData({...formData, paymentMethod: 'BANK_TRANSFER'})} 
                      className="h-4 w-4 text-primary bg-black border-neutral-700 focus:ring-primary focus:ring-offset-black" 
                    />
                  </div>
                  <div className="ml-4 w-full">
                    <span className="block text-sm font-bold uppercase tracking-widest text-white mb-1 flex items-center">
                      <Building2 className="w-4 h-4 mr-2 text-neutral-400" /> Online Bank Transfer
                    </span>
                    <span className="block text-sm text-neutral-500 leading-relaxed">Direct deposit to our bank account.</span>
                    
                    {formData.paymentMethod === 'BANK_TRANSFER' && (
                      <div className="mt-6 p-6 bg-black border border-neutral-800 rounded-sm">
                        {(!settings?.bankName || !settings?.bankAccountNumber) ? (
                          <div className="text-red-400 text-sm font-bold text-center py-4 border border-red-900/50 bg-red-950/20 rounded-sm">
                            Bank transfer details are currently pending configuration by the administration. 
                            Please select an alternative payment method or contact support.
                          </div>
                        ) : (
                          <>
                            <div className="space-y-2 text-sm font-mono text-neutral-400">
                              <div className="flex justify-between"><span className="text-neutral-500">Bank:</span> <span className="text-white text-right">{settings.bankName}</span></div>
                              <div className="flex justify-between"><span className="text-neutral-500">Account Name:</span> <span className="text-white text-right">{settings.bankAccountName}</span></div>
                              <div className="flex justify-between"><span className="text-neutral-500">Account No:</span> <span className="text-white text-right">{settings.bankAccountNumber}</span></div>
                              <div className="flex justify-between"><span className="text-neutral-500">Branch:</span> <span className="text-white text-right">{settings.bankBranch}</span></div>
                            </div>

                            <div className="mt-8 border-t border-neutral-800 pt-6">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Payment Receipt Upload</h4>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Transaction Ref / ID *</label>
                              <input required type="text" value={transactionRef} onChange={(e) => setTransactionRef(e.target.value)} className="w-full px-3 py-3 bg-black border border-neutral-800 rounded-sm text-white focus:outline-none focus:border-primary text-sm" placeholder="e.g. TR-993822" />
                            </div>
                            
                            <div>
                              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Upload Receipt File *</label>
                              {!receiptFile ? (
                                <div className="border-2 border-dashed border-neutral-700 hover:border-primary bg-black/50 rounded-sm p-6 text-center cursor-pointer transition-colors relative">
                                  <input 
                                    required 
                                    type="file" 
                                    accept="image/jpeg,image/png,image/webp,application/pdf"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                  <UploadCloud className="w-6 h-6 text-neutral-500 mx-auto mb-2" />
                                  <span className="text-xs font-medium text-neutral-400">Click to upload receipt (Max 5MB)</span>
                                </div>
                              ) : (
                                <div className="p-4 bg-black border border-primary rounded-sm flex items-center justify-between">
                                  <div className="flex items-center space-x-4 overflow-hidden">
                                    {receiptPreview ? (
                                      <img src={receiptPreview} alt="Preview" className="w-12 h-12 object-cover rounded-sm" />
                                    ) : (
                                      <div className="w-12 h-12 bg-neutral-900 rounded-sm flex items-center justify-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                      </div>
                                    )}
                                    <div className="truncate">
                                      <p className="text-xs font-bold text-white truncate">{receiptFile.name}</p>
                                      <p className="text-[10px] text-neutral-500">{(receiptFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                  </div>
                                  <button type="button" onClick={removeFile} className="p-2 text-neutral-400 hover:text-red-500 transition-colors">
                                    <X className="w-5 h-5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                          </>
                        )}
                      </div>
                    )}
                  </div>
                </label>
              )}
              
              {!settings?.codEnabled && !settings?.bankTransferEnabled && (
                 <div className="p-6 border border-neutral-800 bg-black rounded-sm text-center">
                   <p className="text-sm text-neutral-400">Payment processing is temporarily disabled. Please contact us directly.</p>
                 </div>
              )}
            </div>
            
            {formData.paymentMethod === 'BANK_TRANSFER' && (
              <div className="mt-8 text-center p-4 bg-primary/10 border border-primary/20 rounded-sm">
                <p className="text-xs text-primary font-black uppercase tracking-widest">Submit your receipt for immediate verification.</p>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading || (!settings?.codEnabled && !settings?.bankTransferEnabled)}
            className="w-full flex items-center justify-center px-6 py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-sm hover:bg-primary hover:text-white transition-all disabled:opacity-50 rounded-sm shadow-xl"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (submittedOrder ? 'RETRY SUBMITTING RECEIPT' : 'SUBMIT ENQUIRY FOR VERIFICATION')}
          </button>
        </form>
      </div>
    </div>
  );
}
