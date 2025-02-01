import { getDeserializedTransactionInstructions } from './utils/rocketmeme-tx-utils.js';
import { Connection, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

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

/* ============================ Processing Rocketm API Fetch Request ============================ */

(async () => {
    try {

      // Get and Sign Transaction Instructions
      const transaction = await getDeserializedTransactionInstructions(CONFIG);
      transaction.sign([WALLET])
      
      // Sending Transaction Using Trader's RPC
      const txSignature = await RPC_CONNECTION.sendTransaction(transaction, {
        skipPreflight: true
      });
      console.log(`Transaction signature: https://solscan.io/tx/${txSignature}`);
      
    } catch (error) {
      console.error(error.message);
  }
})();