const http = require('http');

function testSwagger() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api-docs/',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log('Headers:', res.headers);
    
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ Swagger UI is working!');
        console.log('First 500 chars:', body.substring(0, 500));
      } else {
        console.log('Response body:', body.substring(0, 500));
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Error:', e.message);
  });

  req.end();
}

setTimeout(testSwagger, 500);
