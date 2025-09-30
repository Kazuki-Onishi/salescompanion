export type Mode = 'hotel' | 'tourGuide';

export interface BilingualString {
  en: string;
  ja: string;
}

export interface Client {
  id: string;
  name: BilingualString;
  type: Mode[];
  countryStrengths: string[];
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  latestMemo?: Memo;
}

export interface Plan {
  id: string;
  name: BilingualString;
  description: BilingualString;
  type: 'banquet' | 'accommodation' | 'menu';
  price: number;
  season: string;
}

export interface HistoryItem {
  id: string;
  clientId: string;
  planId: string; // Can be 'other'
  date: Date;
  groupSize: number;
  country: string;
  otherPlanDescription?: string;
}

export interface Memo {
  id: string;
  clientId: string;
  text: string;
  author: string;
  createdAt: Date;
  memoDate: Date;
}