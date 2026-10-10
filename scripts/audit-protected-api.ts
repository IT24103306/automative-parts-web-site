import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function auditProtectedEndpoints() {
  console.log('--- Protected API Audit ---');
  let passed = 0;
  let failed = 0;
  let blocked = 0;

  // 1. Login to get token
  let token = '';
  try {
    const loginRes = await axios.post(`${API_URL}/admin/login`, {
      email: 'admin@test.com',
      password: 'password123'
    });
    token = loginRes.data.token;
    console.log('✅ PASS: Admin Login');
    passed++;
  } catch (err: any) {
    console.log('❌ FAIL: Admin Login -', err.response?.data?.error || err.message);
    failed++;
    console.log('Blocking further protected API tests due to login failure.');
    return;
  }

  const authHeaders = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const testEndpoint = async (name: string, requestPromise: Promise<any>, expectedStatus = 200) => {
    try {
      const response = await requestPromise;
      if (response.status === expectedStatus) {
        console.log(`✅ PASS: ${name}`);
        passed++;
        return response.data;
      } else {
        console.log(`❌ FAIL: ${name} - Expected ${expectedStatus}, got ${response.status}`);
        failed++;
      }
    } catch (error: any) {
      console.log(`❌ FAIL: ${name} - ${error.response?.data?.error || error.message}`);
      failed++;
    }
    return null;
  };

  // Profile
  await testEndpoint('Admin Profile', axios.get(`${API_URL}/admin/profile`, authHeaders));
  
  // Products Admin
  const products = await testEndpoint('Admin Products List', axios.get(`${API_URL}/products/admin`, authHeaders));
  
  // Categories Admin
  const categories = await testEndpoint('Admin Categories List', axios.get(`${API_URL}/categories`, authHeaders));
  
  // Orders
  await testEndpoint('Admin Orders List', axios.get(`${API_URL}/orders`, authHeaders));

  // Settings
  await testEndpoint('Admin Settings Read', axios.get(`${API_URL}/settings`, authHeaders));

  console.log(`\nAudit Complete: ${passed} Passed, ${failed} Failed.`);
}

auditProtectedEndpoints().catch(console.error);
