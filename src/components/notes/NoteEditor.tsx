import React, { useState, useEffect } from 'react';
import { Note } from '../../types';
import { useFinance } from '../../context/FinanceContext';
import { X, Save, Tag, Target, TrendingUp, Calendar } from 'lucide-react';

interface NoteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  noteToEdit?: Note | null;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ isOpen, onClose, noteToEdit }) => {
  const { addNote, updateNote, goals, investments } = useFinance();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [relatedGoalId, setRelatedGoalId] = useState('');
  const [relatedInvestmentId, setRelatedInvestmentId] = useState('');
  const [relatedMonth, setRelatedMonth] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (noteToEdit) {
      setTitle(noteToEdit.title);
      setContent(noteToEdit.content);
      setTags(noteToEdit.tags || []);
      setRelatedGoalId(noteToEdit.relatedGoalId || '');
      setRelatedInvestmentId(noteToEdit.relatedInvestmentId || '');
      setRelatedMonth(noteToEdit.relatedMonth || '');
      setIsFavorite(noteToEdit.isFavorite);
    } else {
      resetForm();
    }
  }, [noteToEdit, isOpen]);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setTags([]);
    setTagInput('');
    setRelatedGoalId('');
    setRelatedInvestmentId('');
    setRelatedMonth('');
    setIsFavorite(false);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      const noteData = {
        title,
        content,
        tags,
        isFavorite,
        relatedGoalId: relatedGoalId || undefined,
        relatedInvestmentId: relatedInvestmentId || undefined,
        relatedMonth: relatedMonth || undefined,
      };

      if (noteToEdit) {
        await updateNote(noteToEdit.id, noteData);
      } else {
        await addNote(noteData);
      }
      onClose();
      resetForm();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-800">
            {noteToEdit ? 'Editar Anotação' : 'Nova Anotação'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-grow">
          
          {/* Title */}
          <div>
            <input
              type="text"
              placeholder="Título da anotação"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-lg font-semibold placeholder-slate-400 border-none focus:ring-0 p-0 text-slate-800"
              autoFocus
              required
            />
          </div>

          {/* Content */}
          <div>
            <textarea
              placeholder="Escreva seus pensamentos, planos ou observações..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[200px] resize-none border-none focus:ring-0 p-0 text-slate-600 leading-relaxed placeholder-slate-400"
            />
          </div>

          {/* Tags */}
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <span key={tag} className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-sm flex items-center gap-1">
                  #{tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-rose-500">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-slate-400 border-t border-slate-100 pt-4">
              <Tag size={16} />
              <input
                type="text"
                placeholder="Adicionar tags (pressione Enter)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="flex-grow text-sm border-none focus:ring-0 p-0 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Context Linking (Accordion style or simple list) */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vincular a (Opcional)</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Goal Link */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <Target size={14} className="text-indigo-500" />
                  Meta
                </label>
                <select
                  value={relatedGoalId}
                  onChange={(e) => setRelatedGoalId(e.target.value)}
                  className="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Nenhuma</option>
                  {goals.map(goal => (
                    <option key={goal.id} value={goal.id}>{goal.name}</option>
                  ))}
                </select>
              </div>

              {/* Investment Link */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <TrendingUp size={14} className="text-emerald-500" />
                  Investimento
                </label>
                <select
                  value={relatedInvestmentId}
                  onChange={(e) => setRelatedInvestmentId(e.target.value)}
                  className="w-full text-sm border-slate-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Nenhum</option>
                  {investments.map(inv => (
                    <option key={inv.id} value={inv.id}>{inv.name}</option>
                  ))}
                </select>
              </div>

              {/* Month Link */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <Calendar size={14} className="text-blue-500" />
                  Mês de Referência
                </label>
                <input
                  type="month"
                  value={relatedMonth}
                  onChange={(e) => setRelatedMonth(e.target.value)}
                  className="w-full text-sm border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

        </form>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !title.trim()}
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? 'Salvando...' : (
              <>
                <Save size={18} />
                Salvar Anotação
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
