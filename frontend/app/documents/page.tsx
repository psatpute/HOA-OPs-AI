"use client";

import React, { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { useApp } from '@/lib/store';
import { formatDate } from '@/lib/utils';
import { 
  Plus, 
  Search, 
  FileText, 
  Download, 
  Trash2, 
  Upload,
  File,
  FileSpreadsheet,
  FileIcon
} from 'lucide-react';

const DOCUMENT_CATEGORIES = [
  { value: 'Contract', label: 'Contracts' },
  { value: 'Meeting Minutes', label: 'Meeting Minutes' },
  { value: 'Financial Report', label: 'Financial Reports' },
  { value: 'Other', label: 'Other' },
];

export default function DocumentsPage() {
  const { documents, addDocument, deleteDocument } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Contract',
    description: '',
  });

  const filteredDocuments = documents
    .filter(d => 
      (categoryFilter === 'All' || d.category === categoryFilter) &&
      (d.title.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDocument({
      title: formData.title,
      category: formData.category as any,
      date: new Date().toISOString().split('T')[0],
      size: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`, // Mock size
      type: 'pdf', // Mock type
    });
    setIsModalOpen(false);
    setFormData({
      title: '',
      category: 'Contract',
      description: '',
    });
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-8 h-8 text-red-500" />;
      case 'xlsx': return <FileSpreadsheet className="w-8 h-8 text-emerald-500" />;
      default: return <File className="w-8 h-8 text-blue-500" />;
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Document Repository">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search documents..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select 
            options={[{ value: 'All', label: 'All Categories' }, ...DOCUMENT_CATEGORIES]}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-40"
          />
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDocuments.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            No documents found. Upload one to get started.
          </div>
        ) : (
          filteredDocuments.map((doc) => (
            <Card key={doc.id} className="group hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-800">
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    {getFileIcon(doc.type)}
                  </div>
                  <div className="relative">
                    <button 
                      onClick={() => deleteDocument(doc.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1 line-clamp-2" title={doc.title}>
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-500 mb-4">{doc.category}</p>
                
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>{formatDate(doc.date)}</span>
                  <span>{doc.size}</span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload Document"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Document Title"
            required
            placeholder="e.g., Annual Meeting Minutes 2023"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          
          <Select
            label="Category"
            options={DOCUMENT_CATEGORIES}
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />

          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
            <Upload className="w-10 h-10 text-slate-400 mx-auto mb-4" />
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-slate-500 mt-1">
              PDF, DOCX, XLSX (Max 10MB)
            </p>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Upload
            </Button>
          </div>
        </form>
      </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
