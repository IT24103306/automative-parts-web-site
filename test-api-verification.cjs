const axios = require('axios');
const assert = require('assert');

const API_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('Running API Verification Tests...');
  let token = '';

  try {
    // 1. Admin Login
    console.log('\n1. Testing Admin Login...');
    const loginRes = await axios.post(`${API_URL}/admin/login`, {
      email: 'admin@gmail.com',
      password: 'password123'
    });
    assert.strictEqual(loginRes.status, 200, 'Login failed');
    token = loginRes.data.token;
    assert.ok(token, 'Token not received');
    console.log('✅ Admin Login PASS');

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Customer Management (Aggregating orders)
    console.log('\n2. Testing Customer Management (Orders Fetch)...');
    const ordersRes = await axios.get(`${API_URL}/orders`, { headers });
    assert.strictEqual(ordersRes.status, 200);
    assert.ok(Array.isArray(ordersRes.data), 'Orders should be an array');
    console.log(`✅ Orders fetch PASS (Found ${ordersRes.data.length} orders)`);

    // 3. Admin Settings Credential Change
    console.log('\n3. Testing Admin Settings Credentials Change...');
    const credsUpdateRes = await axios.put(`${API_URL}/admin/credentials`, {
      currentPassword: 'password123',
      newEmail: 'admin2@gmail.com'
    }, { headers });
    assert.strictEqual(credsUpdateRes.status, 200);
    console.log('✅ Admin Settings Email Change PASS');

    // Revert it back
    console.log('Reverting Admin Settings Email...');
    const loginRes2 = await axios.post(`${API_URL}/admin/login`, {
      email: 'admin2@gmail.com',
      password: 'password123'
    });
    const token2 = loginRes2.data.token;
    
    await axios.put(`${API_URL}/admin/credentials`, {
      currentPassword: 'password123',
      newEmail: 'admin@gmail.com'
    }, { headers: { Authorization: `Bearer ${token2}` } });
    console.log('✅ Admin Settings Email Revert PASS');

    // 4. Pre-Book Submission
    console.log('\n4. Testing Pre-Book Submission...');
    const preBookRes = await axios.post(`${API_URL}/pre-bookings`, {
      customerName: 'Test Customer',
      phone: '1234567890',
      vehicleMake: 'Test',
      vehicleModel: 'Test',
      vehicleYear: '2020',
      partName: 'Test Part',
      quantity: 1
    });
    assert.strictEqual(preBookRes.status, 201);
    console.log('✅ Pre-Book Submission PASS');

    console.log('\nAll API tests completed successfully.');
  } catch (err) {
    console.error('❌ Test failed:', err.response ? err.response.data : err.message);
  }
}

runTests();
