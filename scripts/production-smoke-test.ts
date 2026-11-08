import axios from 'axios';
import http from 'http';

process.env.PORT = '5556';

async function runSmokeTests() {
  console.log('====================================================');
  console.log('🚀 NG MOTORS PRODUCTION SMOKE & REGRESSION TEST SUITE');
  console.log('====================================================\n');

  // Launch server on port 5556
  await import('../server/index');
  await new Promise((r) => setTimeout(r, 1200));

  const BASE_URL = 'http://localhost:5556/api';
  const STATIC_URL = 'http://localhost:5556';
  let passed = 0;
  let failed = 0;

  const test = (condition: boolean, name: string, detail?: string) => {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  };

  try {
    // ----------------------------------------------------
    // 1. Health & Server Diagnostics
    // ----------------------------------------------------
    console.log('\n[1. System Health & Diagnostics]');
    const health = await axios.get(`${BASE_URL}/health`);
    test(health.status === 200, 'Health endpoint responds with 200 OK');
    test(health.data.server === 'running', 'Health endpoint reports server running');
    test(health.data.database.status === 'connected', 'Database connectivity active');
    test(typeof health.data.uptimeSeconds === 'number', 'Uptime reported correctly');
    test(typeof health.data.build === 'string', 'Build identifier reported');

    // ----------------------------------------------------
    // 2. CORS Domain Validation (www and non-www)
    // ----------------------------------------------------
    console.log('\n[2. CORS Validation for Production Domains]');
    const originsToTest = [
      'https://ingmotorparts.com.lk',
      'https://www.ingmotorparts.com.lk',
      'https://ingmotoparts.com.lk',
      'https://www.ingmotoparts.com.lk',
      'https://preview.ingmotorparts.com.lk',
      'http://localhost:5173',
      'http://localhost:3000',
    ];

    for (const origin of originsToTest) {
      const res = await axios.get(`${BASE_URL}/categories?activeOnly=true`, {
        headers: { Origin: origin },
      });
      test(
        res.headers['access-control-allow-origin'] === origin,
        `CORS Allowed: ${origin}`,
        `Got: ${res.headers['access-control-allow-origin']}`
      );
      test(
        res.headers['access-control-allow-credentials'] === 'true',
        `CORS Credentials True: ${origin}`
      );
    }

    // ----------------------------------------------------
    // 3. Preflight OPTIONS Request Handling
    // ----------------------------------------------------
    console.log('\n[3. OPTIONS Preflight Handling]');
    const preflight = await new Promise<{ statusCode?: number; headers: http.IncomingHttpHeaders }>((resolve) => {
      const req = http.request(
        {
          hostname: 'localhost',
          port: 5556,
          path: '/api/products',
          method: 'OPTIONS',
          headers: {
            Origin: 'https://www.ingmotorparts.com.lk',
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Content-Type, Authorization',
          },
        },
        (res) => resolve({ statusCode: res.statusCode, headers: res.headers })
      );
      req.end();
    });

    test(preflight.statusCode === 204 || preflight.statusCode === 200, 'OPTIONS returns 204 No Content / 200');
    test(
      preflight.headers['access-control-allow-origin'] === 'https://www.ingmotorparts.com.lk',
      'Preflight returns correct Allow-Origin header'
    );
    test(
      String(preflight.headers['access-control-allow-methods']).includes('POST'),
      'Preflight allows POST method'
    );

    // ----------------------------------------------------
    // 4. Products API & Pagination
    // ----------------------------------------------------
    console.log('\n[4. Products Retrieval & Pagination]');
    const productsRes = await axios.get(`${BASE_URL}/products?activeOnly=true&page=1&limit=12`, {
      headers: { Origin: 'https://www.ingmotorparts.com.lk' },
    });
    test(productsRes.status === 200, 'GET /products returns 200');
    test(Array.isArray(productsRes.data?.data), 'Products data is an array');
    test(productsRes.data.data.length > 0, `Returned ${productsRes.data.data.length} active products`);
    test(productsRes.data.pagination?.page === 1, 'Pagination page is 1');
    test(productsRes.data.pagination?.total > 0, `Total products count: ${productsRes.data.pagination.total}`);

    // Test search filter
    const searchRes = await axios.get(`${BASE_URL}/products?search=Brake`, {
      headers: { Origin: 'https://www.ingmotorparts.com.lk' },
    });
    test(searchRes.status === 200, 'Search by keyword returns 200');
    test(searchRes.data.data.length > 0, `Found ${searchRes.data.data.length} parts matching "Brake"`);

    // ----------------------------------------------------
    // 5. Categories API
    // ----------------------------------------------------
    console.log('\n[5. Categories API]');
    const categoriesRes = await axios.get(`${BASE_URL}/categories?activeOnly=true`, {
      headers: { Origin: 'https://www.ingmotorparts.com.lk' },
    });
    test(categoriesRes.status === 200, 'GET /categories returns 200');
    test(Array.isArray(categoriesRes.data) && categoriesRes.data.length > 0, `Categories count: ${categoriesRes.data.length}`);

    // ----------------------------------------------------
    // 6. Settings API Resilience
    // ----------------------------------------------------
    console.log('\n[6. Site Settings API]');
    const settingsRes = await axios.get(`${BASE_URL}/settings`, {
      headers: { Origin: 'https://www.ingmotorparts.com.lk' },
    });
    test(settingsRes.status === 200, 'GET /settings returns 200');
    test(typeof settingsRes.data?.companyName === 'string', `Company Name: "${settingsRes.data?.companyName}"`);
    test(typeof settingsRes.data?.whatsapp === 'string', `WhatsApp Contact: "${settingsRes.data?.whatsapp}"`);

    // ----------------------------------------------------
    // 7. Static Product Image Availability
    // ----------------------------------------------------
    console.log('\n[7. Static Image Serving]');
    const sampleImg = await axios.get(`${STATIC_URL}/images/spark_plug_1791466164055.jpg`, {
      responseType: 'arraybuffer',
    });
    test(sampleImg.status === 200, 'Static product photo served directly with 200 OK');
    test(sampleImg.data.length > 10000, `Image payload size verified: ${sampleImg.data.length} bytes`);

    // ----------------------------------------------------
    // 8. Error Handling & CORS Preservation
    // ----------------------------------------------------
    console.log('\n[8. Error Responses & CORS Preservation]');
    try {
      await axios.get(`${BASE_URL}/nonexistent-test-route`, {
        headers: { Origin: 'https://www.ingmotorparts.com.lk' },
      });
      test(false, 'Expected 404 for nonexistent route');
    } catch (err: any) {
      test(err.response?.status === 404, 'Non-existent route returns 404');
      test(
        err.response?.headers['access-control-allow-origin'] === 'https://www.ingmotorparts.com.lk',
        'CORS header preserved on 404 error response'
      );
    }

    // ----------------------------------------------------
    // 9. Authentication Security (Reject Invalid Credentials)
    // ----------------------------------------------------
    console.log('\n[9. Authentication Security]');
    try {
      await axios.post(
        `${BASE_URL}/admin/login`,
        { email: 'unauthorized_attacker@example.com', password: 'bad_password' },
        { headers: { Origin: 'https://www.ingmotorparts.com.lk' } }
      );
      test(false, 'Expected 401 for invalid credentials');
    } catch (err: any) {
      test(err.response?.status === 401, 'Unauthorized login attempt rejected with 401');
      test(
        err.response?.headers['access-control-allow-origin'] === 'https://www.ingmotorparts.com.lk',
        'CORS header preserved on 401 unauthorized response'
      );
    }

    console.log('\n====================================================');
    console.log(`🎉 ALL SMOKE TESTS COMPLETED: ${passed} Passed, ${failed} Failed`);
    console.log('====================================================\n');
  } catch (fatal) {
    console.error('Fatal smoke test exception:', fatal);
    failed++;
  } finally {
    process.exit(failed > 0 ? 1 : 0);
  }
}

runSmokeTests();
