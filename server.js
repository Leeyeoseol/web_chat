const http = require('http');
const fs = require('fs');
const path = require('path');

const HOST = 'localhost';
const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.resolve(__dirname);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

function send(res, statusCode, body, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(statusCode, { 'Content-Type': contentType });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, 'Method Not Allowed');
  }

  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
  } catch {
    return send(res, 400, 'Bad Request');
  }

  // 요청 경로가 서비스 디렉터리 밖으로 벗어나지 않도록 검사합니다.
  const requestedPath = path.resolve(PUBLIC_DIR, `.${urlPath}`);
  if (requestedPath !== PUBLIC_DIR && !requestedPath.startsWith(`${PUBLIC_DIR}${path.sep}`)) {
    return send(res, 403, 'Forbidden');
  }

  fs.stat(requestedPath, (statError, stats) => {
    if (statError) return send(res, 404, 'Not Found');

    const filePath = stats.isDirectory() ? path.join(requestedPath, 'index.html') : requestedPath;
    fs.readFile(filePath, (readError, data) => {
      if (readError) return send(res, 404, 'Not Found');

      const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      if (req.method === 'HEAD') return res.end();
      res.end(data);
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Static server running at http://${HOST}:${PORT}`);
  console.log(`Serving directory: ${PUBLIC_DIR}`);
});
