"use client";

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Search, Download, Loader2 } from 'lucide-react';
import * as api from '@/lib/api';

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
  const [expenses, setExpenses] = useState<api.ExpenseResponse[]>([]);
  const [projects, setProjects] = useState<api.ProjectResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  // Fetch expenses and projects on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [expensesResponse, projectsResponse] = await Promise.all([
        api.getExpenses(),
        api.getProjects()
      ]);
      setExpenses(expensesResponse.expenses);
      setProjects(projectsResponse.projects);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(err instanceof api.ApiError ? err.message : 'Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredExpenses = expenses
    .filter(e => 
      (categoryFilter === 'All' || e.category === categoryFilter) &&
      (e.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
       e.vendor?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createExpense({
        date: formData.date,
        amount: Number(formData.amount),
        category: formData.category,
        description: formData.description,
        vendor: formData.vendor,
        projectId: formData.projectId || undefined,
      });
      
      // Refresh expenses list
      await fetchData();
      
      setIsModalOpen(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: 'Maintenance',
        vendor: '',
        description: '',
        projectId: '',
      });
    } catch (err) {
      console.error('Failed to create expense:', err);
      alert(err instanceof api.ApiError ? err.message : 'Failed to create expense');
    }
  };

  const projectOptions = [
    { value: '', label: 'No Project' },
    ...projects.map(p => ({ value: p.id, label: p.name }))
  ];

  if (isLoading) {
    return (
      <DashboardLayout title="Expense Tracking">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Expense Tracking">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchData}>Retry</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <ProtectedRoute>
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
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No expenses found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
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
    </ProtectedRoute>
  );
}
