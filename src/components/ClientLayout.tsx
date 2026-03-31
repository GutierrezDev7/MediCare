'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { MedicationProvider } from '@/contexts/MedicationContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Toaster } from 'sonner';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <AuthProvider>
      <MedicationProvider>
        <AppLayout>
          {children}
        </AppLayout>
        <Toaster />
      </MedicationProvider>
    </AuthProvider>
  );
}
