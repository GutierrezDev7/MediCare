'use client';

import { useMedication } from '@/contexts/MedicationContext';
import { HistoryView } from '@/components/HistoryView';

export default function HistoryPage() {
  const { medications, logs } = useMedication();

  return (
    <HistoryView
      medications={medications}
      logs={logs}
    />
  );
}
