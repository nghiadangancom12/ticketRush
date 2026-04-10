const http = require('http');

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  try {
    const timestamp = Date.now();
    const testEmail = `test-${timestamp}@example.com`;
    
    console.log('\n========== TESTING PROFILE ENDPOINTS ==========\n');

    // 1. REGISTER
    console.log('1️⃣ REGISTER - Creating new user...');
    const registerRes = await makeRequest('POST', '/api/auth/register', {
      email: testEmail,
      password: 'Test123!@#',
      full_name: 'Test User',
      date_of_birth: '1990-01-15',
      gender: 'MALE'
    });
    console.log(`Status: ${registerRes.status}`);
    console.log('Response:', JSON.stringify(registerRes.data, null, 2));

    // 2. LOGIN
    console.log('\n2️⃣ LOGIN - Getting authentication token...');
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: testEmail,
      password: 'Test123!@#'
    });
    const token = loginRes.data.data.accessToken;
    const userId = loginRes.data.data.id;
    const role = loginRes.data.data.role;
    console.log(`Status: ${loginRes.status}`);
    console.log(`Token: ${token}`);
    console.log(`User ID: ${userId}, Role: ${role}`);
    console.log('Response:', JSON.stringify(loginRes.data, null, 2));

    // 3. GET PROFILE
    console.log('\n3️⃣ GET /me - Fetching user profile...');
    const getOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/customers/me',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    const getRes = await new Promise((resolve, reject) => {
      const req = http.request(getOptions, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, data: body });
          }
        });
      });
      req.on('error', reject);
      req.end();
    });

    console.log(`Status: ${getRes.status}`);
    console.log('Profile:', JSON.stringify(getRes.data.data.profile, null, 2));
    console.log('Orders:', getRes.data.data.orders.length);
    console.log('Locked Seats:', getRes.data.data.lockedSeats.length);

    // 4. UPDATE PROFILE
    console.log('\n4️⃣ PATCH /me - Updating profile...');
    const patchOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/customers/me',
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    const patchRes = await new Promise((resolve, reject) => {
      const req = http.request(patchOptions, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, data: body });
          }
        });
      });
      req.on('error', reject);
      req.write(JSON.stringify({
        full_name: 'Updated Test User',
        gender: 'FEMALE',
        avatar_url: 'https://example.com/avatar.jpg'
      }));
      req.end();
    });

    console.log(`Status: ${patchRes.status}`);
    console.log('Updated Profile:', JSON.stringify(patchRes.data.data, null, 2));

    // 5. VERIFY UPDATE
    console.log('\n5️⃣ GET /me again - Verify update...');
    const verifyRes = await new Promise((resolve, reject) => {
      const req = http.request(getOptions, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, data: body });
          }
        });
      });
      req.on('error', reject);
      req.end();
    });

    console.log(`Status: ${verifyRes.status}`);
    console.log('Current Profile:', JSON.stringify(verifyRes.data.data.profile, null, 2));

    console.log('\n========== ALL TESTS COMPLETED ✅ ==========\n');

  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
  }
}

runTests();
