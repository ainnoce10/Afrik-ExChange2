import axios from 'axios';
import db from '../db.js';

const ASSET_MAP: Record<string, string> = {
  'BTC': 'bitcoin',
  'BNB': 'binancecoin',
  'USDT': 'tether',
  'USDC': 'usd-coin',
  'TRON': 'tron',
  'ETH': 'ethereum',
  'SHIBA': 'shiba-inu',
  'PEPE': 'pepe',
  'PI': 'pi-network',
  'BEBYDOGE': 'baby-doge-coin',
  'ADA': 'cardano',
  'SOL': 'solana',
  'USDT(BEP20)': 'tether',
  'USDT(TRC20)': 'tether'
};

const COINGECKO_IDS = Array.from(new Set(Object.values(ASSET_MAP))).join(',');
const COINGECKO_URL = `https://api.coingecko.com/api/v3/simple/price?ids=${COINGECKO_IDS}&vs_currencies=usd`;

// Fixed USD to Local Currency rates (approximate, can be updated by admin)
const USD_TO_LOCAL: Record<string, number> = {
  'XOF': 650,
  'XAF': 655
};

// Default margins (can be moved to DB later)
const MARGIN_BUY = 1.02; // +2%
const MARGIN_SELL = 0.98; // -2%

export async function updateRatesFromLive() {
  try {
    const response = await axios.get(COINGECKO_URL);
    const prices = response.data;

    const assets = Object.keys(ASSET_MAP);
    const currencies = ['XOF', 'XAF'];

    let updatedCount = 0;
    for (const asset of assets) {
      const cgId = ASSET_MAP[asset];
      const usdPrice = prices[cgId]?.usd;

      if (usdPrice) {
        for (const currency of currencies) {
          const baseRate = Math.round(usdPrice * USD_TO_LOCAL[currency] * 100) / 100;
          const buyRate = Math.round(baseRate * MARGIN_BUY * 100) / 100;
          const sellRate = Math.round(baseRate * MARGIN_SELL * 100) / 100;

          await db.query(`
            INSERT INTO rates (asset, local_currency, base_rate, buy_rate, sell_rate, updated_at)
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
            ON CONFLICT(asset, local_currency) DO UPDATE SET
              base_rate = EXCLUDED.base_rate,
              buy_rate = EXCLUDED.buy_rate,
              sell_rate = EXCLUDED.sell_rate,
              updated_at = CURRENT_TIMESTAMP
          `, [asset, currency, baseRate, buyRate, sellRate]);
          updatedCount++;
        }
      } else {
        console.warn(`No price found for asset: ${asset} (ID: ${cgId})`);
      }
    }
    console.log(`Rates updated successfully: ${updatedCount} pairs updated.`);
  } catch (error) {
    console.error('Failed to update live rates:', error);
  }
}

// Run update every 30 seconds to avoid rate limiting
setInterval(updateRatesFromLive, 30 * 1000);
