"use client";

import React from 'react';
import { useApp } from '@/lib/store';
import { Bell, Search } from 'lucide-react';

export default function Header({ title }: { title: string }) {
  const { user } = useApp();

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-6 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white ml-10 lg:ml-0">
        {title}
      </h1>

      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none focus:outline-none text-sm text-slate-600 dark:text-slate-300 w-48"
          />
        </div>

        <button className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>

        <div className="flex items-center space-x-3 pl-4 border-l border-slate-200 dark:border-slate-700">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name || 'Guest'}</p>
            <p className="text-xs text-slate-500">{user?.role || 'Viewer'}</p>
          </div>
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium shadow-md">
            {user?.name?.charAt(0) || 'G'}
          </div>
        </div>
      </div>
    </header>
  );
}
