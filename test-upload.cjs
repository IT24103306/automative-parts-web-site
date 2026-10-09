const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const API_URL = 'http://localhost:5000/api';

async function run() {
  try {
    const loginRes = await axios.post(`${API_URL}/admin/login`, {
      email: 'admin@gmail.com',
      password: 'password123'
    });
    const token = loginRes.data.token;
    
    const formData = new FormData();
    formData.append('image', fs.createReadStream('dummy.png'), {
      filename: 'dummy.png',
      contentType: 'image/png',
    });
    
    console.log('Sending upload request...');
    const res = await axios.post(`${API_URL}/images/products/411f7a01-5e81-4b3e-95d8-da324c683c12`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });
    console.log('Upload success:', res.data);
  } catch (e) {
    console.error('Error:', e.response?.data || e.message);
  }
}
run();
