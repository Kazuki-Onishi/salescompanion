
import type { Client, Plan, HistoryItem, Memo, Mode } from '../types';

// In-memory data store for demo mode
let clients: Client[] = [
  {
    id: '1',
    name: { en: 'Grand Palace Hotel', ja: 'グランドパレスホテル' },
    type: ['hotel'],
    countryStrengths: ['South Korea', 'USA', 'Taiwan'],
    contactName: 'Mr. Kim',
    contactEmail: 'kim@grandpalace.com',
    contactPhone: '123-456-7890',
    website: 'https://www.grandpalace.com'
  },
  {
    id: '2',
    name: { en: 'Sunrise Tours', ja: 'サンライズツアー' },
    type: ['tourGuide'],
    countryStrengths: ['Singapore', 'Malaysia'],
    contactName: 'Mr. Tanaka',
  },
  {
    id: '3',
    name: { en: 'Tokyo Central Hotel', ja: '東京セントラルホテル' },
    type: ['hotel', 'tourGuide'],
    countryStrengths: ['USA', 'UK'],
    contactName: 'Ms. Smith',
    website: 'https://tokyocentral.com'
  },
];

let plans: Plan[] = [
    { id: 'p1', name: {en: 'Standard Banquet Plan', ja: 'スタンダード宴会プラン'}, description: {en: 'A standard plan for parties.', ja: '一般的なパーティープランです。'}, type: 'banquet', price: 10000, season: 'All Year' },
    { id: 'p2', name: {en: 'Luxury Accommodation', ja: 'ラグジュアリー宿泊'}, description: {en: 'High-end accommodation with full service.', ja: 'フルサービス付きの高級宿泊プラン。'}, type: 'accommodation', price: 50000, season: 'All Year' },
    { id: 'p3', name: {en: 'Seasonal Lunch Menu', ja: '季節のランチメニュー'}, description: {en: 'A lunch menu featuring seasonal ingredients.', ja: '旬の食材を使ったランチメニュー。'}, type: 'menu', price: 3000, season: 'Spring' },
];

let history: HistoryItem[] = [
    { id: 'h1', clientId: '1', planId: 'p1', date: new Date('2023-10-15'), groupSize: 50, country: 'South Korea' },
    { id: 'h2', clientId: '1', planId: 'p2', date: new Date('2023-11-20'), groupSize: 2, country: 'USA' },
    { id: 'h3', clientId: '2', planId: 'other', otherPlanDescription: 'Custom city walking tour', date: new Date('2023-09-05'), groupSize: 15, country: 'Singapore' },
];

let memos: Memo[] = [
    { id: 'm1', clientId: '1', text: 'Mr. Kim is interested in a new banquet plan for the cherry blossom season.', author: 'Sales Rep', createdAt: new Date('2023-11-01T10:00:00Z'), memoDate: new Date('2023-11-01') },
    { id: 'm2', clientId: '2', text: 'Followed up regarding summer tour packages. They need a plan for groups of 20+.', author: 'Sales Rep', createdAt: new Date('2023-10-25T14:30:00Z'), memoDate: new Date('2023-10-25') },
];

let countries: string[] = ['South Korea', 'USA', 'Taiwan', 'Singapore', 'Malaysia', 'UK', 'China', 'Canada', 'Australia'];

// --- Utility to deep clone data and preserve Date objects ---
const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (Array.isArray(obj)) {
    const arrCopy: any[] = [];
    for (let i = 0; i < obj.length; i++) {
      arrCopy[i] = deepClone(obj[i]);
    }
    return arrCopy as any;
  }

  const objCopy = {} as { [key: string]: any };
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      objCopy[key] = deepClone(obj[key]);
    }
  }

  return objCopy as T;
};


// --- Mock API Functions ---

export const mockGetClients = async (): Promise<Client[]> => {
  console.log("Mock API: Fetching clients");
  return Promise.resolve(deepClone(clients));
};

export const mockGetPlans = async (): Promise<Plan[]> => {
  console.log("Mock API: Fetching plans");
  return Promise.resolve(deepClone(plans));
};

export const mockGetCountries = async (): Promise<string[]> => {
    console.log("Mock API: Fetching countries");
    return Promise.resolve([...countries].sort());
}

export const mockAddCountry = async (name: string): Promise<string> => {
    console.log("Mock API: Adding country", name);
    const trimmedName = name.trim();
    if (trimmedName && !countries.includes(trimmedName)) {
        countries.push(trimmedName);
    }
    return Promise.resolve(trimmedName);
}

export const mockGetClientHistory = async (clientId: string): Promise<HistoryItem[]> => {
  console.log("Mock API: Fetching history for client", clientId);
  const clientHistory = history
    .filter(h => h.clientId === clientId)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
  return Promise.resolve(deepClone(clientHistory));
};

export const mockGetClientMemos = async (clientId: string): Promise<Memo[]> => {
  console.log("Mock API: Fetching memos for client", clientId);
  const clientMemos = memos
    .filter(m => m.clientId === clientId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return Promise.resolve(deepClone(clientMemos));
};

export const mockGetAllMemos = async (): Promise<Memo[]> => {
  console.log("Mock API: Fetching all memos");
   const allMemos = memos.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return Promise.resolve(deepClone(allMemos));
};


export const mockUpdateMemo = async (clientId: string, memoId: string, text: string, memoDate: Date): Promise<Memo> => {
  console.log("Mock API: Updating memo", memoId);
  const index = memos.findIndex(m => m.id === memoId && m.clientId === clientId);
  if (index === -1) {
    throw new Error('Memo not found');
  }
  memos[index] = { ...memos[index], text, memoDate };
  return Promise.resolve(deepClone(memos[index]));
};

export const mockDeleteMemo = async (clientId: string, memoId: string): Promise<void> => {
  console.log("Mock API: Deleting memo", memoId);
  memos = memos.filter(m => !(m.id === memoId && m.clientId === clientId));
  return Promise.resolve();
};

export const mockAddMemo = async (clientId: string, text: string, author: string, memoDate: Date): Promise<Memo> => {
  console.log("Mock API: Adding memo for client", clientId);
  const newMemo: Memo = {
    id: `m${Date.now()}`,
    clientId,
    text,
    author,
    memoDate,
    createdAt: new Date(),
  };
  memos.push(newMemo);
  return Promise.resolve(deepClone(newMemo));
};

export const mockSaveClient = async (clientData: Omit<Client, 'id'> | Client): Promise<Client> => {
  if ('id' in clientData) {
    console.log("Mock API: Updating client", clientData.id);
    clients = clients.map(c => (c.id === clientData.id ? { ...c, ...clientData } : c));
    return Promise.resolve(deepClone(clientData));
  } else {
    console.log("Mock API: Creating new client");
    const newClient: Client = {
      ...clientData,
      id: `c${Date.now()}`,
    };
    clients.push(newClient);
    return Promise.resolve(deepClone(newClient));
  }
};

export const mockBulkAddClients = async (clientsData: Omit<Client, 'id'>[]): Promise<Client[]> => {
    console.log("Mock API: Bulk adding clients", clientsData.length);
    const newClients: Client[] = [];
    clientsData.forEach(client => {
        const newClient: Client = {
            ...client,
            id: `c${Date.now()}-${Math.random()}`,
        };
        clients.push(newClient);
        newClients.push(newClient);
    });
    return Promise.resolve(deepClone(newClients));
};

export const mockSavePlan = async (planData: Omit<Plan, 'id'> | Plan): Promise<Plan> => {
   if ('id' in planData) {
    console.log("Mock API: Updating plan", planData.id);
    plans = plans.map(p => (p.id === planData.id ? { ...p, ...planData } : p));
    return Promise.resolve(deepClone(planData));
  } else {
    console.log("Mock API: Creating new plan");
    const newPlan: Plan = {
      ...planData,
      id: `p${Date.now()}`,
    };
    plans.push(newPlan);
    return Promise.resolve(deepClone(newPlan));
  }
};

export const mockDeleteClient = async (clientId: string): Promise<void> => {
    console.log("Mock API: Deleting client", clientId);
    clients = clients.filter(c => c.id !== clientId);
    history = history.filter(h => h.clientId !== clientId);
    memos = memos.filter(m => m.clientId !== clientId);
    return Promise.resolve();
};

export const mockAddHistory = async (clientId: string, historyData: Omit<HistoryItem, 'id' | 'clientId'>): Promise<HistoryItem> => {
    console.log("Mock API: Adding history for client", clientId);
    const newHistoryItem: HistoryItem = {
        ...historyData,
        id: `h${Date.now()}`,
        clientId,
    };
    history.push(newHistoryItem);
    return Promise.resolve(deepClone(newHistoryItem));
};
