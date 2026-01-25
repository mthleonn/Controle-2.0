import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, Target, TrendingUp, PieChart, PlusCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
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
        <button className="w-full bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
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
  return (
    <div className="min-h-screen bg-background text-text-primary font-sans">
      <Sidebar />
      <main className="md:pl-64 min-h-screen">
        <div className="max-w-7xl mx-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
