export interface CryptoAsset {
  symbol: string;
  name: string;
  logo: string;
  network?: string;
}

export const BUY_CRYPTOS: CryptoAsset[] = [
  { symbol: 'USDT', name: 'Tether', logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png?v=040', network: 'TRC20' },
  { symbol: 'USDC', name: 'USD Coin', logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=040' },
  { symbol: 'BNB', name: 'Binance Coin', logo: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png?v=040' },
  { symbol: 'TRON', name: 'TRON', logo: 'https://cryptologos.cc/logos/tron-trx-logo.png?v=040' },
  { symbol: 'BTC', name: 'Bitcoin', logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=040' },
  { symbol: 'ETH', name: 'Ethereum', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png?v=040' },
  { symbol: 'SHIBA', name: 'Shiba Inu', logo: 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png?v=040' },
  { symbol: 'PEPE', name: 'Pepe', logo: 'https://cryptologos.cc/logos/pepe-pepe-logo.png?v=040' },
  { symbol: 'PI', name: 'Pi Network', logo: 'https://raw.githubusercontent.com/pi-apps/pi-platform-docs/master/pi_logo.png' },
  { symbol: 'BEBYDOGE', name: 'Baby Doge', logo: 'https://cryptologos.cc/logos/baby-doge-coin-babydoge-logo.png?v=040' },
  { symbol: 'ADA', name: 'Cardano', logo: 'https://cryptologos.cc/logos/cardano-ada-logo.png?v=040' },
  { symbol: 'SOL', name: 'Solana', logo: 'https://cryptologos.cc/logos/solana-sol-logo.png?v=040' },
];

export const SELL_CRYPTOS: CryptoAsset[] = [
  { symbol: 'USDT(BEP20)', name: 'USDT (BEP20)', logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png?v=040', network: 'BEP20' },
  { symbol: 'USDT(TRC20)', name: 'USDT (TRC20)', logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png?v=040', network: 'TRC20' },
];
