require('dotenv').config();
const http = require('http');
const app = require('./app');

const server = http.createServer(app);
const PORT = process.env.EVENT_CATALOG_PORT || 3030;

server.listen(PORT, () => {
  console.log('\n[Event Catalog Service] danh cho: events, categories, admin analytics');
  console.log('[Event Catalog Service] PORT: '+PORT);
  console.log('[Event Catalog Service] Health: /health\n');
});

const shutdown = (signal) => {
  console.log('\nTin hieu '+signal+' nhan duoc. Dang tat Event Catalog Service...');
  server.close(() => {
    console.log('Event Catalog Service da tat.');
    process.exit(0);
  });
};

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
