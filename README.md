# 🚀 RocketMeme Trading API

A Solana-based trading API for Raydium and pumpFun meme coins, integrating **persistent-stream** and **standard-request** modules to execute transactions through RocketMeme.io API.

---

## 📌 Overview

Have a trading strategy or want to build your own bot? Our **[API](https://rocketmeme.io/)** handles transactions, so you can focus on strategy and execution. We offers two execution approaches:

1. **Persistent Stream (persistent-stream)**:

   - Maintains a persistent **HTTP/2** connection to RocketMeme's API.
   - Uses **Unix sockets** or **Windows named pipes** for efficient inter-process communication.
   - Best suited for **high-frequency** trading.
   - Recommended for ultra-low latency

2. **Standard Request (standard-request)**:

   - Makes individual **HTTP POST requests** for each trade.
   - Simpler to use but has a slight overhead due to HTTP session initialization.

💡 **Alternative Execution Method:** You can also execute your trades seamlessly through our **[RocketMeme Web App](https://app.rocketmeme.io/)**, providing a user-friendly and efficient way to trade directly from your browser. For more details, refer to our **[Web App Documentation](https://rocketmeme.io/docs)**.

---

## 📊 Differences Between persistent-stream & standard-request

| Feature              | Persistent Stream (persistent-stream) | Standard Request (standard-request)   |
| -------------------- | --------------------------------------- | --------------------------------------- |
| **Connection Type**  | Persistent **HTTP/2 + Socket**          | Simple **HTTP Request**                 |
| **Latency**          | Lower latency (pre-established)         | Slightly higher (new request each time) |
| **Use Case**         | High-frequency, automated trading       | Low-frequency, manual trading           |
| **Error Handling**   | Handles API downtime efficiently        | New request needed if API fails         |
| **System Resources** | Uses more RAM (persistent socket)       | Lightweight, stateless requests         |

---

## ⚙️ Configuration Parameters

| Parameter   | Description | Example Values |
|------------|-------------|---------------|
| **WALLET** | Solana Wallet Private Key In base58 | 'tk4AWsDP...FEks28' |
| **RPC_URL** | Your RPC URL | 'https://mainnet.helius-rpc.com/?api-key=8c...' |
| **ACTION** | 'buy' or 'sell' | 'buy' |
| **publicKey** | Wallet public key (auto-filled based on your private key) | '5YET...6ydu' |
| **mint** | The token's mint address for the transaction | '5c3h...pump' |
| **type** | Amount type: 'number' for a fixed SOL amount or '%' for a percentage of wallet balance ('%' is only available when selling) | 'number' |
| **amount** | Amount of SOL or percentage of balance for the transaction | 0.02 |
| **slippage** | Acceptable slippage in percentage (range: 0–50) | 10 |
| **priorityFees** | Additional SOL fee to prioritize the transaction | 0.008 |
| **market** | 'pumpfun' or 'raydium' | 'raydium' |

---

## 📦 Requirements

To use RocketMeme Trading Bot, ensure you have the following:

- **Node.js** (v20.8 or later)
- **npm or yarn** package manager
- **Access to a Solana RPC endpoint**
- **Solana Wallet**

---

## 💰 Fees

Our trading fee is set at a low rate of **0.4%** of the original trading amount, making it one of the most competitive fees in the market. With this minimal cost, you can maximize your returns while leveraging our reliable and efficient API.

---

## 🚀 How to Execute

#### **Step 1: Clone the Repository**
sh
git clone https://github.com/rocket-meme/rocketmeme-client.git
cd rocketmeme-client
npm install


### 1️⃣ Persistent Stream (Long-Lived Connection)

The persistent-stream module establishes a **long-lived** connection and efficiently handles transactions.

#### **Step 2: Start the Persistent Connection**
sh
node persistent-stream/utils/rocketmeme-persistent-connection.js --server https://trade.rocketmeme.io


- This connects to RocketMeme's trading server and listens for requests.

#### **Step 3: [Update your configurations](#️-configuration-parameters)**
sh
node persistent-stream/persistent-client.js


- This sends a trade request using the **persistent socket**.
- Best for **ultra-low latency** trading.

---

### 2️⃣ Standard Request (One-Time Execution)

The standard-request module makes a **single HTTP request per transaction**.

#### **[Update your configurations](#️-configuration-parameters)**
sh
node standard-request/standard-client.js


- No need to establish a persistent connection.

---

🚀 **Happy Trading!**
