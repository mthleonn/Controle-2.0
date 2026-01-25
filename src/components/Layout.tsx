import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, Target, TrendingUp, PieChart, PlusCircle, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Modal } from './ui/Modal';
import { TransactionForm } from './TransactionForm';

const MobileHeader = ({ onOpenMenu }: { onOpenMenu: () => void }) => {
  const { signOut } = useAuth();
  
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 z-50 flex items-center justify-between px-4 md:hidden">
      <div className="flex items-center gap-2">
        <img src="/logo.png" alt="Controle+" className="w-8 h-8 object-contain" />
        <span className="font-bold text-slate-800 text-lg">Controle+</span>
      </div>
      <button onClick={signOut} className="p-2 text-slate-500 hover:text-red-500 transition-colors">
        <LogOut size={20} />
      </button>
    </header>
  );
};

const MobileNav = ({ onOpenNewTransaction }: { onOpenNewTransaction: () => void }) => {
  const location = useLocation();
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Início', path: '/' },
    { icon: Wallet, label: 'Transações', path: '/transactions' },
    { icon: PlusCircle, label: 'Novo', path: '#', isAction: true, onClick: onOpenNewTransaction },
    { icon: Target, label: 'Metas', path: '/goals' },
    { icon: TrendingUp, label: 'Invest.', path: '/investments' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-50 px-2 pb-safe md:hidden">
      <div className="flex items-center justify-around h-16">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          if (item.isAction) {
            return (
              <button 
                key={item.label}
                onClick={item.onClick}
                className="flex flex-col items-center justify-center -mt-6"
              >
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30 text-white">
                  <PlusCircle size={24} />
                </div>
                <span className="text-[10px] font-medium text-slate-500 mt-1">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 ${
                isActive ? 'text-primary' : 'text-slate-400'
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

const Sidebar = ({ onOpenNewTransaction }: { onOpenNewTransaction: () => void }) => {
  const location = useLocation();
  const { signOut } = useAuth();
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Wallet, label: 'Transações', path: '/transactions' },
    { icon: Target, label: 'Metas', path: '/goals' },
    { icon: TrendingUp, label: 'Investimentos', path: '/investments' },
    { icon: PieChart, label: 'Relatórios', path: '/reports' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-primary text-white hidden md:flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <img src="/logo.png" alt="Controle+" className="w-8 h-8 object-contain" onError={(e) => {
            e.currentTarget.onerror = null; 
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }} />
          <span className="hidden bg-accent p-1 rounded-lg">C+</span>
          Controle+
        </h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 space-y-2">
        <button 
          onClick={onOpenNewTransaction}
          className="w-full bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <PlusCircle size={20} />
          <span>Novo Gasto</span>
        </button>
        <button 
          onClick={signOut}
          className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-200 hover:text-red-100 p-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans">
      <MobileHeader onOpenMenu={() => {}} />
      <Sidebar onOpenNewTransaction={() => setIsTransactionModalOpen(true)} />
      <main className="md:pl-64 min-h-screen pt-20 pb-24 md:pt-0 md:pb-0">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
      <MobileNav onOpenNewTransaction={() => setIsTransactionModalOpen(true)} />

      <Modal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        title="Nova Transação"
      >
        <TransactionForm onSuccess={() => setIsTransactionModalOpen(false)} />
      </Modal>
    </div>
  );
};
