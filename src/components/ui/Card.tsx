import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, action }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4 md:mb-6">
          {title && <h3 className="text-base md:text-lg font-semibold text-text-primary">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
