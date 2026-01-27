import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { TransactionCategory, TransactionType, RecurrenceFrequency } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

interface TransactionFormProps {
  onSuccess: () => void;
  initialType?: TransactionType;
}

const CATEGORIES: { value: TransactionCategory; label: string }[] = [
  { value: 'Moradia', label: 'Moradia' },
  { value: 'Alimentação', label: 'Alimentação' },
  { value: 'Transporte', label: 'Transporte' },
  { value: 'Saúde', label: 'Saúde' },
  { value: 'Educação', label: 'Educação' },
  { value: 'Lazer', label: 'Lazer' },
  { value: 'Gasto Fixo', label: 'Gasto Fixo' },
  { value: 'Assinaturas', label: 'Assinaturas' },
  { value: 'Vestuário', label: 'Vestuário' },
  { value: 'Presentes', label: 'Presentes' },
  { value: 'Manutenção', label: 'Manutenção' },
  { value: 'Outros', label: 'Outros' },
  { value: 'Salário', label: 'Salário' },
  { value: 'Investimento', label: 'Investimento' },
  { value: 'Renda Extra', label: 'Renda Extra' },
];

export const TransactionForm: React.FC<TransactionFormProps> = ({ onSuccess, initialType = 'expense' }) => {
  const { addTransaction } = useFinance();
  const [type, setType] = useState<TransactionType>(initialType);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('Outros');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isEssential, setIsEssential] = useState(true);
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('monthly');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addTransaction({
      description,
      amount: Number(amount),
      date,
      category,
      type,
      isEssential: type === 'expense' ? isEssential : true,
      paymentMethod: paymentMethod || 'Outros',
    }, isRecurring ? { frequency } : undefined);

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => setType('expense')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            type === 'expense' 
              ? 'bg-white text-danger shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Despesa
        </button>
        <button
          type="button"
          onClick={() => setType('income')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            type === 'income' 
              ? 'bg-white text-accent shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Receita
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Valor"
          type="number"
          step="0.01"
          required
          placeholder="0,00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Input
          label="Data"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <Input
        label="Descrição"
        placeholder="Ex: Supermercado"
        required
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Categoria"
          options={CATEGORIES}
          value={category}
          onChange={(e) => setCategory(e.target.value as TransactionCategory)}
        />
        <Input
          label="Forma de Pagamento"
          placeholder="Ex: Cartão Crédito"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <span className="block font-medium text-slate-800">Repetir automaticamente?</span>
            <span className="text-sm text-slate-500">Cria novas transações automaticamente.</span>
          </div>
          <button
            type="button"
            onClick={() => setIsRecurring(!isRecurring)}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              isRecurring ? 'bg-primary' : 'bg-slate-300'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                isRecurring ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        
        {isRecurring && (
          <Select
            label="Frequência"
            options={[
              { value: 'weekly', label: 'Semanal' },
              { value: 'monthly', label: 'Mensal' },
              { value: 'yearly', label: 'Anual' },
            ]}
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency)}
          />
        )}
      </div>

      {type === 'expense' && (
        <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl bg-slate-50/50">
          <div className="flex-1">
            <span className="block font-medium text-slate-800">Gasto Essencial?</span>
            <span className="text-sm text-slate-500">Define se este gasto é indispensável.</span>
          </div>
          <button
            type="button"
            onClick={() => setIsEssential(!isEssential)}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              isEssential ? 'bg-primary' : 'bg-slate-300'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                isEssential ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      )}

      <div className="pt-4">
        <Button type="submit" fullWidth>
          Adicionar {type === 'expense' ? 'Despesa' : 'Receita'}
        </Button>
      </div>
    </form>
  );
};
