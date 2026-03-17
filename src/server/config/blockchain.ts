import dotenv from 'dotenv';
dotenv.config();

export const BLOCKCHAIN_CONFIG = {
  networks: {
    mainnet: {
      fullHost: 'https://api.trongrid.io',
      solidityNode: 'https://api.trongrid.io',
      eventServer: 'https://api.trongrid.io',
    },
    nile: {
      fullHost: 'https://api.nileex.io',
      solidityNode: 'https://api.nileex.io',
      eventServer: 'https://api.nileex.io',
    },
    shasta: {
      fullHost: 'https://api.shasta.trongrid.io',
      solidityNode: 'https://api.shasta.trongrid.io',
      eventServer: 'https://api.shasta.trongrid.io',
    }
  },
  
  // Default to Nile for development, Mainnet for production
  currentNetwork: process.env.NODE_ENV === 'production' ? 'mainnet' : 'nile',
  
  // USDT TRC20 Contract Addresses
  contracts: {
    usdt: {
      mainnet: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      nile: 'TXYZ123456789012345678901234567890', // Replace with actual Nile USDT if needed, or use a mock
      shasta: 'TXYZ123456789012345678901234567890'
    }
  },

  // API Keys and Secrets
  apiKey: process.env.TRON_GRID_API_KEY,
  adminPrivateKey: process.env.ADMIN_TRON_PRIVATE_KEY,
  adminAddress: process.env.ADMIN_TRON_ADDRESS,
  
  // Transaction Settings
  settings: {
    feeLimit: 100000000, // 100 TRX
    confirmedBlocks: 19, // Standard for TRON
  }
};

export const getNetworkUrl = () => {
  const network = BLOCKCHAIN_CONFIG.networks[BLOCKCHAIN_CONFIG.currentNetwork as keyof typeof BLOCKCHAIN_CONFIG.networks];
  return network.fullHost;
};

export const getUsdtContractAddress = () => {
  const envAddress = process.env.USDT_CONTRACT_ADDRESS;
  if (envAddress) return envAddress;
  
  return BLOCKCHAIN_CONFIG.contracts.usdt[BLOCKCHAIN_CONFIG.currentNetwork as keyof typeof BLOCKCHAIN_CONFIG.contracts.usdt];
};
