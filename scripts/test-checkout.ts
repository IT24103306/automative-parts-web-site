import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function testCheckout() {
  console.log('--- Testing Checkout ---');
  
  // 1. Fetch products to get a valid product ID
  const productsRes = await axios.get(`${API_URL}/products`);
  const products = productsRes.data.data;
  if (!products || products.length === 0) {
    console.log('❌ FAIL: No products available to test checkout');
    return;
  }
  
  const product = products[0];
  console.log(`Using product: ${product.name} (${product.id})`);

  // 2. Create Order
  const orderData = {
    customer: {
      name: 'Test Customer',
      phone: '0771234567',
      email: 'test@customer.com'
    },
    deliveryAddress: '123 Test St',
    city: 'Colombo',
    paymentMethod: 'COD',
    items: [
      { productId: product.id, quantity: 1 }
    ]
  };

  try {
    const orderRes = await axios.post(`${API_URL}/orders`, orderData);
    console.log('✅ PASS: Order created successfully');
    console.log(`Order ID: ${orderRes.data.order.id}`);
  } catch (error: any) {
    console.log('❌ FAIL: Order creation failed -', error.response?.data?.error || error.message);
  }
}

testCheckout().catch(console.error);
