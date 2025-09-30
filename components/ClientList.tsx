import React, { useState } from 'react';
import type { Client } from '../types';
import { SearchIcon, PlusIcon, UserCircleIcon, PhoneIcon, ChatBubbleLeftEllipsisIcon } from './icons/Icons';
import { useLanguage } from '../context/LanguageContext';

interface ClientListProps {
  clients: Client[];
  selectedClient: Client | null;
  onSelectClient: (client: Client) => void;
  onAddClient: () => void;
  isLoading: boolean;
  isImporting: boolean;
}

const ClientList: React.FC<ClientListProps> = ({ clients, selectedClient, onSelectClient, onAddClient, isLoading, isImporting }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { t, language } = useLanguage();

  const filteredClients = clients.filter(client => {
    const term = searchTerm.toLowerCase();
    return client.name[language].toLowerCase().includes(term) ||
      (client.contactName || '').toLowerCase().includes(term) ||
      (client.latestMemo?.text || '').toLowerCase().includes(term);
  });

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="relative mb-4">
          <input
            type="text"
            placeholder={t('searchClients')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        <button onClick={onAddClient} disabled={isImporting} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
          <PlusIcon className="w-5 h-5" />
          <span className="text-sm font-semibold">{t('addClient')}</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading || isImporting ? (
          <div className="p-8 text-center text-gray-500">
            <p className="font-semibold">{isImporting ? t('importingClients') : t('loadingClients')}</p>
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto mt-4"></div>
          </div>
        ) : (
          <ul>
            {filteredClients.map(client => (
              <li key={client.id}>
                <button
                  onClick={() => onSelectClient(client)}
                  className={`w-full text-left px-4 py-4 transition-colors duration-150 border-b border-gray-100 last:border-b-0 ${
                    selectedClient?.id === client.id
                      ? 'bg-indigo-100 text-indigo-800 border-r-4 border-indigo-500'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <p className="font-semibold text-base truncate">{client.name[language]}</p>
                  <div className="mt-2 text-xs text-gray-500 space-y-1.5">
                    {(client.contactName || client.contactPhone) && (
                      <div className="flex items-center gap-4">
                        {client.contactName && (
                          <span className="flex items-center gap-1.5 min-w-0">
                            <UserCircleIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{client.contactName}</span>
                          </span>
                        )}
                        {client.contactPhone && (
                           <span className="flex items-center gap-1.5 min-w-0">
                            <PhoneIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{client.contactPhone}</span>
                          </span>
                        )}
                      </div>
                    )}
                    {client.latestMemo && (
                      <div className="flex items-start gap-1.5">
                        <ChatBubbleLeftEllipsisIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="line-clamp-2 leading-snug">
                          {client.latestMemo.text}
                        </p>
                      </div>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ClientList;