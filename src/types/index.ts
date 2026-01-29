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

export type RecurrenceFrequency = 'weekly' | 'monthly' | 'yearly';

export interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  category: TransactionCategory;
  type: TransactionType;
  isEssential: boolean;
  paymentMethod: string;
  frequency: RecurrenceFrequency;
  startDate: string;
  nextRun: string;
  active: boolean;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO format YYYY-MM-DD
  category: TransactionCategory;
  type: TransactionType;
  isEssential: boolean;
  paymentMethod: string;
  receiptUrl?: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  createdAt: string;
}

export type InvestmentType = 'fixed_income' | 'stock' | 'real_estate_fund' | 'crypto' | 'exchange';

export interface Investment {
  id: string;
  name: string;
  type: InvestmentType;
  investedAmount: number;
  currentAmount: number;
  targetAmount?: number; // Valor total do objetivo (opcional)
  ticker?: string; // Código da ação/cripto (Ex: PETR4, BTC)
  quantity?: number; // Quantidade de cotas/moedas
  lastUpdate?: string; // Data da última atualização
}

export interface DashboardStats {
  totalBalance: number;
  totalExpenses: number;
  totalIncome: number;
  totalInvested: number;
  essentialExpenses: number;
  nonEssentialExpenses: number;
}

export interface CoinGeckoMarketData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  image: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
