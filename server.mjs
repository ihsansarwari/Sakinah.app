import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = new URL('./', import.meta.url);
const files = { '/src/discovery.js': ['src/discovery.js', 'text/javascript'], '/src/food-photos.js': ['src/food-photos.js', 'text/javascript'], '/': ['index.html', 'text/html'], '/src/app.js': ['src/app.js', 'text/javascript'], '/src/style.css': ['src/style.css', 'text/css'], '/src/data.js': ['src/data.js', 'text/javascript'], '/src/catalog.js': ['src/catalog.js', 'text/javascript'], '/data/restaurants.osm.json': ['data/restaurants.osm.json', 'application/json'] };
http.createServer(async (req, res) => {
  const file = files[new URL(req.url, 'http://localhost').pathname];
  if (!file) { res.writeHead(404); res.end('Ikke fundet'); return; }
  try { const body = await readFile(fileURLToPath(new URL(file[0], root))); res.writeHead(200, {'Content-Type': `${file[1]}; charset=utf-8`, 'X-Content-Type-Options': 'nosniff'}); res.end(body); }
  catch { res.writeHead(500); res.end('Kunne ikke indlæse siden'); }
}).listen(Number(process.env.PORT || 3000), '0.0.0.0', () => console.log('GOOD kører på port ' + (process.env.PORT || 3000)));
