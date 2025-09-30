import React, { useState, useEffect } from 'react';
import type { Client } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { XIcon } from './icons/Icons';

interface CountryStrengthFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (strengths: string[]) => void;
  client: Client;
  countries: string[];
  onAddCountry: (name: string) => Promise<void>;
}

const CountryStrengthFormModal: React.FC<CountryStrengthFormModalProps> = ({ isOpen, onClose, onSave, client, countries, onAddCountry }) => {
  const { t } = useLanguage();
  const [strengths, setStrengths] = useState<string[]>([]);
  const [newCountry, setNewCountry] = useState('');

  useEffect(() => {
    if (client) {
      setStrengths(client.countryStrengths);
    }
    setNewCountry('');
  }, [client, isOpen]);

  const handleStrengthChange = (country: string) => {
    setStrengths(prev =>
      prev.includes(country)
        ? prev.filter(c => c !== country)
        : [...prev, country]
    );
  };

  const handleAddCountry = async () => {
    if (newCountry.trim()) {
      await onAddCountry(newCountry);
      // Also add it to the current selection
      setStrengths(prev => [...prev, newCountry.trim()]);
      setNewCountry('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(strengths);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <header className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {t('editCountryStrengthsTitle')}
            </h2>
            <button type="button" onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <XIcon className="w-6 h-6" />
            </button>
          </header>
          <main className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('countryStrengths')}</label>
              <div className="mt-2 p-2 border border-gray-300 rounded-md max-h-48 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {countries.map(country => (
                    <label key={country} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={strengths.includes(country)}
                        onChange={() => handleStrengthChange(country)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{country}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={newCountry}
                  onChange={(e) => setNewCountry(e.target.value)}
                  placeholder={t('newCountryPlaceholder')}
                  className="flex-grow w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddCountry}
                  disabled={!newCountry.trim()}
                  className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 disabled:bg-gray-300"
                >
                  {t('addCountry')}
                </button>
              </div>
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

export default CountryStrengthFormModal;