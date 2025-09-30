
import React, { useState, useEffect } from 'react';
import type { Plan } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { XIcon } from './icons/Icons';

interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (planData: Omit<Plan, 'id'> | Plan) => void;
  planToEdit: Plan | null;
}

const PlanFormModal: React.FC<PlanFormModalProps> = ({ isOpen, onClose, onSave, planToEdit }) => {
  const { t } = useLanguage();
  const [nameEn, setNameEn] = useState('');
  const [nameJa, setNameJa] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionJa, setDescriptionJa] = useState('');
  const [price, setPrice] = useState(0);
  const [season, setSeason] = useState('');
  const [type, setType] = useState<'banquet' | 'accommodation' | 'menu'>('banquet');

  useEffect(() => {
    if (planToEdit) {
      setNameEn(planToEdit.name.en);
      setNameJa(planToEdit.name.ja);
      setDescriptionEn(planToEdit.description.en);
      setDescriptionJa(planToEdit.description.ja);
      setPrice(planToEdit.price);
      setSeason(planToEdit.season);
      setType(planToEdit.type);
    } else {
      // Reset form
      setNameEn('');
      setNameJa('');
      setDescriptionEn('');
      setDescriptionJa('');
      setPrice(5000);
      setSeason('');
      setType('banquet');
    }
  }, [planToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() || !nameJa.trim() || !descriptionEn.trim() || !descriptionJa.trim() || price <= 0) {
        alert('Please fill all required fields');
        return;
    }

    const planData = {
      name: { en: nameEn, ja: nameJa },
      description: { en: descriptionEn, ja: descriptionJa },
      price,
      season,
      type,
    };

    if (planToEdit) {
      onSave({ ...planData, id: planToEdit.id });
    } else {
      onSave(planData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <header className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {planToEdit ? t('editPlanTitle') : t('addNewPlanTitle')}
            </h2>
            <button type="button" onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <XIcon className="w-6 h-6" />
            </button>
          </header>
          <main className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="plan-name-en" className="block text-sm font-medium text-gray-700">{t('planNameEn')}</label>
                  <input type="text" id="plan-name-en" value={nameEn} onChange={(e) => setNameEn(e.target.value)} required className="mt-1 block w-full input"/>
                </div>
                 <div>
                  <label htmlFor="plan-name-ja" className="block text-sm font-medium text-gray-700">{t('planNameJa')}</label>
                  <input type="text" id="plan-name-ja" value={nameJa} onChange={(e) => setNameJa(e.target.value)} required className="mt-1 block w-full input"/>
                </div>
            </div>
            <div>
              <label htmlFor="desc-en" className="block text-sm font-medium text-gray-700">{t('descriptionEn')}</label>
              <textarea id="desc-en" value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} required rows={2} className="mt-1 block w-full input"/>
            </div>
             <div>
              <label htmlFor="desc-ja" className="block text-sm font-medium text-gray-700">{t('descriptionJa')}</label>
              <textarea id="desc-ja" value={descriptionJa} onChange={(e) => setDescriptionJa(e.target.value)} required rows={2} className="mt-1 block w-full input"/>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">{t('price')}</label>
                  <input type="number" id="price" value={price} min="0" onChange={(e) => setPrice(parseInt(e.target.value, 10) || 0)} required className="mt-1 block w-full input"/>
                </div>
                <div>
                  <label htmlFor="season" className="block text-sm font-medium text-gray-700">{t('season')}</label>
                  <input type="text" id="season" value={season} onChange={(e) => setSeason(e.target.value)} className="mt-1 block w-full input"/>
                </div>
            </div>
             <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">{t('planType')}</label>
              <select id="type" value={type} onChange={(e) => setType(e.target.value as any)} required className="mt-1 block w-full select">
                <option value="banquet">{t('banquet')}</option>
                <option value="accommodation">{t('accommodation')}</option>
                <option value="menu">{t('menu')}</option>
              </select>
            </div>
             <style>{`.input, .select { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); } .input:focus, .select:focus { outline: none; --tw-ring-color: #4F46E5; box-shadow: 0 0 0 2px var(--tw-ring-color); border-color: #4F46E5; }`}</style>
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

export default PlanFormModal;
