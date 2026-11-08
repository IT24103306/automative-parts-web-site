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

export const DEFAULT_SETTINGS: SiteSettings = {
  companyName: 'NG Motors (Pvt) Ltd',
  storeName: 'Automate Parts',
  address: '57, Kurunegala Road, Galewela, Sri Lanka',
  phone: '+94777561007',
  whatsapp: '94777561007',
  email: '',
  codEnabled: true,
  bankTransferEnabled: false,
  lowStockThreshold: 5,
};

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchSettings = async () => {
      try {
        const response = await apiClient.get('/settings');
        if (isMounted && response.data) {
          setSettings({ ...DEFAULT_SETTINGS, ...response.data });
        }
      } catch (error) {
        console.warn('[useSettings] Settings API unavailable, using fallback defaults:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchSettings();
    return () => { isMounted = false; };
  }, []);

  return { settings, loading };
}
