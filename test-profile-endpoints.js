const axios = require('axios');

const API = 'http://localhost:3000/api';

// Generate unique email for testing
const testEmail = `test-${Date.now()}@example.com`;
const testPassword = 'Test123!@#';

async function runTests() {
  try {
    console.log('\n========== TESTING PROFILE ENDPOINTS ==========\n');

    // 1. Register new user
    console.log('1️⃣ REGISTER - Creating new user...');
    const registerRes = await axios.post(`${API}/auth/register`, {
      email: testEmail,
      password: testPassword,
      full_name: 'Test User',
      date_of_birth: '1990-01-15',
      gender: 'MALE'
    });
    console.log('✅ Registration successful');
    console.log('Response:', JSON.stringify(registerRes.data, null, 2));

    // 2. Login
    console.log('\n2️⃣ LOGIN - Getting authentication token...');
    const loginRes = await axios.post(`${API}/auth/login`, {
      email: testEmail,
      password: testPassword
    });
    const token = loginRes.data.data.accessToken;
    const userId = loginRes.data.data.id;
    const role = loginRes.data.data.role;
    console.log('✅ Login successful');
    console.log(`Token: ${token}`);
    console.log(`User ID: ${userId}`);
    console.log(`Role: ${role}`);
    console.log('Response:', JSON.stringify(loginRes.data, null, 2));

    // 3. Get profile (GET /me)
    console.log('\n3️⃣ GET PROFILE - Fetching user profile with /me...');
    const profileRes = await axios.get(`${API}/customers/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ GET /me successful');
    console.log('Profile Data:', JSON.stringify(profileRes.data.data.profile, null, 2));
    console.log('Orders:', profileRes.data.data.orders.length, 'orders found');
    console.log('Locked Seats:', profileRes.data.data.lockedSeats.length, 'locked seats found');

    // 4. Update profile (PATCH /me)
    console.log('\n4️⃣ UPDATE PROFILE - Updating user profile with /me...');
    const updateRes = await axios.patch(`${API}/customers/me`, {
      full_name: 'Updated Test User',
      gender: 'FEMALE',
      avatar_url: 'https://example.com/avatar.jpg'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ PATCH /me successful');
    console.log('Updated Profile:', JSON.stringify(updateRes.data.data, null, 2));

    // 5. Verify update (GET /me again)
    console.log('\n5️⃣ VERIFY UPDATE - Checking if profile was updated...');
    const verifyRes = await axios.get(`${API}/customers/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Verification GET /me successful');
    console.log('Current Profile:', JSON.stringify(verifyRes.data.data.profile, null, 2));

    // 6. Test without token
    console.log('\n6️⃣ ERROR TEST - Calling /me without token...');
    try {
      await axios.get(`${API}/customers/me`);
      console.log('❌ Test FAILED - Should have thrown error');
    } catch (err) {
      console.log('✅ Correctly rejected request without token');
      console.log('Error:', err.response.data.message);
    }

    console.log('\n========== ALL TESTS COMPLETED ✅ ==========\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

runTests();
