
import React, { useState, useEffect } from 'react';
import type { Client, Mode } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { XIcon } from './icons/Icons';


interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: Omit<Client, 'id'> | Client) => void;
  clientToEdit: Client | null;
  mode: Mode;
  countries: string[];
  onAddCountry: (name: string) => Promise<void>;
}

const ClientFormModal: React.FC<ClientFormModalProps> = ({ isOpen, onClose, onSave, clientToEdit, mode, countries, onAddCountry }) => {
  const { t } = useLanguage();
  const [isNameEnDirty, setIsNameEnDirty] = useState(false);
  const [nameEn, setNameEn] = useState('');
  const [nameJa, setNameJa] = useState('');
  const [types, setTypes] = useState<Mode[]>([]);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [newCountry, setNewCountry] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [website, setWebsite] = useState('');

  useEffect(() => {
    if (clientToEdit) {
      setNameEn(clientToEdit.name.en);
      setNameJa(clientToEdit.name.ja);
      setIsNameEnDirty(clientToEdit.name.en !== clientToEdit.name.ja);
      setTypes(clientToEdit.type);
      setStrengths(clientToEdit.countryStrengths);
      setContactName(clientToEdit.contactName || '');
      setContactEmail(clientToEdit.contactEmail || '');
      setContactPhone(clientToEdit.contactPhone || '');
      setWebsite(clientToEdit.website || '');
    } else {
      setNameEn('');
      setIsNameEnDirty(false);
      setNameJa('');
      setTypes([mode]);
      setStrengths([]);
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setWebsite('');
    }
    setNewCountry('');
  }, [clientToEdit, mode, isOpen]);
  
  const handleStrengthChange = (country: string) => {
    setStrengths(prev => 
      prev.includes(country) 
        ? prev.filter(c => c !== country)
        : [...prev, country]
    );
  };

  const handleTypeChange = (selectedType: Mode) => {
    setTypes(prev => {
      const newTypes = prev.includes(selectedType)
        ? prev.filter(t => t !== selectedType)
        : [...prev, selectedType];
      // Ensure at least one type is selected, otherwise default to current mode
      return newTypes.length > 0 ? newTypes : [mode];
    });
  };

  const handleAddCountry = async () => {
    if (newCountry.trim()) {
      await onAddCountry(newCountry);
      setNewCountry('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() || types.length === 0) return;

    const trimmedNameEn = nameEn.trim();
    const trimmedNameJa = nameJa.trim();

    const clientData = {
      name: { en: trimmedNameEn, ja: trimmedNameJa || trimmedNameEn },
      type: types,
      countryStrengths: strengths,
      contactName: contactName.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
      website: website.trim() || undefined,
    };

    if (clientToEdit) {
      onSave({ ...clientData, id: clientToEdit.id });
    } else {
      onSave(clientData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <header className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {clientToEdit ? t('editClientTitle') : t('addNewClientTitle')}
            </h2>
            <button type="button" onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <XIcon className="w-6 h-6" />
            </button>
          </header>
          <main className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <p className="text-xs text-gray-500">{t('requiredFieldsNote')}</p>
            <div>
              <label htmlFor="client-name-en" className="block text-sm font-medium text-gray-700">{t('clientNameEn')} <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="client-name-en"
                value={nameEn}
                onChange={(e) => { const next = e.target.value; setNameEn(next); setIsNameEnDirty(next.trim().length > 0); }}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="client-name-ja" className="block text-sm font-medium text-gray-700">{t('clientNameJa')}</label>
              <input
                type="text"
                id="client-name-ja"
                value={nameJa}
                onChange={(e) => { const next = e.target.value; setNameJa(next); if (!isNameEnDirty) { setNameEn(next); } }}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
             <div className="border-t border-gray-200 pt-4 mt-4">
                 <h3 className="text-lg font-medium text-gray-900">{t('contactInfo')}</h3>
             </div>
             <div>
              <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700">{t('contactName')}</label>
              <input
                type="text"
                id="contact-name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
             <div>
              <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700">{t('contactEmail')}</label>
              <input
                type="email"
                id="contact-email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
             <div>
              <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700">{t('contactPhone')}</label>
              <input
                type="tel"
                id="contact-phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700">{t('website')}</label>
              <input
                type="url"
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
             <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-lg font-medium text-gray-900">{t('clientDetails')}</h3>
             </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('clientType')} <span className="text-red-500">*</span></label>
              <div className="mt-2 flex gap-4">
                 <label className="inline-flex items-center">
                    <input type="checkbox" value="hotel" checked={types.includes('hotel')} onChange={() => handleTypeChange('hotel')} className="form-checkbox h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500"/>
                    <span className="ml-2">{t('hotel')}</span>
                </label>
                 <label className="inline-flex items-center">
                    <input type="checkbox" value="tourGuide" checked={types.includes('tourGuide')} onChange={() => handleTypeChange('tourGuide')} className="form-checkbox h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500"/>
                    <span className="ml-2">{t('tourGuide')}</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('countryStrengths')}</label>
              <div className="mt-2 p-2 border border-gray-300 rounded-md max-h-32 overflow-y-auto">
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
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300" disabled={!nameEn.trim() || types.length === 0}>
              {t('save')}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default ClientFormModal;





