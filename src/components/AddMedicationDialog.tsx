import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Medication } from '@/types/medication';
import { useState } from 'react';
import { Plus } from 'lucide-react';

interface AddMedicationDialogProps {
  onAdd: (medication: Omit<Medication, 'id'>) => void;
  onUpdate?: (medication: Medication) => void;
  editingMedication?: Medication;
  onClose?: () => void;
}

export function AddMedicationDialog({ onAdd, onUpdate, editingMedication, onClose }: AddMedicationDialogProps) {
  const [open, setOpen] = useState(!!editingMedication);
  const [name, setName] = useState(editingMedication?.name || '');
  const [dosage, setDosage] = useState(editingMedication?.dosage || '');
  const [frequency, setFrequency] = useState(editingMedication?.frequency || '');
  const [startTime, setStartTime] = useState(
    editingMedication 
      ? format(new Date(editingMedication.startDate), 'HH:mm') 
      : format(new Date(), 'HH:mm')
  );
  const [stock, setStock] = useState(editingMedication?.stock?.toString() || '');
  const [color, setColor] = useState(editingMedication?.color || '#3b82f6');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!dosage.trim()) newErrors.dosage = 'Dosagem é obrigatória';
    if (!frequency) newErrors.frequency = 'Frequência é obrigatória';
    if (stock && parseInt(stock) < 0) newErrors.stock = 'Estoque não pode ser negativo';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    // Parse start time
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = editingMedication ? new Date(editingMedication.startDate) : new Date();
    startDate.setHours(hours, minutes, 0, 0);

    const medicationData = {
      name,
      dosage,
      frequency,
      active: true,
      startDate,
      stock: parseInt(stock) || 0,
      color,
    };

    if (editingMedication && onUpdate) {
      onUpdate({ ...medicationData, id: editingMedication.id });
    } else {
      onAdd(medicationData);
    }
    
    setOpen(false);
    if (onClose) onClose();
    if (!editingMedication) {
        setName('');
        setDosage('');
        setFrequency('');
        setStock('');
        setErrors({});
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen && onClose) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!editingMedication && (
        <DialogTrigger asChild>
          <Button className="w-full md:w-auto gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Novo Medicamento
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editingMedication ? 'Editar Medicamento' : 'Novo Medicamento'}</DialogTitle>
            <DialogDescription>
              Preencha os detalhes do medicamento abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 items-start md:items-center gap-2 md:gap-4">
              <Label htmlFor="name" className="md:text-right">
                Nome
              </Label>
              <div className="md:col-span-3 space-y-1">
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-start md:items-center gap-2 md:gap-4">
              <Label htmlFor="dosage" className="md:text-right">
                Dosagem
              </Label>
              <div className="md:col-span-3 space-y-1">
                <Input
                  id="dosage"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="Ex: 500mg"
                  className={errors.dosage ? 'border-red-500' : ''}
                />
                {errors.dosage && <p className="text-xs text-red-500">{errors.dosage}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-start md:items-center gap-2 md:gap-4">
              <Label htmlFor="frequency" className="md:text-right">
                Frequência
              </Label>
              <div className="md:col-span-3 space-y-1">
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger className={`min-h-[44px] ${errors.frequency ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4h" className="min-h-[44px]">A cada 4 horas</SelectItem>
                    <SelectItem value="6h" className="min-h-[44px]">A cada 6 horas</SelectItem>
                    <SelectItem value="8h" className="min-h-[44px]">A cada 8 horas</SelectItem>
                    <SelectItem value="12h" className="min-h-[44px]">A cada 12 horas</SelectItem>
                    <SelectItem value="24h" className="min-h-[44px]">Uma vez ao dia</SelectItem>
                  </SelectContent>
                </Select>
                {errors.frequency && <p className="text-xs text-red-500">{errors.frequency}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-start md:items-center gap-2 md:gap-4">
              <Label htmlFor="startTime" className="md:text-right">
                Horário Início
              </Label>
              <div className="md:col-span-3 space-y-1">
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="min-h-[44px]"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-start md:items-center gap-2 md:gap-4">
              <Label htmlFor="stock" className="md:text-right">
                Estoque
              </Label>
              <div className="md:col-span-3 space-y-1">
                <Input
                  id="stock"
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="Qtd. comprimidos"
                  className={errors.stock ? 'border-red-500' : ''}
                />
                {errors.stock && <p className="text-xs text-red-500">{errors.stock}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-start md:items-center gap-2 md:gap-4">
              <Label htmlFor="color" className="md:text-right">
                Cor
              </Label>
              <div className="md:col-span-3 flex flex-wrap gap-3">
                {['#ef4444', '#3b82f6', '#eab308', '#22c55e', '#a855f7', '#ec4899'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`w-10 h-10 rounded-full border-2 transition-transform active:scale-95 ${color === c ? 'border-black ring-2 ring-offset-2 ring-black/20' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                    aria-label={`Selecionar cor ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
