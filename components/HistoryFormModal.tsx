
import React, { useState } from 'react';
import type { Plan, HistoryItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { XIcon } from './icons/Icons';


interface HistoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (historyData: Omit<HistoryItem, 'id' | 'clientId'>) => void;
  plans: Plan[];
  countries: string[];
}

const HistoryFormModal: React.FC<HistoryFormModalProps> = ({ isOpen, onClose, onSave, plans, countries }) => {
  const { t, language } = useLanguage();
  const [planId, setPlanId] = useState<string>(plans[0]?.id || '');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [groupSize, setGroupSize] = useState<number>(10);
  const [country, setCountry] = useState<string>(countries[0] || '');
  const [otherPlanDescription, setOtherPlanDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planId || !date || groupSize < 1 || !country.trim()) {
        alert("Please fill all required fields");
        return;
    };
    if (planId === 'other' && !otherPlanDescription.trim()) {
        alert("Please describe the 'other' plan.");
        return;
    }

    const historyData: Omit<HistoryItem, 'id' | 'clientId'> = {
      planId,
      date: new Date(date),
      groupSize,
      country,
    };

    if (planId === 'other') {
        historyData.otherPlanDescription = otherPlanDescription;
    }
    
    onSave(historyData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <header className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">{t('addNewHistoryTitle')}</h2>
            <button type="button" onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <XIcon className="w-6 h-6" />
            </button>
          </header>
          <main className="p-6 space-y-4">
            <div>
              <label htmlFor="plan" className="block text-sm font-medium text-gray-700">{t('plan')}</label>
              <select
                id="plan"
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {plans.map(plan => (
                    <option key={plan.id} value={plan.id}>{plan.name[language]}</option>
                ))}
                <option value="other">{t('other')}</option>
              </select>
            </div>

            {planId === 'other' && (
              <div>
                <label htmlFor="other-plan-details" className="block text-sm font-medium text-gray-700">{t('otherPlanDetails')}</label>
                <textarea
                  id="other-plan-details"
                  value={otherPlanDescription}
                  onChange={(e) => setOtherPlanDescription(e.target.value)}
                  placeholder={t('otherPlanDetailsPlaceholder')}
                  required
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            )}

             <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">{t('date')}</label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
             <div>
              <label htmlFor="group-size" className="block text-sm font-medium text-gray-700">{t('groupSize')}</label>
              <input
                type="number"
                id="group-size"
                value={groupSize}
                min="1"
                onChange={(e) => setGroupSize(parseInt(e.target.value, 10) || 1)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
             <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">{t('country')}</label>
              <select
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </main>
          <footer className="flex justify-end gap-3 p-6 bg-gray-50 rounded-b-2xl">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-gray-700 hover:bg-gray-50">
              {t('cancel')}
            </button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">
              {t('save')}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default HistoryFormModal;