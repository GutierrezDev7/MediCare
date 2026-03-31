'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Medication, MedicationLog } from '@/types/medication';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface MedicationContextType {
  medications: Medication[];
  logs: MedicationLog[];
  loading: boolean;
  addMedication: (newMed: Omit<Medication, 'id'>) => Promise<void>;
  updateMedication: (updatedMed: Medication) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  toggleMedicationActive: (id: string) => Promise<void>;
  markDoseAsTaken: (logId: string) => Promise<void>;
  markDoseAsSkipped: (logId: string) => Promise<void>;
  refreshMedications: () => Promise<void>;
  refreshLogs: () => Promise<void>;
}

const MedicationContext = createContext<MedicationContextType | undefined>(undefined);

interface ApiMedication {
  id: number;
  nome: string;
  dosagem: string;
  frequencia: string;
  ativo: boolean;
  cor?: string | null;
  estoque?: number | null;
  instrucoes?: string | null;
  dataInicio: string;
  dataFim?: string | null;
  lembretes?: ApiLembrete[];
}

interface ApiLembrete {
  id: number;
  medicamentoId: number;
  horario: string;
  status: string;
  mensagem?: string | null;
  medicamento?: { id: number; nome: string; dosagem: string; cor?: string | null };
}

function mapApiMedication(m: ApiMedication): Medication {
  return {
    id: m.id.toString(),
    name: m.nome,
    dosage: m.dosagem,
    frequency: m.frequencia,
    active: m.ativo,
    color: m.cor || undefined,
    stock: m.estoque ?? undefined,
    instructions: m.instrucoes || undefined,
    startDate: new Date(m.dataInicio),
    endDate: m.dataFim ? new Date(m.dataFim) : undefined,
  };
}

function mapApiLog(l: ApiLembrete): MedicationLog {
  const statusMap: Record<string, MedicationLog['status']> = {
    PENDENTE: 'pending',
    ENVIADO: 'pending',
    CONFIRMADO: 'taken',
    IGNORADO: 'skipped',
  };

  return {
    id: l.id.toString(),
    medicationId: (l.medicamentoId || l.medicamento?.id || 0).toString(),
    scheduledTime: new Date(l.horario),
    status: statusMap[l.status] || 'pending',
  };
}

export function MedicationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshMedications = useCallback(async () => {
    if (!user) return;
    const res = await api.medications.list();
    if (res.data) {
      setMedications(
        (res.data.medications as ApiMedication[]).map(mapApiMedication)
      );
    }
  }, [user]);

  const refreshLogs = useCallback(async () => {
    if (!user) return;
    const res = await api.logs.list({ limit: '500' });
    if (res.data) {
      setLogs((res.data.logs as ApiLembrete[]).map(mapApiLog));
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([refreshMedications(), refreshLogs()]).finally(() =>
        setLoading(false)
      );
    } else {
      setMedications([]);
      setLogs([]);
      setLoading(false);
    }
  }, [user, refreshMedications, refreshLogs]);

  const addMedication = async (newMed: Omit<Medication, 'id'>) => {
    const res = await api.medications.create({
      nome: newMed.name,
      dosagem: newMed.dosage,
      frequencia: newMed.frequency,
      dataInicio: newMed.startDate instanceof Date
        ? newMed.startDate.toISOString()
        : newMed.startDate,
      dataFim: newMed.endDate
        ? newMed.endDate instanceof Date
          ? newMed.endDate.toISOString()
          : newMed.endDate
        : null,
      estoque: newMed.stock ?? null,
      cor: newMed.color ?? null,
      instrucoes: newMed.instructions ?? null,
      ativo: newMed.active,
    });

    if (res.error) {
      toast.error(res.error);
      return;
    }

    toast.success('Medicamento adicionado com sucesso!');
    await Promise.all([refreshMedications(), refreshLogs()]);
  };

  const updateMedication = async (updatedMed: Medication) => {
    const res = await api.medications.update(parseInt(updatedMed.id), {
      nome: updatedMed.name,
      dosagem: updatedMed.dosage,
      frequencia: updatedMed.frequency,
      dataInicio: updatedMed.startDate instanceof Date
        ? updatedMed.startDate.toISOString()
        : updatedMed.startDate,
      dataFim: updatedMed.endDate
        ? updatedMed.endDate instanceof Date
          ? updatedMed.endDate.toISOString()
          : updatedMed.endDate
        : null,
      estoque: updatedMed.stock ?? null,
      cor: updatedMed.color ?? null,
      instrucoes: updatedMed.instructions ?? null,
      ativo: updatedMed.active,
    });

    if (res.error) {
      toast.error(res.error);
      return;
    }

    toast.success('Medicamento atualizado com sucesso!');
    await Promise.all([refreshMedications(), refreshLogs()]);
  };

  const deleteMedication = async (id: string) => {
    const res = await api.medications.delete(parseInt(id));

    if (res.error) {
      toast.error(res.error);
      return;
    }

    toast.success('Medicamento excluído com sucesso!');
    await Promise.all([refreshMedications(), refreshLogs()]);
  };

  const toggleMedicationActive = async (id: string) => {
    const res = await api.medications.toggle(parseInt(id));

    if (res.error) {
      toast.error(res.error);
      return;
    }

    const msg = res.data as Record<string, unknown> | undefined;
    toast.success((msg?.message as string) || 'Status alterado');
    await refreshMedications();
  };

  const markDoseAsTaken = async (logId: string) => {
    const res = await api.logs.take(parseInt(logId));

    if (res.error) {
      toast.error(res.error);
      return;
    }

    toast.success('Dose marcada como tomada!', {
      description: 'Parabéns por manter sua aderência ao tratamento.',
    });
    await Promise.all([refreshMedications(), refreshLogs()]);
  };

  const markDoseAsSkipped = async (logId: string) => {
    const res = await api.logs.skip(parseInt(logId));

    if (res.error) {
      toast.error(res.error);
      return;
    }

    toast.success('Dose pulada');
    await refreshLogs();
  };

  return (
    <MedicationContext.Provider
      value={{
        medications,
        logs,
        loading,
        addMedication,
        updateMedication,
        deleteMedication,
        toggleMedicationActive,
        markDoseAsTaken,
        markDoseAsSkipped,
        refreshMedications,
        refreshLogs,
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
