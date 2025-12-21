"use client";

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { useApp } from '@/lib/store';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Search, Filter, Download, Receipt } from 'lucide-react';

const EXPENSE_CATEGORIES = [
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Utilities', label: 'Utilities' },
  { value: 'Insurance', label: 'Insurance' },
  { value: 'Landscaping', label: 'Landscaping' },
  { value: 'Repairs', label: 'Repairs' },
  { value: 'Administrative', label: 'Administrative' },
  { value: 'Other', label: 'Other' },
];

export default function ExpensesPage() {
  const { transactions, addTransaction, projects } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: 'Maintenance',
    vendor: '',
    description: '',
    projectId: '',
  });

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .filter(t => 
      (categoryFilter === 'All' || t.category === categoryFilter) &&
      (t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
       t.vendor?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTransaction({
      date: formData.date,
      amount: Number(formData.amount),
      category: formData.category,
      description: formData.description,
      type: 'expense',
      vendor: formData.vendor,
      projectId: formData.projectId || undefined,
    });
    setIsModalOpen(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      category: 'Maintenance',
      vendor: '',
      description: '',
      projectId: '',
    });
  };

  const projectOptions = [
    { value: '', label: 'No Project' },
    ...projects.map(p => ({ value: p.id, label: p.name }))
  ];

  return (
    <DashboardLayout title="Expense Tracking">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search expenses..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select 
            options={[{ value: 'All', label: 'All Categories' }, ...EXPENSE_CATEGORIES]}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="flex space-x-2 w-full md:w-auto">
          <Button variant="outline" onClick={() => {}}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
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
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Vendor</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No expenses found matching your criteria.
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {expense.description}
                      {expense.projectId && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          Project Related
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {expense.vendor}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(expense.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log New Expense"
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
            placeholder="e.g., Monthly Lawn Service"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              options={EXPENSE_CATEGORIES}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
            <Input
              label="Vendor"
              required
              placeholder="e.g., Green Thumb Landscaping"
              value={formData.vendor}
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
            />
          </div>

          <Select
            label="Link to Project (Optional)"
            options={projectOptions}
            value={formData.projectId}
            onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
          />

          <div className="pt-4 flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Expense
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
