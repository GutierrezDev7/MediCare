import { Bell, Calendar, Pill, TrendingUp, AlertCircle, CheckCircle2, Clock, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Medication, MedicationLog } from '@/types/medication';
import { format, isToday, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface DashboardProps {
  medications: Medication[];
  logs: MedicationLog[];
  onMarkAsTaken: (logId: string) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function Dashboard({ medications, logs, onMarkAsTaken }: DashboardProps) {
  const activeMedications = medications.filter(m => m.active);
  
  // Calcula estatísticas do dia
  const todayLogs = logs.filter(log => isToday(log.scheduledTime));
  const takenToday = todayLogs.filter(log => log.status === 'taken').length;
  const totalToday = todayLogs.length;
  const adherenceToday = totalToday > 0 ? Math.round((takenToday / totalToday) * 100) : 0;
  
  // Calcula estatísticas da semana
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
  
  // Próximas doses
  const now = new Date();
  const upcomingLogs = logs
    .filter(log => log.status === 'pending' && log.scheduledTime >= now)
    .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())
    .slice(0, 5);
  
  // Doses atrasadas
  const missedLogs = logs.filter(
    log => log.status === 'pending' && isBefore(log.scheduledTime, now)
  );

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header com saudação */}
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

      {/* Alertas importantes */}
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
            <Button variant="destructive" size="sm" className="shadow-md">
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
              <div className="h-full bg-primary w-3/4 rounded-full" />
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
              <span className="text-2xl font-bold text-purple-600">Excelente</span>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Continue assim! Sua rotina está ótima.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Conteúdo Principal Dividido */}
      <div className="grid gap-6 md:grid-cols-7">
        {/* Próximas Doses - Ocupa 4 colunas */}
        <motion.div variants={item} className="md:col-span-4 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Próximas Doses
          </h2>
          
          <div className="grid gap-3">
            {upcomingLogs.length > 0 ? (
              upcomingLogs.map((log) => {
                const medication = medications.find(m => m.id === log.medicationId);
                if (!medication) return null;
                
                return (
                  <motion.div 
                    key={log.id}
                    whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.6)" }}
                    className="glass-panel p-4 rounded-xl flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-md"
                        style={{ backgroundColor: medication.color || 'var(--primary)' }}
                      >
                        <Pill className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{medication.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="secondary" className="bg-background/50">{medication.dosage}</Badge>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(log.scheduledTime), 'HH:mm')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => onMarkAsTaken(log.id)}
                      className="rounded-full h-10 w-10 p-0 shadow-lg hover:shadow-primary/25 transition-all hover:scale-110"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </Button>
                  </motion.div>
                );
              })
            ) : (
              <div className="glass-panel p-8 rounded-2xl text-center">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-lg">Tudo em dia!</h3>
                <p className="text-muted-foreground">Você não tem mais doses agendadas para hoje.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Resumo/Gráfico Simplificado - Ocupa 3 colunas */}
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
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-background/50 p-3 rounded-xl text-center">
                  <span className="block text-2xl font-bold text-emerald-600">{takenToday}</span>
                  <span className="text-xs text-muted-foreground">Tomados</span>
                </div>
                <div className="bg-background/50 p-3 rounded-xl text-center">
                  <span className="block text-2xl font-bold text-muted-foreground">{totalToday - takenToday}</span>
                  <span className="text-xs text-muted-foreground">Pendentes</span>
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
    </motion.div>
  );
}
