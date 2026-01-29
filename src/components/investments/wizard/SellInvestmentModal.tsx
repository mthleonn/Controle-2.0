import React, { useState } from 'react';
import { Investment } from '../../../types';
import { useFinance } from '../../../context/FinanceContext';
import { X, TrendingDown, AlertTriangle } from 'lucide-react';

interface SellInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  investment: Investment;
}

export const SellInvestmentModal: React.FC<SellInvestmentModalProps> = ({ isOpen, onClose, investment }) => {
  const { sellInvestment } = useFinance();
  const [quantity, setQuantity] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const currentQuantity = investment.quantity || 0;
  const isFullSale = parseFloat(quantity) >= currentQuantity;
  const estimatedTotal = (parseFloat(quantity) || 0) * (parseFloat(salePrice) || 0);

  const handleSell = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await sellInvestment(investment.id, parseFloat(quantity), parseFloat(salePrice));
      onClose();
      setQuantity('');
      setSalePrice('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
              <TrendingDown size={20} />
            </div>
            Vender Ativo
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSell} className="p-6 space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Ativo Selecionado</p>
            <p className="text-lg font-black text-slate-800 mb-1">{investment.name}</p>
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-xs">
                {investment.ticker || 'N/A'}
              </span>
              <span>•</span>
              <span>Disponível: {currentQuantity}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Qtd. Venda</label>
              <input
                type="number"
                step="any"
                max={currentQuantity}
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-rose-500 outline-none font-bold text-slate-800 transition-colors"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Preço Unitário</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">R$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-slate-100 focus:border-rose-500 outline-none font-bold text-slate-800 transition-colors"
                  placeholder="0,00"
                />
              </div>
            </div>
          </div>

          {isFullSale && quantity !== '' && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-medium flex gap-3 items-start border border-rose-100">
              <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
              <p>Atenção: Você está vendendo toda a posição. O ativo será removido da sua carteira após a confirmação.</p>
            </div>
          )}

          <div className="flex justify-between items-center py-4 border-t border-slate-100">
            <span className="text-sm font-bold text-slate-500">Valor Total a Receber</span>
            <span className="text-2xl font-black text-slate-800">
              R$ {estimatedTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading || !quantity || !salePrice}
            className="w-full py-4 bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              'Processando...'
            ) : (
              <>
                <TrendingDown size={20} />
                Confirmar Venda
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
