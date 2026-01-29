import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { NoteCard } from '../components/notes/NoteCard';
import { NoteEditor } from '../components/notes/NoteEditor';
import { Note } from '../types';
import { Plus, Search, Filter, BookOpen } from 'lucide-react';

export const Notes: React.FC = () => {
  const { notes } = useFinance();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    notes.forEach(note => {
      note.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [notes]);

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        note.content.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTag = selectedTag ? note.tags?.includes(selectedTag) : true;

      return matchesSearch && matchesTag;
    });
  }, [notes, searchTerm, selectedTag]);

  const handleCreateNote = () => {
    setEditingNote(null);
    setIsEditorOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingNote(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="text-indigo-600" />
            Anotações
          </h1>
          <p className="text-slate-500 mt-1">
            Organize suas ideias, planos e observações financeiras.
          </p>
        </div>
        <button
          onClick={handleCreateNote}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <Plus size={20} />
          Nova Anotação
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar nas anotações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <Filter size={20} className="text-slate-400 min-w-[20px]" />
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedTag === null 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              Todas
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedTag === tag
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notes Grid */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map(note => (
            <NoteCard 
              key={note.id} 
              note={note} 
              onEdit={handleEditNote} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="text-indigo-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-slate-800 mb-2">
            {searchTerm || selectedTag ? 'Nenhuma anotação encontrada' : 'Suas anotações aparecerão aqui'}
          </h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            {searchTerm || selectedTag 
              ? 'Tente ajustar seus filtros de busca.' 
              : 'Comece registrando seus planos, ideias de investimento ou lembretes importantes.'}
          </p>
          {!searchTerm && !selectedTag && (
            <button
              onClick={handleCreateNote}
              className="text-indigo-600 font-medium hover:text-indigo-700 hover:underline"
            >
              Criar primeira anotação
            </button>
          )}
        </div>
      )}

      {/* Editor Modal */}
      <NoteEditor 
        isOpen={isEditorOpen} 
        onClose={handleCloseEditor} 
        noteToEdit={editingNote} 
      />
    </div>
  );
};
