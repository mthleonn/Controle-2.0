import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { InvestmentType, CoinGeckoMarketData } from '../../../types';
import { searchCoins } from '../../../services/coinGeckoService';

interface StepAssetSearchProps {
  type: InvestmentType;
  onSelect: (asset: { name: string; ticker: string; price?: number }) => void;
  onBack: () => void;
}

export const StepAssetSearch: React.FC<StepAssetSearchProps> = ({ type, onSelect, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<CoinGeckoMarketData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFromList, setSelectedFromList] = useState<CoinGeckoMarketData | null>(null);

  // Debounce search for crypto
  useEffect(() => {
    if (type !== 'crypto' || searchTerm.length < 3) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const coins = await searchCoins(searchTerm);
      setResults(coins);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    if (selectedFromList) {
      onSelect({
        name: selectedFromList.name,
        ticker: selectedFromList.symbol.toUpperCase(),
        price: selectedFromList.current_price
      });
    } else {
      // Manual entry
      const ticker = searchTerm.toUpperCase().trim();
      const name = type === 'fixed_income' ? searchTerm : ticker;
      onSelect({ name, ticker });
    }
  };

  const handleSelectResult = (coin: CoinGeckoMarketData) => {
    setSearchTerm(coin.name);
    setSelectedFromList(coin);
    setResults([]); // Hide results
    // Optional: Auto submit? No, let user confirm.
  };

  const getPlaceholder = () => {
    switch (type) {
      case 'stock': return 'Ex: PETR4, VALE3, ITUB4...';
      case 'real_estate_fund': return 'Ex: MXRF11, HGLG11...';
      case 'crypto': return 'Ex: Bitcoin, Ethereum...';
      case 'fixed_income': return 'Ex: Tesouro Selic 2029, CDB Banco X...';
      case 'exchange': return 'Ex: AAPL, MSFT, VNQ...';
      default: return 'Nome do ativo...';
    }
  };

  const getLabel = () => {
    if (type === 'fixed_income') return 'Nome do Título';
    return 'Código (Ticker) ou Nome';
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-slate-800">Qual é o ativo?</h3>
        <p className="text-slate-500 text-sm">Digite para buscar ou cadastrar</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 relative">
        <div className="relative">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">{getLabel()}</label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedFromList(null); // Reset selection on type
              }}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-slate-800 text-lg transition-all placeholder:font-normal placeholder:text-slate-300"
              placeholder={getPlaceholder()}
              autoFocus
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              {isSearching ? <Loader2 size={24} className="animate-spin text-indigo-500" /> : <Search size={24} />}
            </div>
          </div>

          {/* Search Results Dropdown (Crypto) */}
          {results.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white rounded-xl border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-2 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Resultados encontrados
              </div>
              {results.map((coin) => (
                <button
                  key={coin.id}
                  type="button"
                  onClick={() => handleSelectResult(coin)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
                >
                  <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                  <div>
                    <div className="font-bold text-slate-800">{coin.name}</div>
                    <div className="text-xs text-slate-500 font-medium uppercase">{coin.symbol}</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="font-bold text-slate-700">R$ {coin.current_price.toLocaleString('pt-BR')}</div>
                    <div className={`text-xs font-bold ${coin.price_change_percentage_24h >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {coin.price_change_percentage_24h.toFixed(2)}%
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
          >
            Voltar
          </button>
          <button
            type="submit"
            disabled={!searchTerm.trim()}
            className="flex-[2] py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-200"
          >
            Continuar
          </button>
        </div>
      </form>
    </div>
  );
};
