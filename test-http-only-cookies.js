/**
 * Test HttpOnly Cookies Cross-Domain
 * Test để kiểm tra cookies được lưu và gửi đúng cách giữa Frontend/Backend khác domain
 * 
 * Chạy: node test-http-only-cookies.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:5173'; // Frontend URL (khác domain)

// Test data
const testUser = {
  email: 'cookietest@example.com',
  password: 'TestPassword123',
  full_name: 'Cookie Test User'
};

let savedCookie = null; // Lưu cookie từ login response

/**
 * Helper: Thực hiện HTTP Request
 */
function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL, // ✅ Tính POST header: Origin để CORS biết đây là cross-domain
        ...headers
      }
    };

    // Thêm Cookie nếu đã có (từ lần login trước)
    if (savedCookie) {
      options.headers['Cookie'] = savedCookie;
    }

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null,
            setCookie: res.headers['set-cookie'] // Lấy Set-Cookie header
          };

          // Lưu lại cookie từ Set-Cookie header (giả lập browser behavior)
          if (res.headers['set-cookie']) {
            const cookies = Array.isArray(res.headers['set-cookie']) 
              ? res.headers['set-cookie'] 
              : [res.headers['set-cookie']];
            
            // Lấy jwt cookie
            const jwtCookie = cookies.find(c => c.includes('jwt='));
            if (jwtCookie) {
              // Chỉ lấy phần cookie, loại bỏ attributes
              savedCookie = jwtCookie.split(';')[0];
              console.log(`\n✅ Cookie đã được lưu: ${savedCookie}`);
            }
          }

          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

/**
 * Test 1: Đăng ký tài khoản
 */
async function testRegister() {
  console.log('\n📝 TEST 1: ĐĂNG KÝ TÀI KHOẢN');
  console.log('═'.repeat(60));

  try {
    const response = await makeRequest('POST', '/api/auth/register', testUser);
    
    console.log(`Status: ${response.statusCode}`);
    console.log(`Response: ${JSON.stringify(response.body, null, 2)}`);
    
    if (response.setCookie) {
      console.log(`✅ Set-Cookie Header: ${response.setCookie}`);
      console.log('✅ HttpOnly Cookie đã được tạo!');
    }

    return response.statusCode === 201;
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    return false;
  }
}

/**
 * Test 2: Đăng nhập
 */
async function testLogin() {
  console.log('\n🔐 TEST 2: ĐĂNG NHẬP (và nhận Cookie)');
  console.log('═'.repeat(60));

  try {
    const response = await makeRequest('POST', '/api/auth/login', {
      email: testUser.email,
      password: testUser.password
    });

    console.log(`Status: ${response.statusCode}`);
    console.log(`Response user: ${JSON.stringify(response.body.data?.user, null, 2)}`);

    if (response.setCookie) {
      console.log(`\n✅ Set-Cookie Header nhận được:`);
      console.log(response.setCookie);
      console.log('\n📌 Cookie Details:');
      
      const cookieStr = Array.isArray(response.setCookie) 
        ? response.setCookie[0] 
        : response.setCookie;
      
      // Parse cookie attributes
      if (cookieStr.includes('HttpOnly')) console.log('   ✅ HttpOnly: YES (XSS protection)');
      if (cookieStr.includes('Secure')) console.log('   ✅ Secure: YES (HTTPS only)');
      if (cookieStr.includes('SameSite=None')) console.log('   ✅ SameSite=None: YES (Cross-domain allowed)');
    }

    return response.statusCode === 200;
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    return false;
  }
}

/**
 * TEST 3: Kiểm tra Profile (sử dụng Cookie tự động)
 */
async function testProfileWithCookie() {
  console.log('\n👤 TEST 3: LẤY PROFILE (sử dụng Cookie tự động)');
  console.log('═'.repeat(60));

  if (!savedCookie) {
    console.log('❌ Không có cookie để gửi. Hãy đăng nhập trước!');
    return false;
  }

  try {
    console.log(`📨 Gửi request với Cookie: ${savedCookie}`);
    
    const response = await makeRequest('GET', '/api/users/me', null, {
      'Authorization': 'Bearer ' // Browser sẽ tự động gửi cookie, nhưng chúng ta vẫn có thể gửi Bearer token nếu cần
    });

    console.log(`Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log('✅ Profile được lấy thành công (Cookie hoạt động!)');
      console.log(`User: ${JSON.stringify(response.body.data, null, 2)}`);
    } else {
      console.log(`❌ Lỗi: ${response.body?.message}`);
    }

    return response.statusCode === 200;
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    return false;
  }
}

/**
 * TEST 4: Đăng xuất
 */
async function testLogout() {
  console.log('\n🚪 TEST 4: ĐĂNG XUẤT (Clear Cookie)');
  console.log('═'.repeat(60));

  try {
    const response = await makeRequest('POST', '/api/auth/logout');

    console.log(`Status: ${response.statusCode}`);
    
    if (response.setCookie) {
      console.log(`✅ Logout Set-Cookie Header: ${response.setCookie}`);
      console.log('✅ Cookie đã bị xóa (hoặc hết hạn)');
    }

    savedCookie = null; // Clear saved cookie
    return response.statusCode === 200;
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    return false;
  }
}

/**
 * TEST 5: Test CORS Headers
 */
async function testCORSHeaders() {
  console.log('\n🌐 TEST 5: KIỂM TRA CORS HEADERS');
  console.log('═'.repeat(60));

  try {
    const response = await makeRequest('OPTIONS', '/api/auth/login', null, {
      'Access-Control-Request-Method': 'POST'
    });

    console.log(`Status: ${response.statusCode}`);
    console.log('\nCORS Headers:');
    console.log(`  - Access-Control-Allow-Origin: ${response.headers['access-control-allow-origin']}`);
    console.log(`  - Access-Control-Allow-Credentials: ${response.headers['access-control-allow-credentials']}`);
    console.log(`  - Access-Control-Allow-Methods: ${response.headers['access-control-allow-methods']}`);
    console.log(`  - Access-Control-Allow-Headers: ${response.headers['access-control-allow-headers']}`);

    const hasCredentials = response.headers['access-control-allow-credentials'] === 'true';
    if (hasCredentials) {
      console.log('\n✅ CORS credentials được cho phép!');
    } else {
      console.log('\n❌ CORS credentials KHÔNG được cho phép!');
    }

    return hasCredentials;
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    return false;
  }
}

/**
 * Main Test Suite
 */
async function runAllTests() {
  console.log('\n');
  console.log('╔' + '═'.repeat(58) + '╗');
  console.log('║' + ' HttpOnly Cookie Cross-Domain Test Suite'.padEnd(59) + '║');
  console.log('║' + ` Backend: ${BASE_URL}`.padEnd(59) + '║');
  console.log('║' + ` Frontend: ${FRONTEND_URL}`.padEnd(59) + '║');
  console.log('╚' + '═'.repeat(58) + '╝');

  const results = {
    corsHeaders: await testCORSHeaders(),
    register: await testRegister(),
    login: await testLogin(),
    profileWithCookie: await testProfileWithCookie(),
    logout: await testLogout()
  };

  // Summary
  console.log('\n');
  console.log('╔' + '═'.repeat(58) + '╗');
  console.log('║' + ' TỔNG HỢP KẾT QUẢ'.padEnd(59) + '║');
  console.log('╠' + '═'.repeat(58) + '╣');
  console.log(`║ CORS Headers: ${results.corsHeaders ? '✅ PASS' : '❌ FAIL'}`.padEnd(59) + '║');
  console.log(`║ Đăng ký tài khoản: ${results.register ? '✅ PASS' : '❌ FAIL'}`.padEnd(59) + '║');
  console.log(`║ Đăng nhập: ${results.login ? '✅ PASS' : '❌ FAIL'}`.padEnd(59) + '║');
  console.log(`║ Lấy Profile với Cookie: ${results.profileWithCookie ? '✅ PASS' : '❌ FAIL'}`.padEnd(59) + '║');
  console.log(`║ Đăng xuất: ${results.logout ? '✅ PASS' : '❌ FAIL'}`.padEnd(59) + '║');
  console.log('╚' + '═'.repeat(58) + '╝\n');

  const allPassed = Object.values(results).every(r => r);
  console.log(allPassed ? '🎉 TẤT CẢ TEST ĐẠT!' : '⚠️  CÓ TEST KHÔNG ĐẠT');
}

// Chạy tests
runAllTests().catch(console.error);
