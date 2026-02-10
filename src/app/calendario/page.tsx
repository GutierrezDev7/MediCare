'use client';

import { useMedication } from '@/contexts/MedicationContext';
import { CalendarView } from '@/components/CalendarView';

export default function CalendarPage() {
  const { medications, logs } = useMedication();

  return (
    <CalendarView
      medications={medications}
      logs={logs}
    />
  );
}
