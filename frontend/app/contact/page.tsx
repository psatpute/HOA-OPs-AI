"use client";

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, User, Shield, AlertCircle } from 'lucide-react';

export default function ContactPage() {
  const boardMembers = [
    {
      role: "President",
      name: "Sarah Jenkins",
      email: "president@hoa.com",
      phone: "(555) 123-4567",
      image: "SJ"
    },
    {
      role: "Treasurer",
      name: "Teresa Treasurer",
      email: "treasurer@hoa.com",
      phone: "(555) 234-5678",
      image: "TT"
    },
    {
      role: "Secretary",
      name: "Michael Chang",
      email: "secretary@hoa.com",
      phone: "(555) 345-6789",
      image: "MC"
    },
    {
      role: "Member at Large",
      name: "David Wilson",
      email: "david.w@hoa.com",
      phone: "(555) 456-7890",
      image: "DW"
    }
  ];

  const managementContacts = [
    {
      title: "Property Manager",
      company: "Elite Community Management",
      name: "Jessica Reynolds",
      email: "jessica@elitecm.com",
      phone: "(555) 987-6543",
      address: "123 Management Way, Suite 200, Cityville, ST 12345"
    },
    {
      title: "Maintenance Supervisor",
      company: "Elite Community Management",
      name: "Robert Ford",
      email: "maintenance@elitecm.com",
      phone: "(555) 876-5432",
      address: null
    }
  ];

  return (
    <DashboardLayout title="Community Contacts">
      <div className="space-y-8">
        {/* Emergency Section */}
        <Card className="border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
          <CardContent className="p-6 flex items-start space-x-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-1">Emergency Contacts</h3>
              <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-4">
                For life-threatening emergencies, always dial 911 first. For urgent property issues (water leaks, gate failure), contact the 24/7 line.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="danger" size="sm" className="rounded-full">
                  <Phone className="w-4 h-4 mr-2" />
                  24/7 Maintenance: (555) 999-0000
                </Button>
                <Button variant="secondary" size="sm" className="rounded-full bg-white dark:bg-slate-800 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <Shield className="w-4 h-4 mr-2" />
                  Security Patrol: (555) 888-1111
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Board Members Grid */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-500" />
            Board of Directors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {boardMembers.map((member, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xl mb-4 shadow-inner">
                    {member.image}
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{member.name}</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-4">{member.role}</p>
                  
                  <div className="w-full space-y-2">
                    <a href={`mailto:${member.email}`} className="flex items-center justify-center w-full p-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                      <Mail className="w-4 h-4 mr-2 text-slate-400" />
                      {member.email}
                    </a>
                    <a href={`tel:${member.phone}`} className="flex items-center justify-center w-full p-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                      <Phone className="w-4 h-4 mr-2 text-slate-400" />
                      {member.phone}
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Management Section */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-purple-500" />
            Property Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {managementContacts.map((contact, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-lg">{contact.company}</h3>
                      <p className="text-sm text-slate-500">{contact.title}</p>
                    </div>
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-slate-700 dark:text-slate-300">
                      <User className="w-4 h-4 mr-3 text-slate-400" />
                      <span className="font-medium">{contact.name}</span>
                    </div>
                    <a href={`mailto:${contact.email}`} className="flex items-center text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <Mail className="w-4 h-4 mr-3 text-slate-400" />
                      {contact.email}
                    </a>
                    <a href={`tel:${contact.phone}`} className="flex items-center text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <Phone className="w-4 h-4 mr-3 text-slate-400" />
                      {contact.phone}
                    </a>
                    {contact.address && (
                      <div className="flex items-start text-slate-600 dark:text-slate-400">
                        <MapPin className="w-4 h-4 mr-3 text-slate-400 mt-1 shrink-0" />
                        <span>{contact.address}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
