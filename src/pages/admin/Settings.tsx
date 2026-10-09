import { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { Loader2, Save, Store, Phone, Box } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiClient.get('/settings');
        setSettings(response.data);
      } catch (error) {
        console.error('Failed to load settings', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      await apiClient.put('/settings', settings);
      
      if (settings.currentPassword && (settings.newEmail || settings.newPassword)) {
        await apiClient.put('/admin/credentials', {
          currentPassword: settings.currentPassword,
          newEmail: settings.newEmail,
          newPassword: settings.newPassword
        });
        setSettings({ ...settings, currentPassword: '', newEmail: '', newPassword: '' });
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update settings or credentials');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!settings) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white tracking-tight">Site Settings</h1>
        <button 
          onClick={handleSubmit}
          disabled={saving}
          className="bg-primary hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} 
          Save Changes
        </button>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-400 border border-red-900/50 rounded-lg bg-red-950/20">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 text-sm text-green-400 border border-green-900/50 rounded-lg bg-green-950/20">
          Settings updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Business Information */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-6">
          <div className="flex items-center mb-6 border-b border-neutral-900 pb-4">
            <Store className="w-5 h-5 text-primary mr-3" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Business Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Company Name</label>
              <input type="text" value={settings.companyName} onChange={e => setSettings({...settings, companyName: e.target.value})} className="w-full px-4 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Store Display Name</label>
              <input type="text" value={settings.storeName} onChange={e => setSettings({...settings, storeName: e.target.value})} className="w-full px-4 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:border-primary" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-300 mb-1">Physical Address</label>
              <input type="text" value={settings.address} onChange={e => setSettings({...settings, address: e.target.value})} className="w-full px-4 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:border-primary" />
            </div>
          </div>
        </div>

        {/* Contact & WhatsApp */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-6">
          <div className="flex items-center mb-6 border-b border-neutral-900 pb-4">
            <Phone className="w-5 h-5 text-primary mr-3" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Contact & Enquiries</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">WhatsApp Number</label>
              <input type="text" value={settings.whatsapp} onChange={e => setSettings({...settings, whatsapp: e.target.value})} placeholder="+94770000000" className="w-full px-4 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:border-primary" />
              <p className="text-xs text-neutral-500 mt-1">Used for all product inquiries from the frontend.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">General Phone</label>
              <input type="text" value={settings.phone} onChange={e => setSettings({...settings, phone: e.target.value})} className="w-full px-4 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:border-primary" />
            </div>
          </div>
        </div>

        {/* Inventory & Features */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-6">
          <div className="flex items-center mb-6 border-b border-neutral-900 pb-4">
            <Box className="w-5 h-5 text-primary mr-3" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Inventory & Operations</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Global Low-Stock Threshold</label>
              <input type="number" min="0" value={settings.lowStockThreshold} onChange={e => setSettings({...settings, lowStockThreshold: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:border-primary" />
              <p className="text-xs text-neutral-500 mt-1">Products below this quantity will display as 'Low Stock'.</p>
            </div>
            
            <div className="flex flex-col justify-center">
              <label className="flex items-center space-x-3 cursor-pointer p-4 border border-neutral-800 bg-black rounded-md hover:border-primary transition-colors">
                <input type="checkbox" checked={settings.codEnabled} onChange={e => setSettings({...settings, codEnabled: e.target.checked})} className="w-4 h-4 text-primary bg-black border-neutral-700 rounded focus:ring-primary focus:ring-2" />
                <div>
                  <span className="block text-sm font-medium text-white mb-1">Enable Cash on Delivery (COD)</span>
                  <span className="block text-xs text-neutral-500">Allow customers to request COD during enquiry.</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Payment Methods: Bank Transfer */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6 border-b border-neutral-900 pb-4">
            <div className="flex items-center">
              <Store className="w-5 h-5 text-primary mr-3" />
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">Bank Transfer Details</h2>
            </div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <span className="text-sm font-medium text-neutral-300">Enable</span>
              <input type="checkbox" checked={settings.bankTransferEnabled} onChange={e => setSettings({...settings, bankTransferEnabled: e.target.checked})} className="w-4 h-4 text-primary bg-black border-neutral-700 rounded focus:ring-primary focus:ring-2" />
            </label>
          </div>
          
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity ${settings.bankTransferEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Bank Name</label>
              <input type="text" value={settings.bankName || ''} onChange={e => setSettings({...settings, bankName: e.target.value})} className="w-full px-4 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:border-primary" placeholder="Commercial Bank" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Account Name</label>
              <input type="text" value={settings.bankAccountName || ''} onChange={e => setSettings({...settings, bankAccountName: e.target.value})} className="w-full px-4 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:border-primary" placeholder="NG Motors Pvt Ltd" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Account Number</label>
              <input type="text" value={settings.bankAccountNumber || ''} onChange={e => setSettings({...settings, bankAccountNumber: e.target.value})} className="w-full px-4 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:border-primary" placeholder="1000 0000 0000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Branch</label>
              <input type="text" value={settings.bankBranch || ''} onChange={e => setSettings({...settings, bankBranch: e.target.value})} className="w-full px-4 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:border-primary" placeholder="Colombo 01" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-300 mb-1">Payment Instructions</label>
              <textarea rows={3} value={settings.paymentInstructions || ''} onChange={e => setSettings({...settings, paymentInstructions: e.target.value})} className="w-full px-4 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:border-primary resize-none" placeholder="Please use your Order ID as the reference..." />
            </div>
          </div>
        </div>

        {/* Security / Credentials */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-6">
          <div className="flex items-center mb-6 border-b border-neutral-900 pb-4">
            <svg className="w-5 h-5 text-primary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Admin Credentials</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-300 mb-1">Current Password (Required for changes)</label>
              <input type="password" value={settings.currentPassword || ''} onChange={e => setSettings({...settings, currentPassword: e.target.value})} className="w-full px-4 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:border-primary" placeholder="Enter current password to save changes" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">New Email</label>
              <input type="email" value={settings.newEmail || ''} onChange={e => setSettings({...settings, newEmail: e.target.value})} className="w-full px-4 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:border-primary" placeholder="Leave blank to keep current" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">New Password</label>
              <input type="password" value={settings.newPassword || ''} onChange={e => setSettings({...settings, newPassword: e.target.value})} className="w-full px-4 py-2 bg-black border border-neutral-800 rounded-md text-white focus:outline-none focus:border-primary" placeholder="Leave blank to keep current" />
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
