import React, { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Building2, Bitcoin, LineChart, Target, Trash2 } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { InvestmentType } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { InvestmentForm } from '../components/InvestmentForm';
import { formatCurrency, calculateProgress } from '../utils/format';

const TYPE_ICONS: Record<InvestmentType, React.ElementType> = {
  cdi: DollarSign,
  stock: LineChart,
  real_estate: Building2,
  crypto: Bitcoin,
};

const TYPE_LABELS: Record<InvestmentType, string> = {
  cdi: 'Renda Fixa',
  stock: 'Ações',
  real_estate: 'FIIs',
  crypto: 'Cripto',
};

export const Investments = () => {
  const { investments, updateInvestment, removeInvestment } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [updateValue, setUpdateValue] = useState('');

  const handleUpdate = (id: string) => {
    if (!updateValue) return;
    updateInvestment(id, Number(updateValue));
    setEditingId(null);
    setUpdateValue('');
  };

  const totalInvested = investments.reduce((acc, curr) => acc + curr.investedAmount, 0);
  const totalCurrent = investments.reduce((acc, curr) => acc + curr.currentAmount, 0);
  const totalYield = totalCurrent - totalInvested;
  const yieldPercentage = totalInvested > 0 ? (totalYield / totalInvested) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Investimentos</h1>
          <p className="text-slate-500">Gerencie seu patrimônio e rentabilidade.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          Criar Novo Investimento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm font-medium text-slate-500 mb-1">Total Investido</p>
          <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(totalInvested)}</h3>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-500 mb-1">Valor Atual</p>
          <h3 className="text-2xl font-bold text-primary">{formatCurrency(totalCurrent)}</h3>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-500 mb-1">Rentabilidade</p>
          <div className={`flex items-center gap-2 text-2xl font-bold ${totalYield >= 0 ? 'text-accent' : 'text-danger'}`}>
            {totalYield >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
            <span>{yieldPercentage.toFixed(2)}%</span>
          </div>
          <p className={`text-sm ${totalYield >= 0 ? 'text-accent' : 'text-danger'}`}>
            {totalYield >= 0 ? '+' : ''}{formatCurrency(totalYield)}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {investments.map((investment) => {
          const Icon = TYPE_ICONS[investment.type];
          const profit = investment.currentAmount - investment.investedAmount;
          const profitPercent = investment.investedAmount > 0 
            ? (profit / investment.investedAmount) * 100 
            : 0;
          
          const progress = investment.targetAmount 
            ? calculateProgress(investment.currentAmount, investment.targetAmount) 
            : 0;

          return (
            <Card key={investment.id} className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="p-3 bg-slate-100 rounded-xl text-slate-600">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{investment.name}</h3>
                    <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                      {TYPE_LABELS[investment.type]}
                    </span>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto text-sm">
                  <div>
                    <p className="text-slate-500">Investido</p>
                    <p className="font-semibold text-slate-800">{formatCurrency(investment.investedAmount)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Atual</p>
                    <p className="font-semibold text-primary">{formatCurrency(investment.currentAmount)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Retorno</p>
                    <p className={`font-semibold ${profit >= 0 ? 'text-accent' : 'text-danger'}`}>
                      {profitPercent.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Lucro/Prejuízo</p>
                    <p className={`font-semibold ${profit >= 0 ? 'text-accent' : 'text-danger'}`}>
                      {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                    </p>
                  </div>
                </div>

                <div className="w-full md:w-auto">
                  {editingId === investment.id ? (
                    <div className="flex gap-2">
                      <Input 
                        type="number" 
                        placeholder="Novo valor" 
                        value={updateValue}
                        onChange={(e) => setUpdateValue(e.target.value)}
                        className="h-10 py-1 w-32"
                      />
                      <Button size="sm" onClick={() => handleUpdate(investment.id)}>OK</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>X</Button>
                    </div>
                  ) : (
                    <div className="flex gap-2 items-center">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setEditingId(investment.id);
                          setUpdateValue(investment.currentAmount.toString());
                        }}
                      >
                        Atualizar Valor
                      </Button>
                      <button 
                        onClick={() => removeInvestment(investment.id)}
                        className="text-slate-400 hover:text-danger transition-colors p-2 hover:bg-danger/10 rounded-lg"
                        title="Excluir Investimento"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {investment.targetAmount && (
                <div className="mt-2 pt-4 border-t border-slate-50">
                  <div className="flex justify-between mb-2 text-xs">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Target size={14} />
                      <span className="font-medium">Progresso do Objetivo</span>
                    </div>
                    <span className="text-slate-500">
                      {progress.toFixed(0)}% de {formatCurrency(investment.targetAmount)}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </Card>
          );
        })}
        {investments.length === 0 && (
          <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
            <p>Você ainda não possui investimentos cadastrados.</p>
            <p className="text-sm mt-2">Comece criando um novo investimento para acompanhar sua evolução.</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Investimento"
      >
        <InvestmentForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};
