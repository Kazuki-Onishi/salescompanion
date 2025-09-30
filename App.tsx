import React, { useState, useEffect, useCallback } from 'react';
import { getClients, getPlans, getClientHistory, getClientMemos, addMemo as apiAddMemo, updateMemo as apiUpdateMemo, deleteMemo as apiDeleteMemo, saveClient as apiSaveClient, addHistory as apiAddHistory, savePlan as apiSavePlan, getCountries, addCountry as apiAddCountry, getAllMemos, bulkAddClients as apiBulkAddClients, deleteClient as apiDeleteClient } from './services/api';
import type { Mode, Client, Plan, HistoryItem, Memo } from './types';
import Header from './components/Header';
import ClientList from './components/ClientList';
import ClientDetail from './components/ClientDetail';
import PlanCatalog from './components/PlanCatalog';
import ClientFormModal from './components/ClientFormModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import HistoryFormModal from './components/HistoryFormModal';
import PlanFormModal from './components/PlanFormModal';
import CountryStrengthFormModal from './components/CountryStrengthFormModal';
import { useLanguage } from './context/LanguageContext';
import CsvHelpModal from './components/CsvHelpModal';
import { isConfigValid } from './services/firebase';
import * as Encoding from 'encoding-japanese';

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('hotel');
  const [clients, setClients] = useState<Client[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientHistory, setClientHistory] = useState<HistoryItem[]>([]);
  const [clientMemos, setClientMemos] = useState<Memo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const { t, language } = useLanguage();

  // Modal States
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isCountryStrengthModalOpen, setIsCountryStrengthModalOpen] = useState(false);
  const [isCsvHelpModalOpen, setIsCsvHelpModalOpen] = useState(false);
  const [clientPendingDeletion, setClientPendingDeletion] = useState<Client | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingClient, setIsDeletingClient] = useState(false);


  const fetchAllClients = useCallback(async () => {
    try {
      const [clientsData, allMemosData] = await Promise.all([
        getClients(),
        getAllMemos() // Fetch all memos to find the latest for each client
      ]);
      
      const clientsWithMemos = clientsData.map(client => {
        const clientMemos = allMemosData
          .filter(memo => memo.clientId === client.id)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return {
          ...client,
          latestMemo: clientMemos[0] || undefined // Attach the latest memo
        };
      });

      setClients(clientsWithMemos);
    } catch (error) {
        console.error("Failed to fetch clients:", error);
    }
  }, []);
  
  const fetchAllPlans = useCallback(async () => {
    try {
        const plansData = await getPlans();
        setPlans(plansData);
    } catch(error) {
        console.error("Failed to fetch plans:", error);
    }
  }, []);

  const fetchAllCountries = useCallback(async () => {
    try {
        const countriesData = await getCountries();
        setCountries(countriesData);
    } catch(error) {
        console.error("Failed to fetch countries:", error);
    }
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
            fetchAllClients(),
            fetchAllPlans(),
            fetchAllCountries()
        ]);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [fetchAllClients, fetchAllPlans, fetchAllCountries]);

  const handleSelectClient = useCallback(async (client: Client | null) => {
    setSelectedClient(client);
    if (client) {
      setIsLoading(true);
      try {
        const [historyData, memosData] = await Promise.all([
          getClientHistory(client.id),
          getClientMemos(client.id),
        ]);
        setClientHistory(historyData);
        setClientMemos(memosData);
      } catch (error) {
        console.error("Failed to fetch client details:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setClientHistory([]);
      setClientMemos([]);
    }
  }, []);

  const addMemo = async (clientId: string, text: string, memoDate: Date) => {
    if (!text.trim()) return;
    const newMemo = await apiAddMemo(clientId, text, 'Sales Rep', memoDate);
    setClientMemos(prevMemos => [newMemo, ...prevMemos]);
    await fetchAllClients(); // Re-fetch clients to update latest memo in the list
  };

  const handleUpdateMemo = async (clientId: string, memoId: string, text: string, memoDate: Date) => {
    const trimmed = text.trim();
    if (!trimmed) {
      throw new Error('Memo text required');
    }
    const updatedMemo = await apiUpdateMemo(clientId, memoId, trimmed, memoDate);
    setClientMemos(prev => prev.map(m => (m.id === memoId ? updatedMemo : m)));
    const updatedClients = await fetchAllClients();
    if (selectedClient) {
      const refreshed = updatedClients.find(c => c.id === selectedClient.id);
      if (refreshed) {
        setSelectedClient(refreshed);
      }
    }
  };

  const handleDeleteMemo = async (clientId: string, memoId: string) => {
    await apiDeleteMemo(clientId, memoId);
    setClientMemos(prev => prev.filter(m => m.id !== memoId));
    const updatedClients = await fetchAllClients();
    if (selectedClient) {
      const refreshed = updatedClients.find(c => c.id === selectedClient.id);
      if (refreshed) {
        setSelectedClient(refreshed);
      }
    }
  };

  const handleSaveClient = async (clientData: Omit<Client, 'id'> | Client) => {
    const savedClient = await apiSaveClient(clientData);
    await fetchAllClients();
    if (selectedClient && 'id' in clientData && selectedClient.id === clientData.id) {
        // Find the updated client from the list to ensure we have the latest data
        const clientsWithLatestMemos = await getClients();
        const allMemos = await getAllMemos();
        const updatedClientFromList = clientsWithLatestMemos.find(c => c.id === savedClient.id);
        if (updatedClientFromList) {
            const clientMemos = allMemos.filter(m => m.clientId === savedClient.id).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
             const fullClientData = { ...updatedClientFromList, latestMemo: clientMemos[0]};
             setSelectedClient(fullClientData);
        } else {
            setSelectedClient(savedClient);
        }

    } else if (!('id' in clientData)) {
        await handleSelectClient(savedClient);
    }
    setIsClientModalOpen(false);
    setEditingClient(null);
  };

  const handleSaveCountryStrengths = async (strengths: string[]) => {
    if (!selectedClient) return;
    const updatedClientData = { ...selectedClient, countryStrengths: strengths };
    const savedClient = await apiSaveClient(updatedClientData);
    await fetchAllClients(); // Re-fetch client list to keep it in sync
    setSelectedClient(savedClient); // Update the selected client with the returned data
    setIsCountryStrengthModalOpen(false);
  };
  
  const handleAddHistory = async (historyData: Omit<HistoryItem, 'id' | 'clientId'>) => {
    if (!selectedClient) return;
    const newHistoryItem = await apiAddHistory(selectedClient.id, historyData);
    setClientHistory(prev => [newHistoryItem, ...prev]);
    setIsHistoryModalOpen(false);
  };

  const handleSavePlan = async (planData: Omit<Plan, 'id'> | Plan) => {
    await apiSavePlan(planData);
    await fetchAllPlans();
    setIsPlanModalOpen(false);
    setEditingPlan(null);
  };

  const handleAddCountry = async (name: string) => {
    await apiAddCountry(name);
    await fetchAllCountries();
  };

  const handleOpenClientModal = (client: Client | null) => {
    setEditingClient(client);
    setIsClientModalOpen(true);
  };

  const handleOpenPlanModal = (plan: Plan | null) => {
    setEditingPlan(plan);
    setIsPlanModalOpen(true);
  }

  const handlePromptDeleteClient = (client: Client) => {
    setClientPendingDeletion(client);
    setIsDeleteModalOpen(true);
  };

  const handleCancelDeleteClient = () => {
    if (isDeletingClient) return;
    setIsDeleteModalOpen(false);
    setClientPendingDeletion(null);
  };

  const handleConfirmDeleteClient = async () => {
    if (!clientPendingDeletion) return;
    try {
      setIsDeletingClient(true);
      await apiDeleteClient(clientPendingDeletion.id);
      await handleSelectClient(null);
      await fetchAllClients();
      alert(t('deleteClientSuccess'));
    } catch (error) {
      console.error("Failed to delete client:", error);
      alert(t('deleteClientError'));
    } finally {
      setIsDeletingClient(false);
      setIsDeleteModalOpen(false);
      setClientPendingDeletion(null);
    }
  };

  const handleImportCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        if (!event.target?.result) return;
        
        // Convert ArrayBuffer to string, detecting encoding automatically
        const codes = Encoding.convert(new Uint8Array(event.target.result as ArrayBuffer), {
          to: 'UNICODE',
          from: 'AUTO'
        });
        const text = Encoding.codeToString(codes);

        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) {
          alert(t('importCheckHeadersMessage'));
          return;
        }

        const header = lines[0].split(',').map(h => h.trim());
        const requiredHeaders = ['name_en', 'name_ja', 'type'];
        if (!requiredHeaders.every(h => header.includes(h))) {
          alert(`${t('importCheckHeadersMessage')}\nRequired: ${requiredHeaders.join(', ')}`);
          return;
        }
        
        const headerMap = header.reduce((acc, curr, index) => {
            acc[curr] = index;
            return acc;
        }, {} as Record<string, number>);

        const newClients: Omit<Client, 'id'>[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          
          const name_en = values[headerMap['name_en']]?.trim();
          const name_ja = values[headerMap['name_ja']]?.trim();
          const typesRaw = values[headerMap['type']]?.trim() || '';
          const types = typesRaw.split(';').map(s => s.trim()).filter(s => s === 'hotel' || s === 'tourGuide') as Mode[];

          if (name_en && name_ja && types.length > 0) {
            const countryStrengthsRaw = values[headerMap['countryStrengths']]?.trim();
            const newClient: Omit<Client, 'id'> = {
              name: { en: name_en, ja: name_ja },
              type: types,
              contactName: values[headerMap['contactName']]?.trim() || undefined,
              contactEmail: values[headerMap['contactEmail']]?.trim() || undefined,
              contactPhone: values[headerMap['contactPhone']]?.trim() || undefined,
              website: values[headerMap['website']]?.trim() || undefined,
              countryStrengths: countryStrengthsRaw ? countryStrengthsRaw.split(';').map(s => s.trim()).filter(Boolean) : [],
            };
            newClients.push(newClient);
          }
        }

        if (newClients.length > 0) {
          setIsImporting(true);
          await apiBulkAddClients(newClients);
          alert(t('importSuccessMessage', { count: newClients.length }));
          await fetchAllClients();
        } else {
          alert(t('importNoValidClientsMessage'));
        }
      } catch (error) {
        alert(t('importFailedMessage'));
        console.error("CSV Import failed:", error);
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const filteredClients = clients.filter(client => client.type.includes(mode));

  useEffect(() => {
    handleSelectClient(null);
  }, [mode, handleSelectClient]);

  return (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-800">
      <Header 
        mode={mode} 
        setMode={setMode} 
        onImportCSV={handleImportCSV} 
        isImporting={isImporting}
        onOpenCsvHelp={() => setIsCsvHelpModalOpen(true)}
        isDemoMode={!isConfigValid}
      />
      <main 
        className={`flex ${selectedClient ? 'flex-col md:flex-row' : 'flex-col'}`}
        style={{ height: `calc(100vh - ${!isConfigValid ? '104px' : '64px'})` }}
      >
        <aside className={`bg-white overflow-y-auto border-r border-gray-200 transition-all duration-300 ${
          selectedClient
            ? 'w-full md:w-1/3 lg:w-1/4 xl:w-1/5 hidden md:block'
            : 'w-full h-full block'
        }`}>
          <ClientList
            clients={filteredClients}
            selectedClient={selectedClient}
            onSelectClient={handleSelectClient}
            onAddClient={() => handleOpenClientModal(null)}
            isLoading={isLoading && !clients.length}
            isImporting={isImporting}
          />
        </aside>
        <section className={`p-4 sm:p-6 lg:p-8 overflow-y-auto transition-all duration-300 ${
            selectedClient ? 'flex-1 block' : 'hidden'
        }`}>
          <ClientDetail
            client={selectedClient}
            history={clientHistory}
            memos={clientMemos}
            plans={plans}
            mode={mode}
            isLoading={isLoading && !!selectedClient}
            onAddMemo={addMemo}
            onOpenCatalog={() => setIsCatalogOpen(true)}
            onEditClient={() => handleOpenClientModal(selectedClient)}
            onEditCountryStrengths={() => setIsCountryStrengthModalOpen(true)}
            onAddHistory={() => setIsHistoryModalOpen(true)}
            onBack={() => handleSelectClient(null)}
          />
        </section>
      </main>
      {isCatalogOpen && (
        <PlanCatalog
            plans={plans}
            onClose={() => setIsCatalogOpen(false)}
            onAddPlan={() => handleOpenPlanModal(null)}
            onEditPlan={(plan) => handleOpenPlanModal(plan)}
        />
      )}
      {isClientModalOpen && (
        <ClientFormModal
            isOpen={isClientModalOpen}
            onClose={() => { setIsClientModalOpen(false); setEditingClient(null); }}
            onSave={handleSaveClient}
            clientToEdit={editingClient}
            mode={mode}
            countries={countries}
            onAddCountry={handleAddCountry}
        />
      )}
      {selectedClient && isHistoryModalOpen && (
        <HistoryFormModal
            isOpen={isHistoryModalOpen}
            onClose={() => setIsHistoryModalOpen(false)}
            onSave={handleAddHistory}
            plans={plans}
            countries={countries}
        />
      )}
       {isPlanModalOpen && (
        <PlanFormModal
          isOpen={isPlanModalOpen}
          onClose={() => { setIsPlanModalOpen(false); setEditingPlan(null); }}
          onSave={handleSavePlan}
          planToEdit={editingPlan}
        />
      )}
      {selectedClient && isCountryStrengthModalOpen && (
        <CountryStrengthFormModal
          isOpen={isCountryStrengthModalOpen}
          onClose={() => setIsCountryStrengthModalOpen(false)}
          onSave={handleSaveCountryStrengths}
          client={selectedClient}
          countries={countries}
          onAddCountry={handleAddCountry}
        />
      )}
      {isDeleteModalOpen && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          clientName={clientPendingDeletion ? clientPendingDeletion.name[language] : undefined}
          isDeleting={isDeletingClient}
          onCancel={handleCancelDeleteClient}
          onConfirm={handleConfirmDeleteClient}
        />
      )}
      {isCsvHelpModalOpen && (
        <CsvHelpModal 
          isOpen={isCsvHelpModalOpen}
          onClose={() => setIsCsvHelpModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;


