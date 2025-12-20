"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useApp } from '@/lib/store';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  FileText, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { projects, proposals, addProposal, updateProject } = useApp();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'comparison'>('overview');

  const projectId = params.id as string;
  const project = projects.find(p => p.id === projectId);
  const projectProposals = proposals.filter(p => p.projectId === projectId);

  // Form State for Proposal
  const [proposalForm, setProposalForm] = useState({
    vendorName: '',
    amount: '',
    timeline: '',
    warranty: '',
    scope: '',
  });

  if (!project) {
    return (
      <DashboardLayout title="Project Not Found">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Project Not Found</h2>
          <Button onClick={() => router.push('/projects')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProposal({
      projectId,
      vendorName: proposalForm.vendorName,
      amount: Number(proposalForm.amount),
      timeline: proposalForm.timeline,
      warranty: proposalForm.warranty,
      scope: proposalForm.scope,
      status: 'Pending',
    });
    setIsUploadModalOpen(false);
    setProposalForm({
      vendorName: '',
      amount: '',
      timeline: '',
      warranty: '',
      scope: '',
    });
  };

  const handleStatusChange = (newStatus: 'Planned' | 'In Progress' | 'Completed') => {
    updateProject(projectId, { status: newStatus });
  };

  return (
    <DashboardLayout title={project.name}>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push('/projects')} className="mb-4 pl-0 hover:bg-transparent hover:text-blue-600">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{project.name}</h1>
            <div className="flex items-center space-x-4 text-sm text-slate-500">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Started {formatDate(project.startDate)}
              </span>
              <span className="flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                Budget: {formatCurrency(project.budget)}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select 
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={project.status}
              onChange={(e) => handleStatusChange(e.target.value as any)}
            >
              <option value="Planned">Planned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <Button onClick={() => setIsUploadModalOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Proposal
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl mb-6 w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'overview' 
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Overview & Proposals
        </button>
        <button
          onClick={() => setActiveTab('comparison')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'comparison' 
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Vendor Comparison
        </button>
      </div>

      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {project.description}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Proposals ({projectProposals.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {projectProposals.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No proposals uploaded yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projectProposals.map((proposal) => (
                      <div key={proposal.id} className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-4">
                            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900 dark:text-white">{proposal.vendorName}</h4>
                            <p className="text-sm text-slate-500">Uploaded recently</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(proposal.amount)}</p>
                          <Badge variant={proposal.status === 'Accepted' ? 'success' : 'default'}>
                            {proposal.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-none">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Budget Status</h3>
                <div className="mb-2 flex justify-between text-sm opacity-90">
                  <span>Spent</span>
                  <span>{formatCurrency(0)} / {formatCurrency(project.budget)}</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-2 mb-6">
                  <div className="bg-white rounded-full h-2 w-[0%]" />
                </div>
                <p className="text-sm opacity-80">
                  No expenses recorded for this project yet.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Comparison View */
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Vendor Comparison Matrix</CardTitle>
            <div className="relative group">
              <Button variant="secondary" className="pl-3 pr-4">
                <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
                AI Analysis
              </Button>
              <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-slate-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                Coming Soon - AI-powered proposal analysis will be available in future release
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50">
                    <th className="p-4 border-b border-r border-slate-200 dark:border-slate-700 min-w-[200px]">Criteria</th>
                    {projectProposals.map(p => (
                      <th key={p.id} className="p-4 border-b border-slate-200 dark:border-slate-700 min-w-[200px] font-bold text-slate-900 dark:text-white">
                        {p.vendorName}
                        {p.status === 'Accepted' && (
                          <Badge variant="success" className="ml-2">Selected</Badge>
                        )}
                      </th>
                    ))}
                    {projectProposals.length === 0 && (
                      <th className="p-4 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-normal italic">
                        Add proposals to compare
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  <tr>
                    <td className="p-4 font-medium bg-slate-50/50 dark:bg-slate-800/30 border-r border-slate-200 dark:border-slate-700">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-slate-400" />
                        Total Cost
                      </div>
                    </td>
                    {projectProposals.map(p => (
                      <td key={p.id} className="p-4 font-bold text-slate-900 dark:text-white">
                        {formatCurrency(p.amount)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-medium bg-slate-50/50 dark:bg-slate-800/30 border-r border-slate-200 dark:border-slate-700">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-slate-400" />
                        Timeline
                      </div>
                    </td>
                    {projectProposals.map(p => (
                      <td key={p.id} className="p-4 text-slate-600 dark:text-slate-300">
                        {p.timeline}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-medium bg-slate-50/50 dark:bg-slate-800/30 border-r border-slate-200 dark:border-slate-700">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-slate-400" />
                        Warranty
                      </div>
                    </td>
                    {projectProposals.map(p => (
                      <td key={p.id} className="p-4 text-slate-600 dark:text-slate-300">
                        {p.warranty}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-medium bg-slate-50/50 dark:bg-slate-800/30 border-r border-slate-200 dark:border-slate-700">
                      <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 text-slate-400" />
                        Scope Summary
                      </div>
                    </td>
                    {projectProposals.map(p => (
                      <td key={p.id} className="p-4 text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                        {p.scope}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-medium bg-slate-50/50 dark:bg-slate-800/30 border-r border-slate-200 dark:border-slate-700">
                      Action
                    </td>
                    {projectProposals.map(p => (
                      <td key={p.id} className="p-4">
                        {p.status !== 'Accepted' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full"
                            onClick={() => {
                              // In a real app, this would update the proposal status
                              alert(`Selected ${p.vendorName}`);
                            }}
                          >
                            Select Vendor
                          </Button>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Vendor Proposal"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <Input
            label="Vendor Name"
            required
            placeholder="e.g., TopTier Roofing"
            value={proposalForm.vendorName}
            onChange={(e) => setProposalForm({ ...proposalForm, vendorName: e.target.value })}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Bid Amount"
              type="number"
              min="0"
              required
              placeholder="0.00"
              value={proposalForm.amount}
              onChange={(e) => setProposalForm({ ...proposalForm, amount: e.target.value })}
            />
            <Input
              label="Timeline"
              required
              placeholder="e.g., 2 weeks"
              value={proposalForm.timeline}
              onChange={(e) => setProposalForm({ ...proposalForm, timeline: e.target.value })}
            />
          </div>

          <Input
            label="Warranty Terms"
            required
            placeholder="e.g., 10 years labor & materials"
            value={proposalForm.warranty}
            onChange={(e) => setProposalForm({ ...proposalForm, warranty: e.target.value })}
          />

          <Textarea
            label="Scope Summary"
            required
            placeholder="Briefly summarize what is included..."
            value={proposalForm.scope}
            onChange={(e) => setProposalForm({ ...proposalForm, scope: e.target.value })}
          />

          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Click to upload PDF proposal</p>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Upload Proposal
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
