import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { Eye, Search, Clock, CheckCircle2, Truck, Box, XCircle } from 'lucide-react';
import OrderModal from '../../components/admin/OrderModal';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING': return { icon: <Clock className="w-4 h-4 mr-1.5" />, color: 'text-yellow-400 bg-yellow-900/30 border-yellow-900/50' };
      case 'CONFIRMED': return { icon: <CheckCircle2 className="w-4 h-4 mr-1.5" />, color: 'text-blue-400 bg-blue-900/30 border-blue-900/50' };
      case 'PROCESSING': return { icon: <Box className="w-4 h-4 mr-1.5" />, color: 'text-purple-400 bg-purple-900/30 border-purple-900/50' };
      case 'SHIPPED': return { icon: <Truck className="w-4 h-4 mr-1.5" />, color: 'text-indigo-400 bg-indigo-900/30 border-indigo-900/50' };
      case 'DELIVERED': return { icon: <CheckCircle2 className="w-4 h-4 mr-1.5" />, color: 'text-emerald-400 bg-emerald-900/30 border-emerald-900/50' };
      case 'COMPLETED': return { icon: <CheckCircle2 className="w-4 h-4 mr-1.5" />, color: 'text-green-400 bg-green-900/30 border-green-900/50' };
      case 'CANCELLED': return { icon: <XCircle className="w-4 h-4 mr-1.5" />, color: 'text-red-400 bg-red-900/30 border-red-900/50' };
      default: return { icon: null, color: 'text-neutral-400 bg-neutral-900/30 border-neutral-900/50' };
    }
  };

  const filteredOrders = statusFilter 
    ? orders.filter(o => o.status === statusFilter)
    : orders;

  const openModal = (orderId: string) => {
    setSelectedOrder(orderId);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white tracking-tight">Order Enquiries</h1>
        <div className="flex space-x-2 border border-neutral-800 rounded-md bg-neutral-950 p-1">
          {['', 'PENDING', 'CONFIRMED', 'COMPLETED'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${statusFilter === status ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'}`}
            >
              {status || 'ALL'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-neutral-950 border border-neutral-900 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-neutral-900 flex items-center justify-between">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-neutral-500" />
            </div>
            <input
              type="text"
              placeholder="Search by ID, Phone, or Name..."
              className="bg-black border border-neutral-800 text-white pl-10 pr-4 py-2 rounded-md text-sm focus:outline-none focus:border-primary transition-colors w-72"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-900 text-neutral-400">
              <tr>
                <th className="px-6 py-3 font-medium">Order ID</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Items</th>
                <th className="px-6 py-3 font-medium">Payment</th>
                <th className="px-6 py-3 font-medium">Order Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-neutral-500">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-neutral-500">
                    No order enquiries found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const conf = getStatusConfig(order.status);
                  const isBankTransfer = order.paymentMethod === 'BANK_TRANSFER';
                  return (
                    <tr key={order.id} className="hover:bg-neutral-900/50">
                      <td className="px-6 py-4 font-medium text-white font-mono text-xs">...{order.id.slice(-8)}</td>
                      <td className="px-6 py-4 text-neutral-300">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{order.customer?.name}</div>
                        <div className="text-neutral-500 text-xs">{order.customer?.phone}</div>
                      </td>
                      <td className="px-6 py-4 text-neutral-300">{order.items.reduce((sum: number, item: any) => sum + item.quantity, 0)} parts</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm inline-block w-max ${isBankTransfer ? 'bg-blue-900/30 text-blue-400 border border-blue-900/50' : 'bg-green-900/30 text-green-400 border border-green-900/50'}`}>
                            {isBankTransfer ? 'BANK TRANSFER' : 'COD'}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm inline-block w-max ${order.paymentStatus === 'UNPAID' ? 'bg-yellow-900/30 text-yellow-500 border border-yellow-900/50' : 'bg-emerald-900/30 text-emerald-400 border border-emerald-900/50'}`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${conf.color}`}>
                          {conf.icon} {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => openModal(order.id)} className="text-neutral-400 hover:text-white transition-colors bg-neutral-900 px-3 py-1.5 rounded-md flex items-center inline-flex ml-auto">
                          <Eye className="h-4 w-4 mr-2" /> View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {isModalOpen && (
        <OrderModal 
          orderId={selectedOrder} 
          onClose={() => setIsModalOpen(false)} 
          onStatusUpdated={fetchOrders}
        />
      )}
    </div>
  );
}
