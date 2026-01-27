import React from 'react';
import { useGamification } from '../hooks/useGamification';

export const GamificationWidget: React.FC = () => {
  const { streak, badges } = useGamification();
  const nextBadge = badges.find(b => !b.unlocked);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-800">Suas Conquistas</h3>
          <p className="text-xs text-slate-500">Mantenha o foco para desbloquear emblemas.</p>
        </div>
        <div className="flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
          <span>🔥 {streak} dias seguidos</span>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {badges.map(badge => (
          <div 
            key={badge.id}
            className={`flex flex-col items-center justify-center p-3 rounded-xl text-center transition-all ${
              badge.unlocked 
                ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm' 
                : 'bg-slate-50 text-slate-300 border border-slate-100 grayscale opacity-70'
            }`}
            title={badge.description}
          >
            <span className="text-2xl mb-2">{badge.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider leading-tight">{badge.name}</span>
          </div>
        ))}
      </div>
      
      {nextBadge && (
        <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 text-center">
          Próxima meta: <span className="font-medium text-indigo-600">{nextBadge.name}</span> — {nextBadge.description}
        </div>
      )}
    </div>
  );
};
