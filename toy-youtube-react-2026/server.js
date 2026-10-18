import { createServer } from 'node:http';
import { GET } from './api/videos.js';

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:3001');

  if (url.pathname !== '/api/videos') {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }

  if (req.method !== 'GET') {
    res.writeHead(405, { Allow: 'GET' });
    res.end('Method Not Allowed');
    return;
  }

  try {
    const request = new Request(url);
    const response = await GET(request);

    res.writeHead(
      response.status,
      Object.fromEntries(response.headers),
    );

    res.end(await response.text());
  } catch (error) {
    console.error(error);
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

server.listen(3001, 'localhost', () => {
  console.log('API 서버: http://localhost:3001');
});
