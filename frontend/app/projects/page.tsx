"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useApp } from '@/lib/store';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Search, Calendar, DollarSign, ArrowRight } from 'lucide-react';

const PROJECT_STATUSES = [
  { value: 'Planned', label: 'Planned' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
];

export default function ProjectsPage() {
  const { projects, addProject } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Planned',
    budget: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  const filteredProjects = projects
    .filter(p => 
      (statusFilter === 'All' || p.status === statusFilter) &&
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       p.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProject({
      name: formData.name,
      description: formData.description,
      status: formData.status as any,
      budget: Number(formData.budget),
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
    });
    setIsModalOpen(false);
    setFormData({
      name: '',
      description: '',
      status: 'Planned',
      budget: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'info';
      default: return 'default';
    }
  };

  return (
    <DashboardLayout title="Projects">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search projects..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select 
            options={[{ value: 'All', label: 'All Statuses' }, ...PROJECT_STATUSES]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-40"
          />
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            No projects found. Create one to get started!
          </div>
        ) : (
          filteredProjects.map((project) => (
            <Link href={`/projects/${project.id}`} key={project.id}>
              <Card className="h-full hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 group cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={getStatusVariant(project.status)}>
                      {project.status}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {formatDate(project.startDate)}
                    </span>
                  </div>
                  <CardTitle className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {project.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 h-10">
                    {project.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center text-slate-600 dark:text-slate-300">
                      <DollarSign className="w-4 h-4 mr-1 text-emerald-500" />
                      <span className="font-semibold">{formatCurrency(project.budget)}</span>
                    </div>
                    <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                      View Details
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Project"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Project Name"
            required
            placeholder="e.g., Clubhouse Roof Repair"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          
          <Textarea
            label="Description"
            required
            placeholder="Describe the scope of the project..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Budget Estimate"
              type="number"
              min="0"
              required
              placeholder="0.00"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            />
            <Select
              label="Status"
              options={PROJECT_STATUSES}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            <Input
              label="Target End Date (Optional)"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
