import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';
import got from 'got'; // for HTTPS/2 Request


/* ============================ Configurations ============================ */

const WALLET = Keypair.fromSecretKey(bs58.decode('tk4AWsDP...FEks28'));
const RPC_CONNECTION = new Connection(
  'https://mainnet.helius-rpc.com/?api-key=8c...',
  'confirmed');
const CONFIG = {
  TRANSACTION_DETAILS: {
    publicKey: WALLET.publicKey,
    mint: '5c3h...pump',
    type: 'number',
    amount: 0.02,
    slippage: 10,
    priorityFees: 0.008,
    market: 'raydium'
  },
  ACTION: 'buy'
};

/* ============================ Rocketmeme API ============================ */

async function getTransactionInstructions() {
  try {
    const url = `https://trade.rocketmeme.io/${CONFIG.ACTION}`;
    const response = await got.post(url, {
      json: CONFIG.TRANSACTION_DETAILS,
      headers: { 'Content-Type': 'application/json' },
      http2: true,
      responseType: 'json'
    });

    return response.body;
  } catch (error) {
    console.error('Error in API:', error.response?.body || error.message);
  }
}

/* ============================ Processing Rocketmeme API Fetch Request ============================ */

try {

  const rawTransaction = await getTransactionInstructions()
  const transactionBuffer = Buffer.from(rawTransaction['response']);
  const transaction = VersionedTransaction.deserialize(new Uint8Array(transactionBuffer));
  
  // Sign the transaction
  transaction.sign([WALLET]);

  // Send the signed transaction
  const txSignature = await RPC_CONNECTION.sendTransaction(transaction, {
    skipPreflight: true
  }); 
  console.log(`Transaction signature: https://solscan.io/tx/${txSignature}`);
} catch (error) {
  console.error('Error during transaction process:', error);
}
