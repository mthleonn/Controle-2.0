import AIConsultant from '../components/AIConsultant';
import { useFinance } from '../context/FinanceContext';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FinancialAssistant = () => {
  const { transactions, investments } = useFinance();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-4 md:hidden">
        <Link to="/" className="text-slate-500 hover:text-slate-800 flex items-center gap-2">
           <ArrowLeft size={20} /> Voltar
        </Link>
      </div>
      <AIConsultant transactions={transactions} investments={investments} />
    </div>
  );
};
