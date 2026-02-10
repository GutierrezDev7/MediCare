import { useState } from 'react';
import { TrendingUp, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Medication, MedicationLog } from '../types/medication';
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';

interface ReportsViewProps {
  medications: Medication[];
  logs: MedicationLog[];
}

export function ReportsView({ medications, logs }: ReportsViewProps) {
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  // Calcula dados para o período selecionado
  const getDaysInPeriod = () => {
    const today = new Date();
    const daysBack = period === 'week' ? 6 : 29;
    return eachDayOfInterval({
      start: subDays(today, daysBack),
      end: today,
    });
  };

  const days = getDaysInPeriod();

  // Dados de aderência diária
  const dailyAdherenceData = days.map(day => {
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    
    const dayLogs = logs.filter(
      log => log.scheduledTime >= dayStart && log.scheduledTime <= dayEnd
    );
    
    const taken = dayLogs.filter(log => log.status === 'taken').length;
    const total = dayLogs.length;
    const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;

    return {
      date: format(day, 'dd/MM'),
      adherence,
      taken,
      missed: dayLogs.filter(log => log.status === 'missed').length,
      skipped: dayLogs.filter(log => log.status === 'skipped').length,
    };
  });

  // Dados por medicamento
  const medicationData = medications.map(med => {
    const medLogs = logs.filter(log => log.medicationId === med.id);
    const taken = medLogs.filter(log => log.status === 'taken').length;
    const total = medLogs.length;
    const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;

    return {
      name: med.name,
      adherence,
      taken,
      total,
      color: med.color,
    };
  });

  // Dados de status geral
  const totalLogs = logs.length;
  const statusData = [
    {
      name: 'Tomadas',
      value: logs.filter(log => log.status === 'taken').length,
      color: '#10b981',
    },
    {
      name: 'Perdidas',
      value: logs.filter(log => log.status === 'missed').length,
      color: '#ef4444',
    },
    {
      name: 'Ignoradas',
      value: logs.filter(log => log.status === 'skipped').length,
      color: '#f59e0b',
    },
  ].filter(item => item.value > 0);

  // Calcula estatísticas gerais
  const totalTaken = logs.filter(log => log.status === 'taken').length;
  const overallAdherence = totalLogs > 0 ? Math.round((totalTaken / totalLogs) * 100) : 0;

  const exportReport = () => {
    // Simula exportação de relatório
    const reportData = {
      period,
      generatedAt: new Date().toISOString(),
      overallAdherence,
      dailyData: dailyAdherenceData,
      medicationData,
      statusData,
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-medicamentos-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios e Análises</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe sua aderência ao tratamento
          </p>
        </div>
        <Button onClick={exportReport} className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* Card de resumo geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Aderência Geral
          </CardTitle>
          <CardDescription>
            Sua taxa de aderência ao tratamento nos últimos{' '}
            {period === 'week' ? '7 dias' : '30 dias'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-4xl font-bold">{overallAdherence}%</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPeriod(period === 'week' ? 'month' : 'week')}
                >
                  {period === 'week' ? 'Ver mês' : 'Ver semana'}
                </Button>
              </div>
              <Progress value={overallAdherence} className="h-3" />
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Total de Doses</p>
                <p className="text-2xl font-bold">{totalLogs}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Doses Tomadas</p>
                <p className="text-2xl font-bold text-green-600">{totalTaken}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Doses Perdidas</p>
                <p className="text-2xl font-bold text-red-600">
                  {logs.filter(log => log.status === 'missed').length}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
          <TabsTrigger value="medications">Por Medicamento</TabsTrigger>
          <TabsTrigger value="distribution">Distribuição</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aderência Diária</CardTitle>
              <CardDescription>
                Percentual de doses tomadas por dia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyAdherenceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="adherence"
                    name="Aderência (%)"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Doses por Status</CardTitle>
              <CardDescription>
                Distribuição de doses tomadas, perdidas e ignoradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyAdherenceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="taken" name="Tomadas" fill="#10b981" stackId="a" />
                  <Bar dataKey="missed" name="Perdidas" fill="#ef4444" stackId="a" />
                  <Bar dataKey="skipped" name="Ignoradas" fill="#f59e0b" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aderência por Medicamento</CardTitle>
              <CardDescription>
                Taxa de aderência individual de cada medicamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medicationData.map((med, index) => (
                  <div key={med.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: med.color }}
                        />
                        <span className="font-medium">{med.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{med.adherence}%</span>
                        <p className="text-xs text-muted-foreground">
                          {med.taken}/{med.total} doses
                        </p>
                      </div>
                    </div>
                    <Progress value={med.adherence} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comparação de Aderência</CardTitle>
              <CardDescription>
                Visualização comparativa entre medicamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={medicationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="adherence" name="Aderência (%)">
                    {medicationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Status</CardTitle>
                <CardDescription>
                  Proporção de doses por status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas Detalhadas</CardTitle>
                <CardDescription>
                  Resumo completo do período
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statusData.map(item => (
                    <div key={item.name} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{item.value}</p>
                        <p className="text-xs text-muted-foreground">
                          {totalLogs > 0 ? Math.round((item.value / totalLogs) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Total de Registros</span>
                      <span className="text-2xl font-bold">{totalLogs}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
