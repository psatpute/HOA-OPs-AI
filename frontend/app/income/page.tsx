"use client";

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { useApp } from '@/lib/store';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Search, Download, Upload, Wallet } from 'lucide-react';

const INCOME_SOURCES = [
  { value: 'Dues', label: 'HOA Dues' },
  { value: 'Assessment', label: 'Special Assessment' },
  { value: 'Fine', label: 'Fines/Violations' },
  { value: 'Interest', label: 'Bank Interest' },
  { value: 'Other', label: 'Other' },
];

export default function IncomePage() {
  const { transactions, addTransaction, importTransactions } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    source: 'Dues',
    description: '',
  });

  const income = transactions
    .filter(t => t.type === 'income')
    .filter(t => 
      (sourceFilter === 'All' || t.category === sourceFilter) &&
      (t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
       t.source?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTransaction({
      date: formData.date,
      amount: Number(formData.amount),
      category: formData.source, // Using category field for source type
      description: formData.description,
      type: 'income',
      source: 'Manual Entry',
    });
    setIsAddModalOpen(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      source: 'Dues',
      description: '',
    });
  };

  const handleImport = () => {
    // Mock Import Logic
    const mockData = [
      { date: '2023-10-20', amount: 15000, category: 'Dues', description: 'Bulk Dues Import Oct', source: 'Excel Import' },
      { date: '2023-10-21', amount: 500, category: 'Fine', description: 'Late Fees', source: 'Excel Import' },
    ];
    importTransactions(mockData);
    setIsImportModalOpen(false);
  };

  return (
    <DashboardLayout title="Income & Balances">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search income..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select 
            options={[{ value: 'All', label: 'All Sources' }, ...INCOME_SOURCES]}
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="flex space-x-2 w-full md:w-auto">
          <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Record Income
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-none shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Source Type</th>
                <th className="px-6 py-4 font-medium">Origin</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {income.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No income records found.
                  </td>
                </tr>
              ) : (
                income.map((item) => (
                  <tr key={item.id} className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {formatDate(item.date)}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {item.description}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {item.source || 'Manual Entry'}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Income Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record Income"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
            <Input
              label="Amount"
              type="number"
              min="0.01"
              step="0.01"
              required
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>
          
          <Input
            label="Description"
            required
            placeholder="e.g., October HOA Dues"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <Select
            label="Source Type"
            options={INCOME_SOURCES}
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
          />

          <div className="pt-4 flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Financial Data"
      >
        <div className="space-y-6">
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
            <Upload className="w-10 h-10 text-slate-400 mx-auto mb-4" />
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Excel (.xlsx) or CSV files only
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Import Instructions</h4>
            <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
              <li>Ensure your file has columns: Date, Amount, Description, Category</li>
              <li>Positive amounts are income, negative are expenses</li>
              <li>Maximum file size: 10MB</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => setIsImportModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport}>
              Process Import
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
