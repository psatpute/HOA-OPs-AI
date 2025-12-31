"use client";

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ProtectedRoute from './ProtectedRoute';
import ChatbotPlaceholder from './ChatbotPlaceholder';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="lg:ml-64 min-h-screen flex flex-col">
        <Header title={title} />
        <main className="flex-1 p-6 overflow-x-hidden">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
      <ChatbotPlaceholder />
    </div>
    </ProtectedRoute>
  );
}

