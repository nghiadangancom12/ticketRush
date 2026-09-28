require('dotenv').config();
const http = require('http');
const app = require('./app');

const server = http.createServer(app);
const PORT = process.env.QUEUE_PORT || 3001;

server.listen(PORT, () => {
  console.log('\n[Virtual Queue Service] danh cho: join, heartbeat, queue turn status');
  console.log('[Virtual Queue Service] PORT: '+PORT);
  console.log('[Virtual Queue Service] Health: /health\n');
});

const shutdown = (signal) => {
  console.log('\nTin hieu '+signal+' nhan duoc. Dang tat Virtual Queue Service...');
  server.close(() => {
    console.log('Virtual Queue Service da tat.');
    process.exit(0);
  });
};

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
