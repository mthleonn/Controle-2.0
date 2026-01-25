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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Saldo Atual</p>
              <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(stats.totalBalance)}</h3>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <DollarSign size={20} />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-danger">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Despesas</p>
              <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(stats.totalExpenses)}</h3>
            </div>
            <div className="p-2 bg-danger/10 rounded-lg text-danger">
              <TrendingDown size={20} />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Investido</p>
              <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(stats.totalInvested)}</h3>
            </div>
            <div className="p-2 bg-accent/10 rounded-lg text-accent">
              <TrendingUp size={20} />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Receitas</p>
              <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(stats.totalIncome)}</h3>
            </div>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500">
              <DollarSign size={20} />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1 lg:col-span-2 min-h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Despesas por Categoria</h3>
          <div className="h-[300px] w-full">
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
                  {categoryData.map((entry, index) => (
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
          </div>
        </Card>

        <Card className="col-span-1 lg:col-span-2 min-h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Essencial vs Não Essencial</h3>
          <div className="h-[300px] w-full">
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
