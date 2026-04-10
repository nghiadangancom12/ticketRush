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
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function test() {
  const email = `debug${Date.now()}@test.com`;
  
  // Register with ADMIN role
  const res1 = await makeRequest('POST', '/api/auth/register', {
    email,
    password: 'Pass@123',
    full_name: 'Test User',
    role: 'ADMIN'
  });
  console.log('Register response:', JSON.stringify(res1.body, null, 2));

  // Login
  const res2 = await makeRequest('POST', '/api/auth/login', {
    email,
    password: 'Pass@123'
  });
  console.log('\nLogin response:', JSON.stringify(res2.body, null, 2));
  
  // Decode token to see what's inside
  const token = res2.body.data.accessToken;
  const parts = token.split('.');
  if (parts.length === 3) {
    try {
      const decoded = JSON.parse(Buffer.from(parts[1], 'base64'));
      console.log('\nDecoded JWT payload:', JSON.stringify(decoded, null, 2));
    } catch (e) {
      console.log('Error decoding JWT:', e.message);
    }
  }
}

setTimeout(test, 500);
