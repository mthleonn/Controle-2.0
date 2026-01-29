import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { InvestmentWizard } from '../components/investments/wizard/InvestmentWizard';
import { 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Wallet, 
  ArrowUpRight, 
  Plus, 
  RefreshCw, 
  Bot,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { InvestmentType, Investment } from '../types';

export const Investments: React.FC = () => {
  const { investments, refreshQuotes } = useFinance();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [expandedType, setExpandedType] = useState<string | null>(null);

  // Cálculos de Resumo
  const stats = useMemo(() => {
    const totalInvested = investments.reduce((acc, curr) => acc + curr.investedAmount, 0);
    const totalBalance = investments.reduce((acc, curr) => acc + curr.currentAmount, 0);
    const profit = totalBalance - totalInvested;
    const profitPercentage = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

    return { totalInvested, totalBalance, profit, profitPercentage };
  }, [investments]);

  // Dados para Gráfico
  const allocationData = useMemo(() => {
    const grouped = investments.reduce((acc, curr) => {
      acc[curr.type] = (acc[curr.type] || 0) + curr.currentAmount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([key, value]) => ({
      name: getInvestmentLabel(key as InvestmentType),
      value,
      type: key
    })).filter(d => d.value > 0);
  }, [investments]);

  // Cores para o gráfico
  const COLORS: Record<string, string> = {
    fixed_income: '#10b981', // emerald-500
    stock: '#6366f1', // indigo-500
    real_estate_fund: '#f59e0b', // amber-500
    crypto: '#8b5cf6', // violet-500
    exchange: '#0ea5e9', // sky-500
    // Cores fallback para tipos antigos se houver
    cdi: '#10b981',
    real_estate: '#f59e0b'
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshQuotes();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getAIAnalysis = () => {
    const tips = [];
    const total = stats.totalBalance;
    if (total === 0) return ["Sua carteira está vazia. Comece criando uma reserva de emergência em Renda Fixa!"];

    const cryptoShare = (allocationData.find(d => d.type === 'crypto')?.value || 0) / total;
    const fixedShare = (allocationData.find(d => d.type === 'fixed_income' || d.type === 'cdi')?.value || 0) / total;

    if (cryptoShare > 0.20) tips.push("⚠️ Atenção: Mais de 20% do seu patrimônio está em Criptomoedas. Considere rebalancear para reduzir a volatilidade.");
    if (fixedShare < 0.20) tips.push("💡 Dica: Sua alocação em Renda Fixa parece baixa. Uma reserva segura é essencial para estabilidade.");
    if (allocationData.length < 3 && total > 5000) tips.push("📉 Diversificação: Você possui poucos tipos de ativos. Considere diversificar entre Ações e FIIs.");
    
    if (tips.length === 0) tips.push("✅ Sua carteira parece bem equilibrada por enquanto! Continue aportando regularmente.");
    
    return tips;
  };

  const toggleType = (type: string) => {
    setExpandedType(expandedType === type ? null : type);
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Header Mobile-First */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Investimentos</h1>
          <p className="text-slate-500 font-medium">Gerencie seu patrimônio e futuro</p>
        </div>
        <div className="flex gap-3">
           <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-3 bg-white border-2 border-slate-100 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`}
          >
            <RefreshCw size={20} />
          </button>
          <button 
            onClick={() => setIsWizardOpen(true)}
            className="flex-1 md:flex-none px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            <span>Novo Aporte</span>
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl shadow-slate-900/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Wallet size={100} />
          </div>
          <div className="relative z-10">
            <p className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-1">Patrimônio Total</p>
            <h2 className="text-3xl font-black">R$ {stats.totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-400">
              <div className="bg-emerald-500/20 p-1 rounded-lg">
                <ArrowUpRight size={16} />
              </div>
              <span>Você está no caminho certo!</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm relative overflow-hidden">
          <p className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-1">Rentabilidade</p>
          <div className="flex items-baseline gap-2">
            <h2 className={`text-3xl font-black ${stats.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {stats.profit >= 0 ? '+' : ''}R$ {Math.abs(stats.profit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
            <span className={`font-bold ${stats.profitPercentage >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              ({stats.profitPercentage.toFixed(2)}%)
            </span>
          </div>
           <p className="text-xs text-slate-400 mt-2 font-medium">Rentabilidade histórica baseada no custo médio</p>
        </div>

        <div className="bg-indigo-50 p-6 rounded-3xl border-2 border-indigo-100 shadow-sm relative overflow-hidden group cursor-pointer hover:bg-indigo-100 transition-colors" onClick={() => setShowAnalysis(!showAnalysis)}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-indigo-600 font-bold text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
                <Bot size={16} /> Análise IA
              </p>
              <h2 className="text-xl font-black text-slate-800 leading-tight">
                {showAnalysis ? "Ocultar Análise" : "Analisar Carteira"}
              </h2>
            </div>
            <div className="bg-white p-3 rounded-xl shadow-sm text-indigo-600 group-hover:scale-110 transition-transform">
              <PieChartIcon size={24} />
            </div>
          </div>
          <p className="text-xs text-indigo-400 mt-4 font-bold">Toque para ver insights</p>
        </div>
      </div>

      {/* IA Analysis Section */}
      {showAnalysis && (
        <div className="bg-white rounded-3xl p-6 border-2 border-indigo-100 shadow-xl shadow-indigo-100/50 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <Bot className="text-indigo-600" /> Insights do Consultor
          </h3>
          <div className="space-y-3">
            {getAIAnalysis().map((tip, index) => (
              <div key={index} className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl">
                <Info className="text-indigo-500 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-slate-600 text-sm font-medium">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State Educativo */}
      {investments.length === 0 && !showAnalysis && (
        <div className="text-center py-12 px-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-300">
            <TrendingUp size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">Comece a investir hoje</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            Investir é a chave para multiplicar seu patrimônio. Adicione seu primeiro ativo clicando em "Novo Aporte".
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs font-bold text-slate-400 uppercase">
            <span className="bg-white px-3 py-1 rounded-full border border-slate-200">Renda Fixa</span>
            <span className="bg-white px-3 py-1 rounded-full border border-slate-200">Ações</span>
            <span className="bg-white px-3 py-1 rounded-full border border-slate-200">FIIs</span>
            <span className="bg-white px-3 py-1 rounded-full border border-slate-200">Cripto</span>
          </div>
        </div>
      )}

      {/* Gráficos e Listagem */}
      {investments.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Gráfico de Alocação */}
          <div className="lg:col-span-1 bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm h-fit">
            <h3 className="font-bold text-slate-800 mb-6">Alocação por Classe</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.type] || '#cbd5e1'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Lista de Ativos */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-slate-800 px-2">Seus Ativos</h3>
            {Object.entries(groupByType(investments)).map(([type, typeInvestments]) => (
              <div key={type} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <button 
                  onClick={() => toggleType(type)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 rounded-full" style={{ backgroundColor: COLORS[type] || '#cbd5e1' }} />
                    <div className="text-left">
                      <h4 className="font-bold text-slate-700">{getInvestmentLabel(type as InvestmentType)}</h4>
                      <p className="text-xs text-slate-400 font-medium">
                        {typeInvestments.length} ativos • Total: R$ {typeInvestments.reduce((a, b) => a + b.currentAmount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  {expandedType === type ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                </button>
                
                {(expandedType === type || typeInvestments.length <= 3) && ( // Expandido ou se tiver poucos itens
                  <div className="divide-y divide-slate-100">
                    {typeInvestments.map((inv) => (
                      <div key={inv.id} className="p-4 flex justify-between items-center hover:bg-slate-50/30 transition-colors">
                        <div>
                          <p className="font-bold text-slate-800">{inv.name}</p>
                          <p className="text-xs text-slate-500 font-medium">
                            {inv.ticker ? inv.ticker : 'Renda Fixa'} • {inv.quantity?.toFixed(4) || 1} cotas
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-800">
                            R$ {inv.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <p className={`text-xs font-bold ${inv.currentAmount >= inv.investedAmount ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {inv.currentAmount >= inv.investedAmount ? '+' : ''}
                            {((inv.currentAmount - inv.investedAmount) / inv.investedAmount * 100).toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <InvestmentWizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
      />
    </div>
  );
};

// Helpers
const getInvestmentLabel = (type: InvestmentType | string) => {
  switch (type) {
    case 'fixed_income': return 'Renda Fixa';
    case 'stock': return 'Ações';
    case 'real_estate_fund': return 'Fundos Imob.';
    case 'crypto': return 'Criptomoedas';
    case 'exchange': return 'Exterior';
    case 'cdi': return 'Renda Fixa (Antigo)';
    case 'real_estate': return 'Imóveis (Antigo)';
    default: return type;
  }
};

const groupByType = (investments: Investment[]) => {
  return investments.reduce((acc, curr) => {
    const type = curr.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(curr);
    return acc;
  }, {} as Record<string, Investment[]>);
};
