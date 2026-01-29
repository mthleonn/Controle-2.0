import { CoinGeckoMarketData } from '../types';

export const fetchTopCoins = async (limit: number = 10): Promise<CoinGeckoMarketData[]> => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=brl&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch market data');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching market data:', error);
    return [];
  }
};

export const searchCoins = async (query: string): Promise<CoinGeckoMarketData[]> => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${query}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to search coins');
    }
    
    const data = await response.json();
    // The search API returns a different structure, we need to map it or fetch details
    // For simplicity in this context, we will use the 'coins' array from the result
    // and map it to our CoinGeckoMarketData structure as best as we can, 
    // or ideally, use the ids to fetch market data.
    // However, to save requests, let's just return the basic info and handle it in the UI.
    // Actually, let's just return the top 5 matches and fetch their market data to be consistent.
    
    const topCoins = data.coins.slice(0, 5);
    if (topCoins.length === 0) return [];

    const ids = topCoins.map((c: any) => c.id).join(',');
    const marketResponse = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=brl&ids=${ids}&order=market_cap_desc&sparkline=false`
    );

    if (!marketResponse.ok) return [];
    return await marketResponse.json();

  } catch (error) {
    console.error('Error searching coins:', error);
    return [];
  }
};
