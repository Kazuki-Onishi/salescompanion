
import React from 'react';
import type { Plan } from '../types';
import { XIcon, PlusIcon, PencilIcon } from './icons/Icons';
import { useLanguage } from '../context/LanguageContext';

interface PlanCatalogProps {
  plans: Plan[];
  onClose: () => void;
  onAddPlan: () => void;
  onEditPlan: (plan: Plan) => void;
}

const PlanCatalog: React.FC<PlanCatalogProps> = ({ plans, onClose, onAddPlan, onEditPlan }) => {
  const { t, language } = useLanguage();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{t('planCatalogTitle')}</h2>
          <div className="flex items-center gap-4">
            <button onClick={onAddPlan} className="flex items-center gap-2 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
              <PlusIcon className="w-5 h-5"/>
              {t('addPlan')}
            </button>
            <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <XIcon className="w-6 h-6" />
            </button>
          </div>
        </header>
        <main className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map(plan => (
              <div key={plan.id} className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col group relative">
                <button onClick={() => onEditPlan(plan)} className="absolute top-3 right-3 p-1.5 bg-white rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  <PencilIcon className="w-4 h-4" />
                </button>
                <div className="flex-grow">
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3 ${
                    plan.type === 'banquet' ? 'bg-green-100 text-green-800' :
                    plan.type === 'accommodation' ? 'bg-purple-100 text-purple-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {t(plan.type)}
                  </span>
                  <h3 className="text-lg font-bold text-gray-800">{plan.name[language]}</h3>
                  <p className="text-sm text-gray-600 mt-2">{plan.description[language]}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xl font-extrabold text-indigo-600">
                    ¥{plan.price.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{plan.season}</p>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PlanCatalog;
