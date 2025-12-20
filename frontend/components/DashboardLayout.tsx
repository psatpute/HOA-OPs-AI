"use client";

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useApp } from '@/lib/store';
import { useRouter } from 'next/navigation';

import ChatbotPlaceholder from './ChatbotPlaceholder';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { user } = useApp();
  const router = useRouter();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (isMounted && !user) {
      router.push('/');
    }
  }, [isMounted, user, router]);

  if (!isMounted) return null;

  if (!user) return null; // Will redirect in useEffect

  return (
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
  );
}

