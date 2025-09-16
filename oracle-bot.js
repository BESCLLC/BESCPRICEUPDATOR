import 'dotenv/config';
import axios from 'axios';
import { ethers } from 'ethers';
import OracleAbi from './abi/SimpleOracleForPredictionV3.json' assert { type: "json" };

const {
  RPC_URL,
  ORACLE_ADDRESS,
  PRIVATE_KEY,
  ASSET = 'binancecoin',
  INTERVAL = 60000,
} = process.env;

if (!RPC_URL || !ORACLE_ADDRESS || !PRIVATE_KEY) {
  throw new Error('Missing RPC_URL, ORACLE_ADDRESS, or PRIVATE_KEY in .env');
}

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const oracle = new ethers.Contract(ORACLE_ADDRESS, OracleAbi, wallet);

async function fetchPrice() {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ASSET}&vs_currencies=usd`;
  const res = await axios.get(url);
  const price = res.data?.[ASSET]?.usd;
  if (!price) throw new Error('Failed to fetch price');
  return BigInt(Math.round(price * 1e8)); // scale to 1e8
}

async function updateOracle() {
  try {
    const price = await fetchPrice();
    console.log(`[oracle-bot] Price: ${Number(price) / 1e8} USD`);
    const tx = await oracle.updatePrice(price);
    console.log(`[oracle-bot] Tx sent: ${tx.hash}`);
    await tx.wait();
    console.log(`[oracle-bot] ✅ Tx confirmed`);
  } catch (err) {
    console.error(`[oracle-bot] ❌ Error:`, err.message);
  }
}

console.log(`[oracle-bot] Starting for ${ASSET.toUpperCase()}...`);
updateOracle();
setInterval(updateOracle, Number(INTERVAL));
