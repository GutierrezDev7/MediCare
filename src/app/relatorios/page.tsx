'use client';

import { useMedication } from '@/contexts/MedicationContext';
import { ReportsView } from '@/components/ReportsView';

export default function ReportsPage() {
  const { medications, logs } = useMedication();

  return (
    <ReportsView
      medications={medications}
      logs={logs}
    />
  );
}
