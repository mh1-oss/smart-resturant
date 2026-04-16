const http = require('http');

http.get('http://localhost:3000/menu/11', (res) => {
  console.log('Status Code:', res.statusCode);
  res.on('data', (chunk) => {
    console.log('Got data');
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
