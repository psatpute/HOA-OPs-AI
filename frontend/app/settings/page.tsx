"use client";

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/lib/store';
import { User, Bell, Lock, Palette, Globe } from 'lucide-react';

export default function Settings() {
  const { user } = useApp();
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <ProtectedRoute>
      <DashboardLayout title="Settings">
        <div className="max-w-4xl space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                <CardTitle>Profile Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    defaultValue={user?.name || ''} 
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email"
                    defaultValue={user?.email || ''} 
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  type="tel"
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Lock className="w-5 h-5 mr-2 text-blue-600" />
                <CardTitle>Security</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input 
                  id="current-password" 
                  type="password"
                  placeholder="Enter current password"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input 
                    id="new-password" 
                    type="password"
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input 
                    id="confirm-password" 
                    type="password"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Update Password</Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Bell className="w-5 h-5 mr-2 text-blue-600" />
                <CardTitle>Notifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-slate-500">Receive email updates about your account</p>
                </div>
                <Switch 
                  id="email-notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="transaction-alerts">Transaction Alerts</Label>
                  <p className="text-sm text-slate-500">Get notified about new transactions</p>
                </div>
                <Switch id="transaction-alerts" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="project-updates">Project Updates</Label>
                  <p className="text-sm text-slate-500">Receive updates on project status changes</p>
                </div>
                <Switch id="project-updates" defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Palette className="w-5 h-5 mr-2 text-blue-600" />
                <CardTitle>Appearance</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-slate-500">Toggle dark mode theme</p>
                </div>
                <Switch 
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
            </CardContent>
          </Card>

          {/* Regional Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Globe className="w-5 h-5 mr-2 text-blue-600" />
                <CardTitle>Regional Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input 
                    id="timezone" 
                    defaultValue="America/Los_Angeles"
                    placeholder="Select timezone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input 
                    id="currency" 
                    defaultValue="USD"
                    placeholder="Select currency"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}