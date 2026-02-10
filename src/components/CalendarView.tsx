import { useState } from 'react';
import { ChevronLeft, ChevronRight, Pill } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Medication, MedicationLog } from '@/types/medication';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarViewProps {
  medications: Medication[];
  logs: MedicationLog[];
}

export function CalendarView({ medications, logs }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Preenche o calendário com dias antes e depois do mês
  const startDay = monthStart.getDay();
  const endDay = monthEnd.getDay();
  
  const previousMonthDays = Array.from({ length: startDay }, (_, i) => {
    const date = new Date(monthStart);
    date.setDate(date.getDate() - (startDay - i));
    return date;
  });

  const nextMonthDays = Array.from({ length: 6 - endDay }, (_, i) => {
    const date = new Date(monthEnd);
    date.setDate(date.getDate() + (i + 1));
    return date;
  });

  const calendarDays = [...previousMonthDays, ...daysInMonth, ...nextMonthDays];

  const getLogsForDate = (date: Date) => {
    return logs.filter(log => isSameDay(log.scheduledTime, date));
  };

  const getAdherenceForDate = (date: Date) => {
    const dateLogs = getLogsForDate(date);
    if (dateLogs.length === 0) return null;
    
    const taken = dateLogs.filter(log => log.status === 'taken').length;
    return Math.round((taken / dateLogs.length) * 100);
  };

  const selectedDateLogs = selectedDate ? getLogsForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Calendário de Medicações</h1>
        <p className="text-muted-foreground mt-1">Visualize suas medicações por data</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendário */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date())}
                >
                  Hoje
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {/* Cabeçalho dos dias da semana */}
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="text-center text-sm font-semibold p-2">
                  {day}
                </div>
              ))}
              
              {/* Dias do calendário */}
              {calendarDays.map((day, index) => {
                const dayLogs = getLogsForDate(day);
                const adherence = getAdherenceForDate(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isCurrentDay = isToday(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      relative p-2 rounded-lg border transition-all min-h-[80px] flex flex-col
                      ${!isCurrentMonth ? 'opacity-40' : ''}
                      ${isCurrentDay ? 'border-primary border-2' : ''}
                      ${isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}
                    `}
                  >
                    <span className={`text-sm ${isCurrentDay ? 'font-bold' : ''}`}>
                      {format(day, 'd')}
                    </span>
                    
                    {dayLogs.length > 0 && (
                      <div className="mt-auto space-y-1">
                        <div className="flex gap-1 flex-wrap justify-center">
                          {dayLogs.slice(0, 3).map((log, i) => {
                            const med = medications.find(m => m.id === log.medicationId);
                            return (
                              <div
                                key={i}
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor: med?.color || '#gray',
                                  opacity: log.status === 'taken' ? 1 : 0.3,
                                }}
                              />
                            );
                          })}
                        </div>
                        {adherence !== null && (
                          <div className="text-xs font-semibold">
                            {adherence}%
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legenda */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-semibold mb-3">Legenda:</h4>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span>Dose tomada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary opacity-30" />
                  <span>Dose perdida/ignorada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-primary" />
                  <span>Hoje</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detalhes do dia selecionado */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate
                ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR })
                : 'Selecione uma data'}
            </CardTitle>
            <CardDescription>
              {selectedDateLogs.length > 0
                ? `${selectedDateLogs.length} ${selectedDateLogs.length === 1 ? 'dose agendada' : 'doses agendadas'}`
                : 'Nenhuma dose agendada'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDateLogs.length > 0 ? (
              <div className="space-y-3">
                {selectedDateLogs
                  .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())
                  .map(log => {
                    const med = medications.find(m => m.id === log.medicationId);
                    if (!med) return null;

                    return (
                      <div
                        key={log.id}
                        className="p-3 rounded-lg border"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: (med.color || '#000') + '20' }}
                          >
                            <Pill className="h-5 w-5" style={{ color: med.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{med.name}</h4>
                            <p className="text-xs text-muted-foreground">{med.dosage}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(log.scheduledTime, 'HH:mm')}
                            </p>
                          </div>
                          <Badge
                            variant={
                              log.status === 'taken'
                                ? 'default'
                                : log.status === 'missed'
                                ? 'destructive'
                                : 'secondary'
                            }
                            className="flex-shrink-0"
                          >
                            {log.status === 'taken'
                              ? 'Tomada'
                              : log.status === 'missed'
                              ? 'Perdida'
                              : log.status === 'skipped'
                              ? 'Ignorada'
                              : 'Pendente'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Pill className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {selectedDate
                    ? 'Nenhuma dose agendada para esta data'
                    : 'Selecione uma data para ver os detalhes'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
