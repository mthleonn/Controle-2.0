import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Transaction, Goal, Investment, DashboardStats, RecurrenceFrequency, Note } from '../types';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';
import { MarketDataService } from '../services/marketData';
import { processRecurringTransactions } from '../services/recurringService';
import { parseISO, addWeeks, addMonths, addYears, format } from 'date-fns';

interface FinanceContextType {
  transactions: Transaction[];
  goals: Goal[];
  investments: Investment[];
  notes: Note[];
  loading: boolean;
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>, recurrence?: { frequency: RecurrenceFrequency }, file?: File) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
  updateGoal: (id: string, amount: number) => Promise<void>;
  addInvestment: (investment: Omit<Investment, 'id'>) => Promise<void>;
  sellInvestment: (id: string, quantityToSell: number, salePrice: number) => Promise<void>;
  removeInvestment: (id: string) => Promise<void>;
  updateInvestment: (id: string, currentAmount: number) => Promise<void>;
  refreshQuotes: () => Promise<void>;
  getStats: () => DashboardStats;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateNote: (id: string, note: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

  const togglePrivacyMode = () => setIsPrivacyMode(prev => !prev);

  const fetchData = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setGoals([]);
      setInvestments([]);
      setLoading(false);
      return;
    }

    // Only show loading on first fetch
    setLoading(true);
    
    try {
      // Process recurring transactions before fetching
      await processRecurringTransactions(user.id);

      // Fetch Transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (transactionsError) throw transactionsError;

      // Fetch Goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*');

      if (goalsError) throw goalsError;

      // Fetch Investments
      const { data: investmentsData, error: investmentsError } = await supabase
        .from('investments')
        .select('*');

      if (investmentsError) throw investmentsError;

      // Fetch Notes
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (notesError) throw notesError;

      // Map DB to State
      setTransactions(transactionsData.map((t: any) => ({
        id: t.id,
        description: t.description,
        amount: Number(t.amount),
        date: t.date,
        category: t.category,
        type: t.type,
        isEssential: t.is_essential,
        paymentMethod: t.payment_method,
        receiptUrl: t.receipt_url
      })));

      setGoals(goalsData.map((g: any) => ({
        id: g.id,
        name: g.name,
        targetAmount: Number(g.target_amount),
        currentAmount: Number(g.current_amount),
        deadline: g.deadline,
        createdAt: g.created_at
      })));

      setInvestments(investmentsData.map((i: any) => ({
        id: i.id,
        name: i.name,
        type: i.type,
        investedAmount: Number(i.invested_amount),
        currentAmount: Number(i.current_amount),
        targetAmount: i.target_amount ? Number(i.target_amount) : undefined,
        ticker: i.ticker,
        quantity: i.quantity ? Number(i.quantity) : undefined
      })));

      setNotes(notesData.map((n: any) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        tags: n.tags,
        isFavorite: n.is_favorite,
        relatedGoalId: n.related_goal_id,
        relatedInvestmentId: n.related_investment_id,
        relatedMonth: n.related_month,
        createdAt: n.created_at,
        updatedAt: n.updated_at
      })));

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>, recurrence?: { frequency: RecurrenceFrequency }) => {
    if (!user) return;
    
    // Optimistic Update
    const tempId = crypto.randomUUID();
    const newTransaction = { ...transaction, id: tempId };
    setTransactions(prev => [newTransaction, ...prev]);

    try {
      const { data, error } = await supabase.from('transactions').insert([{
        user_id: user.id,
        description: transaction.description,
        amount: transaction.amount,
        date: transaction.date,
        category: transaction.category,
        type: transaction.type,
        is_essential: transaction.isEssential,
        payment_method: transaction.paymentMethod
      }]).select().single();

      if (error) throw error;

      // Update with real ID
      setTransactions(prev => prev.map(t => t.id === tempId ? { ...newTransaction, id: data.id } : t));

      // Handle recurrence
      if (recurrence) {
        let nextDate = parseISO(transaction.date);
        switch (recurrence.frequency) {
          case 'weekly':
            nextDate = addWeeks(nextDate, 1);
            break;
          case 'monthly':
            nextDate = addMonths(nextDate, 1);
            break;
          case 'yearly':
            nextDate = addYears(nextDate, 1);
            break;
        }

        const { error: recurError } = await supabase.from('recurring_transactions').insert({
          user_id: user.id,
          description: transaction.description,
          amount: transaction.amount,
          category: transaction.category,
          type: transaction.type,
          is_essential: transaction.isEssential,
          payment_method: transaction.paymentMethod,
          frequency: recurrence.frequency,
          start_date: transaction.date,
          next_run: format(nextDate, 'yyyy-MM-dd')
        });

        if (recurError) {
          console.error('Error adding recurrence:', recurError);
        }
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      setTransactions(prev => prev.filter(t => t.id !== tempId));
    }
  };

  const removeTransaction = async (id: string) => {
    if (!user) return;

    const prevTransactions = [...transactions];
    setTransactions(prev => prev.filter(t => t.id !== id));

    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error removing transaction:', error);
      setTransactions(prevTransactions);
    }
  };

  const addGoal = async (goal: Omit<Goal, 'id' | 'createdAt'>) => {
    if (!user) return;

    const tempId = crypto.randomUUID();
    const newGoal = { ...goal, id: tempId, createdAt: new Date().toISOString() };
    setGoals(prev => [...prev, newGoal]);

    try {
      const { data, error } = await supabase.from('goals').insert([{
        user_id: user.id,
        name: goal.name,
        target_amount: goal.targetAmount,
        current_amount: goal.currentAmount,
        deadline: goal.deadline
      }]).select().single();

      if (error) throw error;

      setGoals(prev => prev.map(g => g.id === tempId ? { ...newGoal, id: data.id, createdAt: data.created_at } : g));
    } catch (error) {
      console.error('Error adding goal:', error);
      setGoals(prev => prev.filter(g => g.id !== tempId));
    }
  };

  const removeGoal = async (id: string) => {
    if (!user) return;
    const prevGoals = [...goals];
    setGoals(prev => prev.filter(g => g.id !== id));

    try {
      const { error } = await supabase.from('goals').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error removing goal:', error);
      setGoals(prevGoals);
    }
  };

  const updateGoal = async (id: string, amount: number) => {
    if (!user) return;
    
    setGoals(prev => prev.map(g => g.id === id ? { ...g, currentAmount: amount } : g));

    try {
      const { error } = await supabase.from('goals').update({ current_amount: amount }).eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating goal:', error);
      // Need fetch to rollback properly or store previous state
    }
  };

  const addInvestment = async (investment: Omit<Investment, 'id'>) => {
    if (!user) return;

    // Verifica se já existe o ativo na carteira (pelo Ticker ou Nome para Renda Fixa)
    const existingInvestment = investments.find(i => 
      (investment.ticker && i.ticker === investment.ticker && i.type === investment.type) ||
      (!investment.ticker && i.name === investment.name && i.type === investment.type)
    );

    if (existingInvestment) {
      // ATUALIZAÇÃO (Preço Médio)
      const newQuantity = (existingInvestment.quantity || 0) + (investment.quantity || 0);
      const newInvestedAmount = existingInvestment.investedAmount + investment.investedAmount;
      // Assume que o valor atual do novo aporte é igual ao valor investido inicialmente
      const newCurrentAmount = existingInvestment.currentAmount + investment.currentAmount; 

      // Optimistic Update
      setInvestments(prev => prev.map(i => i.id === existingInvestment.id ? {
        ...i,
        quantity: newQuantity,
        investedAmount: newInvestedAmount,
        currentAmount: newCurrentAmount
      } : i));

      try {
        const { error } = await supabase.from('investments').update({
          quantity: newQuantity,
          invested_amount: newInvestedAmount,
          current_amount: newCurrentAmount
        }).eq('id', existingInvestment.id);

        if (error) throw error;
      } catch (error) {
        console.error('Error updating investment:', error);
        // Revert seria ideal aqui
      }

    } else {
      // NOVO CADASTRO
      const tempId = crypto.randomUUID();
      const newInvestment = { ...investment, id: tempId };
      setInvestments(prev => [...prev, newInvestment]);

      try {
        const { data, error } = await supabase.from('investments').insert([{
          user_id: user.id,
          name: investment.name,
          type: investment.type,
          invested_amount: investment.investedAmount,
          current_amount: investment.currentAmount,
          target_amount: investment.targetAmount,
          ticker: investment.ticker,
          quantity: investment.quantity
        }]).select().single();

        if (error) throw error;

        setInvestments(prev => prev.map(i => i.id === tempId ? { ...newInvestment, id: data.id } : i));
      } catch (error) {
        console.error('Error adding investment:', error);
        setInvestments(prev => prev.filter(i => i.id !== tempId));
      }
    }
  };

  const refreshQuotes = async () => {
    const investmentsToUpdate = investments.filter(i => i.ticker && i.quantity && i.quantity > 0);
    if (investmentsToUpdate.length === 0) return;

    const tickers = Array.from(new Set(investmentsToUpdate.map(i => i.ticker!)));
    const quotes = await MarketDataService.getQuotes(tickers);

    const updatedInvestments = investments.map(investment => {
      if (investment.ticker && quotes[investment.ticker]) {
        const quote = quotes[investment.ticker];
        const newAmount = (investment.quantity || 0) * quote.price;
        return { ...investment, currentAmount: newAmount };
      }
      return investment;
    });

    setInvestments(updatedInvestments);
  };

  const removeInvestment = async (id: string) => {
    if (!user) return;
    const prevInvestments = [...investments];
    setInvestments(prev => prev.filter(i => i.id !== id));

    try {
      const { error } = await supabase.from('investments').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error removing investment:', error);
      setInvestments(prevInvestments);
    }
  };

  const sellInvestment = async (id: string, quantityToSell: number, salePrice: number) => {
    if (!user) return;
    const investment = investments.find(i => i.id === id);
    if (!investment) return;

    const currentQuantity = investment.quantity || 0;
    const newQuantity = currentQuantity - quantityToSell;

    if (newQuantity <= 0.000001) {
      // Venda total -> Remover
      await removeInvestment(id);
    } else {
      // Venda parcial -> Atualizar
      // Reduzir investedAmount proporcionalmente para manter o Preço Médio
      const averagePrice = investment.investedAmount / currentQuantity;
      const newInvestedAmount = averagePrice * newQuantity;
      
      // Atualizar currentAmount com base no preço de venda (assumindo que é o preço atual de mercado)
      const newCurrentAmount = newQuantity * salePrice; 

      const updatedInvestment = {
        ...investment,
        quantity: newQuantity,
        investedAmount: newInvestedAmount,
        currentAmount: newCurrentAmount
      };

      setInvestments(prev => prev.map(i => i.id === id ? updatedInvestment : i));

      try {
        const { error } = await supabase.from('investments').update({
          quantity: newQuantity,
          invested_amount: newInvestedAmount,
          current_amount: newCurrentAmount
        }).eq('id', id);
        
        if (error) throw error;
      } catch (error) {
        console.error('Error selling investment:', error);
        // Revert não implementado por simplicidade, mas seria ideal
      }
    }
  };

  const updateInvestment = async (id: string, currentAmount: number) => {
    if (!user) return;

    setInvestments(prev => prev.map(inv => inv.id === id ? { ...inv, currentAmount } : inv));

    try {
      const { error } = await supabase.from('investments').update({ current_amount: currentAmount }).eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating investment:', error);
    }
  };

  const getStats = (): DashboardStats => {
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const essentialExpenses = transactions
      .filter(t => t.type === 'expense' && t.isEssential)
      .reduce((acc, curr) => acc + curr.amount, 0);

    const nonEssentialExpenses = transactions
      .filter(t => t.type === 'expense' && !t.isEssential)
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    const totalInvested = investments.reduce((acc, curr) => acc + curr.currentAmount, 0);

    return {
      totalBalance: totalIncome - totalExpenses,
      totalExpenses,
      totalIncome,
      totalInvested,
      essentialExpenses,
      nonEssentialExpenses,
    };
  };

  const addNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const tempId = crypto.randomUUID();
    const now = new Date().toISOString();
    const newNote = { ...note, id: tempId, createdAt: now, updatedAt: now };
    setNotes(prev => [newNote, ...prev]);

    try {
      const { data, error } = await supabase.from('notes').insert([{
        user_id: user.id,
        title: note.title,
        content: note.content,
        tags: note.tags,
        is_favorite: note.isFavorite,
        related_goal_id: note.relatedGoalId,
        related_investment_id: note.relatedInvestmentId,
        related_month: note.relatedMonth
      }]).select().single();

      if (error) throw error;

      setNotes(prev => prev.map(n => n.id === tempId ? {
        ...newNote,
        id: data.id,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      } : n));
    } catch (error) {
      console.error('Error adding note:', error);
      setNotes(prev => prev.filter(n => n.id !== tempId));
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    if (!user) return;
    
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n));

    try {
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.content !== undefined) dbUpdates.content = updates.content;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.isFavorite !== undefined) dbUpdates.is_favorite = updates.isFavorite;
      if (updates.relatedGoalId !== undefined) dbUpdates.related_goal_id = updates.relatedGoalId;
      if (updates.relatedInvestmentId !== undefined) dbUpdates.related_investment_id = updates.relatedInvestmentId;
      if (updates.relatedMonth !== undefined) dbUpdates.related_month = updates.relatedMonth;

      const { error } = await supabase.from('notes').update(dbUpdates).eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating note:', error);
      // Revert strategy would be needed here
    }
  };

  const deleteNote = async (id: string) => {
    if (!user) return;
    const prevNotes = [...notes];
    setNotes(prev => prev.filter(n => n.id !== id));

    try {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting note:', error);
      setNotes(prevNotes);
    }
  };

  return (
    <FinanceContext.Provider value={{
      transactions,
      goals,
      investments,
      notes,
      loading,
      isPrivacyMode,
      togglePrivacyMode,
      addTransaction,
      removeTransaction,
      addGoal,
      removeGoal,
      updateGoal,
      addInvestment,
      sellInvestment,
      removeInvestment,
      updateInvestment,
      refreshQuotes,
      getStats,
      addNote,
      updateNote,
      deleteNote
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
