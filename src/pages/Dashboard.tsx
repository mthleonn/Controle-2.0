import { useState } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { TransactionForm } from '../components/TransactionForm';
import { formatCurrency, calculateProgress } from '../utils/format';
import { PrivacyMask } from '../components/PrivacyMask';
import { GamificationWidget } from '../components/GamificationWidget';

const COLORS = ['#0f172a', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'];

export const Dashboard = () => {
  const { transactions, goals, getStats } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const stats = getStats();

  // Dados para o gráfico de categorias
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

  const categoryData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value);

  const hasData = categoryData.length > 0;

  // Dados para o gráfico Essencial vs Não Essencial
  const essentialData = [
    { name: 'Essencial', value: stats.essentialExpenses },
    { name: 'Não Essencial', value: stats.nonEssentialExpenses },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Visão Geral</h1>
          <p className="text-slate-500">Acompanhe sua saúde financeira.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="shrink-0">
          <Plus size={20} />
          Adicionar Gasto
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Saldo Atual - Destaque Mobile */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-primary to-indigo-600 rounded-2xl p-5 md:p-6 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8 blur-2xl"></div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-white/80 mb-1">Saldo Atual</p>
            <h3 className="text-3xl font-bold break-words tracking-tight">
              <PrivacyMask value={stats.totalBalance} />
            </h3>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-white/90 bg-white/20 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
              <DollarSign size={14} />
              <span>Disponível</span>
            </div>
          </div>
        </div>

        <Card className="col-span-1 border-none shadow-sm bg-white/50 backdrop-blur-sm">
          <div className="p-3 md:p-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-danger/10 rounded-lg text-danger">
                <TrendingDown size={16} />
              </div>
              <p className="text-xs font-medium text-slate-500">Despesas</p>
            </div>
            <h3 className="text-lg md:text-2xl font-bold text-slate-800 break-words">
              <PrivacyMask value={stats.totalExpenses} />
            </h3>
          </div>
        </Card>

        <Card className="col-span-1 border-none shadow-sm bg-white/50 backdrop-blur-sm">
          <div className="p-3 md:p-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-500">
                <DollarSign size={16} />
              </div>
              <p className="text-xs font-medium text-slate-500">Receitas</p>
            </div>
            <h3 className="text-lg md:text-2xl font-bold text-slate-800 break-words">
              <PrivacyMask value={stats.totalIncome} />
            </h3>
          </div>
        </Card>

        <Card className="col-span-1 sm:col-span-2 lg:col-span-1 border-none shadow-sm bg-white/50 backdrop-blur-sm">
          <div className="p-3 md:p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Total Investido</p>
              <h3 className="text-xl md:text-2xl font-bold text-slate-800 break-words">
                <PrivacyMask value={stats.totalInvested} />
              </h3>
            </div>
            <div className="p-2 bg-accent/10 rounded-xl text-accent">
              <TrendingUp size={20} />
            </div>
          </div>
        </Card>
      </div>

      <GamificationWidget />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1 lg:col-span-2 min-h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Despesas por Categoria</h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400">
                <p>Nenhuma despesa registrada</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="col-span-1 lg:col-span-2 min-h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Essencial vs Não Essencial</h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={essentialData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#ef4444" /> {/* Não Essencial */}
                    <Cell fill="#22c55e" /> {/* Essencial */}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400">
                <p>Nenhuma despesa registrada</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Goals Progress */}
      <Card title="Metas Financeiras">
        <div className="space-y-6">
          {goals.map((goal) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            return (
              <div key={goal.id}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-slate-700">{goal.name}</span>
                  <span className="text-sm text-slate-500">
                    {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
                  </span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
          {goals.length === 0 && (
            <p className="text-slate-500 text-center py-4">Nenhuma meta cadastrada.</p>
          )}
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Adicionar Transação"
      >
        <TransactionForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};
