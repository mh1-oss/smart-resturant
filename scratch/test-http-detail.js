const http = require('http');

http.get('http://localhost:3000/menu/11', (res) => {
  console.log('Status Code:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Body length:', data.length);
    console.log('First 500 chars:', data.substring(0, 500));
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
