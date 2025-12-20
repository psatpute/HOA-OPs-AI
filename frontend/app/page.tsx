"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, CheckCircle, Shield, Zap, LayoutDashboard } from 'lucide-react';
import ChatbotPlaceholder from '@/components/ChatbotPlaceholder';

export default function LandingPage() {
  const router = useRouter();
  const { login, user } = useApp();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    login(email);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative selection:bg-blue-500/30">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] bg-emerald-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-20 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            HOA OpsAI
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Features</a>
          <a href="#about" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">About</a>
          <Button variant="secondary" size="sm" onClick={() => document.getElementById('login-form')?.scrollIntoView({ behavior: 'smooth' })}>
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-blue-400 mb-6 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-blue-400 mr-2 animate-pulse"></span>
              Now available for early access
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight">
              Manage your HOA with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">Intelligence</span>
            </h1>
            <p className="text-xl text-slate-400 mb-8 leading-relaxed max-w-lg">
              Streamline finances, compare vendor proposals, and manage projects in one centralized, AI-ready dashboard.
            </p>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl max-w-md shadow-2xl shadow-blue-900/20" id="login-form">
              <h3 className="text-lg font-semibold mb-4">Get Started</h3>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="treasurer@hoa.com"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full py-4 text-lg" 
                  isLoading={isLoading}
                >
                  Enter Dashboard <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-xs text-center text-slate-500 mt-4">
                  By continuing, you agree to our Terms of Service.
                </p>
              </form>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-20 transform rotate-3 scale-105" />
            <div className="relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
              {/* Mock Dashboard UI */}
              <div className="p-4 border-b border-slate-800 flex items-center space-x-4 bg-slate-900/50 backdrop-blur-md">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
                <div className="h-6 w-64 bg-slate-800 rounded-md" />
              </div>
              <div className="p-8 grid grid-cols-2 gap-6 bg-slate-950/50">
                <div className="col-span-2 h-32 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl animate-pulse" />
                <div className="h-40 bg-slate-800/50 rounded-xl border border-slate-800" />
                <div className="h-40 bg-slate-800/50 rounded-xl border border-slate-800" />
                <div className="col-span-2 h-48 bg-slate-800/30 rounded-xl border border-slate-800" />
              </div>
              
              {/* Floating Elements */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute top-20 -right-10 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Proposal Approved</p>
                    <p className="text-xs text-slate-400">Roof Repair Project</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-20 -left-10 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <LayoutDashboard className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Budget On Track</p>
                    <p className="text-xs text-slate-400">+12% Savings</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="py-24 bg-slate-900/50 relative z-10" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything you need to run your HOA</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Powerful tools designed specifically for board members to manage communities effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <LayoutDashboard className="w-6 h-6 text-blue-400" />,
                title: "Financial Dashboard",
                desc: "Real-time overview of your community's financial health with intuitive charts."
              },
              {
                icon: <Shield className="w-6 h-6 text-purple-400" />,
                title: "Vendor Management",
                desc: "Compare proposals side-by-side and track vendor performance history."
              },
              {
                icon: <Zap className="w-6 h-6 text-emerald-400" />,
                title: "Project Tracking",
                desc: "Keep capital improvement projects on time and under budget."
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <ChatbotPlaceholder />
    </div>
  );
}

