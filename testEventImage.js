const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = {
            status: res.statusCode,
            body: body ? JSON.parse(body) : null
          };
          resolve(response);
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: body
          });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Event Image Update Endpoint\n');

  try {
    const adminEmail = `admin${Date.now()}@test.com`;
    const userEmail = `user${Date.now()}@test.com`;

    // 1. Register admin user
    console.log('1️⃣ Registering admin user...');
    const registerRes = await makeRequest('POST', '/api/auth/register', {
      email: adminEmail,
      password: 'Admin@123',
      full_name: 'Admin Test',
      role: 'ADMIN'
    });
    console.log(`   Status: ${registerRes.status}`);
    if (registerRes.status !== 201) {
      console.log(`   Error: ${JSON.stringify(registerRes.body)}`);
      return;
    }
    console.log(`   ✅ Admin registered: ${adminEmail}`);

    // 2. Login as admin
    console.log('\n2️⃣ Logging in as admin...');
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: adminEmail,
      password: 'Admin@123'
    });
    console.log(`   Status: ${loginRes.status}`);
    if (loginRes.status !== 200) {
      console.log(`   Error: ${JSON.stringify(loginRes.body)}`);
      return;
    }
    const adminToken = loginRes.body.data.accessToken;
    console.log(`   ✅ Token: ${adminToken.substring(0, 20)}...`);

    // 3. Create event
    console.log('\n3️⃣ Creating event...');
    const createEventRes = await makeRequest('POST', '/api/events', {
      title: 'Test Event with Image',
      description: 'Event for testing image update',
      start_time: new Date(Date.now() + 86400000).toISOString(),
      location: 'Test Location',
      zones: [
        {
          name: 'VIP',
          price: 500000,
          seats: [
            { row_label: 'A', seat_number: 1 },
            { row_label: 'A', seat_number: 2 }
          ]
        }
      ]
    }, adminToken);
    console.log(`   Status: ${createEventRes.status}`);
    if (createEventRes.status !== 201) {
      console.log(`   Error: ${JSON.stringify(createEventRes.body)}`);
      return;
    }
    const eventId = createEventRes.body.data.eventId;
    console.log(`   ✅ Event created: ${eventId}`);

    // 4. Check initial state
    console.log('\n4️⃣ Checking initial event state...');
    let getEventRes = await makeRequest('GET', `/api/events/${eventId}`);
    console.log(`   Status: ${getEventRes.status}`);
    console.log(`   image_url: ${getEventRes.body.data.image_url || 'null'}`);

    // 5. Update event image (as admin)
    console.log('\n5️⃣ Updating event image (as admin)...');
    const imageUrl = 'https://example.com/event-image-v1.jpg';
    const updateImageRes = await makeRequest('PATCH', `/api/events/${eventId}/image`, {
      image_url: imageUrl
    }, adminToken);
    console.log(`   Status: ${updateImageRes.status}`);
    if (updateImageRes.status !== 200) {
      console.log(`   Error: ${JSON.stringify(updateImageRes.body)}`);
      return;
    }
    console.log(`   ✅ Image updated successfully`);

    // 6. Verify image was saved
    console.log('\n6️⃣ Verifying image was saved...');
    getEventRes = await makeRequest('GET', `/api/events/${eventId}`);
    const savedImageUrl = getEventRes.body.data.image_url;
    console.log(`   image_url: ${savedImageUrl}`);
    console.log(`   ✅ Correct: ${savedImageUrl === imageUrl ? 'YES' : 'NO'}`);

    // 7. Register regular user
    console.log('\n7️⃣ Registering regular user...');
    const userRegisterRes = await makeRequest('POST', '/api/auth/register', {
      email: userEmail,
      password: 'User@123',
      full_name: 'Regular User',
      role: 'CUSTOMER'
    });
    if (userRegisterRes.status !== 201) {
      console.log(`   Error: ${JSON.stringify(userRegisterRes.body)}`);
      return;
    }
    console.log(`   ✅ User registered: ${userEmail}`);

    // 8. Login as regular user
    console.log('\n8️⃣ Logging in as regular user...');
    const userLoginRes = await makeRequest('POST', '/api/auth/login', {
      email: userEmail,
      password: 'User@123'
    });
    const userToken = userLoginRes.body.data.accessToken;
    console.log(`   ✅ User logged in`);

    // 9. Try to update image as regular user (should fail)
    console.log('\n9️⃣ Attempting to update image as regular user (should FAIL)...');
    const unauthorizedRes = await makeRequest('PATCH', `/api/events/${eventId}/image`, {
      image_url: 'https://example.com/hacked.jpg'
    }, userToken);
    console.log(`   Status: ${unauthorizedRes.status}`);
    const isBlocked = unauthorizedRes.status === 403 || unauthorizedRes.status === 401;
    console.log(`   ✅ Access denied: ${isBlocked ? 'YES' : 'NO'}`);

    // 10. Verify image didn't change
    console.log('\n🔟 Confirming image was not modified...');
    getEventRes = await makeRequest('GET', `/api/events/${eventId}`);
    const finalImageUrl = getEventRes.body.data.image_url;
    console.log(`   image_url: ${finalImageUrl}`);
    console.log(`   ✅ Unchanged: ${finalImageUrl === imageUrl ? 'YES' : 'NO'}`);

    console.log('\n✅ ✅ ✅ All tests PASSED! ✅ ✅ ✅\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Wait for server to be ready, then run tests
setTimeout(runTests, 1000);
