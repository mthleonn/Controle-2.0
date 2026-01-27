import { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { TrendingUp, Lightbulb, Wallet, AlertTriangle, ShieldCheck, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../utils/format';

export interface Insight {
  type: 'danger' | 'warning' | 'success' | 'info';
  icon: any;
  title: string;
  message: string;
  action?: string;
}

export interface SimulationResult {
  allowed: boolean;
  remainingBalance: number;
  impactMessage: string;
  affectedGoals: string[];
  impacts: {
    balance: string;
    emergency: string;
    goals: string;
  };
}

export const useFinancialInsights = () => {
  const { transactions, goals, getStats } = useFinance();
  const stats = getStats();

  // --- Insight Generation Logic ---
  const insights = useMemo<Insight[]>(() => {
    const list: Insight[] = [];
    const essentialPercentage = stats.totalExpenses > 0 ? (stats.essentialExpenses / stats.totalExpenses) * 100 : 0;
    const nonEssentialPercentage = stats.totalExpenses > 0 ? (stats.nonEssentialExpenses / stats.totalExpenses) * 100 : 0;
    
    // 1. Balance Warning
    if (stats.totalExpenses > stats.totalIncome && stats.totalIncome > 0) {
      list.push({
        type: 'danger',
        icon: AlertTriangle,
        title: 'Gastos Superando Ganhos',
        message: 'Você está gastando mais do que ganha. Revise seus gastos não essenciais imediatamente.'
      });
    }

    // 2. Essential Expenses High
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

    // 3. Investment Advice
    if (stats.totalInvested === 0 && stats.totalIncome > 0) {
      list.push({
        type: 'info',
        icon: TrendingUp,
        title: 'Comece a Investir',
        message: 'Você tem saldo positivo mas nenhum investimento. Que tal começar sua Reserva de Emergência?'
      });
    }

    // 4. Non-Essential Spending Alert (New)
    if (nonEssentialPercentage > 40) {
      list.push({
        type: 'warning',
        icon: Wallet,
        title: 'Atenção aos Supérfluos',
        message: `Você gastou ${nonEssentialPercentage.toFixed(0)}% com não essenciais este mês. Reduzir aqui é o caminho mais rápido para atingir suas metas.`
      });
    }

    // 5. Goal Acceleration Tip (New)
    // Find a goal that is not completed
    const activeGoal = goals.find(g => g.currentAmount < g.targetAmount);
    if (activeGoal && stats.nonEssentialExpenses > 0) {
      const potentialSavings = stats.nonEssentialExpenses * 0.2; // Suggest saving 20% of non-essentials
      if (potentialSavings > 50) {
        list.push({
          type: 'info',
          icon: Lightbulb,
          title: 'Acelere sua Meta',
          message: `Se economizar ${formatCurrency(potentialSavings)} em gastos supérfluos, você pode atingir a meta "${activeGoal.name}" mais rápido!`
        });
      }
    }

    return list;
  }, [stats, transactions, goals]);

  // --- Simulation Logic ---
  const simulatePurchase = (amount: number): SimulationResult => {
    const currentBalance = stats.totalBalance; // Income - Expenses
    const remainingBalance = currentBalance - amount;
    const isSafe = remainingBalance >= 0;

    // 1. Impacto no Saldo
    const balanceImpact = isSafe
      ? `Saldo final positivo: ${formatCurrency(remainingBalance)}`
      : `Saldo final NEGATIVO: ${formatCurrency(remainingBalance)}`;

    // 2. Impacto na Reserva
    const emergencyGoal = goals.find(g => g.name.toLowerCase().includes('emergência') || g.name.toLowerCase().includes('reserva'));
    let emergencyImpact = "Não afeta a reserva.";
    const affectedGoals: string[] = [];

    if (!isSafe) {
      if (emergencyGoal && emergencyGoal.currentAmount > 0) {
         const deficit = Math.abs(remainingBalance);
         emergencyImpact = `Consome ${formatCurrency(deficit)} da reserva.`;
         affectedGoals.push(emergencyGoal.name);
      } else {
         emergencyImpact = "Deixa você no vermelho (sem reserva).";
      }
    }

    // 3. Impacto nas Metas
    // Find the goal closest to completion
    const targetGoal = goals.filter(g => g.currentAmount < g.targetAmount).sort((a,b) => (a.targetAmount - a.currentAmount) - (b.targetAmount - b.currentAmount))[0];
    let goalImpact = "Sem impacto direto.";
    
    if (targetGoal) {
        const percentOfRemaining = (amount / (targetGoal.targetAmount - targetGoal.currentAmount)) * 100;
        if (percentOfRemaining > 100) {
             goalImpact = `Valor superior ao restante para "${targetGoal.name}".`;
        } else {
             goalImpact = `Equivale a ${percentOfRemaining.toFixed(1)}% do que falta para "${targetGoal.name}".`;
        }
    }

    const impactMessage = isSafe 
      ? `Você pode comprar! ${balanceImpact}` 
      : `Cuidado! ${balanceImpact}`;

    return {
      allowed: isSafe,
      remainingBalance,
      impactMessage,
      affectedGoals,
      impacts: {
        balance: balanceImpact,
        emergency: emergencyImpact,
        goals: goalImpact
      }
    };
  };

  return {
    insights,
    simulatePurchase,
    stats
  };
};
