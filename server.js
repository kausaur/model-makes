const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const ADMIN = path.join(ROOT, 'admin');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ico': 'image/x-icon',
};

http.createServer((req, res) => {
  // Parse URL pathname, ignoring query string
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Handle /admin or /admin/ shortcuts
  if (pathname === '/admin' || pathname === '/admin/') {
    res.writeHead(302, { 'Location': '/admin/admin.html' });
    res.end();
    return;
  }

  // Determine physical base path
  let filePath;
  if (pathname.startsWith('/admin/')) {
    filePath = path.join(ADMIN, pathname.replace(/^\/admin\//, ''));
  } else if (pathname.startsWith('/public/')) {
    filePath = path.join(PUBLIC, pathname.replace(/^\/public\//, ''));
  } else {
    filePath = path.join(PUBLIC, pathname === '/' ? 'index.html' : pathname);
  }

  // Prevent directory traversal attacks
  const safeRoot = ROOT;
  if (!filePath.startsWith(safeRoot)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end(`404 Not Found: ${pathname}`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
    });
    fs.createReadStream(filePath).pipe(res);
  });
}).listen(PORT, () => {
  console.log(`\n  🧊 Model Makes local server running:`);
  console.log(`     👉 Storefront:  http://localhost:${PORT}`);
  console.log(`     👉 Admin Panel: http://localhost:${PORT}/admin/admin.html\n`);
});
