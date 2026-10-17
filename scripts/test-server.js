const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'public');

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(root, reqPath);

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    return;
  }

  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(3333, async () => {
  console.log('Server listening on http://localhost:3333');

  const urls = [
    '/',
    '/data/products.json',
    '/js/app.js',
    '/js/products.js',
    '/js/cart.js',
    '/js/lightbox.js',
    '/js/theme.js',
    '/css/base.css',
    '/css/layout.css',
    '/css/components.css',
    '/assets/images/dragon-figurine-1.svg'
  ];

  let allSuccess = true;
  for (const u of urls) {
    try {
      const resp = await fetch('http://localhost:3333' + u);
      const text = await resp.text();
      console.log(`URL ${u}: ${resp.status} (${text.length} bytes, ${resp.headers.get('content-type')})`);
      if (resp.status !== 200) allSuccess = false;
    } catch (e) {
      console.error(`Failed ${u}:`, e);
      allSuccess = false;
    }
  }

  server.close(() => {
    console.log(allSuccess ? 'ALL HTTP ENDPOINTS VERIFIED SUCCESSFULLY!' : 'SOME ENDPOINTS FAILED');
    process.exit(allSuccess ? 0 : 1);
  });
});
