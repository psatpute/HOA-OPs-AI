"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

// Types
export type User = {
  id: string;
  name: string;
  email: string;
  role: 'Treasurer' | 'President' | 'Member';
};

export type Transaction = {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  type: 'income' | 'expense';
  vendor?: string; // For expenses
  source?: string; // For income
  projectId?: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  status: 'Planned' | 'In Progress' | 'Completed';
  budget: number;
  startDate: string;
  endDate?: string;
  assignedVendorId?: string;
};

export type Proposal = {
  id: string;
  projectId: string;
  vendorName: string;
  amount: number;
  timeline: string; // e.g., "2 weeks"
  warranty: string;
  scope: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
};

export type Document = {
  id: string;
  title: string;
  category: 'Contract' | 'Meeting Minutes' | 'Financial Report' | 'Other';
  date: string;
  size: string;
  type: string; // pdf, docx, etc.
};

type AppState = {
  user: User | null;
  transactions: Transaction[];
  projects: Project[];
  proposals: Proposal[];
  documents: Document[];
};

type AppContextType = AppState & {
  login: (email: string) => void;
  logout: () => void;
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  addProject: (p: Omit<Project, 'id'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  addProposal: (p: Omit<Proposal, 'id'>) => void;
  addDocument: (d: Omit<Document, 'id'>) => void;
  deleteDocument: (id: string) => void;
  importTransactions: (data: any[]) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock Initial Data
const INITIAL_DATA: AppState = {
  user: null,
  transactions: [
    { id: '1', date: '2023-10-01', amount: 15000, category: 'Dues', description: 'Monthly HOA Dues', type: 'income', source: 'Homeowners' },
    { id: '2', date: '2023-10-05', amount: 450, category: 'Landscaping', description: 'Weekly Lawn Maintenance', type: 'expense', vendor: 'Green Thumb Landscaping' },
    { id: '3', date: '2023-10-12', amount: 1200, category: 'Utilities', description: 'Community Pool Water Bill', type: 'expense', vendor: 'City Water' },
    { id: '4', date: '2023-10-15', amount: 2500, category: 'Repairs', description: 'Gate Motor Repair', type: 'expense', vendor: 'SecureGates Inc' },
  ],
  projects: [
    { id: '1', name: 'Clubhouse Roof Repair', description: 'Replace damaged shingles and fix leaks in the main clubhouse roof.', status: 'Planned', budget: 25000, startDate: '2023-11-01' },
    { id: '2', name: 'Pool Resurfacing', description: 'Resurface the main pool and replace tiles.', status: 'In Progress', budget: 18000, startDate: '2023-09-15' },
  ],
  proposals: [
    { id: '1', projectId: '1', vendorName: 'TopTier Roofing', amount: 24500, timeline: '2 weeks', warranty: '10 years', scope: 'Full replacement of shingles, underlayment check.', status: 'Pending' },
    { id: '2', projectId: '1', vendorName: 'Budget Roofers', amount: 21000, timeline: '3 weeks', warranty: '5 years', scope: 'Overlay existing shingles.', status: 'Pending' },
    { id: '3', projectId: '1', vendorName: 'Premium Shield', amount: 28000, timeline: '1 week', warranty: '25 years', scope: 'Premium architectural shingles, lifetime warranty.', status: 'Pending' },
  ],
  documents: [
    { id: '1', title: 'Oct 2023 Meeting Minutes', category: 'Meeting Minutes', date: '2023-10-02', size: '2.4 MB', type: 'pdf' },
    { id: '2', title: 'Landscaping Contract 2023', category: 'Contract', date: '2023-01-15', size: '4.1 MB', type: 'pdf' },
  ],
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(INITIAL_DATA);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('hoa-ops-data');
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('hoa-ops-data', JSON.stringify(state));
    }
  }, [state, isInitialized]);

  const login = (email: string) => {
    setState(prev => ({
      ...prev,
      user: {
        id: 'u1',
        name: 'Teresa Treasurer',
        email,
        role: 'Treasurer'
      }
    }));
  };

  const logout = () => {
    setState(prev => ({ ...prev, user: null }));
  };

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newT = { ...t, id: Math.random().toString(36).substr(2, 9) };
    setState(prev => ({ ...prev, transactions: [newT, ...prev.transactions] }));
  };

  const addProject = (p: Omit<Project, 'id'>) => {
    const newP = { ...p, id: Math.random().toString(36).substr(2, 9) };
    setState(prev => ({ ...prev, projects: [newP, ...prev.projects] }));
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const addProposal = (p: Omit<Proposal, 'id'>) => {
    const newP = { ...p, id: Math.random().toString(36).substr(2, 9) };
    setState(prev => ({ ...prev, proposals: [...prev.proposals, newP] }));
  };

  const addDocument = (d: Omit<Document, 'id'>) => {
    const newD = { ...d, id: Math.random().toString(36).substr(2, 9) };
    setState(prev => ({ ...prev, documents: [newD, ...prev.documents] }));
  };

  const deleteDocument = (id: string) => {
    setState(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d.id !== id)
    }));
  };

  const importTransactions = (data: any[]) => {
    // Simple mock import logic
    const newTransactions: Transaction[] = data.map(item => ({
      id: Math.random().toString(36).substr(2, 9),
      date: item.date || new Date().toISOString(),
      amount: Number(item.amount) || 0,
      category: item.category || 'Uncategorized',
      description: item.description || 'Imported Transaction',
      type: item.amount < 0 ? 'expense' : 'income',
      vendor: item.amount < 0 ? (item.vendor || 'Unknown') : undefined,
      source: item.amount > 0 ? (item.source || 'Unknown') : undefined,
    }));
    
    setState(prev => ({
      ...prev,
      transactions: [...newTransactions, ...prev.transactions]
    }));
  };

  return (
    <AppContext.Provider value={{
      ...state,
      login,
      logout,
      addTransaction,
      addProject,
      updateProject,
      addProposal,
      addDocument,
      deleteDocument,
      importTransactions
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
