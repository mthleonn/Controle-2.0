import { useMemo, useState } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  PieChart, Pie, AreaChart, Area
} from 'recharts';
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, Wallet, ShieldCheck, Trophy } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Card } from '../components/ui/Card';
import { formatCurrency } from '../utils/format';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

export const Reports = () => {
  const { transactions, getStats } = useFinance();
  const stats = getStats();
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis'>('overview');

  // --- Processamento de Dados ---

  // 1. Dados por Categoria (Pie Chart)
  const expensesByCategory = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
      }, {} as Record<string, number>);
  }, [transactions]);

  const categoryData = useMemo(() => {
    return Object.entries(expensesByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 categorias
  }, [expensesByCategory]);

  // 2. Evolução Financeira (Area Chart)
  const evolutionData = useMemo(() => {
    const dataByDate = transactions.reduce((acc, curr) => {
      const date = curr.date; // YYYY-MM-DD
      if (!acc[date]) acc[date] = { date, income: 0, expense: 0 };
      if (curr.type === 'income') acc[date].income += curr.amount;
      if (curr.type === 'expense') acc[date].expense += curr.amount;
      return acc;
    }, {} as Record<string, { date: string, income: number, expense: number }>);

    return Object.values(dataByDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30); // Últimos 30 registros
  }, [transactions]);

  // 3. Score de Saúde Financeira (0-100)
  const healthScore = useMemo(() => {
    let score = 0;
    if (stats.totalIncome === 0) return 0;

    const savingsRate = ((stats.totalIncome - stats.totalExpenses) / stats.totalIncome) * 100;
    const investmentRate = (stats.totalInvested / stats.totalIncome) * 100; // Aproximação baseada no total investido
    const essentialRate = (stats.essentialExpenses / stats.totalIncome) * 100;

    // Pontos por poupança positiva (max 40)
    if (savingsRate > 20) score += 40;
    else if (savingsRate > 0) score += savingsRate * 2;

    // Pontos por investimentos (max 30)
    if (stats.totalInvested > 0) score += 20;
    if (investmentRate > 10) score += 10;

    // Pontos por controle de gastos essenciais (max 30)
    if (essentialRate < 55) score += 30;
    else if (essentialRate < 70) score += 15;

    return Math.min(Math.round(score), 100);
  }, [stats]);

  // 4. Insights
  const insights = useMemo(() => {
    const list = [];
    const essentialPercentage = stats.totalExpenses > 0 ? (stats.essentialExpenses / stats.totalExpenses) * 100 : 0;

    if (stats.totalExpenses > stats.totalIncome && stats.totalIncome > 0) {
      list.push({
        type: 'danger',
        icon: AlertTriangle,
        title: 'Gastos Superando Ganhos',
        message: 'Você está gastando mais do que ganha. Revise seus gastos não essenciais imediatamente.'
      });
    }

    if (essentialPercentage > 60) {
      list.push({
        type: 'warning',
        icon: ShieldCheck,
        title: 'Gastos Essenciais Altos',
        message: `Seus gastos fixos consomem ${essentialPercentage.toFixed(0)}% do orçamento. O ideal é manter abaixo de 50%.`
      });
    } else if (essentialPercentage > 0 && essentialPercentage < 50) {
      list.push({
        type: 'success',
        icon: CheckCircle,
        title: 'Orçamento Saudável',
        message: 'Ótimo equilíbrio! Seus gastos essenciais estão sob controle.'
      });
    }

    if (stats.totalInvested === 0 && stats.totalIncome > 0) {
      list.push({
        type: 'info',
        icon: TrendingUp,
        title: 'Comece a Investir',
        message: 'Você tem saldo positivo mas nenhum investimento. Que tal começar sua Reserva de Emergência?'
      });
    }

    return list;
  }, [stats, transactions]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Relatório Financeiro</h1>
          <p className="text-slate-500 mt-1">Análise profunda da sua saúde patrimonial.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Visão Geral
          </button>
          <button 
            onClick={() => setActiveTab('analysis')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'analysis' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Análise Detalhada
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score Card - Hero Section */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2 text-slate-300">
                  <Trophy size={20} className="text-yellow-400" />
                  <span className="text-sm font-medium uppercase tracking-wider">Financial Score</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  {healthScore} <span className="text-2xl text-slate-400 font-normal">/ 100</span>
                </h2>
                <p className="text-slate-300 leading-relaxed max-w-md">
                  {healthScore >= 80 ? 'Excelente! Sua gestão financeira está impecável. Continue investindo e mantendo o controle.' : 
                   healthScore >= 50 ? 'Bom caminho! Você tem controle, mas pode otimizar seus gastos fixos e aumentar os investimentos.' :
                   'Atenção necessária. Seus gastos estão comprometendo sua saúde financeira. Foque em reduzir despesas.'}
                </p>
              </div>
              
              {/* Circular Progress Mockup */}
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-8 border-slate-700 flex items-center justify-center relative">
                <div 
                  className={`absolute inset-0 rounded-full border-8 border-t-emerald-500 border-r-emerald-500 border-b-transparent border-l-transparent transform -rotate-45 transition-all duration-1000`}
                  style={{ opacity: healthScore / 100 }}
                ></div>
                <Wallet size={48} className="text-emerald-400" />
              </div>
            </div>
            
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          </div>

          {/* Quick Stats Column */}
          <div className="space-y-4">
            <Card className="bg-white border-none shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">Economia Mensal</p>
                  <h3 className={`text-2xl font-bold ${stats.totalIncome - stats.totalExpenses >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatCurrency(stats.totalIncome - stats.totalExpenses)}
                  </h3>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <Wallet className="text-emerald-600" size={24} />
                </div>
              </div>
              <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full" 
                  style={{ width: `${Math.min(((stats.totalIncome - stats.totalExpenses) / stats.totalIncome) * 100, 100)}%` }} 
                />
              </div>
            </Card>

            <Card className="bg-white border-none shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">Total Investido</p>
                  <h3 className="text-2xl font-bold text-blue-600">
                    {formatCurrency(stats.totalInvested)}
                  </h3>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <TrendingUp className="text-blue-600" size={24} />
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Fluxo de Caixa (30 dias)" className="shadow-lg border-none">
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolutionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).getDate().toString()} 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis 
                  hide 
                />
                <RechartsTooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  name="Receita"
                  stroke="#10B981" 
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                  strokeWidth={3}
                />
                <Area 
                  type="monotone" 
                  dataKey="expense" 
                  name="Despesa"
                  stroke="#EF4444" 
                  fillOpacity={1} 
                  fill="url(#colorExpense)" 
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Top Despesas" className="shadow-lg border-none">
          <div className="flex flex-col md:flex-row items-center gap-6 md:h-[300px]">
            <div className="w-full md:w-1/2 h-[250px] md:h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 space-y-3 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
              {categoryData.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-sm font-medium text-slate-700">{entry.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{formatCurrency(entry.value)}</span>
                </div>
              ))}
              {categoryData.length === 0 && (
                <p className="text-center text-slate-400 text-sm">Nenhuma despesa registrada.</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Insights Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Lightbulb className="text-yellow-500 fill-yellow-500" />
          Consultor Financeiro IA
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((insight, index) => (
            <div 
              key={index} 
              className={`p-6 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-md bg-white
                ${insight.type === 'danger' ? 'border-red-100 bg-red-50/30' : 
                  insight.type === 'warning' ? 'border-orange-100 bg-orange-50/30' : 
                  insight.type === 'success' ? 'border-emerald-100 bg-emerald-50/30' : 
                  'border-blue-100 bg-blue-50/30'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl 
                  ${insight.type === 'danger' ? 'bg-red-100 text-red-600' : 
                    insight.type === 'warning' ? 'bg-orange-100 text-orange-600' : 
                    insight.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 
                    'bg-blue-100 text-blue-600'}`}
                >
                  <insight.icon size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">{insight.title}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{insight.message}</p>
                </div>
              </div>
            </div>
          ))}
          
          {insights.length === 0 && (
            <div className="col-span-full p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-500">
                Seus dados financeiros parecem equilibrados! Continue registrando transações para receber mais dicas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
