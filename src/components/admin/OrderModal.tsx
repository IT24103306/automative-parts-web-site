import { useState, useEffect } from 'react';
import { X, Loader2, RefreshCw, ExternalLink, ShieldCheck, ShieldAlert } from 'lucide-react';
import { apiClient } from '../../api/client';

interface OrderModalProps {
  orderId: string;
  onClose: () => void;
  onStatusUpdated: () => void;
}

export default function OrderModal({ orderId, onClose, onStatusUpdated }: OrderModalProps) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [statusInput, setStatusInput] = useState('');
  const [paymentStatusInput, setPaymentStatusInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [loadingReceipt, setLoadingReceipt] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/orders/${orderId}`);
      setOrder(response.data);
      setStatusInput(response.data.status);
      setPaymentStatusInput(response.data.paymentStatus || 'UNPAID');
    } catch (error) {
      console.error('Failed to load order details', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchReceipt = async () => {
    setLoadingReceipt(true);
    try {
      const response = await apiClient.get(`/orders/${orderId}/receipt`);
      window.open(response.data.url, '_blank');
    } catch (error) {
      alert('Failed to load receipt or receipt not found');
    } finally {
      setLoadingReceipt(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await apiClient.patch(`/orders/${orderId}/status`, {
        status: statusInput !== order.status ? statusInput : undefined,
        paymentStatus: paymentStatusInput !== order.paymentStatus ? paymentStatusInput : undefined,
        notes: notesInput
      });
      setNotesInput('');
      fetchOrder();
      onStatusUpdated();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleVerifyPayment = async (status: string) => {
    setUpdating(true);
    try {
      await apiClient.patch(`/orders/${orderId}/status`, {
        paymentStatus: status,
        status: status === 'PAYMENT_VERIFIED' ? 'PROCESSING' : 'PAYMENT_PENDING',
        notes: `Admin ${status === 'PAYMENT_VERIFIED' ? 'verified' : 'rejected'} the payment`
      });
      
      const number = order.customer?.phone?.replace(/\D/g, '');
      if (number) {
        const nextStep = status === 'PAYMENT_VERIFIED' ? 'Payment is verified and your order is being processed.' : 'Payment could not be verified. Please contact us for assistance.';
        const text = `Hello ${order.customer?.name || 'Customer'}, we have reviewed the payment submitted for order ${order.id.slice(-8)}. ${nextStep} Thank you, NG Motors.`;
        window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, '_blank');
      }

      fetchOrder();
      onStatusUpdated();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update payment status');
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmOrderAndWhatsApp = async () => {
    setUpdating(true);
    try {
      await apiClient.patch(`/orders/${orderId}/status`, {
        status: 'CONFIRMED',
        notes: 'Admin confirmed order and sent WhatsApp notification'
      });
      
      const number = order.customer?.phone?.replace(/\D/g, '');
      if (number) {
        const text = `Hello ${order.customer?.name || 'Customer'}, this is NG Motors. Your order ${order.id.slice(-8)} has been confirmed. We will update you on the next step shortly. Thank you for choosing NG Motors.`;
        window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, '_blank');
      }

      fetchOrder();
      onStatusUpdated();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to confirm order');
    } finally {
      setUpdating(false);
    }
  };

  if (!order) return null;

  const validStatuses = ['PENDING', 'CONFIRMED', 'PAYMENT_PENDING', 'PAYMENT_VERIFICATION', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED'];
  const validPaymentStatuses = ['UNPAID', 'PAYMENT_SUBMITTED', 'PAYMENT_VERIFIED', 'PAYMENT_REJECTED', 'REFUND_PENDING', 'REFUNDED'];
  const isBankTransfer = order.paymentMethod === 'BANK_TRANSFER';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-black/80 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative inline-block w-full max-w-4xl p-4 sm:p-6 overflow-hidden text-left align-middle transition-all transform bg-neutral-950 border border-neutral-800 shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-5 border-b border-neutral-900 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center">
                Order Enquiry
                <span className="ml-3 text-sm font-mono text-neutral-500 bg-neutral-900 px-2 py-1 rounded-sm">#{order.id}</span>
              </h3>
              <p className="text-sm text-neutral-400 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors p-2 bg-neutral-900 rounded-md">
              <X className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
              
              {/* Left Column: Details */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Customer Info */}
                <div className="bg-black border border-neutral-900 p-5 rounded-md">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider">Customer Details</h4>
                    <div className="flex gap-2">
                      <a href={`tel:${order.customer?.phone?.replace(/\D/g, '')}`} className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 rounded-sm transition-colors" title="Call Customer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      </a>
                      <a href={`https://wa.me/${order.customer?.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${order.customer?.name || 'Customer'}, this is NG Motors.`)}`} target="_blank" rel="noreferrer" className="p-1.5 bg-green-900/20 hover:bg-green-900/40 text-green-500 rounded-sm transition-colors" title="WhatsApp Customer">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                      </a>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-neutral-500 block">Name</span><span className="text-white font-medium">{order.customer?.name}</span></div>
                    <div><span className="text-neutral-500 block">Phone</span><span className="text-white font-medium">{order.customer?.phone}</span></div>
                    {order.customer?.email && (
                      <div className="col-span-2"><span className="text-neutral-500 block">Email</span><span className="text-white">{order.customer?.email}</span></div>
                    )}
                    <div className="col-span-2"><span className="text-neutral-500 block">Delivery Address</span><span className="text-white">{order.deliveryAddress}, {order.city}</span></div>
                    {order.notes && (
                      <div className="col-span-2"><span className="text-neutral-500 block">Notes</span><p className="text-white bg-neutral-900/50 p-3 rounded-sm mt-1">{order.notes}</p></div>
                    )}
                  </div>
                  {order.status === 'PENDING' && (
                    <div className="mt-4 pt-4 border-t border-neutral-900">
                      <button onClick={handleConfirmOrderAndWhatsApp} disabled={updating} className="w-full flex items-center justify-center px-4 py-2 bg-primary hover:bg-red-700 text-white font-bold uppercase tracking-wider text-xs rounded-sm transition-colors disabled:opacity-50">
                        {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                        Confirm Order & WhatsApp
                      </button>
                    </div>
                  )}
                </div>

                {/* Payment Information */}
                <div className="bg-black border border-neutral-900 p-5 rounded-md">
                  <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Payment Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-neutral-500 block mb-1">Method</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-sm border inline-block ${isBankTransfer ? 'text-blue-400 bg-blue-900/30 border-blue-900/50' : 'text-green-400 bg-green-900/30 border-green-900/50'}`}>
                        {isBankTransfer ? 'BANK TRANSFER' : 'CASH ON DELIVERY'}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block mb-1">Status</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-sm border inline-block ${order.paymentStatus === 'UNPAID' ? 'text-yellow-500 bg-yellow-900/30 border-yellow-900/50' : 'text-emerald-400 bg-emerald-900/30 border-emerald-900/50'}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {isBankTransfer && order.receiptUrl && (
                    <div className="border-t border-neutral-800 pt-4 mt-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-neutral-400 mb-1">Transaction Ref: <span className="text-white font-mono">{order.transactionRef}</span></p>
                          <p className="text-[10px] text-neutral-500">Submitted on: {new Date(order.paymentDate).toLocaleString()}</p>
                        </div>
                        <button onClick={fetchReceipt} disabled={loadingReceipt} className="flex items-center px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-sm border border-neutral-700 transition-colors disabled:opacity-50">
                          {loadingReceipt ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <ExternalLink className="w-3 h-3 mr-2" />} View Receipt
                        </button>
                      </div>

                      {order.paymentStatus === 'PAYMENT_SUBMITTED' && (
                        <div className="flex gap-2 mt-4">
                          <button onClick={() => handleVerifyPayment('PAYMENT_VERIFIED')} disabled={updating} className="flex-1 flex items-center justify-center px-3 py-2 bg-green-900/40 hover:bg-green-800/60 text-green-400 text-xs font-bold rounded-sm border border-green-900/50 transition-colors">
                            <ShieldCheck className="w-4 h-4 mr-2" /> Verify & Accept
                          </button>
                          <button onClick={() => handleVerifyPayment('PAYMENT_REJECTED')} disabled={updating} className="flex-1 flex items-center justify-center px-3 py-2 bg-red-900/40 hover:bg-red-800/60 text-red-400 text-xs font-bold rounded-sm border border-red-900/50 transition-colors">
                            <ShieldAlert className="w-4 h-4 mr-2" /> Reject Receipt
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Ordered Items */}
                <div className="bg-black border border-neutral-900 p-5 rounded-md">
                  <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Requested Parts ({order.items.reduce((acc: number, i: any) => acc + i.quantity, 0)})</h4>
                  <div className="space-y-4">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex items-center p-3 border border-neutral-800 rounded-sm bg-neutral-950/50">
                        <div className="w-12 h-12 bg-neutral-900 rounded-sm mr-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="text-sm font-medium text-white truncate">{item.product.name}</p>
                          <p className="text-xs font-mono text-neutral-500 truncate">PN: {item.product.partNumber} • SKU: {item.product.SKU}</p>
                        </div>
                        <div className="text-right pl-4 border-l border-neutral-800">
                          <p className="text-xs text-neutral-500 uppercase">Qty</p>
                          <p className="text-lg font-bold text-white">{item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Status & Timeline */}
              <div className="space-y-6">
                
                {/* Update Status Form */}
                <div className="bg-black border border-neutral-900 p-5 rounded-md">
                  <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Update Status</h4>
                  <form onSubmit={handleUpdateStatus} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Order Status</label>
                      <select value={statusInput} onChange={(e) => setStatusInput(e.target.value)} className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-md text-white focus:outline-none focus:border-primary text-sm font-bold">
                        {validStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Payment Status</label>
                      <select value={paymentStatusInput} onChange={(e) => setPaymentStatusInput(e.target.value)} className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-md text-white focus:outline-none focus:border-primary text-sm font-bold">
                        {validPaymentStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Internal Note (Optional)</label>
                      <textarea value={notesInput} onChange={(e) => setNotesInput(e.target.value)} rows={2} className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-md text-white focus:outline-none focus:border-primary text-sm resize-none" placeholder="e.g. Sent pricing on WhatsApp" />
                    </div>
                    <button type="submit" disabled={updating || (statusInput === order.status && paymentStatusInput === order.paymentStatus && !notesInput)} className="w-full flex items-center justify-center px-4 py-2 bg-primary text-white font-bold uppercase tracking-wider text-xs rounded-sm hover:bg-red-700 transition-colors disabled:opacity-50">
                      {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><RefreshCw className="w-3 h-3 mr-2" /> Update Order</>}
                    </button>
                  </form>
                </div>

                {/* Timeline */}
                <div className="bg-black border border-neutral-900 p-5 rounded-md">
                  <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Status History</h4>
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-800 before:to-transparent">
                    {order.statusHistory.map((history: any) => (
                      <div key={history.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-4 h-4 rounded-full border border-neutral-700 bg-neutral-900 text-neutral-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                        <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-neutral-950 border border-neutral-800 p-3 rounded-md">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-white">{history.status}</span>
                            <span className="text-[10px] text-neutral-500">{new Date(history.createdAt).toLocaleDateString()}</span>
                          </div>
                          {history.notes && <p className="text-xs text-neutral-400 mt-1">{history.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
