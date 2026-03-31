'use client';

import { useState } from 'react';
import { useMedication } from '@/contexts/MedicationContext';
import { MedicationList } from '@/components/MedicationList';
import { AddMedicationDialog } from '@/components/AddMedicationDialog';
import { Medication } from '@/types/medication';

export default function MedicationsPage() {
  const { medications, logs, addMedication, updateMedication, deleteMedication, toggleMedicationActive } = useMedication();
  const [editingMedication, setEditingMedication] = useState<Medication | undefined>(undefined);

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);
  };

  const handleCloseDialog = () => {
    setEditingMedication(undefined);
  };

  const handleUpdateStock = (medication: Medication) => {
    updateMedication(medication);
  };

  return (
    <div className="space-y-6">
      <MedicationList
        medications={medications}
        logs={logs}
        onEdit={handleEdit}
        onDelete={deleteMedication}
        onToggleActive={toggleMedicationActive}
        onUpdateStock={handleUpdateStock}
        action={<AddMedicationDialog onAdd={addMedication} />}
      />

      {editingMedication && (
        <AddMedicationDialog
          editingMedication={editingMedication}
          onUpdate={updateMedication}
          onAdd={addMedication}
          onClose={handleCloseDialog}
        />
      )}
    </div>
  );
}
