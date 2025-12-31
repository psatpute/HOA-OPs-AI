"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected Route Component
 * Redirects to auth page if user is not authenticated
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading } = useApp();

  useEffect(() => {
    // Only redirect if we're done loading and there's no user
    if (!isLoading && !user) {
      router.push('/auth');
    }
  }, [user, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!user) {
    return null;
  }

  return <>{children}</>;
}