import { TronWeb } from 'tronweb';
import { BLOCKCHAIN_CONFIG, getNetworkUrl, getUsdtContractAddress } from '../config/blockchain.js';

// Initialize TronWeb
const fullHost = getNetworkUrl();
const USDT_CONTRACT_ADDRESS = getUsdtContractAddress();

const tronWeb = new TronWeb({
  fullHost: fullHost,
  headers: BLOCKCHAIN_CONFIG.apiKey ? { 'TRON-PRO-API-KEY': BLOCKCHAIN_CONFIG.apiKey } : {},
  privateKey: BLOCKCHAIN_CONFIG.adminPrivateKey
});


export const createWallet = async () => {
  try {
    const account = await tronWeb.createAccount();
    return {
      address: account.address.base58,
      privateKey: account.privateKey
    };
  } catch (error) {
    console.error('Error creating Tron wallet:', error);
    throw error;
  }
};

export const getUsdtBalance = async (address: string) => {
  try {
    const contract = await tronWeb.contract().at(USDT_CONTRACT_ADDRESS);
    const balance = await contract.balanceOf(address).call();
    return tronWeb.fromSun(balance);
  } catch (error) {
    console.error('Error getting USDT balance:', error);
    return '0';
  }
};

export const sendUsdt = async (toAddress: string, amount: number) => {
  try {
    const contract = await tronWeb.contract().at(USDT_CONTRACT_ADDRESS);
    const amountInSun = tronWeb.toSun(amount);
    const transaction = await contract.transfer(toAddress, amountInSun).send();
    return transaction;
  } catch (error) {
    console.error('Error sending USDT:', error);
    throw error;
  }
};

export const checkTransactionStatus = async (txHash: string) => {
  try {
    const transaction = await tronWeb.trx.getTransaction(txHash);
    return transaction;
  } catch (error) {
    console.error('Error checking transaction status:', error);
    return null;
  }
};

export default tronWeb;
