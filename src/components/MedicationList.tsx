import { useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Pill, Calendar, Clock, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Medication } from '@/types/medication';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MedicationListProps {
  medications: Medication[];
  onEdit: (medication: Medication) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  action?: React.ReactNode;
}

export function MedicationList({ medications, onEdit, onDelete, onToggleActive, action }: MedicationListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMedications = medications.filter(med => 
    med.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
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
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-base sm:text-lg leading-tight">{medication.name}</h3>
                          {!medication.active && (
                            <Badge variant="secondary" className="text-xs">
                              Inativo
                            </Badge>
                          )}
                        </div>
                        
                        {/* Mobile Action Menu */}
                        <div className="sm:hidden -mr-2 -mt-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => onEdit(medication)} className="min-h-[44px]">Editar</DropdownMenuItem>
                              <DropdownMenuItem disabled className="min-h-[44px]">Gerenciar Estoque</DropdownMenuItem>
                              <DropdownMenuItem disabled className="min-h-[44px]">Ver Histórico</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600 min-h-[44px]" onClick={() => onToggleActive(medication.id)}>
                                {medication.active ? 'Desativar' : 'Ativar'}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600 min-h-[44px]" onClick={() => onDelete(medication.id)}>
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
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
                        <span className={`flex items-center gap-1.5 ${medication.stock && medication.stock <= 5 ? 'text-red-600 font-medium' : ''}`}>
                          <Package className="h-4 w-4 shrink-0" />
                          {medication.stock} unidades
                        </span>
                      </div>
                    </div>

                    {/* Desktop Action Menu */}
                    <div className="hidden sm:block">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onEdit(medication)}>Editar</DropdownMenuItem>
                          <DropdownMenuItem disabled>Gerenciar Estoque</DropdownMenuItem>
                          <DropdownMenuItem disabled>Ver Histórico</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => onToggleActive(medication.id)}>
                            {medication.active ? 'Desativar' : 'Ativar'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => onDelete(medication.id)}>
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
