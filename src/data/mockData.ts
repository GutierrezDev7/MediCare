import { Medication, MedicationLog } from '../types/medication';
import { addDays, subDays, setHours, setMinutes } from 'date-fns';

export const mockUser = {
  name: "Maria Silva",
  email: "maria.silva@email.com"
};

const createDate = (daysAgo: number, hour: number, minute: number) => {
  const date = subDays(new Date(), daysAgo);
  return setMinutes(setHours(date, hour), minute);
};

export const mockMedications: Medication[] = [
  { 
    id: '1', 
    name: 'Losartana', 
    dosage: '50mg', 
    frequency: '24h', 
    active: true, 
    startDate: setMinutes(setHours(subDays(new Date(), 60), 8), 0), 
    color: '#10b981', // Emerald (Health)
    stock: 28,
    instructions: 'Tomar pela manhã em jejum'
  },
  { 
    id: '2', 
    name: 'Metformina', 
    dosage: '850mg', 
    frequency: '12h', 
    active: true, 
    startDate: setMinutes(setHours(subDays(new Date(), 45), 8), 0), 
    color: '#0ea5e9', // Sky Blue
    stock: 50,
    instructions: 'Tomar após as refeições'
  },
  { 
    id: '3', 
    name: 'Simvastatina', 
    dosage: '20mg', 
    frequency: '24h', 
    active: true, 
    startDate: setMinutes(setHours(subDays(new Date(), 90), 22), 0), 
    color: '#8b5cf6', // Violet
    stock: 15,
    instructions: 'Tomar à noite'
  },
  { 
    id: '4', 
    name: 'Vitamina D', 
    dosage: '2000UI', 
    frequency: '24h', 
    active: true, 
    startDate: setMinutes(setHours(subDays(new Date(), 30), 12), 0), 
    color: '#f59e0b', // Amber
    stock: 60,
    instructions: 'Tomar com o almoço'
  },
  { 
    id: '5', 
    name: 'Ômega 3', 
    dosage: '1000mg', 
    frequency: '12h', 
    active: true, 
    startDate: setMinutes(setHours(subDays(new Date(), 15), 9), 0), 
    color: '#f43f5e', // Rose
    stock: 45
  }
];

// Generate logs for the last 30 days
const generateLogs = (): MedicationLog[] => {
  const logs: MedicationLog[] = [];
  
  // Last 30 days
  for (let i = 0; i < 30; i++) {
    const date = subDays(new Date(), i);
    
    // Losartana (Daily 8:00)
    // Check if medication was active at this date (started before)
    if (i < 60) {
      logs.push({
        id: `los-${i}`,
        medicationId: '1',
        scheduledTime: setMinutes(setHours(date, 8), 0),
        status: Math.random() > 0.1 ? 'taken' : (Math.random() > 0.5 ? 'missed' : 'skipped'),
        takenTime: Math.random() > 0.1 ? setMinutes(setHours(date, 8), Math.floor(Math.random() * 30)) : undefined
      });
    }

    // Metformina (Twice daily 8:00, 20:00)
    if (i < 45) {
      logs.push({
        id: `met-1-${i}`,
        medicationId: '2',
        scheduledTime: setMinutes(setHours(date, 8), 0),
        status: Math.random() > 0.05 ? 'taken' : 'missed',
        takenTime: Math.random() > 0.05 ? setMinutes(setHours(date, 8), 15) : undefined
      });
      logs.push({
        id: `met-2-${i}`,
        medicationId: '2',
        scheduledTime: setMinutes(setHours(date, 20), 0),
        status: Math.random() > 0.1 ? 'taken' : 'missed',
        takenTime: Math.random() > 0.1 ? setMinutes(setHours(date, 20), 30) : undefined
      });
    }

    // Simvastatina (Daily 22:00)
    if (i < 90) {
      logs.push({
        id: `sim-${i}`,
        medicationId: '3',
        scheduledTime: setMinutes(setHours(date, 22), 0),
        status: Math.random() > 0.02 ? 'taken' : 'skipped',
        takenTime: Math.random() > 0.02 ? setMinutes(setHours(date, 22), 10) : undefined
      });
    }
    
    // Vitamina D (Daily 12:00)
    if (i < 30) {
      logs.push({
        id: `vit-${i}`,
        medicationId: '4',
        scheduledTime: setMinutes(setHours(date, 12), 0),
        status: Math.random() > 0.05 ? 'taken' : 'taken',
        takenTime: setMinutes(setHours(date, 12), 45)
      });
    }

    // Omega 3 (Twice daily 9:00, 21:00) - Only if i < 15
    if (i < 15) {
       logs.push({
        id: `omega-1-${i}`,
        medicationId: '5',
        scheduledTime: setMinutes(setHours(date, 9), 0),
        status: Math.random() > 0.1 ? 'taken' : 'missed',
        takenTime: Math.random() > 0.1 ? setMinutes(setHours(date, 9), 10) : undefined
      });
      logs.push({
        id: `omega-2-${i}`,
        medicationId: '5',
        scheduledTime: setMinutes(setHours(date, 21), 0),
        status: Math.random() > 0.1 ? 'taken' : 'missed',
        takenTime: Math.random() > 0.1 ? setMinutes(setHours(date, 21), 15) : undefined
      });
    }
  }

  // Future logs (today + next 2 days)
  for (let i = 0; i < 3; i++) {
     const date = addDays(new Date(), i);
     // Similar schedule but mostly pending, except maybe some taken today
  }

  return logs.sort((a, b) => b.scheduledTime.getTime() - a.scheduledTime.getTime());
};

export const mockLogs = generateLogs();
