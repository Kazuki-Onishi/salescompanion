
import React, { useState } from 'react';
import type { Client, HistoryItem, Memo, Plan, Mode } from '../types';
import MemoInput from './MemoInput';
import { GlobeAltIcon, ClockIcon, BookOpenIcon, PlusIcon, PencilIcon, UserCircleIcon, LinkIcon, ArrowLeftIcon, TrashIcon } from './icons/Icons';
import { useLanguage } from '../context/LanguageContext';

interface ClientDetailProps {
  client: Client | null;
  history: HistoryItem[];
  memos: Memo[];
  plans: Plan[];
  mode: Mode;
  isLoading: boolean;
  onAddMemo: (clientId: string, text: string, memoDate: Date) => void;
  onUpdateMemo: (clientId: string, memoId: string, text: string, memoDate: Date) => Promise<void>;
  onDeleteMemo: (clientId: string, memoId: string) => Promise<void>;
  onOpenCatalog: () => void;
  onEditClient: () => void;
  onEditCountryStrengths: () => void;
  onAddHistory: () => void;
  onBack: () => void;
  onDeleteClient: () => void;
}


const InfoCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; actionButton?: React.ReactNode }> = ({ title, icon, children, actionButton }) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-100 p-2 rounded-full">{icon}</div>
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      </div>
      {actionButton}
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const ClientDetail: React.FC<ClientDetailProps> = ({ client, history, memos, plans, mode, isLoading, onAddMemo, onUpdateMemo, onDeleteMemo, onOpenCatalog, onEditClient, onAddHistory, onEditCountryStrengths, onBack, onDeleteClient }) => {
  const { t, language } = useLanguage();

  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);
  const [editingMemoText, setEditingMemoText] = useState('');
  const [editingMemoDate, setEditingMemoDate] = useState('');
  const [isProcessingMemo, setIsProcessingMemo] = useState(false);

  const startEditMemo = (memo: Memo) => {
    setEditingMemoId(memo.id);
    setEditingMemoText(memo.text);
    const isoDate = memo.memoDate ? memo.memoDate.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
    setEditingMemoDate(isoDate);
  };

  const cancelEditMemo = () => {
    setEditingMemoId(null);
    setEditingMemoText('');
    setEditingMemoDate('');
  };

  const handleSaveMemoEdit = async () => {
    if (!client || !editingMemoId || !editingMemoText.trim() || !editingMemoDate) {
      return;
    }
    setIsProcessingMemo(true);
    try {
      await onUpdateMemo(client.id, editingMemoId, editingMemoText.trim(), new Date(editingMemoDate));
      cancelEditMemo();
    } catch (error) {
      console.error('Failed to update memo:', error);
      alert(t('updateMemoError'));
    } finally {
      setIsProcessingMemo(false);
    }
  };

  const handleDeleteMemoClick = async (memo: Memo) => {
    if (!client) return;
    if (!window.confirm(t('deleteMemoConfirm'))) return;
    setIsProcessingMemo(true);
    try {
      await onDeleteMemo(client.id, memo.id);
      if (editingMemoId === memo.id) {
        cancelEditMemo();
      }
    } catch (error) {
      console.error('Failed to delete memo:', error);
      alert(t('deleteMemoError'));
    } finally {
      setIsProcessingMemo(false);
    }
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 bg-gray-50 rounded-lg">
        <BookOpenIcon className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold">{t('selectClientPrompt')}</h2>
        <p className="mt-2 max-w-sm">{t('selectClientMessage')}</p>
      </div>
    );
  }

  const getPlanName = (item: HistoryItem) => {
    if (item.planId === 'other') {
      return `${t('other')}: ${item.otherPlanDescription || ''}`;
    }
    return plans.find(p => p.id === item.planId)?.name[language] || 'Unknown Plan';
  }

  const hasContactInfo = client.contactName || client.contactEmail || client.contactPhone || client.website;

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="md:hidden flex items-center gap-2 text-sm text-gray-600 font-semibold hover:text-gray-900"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        {t('backToList')}
      </button>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-6 bg-white rounded-xl shadow-sm">
        <div>
           <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-gray-900">{client.name[language]}</h2>
            <button onClick={onEditClient} className="text-gray-400 hover:text-indigo-600 transition-colors">
              <PencilIcon className="w-5 h-5"/>
            </button>
           </div>
          <p className="text-gray-500 mt-1 capitalize">
            {client.type.map(type => t(type)).join(' / ')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onOpenCatalog} className="flex items-center gap-2 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
            <PlusIcon className="w-5 h-5"/>
            {t('proposeNewPlan')}
          </button>
          <button type="button" onClick={onDeleteClient} className="flex items-center gap-2 bg-white text-red-600 font-semibold px-4 py-2 rounded-lg border border-red-200 hover:bg-red-50 transition-colors shadow-sm">
            <TrashIcon className="w-5 h-5" />
            {t('deleteClient')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InfoCard 
          title={t('countryStrengths')} 
          icon={<GlobeAltIcon className="w-6 h-6 text-indigo-600" />}
          actionButton={
            <button onClick={onEditCountryStrengths} className="flex items-center gap-1 text-sm text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">
              <PencilIcon className="w-4 h-4"/> {t('edit')}
            </button>
          }
        >
          {client.countryStrengths.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {client.countryStrengths.map(country => (
                <span key={country} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">{country}</span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">{t('noCountryStrengths')}</p>
          )}
        </InfoCard>

        <InfoCard 
          title={t('recentActivity')}
          icon={<ClockIcon className="w-6 h-6 text-indigo-600" />}
          actionButton={
            <button onClick={onAddHistory} className="flex items-center gap-1 text-sm text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">
              <PlusIcon className="w-4 h-4"/> {t('addHistory')}
            </button>
          }
        >
           {history.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {history.slice(0, 3).map(item => (
                <li key={item.id} className="py-3">
                  <p className="font-semibold text-gray-800">{getPlanName(item)}</p>
                  <p className="text-sm text-gray-500">
                    {item.date.toLocaleDateString()} - {item.groupSize} guests from {item.country}
                  </p>
                </li>
              ))}
            </ul>
           ) : (
            <p className="text-gray-500">{t('noRecentActivity')}</p>
           )}
        </InfoCard>
      </div>
      
      <InfoCard 
        title={t('contactInfo')}
        icon={<UserCircleIcon className="w-6 h-6 text-indigo-600" />}
      >
        {hasContactInfo ? (
          <div className="space-y-2 text-sm">
            {client.contactName && <p><strong className="font-semibold text-gray-600 w-24 inline-block">{t('contactName')}:</strong> {client.contactName}</p>}
            {client.contactEmail && <p><strong className="font-semibold text-gray-600 w-24 inline-block">{t('contactEmail')}:</strong> <a href={`mailto:${client.contactEmail}`} className="text-indigo-600 hover:underline">{client.contactEmail}</a></p>}
            {client.contactPhone && <p><strong className="font-semibold text-gray-600 w-24 inline-block">{t('contactPhone')}:</strong> {client.contactPhone}</p>}
            {client.website && <p><strong className="font-semibold text-gray-600 w-24 inline-block">{t('website')}:</strong> <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{client.website}</a></p>}
          </div>
        ) : (
          <p className="text-gray-500">{t('noContactInfo')}</p>
        )}
      </InfoCard>

      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">{t('salesMemos')}</h3>
        <div className="space-y-4">
          <MemoInput clientId={client.id} onAddMemo={onAddMemo} />
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4 max-h-96 overflow-y-auto">
            {memos.length > 0 ? (
              memos.map(memo => {
                const isEditing = editingMemoId === memo.id;
                return (
                  <div key={memo.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    {isEditing ? (
                      <div className="space-y-3">
                        <textarea
                          value={editingMemoText}
                          onChange={(e) => setEditingMemoText(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                          rows={3}
                        />
                        <div className="flex flex-wrap items-center gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600">{t('memoDate')}</label>
                            <input
                              type="date"
                              value={editingMemoDate}
                              onChange={(e) => setEditingMemoDate(e.target.value)}
                              className="mt-1 px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                              required
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleSaveMemoEdit}
                              disabled={!editingMemoText.trim() || !editingMemoDate || isProcessingMemo}
                              className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {t('save')}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditMemo}
                              disabled={isProcessingMemo}
                              className="px-3 py-1.5 bg-gray-100 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {t('cancel')}
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">
                          {memo.author} - {memo.memoDate.toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <div className="flex justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-gray-800 whitespace-pre-wrap">{memo.text}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {memo.author} - {memo.memoDate.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <button
                            type="button"
                            onClick={() => startEditMemo(memo)}
                            disabled={isProcessingMemo}
                            className="flex items-center gap-1 text-sm text-indigo-600 font-semibold hover:text-indigo-800 disabled:opacity-50"
                          >
                            <PencilIcon className="w-4 h-4" />
                            {t('editMemo')}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMemoClick(memo)}
                            disabled={isProcessingMemo}
                            className="flex items-center gap-1 text-sm text-red-600 font-semibold hover:text-red-800 disabled:opacity-50"
                          >
                            <TrashIcon className="w-4 h-4" />
                            {t('deleteMemo')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-4">{t('noMemos')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetail;





