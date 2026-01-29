import React from 'react';
import { Note } from '../../types';
import { Edit2, Trash2, Star, Calendar, Tag, Target, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useFinance } from '../../context/FinanceContext';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit }) => {
  const { updateNote, deleteNote, goals, investments } = useFinance();

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateNote(note.id, { isFavorite: !note.isFavorite });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir esta anotação?')) {
      deleteNote(note.id);
    }
  };

  const relatedGoal = note.relatedGoalId ? goals.find(g => g.id === note.relatedGoalId) : null;
  const relatedInvestment = note.relatedInvestmentId ? investments.find(i => i.id === note.relatedInvestmentId) : null;

  return (
    <div 
      onClick={() => onEdit(note)}
      className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group relative flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-slate-800 line-clamp-1 pr-8">{note.title}</h3>
        <button
          onClick={handleToggleFavorite}
          className={`absolute top-5 right-5 p-1 rounded-full transition-colors ${
            note.isFavorite ? 'text-amber-400 bg-amber-50' : 'text-slate-300 hover:text-amber-400 hover:bg-slate-50'
          }`}
        >
          <Star size={18} fill={note.isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      <p className="text-slate-600 text-sm mb-4 line-clamp-4 flex-grow whitespace-pre-wrap">
        {note.content}
      </p>

      <div className="space-y-3 mt-auto pt-3 border-t border-slate-50">
        {/* Context Badges */}
        {(relatedGoal || relatedInvestment || note.relatedMonth) && (
          <div className="flex flex-wrap gap-2">
            {relatedGoal && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md">
                <Target size={12} />
                {relatedGoal.name}
              </span>
            )}
            {relatedInvestment && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md">
                <TrendingUp size={12} />
                {relatedInvestment.name}
              </span>
            )}
            {note.relatedMonth && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                <Calendar size={12} />
                {note.relatedMonth}
              </span>
            )}
          </div>
        )}

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.map((tag, index) => (
              <span key={index} className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center text-xs text-slate-400">
          <span>{format(new Date(note.updatedAt), "d 'de' MMM, HH:mm", { locale: ptBR })}</span>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(note); }}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
