import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface GoalFormProps {
  onSuccess: () => void;
}

export const GoalForm: React.FC<GoalFormProps> = ({ onSuccess }) => {
  const { addGoal } = useFinance();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addGoal({
      name,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount) || 0,
      deadline: deadline || undefined,
    });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nome da Meta"
        placeholder="Ex: Reserva de Emergência"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Valor Alvo"
          type="number"
          step="0.01"
          required
          placeholder="0,00"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
        />
        <Input
          label="Valor Inicial"
          type="number"
          step="0.01"
          placeholder="0,00"
          value={currentAmount}
          onChange={(e) => setCurrentAmount(e.target.value)}
        />
      </div>
      <Input
        label="Prazo (Opcional)"
        type="date"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
      />
      <div className="pt-4">
        <Button type="submit" fullWidth>Criar Meta</Button>
      </div>
    </form>
  );
};
