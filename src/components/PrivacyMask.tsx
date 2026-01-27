import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/format';

interface PrivacyMaskProps {
  value: number;
  className?: string;
  prefix?: string;
}

export const PrivacyMask: React.FC<PrivacyMaskProps> = ({ value, className, prefix = '' }) => {
  const { isPrivacyMode } = useFinance();

  if (isPrivacyMode) {
    return <span className={`font-mono tracking-widest ${className}`}>****</span>;
  }

  return <span className={className}>{prefix}{formatCurrency(value)}</span>;
};
