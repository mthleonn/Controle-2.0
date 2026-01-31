import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FinanceProvider } from './context/FinanceContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Goals } from './pages/Goals';
import { Investments } from './pages/Investments';
import { Reports } from './pages/Reports';
import { FinancialAssistant } from './pages/FinancialAssistant';
import { Notes } from './pages/Notes';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Carregando...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/transactions" element={<Transactions />} />
                      <Route path="/goals" element={<Goals />} />
                      <Route path="/investments" element={<Investments />} />
                      <Route path="/notes" element={<Notes />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/assistant" element={<FinancialAssistant />} />
                    </Routes>
                  </Layout>
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </FinanceProvider>
    </AuthProvider>
  );
}

export default App;
