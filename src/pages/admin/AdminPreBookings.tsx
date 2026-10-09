import { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { Loader2, Search, MessageCircle } from 'lucide-react';

export default function AdminPreBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await apiClient.get('/pre-bookings');
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiClient.patch(`/pre-bookings/${id}/status`, { status });
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  const filteredBookings = bookings.filter(b => 
    b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.vehicleMake.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Pre-Bookings & Requests</h1>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by customer, part, or vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 text-white pl-10 pr-4 py-2 rounded-md focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-400">
            <thead className="bg-neutral-950 text-xs uppercase font-medium text-neutral-500 border-b border-neutral-800">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Part Details</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
              ) : filteredBookings.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center">No pre-bookings found</td></tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-neutral-800/50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{b.customerName}</div>
                      <div>{b.phone}</div>
                      {b.whatsapp && (
                        <a href={`https://wa.me/${b.whatsapp.replace(/\D/g, '')}`} target="_blank" className="text-green-500 flex items-center text-xs mt-1 hover:underline">
                          <MessageCircle className="w-3 h-3 mr-1" /> WhatsApp
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{b.vehicleMake} {b.vehicleModel}</div>
                      <div>{b.vehicleYear}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{b.partName}</div>
                      <div>PN: {b.partNumber || 'N/A'} (Qty: {b.quantity})</div>
                      {b.preferredDate && <div className="text-xs text-primary mt-1">Needed by: {b.preferredDate}</div>}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={b.status}
                        onChange={(e) => updateStatus(b.id, e.target.value)}
                        className={`bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-xs font-bold ${
                          b.status === 'NEW' ? 'text-blue-500' :
                          b.status === 'CONFIRMED' ? 'text-green-500' :
                          b.status === 'CANCELLED' ? 'text-red-500' : 'text-yellow-500'
                        }`}
                      >
                        <option value="NEW">New</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="WAITING">Waiting on Part</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="FULFILLED">Fulfilled</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {b.notes && (
                        <div className="text-xs text-neutral-500 max-w-[200px] truncate ml-auto">
                          Note: {b.notes}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
