import { useState } from 'react';
import { Calendar, Clock, CheckCircle2, XCircle, MinusCircle, Pill } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Medication, MedicationLog } from '@/types/medication';
import { format, isToday, isYesterday, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface HistoryViewProps {
  medications: Medication[];
  logs: MedicationLog[];
}

const statusConfig = {
  taken: {
    label: 'Tomada',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    variant: 'default' as const,
  },
  missed: {
    label: 'Perdida',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    variant: 'destructive' as const,
  },
  skipped: {
    label: 'Ignorada',
    icon: MinusCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    variant: 'secondary' as const,
  },
  pending: {
    label: 'Pendente',
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    variant: 'outline' as const,
  },
};

export function HistoryView({ medications, logs }: HistoryViewProps) {
  const [selectedMedication, setSelectedMedication] = useState<string | null>(null);

  // Agrupa logs por data
  const groupedLogs = logs.reduce((acc, log) => {
    const dateKey = startOfDay(log.scheduledTime).toISOString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(log);
    return acc;
  }, {} as Record<string, MedicationLog[]>);

  // Filtra por medicamento se selecionado e remove logs anteriores à data de início
  const filteredGroupedLogs = Object.entries(groupedLogs).reduce((acc, [date, dateLogs]) => {
    // Basic filter by medication ID
    let filtered = selectedMedication
      ? dateLogs.filter(log => log.medicationId === selectedMedication)
      : dateLogs;
      
    // Filter out logs that are before the medication start date
    filtered = filtered.filter(log => {
      const med = medications.find(m => m.id === log.medicationId);
      if (!med) return false;
      // Use a tolerance of 1 minute to avoid issues with exact matches or slight drifts
      return log.scheduledTime.getTime() >= med.startDate.getTime() - 60000;
    });

    if (filtered.length > 0) {
      acc[date] = filtered;
    }
    return acc;
  }, {} as Record<string, MedicationLog[]>);

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Hoje';
    if (isYesterday(date)) return 'Ontem';
    return format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Histórico de Medicações</h1>
        <p className="text-muted-foreground mt-1">Acompanhe o registro de todas as suas doses</p>
      </div>

      {/* Filtro por medicamento */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrar por Medicamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedMedication === null ? 'default' : 'outline'}
              onClick={() => setSelectedMedication(null)}
            >
              Todos
            </Button>
            {medications.map(med => (
              <Button
                key={med.id}
                variant={selectedMedication === med.id ? 'default' : 'outline'}
                onClick={() => setSelectedMedication(med.id)}
                className="gap-2"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: med.color }}
                />
                {med.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline de histórico */}
      <div className="space-y-4">
        {Object.entries(filteredGroupedLogs)
          .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
          .map(([dateStr, dateLogs]) => {
            const takenCount = dateLogs.filter(log => log.status === 'taken').length;
            const totalCount = dateLogs.length;
            const adherenceRate = Math.round((takenCount / totalCount) * 100);

            return (
              <Card key={dateStr}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        {getDateLabel(dateStr)}
                      </CardTitle>
                      <CardDescription>
                        {takenCount} de {totalCount} doses tomadas ({adherenceRate}% de aderência)
                      </CardDescription>
                    </div>
                    <Badge variant={adherenceRate >= 80 ? 'default' : 'secondary'}>
                      {adherenceRate}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dateLogs
                      .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())
                      .map(log => {
                        const medication = medications.find(m => m.id === log.medicationId);
                        if (!medication) return null;

                        const config = statusConfig[log.status];
                        const StatusIcon = config.icon;

                        return (
                          <div
                            key={log.id}
                            className={`flex items-center justify-between p-4 rounded-lg border ${config.bgColor}`}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className="w-12 h-12 rounded-full flex items-center justify-center bg-white"
                              >
                                <Pill className="h-6 w-6" style={{ color: medication.color }} />
                              </div>
                              <div>
                                <h4 className="font-semibold">{medication.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {medication.dosage}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                  <Clock className="h-3 w-3" />
                                  Agendado: {format(log.scheduledTime, 'HH:mm')}
                                  {log.takenTime && (
                                    <>
                                      {' | '}Tomado: {format(log.takenTime, 'HH:mm')}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusIcon className={`h-5 w-5 ${config.color}`} />
                              <Badge variant={config.variant}>{config.label}</Badge>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {Object.keys(filteredGroupedLogs).length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhum registro encontrado</h3>
            <p className="text-muted-foreground">
              {selectedMedication
                ? 'Não há histórico para este medicamento'
                : 'Comece a registrar suas medicações'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
