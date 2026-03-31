import { useState } from 'react';
import { Bell, Calendar, Pill, TrendingUp, AlertCircle, CheckCircle2, Clock, Activity, SkipForward, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Medication, MedicationLog } from '@/types/medication';
import { format, isToday, isBefore, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DashboardProps {
  medications: Medication[];
  logs: MedicationLog[];
  onMarkAsTaken: (logId: string) => void;
  onMarkAsSkipped?: (logId: string) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function Dashboard({ medications, logs, onMarkAsTaken, onMarkAsSkipped }: DashboardProps) {
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);

  const activeMedications = medications.filter(m => m.active);

  const todayLogs = logs.filter(log => isToday(log.scheduledTime));
  const takenToday = todayLogs.filter(log => log.status === 'taken').length;
  const totalToday = todayLogs.length;
  const adherenceToday = totalToday > 0 ? Math.round((takenToday / totalToday) * 100) : 0;

  const weekLogs = logs.filter(log => {
    const logDate = new Date(log.scheduledTime);
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    return logDate >= weekAgo && logDate <= today;
  });

  const takenWeek = weekLogs.filter(log => log.status === 'taken').length;
  const totalWeek = weekLogs.length;
  const adherenceWeek = totalWeek > 0 ? Math.round((takenWeek / totalWeek) * 100) : 0;

  const now = new Date();

  const allUpcomingLogs = logs
    .filter(log => log.status === 'pending' && new Date(log.scheduledTime) >= now)
    .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());

  const visibleUpcoming = showAllUpcoming ? allUpcomingLogs : allUpcomingLogs.slice(0, 6);

  const missedLogs = logs.filter(
    log => log.status === 'pending' && isBefore(new Date(log.scheduledTime), now)
  );

  const getStatusLabel = () => {
    if (adherenceWeek >= 90) return { text: 'Excelente', color: 'text-emerald-600' };
    if (adherenceWeek >= 70) return { text: 'Bom', color: 'text-blue-600' };
    if (adherenceWeek >= 50) return { text: 'Regular', color: 'text-yellow-600' };
    return { text: 'Atenção', color: 'text-red-600' };
  };

  const status = getStatusLabel();

  const getTimeUntil = (date: Date) => {
    return formatDistanceToNow(date, { locale: ptBR, addSuffix: true });
  };

  const handleResolveAll = (action: 'take' | 'skip') => {
    missedLogs.forEach(log => {
      if (action === 'take') {
        onMarkAsTaken(log.id);
      } else if (onMarkAsSkipped) {
        onMarkAsSkipped(log.id);
      }
    });
    setResolveDialogOpen(false);
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary-foreground">
            Bem-vindo de volta!
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        <div className="hidden md:block">
          <Badge variant="outline" className="px-4 py-1 text-sm glass-panel border-primary/20">
            Última sincronização: {format(new Date(), "HH:mm")}
          </Badge>
        </div>
      </motion.div>

      {/* Alerta de doses atrasadas */}
      {missedLogs.length > 0 && (
        <motion.div variants={item}>
          <div className="glass-panel border-destructive/30 bg-destructive/5 p-4 rounded-xl flex items-center gap-4 shadow-lg shadow-destructive/5">
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-destructive text-lg">Atenção Necessária</h3>
              <p className="text-destructive/80">
                Você tem {missedLogs.length} {missedLogs.length === 1 ? 'dose atrasada' : 'doses atrasadas'} que precisam de atenção.
              </p>
            </div>
            <Button variant="destructive" size="sm" className="shadow-md" onClick={() => setResolveDialogOpen(true)}>
              Resolver Agora
            </Button>
          </div>
        </motion.div>
      )}

      {/* Cards de estatísticas */}
      <motion.div variants={item} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Pill className="h-24 w-24 text-primary transform rotate-12" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-muted-foreground">Medicamentos Ativos</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">{activeMedications.length}</span>
              <span className="text-sm text-muted-foreground">em uso</span>
            </div>
            <div className="mt-4 h-1 w-full bg-primary/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, activeMedications.length * 20)}%` }} />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="h-24 w-24 text-emerald-500 transform -rotate-12" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-muted-foreground">Aderência Hoje</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-emerald-600">{adherenceToday}%</span>
            </div>
            <Progress value={adherenceToday} className="mt-4 h-2 bg-emerald-100 [&>div]:bg-emerald-500" />
            <p className="text-xs text-muted-foreground mt-2">
              {takenToday} de {totalToday} doses tomadas
            </p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Calendar className="h-24 w-24 text-blue-500 transform rotate-6" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-muted-foreground">Aderência Semanal</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-blue-600">{adherenceWeek}%</span>
            </div>
            <Progress value={adherenceWeek} className="mt-4 h-2 bg-blue-100 [&>div]:bg-blue-500" />
            <p className="text-xs text-muted-foreground mt-2">
              Média dos últimos 7 dias
            </p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="h-24 w-24 text-purple-500 transform -rotate-6" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-muted-foreground">Status Geral</p>
            <div className="mt-2">
              <span className={`text-2xl font-bold ${status.color}`}>{status.text}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              {adherenceWeek >= 90 ? 'Continue assim! Sua rotina está ótima.' :
               adherenceWeek >= 70 ? 'Bom progresso, mas pode melhorar.' :
               adherenceWeek >= 50 ? 'Tente manter mais regularidade.' :
               'Sua aderência precisa de atenção.'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Conteúdo Principal */}
      <div className="grid gap-6 md:grid-cols-7">
        {/* Próximas Doses */}
        <motion.div variants={item} className="md:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Próximas Doses
              {allUpcomingLogs.length > 0 && (
                <Badge variant="secondary" className="ml-1">{allUpcomingLogs.length}</Badge>
              )}
            </h2>
          </div>

          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {visibleUpcoming.length > 0 ? (
                <>
                  {visibleUpcoming.map((log, index) => {
                    const medication = medications.find(m => m.id === log.medicationId);
                    if (!medication) return null;

                    const scheduledDate = new Date(log.scheduledTime);
                    const isNext = index === 0;

                    return (
                      <motion.div
                        key={log.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, x: 100 }}
                        transition={{ duration: 0.2 }}
                        className={`glass-panel rounded-xl overflow-hidden transition-all ${isNext ? 'ring-2 ring-primary/20' : ''}`}
                      >
                        <div className="flex items-stretch">
                          {/* Barra lateral colorida */}
                          <div className="w-1.5 shrink-0" style={{ backgroundColor: medication.color || 'var(--primary)' }} />

                          <div className="flex-1 flex items-center justify-between p-3 sm:p-4 gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0"
                                style={{ backgroundColor: medication.color || 'var(--primary)' }}
                              >
                                <Pill className="h-5 w-5" />
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-sm sm:text-base truncate">{medication.name}</h3>
                                  {isNext && (
                                    <Badge className="bg-primary/10 text-primary border-0 text-[10px] px-1.5 py-0 shrink-0">
                                      Próxima
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mt-0.5">
                                  <span className="font-medium">{medication.dosage}</span>
                                  <span className="text-muted-foreground/50">|</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {format(scheduledDate, 'HH:mm')}
                                  </span>
                                  <span className="hidden sm:inline text-muted-foreground/50">|</span>
                                  <span className="hidden sm:inline text-xs">{getTimeUntil(scheduledDate)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {onMarkAsSkipped && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 text-muted-foreground hover:text-yellow-600 hover:bg-yellow-50"
                                  onClick={() => onMarkAsSkipped(log.id)}
                                  title="Pular dose"
                                >
                                  <SkipForward className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                className="h-9 px-3 shadow-sm hover:shadow-primary/20 transition-all gap-1.5"
                                onClick={() => onMarkAsTaken(log.id)}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="hidden sm:inline">Tomei</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {allUpcomingLogs.length > 6 && (
                    <Button
                      variant="ghost"
                      className="w-full text-muted-foreground hover:text-primary"
                      onClick={() => setShowAllUpcoming(!showAllUpcoming)}
                    >
                      {showAllUpcoming ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-2" />
                          Mostrar menos
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-2" />
                          Ver mais {allUpcomingLogs.length - 6} doses
                        </>
                      )}
                    </Button>
                  )}
                </>
              ) : (
                <div className="glass-panel p-8 rounded-2xl text-center">
                  <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold text-lg">Tudo em dia!</h3>
                  <p className="text-muted-foreground">Você não tem mais doses agendadas para hoje.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Resumo Rápido */}
        <motion.div variants={item} className="md:col-span-3 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Resumo Rápido
          </h2>

          <div className="glass-panel p-6 rounded-2xl h-fit">
            <h3 className="font-semibold mb-4">Progresso Diário</h3>
            <div className="relative pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Conclusão</span>
                <span className="text-sm font-bold text-primary">{adherenceToday}%</span>
              </div>
              <Progress value={adherenceToday} className="h-4 rounded-full" />

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="bg-background/50 p-3 rounded-xl text-center">
                  <span className="block text-2xl font-bold text-emerald-600">{takenToday}</span>
                  <span className="text-xs text-muted-foreground">Tomados</span>
                </div>
                <div className="bg-background/50 p-3 rounded-xl text-center">
                  <span className="block text-2xl font-bold text-muted-foreground">{totalToday - takenToday - missedLogs.filter(l => isToday(new Date(l.scheduledTime))).length}</span>
                  <span className="text-xs text-muted-foreground">Pendentes</span>
                </div>
                <div className="bg-background/50 p-3 rounded-xl text-center">
                  <span className="block text-2xl font-bold text-red-500">{missedLogs.filter(l => isToday(new Date(l.scheduledTime))).length}</span>
                  <span className="text-xs text-muted-foreground">Atrasados</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border/10">
              <a href="/relatorios">
                <Button variant="outline" className="w-full justify-between group hover:border-primary/50 transition-colors">
                  Ver Relatório Completo
                  <TrendingUp className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Button>
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Dialog: Resolver Doses Atrasadas */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Doses Atrasadas ({missedLogs.length})
            </DialogTitle>
            <DialogDescription>
              Revise as doses que passaram do horário e escolha o que fazer com cada uma.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[45vh] space-y-2 py-2 pr-1">
            {missedLogs
              .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
              .map(log => {
                const medication = medications.find(m => m.id === log.medicationId);
                if (!medication) return null;

                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-red-100 bg-red-50/50 gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="h-9 w-9 rounded-lg flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: medication.color || '#ef4444' }}
                      >
                        <Pill className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{medication.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {medication.dosage} - {format(new Date(log.scheduledTime), 'HH:mm')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {onMarkAsSkipped && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs gap-1 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                          onClick={() => onMarkAsSkipped(log.id)}
                        >
                          <SkipForward className="h-3 w-3" />
                          Pular
                        </Button>
                      )}
                      <Button
                        size="sm"
                        className="h-8 text-xs gap-1"
                        onClick={() => onMarkAsTaken(log.id)}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Tomei
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setResolveDialogOpen(false)} className="sm:mr-auto">
              Fechar
            </Button>
            <div className="flex gap-2">
              {onMarkAsSkipped && (
                <Button
                  variant="outline"
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                  onClick={() => handleResolveAll('skip')}
                >
                  <SkipForward className="h-4 w-4 mr-2" />
                  Pular Todas
                </Button>
              )}
              <Button onClick={() => handleResolveAll('take')}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Marcar Todas como Tomadas
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
