"use client";

import { useMedication } from '@/contexts/MedicationContext';
import { Dashboard } from '@/components/Dashboard';

export default function AdminPage() {
  const { medications, logs, markDoseAsTaken } = useMedication();

  return (
    <Dashboard
      medications={medications}
      logs={logs}
      onMarkAsTaken={markDoseAsTaken}
    />
  );
}
