import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, Target, TrendingUp, PieChart, PlusCircle, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Modal } from './ui/Modal';
import { TransactionForm } from './TransactionForm';

const MobileHeader = ({ onOpenMenu }: { onOpenMenu: () => void }) => {
  const { signOut } = useAuth();
  
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 z-40 flex items-center justify-between px-6 md:hidden transition-all duration-200">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-tr from-primary to-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
           <span className="text-white font-bold text-sm">C+</span>
        </div>
        <span className="font-bold text-slate-800 text-lg tracking-tight">Controle+</span>
      </div>
      <button 
        onClick={signOut} 
        className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 rounded-full active:bg-slate-100"
      >
        <LogOut size={18} />
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
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200/50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 px-6 pb-safe md:hidden">
      <div className="flex items-center justify-between h-20">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          if (item.isAction) {
            return (
              <button 
                key={item.label}
                onClick={item.onClick}
                className="flex flex-col items-center justify-center -mt-8 relative z-10 group"
              >
                <div className="w-14 h-14 bg-gradient-to-tr from-primary to-indigo-500 rounded-full flex items-center justify-center shadow-xl shadow-primary/30 text-white transition-transform active:scale-95 group-hover:shadow-primary/40 border-4 border-white">
                  <PlusCircle size={28} strokeWidth={2.5} />
                </div>
              </button>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1.5 w-12 transition-colors duration-200 ${
                isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-primary/10' : ''}`}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {item.label}
              </span>
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
    <aside className="fixed left-0 top-0 h-screen w-64 bg-primary text-white hidden md:flex flex-col z-30">
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
      <main className="md:pl-64 min-h-screen pt-20 pb-24 md:pt-0 md:pb-0 relative z-0">
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
