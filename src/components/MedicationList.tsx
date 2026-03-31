import { useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Pill, Calendar, Clock, Package, Minus, History, X, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Medication, MedicationLog } from '@/types/medication';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MedicationListProps {
  medications: Medication[];
  logs: MedicationLog[];
  onEdit: (medication: Medication) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  onUpdateStock: (medication: Medication) => void;
  action?: React.ReactNode;
}

const statusConfig = {
  taken: { label: 'Tomada', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  skipped: { label: 'Pulada', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  missed: { label: 'Perdida', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  pending: { label: 'Pendente', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
};

export function MedicationList({ medications, logs, onEdit, onDelete, onToggleActive, onUpdateStock, action }: MedicationListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [stockDialogMed, setStockDialogMed] = useState<Medication | null>(null);
  const [stockValue, setStockValue] = useState('');
  const [historyDialogMed, setHistoryDialogMed] = useState<Medication | null>(null);

  const filteredMedications = medications.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenStock = (med: Medication) => {
    setStockDialogMed(med);
    setStockValue(med.stock?.toString() || '0');
  };

  const handleSaveStock = () => {
    if (!stockDialogMed) return;
    const newStock = parseInt(stockValue) || 0;
    onUpdateStock({ ...stockDialogMed, stock: newStock });
    setStockDialogMed(null);
  };

  const getMedLogs = (medId: string) => {
    return logs
      .filter(l => l.medicationId === medId)
      .sort((a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime())
      .slice(0, 50);
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Hoje';
    if (isYesterday(date)) return 'Ontem';
    return format(date, "dd/MM", { locale: ptBR });
  };

  const renderActions = (medication: Medication, mobile = false) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={mobile ? "h-8 w-8" : ""}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Ações</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onEdit(medication)} className={mobile ? "min-h-[44px]" : ""}>
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleOpenStock(medication)} className={mobile ? "min-h-[44px]" : ""}>
          <Package className="h-4 w-4 mr-2" />
          Gerenciar Estoque
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setHistoryDialogMed(medication)} className={mobile ? "min-h-[44px]" : ""}>
          <History className="h-4 w-4 mr-2" />
          Ver Histórico
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className={`text-red-600 ${mobile ? "min-h-[44px]" : ""}`} onClick={() => onToggleActive(medication.id)}>
          {medication.active ? 'Desativar' : 'Ativar'}
        </DropdownMenuItem>
        <DropdownMenuItem className={`text-red-600 ${mobile ? "min-h-[44px]" : ""}`} onClick={() => onDelete(medication.id)}>
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Medicamentos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus medicamentos e prescrições
          </p>
        </div>
        {action}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar medicamentos..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredMedications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum medicamento encontrado</p>
              </div>
            ) : (
              filteredMedications.map((medication) => (
                <div
                  key={medication.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: (medication.color || '#000') + '20' }}
                    >
                      <Pill className="h-6 w-6" style={{ color: medication.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-base sm:text-lg leading-tight">{medication.name}</h3>
                        {!medication.active && (
                          <Badge variant="secondary" className="text-xs">Inativo</Badge>
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Pill className="h-4 w-4 shrink-0" />
                          {medication.dosage}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 shrink-0" />
                          {medication.frequency}
                        </span>
                        <span className={`flex items-center gap-1.5 ${medication.stock !== undefined && medication.stock <= 5 ? 'text-red-600 font-medium' : ''}`}>
                          <Package className="h-4 w-4 shrink-0" />
                          {medication.stock ?? 0} unidades
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:block">
                    {renderActions(medication)}
                  </div>
                  <div className="sm:hidden -mr-2 -mt-1">
                    {renderActions(medication, true)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog: Gerenciar Estoque */}
      <Dialog open={!!stockDialogMed} onOpenChange={(open) => !open && setStockDialogMed(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Gerenciar Estoque
            </DialogTitle>
            <DialogDescription>
              {stockDialogMed?.name} - {stockDialogMed?.dosage}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={() => setStockValue(String(Math.max(0, (parseInt(stockValue) || 0) - 1)))}
              >
                <Minus className="h-5 w-5" />
              </Button>
              <div className="text-center">
                <Input
                  type="number"
                  min="0"
                  value={stockValue}
                  onChange={(e) => setStockValue(e.target.value)}
                  className="w-24 text-center text-2xl font-bold h-14"
                />
                <p className="text-xs text-muted-foreground mt-1">unidades</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={() => setStockValue(String((parseInt(stockValue) || 0) + 1))}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            {stockDialogMed && (parseInt(stockValue) || 0) <= 5 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <p className="text-sm text-red-700 font-medium">Estoque baixo! Considere reabastecer.</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              {[10, 30, 60].map(qty => (
                <Button
                  key={qty}
                  variant="outline"
                  size="sm"
                  onClick={() => setStockValue(String((parseInt(stockValue) || 0) + qty))}
                  className="text-xs"
                >
                  +{qty} un.
                </Button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStockDialogMed(null)}>Cancelar</Button>
            <Button onClick={handleSaveStock}>
              <Check className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Ver Histórico */}
      <Dialog open={!!historyDialogMed} onOpenChange={(open) => !open && setHistoryDialogMed(null)}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: (historyDialogMed?.color || '#000') + '20' }}
              >
                <Pill className="h-4 w-4" style={{ color: historyDialogMed?.color }} />
              </div>
              Histórico - {historyDialogMed?.name}
            </DialogTitle>
            <DialogDescription>
              {historyDialogMed?.dosage} | {historyDialogMed?.frequency}
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[50vh] pr-1 space-y-2 py-2">
            {historyDialogMed && getMedLogs(historyDialogMed.id).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Nenhum registro encontrado</p>
              </div>
            ) : (
              historyDialogMed && getMedLogs(historyDialogMed.id).map(log => {
                const cfg = statusConfig[log.status];
                return (
                  <div
                    key={log.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${cfg.bg}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-center min-w-[48px]">
                        <p className="text-xs text-muted-foreground">{getDateLabel(new Date(log.scheduledTime))}</p>
                        <p className="text-sm font-bold">{format(new Date(log.scheduledTime), 'HH:mm')}</p>
                      </div>
                      <div className="h-8 w-px bg-border" />
                      <div>
                        <p className="text-sm font-medium">{historyDialogMed.dosage}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(log.scheduledTime), "EEEE", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`${cfg.color} text-xs`}>
                      {cfg.label}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryDialogMed(null)}>Fechar</Button>
            <Button variant="default" onClick={() => { setHistoryDialogMed(null); window.location.href = '/historico'; }}>
              <History className="h-4 w-4 mr-2" />
              Ver Completo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
