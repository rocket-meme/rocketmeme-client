import net from 'net';
import path from 'path';
import { VersionedTransaction } from '@solana/web3.js';

/* ============================ Internal Local Sockets ============================ */

const SOCKET_PATH =
  process.platform === 'win32'
    ? '\\\\.\\pipe\\rocketmeme_transaction_handler_socket'
    : path.resolve('/tmp', 'rocketmeme_transaction_handler_socket.sock');

// Check if transaction handler process is running
function connectToSocketServer(socketPath) {
  return new Promise((resolve) => {
    const client = net.createConnection({ path: socketPath });

    client.on('connect', () => {
      client.end();
      resolve(true);
    });

    client.on('error', () => resolve(false));
  });
}

/* ============================ Fetch Rocketmeme API ============================ */


async function fetchTransactionInstructions(action, details) {
  const socketServer = await connectToSocketServer(SOCKET_PATH);
  if (!socketServer) {
    throw new Error(
      `Transaction handler process is not running. Please establish connection to rocketmeme server by using the command:
      node utils/rocketmeme-persistent-connection.js --server https://trade.rocketmeme.io`
    );
  }

  return new Promise((resolve, reject) => {
    const client = net.createConnection({ path: SOCKET_PATH }, () => {
      client.write(JSON.stringify({ action, details }));
    });

    client.on('data', (data) => {
      const response = JSON.parse(data);
      if (response.status === 'success') {
        resolve(response.response);
      } else {
        reject(new Error(response.message));
      }
      client.end();
    });

    client.on('error', (err) => reject(new Error(`Connection error: ${err.message}`)));
  });
}

/* ============================ Handling and Signing Rocketmeme API Requests ============================ */

export async function getDeserializedTransactionInstructions(config) {
    const rawTransaction = await fetchTransactionInstructions(config.ACTION, config.TRANSACTION_DETAILS);
    const transaction = VersionedTransaction.deserialize(new Uint8Array(Buffer.from(rawTransaction['response'])));
  return transaction;
}