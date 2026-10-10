import axios from 'axios';

const API_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';

async function auditPublicEndpoints() {
  console.log('--- Public API Audit ---');
  let passed = 0;
  let failed = 0;

  const testEndpoint = async (name: string, url: string, expectedStatus = 200) => {
    try {
      const response = await axios.get(url);
      if (response.status === expectedStatus) {
        console.log(`✅ PASS: ${name} (${url}) - Status ${response.status}`);
        passed++;
      } else {
        console.log(`❌ FAIL: ${name} (${url}) - Expected ${expectedStatus}, got ${response.status}`);
        failed++;
      }
    } catch (error: any) {
      console.log(`❌ FAIL: ${name} (${url}) - ${error.message}`);
      failed++;
    }
  };

  await testEndpoint('Health Check', `${API_URL}/health`);
  await testEndpoint('Fetch Products', `${API_URL}/products`);
  await testEndpoint('Fetch Categories', `${API_URL}/categories`);
  await testEndpoint('Fetch Settings', `${API_URL}/settings`);

  console.log(`\nAudit Complete: ${passed} Passed, ${failed} Failed.`);
}

auditPublicEndpoints().catch(console.error);
