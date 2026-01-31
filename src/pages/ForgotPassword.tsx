import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Wallet, ArrowLeft, Mail, CheckCircle } from 'lucide-react';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      // Security: Don't reveal if email exists or not, but log error for debugging
      console.error('Error resetting password:', err);
      // We can show a generic error if it's a network issue, 
      // but for "user not found" we often mimic success or show a generic message.
      // However, Supabase might throw specific errors. 
      // To be user-friendly and secure, we often just show the success message 
      // or a generic "If an account exists..." message regardless of error 
      // UNLESS it's a rate limit or network error.
      // For this implementation, I'll show the success message to prevent user enumeration
      // unless it's clearly a technical error.
      if (err.message.includes('rate limit')) {
        setError('Muitas tentativas. Aguarde um momento e tente novamente.');
      } else {
         // Fallback to success state for security (User Enumeration Protection)
         setSuccess(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
             <div className="bg-primary/10 p-4 rounded-2xl">
              <Wallet className="text-primary h-12 w-12" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Recuperar Senha</h1>
          <p className="text-slate-500 text-center mt-2">
            Informe seu email para receber o link de redefinição
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="text-green-600 h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-800">Email enviado!</h3>
              <p className="text-slate-600 text-sm">
                Se o email <strong>{email}</strong> estiver cadastrado, você receberá um link com instruções para redefinir sua senha em instantes.
              </p>
            </div>
            <div className="pt-4">
              <Link to="/login">
                <Button variant="outline" fullWidth>
                  Voltar para o Login
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={<Mail size={18} />}
            />

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar link de recuperação'}
            </Button>

            <div className="text-center pt-2">
              <Link 
                to="/login" 
                className="inline-flex items-center text-sm text-slate-500 hover:text-primary transition-colors gap-2"
              >
                <ArrowLeft size={16} />
                Voltar para o Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
