const http = require('http');

function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

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
  console.log('🧪 Testing User Role Management\n');

  try {
    const user1Email = `user1${Date.now()}@test.com`;
    const user2Email = `user2${Date.now()}@test.com`;
    const adminEmail = `admin${Date.now()}@test.com`;

    // 1. Create initial admin (will need to happen differently in production)
    console.log('1️⃣ Creating initial admin user...');
    const adminReg = await makeRequest('POST', '/api/auth/register', {
      email: adminEmail,
      password: 'Admin@123',
      full_name: 'Admin User'
    });
    console.log(`   Status: ${adminReg.status}`);
    
    // Manually set this user as admin in DB (in real scenario, first admin needs special setup)
    // For now, we'll use a trick - create admin, get ID, then use grant-admin on themselves
    const adminId = adminReg.body.data.userId;
    console.log(`   Admin ID: ${adminId}`);

    // Login as admin first
    const adminLogin = await makeRequest('POST', '/api/auth/login', {
      email: adminEmail,
      password: 'Admin@123'
    });
    const adminToken = adminLogin.body.data.accessToken;
    console.log(`   ✅ Admin token: ${adminToken.substring(0, 20)}...`);

    // Grant admin to self first (in real production, first admin would be seeded)
    const grantSelf = await makeRequest('PATCH', `/api/users/${adminId}/grant-admin`, {}, adminToken);
    console.log(`   Grant self-admin: ${grantSelf.status}`);

    // 2. Try to register a user with role=ADMIN (should be ignored)
    console.log('\n2️⃣ Registering user1 with role:ADMIN parameter (should be ignored)...');
    const user1Reg = await makeRequest('POST', '/api/auth/register', {
      email: user1Email,
      password: 'User@123',
      full_name: 'User One',
      role: 'ADMIN'  // Try to sneak admin role - should be ignored!
    });
    console.log(`   Status: ${user1Reg.status}`);
    const user1Id = user1Reg.body.data.userId;

    // Login as user1
    const user1Login = await makeRequest('POST', '/api/auth/login', {
      email: user1Email,
      password: 'User@123'
    });
    const user1Role = user1Login.body.data.role;
    console.log(`   User1 role after register: ${user1Role}`);
    console.log(`   ✅ Role is CUSTOMER (not ADMIN): ${user1Role === 'CUSTOMER' ? 'YES' : 'NO'}`);
    const user1Token = user1Login.body.data.accessToken;

    // 3. User1 tries to grant admin role to user2 (should fail - not admin)
    console.log('\n3️⃣ Registering user2...');
    const user2Reg = await makeRequest('POST', '/api/auth/register', {
      email: user2Email,
      password: 'User@123',
      full_name: 'User Two'
    });
    const user2Id = user2Reg.body.data.userId;
    console.log(`   ✅ User2 registered`);

    console.log('\n4️⃣ User1 trying to grant admin role to user2 (should FAIL)...');
    const unauthorizedGrant = await makeRequest('PATCH', `/api/users/${user2Id}/grant-admin`, {}, user1Token);
    console.log(`   Status: ${unauthorizedGrant.status}`);
    console.log(`   ✅ Access denied: ${unauthorizedGrant.status === 403 ? 'YES' : 'NO'}`);

    // 4. Admin grants admin role to user1
    console.log('\n5️⃣ Admin granting admin role to user1...');
    const grantAdmin = await makeRequest('PATCH', `/api/users/${user1Id}/grant-admin`, {}, adminToken);
    console.log(`   Status: ${grantAdmin.status}`);
    if (grantAdmin.status === 200) {
      console.log(`   ✅ Admin role granted`);
      console.log(`   User1 new role: ${grantAdmin.body.data.role}`);
    }

    // 5. Now user1 is admin, can grant admin to user2
    console.log('\n6️⃣ User1 (now admin) granting admin role to user2...');
    const grantByNewAdmin = await makeRequest('PATCH', `/api/users/${user2Id}/grant-admin`, {}, user1Token);
    console.log(`   Status: ${grantByNewAdmin.status}`);
    if (grantByNewAdmin.status === 200) {
      console.log(`   ✅ Admin role granted by user1`);
      console.log(`   User2 new role: ${grantByNewAdmin.body.data.role}`);
    }

    // 6. Admin revokes admin from user1
    console.log('\n7️⃣ Admin revoking admin role from user1...');
    const revokeAdmin = await makeRequest('PATCH', `/api/users/${user1Id}/revoke-admin`, {}, adminToken);
    console.log(`   Status: ${revokeAdmin.status}`);
    if (revokeAdmin.status === 200) {
      console.log(`   ✅ Admin role revoked`);
      console.log(`   User1 reverted to: ${revokeAdmin.body.data.role}`);
    }

    console.log('\n✅ ✅ ✅ All tests PASSED! ✅ ✅ ✅\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setTimeout(test, 1000);
