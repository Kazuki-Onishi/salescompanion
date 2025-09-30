import { db, isConfigValid } from './firebase';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  writeBatch,
  Timestamp,
  query,
  orderBy,
  collectionGroup,
  arrayUnion,
  serverTimestamp,
  deleteDoc,
  setDoc,
  deleteField
} from 'firebase/firestore';
import type { Client, Plan, HistoryItem, Memo } from '../types';
import * as mockApi from './mockApi';

// This file acts as a facade for data operations.
// It will use the real Firebase API if configured, otherwise it falls back to the mock API.

// --- Data Converters ---

const historyFromFirestore = (doc: any): HistoryItem => {
    const data = doc.data();
    return {
        id: doc.id,
        clientId: doc.ref.parent.parent.id,
        planId: data.planId,
        date: (data.date instanceof Timestamp) ? data.date.toDate() : new Date(),
        groupSize: data.groupSize,
        country: data.country,
        otherPlanDescription: data.otherPlanDescription,
    };
};

const memoFromFirestore = (doc: any): Memo => {
    const data = doc.data();
    return {
        id: doc.id,
        clientId: doc.ref.parent.parent.id, // Correctly get clientId from path
        text: data.text,
        author: data.author,
        // Safely convert Timestamps to Dates. A server-pending timestamp is null in snapshot.
        // Fallback to a new Date() if createdAt is not available yet.
        createdAt: (data.createdAt instanceof Timestamp) ? data.createdAt.toDate() : new Date(),
        memoDate: (data.memoDate instanceof Timestamp) ? data.memoDate.toDate() : new Date(),
    };
};

const buildClientWriteData = (clientData: Omit<Client, 'id'> | Client, options: { forUpdate?: boolean } = {}) => {
  const { forUpdate = false } = options;
  const base: Record<string, any> = {
    name: clientData.name,
    type: clientData.type,
    countryStrengths: clientData.countryStrengths ?? [],
  };

  const optionalKeys: (keyof Client)[] = ['contactName', 'contactEmail', 'contactPhone', 'website'];
  optionalKeys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(clientData, key)) {
      const value = (clientData as Record<string, any>)[key];
      if (value === undefined) {
        if (forUpdate) {
          base[key] = deleteField();
        }
      } else {
        base[key] = value;
      }
    }
  });

  return base;
};

// --- Firestore API Functions ---

const firebaseGetClients = async (): Promise<Client[]> => {
  if (!db) return [];
  const snapshot = await getDocs(collection(db, 'clients'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
};

const firebaseGetPlans = async (): Promise<Plan[]> => {
  if (!db) return [];
  const snapshot = await getDocs(collection(db, 'plans'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Plan));
};

const firebaseGetCountries = async (): Promise<string[]> => {
  if (!db) return [];
  const docRef = doc(db, 'settings', 'countries');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return (docSnap.data().list || []).sort();
  }
  return [];
};

const firebaseAddCountry = async (name: string): Promise<string> => {
  if (!db) return name;
  const trimmedName = name.trim();
  if (trimmedName) {
    const docRef = doc(db, 'settings', 'countries');
    await setDoc(docRef, { list: arrayUnion(trimmedName) }, { merge: true });
  }
  return trimmedName;
};

const firebaseGetClientHistory = async (clientId: string): Promise<HistoryItem[]> => {
  if (!db) return [];
  const historyRef = collection(db, 'clients', clientId, 'history');
  const q = query(historyRef, orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(historyFromFirestore);
};

const firebaseGetClientMemos = async (clientId: string): Promise<Memo[]> => {
  if (!db) return [];
  const memosRef = collection(db, 'clients', clientId, 'memos');
  const q = query(memosRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(memoFromFirestore);
};

const firebaseGetAllMemos = async (): Promise<Memo[]> => {
  if (!db) return [];
  const memosRef = collectionGroup(db, 'memos');
  const q = query(memosRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(memoFromFirestore);
};

const firebaseAddMemo = async (clientId: string, text: string, author: string, memoDate: Date): Promise<Memo> => {
  if (!db) throw new Error("Firebase is not configured.");
  const memosRef = collection(db, 'clients', clientId, 'memos');
  const newMemoData = { text, author, memoDate: Timestamp.fromDate(memoDate), createdAt: serverTimestamp() };
  const docRef = await addDoc(memosRef, newMemoData);
  const docSnap = await getDoc(docRef);
  return memoFromFirestore(docSnap);
};


const firebaseUpdateMemo = async (clientId: string, memoId: string, text: string, memoDate: Date): Promise<Memo> => {
  if (!db) throw new Error("Firebase is not configured.");
  const memoRef = doc(db, 'clients', clientId, 'memos', memoId);
  await updateDoc(memoRef, {
    text,
    memoDate: Timestamp.fromDate(memoDate),
  });
  const updatedSnap = await getDoc(memoRef);
  return memoFromFirestore(updatedSnap);
};

const firebaseDeleteMemo = async (clientId: string, memoId: string): Promise<void> => {
  if (!db) throw new Error("Firebase is not configured.");
  const memoRef = doc(db, 'clients', clientId, 'memos', memoId);
  await deleteDoc(memoRef);
};

const firebaseSaveClient = async (clientData: Omit<Client, 'id'> | Client): Promise<Client> => {
  if (!db) throw new Error("Firebase is not configured.");
  const { latestMemo, ...dataToSave } = clientData;

  if ('id' in dataToSave && dataToSave.id) {
    const docRef = doc(db, 'clients', dataToSave.id);
    await updateDoc(docRef, buildClientWriteData(dataToSave, { forUpdate: true }));
    return clientData as Client;
  } else {
    const docRef = await addDoc(collection(db, 'clients'), buildClientWriteData(dataToSave));
    return { ...clientData, id: docRef.id } as Client;
  }
};

const firebaseBulkAddClients = async (clientsData: Omit<Client, 'id'>[]): Promise<Client[]> => {
  if (!db) return [];
  const batch = writeBatch(db);
  const newClients: Client[] = [];
  clientsData.forEach((client) => {
    const docRef = doc(collection(db, 'clients'));
    batch.set(docRef, buildClientWriteData(client));
    newClients.push({ ...client, id: docRef.id });
  });
  await batch.commit();
  return newClients;
};

const firebaseSavePlan = async (planData: Omit<Plan, 'id'> | Plan): Promise<Plan> => {
  if (!db) throw new Error("Firebase is not configured.");
  if ('id' in planData && planData.id) {
    const docRef = doc(db, 'plans', planData.id);
    await updateDoc(docRef, planData);
    return planData;
  } else {
    const docRef = await addDoc(collection(db, 'plans'), planData);
    return { ...planData, id: docRef.id };
  }
};

const firebaseDeleteClient = async (clientId: string): Promise<void> => {
  if (!db) return;
  const clientRef = doc(db, 'clients', clientId);
  const historyRef = collection(db, 'clients', clientId, 'history');
  const memosRef = collection(db, 'clients', clientId, 'memos');

  const [historySnap, memosSnap] = await Promise.all([
    getDocs(historyRef),
    getDocs(memosRef)
  ]);

  const deletions: Promise<void>[] = [];
  historySnap.forEach((historyDoc) => deletions.push(deleteDoc(historyDoc.ref)));
  memosSnap.forEach((memoDoc) => deletions.push(deleteDoc(memoDoc.ref)));

  await Promise.all(deletions);
  await deleteDoc(clientRef);
};

const firebaseAddHistory = async (clientId: string, historyData: Omit<HistoryItem, 'id' | 'clientId'>): Promise<HistoryItem> => {
  if (!db) throw new Error("Firebase is not configured.");
  const historyRef = collection(db, 'clients', clientId, 'history');
  const dataWithTimestamp = { ...historyData, date: Timestamp.fromDate(historyData.date) };
  const docRef = await addDoc(historyRef, dataWithTimestamp);
  return { ...historyData, id: docRef.id, clientId };
};

// --- Exported Facade Functions ---

export const getClients = isConfigValid ? firebaseGetClients : mockApi.mockGetClients;
export const getPlans = isConfigValid ? firebaseGetPlans : mockApi.mockGetPlans;
export const getCountries = isConfigValid ? firebaseGetCountries : mockApi.mockGetCountries;
export const addCountry = isConfigValid ? firebaseAddCountry : mockApi.mockAddCountry;
export const getClientHistory = isConfigValid ? firebaseGetClientHistory : mockApi.mockGetClientHistory;
export const getClientMemos = isConfigValid ? firebaseGetClientMemos : mockApi.mockGetClientMemos;
export const getAllMemos = isConfigValid ? firebaseGetAllMemos : mockApi.mockGetAllMemos;
export const addMemo = isConfigValid ? firebaseAddMemo : mockApi.mockAddMemo;
export const updateMemo = isConfigValid ? firebaseUpdateMemo : mockApi.mockUpdateMemo;
export const deleteMemo = isConfigValid ? firebaseDeleteMemo : mockApi.mockDeleteMemo;
export const saveClient = isConfigValid ? firebaseSaveClient : mockApi.mockSaveClient;
export const bulkAddClients = isConfigValid ? firebaseBulkAddClients : mockApi.mockBulkAddClients;
export const savePlan = isConfigValid ? firebaseSavePlan : mockApi.mockSavePlan;
export const addHistory = isConfigValid ? firebaseAddHistory : mockApi.mockAddHistory;
export const deleteClient = isConfigValid ? firebaseDeleteClient : mockApi.mockDeleteClient;
