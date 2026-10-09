import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useSettings } from '../hooks/useSettings';
import { Loader2, Package, CheckCircle2, AlertCircle, Building2, UploadCloud, Clock } from 'lucide-react';
import AutomotiveImage from '../components/AutomotiveImage';

export default function CustomerOrderView() {
  const { id } = useParams();
  const { settings } = useSettings();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Payment upload state
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await apiClient.get(`/orders/track/${id}`);
      setOrder(res.data);
    } catch (err) {
      setError('Order not found or invalid link.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptFile || !transactionRef) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('receipt', receiptFile);
    formData.append('transactionRef', transactionRef);

    try {
      await apiClient.post(`/orders/track/${id}/payment`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadSuccess(true);
      fetchOrder(); // Refresh
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload receipt');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pt-32 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#050505] pt-32 px-4 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Order Not Found</h1>
        <p className="text-neutral-400 mb-8">{error}</p>
        <Link to="/" className="px-6 py-3 bg-white text-black font-bold uppercase rounded-sm hover:bg-neutral-300">Return Home</Link>
      </div>
    );
  }

  const isBankTransfer = order.paymentMethod === 'BANK_TRANSFER';
  const needsPayment = isBankTransfer && order.paymentStatus === 'UNPAID';
  // Customers should only pay if amount is confirmed by Admin (Admin sets status to PAYMENT_PENDING when amount is set, or if they decide it's confirmed)
  // Let's assume order must be CONFIRMED or PAYMENT_PENDING before paying
  const paymentAllowed = needsPayment && (order.status === 'CONFIRMED' || order.status === 'PAYMENT_PENDING');

  return (
    <div className="min-h-screen bg-[#050505] pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 border-b border-neutral-900 pb-8">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2 flex items-center">
              <Package className="w-8 h-8 mr-3 text-primary" /> Order Status
            </h1>
            <p className="text-neutral-400 font-mono text-sm">ID: {order.id}</p>
          </div>
          <div className="text-right">
            <span className="inline-block px-4 py-1 bg-neutral-900 border border-neutral-700 rounded-full text-xs font-bold text-white uppercase tracking-widest">
              {order.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="metallic-panel border border-neutral-900 rounded-sm p-6">
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4 border-b border-neutral-800 pb-2">Requested Parts</h3>
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex items-center bg-black border border-neutral-800 p-3 rounded-sm">
                    <div className="w-16 h-16 bg-neutral-900 rounded-sm flex-shrink-0 flex items-center justify-center mr-4">
                      {item.product.images && item.product.images.length > 0 ? (
                        <AutomotiveImage src={item.product.images[0].url} alt={item.product.name} category={item.product.category?.name} className="max-w-full max-h-full object-contain" />
                      ) : (
                        <AutomotiveImage alt={item.product.name} category={item.product.category?.name} className="max-w-full max-h-full object-contain" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">{item.product.name}</h4>
                      <p className="text-xs text-neutral-500 font-mono">PN: {item.product.partNumber}</p>
                      <p className="text-xs text-neutral-400 mt-1">QTY: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="metallic-panel border border-neutral-900 rounded-sm p-6">
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4 border-b border-neutral-800 pb-2">Status History</h3>
              <div className="space-y-6">
                {order.statusHistory.map((history: any, idx: number) => (
                  <div key={history.id} className="relative pl-6">
                    {idx !== order.statusHistory.length - 1 && (
                      <div className="absolute left-[11px] top-6 bottom-[-24px] w-px bg-neutral-800" />
                    )}
                    <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center z-10">
                      <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-primary' : 'bg-neutral-600'}`} />
                    </div>
                    <p className="text-sm font-bold text-white">{history.status}</p>
                    {history.notes && <p className="text-xs text-neutral-400 mt-1">{history.notes}</p>}
                    <p className="text-[10px] text-neutral-600 mt-1 font-mono">{new Date(history.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="metallic-panel border border-neutral-900 rounded-sm p-6">
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4 border-b border-neutral-800 pb-2">Payment Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Method:</span>
                  <span className="text-white font-bold">{isBankTransfer ? 'BANK TRANSFER' : 'CASH ON DELIVERY'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Status:</span>
                  <span className={`font-bold ${order.paymentStatus === 'UNPAID' ? 'text-yellow-500' : 'text-green-500'}`}>{order.paymentStatus}</span>
                </div>
              </div>

              {isBankTransfer && !paymentAllowed && needsPayment && (
                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-sm">
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0" />
                    <p className="text-xs text-yellow-500 leading-relaxed">
                      Our team is confirming the final price and availability. You will be able to upload your payment receipt here once confirmed.
                    </p>
                  </div>
                </div>
              )}

              {paymentAllowed && (
                <div className="mt-6 border-t border-neutral-800 pt-6">
                  <div className="mb-6 p-4 bg-black border border-neutral-800 rounded-sm">
                     <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center mb-3">
                       <Building2 className="w-4 h-4 mr-2 text-neutral-400" /> Bank Details
                     </h4>
                     <div className="space-y-2 text-xs font-mono text-neutral-400">
                        <div className="flex justify-between"><span className="text-neutral-500">Bank:</span> <span className="text-white text-right">{settings?.bankName}</span></div>
                        <div className="flex justify-between"><span className="text-neutral-500">Name:</span> <span className="text-white text-right">{settings?.bankAccountName}</span></div>
                        <div className="flex justify-between"><span className="text-neutral-500">A/C No:</span> <span className="text-white text-right">{settings?.bankAccountNumber}</span></div>
                        <div className="flex justify-between"><span className="text-neutral-500">Branch:</span> <span className="text-white text-right">{settings?.bankBranch}</span></div>
                     </div>
                  </div>

                  {uploadSuccess ? (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-sm text-center">
                      <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-xs text-green-500 font-bold uppercase tracking-wide">Receipt Uploaded Successfully</p>
                      <p className="text-xs text-green-400/80 mt-1">Pending verification by our team.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleUpload} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Transaction Ref / ID</label>
                        <input required type="text" value={transactionRef} onChange={(e) => setTransactionRef(e.target.value)} className="w-full px-3 py-2 bg-black border border-neutral-800 rounded-sm text-white focus:outline-none focus:border-primary text-sm" placeholder="e.g. TR-993822" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Upload Receipt</label>
                        <input required type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} className="w-full px-3 py-2 bg-black border border-neutral-800 rounded-sm text-white focus:outline-none focus:border-primary text-xs file:mr-4 file:py-1 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-bold file:bg-neutral-800 file:text-white hover:file:bg-neutral-700" />
                      </div>
                      <button type="submit" disabled={uploading || !receiptFile || !transactionRef} className="w-full flex items-center justify-center px-4 py-3 bg-primary text-white font-bold uppercase tracking-widest text-xs hover:bg-red-700 transition-colors disabled:opacity-50 rounded-sm">
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UploadCloud className="w-4 h-4 mr-2" /> Submit Payment</>}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
