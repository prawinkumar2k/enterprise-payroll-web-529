import http from 'http';

const options = {
  hostname: 'localhost',
  port: 5005,
  path: '/api/health',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('Testing health endpoint...');
console.log('Connecting to:', `http://${options.hostname}:${options.port}${options.path}`);

const req = http.request(options, (res) => {
  console.log('Status:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Response headers:', res.headers);
    try {
      const json = JSON.parse(data);
      console.log('Response:', JSON.stringify(json, null, 2));
    } catch(e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
  console.error('Error code:', e.code);
});

req.end();