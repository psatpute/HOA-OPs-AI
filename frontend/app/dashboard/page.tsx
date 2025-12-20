"use client";

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet, Activity } from 'lucide-react';

export default function Dashboard() {
  const { transactions, projects } = useApp();

  // Calculate Financials
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const balance = totalIncome - totalExpenses;

  // Prepare Chart Data
  const monthlyData = [
    { name: 'Jan', income: 12000, expense: 8000 },
    { name: 'Feb', income: 15000, expense: 10000 },
    { name: 'Mar', income: 11000, expense: 12000 },
    { name: 'Apr', income: 14000, expense: 9000 },
    { name: 'May', income: 16000, expense: 11000 },
    { name: 'Jun', income: 13000, expense: 7000 },
  ];

  const expenseCategories = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(expenseCategories).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <DashboardLayout title="Financial Overview">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card gradient className="border-none shadow-lg shadow-blue-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-medium px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +12.5%
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Balance</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
              {formatCurrency(balance)}
            </h3>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg shadow-emerald-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs font-medium px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +8.2%
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Income</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
              {formatCurrency(totalIncome)}
            </h3>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg shadow-red-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <Activity className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-xs font-medium px-2.5 py-1 bg-red-100 text-red-700 rounded-full flex items-center">
                <ArrowDownRight className="w-3 h-3 mr-1" />
                -2.4%
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Expenses</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
              {formatCurrency(totalExpenses)}
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(value) => `$${value/1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f1f5f9' }}
                  />
                  <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  {entry.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg mr-4 ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {t.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{t.description}</p>
                    <p className="text-sm text-slate-500">{t.category} • {new Date(t.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
