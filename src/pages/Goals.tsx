import { useState } from 'react';
import { Plus, Target, Calendar, Trash2 } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { GoalForm } from '../components/GoalForm';
import { formatCurrency, calculateProgress, formatDate } from '../utils/format';

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

          return (
            <Card key={goal.id} className="relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Target size={100} />
              </div>
              
              <div className="relative z-10">
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

                {goal.deadline && (
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
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
