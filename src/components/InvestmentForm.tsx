import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { InvestmentType } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

interface InvestmentFormProps {
  onSuccess: () => void;
}

const INVESTMENT_TYPES: { value: InvestmentType; label: string }[] = [
  { value: 'cdi', label: 'Renda Fixa (CDI)' },
  { value: 'stock', label: 'Ações' },
  { value: 'real_estate', label: 'Fundos Imobiliários' },
  { value: 'crypto', label: 'Criptomoedas' },
];

export const InvestmentForm: React.FC<InvestmentFormProps> = ({ onSuccess }) => {
  const { addInvestment } = useFinance();
  const [name, setName] = useState('');
  const [type, setType] = useState<InvestmentType>('cdi');
  const [investedAmount, setInvestedAmount] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ao criar, o valor atual é igual ao valor investido inicialmente
    const initialAmount = Number(investedAmount);
    
    addInvestment({
      name,
      type,
      investedAmount: initialAmount,
      currentAmount: initialAmount,
      targetAmount: targetAmount ? Number(targetAmount) : undefined,
    });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nome do Investimento"
        placeholder="Ex: Reserva de Emergência / Tesouro Selic"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      
      <Select
        label="Tipo"
        options={INVESTMENT_TYPES}
        value={type}
        onChange={(e) => setType(e.target.value as InvestmentType)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Valor já Investido"
          type="number"
          step="0.01"
          required
          placeholder="0,00"
          value={investedAmount}
          onChange={(e) => setInvestedAmount(e.target.value)}
        />
        <Input
          label="Objetivo (Opcional)"
          type="number"
          step="0.01"
          placeholder="0,00"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
        />
      </div>
      
      <div className="pt-4">
        <Button type="submit" fullWidth>Criar Investimento</Button>
      </div>
    </form>
  );
};
