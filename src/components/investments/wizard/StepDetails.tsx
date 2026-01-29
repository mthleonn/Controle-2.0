import React, { useState } from 'react';
import { InvestmentType } from '../../../types';
import { Calculator, Calendar } from 'lucide-react';

interface StepDetailsProps {
  type: InvestmentType;
  asset: { name: string; ticker: string; price?: number };
  onConfirm: (details: { quantity: number; price: number; date: string }) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const StepDetails: React.FC<StepDetailsProps> = ({ type, asset, onConfirm, onBack, isLoading }) => {
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState(asset.price ? asset.price.toString() : '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const total = (parseFloat(quantity) || 0) * (parseFloat(price) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      quantity: parseFloat(quantity),
      price: parseFloat(price),
      date
    });
  };

  const isFixedIncome = type === 'fixed_income';

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-slate-800">Detalhes da Compra</h3>
        <p className="text-slate-500 text-sm">
          {asset.ticker !== asset.name ? `${asset.name} (${asset.ticker})` : asset.name}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {isFixedIncome ? (
             <div className="col-span-2">
               <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Valor Aplicado</label>
               <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                 <input
                   type="number"
                   step="0.01"
                   value={price}
                   onChange={(e) => {
                     setPrice(e.target.value);
                     setQuantity('1'); // Renda fixa considera qtd 1 e preço = valor total
                   }}
                   className="w-full pl-10 pr-4 py-4 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none font-bold text-slate-800"
                   placeholder="0,00"
                 />
               </div>
             </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Quantidade</label>
                <input
                  type="number"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-4 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none font-bold text-slate-800"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Preço Pago</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-8 pr-4 py-4 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none font-bold text-slate-800"
                    placeholder="0,00"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Data da Operação</label>
          <div className="relative">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none font-bold text-slate-800"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Calendar size={20} />
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
              <Calculator size={20} />
            </div>
            <span className="text-sm font-bold text-slate-500">Total Investido</span>
          </div>
          <span className="text-xl font-black text-slate-900">
            R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
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
            disabled={total <= 0 || isLoading}
            className="flex-[2] py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              'Confirmar Investimento'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
