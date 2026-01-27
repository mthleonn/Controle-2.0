
// Mock service to simulate real-time market data
// In a real production app, this would connect to Alpha Vantage, Yahoo Finance, or CoinGecko APIs

interface MarketQuote {
  symbol: string;
  price: number;
  changePercent: number;
  lastUpdated: string;
}

// Initial mock prices
const MOCK_PRICES: Record<string, number> = {
  'PETR4': 41.50,
  'VALE3': 62.30,
  'ITUB4': 33.15,
  'BBDC4': 14.20,
  'BBAS3': 28.90,
  'MXRF11': 10.45,
  'HGLG11': 165.20,
  'BTC': 345000.00,
  'ETH': 18500.00,
  'SOL': 750.00,
  'AAPL': 175.50, // USD converted to BRL approx
  'MSFT': 2100.00 // USD converted to BRL approx
};

export const MarketDataService = {
  getQuote: async (ticker: string): Promise<MarketQuote | null> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const symbol = ticker.toUpperCase().trim();
    
    // Check if we have a mock price, otherwise generate a random one based on hash
    let basePrice = MOCK_PRICES[symbol];
    
    if (!basePrice) {
      // Generate deterministic "random" price based on ticker characters for consistency
      const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      basePrice = (hash % 100) + 10;
    }

    // Add small random variation (-2% to +2%) to simulate live market
    const variation = (Math.random() * 0.04) - 0.02;
    const currentPrice = basePrice * (1 + variation);
    
    return {
      symbol,
      price: Number(currentPrice.toFixed(2)),
      changePercent: Number((variation * 100).toFixed(2)),
      lastUpdated: new Date().toISOString()
    };
  },

  // Batch fetch for multiple tickers
  getQuotes: async (tickers: string[]): Promise<Record<string, MarketQuote>> => {
    const quotes: Record<string, MarketQuote> = {};
    
    await Promise.all(tickers.map(async (ticker) => {
      const quote = await MarketDataService.getQuote(ticker);
      if (quote) {
        quotes[ticker] = quote;
      }
    }));

    return quotes;
  }
};
