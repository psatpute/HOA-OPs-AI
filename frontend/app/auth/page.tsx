"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { validatePassword, getPasswordStrength } from '@/lib/api';

type AuthMode = 'login' | 'signup';

export default function AuthPage() {
  const router = useRouter();
  const { login, signup, user, isLoading, error, clearError } = useApp();
  const [mode, setMode] = useState<AuthMode>('login');
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Validation state
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Clear errors when switching modes
  useEffect(() => {
    clearError();
    setFormError(null);
    setPasswordErrors([]);
  }, [mode, clearError]);

  // Validate password in real-time for signup
  useEffect(() => {
    if (mode === 'signup' && password) {
      const validation = validatePassword(password);
      setPasswordErrors(validation.errors);
      setPasswordStrength(getPasswordStrength(password));
    } else {
      setPasswordErrors([]);
      setPasswordStrength(0);
    }
  }, [password, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (mode === 'signup') {
      // Validate signup form
      if (!firstName.trim() || !lastName.trim()) {
        setFormError('Please enter your first and last name');
        return;
      }

      if (passwordErrors.length > 0) {
        setFormError('Please fix password requirements');
        return;
      }

      if (password !== confirmPassword) {
        setFormError('Passwords do not match');
        return;
      }

      try {
        await signup({
          email,
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });
        router.push('/dashboard');
      } catch (err) {
        // Error is handled by the store
      }
    } else {
      // Login
      try {
        await login(email, password);
        router.push('/dashboard');
      } catch (err) {
        // Error is handled by the store
      }
    }
  };

  const getStrengthColor = (strength: number) => {
    if (strength === 0) return 'bg-slate-700';
    if (strength <= 2) return 'bg-red-500';
    if (strength === 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength: number) => {
    if (strength === 0) return '';
    if (strength <= 2) return 'Weak';
    if (strength === 3) return 'Good';
    return 'Strong';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative flex items-center justify-center">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              HOA OpsAI
            </span>
          </div>

          {/* Auth Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-blue-900/20">
            {/* Mode Toggle */}
            <div className="flex gap-2 mb-6 p-1 bg-slate-900/50 rounded-lg">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  mode === 'login'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  mode === 'signup'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold mb-6">
                  {mode === 'login' ? 'Welcome back' : 'Create your account'}
                </h2>

                {/* Error Display */}
                {(error || formError) && (
                  <Alert className="mb-4 bg-red-500/10 border-red-500/50 text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error || formError}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'signup' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName" className="text-slate-300">First Name</Label>
                          <Input
                            id="firstName"
                            type="text"
                            required
                            placeholder="John"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="mt-1.5 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName" className="text-slate-300">Last Name</Label>
                          <Input
                            id="lastName"
                            type="text"
                            required
                            placeholder="Doe"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="mt-1.5 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="treasurer@hoa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1.5 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-slate-300">Password</Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator for Signup */}
                    {mode === 'signup' && password && (
                      <div className="mt-2 space-y-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full transition-colors ${
                                level <= passwordStrength ? getStrengthColor(passwordStrength) : 'bg-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                        {passwordStrength > 0 && (
                          <p className="text-xs text-slate-400">
                            Password strength: <span className={passwordStrength >= 3 ? 'text-green-400' : 'text-yellow-400'}>
                              {getStrengthText(passwordStrength)}
                            </span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {mode === 'signup' && (
                    <>
                      <div>
                        <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password</Label>
                        <div className="relative mt-1.5">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Password Requirements */}
                      {password && passwordErrors.length > 0 && (
                        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 space-y-1">
                          <p className="text-xs font-medium text-slate-400 mb-2">Password must contain:</p>
                          {[
                            'At least 8 characters',
                            'One uppercase letter',
                            'One lowercase letter',
                            'One number',
                            'One special character'
                          ].map((req, idx) => {
                            const hasError = passwordErrors.some(err => err.toLowerCase().includes(req.toLowerCase().split(' ').slice(-2).join(' ')));
                            return (
                              <div key={idx} className="flex items-center gap-2 text-xs">
                                {hasError ? (
                                  <XCircle className="w-3 h-3 text-red-400" />
                                ) : (
                                  <CheckCircle className="w-3 h-3 text-green-400" />
                                )}
                                <span className={hasError ? 'text-red-400' : 'text-green-400'}>
                                  {req}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}

                  <Button
                    type="submit"
                    className="w-full py-3 text-base mt-6"
                    disabled={isLoading || (mode === 'signup' && passwordErrors.length > 0)}
                  >
                    {isLoading ? (
                      'Please wait...'
                    ) : (
                      <>
                        {mode === 'login' ? 'Sign In' : 'Create Account'}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                {mode === 'login' && (
                  <p className="text-xs text-center text-slate-500 mt-4">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Sign up
                    </button>
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <p className="text-xs text-center text-slate-500 mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}