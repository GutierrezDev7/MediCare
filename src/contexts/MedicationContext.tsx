'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Medication, MedicationLog } from '@/types/medication';
import { mockMedications, mockLogs } from '@/data/mockData';
import { toast } from 'sonner';
import { addHours, addDays, isAfter, isBefore, startOfHour } from 'date-fns';

interface MedicationContextType {
  medications: Medication[];
  logs: MedicationLog[];
  addMedication: (newMed: Omit<Medication, 'id'>) => void;
  updateMedication: (updatedMed: Medication) => void;
  deleteMedication: (id: string) => void;
  toggleMedicationActive: (id: string) => void;
  markDoseAsTaken: (logId: string) => void;
}

const MedicationContext = createContext<MedicationContextType | undefined>(undefined);

// Helper to parse frequency string to hours
const getHoursFromFrequency = (freq: string): number => {
  const match = freq.match(/(\d+)h/);
  return match ? parseInt(match[1]) : 24;
};

// Helper to generate future logs
const generateFutureLogs = (medication: Medication, existingLogs: MedicationLog[] = []): MedicationLog[] => {
  const hours = getHoursFromFrequency(medication.frequency);
  const logs: MedicationLog[] = [];
  const now = new Date();
  const horizon = addDays(now, 30); // Generate for next 30 days
  
  // Find the last scheduled log time or use start date
  // Filter logs for this medication that are not missed/skipped/taken (pending)
  // Actually, we want to start generating from the last valid log or start date
  
  let nextTime = new Date(medication.startDate);
  
  // If start date is in the past, align it to near future or keep it?
  // If I add a med that started 10 days ago, I probably want to see missed doses? 
  // Or just future ones? 
  // Let's assume we want to backfill a bit if it's recent, but mostly future.
  // For simplicity and user experience, if startDate is very old, we might only want future logs.
  // But if the user just created it, startDate is "now".
  
  // Strategy:
  // 1. Start from medication.startDate.
  // 2. Loop adding 'hours' until we reach 'horizon'.
  // 3. Only keep logs that are NOT already in existingLogs (deduplication based on time roughly? or just overwrite future pending?)
  
  // Better Strategy for Update:
  // 1. Remove all FUTURE 'pending' logs for this medication.
  // 2. Generate new logs starting from NOW (aligned to the original schedule if possible, or just fresh from now).
  
  // Let's stick to a simple generation for new meds first:
  while (isBefore(nextTime, horizon)) {
    // Only add if it's not way in the past (e.g., more than 24h ago) to avoid flooding missed notifications for a new med?
    // Or maybe we accept it.
    
    // Check if a log already exists around this time (within 5 mins tolerance)
    const exists = existingLogs.some(log => 
      log.medicationId === medication.id && 
      Math.abs(log.scheduledTime.getTime() - nextTime.getTime()) < 5 * 60 * 1000
    );

    if (!exists) {
      logs.push({
        id: `${medication.id}-${nextTime.getTime()}`,
        medicationId: medication.id,
        scheduledTime: new Date(nextTime),
        status: 'pending'
      });
    }
    
    nextTime = addHours(nextTime, hours);
  }
  
  return logs;
};

export function MedicationProvider({ children }: { children: React.ReactNode }) {
  const [medications, setMedications] = useState<Medication[]>(mockMedications);
  const [logs, setLogs] = useState<MedicationLog[]>(mockLogs);

  // Load from localStorage on mount (optional persistence)
  useEffect(() => {
    const storedMeds = localStorage.getItem('medications');
    const storedLogs = localStorage.getItem('logs');
    
    if (storedMeds) {
      try {
        const parsedMeds = JSON.parse(storedMeds).map((med: any) => ({
          ...med,
          startDate: new Date(med.startDate)
        }));
        setMedications(parsedMeds);
      } catch (e) {
        console.error('Failed to parse medications from localStorage', e);
      }
    }
    
    if (storedLogs) {
      try {
        const parsedLogs = JSON.parse(storedLogs).map((log: any) => ({
          ...log,
          scheduledTime: new Date(log.scheduledTime),
          takenTime: log.takenTime ? new Date(log.takenTime) : undefined
        }));
        setLogs(parsedLogs);
      } catch (e) {
        console.error('Failed to parse logs from localStorage', e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('medications', JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem('logs', JSON.stringify(logs));
  }, [logs]);

  const addMedication = (newMed: Omit<Medication, 'id'>) => {
    const medication: Medication = {
      ...newMed,
      id: Date.now().toString(),
    };
    
    setMedications((prev) => [...prev, medication]);
    
    // Generate logs for the new medication
    const newLogs = generateFutureLogs(medication, []);
    setLogs((prev) => [...prev, ...newLogs]);
    
    toast.success('Medicamento adicionado com sucesso!');
  };

  const updateMedication = (updatedMed: Medication) => {
    setMedications((prev) =>
      prev.map((med) => (med.id === updatedMed.id ? updatedMed : med))
    );
    
    // Regenerate future logs if critical fields changed
    // We remove future pending logs and recreate them
    const now = new Date();
    setLogs((prev) => {
      // Keep past logs or logs that are already taken/missed/skipped
      const keepLogs = prev.filter(log => 
        log.medicationId !== updatedMed.id || 
        isBefore(log.scheduledTime, now) || 
        log.status !== 'pending'
      );
      
      const newFutureLogs = generateFutureLogs(updatedMed, keepLogs);
      
      // Merge and sort
      return [...keepLogs, ...newFutureLogs].sort((a, b) => b.scheduledTime.getTime() - a.scheduledTime.getTime());
    });

    toast.success('Medicamento atualizado com sucesso!');
  };

  const deleteMedication = (id: string) => {
    setMedications((prev) => prev.filter((med) => med.id !== id));
    // Remove all logs associated with this medication
    setLogs((prev) => prev.filter((log) => log.medicationId !== id));
    toast.success('Medicamento excluído com sucesso!');
  };

  const toggleMedicationActive = (id: string) => {
    let isActive = false;
    setMedications((prev) =>
      prev.map((med) => {
        if (med.id === id) {
          isActive = !med.active;
          return { ...med, active: !med.active };
        }
        return med;
      })
    );
    toast.success(isActive ? 'Medicamento ativado' : 'Medicamento pausado');
  };

  const markDoseAsTaken = (logId: string) => {
    setLogs((prev) =>
      prev.map((log) =>
        log.id === logId
          ? { ...log, status: 'taken', takenTime: new Date() }
          : log
      )
    );
    toast.success('Dose marcada como tomada!', {
      description: 'Parabéns por manter sua aderência ao tratamento.',
    });
  };

  return (
    <MedicationContext.Provider
      value={{
        medications,
        logs,
        addMedication,
        updateMedication,
        deleteMedication,
        toggleMedicationActive,
        markDoseAsTaken,
      }}
    >
      {children}
    </MedicationContext.Provider>
  );
}

export function useMedication() {
  const context = useContext(MedicationContext);
  if (context === undefined) {
    throw new Error('useMedication must be used within a MedicationProvider');
  }
  return context;
}
