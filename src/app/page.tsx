'use client';

import { useMedication } from '@/contexts/MedicationContext';
import { Dashboard } from '@/components/Dashboard';

export default function DashboardPage() {
  const { medications, logs, markDoseAsTaken, markDoseAsSkipped } = useMedication();

  return (
    <Dashboard
      medications={medications}
      logs={logs}
      onMarkAsTaken={markDoseAsTaken}
      onMarkAsSkipped={markDoseAsSkipped}
    />
  );
}
