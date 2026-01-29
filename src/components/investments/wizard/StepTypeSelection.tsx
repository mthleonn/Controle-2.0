import React from 'react';
import { InvestmentType } from '../../../types';
import { Landmark, BarChart3, Building2, Bitcoin, Globe } from 'lucide-react';

interface StepTypeSelectionProps {
  onSelect: (type: InvestmentType) => void;
}

export const StepTypeSelection: React.FC<StepTypeSelectionProps> = ({ onSelect }) => {
  const types: { id: InvestmentType; label: string; icon: React.ReactNode; description: string, color: string }[] = [
    { 
      id: 'fixed_income', 
      label: 'Renda Fixa', 
      icon: <Landmark size={32} />, 
      description: 'Tesouro Direto, CDB, LCI/LCA',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-300'
    },
    { 
      id: 'stock', 
      label: 'Ações Brasil', 
      icon: <BarChart3 size={32} />, 
      description: 'Empresas da B3',
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:border-indigo-300'
    },
    { 
      id: 'real_estate_fund', 
      label: 'Fundos Imobiliários', 
      icon: <Building2 size={32} />, 
      description: 'FIIs e Fiagros',
      color: 'bg-amber-50 text-amber-600 border-amber-100 hover:border-amber-300'
    },
    { 
      id: 'crypto', 
      label: 'Criptomoedas', 
      icon: <Bitcoin size={32} />, 
      description: 'Bitcoin, Ethereum e Altcoins',
      color: 'bg-violet-50 text-violet-600 border-violet-100 hover:border-violet-300'
    },
    { 
      id: 'exchange', 
      label: 'Exterior', 
      icon: <Globe size={32} />, 
      description: 'Stocks e REITs (Dólar)',
      color: 'bg-sky-50 text-sky-600 border-sky-100 hover:border-sky-300'
    },
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-slate-800">O que você vai adicionar?</h3>
        <p className="text-slate-500 text-sm">Escolha a categoria do investimento</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {types.map((type) => (
          <button
            key={type.id}
            onClick={() => onSelect(type.id)}
            className={`p-6 rounded-2xl border-2 transition-all duration-200 text-left group hover:shadow-lg hover:-translate-y-1 ${type.color}`}
          >
            <div className="mb-4 p-3 bg-white rounded-xl w-fit shadow-sm group-hover:scale-110 transition-transform">
              {type.icon}
            </div>
            <h4 className="font-bold text-lg text-slate-800 mb-1">{type.label}</h4>
            <p className="text-xs font-medium opacity-70 text-slate-600">{type.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
