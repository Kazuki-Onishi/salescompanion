import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { XIcon, TrashIcon } from './icons/Icons';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  clientName?: string;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ isOpen, clientName, isDeleting, onCancel, onConfirm }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <header className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full text-red-600">
              <TrashIcon className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t('deleteClientTitle')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isDeleting}
          >
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        <main className="p-6 space-y-4">
          <p className="text-gray-700">
            {t('deleteClientDescription', { name: clientName || t('deleteClientFallbackName') })}
          </p>
          <p className="text-sm text-gray-500 bg-red-50 border border-red-100 rounded-lg p-3">
            {t('deleteClientWarning')}
          </p>
        </main>
        <footer className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isDeleting}
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={() => onConfirm()}
            className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-75 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={isDeleting}
          >
            {isDeleting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
            {t('deleteClientConfirm')}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;

