import http2 from 'http2';
import net from 'net';
import path from 'path';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

/* ============================ Internal Local Sockets ============================ */

const SOCKET_PATH =
  process.platform === 'win32'
    ? '\\\\.\\pipe\\rocketmeme_transaction_handler_socket'
    : path.resolve('/tmp', 'rocketmeme_transaction_handler_socket.sock');

/* ============================ Parse Command-Line Arguments ============================ */

const { server: serverUrl } = yargs(hideBin(process.argv))
  .option('server', {
    alias: 's',
    type: 'string',
    description: 'The server URL for the persistent connection',
    demandOption: true,
  }).argv;

let client;
let serverDown = false;

/* ============================ Internal Socket Server ============================ */

console.log('⏳ Awaiting socket connection...');
const server = net.createServer((socket) => {
  console.log('✅ Socket connection established.');
  
  socket.on('data', async (data) => {
    try {
      const { action, details } = JSON.parse(data);
      const response = await getTransactionInstruction(action, details);
      socket.write(JSON.stringify({ status: 'success', response }));
    } catch (err) {
      console.error('❌ Transaction error:', err.message);
      socket.write(JSON.stringify({ status: 'error', message: err.message }));
    }
  });

  socket.on('error', (err) => console.error('Socket error:', err.message));
});

server.listen(SOCKET_PATH, () => {
  console.log('✅ Listening to Internal Socket');
  connectToServer();
});

/* ============================ Establish HTTP/2 Connection ============================ */
const connectToServer = () => {
  console.log('⏳ Attempting to connect to Rocketmeme... please hold on.');
  if (client) client.destroy();

  try {
    client = http2.connect(serverUrl);
    client.on('error', (err) => console.error('❌ HTTP/2 error:', err.message));
    client.on('connect', () => {
      serverDown = false;
      console.log('✅ Established connection to Rocketmeme server.');
    });
    client.on('close', () => handleShutdown('HTTP/2 client closed. Please restart connection'));
  } catch (err) {
    console.error(`❌ HTTP/2 connection failed: ${err.message}`);
  }
};

/* ============================ Transaction Request Handling ============================ */

const getTransactionInstruction = (action, details) => {
  if (serverDown) return Promise.reject(new Error('❌ Server is unavailable.'));
  return new Promise((resolve, reject) => {
    const req = client.request({
      ':method': 'POST',
      ':path': `/${action}`,
      'Content-Type': 'application/json',
    });

    let responseData = '';

    req.on('data', (chunk) => (responseData += chunk));
    req.on('end', () => {
      try {
        const response = JSON.parse(responseData);
        response.error ? reject(new Error(response.error)) : resolve(response);
      } catch (err) {
        reject(new Error(`❌ Failed to parse response: ${err.message}`));
      }
    });

    req.on('error', reject);
    req.write(JSON.stringify(details));
    req.end();
  });
};

/* ============================ Error Handling & Shutdown ============================ */

const handleShutdown = (message) => {
  console.error(`🚨 Shutdown: ${message}`);
  serverDown = true;
  if (client) client.close();
  server.close(() => process.exit(0));
};

server.on('error', (err) => {
  handleShutdown(err.code === 'EADDRINUSE' ? 'Socket already in use.' : `❌ Net error: ${err.message}`);
});

/* ============================ Signal Handling for Cleanup ============================ */

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);

if (process.platform === 'win32') {
  process.on('exit', () => {
    try {
      server.close();
    } catch (err) {
      console.error('Pipe close error:', err.message);
    }
  });
}
