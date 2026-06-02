'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { MedicationProvider } from '@/contexts/MedicationContext';
import { PreferencesProvider } from '@/contexts/PreferencesContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Toaster } from 'sonner';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <PreferencesProvider>
      <AuthProvider>
        <MedicationProvider>
          <AppLayout>
            {children}
          </AppLayout>
          <Toaster />
        </MedicationProvider>
      </AuthProvider>
    </PreferencesProvider>
  );
}
