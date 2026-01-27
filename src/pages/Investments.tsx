import React, { useState, useEffect, useMemo } from 'react';
import { CoinGeckoMarketData } from '../types';
import { ICONS } from '../constants';
import { fetchTopCoins } from '../services/coinGeckoService';
import { useFinance } from '../context/FinanceContext';
import { Trash2, TrendingUp, Wallet, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981', '#3b82f6', '#f59e0b'];

const FII_DATABASE = [
  { symbol: 'HGLG11', name: 'CSHG Logística', price: 165.40 },
  { symbol: 'MXRF11', name: 'Maxi Renda', price: 10.55 },
  { symbol: 'XPML11', name: 'XP Malls', price: 115.20 },
  { symbol: 'KNRI11', name: 'Kinea Renda Imobiliária', price: 160.10 },
  { symbol: 'VISC11', name: 'Vinci Shopping Centers', price: 120.30 },
  { symbol: 'XPLG11', name: 'XP Log', price: 108.90 },
  { symbol: 'HGRU11', name: 'CSHG Renda Urbana', price: 135.00 },
  { symbol: 'BTLG11', name: 'BTG Pactual Logística', price: 102.50 },
  { symbol: 'IRDM11', name: 'Iridium Recebíveis', price: 78.40 },
  { symbol: 'KNIP11', name: 'Kinea Índices de Preços', price: 95.20 },
  { symbol: 'RECR11', name: 'Rec Recebíveis', price: 85.10 },
  { symbol: 'ALZR11', name: 'Alianza Trust Renda Imobiliária', price: 112.00 }
];

export const Investments: React.FC = () => {
  const { investments: contextInvestments, addInvestment, removeInvestment } = useFinance();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cryptoOptions, setCryptoOptions] = useState<CoinGeckoMarketData[]>([]);
  
  const [type, setType] = useState<'crypto' | 'real_estate'>('crypto');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<{ symbol: string; name: string; currentPrice: number; image?: string } | null>(null);
  const [quantity, setQuantity] = useState('');
  const [averagePrice, setAveragePrice] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const investments = useMemo(() => {
    return contextInvestments
      .filter(i => ['crypto', 'real_estate', 'stock'].includes(i.type))
      .map(inv => ({
        ...inv,
        symbol: inv.ticker || '',
        averagePrice: (inv.quantity && inv.quantity > 0) ? (inv.investedAmount / inv.quantity) : 0,
        currentPrice: (inv.quantity && inv.quantity > 0) ? (inv.currentAmount / inv.quantity) : 0,
        totalValue: (inv.quantity && inv.quantity > 0) ? (inv.currentAmount) : 0,
      }));
  }, [contextInvestments]);

  // Calculate Portfolio Stats
  const portfolioStats = useMemo(() => {
    const totalValue = investments.reduce((acc, inv) => acc + ((inv.quantity || 0) * inv.currentPrice), 0);
    const totalCost = investments.reduce((acc, inv) => acc + inv.investedAmount, 0);
    const totalProfit = totalValue - totalCost;
    const profitPercentage = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
    
    return { totalValue, totalCost, totalProfit, profitPercentage };
  }, [investments]);

  // Prepare Chart Data
  const chartData = useMemo(() => {
    return investments
      .map(inv => ({
        name: inv.ticker || inv.name,
        value: (inv.quantity || 0) * inv.currentPrice
      }))
      .sort((a, b) => b.value - a.value)
      .filter(item => item.value > 0);
  }, [investments]);

  useEffect(() => {
    const loadCrypto = async () => {
      const data = await fetchTopCoins(250);
      setCryptoOptions(data);
    };
    loadCrypto();
  }, []);

  const filteredAssets = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    if (type === 'crypto') {
      return cryptoOptions
        .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 6);
    } else {
      return FII_DATABASE
        .filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 6);
    }
  }, [searchTerm, type, cryptoOptions]);

  const handleSelectAsset = (asset: any) => {
    setSelectedAsset({
      symbol: asset.symbol.toUpperCase(),
      name: asset.name,
      currentPrice: asset.current_price || asset.price || 0,
      image: asset.image
    });
    setSearchTerm(`${asset.name} (${asset.symbol.toUpperCase()})`);
    setShowDropdown(false);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !quantity || !averagePrice) return;

    addInvestment({
      name: selectedAsset.name,
      ticker: selectedAsset.symbol,
      quantity: parseFloat(quantity),
      investedAmount: parseFloat(quantity) * parseFloat(averagePrice),
      currentAmount: parseFloat(quantity) * selectedAsset.currentPrice,
      type: type,
      targetAmount: 0 // Optional default
    });

    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setQuantity('');
    setAveragePrice('');
    setSelectedAsset(null);
    setSearchTerm('');
  };

  const handleExport = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      total_assets: investments.length,
      portfolio: investments.map(inv => ({
        ...inv,
        current_total_value: (inv.quantity || 0) * inv.currentPrice,
        profit_loss: ((inv.quantity || 0) * inv.currentPrice) - ((inv.quantity || 0) * inv.averagePrice)
      }))
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `controle-mais_portfolio_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const previewTotal = useMemo(() => {
    const q = parseFloat(quantity) || 0;
    const p = parseFloat(averagePrice) || 0;
    return q * p;
  }, [quantity, averagePrice]);

  return (
    <div className="space-y-6 pb-20 md:pb-0"> {/* Added padding bottom for mobile navigation if exists */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Meus Investimentos</h3>
          <p className="text-sm md:text-base text-slate-500 font-medium">Controle total sobre suas moedas e ativos.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={handleExport} className="p-3 bg-white border-2 border-slate-100 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors flex-shrink-0">
            <ICONS.PieChart className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 md:flex-none px-4 md:px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center space-x-2 whitespace-nowrap"
          >
            <ICONS.Plus className="w-5 h-5" />
            <span>Adicionar Ativo</span>
          </button>
        </div>
      </div>

      {/* Portfolio Summary Section */}
      {investments.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
          {/* Stats Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Wallet className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <span className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider">Saldo Total</span>
              </div>
              <span className="text-xl md:text-2xl font-black text-slate-800 truncate">
                R$ {portfolioStats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <span className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider">Lucro Total</span>
              </div>
              <div className="flex items-baseline space-x-2 flex-wrap">
                <span className={`text-xl md:text-2xl font-black truncate ${portfolioStats.totalProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {portfolioStats.totalProfit >= 0 ? '+' : ''}R$ {portfolioStats.totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <span className={`text-[10px] md:text-xs font-bold ${portfolioStats.totalProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {portfolioStats.profitPercentage.toFixed(2)}% de retorno
              </span>
            </div>

            <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
               <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-slate-50 text-slate-600 rounded-lg">
                  <PieChartIcon className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <span className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider">Custo Total</span>
              </div>
              <span className="text-xl md:text-2xl font-black text-slate-700 truncate">
                R$ {portfolioStats.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Allocation Chart */}
          <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-100 h-80 lg:h-auto flex flex-col">
            <h4 className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Alocação de Ativos</h4>
            <div className="flex-1 w-full h-full min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle" 
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {investments.map((inv) => {
           const totalValue = (inv.quantity || 0) * inv.currentPrice;
           const profit = totalValue - (inv.investedAmount || 0);
           const profitPercent = inv.investedAmount > 0 ? (profit / inv.investedAmount) * 100 : 0;
           
           return (
            <div key={inv.id} className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => removeInvestment(inv.id)}
                  className="p-2 bg-white text-rose-500 hover:bg-rose-50 rounded-xl shadow-sm border border-rose-100 transition-colors"
                  title="Remover investimento"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-base md:text-lg">
                  {inv.symbol ? inv.symbol.substring(0, 2).toUpperCase() : '??'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm md:text-base truncate max-w-[150px]">{inv.name}</h4>
                  <span className="text-[10px] md:text-xs font-bold text-slate-400 px-2 py-1 bg-slate-50 rounded-lg uppercase tracking-wider">{inv.type === 'real_estate' ? 'FII' : 'CRIPTO'}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm font-medium text-slate-500">Quantidade</span>
                  <span className="text-sm md:text-base font-bold text-slate-800">{inv.quantity}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm font-medium text-slate-500">Preço Médio</span>
                  <span className="text-sm md:text-base font-bold text-slate-800">R$ {inv.averagePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                 <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm font-medium text-slate-500">Preço Atual</span>
                  <span className="text-sm md:text-base font-bold text-slate-800">R$ {inv.currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="pt-4 border-t border-slate-50 mt-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-wider">Patrimônio Atual</span>
                    <span className="font-black text-slate-900 text-base md:text-lg">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                   <div className={`text-right text-[10px] md:text-xs font-bold ${profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {profit >= 0 ? '+' : ''}R$ {profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({profitPercent.toFixed(2)}%)
                  </div>
                </div>
              </div>
            </div>
           );
        })}
        
        {investments.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <ICONS.Investments className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Nenhum investimento cadastrado.</p>
            <p className="text-sm">Clique em "Adicionar Ativo" para começar.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full md:max-w-lg h-[95vh] md:h-auto md:max-h-[90vh] rounded-t-[2rem] md:rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-200 flex flex-col">
            <form onSubmit={handleAdd} className="flex flex-col h-full">
              <div className="p-5 md:p-8 border-b border-slate-50 flex justify-between items-center bg-white shrink-0">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Novo Investimento</h2>
                  <p className="text-slate-500 text-xs md:text-sm font-medium">Adicione ativos à sua carteira.</p>
                </div>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              
              <div className="p-5 md:p-8 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
                <div className="flex p-1 bg-slate-100 rounded-2xl shrink-0">
                  <button
                    type="button"
                    onClick={() => { setType('crypto'); setSearchTerm(''); }}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs md:text-sm font-bold transition-all ${type === 'crypto' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Criptoativos
                  </button>
                  <button
                    type="button"
                    onClick={() => { setType('real_estate'); setSearchTerm(''); }}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs md:text-sm font-bold transition-all ${type === 'real_estate' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Fundos Imobiliários
                  </button>
                </div>

                <div className="relative shrink-0">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Selecione o Ativo</label>
                  <div className="relative">
                     <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                       <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                     </div>
                     <input 
                      type="text" 
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowDropdown(true);
                        if (!e.target.value) setSelectedAsset(null);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      placeholder={type === 'crypto' ? "Ex: Bitcoin, ETH, SOL..." : "Ex: HGLG11, MXRF11..."}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-slate-700 transition-all text-sm md:text-base"
                    />
                  </div>

                  {showDropdown && filteredAssets.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 max-h-60 overflow-y-auto z-50">
                      {filteredAssets.map((asset: any) => (
                        <button
                          key={asset.id || asset.symbol}
                          type="button"
                          onClick={() => handleSelectAsset(asset)}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center space-x-3 transition-colors border-b border-slate-50 last:border-0"
                        >
                          {asset.image ? (
                            <img src={asset.image} alt={asset.name} className="w-8 h-8 rounded-full" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500">
                              {asset.symbol.slice(0, 2)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{asset.name}</p>
                            <p className="text-xs text-slate-400 font-bold">{asset.symbol.toUpperCase()}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Quantidade</label>
                    <input 
                      type="number" 
                      step="any"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="0.00" 
                      className="w-full px-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-slate-700 transition-all text-sm md:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Preço Médio</label>
                    <input 
                      type="number" 
                      step="any"
                      value={averagePrice}
                      onChange={(e) => setAveragePrice(e.target.value)}
                      placeholder="R$ 0,00" 
                      className="w-full px-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-slate-700 transition-all text-sm md:text-base"
                    />
                  </div>
                </div>

                {selectedAsset && quantity && averagePrice && (
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4 shrink-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-black text-slate-400 uppercase">Custo Total Estimado</span>
                      <span className="text-lg font-black text-slate-900">R$ {previewTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-400 uppercase">Cotação Atual</span>
                      <span className="text-sm font-bold text-emerald-600">R$ {selectedAsset.currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                )}
                
                {/* Spacer to ensure content isn't hidden behind fixed elements on very small screens if needed */}
                <div className="h-4 md:h-0"></div>
              </div>

              <div className="p-5 md:p-8 border-t border-slate-50 bg-slate-50/50 shrink-0 pb-safe">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-300 transition-colors text-sm md:text-base"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedAsset || !quantity || !averagePrice}
                    className="flex-[2] bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-indigo-100 flex items-center justify-center space-x-3 active:scale-[0.98] text-sm md:text-base"
                  >
                    <ICONS.Dashboard className="w-5 h-5" />
                    <span>CONFIRMAR</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


