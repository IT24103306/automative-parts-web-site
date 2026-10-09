const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function testUploads() {
  console.log('Testing Supabase Uploads...');

  try {
    // 1. Fetch products to get a product ID
    const productsRes = await axios.get('http://localhost:5000/api/products?limit=1');
    const products = productsRes.data.data;
    if (products.length === 0) {
      console.log('No products found to attach image.');
      return;
    }
    const productId = products[0].id;

    // Create a dummy image
    fs.writeFileSync('dummy.jpg', 'fake image data');

    // 2. Test Product Image Upload
    const form1 = new FormData();
    form1.append('image', fs.createReadStream('dummy.jpg'));

    // We need admin token for this, let's login first
    const loginRes = await axios.post('http://localhost:5000/api/admin/login', {
      email: 'admin@test.com',
      password: 'password123'
    });
    const token = loginRes.data.token;

    console.log('Uploading product image to Supabase (bucket: product-images)...');
    const imageUploadRes = await axios.post(`http://localhost:5000/api/images/products/${productId}`, form1, {
      headers: {
        ...form1.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Product image upload SUCCESS:', imageUploadRes.data.url);
    
    // 3. Create a fake order to attach receipt to
    const createOrderRes = await axios.post('http://localhost:5000/api/orders', {
      customer: {
        name: 'Upload Test User',
        phone: '123456',
        email: 'upload@test.com',
      },
      deliveryAddress: '123 Test St',
      city: 'Test City',
      paymentMethod: 'BANK_TRANSFER',
      items: [{ productId: productId, quantity: 1 }]
    });
    const orderId = createOrderRes.data.orderId;
    console.log('Order created with ID:', orderId);

    // We need to set status to PAYMENT_PENDING which is default, but the backend requires confirming final price before upload
    // The CustomerOrderView says: "Our team is confirming the final price... You will be able to upload your payment receipt here once confirmed."
    // Let's set order to PAYMENT_PENDING and totalAmount to > 0 via Admin API so user can upload.
    await axios.patch(`http://localhost:5000/api/orders/${orderId}/status`, {
      status: 'PAYMENT_PENDING'
    }, { headers: { Authorization: `Bearer ${token}` } });

    // 4. Test Payment Receipt Upload
    const form2 = new FormData();
    form2.append('receipt', fs.createReadStream('dummy.jpg'));
    form2.append('transactionRef', 'TXN-123456');

    console.log('Uploading payment receipt to Supabase (bucket: payment-receipts)...');
    const receiptUploadRes = await axios.post(`http://localhost:5000/api/orders/track/${orderId}/payment`, form2, {
      headers: form2.getHeaders()
    });
    console.log('Payment receipt upload SUCCESS. Order status:', receiptUploadRes.data.status);

    // 5. Test Admin viewing receipt (Signed URL)
    console.log('Fetching signed URL for receipt...');
    const getReceiptRes = await axios.get(`http://localhost:5000/api/orders/${orderId}/receipt`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Signed URL fetched SUCCESS:', getReceiptRes.data.url);

    console.log('\\n--- ALL TESTS PASSED ---');

  } catch (error) {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  } finally {
    if (fs.existsSync('dummy.jpg')) fs.unlinkSync('dummy.jpg');
  }
}

testUploads();
