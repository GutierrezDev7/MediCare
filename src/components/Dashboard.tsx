import { Bell, Calendar, Pill, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Medication, MedicationLog } from '@/types/medication';
import { format, isToday, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardProps {
  medications: Medication[];
  logs: MedicationLog[];
  onMarkAsTaken: (logId: string) => void;
}

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
    <div className="space-y-6">
      {/* Header com saudação */}
      <div>
        <h1 className="text-3xl font-bold">Bem-vindo de volta!</h1>
        <p className="text-muted-foreground mt-1">
          {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>

      {/* Alertas importantes */}
      {missedLogs.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-900">
                {missedLogs.length} {missedLogs.length === 1 ? 'dose atrasada' : 'doses atrasadas'}
              </CardTitle>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Cards de estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medicamentos Ativos</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMedications.length}</div>
            <p className="text-xs text-muted-foreground">em uso contínuo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aderência Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adherenceToday}%</div>
            <Progress value={adherenceToday} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {takenToday} de {totalToday} doses tomadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aderência Semanal</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adherenceWeek}%</div>
            <Progress value={adherenceWeek} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {takenWeek} de {totalWeek} doses tomadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas Doses</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingLogs.length}</div>
            <p className="text-xs text-muted-foreground">nas próximas horas</p>
          </CardContent>
        </Card>
      </div>

      {/* Próximas doses */}
      <Card>
        <CardHeader>
          <CardTitle>Próximas Doses</CardTitle>
          <CardDescription>Medicamentos agendados para hoje</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>Todas as doses de hoje foram tomadas!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingLogs.map(log => {
                const medication = medications.find(m => m.id === log.medicationId);
                if (!medication) return null;

                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: (medication.color || '#000') + '20' }}
                      >
                        <Pill className="h-6 w-6" style={{ color: medication.color }} />
                      </div>
                      <div>
                        <h4 className="font-semibold">{medication.name}</h4>
                        <p className="text-sm text-muted-foreground">{medication.dosage}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(log.scheduledTime, 'HH:mm')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onMarkAsTaken(log.id)}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      Marcar como tomada
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medicamentos que precisam de reposição */}
      <Card>
        <CardHeader>
          <CardTitle>Alerta de Estoque</CardTitle>
          <CardDescription>Medicamentos que precisam ser repostos em breve</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeMedications
              .filter(med => med.stock && med.stock <= 10)
              .map(medication => (
                <div
                  key={medication.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: (medication.color || '#000') + '20' }}
                    >
                      <Pill className="h-6 w-6" style={{ color: medication.color }} />
                    </div>
                    <div>
                      <h4 className="font-semibold">{medication.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {medication.stock} {medication.stock === 1 ? 'unidade restante' : 'unidades restantes'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={medication.stock! <= 5 ? 'destructive' : 'secondary'}>
                    Estoque baixo
                  </Badge>
                </div>
              ))}
            {activeMedications.filter(med => med.stock && med.stock <= 10).length === 0 && (
              <p className="text-center py-4 text-muted-foreground">
                Todos os medicamentos com estoque adequado
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
