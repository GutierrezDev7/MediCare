export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  active: boolean;
  color?: string;
  stock?: number;
  instructions?: string;
  startDate: Date;
  endDate?: Date;
  notes?: string;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  scheduledTime: Date;
  status: 'taken' | 'skipped' | 'missed' | 'pending';
  takenTime?: Date;
  notes?: string;
}

export type View = 'dashboard' | 'medications' | 'calendar' | 'history' | 'reports' | 'settings';
