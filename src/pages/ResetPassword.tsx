import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Wallet, Lock, CheckCircle, AlertTriangle } from 'lucide-react';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Verify if the user is authenticated (via the recovery link)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // If no session, the link might be invalid or expired
        // However, supabase-js might still be processing the hash
        // We give it a moment or rely on the user trying to submit
      }
    };

    checkSession();
    
    // Listen for auth state changes to clear hash from URL
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // This is the specific event for this flow
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      setSuccess(true);
      
      // Optional: Redirect after a few seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err: any) {
      console.error('Error updating password:', err);
      setError(err.message || 'Erro ao atualizar a senha. O link pode ter expirado.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 md:p-8 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600 h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Senha Alterada!</h2>
          <p className="text-slate-600 mb-6">
            Sua senha foi redefinida com sucesso. Você será redirecionado para o login.
          </p>
          <Link to="/login">
            <Button fullWidth>
              Ir para Login agora
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
             <div className="bg-primary/10 p-4 rounded-2xl">
              <Wallet className="text-primary h-12 w-12" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Nova Senha</h1>
          <p className="text-slate-500 text-center mt-2">
            Crie uma senha forte para sua conta
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 flex items-start gap-2 border border-red-100">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <Input
            label="Nova Senha"
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            icon={<Lock size={18} />}
          />

          <Input
            label="Confirmar Senha"
            type="password"
            placeholder="Repita a nova senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            icon={<Lock size={18} />}
          />

          <div className="space-y-3 pt-2">
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar nova senha'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
