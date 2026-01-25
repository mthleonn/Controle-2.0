import { useState } from 'react';
import { Plus, Trash2, Search } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { TransactionForm } from '../components/TransactionForm';
import { formatCurrency, formatDate } from '../utils/format';

export const Transactions = () => {
  const { transactions, removeTransaction } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const uniqueCategories = Array.from(new Set(transactions.map(t => t.category)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Transações</h1>
          <p className="text-slate-500">Histórico completo de receitas e despesas.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          Nova Transação
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar transações..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <Select
            options={[
              { value: 'all', label: 'Todas Categorias' },
              ...uniqueCategories.map(c => ({ value: c, label: c }))
            ]}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {/* Mobile List View */}
        <div className="md:hidden space-y-3">
          {filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-slate-800">{transaction.description}</h3>
                  <span className="text-xs text-slate-500">{formatDate(transaction.date)}</span>
                </div>
                <button
                  onClick={() => removeTransaction(transaction.id)}
                  className="text-slate-400 hover:text-red-500 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="px-2 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-600">
                  {transaction.category}
                </span>
                <span className={`font-bold ${
                  transaction.type === 'income' ? 'text-indigo-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                </span>
              </div>
              {transaction.type === 'expense' && (
                <div className="mt-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                    transaction.isEssential 
                      ? 'border-accent text-accent bg-accent/5' 
                      : 'border-danger text-danger bg-danger/5'
                  }`}>
                    {transaction.isEssential ? 'Essencial' : 'Não Essencial'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <Card className="hidden md:block overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Descrição</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Categoria</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Data</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Tipo</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">Valor</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-800 font-medium">
                    {transaction.description}
                    {transaction.type === 'expense' && (
                      <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full border ${
                        transaction.isEssential 
                          ? 'border-accent text-accent bg-accent/5' 
                          : 'border-danger text-danger bg-danger/5'
                      }`}>
                        {transaction.isEssential ? 'Essencial' : 'Não Essencial'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <span className="px-2 py-1 rounded-lg bg-slate-100 text-xs font-medium">
                      {transaction.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      transaction.type === 'income' 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'bg-orange-50 text-orange-600'
                    }`}>
                      {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${
                    transaction.type === 'income' ? 'text-accent' : 'text-slate-800'
                  }`}>
                    {transaction.type === 'expense' ? '-' : '+'}
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => removeTransaction(transaction.id)}
                      className="text-slate-400 hover:text-danger transition-colors p-2 hover:bg-danger/10 rounded-lg"
                      title="Remover"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Nenhuma transação encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Transação"
      >
        <TransactionForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};
