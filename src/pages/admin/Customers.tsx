import { useState, useEffect } from 'react';
import { Users, Search, Phone, Mail, Loader2, Calendar } from 'lucide-react';
import { apiClient } from '../../api/client';

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // In a real app this would be a dedicated /customers endpoint.
      // Here we might aggregate from orders if a dedicated endpoint isn't built yet,
      // or we can just fetch from orders for now.
      const response = await apiClient.get('/orders');
      
      const ordersArray = Array.isArray(response.data) ? response.data : response.data.orders || [];
      
      // Extract unique customers from orders
      const uniqueCustomersMap = new Map();
      ordersArray.forEach((order: any) => {
        const customer = order.customer;
        if (!customer) return;

        if (!uniqueCustomersMap.has(customer.email || customer.phone)) {
          uniqueCustomersMap.set(customer.email || customer.phone, {
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            orderCount: 1,
            totalValue: 0, // Orders don't store totalAmount currently
            lastOrderDate: order.createdAt
          });
        } else {
          const cust = uniqueCustomersMap.get(customer.email || customer.phone);
          cust.orderCount += 1;
          if (new Date(order.createdAt) > new Date(cust.lastOrderDate)) {
            cust.lastOrderDate = order.createdAt;
          }
        }
      });
      
      setCustomers(Array.from(uniqueCustomersMap.values()));
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
    c.phone.includes(search)
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Customer Management
          </h1>
          <p className="text-neutral-400 mt-1">View and manage customer profiles and order history.</p>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-neutral-900 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            No customers found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 text-sm">
                  <th className="py-3 px-4 font-medium">Customer Name</th>
                  <th className="py-3 px-4 font-medium">Contact Details</th>
                  <th className="py-3 px-4 font-medium">Orders</th>
                  <th className="py-3 px-4 font-medium">Total Value</th>
                  <th className="py-3 px-4 font-medium">Last Order</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer, index) => (
                  <tr key={index} className="border-b border-neutral-900/50 hover:bg-neutral-900/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-medium text-white">{customer.name}</div>
                    </td>
                    <td className="py-4 px-4 space-y-1">
                      <div className="flex items-center text-sm text-neutral-300">
                        <Mail className="w-3.5 h-3.5 mr-2 text-neutral-500" />
                        {customer.email || 'N/A'}
                      </div>
                      <div className="flex items-center text-sm text-neutral-300">
                        <Phone className="w-3.5 h-3.5 mr-2 text-neutral-500" />
                        {customer.phone}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-white">
                      {customer.orderCount}
                    </td>
                    <td className="py-4 px-4 text-green-400 font-medium">
                      LKR {customer.totalValue.toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center text-sm text-neutral-400">
                        <Calendar className="w-3.5 h-3.5 mr-2" />
                        {new Date(customer.lastOrderDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a 
                          href={`tel:${customer.phone}`}
                          className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded transition-colors"
                          title="Call Customer"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                        <a 
                          href={`https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${customer.name}, this is NG Motors.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 bg-green-900/20 hover:bg-green-900/40 text-green-500 rounded transition-colors"
                          title="WhatsApp Customer"
                        >
                          WhatsApp
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
