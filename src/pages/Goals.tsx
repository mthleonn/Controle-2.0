import { useState } from 'react';
import { Plus, Target, Calendar, Trash2, TrendingUp, Clock } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { GoalForm } from '../components/GoalForm';
import { formatCurrency, calculateProgress, formatDate } from '../utils/format';
import { differenceInMonths, addMonths, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Goals = () => {
  const { goals, updateGoal, removeGoal } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [updateAmount, setUpdateAmount] = useState('');

  const handleUpdateGoal = (id: string) => {
    if (!updateAmount) return;
    updateGoal(id, Number(updateAmount));
    setEditingGoal(null);
    setUpdateAmount('');
  };

  const calculateProjection = (currentAmount: number, targetAmount: number, createdAt: string) => {
    if (currentAmount <= 0) return null;
    
    const startDate = parseISO(createdAt);
    const today = new Date();
    
    // Calculate months passed, ensuring at least 1 month to avoid division by zero
    // Using max(1) also helps normalize the first month's contribution
    const monthsPassed = Math.max(1, differenceInMonths(today, startDate));
    
    const avgMonthlyContribution = currentAmount / monthsPassed;
    const remainingAmount = targetAmount - currentAmount;
    
    if (remainingAmount <= 0) return { reached: true };
    
    const monthsToReach = Math.ceil(remainingAmount / avgMonthlyContribution);
    const projectedDate = addMonths(today, monthsToReach);
    
    return {
      reached: false,
      avgContribution: avgMonthlyContribution,
      monthsToReach,
      projectedDate
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Metas Financeiras</h1>
          <p className="text-slate-500">Defina e acompanhe seus objetivos.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          Nova Meta
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
          const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
          const projection = calculateProjection(goal.currentAmount, goal.targetAmount, goal.createdAt);

          return (
            <Card key={goal.id} className="relative overflow-hidden flex flex-col h-full">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Target size={100} />
              </div>
              
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-slate-800">{goal.name}</h3>
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded-lg text-xs font-bold">
                    {progress.toFixed(0)}%
                  </span>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Acumulado</span>
                    <span className="font-bold text-slate-800">{formatCurrency(goal.currentAmount)}</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Faltam {formatCurrency(remaining)}</span>
                    <span>Meta: {formatCurrency(goal.targetAmount)}</span>
                  </div>
                </div>

                {/* Projeção Inteligente */}
                {projection && !projection.reached && (
                  <div className="mb-6 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                    <div className="flex items-center gap-2 mb-2 text-indigo-700 font-medium text-sm">
                      <TrendingUp size={16} />
                      <span>Projeção Inteligente</span>
                    </div>
                    <div className="space-y-1 text-xs text-indigo-600">
                      <p>Média mensal: <span className="font-bold">{formatCurrency(projection.avgContribution || 0)}</span></p>
                      <div className="flex items-center gap-1 mt-2 pt-2 border-t border-indigo-200">
                        <Clock size={12} />
                        <span>
                          Atingirá em <strong>{projection.projectedDate ? format(projection.projectedDate, "MMMM 'de' yyyy", { locale: ptBR }) : 'N/A'}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-auto space-y-4">
                  {goal.deadline && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar size={16} />
                      <span>Prazo: {formatDate(goal.deadline)}</span>
                    </div>
                  )}

                  {editingGoal === goal.id ? (
                    <div className="flex gap-2">
                      <Input 
                        type="number" 
                        placeholder="Novo valor" 
                        value={updateAmount}
                        onChange={(e) => setUpdateAmount(e.target.value)}
                        className="h-10 py-1"
                      />
                      <Button size="sm" onClick={() => handleUpdateGoal(goal.id)}>OK</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingGoal(null)}>X</Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        size="sm"
                        onClick={() => {
                          setEditingGoal(goal.id);
                          setUpdateAmount(goal.currentAmount.toString());
                        }}
                      >
                        Atualizar Saldo
                      </Button>
                      <button 
                        onClick={() => removeGoal(goal.id)}
                        className="text-slate-400 hover:text-danger transition-colors p-2 hover:bg-danger/10 rounded-lg"
                        title="Excluir Meta"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Meta"
      >
        <GoalForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};
