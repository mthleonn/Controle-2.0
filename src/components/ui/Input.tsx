import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={`w-full ${icon ? 'pl-11' : 'px-4'} py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400 text-slate-800 ${
            error ? 'border-danger focus:border-danger focus:ring-danger/20' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
};
