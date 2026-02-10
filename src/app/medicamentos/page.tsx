'use client';

import { useState } from 'react';
import { useMedication } from '@/contexts/MedicationContext';
import { MedicationList } from '@/components/MedicationList';
import { AddMedicationDialog } from '@/components/AddMedicationDialog';
import { Medication } from '@/types/medication';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function MedicationsPage() {
  const { medications, addMedication, updateMedication, deleteMedication, toggleMedicationActive } = useMedication();
  const [editingMedication, setEditingMedication] = useState<Medication | undefined>(undefined);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);
  };

  const handleCloseDialog = () => {
    setEditingMedication(undefined);
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* The header is inside MedicationList, but the button should be injected or placed nearby.
            MedicationList component has a header "Medicamentos". 
            I should probably wrap MedicationList or modify it to accept an action button.
            However, for now, I will put the Add Dialog here and pass onAdd.
        */}
      </div>
      
      {/* We need the Add button to be visible. 
          MedicationList has a header but no "Add" button slot.
          I will place the AddMedicationDialog inside the page, but I need a trigger.
          AddMedicationDialog has a default trigger if no editingMedication.
          Let's just render AddMedicationDialog at the top or passed into MedicationList if I modify it.
          
          Actually, let's modify MedicationList to accept a 'children' or 'action' prop, 
          OR just put the button above MedicationList.
          
          Looking at MedicationList code:
          It renders a title.
          
          I'll just put the AddMedicationDialog above the list for now, or use a customized header.
      */}

      <MedicationList
        medications={medications}
        onEdit={handleEdit}
        onDelete={deleteMedication}
        onToggleActive={toggleMedicationActive}
        action={<AddMedicationDialog onAdd={addMedication} />}
      />

      {/* Edit Dialog */}
      {editingMedication && (
        <AddMedicationDialog
          editingMedication={editingMedication}
          onUpdate={updateMedication}
          onAdd={addMedication} // Required prop but won't be used in edit mode
          onClose={handleCloseDialog}
        />
      )}
    </div>
  );
}
