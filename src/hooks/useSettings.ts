import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

export interface SiteSettings {
  companyName: string;
  storeName: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  codEnabled: boolean;
  bankTransferEnabled: boolean;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankBranch?: string;
  paymentInstructions?: string;
  lowStockThreshold: number;
}

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiClient.get('/settings');
        setSettings(response.data);
      } catch (error) {
        console.error('Failed to load site settings', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  return { settings, loading };
}
