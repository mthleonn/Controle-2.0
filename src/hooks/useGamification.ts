import { useState, useEffect, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { differenceInDays, parseISO } from 'date-fns';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export const useGamification = () => {
  const { goals, getStats } = useFinance();
  const stats = getStats();
  const [streak, setStreak] = useState(0);

  // Load streak from localStorage
  useEffect(() => {
    const lastLogin = localStorage.getItem('last_login_date');
    const currentStreak = Number(localStorage.getItem('user_streak') || 0);
    const today = new Date().toISOString().split('T')[0];

    if (lastLogin !== today) {
      if (lastLogin) {
        const daysDiff = differenceInDays(parseISO(today), parseISO(lastLogin));
        if (daysDiff === 1) {
           const newStreak = currentStreak + 1;
           setStreak(newStreak);
           localStorage.setItem('user_streak', String(newStreak));
        } else if (daysDiff > 1) {
           setStreak(1);
           localStorage.setItem('user_streak', '1');
        } else {
           setStreak(currentStreak);
        }
      } else {
        setStreak(1);
        localStorage.setItem('user_streak', '1');
      }
      localStorage.setItem('last_login_date', today);
    } else {
      setStreak(currentStreak);
    }
  }, []);

  const badges = useMemo<Badge[]>(() => {
    return [
      {
        id: 'first_goal',
        name: 'Primeira Conquista',
        description: 'Conclua sua primeira meta financeira.',
        icon: '🎯',
        unlocked: goals.some(g => g.currentAmount >= g.targetAmount && g.targetAmount > 0)
      },
      {
        id: 'investor_1',
        name: 'Investidor Iniciante',
        description: 'Faça seu primeiro investimento.',
        icon: '📈',
        unlocked: stats.totalInvested > 0
      },
      {
        id: 'saver',
        name: 'Poupador',
        description: 'Mantenha despesas essenciais abaixo de 50%.',
        icon: '💰',
        unlocked: stats.totalIncome > 0 && (stats.essentialExpenses / stats.totalIncome) < 0.5
      },
      {
        id: 'streak_3',
        name: 'Aquecendo',
        description: 'Acesse o app por 3 dias seguidos.',
        icon: '🔥',
        unlocked: streak >= 3
      },
      {
        id: 'streak_7',
        name: 'Focado',
        description: 'Acesse o app por 7 dias seguidos.',
        icon: '🚀',
        unlocked: streak >= 7
      },
      {
        id: 'streak_30',
        name: 'Disciplinado',
        description: 'Acesse o app por 30 dias seguidos.',
        icon: '👑',
        unlocked: streak >= 30
      }
    ];
  }, [goals, stats, streak]);

  return { streak, badges };
};
