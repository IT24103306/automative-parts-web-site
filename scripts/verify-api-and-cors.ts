import axios from 'axios';
import http from 'http';

// We will launch a test instance of the Express server on an unused port, e.g. 5555
process.env.PORT = '5555';

async function runTests() {
  console.log('--- Starting API & CORS Verification Test ---');

  // Dynamically import server/index.ts
  const serverModule = await import('../server/index');

  // Wait a brief moment for the server to listen
  await new Promise((r) => setTimeout(r, 1000));

  const BASE_URL = 'http://localhost:5555/api';
  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string, detail?: string) => {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} - ${detail || ''}`);
      failed++;
    }
  };

  try {
    // Test 1: Health check endpoint
    const healthRes = await axios.get(`${BASE_URL}/health`);
    assert(healthRes.status === 200, 'Health check returns 200 OK');
    assert(healthRes.data?.database?.status === 'connected', 'Health check reports database connected');

    // Test 2: CORS with https://www.ingmotoparts.com.lk
    const wwwRes = await axios.get(`${BASE_URL}/categories?activeOnly=true`, {
      headers: { Origin: 'https://www.ingmotoparts.com.lk' },
    });
    assert(wwwRes.status === 200, 'GET /categories with www origin returns 200');
    assert(
      wwwRes.headers['access-control-allow-origin'] === 'https://www.ingmotoparts.com.lk',
      'CORS header matches www production origin',
      `Got: ${wwwRes.headers['access-control-allow-origin']}`
    );
    assert(
      wwwRes.headers['access-control-allow-credentials'] === 'true',
      'CORS header includes credentials true'
    );
    assert(Array.isArray(wwwRes.data) && wwwRes.data.length > 0, 'Categories list is non-empty array');

    // Test 3: CORS with non-www origin https://ingmotoparts.com.lk
    const nonWwwRes = await axios.get(`${BASE_URL}/categories?activeOnly=true`, {
      headers: { Origin: 'https://ingmotoparts.com.lk' },
    });
    assert(nonWwwRes.status === 200, 'GET /categories with non-www origin returns 200');
    assert(
      nonWwwRes.headers['access-control-allow-origin'] === 'https://ingmotoparts.com.lk',
      'CORS header matches non-www production origin',
      `Got: ${nonWwwRes.headers['access-control-allow-origin']}`
    );

    // Test 4: Preflight OPTIONS request
    const preflightOptions: http.RequestOptions = {
      hostname: 'localhost',
      port: 5555,
      path: '/api/products',
      method: 'OPTIONS',
      headers: {
        Origin: 'https://www.ingmotoparts.com.lk',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Authorization, Content-Type',
      },
    };

    const preflightRes = await new Promise<{ statusCode?: number; headers: http.IncomingHttpHeaders }>((resolve) => {
      const req = http.request(preflightOptions, (res) => {
        resolve({ statusCode: res.statusCode, headers: res.headers });
      });
      req.end();
    });

    assert(
      preflightRes.statusCode === 204 || preflightRes.statusCode === 200,
      'Preflight OPTIONS returns 204 or 200',
      `Got status: ${preflightRes.statusCode}`
    );
    assert(
      preflightRes.headers['access-control-allow-origin'] === 'https://www.ingmotoparts.com.lk',
      'Preflight includes Allow-Origin for www domain'
    );
    assert(
      String(preflightRes.headers['access-control-allow-methods']).includes('GET'),
      'Preflight includes GET in Allow-Methods'
    );

    // Test 5: Products endpoint
    const productsRes = await axios.get(`${BASE_URL}/products?page=1&limit=12`, {
      headers: { Origin: 'https://www.ingmotoparts.com.lk' },
    });
    assert(productsRes.status === 200, 'GET /products returns 200');
    assert(Array.isArray(productsRes.data?.data), 'Products response contains data array');
    assert(productsRes.data?.pagination?.page === 1, 'Pagination page is 1');
    assert(typeof productsRes.data?.pagination?.total === 'number', 'Pagination total is number');

    // Test 6: Settings endpoint
    const settingsRes = await axios.get(`${BASE_URL}/settings`, {
      headers: { Origin: 'https://www.ingmotoparts.com.lk' },
    });
    assert(settingsRes.status === 200, 'GET /settings returns 200');
    assert(typeof settingsRes.data?.companyName === 'string', 'Settings contains companyName');

    // Test 7: CORS preservation on 404
    try {
      await axios.get(`${BASE_URL}/nonexistent-route`, {
        headers: { Origin: 'https://www.ingmotoparts.com.lk' },
      });
      assert(false, 'Non-existent route should return 404');
    } catch (err: any) {
      assert(err.response?.status === 404, 'Non-existent route returns 404');
      assert(
        err.response?.headers['access-control-allow-origin'] === 'https://www.ingmotoparts.com.lk',
        'CORS header preserved on 404 error response'
      );
    }

    console.log(`\n========================================`);
    console.log(`Verification Complete: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================`);
  } catch (err) {
    console.error('Unexpected test error:', err);
    failed++;
  } finally {
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
