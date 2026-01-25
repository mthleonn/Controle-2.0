export type TransactionType = 'income' | 'expense';

export type TransactionCategory = 
  | 'Moradia' 
  | 'Alimentação' 
  | 'Transporte' 
  | 'Saúde' 
  | 'Educação' 
  | 'Lazer' 
  | 'Gasto Fixo'
  | 'Assinaturas'
  | 'Vestuário'
  | 'Presentes'
  | 'Manutenção'
  | 'Outros'
  | 'Salário'
  | 'Investimento'
  | 'Renda Extra';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO format YYYY-MM-DD
  category: TransactionCategory;
  type: TransactionType;
  isEssential: boolean;
  paymentMethod: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
}

export type InvestmentType = 'cdi' | 'crypto' | 'stock' | 'real_estate';

export interface Investment {
  id: string;
  name: string;
  type: InvestmentType;
  investedAmount: number;
  currentAmount: number;
  targetAmount?: number; // Valor total do objetivo (opcional)
}

export interface DashboardStats {
  totalBalance: number;
  totalExpenses: number;
  totalIncome: number;
  totalInvested: number;
  essentialExpenses: number;
  nonEssentialExpenses: number;
}
