import {
  Patient,
  PatientCondition,
  PatientAid,
  PatientSensoryInfo,
  VitalSign,
  CareDiaryEntry,
  Appointment,
  Medication,
  FoodRecord,
} from '../types';

const STORAGE_PREFIX = 'agenda_oss_local_';

const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-001-mario-rossi',
    first_name: 'Giuseppe',
    last_name: 'Ferrari',
    birth_date: '1942-05-14',
    gender: 'M',
    fiscal_code: 'FRRGPP42E14F205K',
    internal_code: 'OSS-001',
    status: 'active',
    phone: '+39 02 8976541',
    address: 'Via dei Mille 12, Milano',
    domiciliary_care_enabled: true,
    visit_start_time: '07:00',
    visit_end_time: '09:00',
    visit_duration_hours: 2,
    visit_days: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
    floor_doorbell: 'Piano 2° - Scala B - Citofono 14 (Ferrari/Rossi)',
    interventions_checklist: {
      hygiene_total: true,
      hygiene_intimate: true,
      pad_change: true,
      dressing: true,
      breakfast: true,
      hydration: true,
      medication_assistance: true,
      vital_signs: true,
      mobilization: true,
      bed_making: true,
    },
    domiciliary_notes: 'Accesso mattutino ore 07:00. Eseguire igiene totale a letto e spugnatura, cambio presidio assorbente, vestizione, preparazione colazione (latte scremato e biscotti), assistenza per pastiglie della pressione, rilevazione parametri (PA e glicemia).',
    notes: 'Paziente collaborante. Necessita di assistenza nella deambulazione e alzata in poltrona.',
    emergency_contact_name: 'Laura Ferrari',
    emergency_contact_relation: 'Figlia',
    emergency_contact_phone: '+39 347 1234567',
    emergency_contact_fiscal_code: 'FRRLRA72T54F205Z',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-002-maria-bianchi',
    first_name: 'Maria Teresa',
    last_name: 'Bianchi',
    birth_date: '1938-11-20',
    gender: 'F',
    fiscal_code: 'BNCMTR38S60F205Y',
    internal_code: 'OSS-002',
    status: 'active',
    phone: '+39 02 4589123',
    address: 'Corso Buenos Aires 45, Milano',
    domiciliary_care_enabled: true,
    visit_start_time: '09:30',
    visit_end_time: '11:00',
    visit_duration_hours: 1.5,
    visit_days: ['Lun', 'Mer', 'Ven'],
    floor_doorbell: 'Piano 3° - Int. 8 - Citofono Bianchi',
    interventions_checklist: {
      hygiene_total: false,
      hygiene_intimate: true,
      pad_change: true,
      dressing: true,
      breakfast: false,
      hydration: true,
      medication_assistance: true,
      vital_signs: true,
      mobilization: true,
      bed_making: true,
    },
    domiciliary_notes: 'Igiene personale, controllo apparecchio acustico, supporto idratazione e controllo pastiglie cardiologiche.',
    notes: 'Dieta iposodica. Portatrice di apparecchio acustico bilaterale.',
    emergency_contact_name: 'Roberto Bianchi',
    emergency_contact_relation: 'Figlio',
    emergency_contact_phone: '+39 338 9876543',
    emergency_contact_fiscal_code: 'BNCRRT68H12F205A',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-003-antonio-esposito',
    first_name: 'Antonio',
    last_name: 'Esposito',
    birth_date: '1949-03-08',
    gender: 'M',
    fiscal_code: 'SPSNTN49C08F839J',
    internal_code: 'OSS-003',
    status: 'active',
    phone: '+39 335 4455667',
    address: 'Via Dante 18, Sesto San Giovanni',
    domiciliary_care_enabled: true,
    visit_start_time: '11:30',
    visit_end_time: '13:00',
    visit_duration_hours: 1.5,
    visit_days: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven'],
    floor_doorbell: 'Piano Terra - Citofono Esposito',
    interventions_checklist: {
      hygiene_total: true,
      hygiene_intimate: true,
      pad_change: true,
      dressing: true,
      breakfast: false,
      hydration: true,
      medication_assistance: true,
      vital_signs: true,
      mobilization: true,
      bed_making: true,
    },
    domiciliary_notes: 'Assistenza per il pranzo, somministrazione terapia prescritta e rilevazione parametri vitali prima del pasto.',
    notes: 'In convalescenza. Monitorare idratazione e pressione arteriosa.',
    emergency_contact_name: 'Carmela Esposito',
    emergency_contact_relation: 'Coniuge',
    emergency_contact_phone: '+39 335 4455667',
    emergency_contact_fiscal_code: 'SPSCML52A48F839W',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function getStored<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.error('Error reading localStorage for key ' + key, err);
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error('Error writing localStorage for key ' + key, err);
  }
}

// ----------------------------------------------------------------------
// PATIENTS
// ----------------------------------------------------------------------
export const localDb = {
  getPatients(): Patient[] {
    const data = getStored<Patient[]>('patients', []);
    if (!data || data.length === 0) {
      setStored('patients', INITIAL_PATIENTS);
      return INITIAL_PATIENTS;
    }
    return data;
  },

  getPatientById(id: string): Patient | null {
    const list = this.getPatients();
    return list.find((p) => p.id === id) || null;
  },

  savePatient(patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Patient {
    const list = this.getPatients();
    const now = new Date().toISOString();
    const id = patientData.id || 'pat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);

    const existingIdx = list.findIndex((p) => p.id === id);
    if (existingIdx >= 0) {
      const updated: Patient = {
        ...list[existingIdx],
        ...patientData,
        id,
        updated_at: now,
      };
      list[existingIdx] = updated;
      setStored('patients', list);
      return updated;
    } else {
      const created: Patient = {
        ...patientData,
        id,
        created_at: now,
        updated_at: now,
      };
      list.unshift(created);
      setStored('patients', list);
      return created;
    }
  },

  updatePatient(id: string, updates: Partial<Patient>): Patient | null {
    const list = this.getPatients();
    const existingIdx = list.findIndex((p) => p.id === id);
    if (existingIdx < 0) return null;

    const updated: Patient = {
      ...list[existingIdx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    list[existingIdx] = updated;
    setStored('patients', list);
    return updated;
  },

  deletePatient(id: string): boolean {
    let list = this.getPatients();
    list = list.filter((p) => p.id !== id);
    setStored('patients', list);
    return true;
  },

  archivePatient(id: string): boolean {
    return !!this.updatePatient(id, { status: 'archived' });
  },

  // ----------------------------------------------------------------------
  // CONDITIONS & ANAMNESI
  // ----------------------------------------------------------------------
  getConditions(patientId: string): PatientCondition[] {
    const all = getStored<PatientCondition[]>('conditions', []);
    return all.filter((c) => c.patient_id === patientId);
  },

  addCondition(condition: Omit<PatientCondition, 'id' | 'created_at'>): PatientCondition {
    const all = getStored<PatientCondition[]>('conditions', []);
    const created: PatientCondition = {
      ...condition,
      id: 'cond-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      created_at: new Date().toISOString(),
    };
    all.unshift(created);
    setStored('conditions', all);
    return created;
  },

  deleteCondition(id: string): boolean {
    let all = getStored<PatientCondition[]>('conditions', []);
    all = all.filter((c) => c.id !== id);
    setStored('conditions', all);
    return true;
  },

  // ----------------------------------------------------------------------
  // AIDS & MOBILITY
  // ----------------------------------------------------------------------
  getAids(patientId: string): PatientAid[] {
    const all = getStored<PatientAid[]>('aids', []);
    return all.filter((a) => a.patient_id === patientId);
  },

  addAid(aid: Omit<PatientAid, 'id' | 'created_at'>): PatientAid {
    const all = getStored<PatientAid[]>('aids', []);
    const created: PatientAid = {
      ...aid,
      id: 'aid-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      created_at: new Date().toISOString(),
    };
    all.unshift(created);
    setStored('aids', all);
    return created;
  },

  deleteAid(id: string): boolean {
    let all = getStored<PatientAid[]>('aids', []);
    all = all.filter((a) => a.id !== id);
    setStored('aids', all);
    return true;
  },

  // ----------------------------------------------------------------------
  // SENSORY INFO
  // ----------------------------------------------------------------------
  getSensoryInfo(patientId: string): PatientSensoryInfo | null {
    const all = getStored<PatientSensoryInfo[]>('sensory', []);
    return all.find((s) => s.patient_id === patientId) || null;
  },

  upsertSensoryInfo(info: Omit<PatientSensoryInfo, 'id' | 'updated_at'> & { id?: string }): PatientSensoryInfo {
    const all = getStored<PatientSensoryInfo[]>('sensory', []);
    const existingIdx = all.findIndex((s) => s.patient_id === info.patient_id);
    const now = new Date().toISOString();
    const id = info.id || 'sens-' + Date.now();

    if (existingIdx >= 0) {
      const updated: PatientSensoryInfo = {
        ...all[existingIdx],
        ...info,
        id,
        updated_at: now,
      };
      all[existingIdx] = updated;
      setStored('sensory', all);
      return updated;
    } else {
      const created: PatientSensoryInfo = {
        ...info,
        id,
        updated_at: now,
      };
      all.push(created);
      setStored('sensory', all);
      return created;
    }
  },

  // ----------------------------------------------------------------------
  // VITALS SIGNS
  // ----------------------------------------------------------------------
  getVitals(patientId?: string): VitalSign[] {
    const all = getStored<VitalSign[]>('vitals', []);
    if (patientId) {
      return all.filter((v) => v.patient_id === patientId);
    }
    return all;
  },

  addVital(vital: Omit<VitalSign, 'id' | 'created_at'>): VitalSign {
    const all = getStored<VitalSign[]>('vitals', []);
    const created: VitalSign = {
      ...vital,
      id: 'vital-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      created_at: new Date().toISOString(),
    };
    all.unshift(created);
    setStored('vitals', all);
    return created;
  },

  deleteVital(id: string): boolean {
    let all = getStored<VitalSign[]>('vitals', []);
    all = all.filter((v) => v.id !== id);
    setStored('vitals', all);
    return true;
  },

  // ----------------------------------------------------------------------
  // CARE DIARY
  // ----------------------------------------------------------------------
  getDiary(patientId?: string): CareDiaryEntry[] {
    const all = getStored<CareDiaryEntry[]>('diary', []);
    if (patientId) {
      return all.filter((d) => d.patient_id === patientId);
    }
    return all;
  },

  addDiary(entry: Omit<CareDiaryEntry, 'id' | 'created_at'>): CareDiaryEntry {
    const all = getStored<CareDiaryEntry[]>('diary', []);
    const created: CareDiaryEntry = {
      ...entry,
      id: 'diary-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      created_at: new Date().toISOString(),
    };
    all.unshift(created);
    setStored('diary', all);
    return created;
  },

  deleteDiary(id: string): boolean {
    let all = getStored<CareDiaryEntry[]>('diary', []);
    all = all.filter((d) => d.id !== id);
    setStored('diary', all);
    return true;
  },

  // ----------------------------------------------------------------------
  // MEDICATIONS
  // ----------------------------------------------------------------------
  getMedications(patientId: string): Medication[] {
    const all = getStored<Medication[]>('medications', []);
    return all.filter((m) => m.patient_id === patientId);
  },

  addMedication(med: Omit<Medication, 'id' | 'created_at'>): Medication {
    const all = getStored<Medication[]>('medications', []);
    const created: Medication = {
      ...med,
      id: 'med-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      created_at: new Date().toISOString(),
    };
    all.unshift(created);
    setStored('medications', all);
    return created;
  },

  deleteMedication(id: string): boolean {
    let all = getStored<Medication[]>('medications', []);
    all = all.filter((m) => m.id !== id);
    setStored('medications', all);
    return true;
  },

  // ----------------------------------------------------------------------
  // FOOD & HYDRATION
  // ----------------------------------------------------------------------
  getFoodRecords(patientId: string): FoodRecord[] {
    const all = getStored<FoodRecord[]>('food', []);
    return all.filter((f) => f.patient_id === patientId);
  },

  addFoodRecord(food: Omit<FoodRecord, 'id' | 'created_at'>): FoodRecord {
    const all = getStored<FoodRecord[]>('food', []);
    const created: FoodRecord = {
      ...food,
      id: 'food-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      created_at: new Date().toISOString(),
    };
    all.unshift(created);
    setStored('food', all);
    return created;
  },

  deleteFoodRecord(id: string): boolean {
    let all = getStored<FoodRecord[]>('food', []);
    all = all.filter((f) => f.id !== id);
    setStored('food', all);
    return true;
  },

  // ----------------------------------------------------------------------
  // APPOINTMENTS & AGENDA
  // ----------------------------------------------------------------------
  getAppointments(): Appointment[] {
    return getStored<Appointment[]>('appointments', []);
  },

  addAppointment(app: Omit<Appointment, 'id' | 'created_at'>): Appointment {
    const all = getStored<Appointment[]>('appointments', []);
    const created: Appointment = {
      ...app,
      id: 'app-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      created_at: new Date().toISOString(),
    };
    all.unshift(created);
    setStored('appointments', all);
    return created;
  },

  deleteAppointment(id: string): boolean {
    let all = getStored<Appointment[]>('appointments', []);
    all = all.filter((a) => a.id !== id);
    setStored('appointments', all);
    return true;
  },
};
