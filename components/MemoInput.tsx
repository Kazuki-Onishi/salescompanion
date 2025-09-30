
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircleIcon, CalendarDaysIcon } from './icons/Icons';

interface MemoInputProps {
  clientId: string;
  onAddMemo: (clientId: string, text: string, memoDate: Date) => void;
}

const MemoInput: React.FC<MemoInputProps> = ({ clientId, onAddMemo }) => {
  const [text, setText] = useState('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMemo(clientId, text, new Date(date));
    setText('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleQuickMemo = (memoText: string) => {
    // For quick memos, always use the current date for simplicity
    onAddMemo(clientId, memoText, new Date());
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
       <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-sm font-medium text-gray-600">{t('quickMemo')}:</span>
        <button
          type="button"
          onClick={() => handleQuickMemo(t('salesCompleted'))}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-100 rounded-full hover:bg-green-200 transition-colors"
        >
          <CheckCircleIcon className="w-4 h-4" />
          {t('salesCompleted')}
        </button>
        <button
          type="button"
          onClick={() => handleQuickMemo(t('salesScheduled'))}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full hover:bg-yellow-200 transition-colors"
        >
          <CalendarDaysIcon className="w-4 h-4" />
          {t('salesScheduled')}
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('writeMemoPlaceholder')}
          className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
          rows={3}
        />
        <div className="flex justify-between items-end mt-2">
          <div>
              <label htmlFor="memo-date" className="block text-xs font-medium text-gray-600">{t('memoDate')}</label>
              <input
                  type="date"
                  id="memo-date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="mt-1 px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
          </div>
          <button
            type="submit"
            disabled={!text.trim()}
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
          >
            {t('addMemo')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MemoInput;
