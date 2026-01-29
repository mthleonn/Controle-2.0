import React, { useState } from 'react';
import { InvestmentType } from '../../../types';
import { StepTypeSelection } from './StepTypeSelection';
import { StepAssetSearch } from './StepAssetSearch';
import { StepDetails } from './StepDetails';
import { useFinance } from '../../../context/FinanceContext';
import { X } from 'lucide-react';

interface InvestmentWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InvestmentWizard: React.FC<InvestmentWizardProps> = ({ isOpen, onClose }) => {
  const { addInvestment } = useFinance();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<InvestmentType | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<{ name: string; ticker: string; price?: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleTypeSelect = (type: InvestmentType) => {
    setSelectedType(type);
    setStep(2);
  };

  const handleAssetSelect = (asset: { name: string; ticker: string; price?: number }) => {
    setSelectedAsset(asset);
    setStep(3);
  };

  const handleConfirm = async (details: { quantity: number; price: number; date: string }) => {
    if (!selectedType || !selectedAsset) return;

    setIsLoading(true);
    try {
      await addInvestment({
        name: selectedAsset.name,
        ticker: selectedAsset.ticker,
        type: selectedType,
        quantity: details.quantity,
        investedAmount: details.quantity * details.price,
        currentAmount: details.quantity * details.price, // Valor inicial = investido
        targetAmount: 0,
      });
      onClose();
      // Reset state after closing animation (timeout opcional)
      setStep(1);
      setSelectedType(null);
      setSelectedAsset(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 md:p-4">
      <div className="bg-white w-full md:max-w-xl h-[90vh] md:h-auto md:min-h-[500px] rounded-t-[2rem] md:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Passo {step} de 3</span>
            <h2 className="text-xl font-black text-slate-800">Novo Investimento</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
          {step === 1 && <StepTypeSelection onSelect={handleTypeSelect} />}
          
          {step === 2 && selectedType && (
            <StepAssetSearch 
              type={selectedType} 
              onSelect={handleAssetSelect} 
              onBack={handleBack}
            />
          )}

          {step === 3 && selectedType && selectedAsset && (
            <StepDetails 
              type={selectedType}
              asset={selectedAsset}
              onConfirm={handleConfirm}
              onBack={handleBack}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-slate-100">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
