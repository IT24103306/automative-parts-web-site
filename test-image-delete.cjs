const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const API_URL = 'http://localhost:5000/api';

async function run() {
  try {
    const loginRes = await axios.post(`${API_URL}/admin/login`, {
      email: 'admin@gmail.com',
      password: 'password123'
    });
    const token = loginRes.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    const img = await prisma.productImage.create({
      data: {
        productId: '411f7a01-5e81-4b3e-95d8-da324c683c12',
        url: 'https://test.supabase.co/storage/v1/object/public/product-images/fake.jpg',
        isPrimary: false,
        order: 99
      }
    });
    
    console.log('Created test image:', img.id);

    const delRes = await axios.delete(`${API_URL}/images/${img.id}`, { headers });
    console.log('Delete response:', delRes.status);
    
    const checkImg = await prisma.productImage.findUnique({ where: { id: img.id } });
    console.log('Image in DB after delete:', checkImg);
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}
run();
