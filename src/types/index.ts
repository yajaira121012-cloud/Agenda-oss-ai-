export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  qualification?: string; // es. "Operatore Socio-Sanitario (OSS)", "OSS Domiciliare"
  department?: string; // es. "Assistenza Domiciliare Integrata (ADI)", "Territorio"
  phone?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export type PatientStatus = 'active' | 'inactive' | 'hospitalized' | 'archived';
export type Gender = 'M' | 'F' | 'other';

export interface DomiciliaryChecklist {
  hygiene_total?: boolean; // Igiene totale / bagno / spugnatura
  hygiene_intimate?: boolean; // Igiene intima
  pad_change?: boolean; // Cambio pannolone / presidio assorbente
  dressing?: boolean; // Vestizione e cura persona
  breakfast?: boolean; // Preparazione / somministrazione colazione / pasto
  hydration?: boolean; // Somministrazione liquidi / idratazione
  medication_assistance?: boolean; // Assistenza assunzione pastiglie / terapia
  vital_signs?: boolean; // Rilevazione parametri vitali
  mobilization?: boolean; // Mobilizzazione / messa in poltrona / deambulazione
  bed_making?: boolean; // Rifacimento letto e riordino
}

export interface Patient {
  id: string; // UUID
  first_name: string;
  last_name: string;
  birth_date: string; // YYYY-MM-DD
  gender: Gender;
  fiscal_code?: string; // Codice Fiscale dell'assistito (16 caratteri)
  internal_code?: string; // Codice interno
  status: PatientStatus;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  room_number?: string;
  bed_number?: string;

  // Domiciliary Care Configuration
  domiciliary_care_enabled?: boolean;
  visit_start_time?: string; // es. "07:00"
  visit_end_time?: string; // es. "09:00"
  visit_duration_hours?: number; // es. 2
  visit_days?: string[]; // es. ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"]
  floor_doorbell?: string; // es. "Piano 2, citofono 12 (Fam. Rossi)"
  interventions_checklist?: DomiciliaryChecklist;
  domiciliary_notes?: string; // Istruzioni specifiche di accesso e consegna
  
  // Contatto d'emergenza / Referente familiare
  emergency_contact_name?: string;
  emergency_contact_relation?: string; // Figlio/a, Coniuge, Tutore, Amministratore di sostegno
  emergency_contact_phone?: string;
  emergency_contact_fiscal_code?: string; // Codice Fiscale del parente / referente

  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export type ConditionType = 'pathology' | 'allergy' | 'intolerance' | 'surgery' | 'previous_history' | 'note';

export interface PatientCondition {
  id: string;
  patient_id: string;
  title: string;
  type: ConditionType;
  description?: string;
  is_active: boolean;
  diagnosed_year?: string;
  notes?: string;
  created_at?: string;
}

export type AidType = 'none' | 'cane' | 'walker' | 'wheelchair' | 'special_bed' | 'hoist' | 'other';

export interface PatientAid {
  id: string;
  patient_id: string;
  aid_type: AidType;
  custom_name?: string;
  is_current: boolean;
  notes?: string;
  created_at?: string;
}

export type HearingStatus = 'normal' | 'hypoacusis' | 'deafness' | 'other';
export type HearingAidStatus = 'none' | 'yes' | 'bilateral' | 'right' | 'left';
export type VisionStatus = 'normal' | 'reduced' | 'blindness' | 'glasses' | 'other';
export type DenturesStatus = 'none' | 'yes' | 'upper' | 'lower' | 'complete';

export interface PatientSensoryInfo {
  id: string;
  patient_id: string;
  hearing: HearingStatus;
  hearing_aid: HearingAidStatus;
  vision: VisionStatus;
  dentures: DenturesStatus;
  notes?: string;
  updated_at?: string;
}

export interface VitalSign {
  id: string;
  patient_id: string;
  recorded_at: string; // ISO string
  temperature?: number | null; // °C
  systolic_bp?: number | null; // mmHg (Max)
  diastolic_bp?: number | null; // mmHg (Min)
  heart_rate?: number | null; // bpm
  spo2?: number | null; // % SpO2
  respiratory_rate?: number | null; // atti/min
  weight?: number | null; // kg
  blood_glucose?: number | null; // mg/dL (DTX)
  notes?: string;
  recorded_by?: string; // User ID
  operator_name?: string;
  patient?: Patient;
  created_at?: string;
}

export type MealRelation = 'before' | 'during' | 'after' | 'independent';

export interface Medication {
  id: string;
  patient_id: string;
  drug_name: string;
  active_ingredient?: string;
  dosage: string;
  unit?: string; // cpr, gocce, fiala, cerotto, bustina, ml
  route?: string; // Orale, Sublinguale, Transdermico, Rettale, Inalatorio
  frequency: string; // 1 volta/die, 2 volte/die, al bisogno, ecc.
  timing_time?: string; // es. 08:00, 12:00, 20:00
  start_date?: string;
  end_date?: string;
  indication?: string;
  meal_relation: MealRelation;
  notes?: string;
  is_active: boolean;
  created_at?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'hydration';
export type FoodIntakeLevel = 'all' | 'almost_all' | 'half' | 'little' | 'refused';

export interface FoodRecord {
  id: string;
  patient_id: string;
  recorded_at: string; // ISO string
  meal_type: MealType;
  food_intake_level: FoodIntakeLevel;
  liquid_ml?: number | null;
  diet_type?: string; // Normale, Morbida, Frullata, Iposodica, Diabetica
  notes?: string;
  recorded_by?: string;
  operator_name?: string;
  created_at?: string;
}

export type DiaryCategory =
  | 'hygiene'
  | 'mobilization'
  | 'feeding'
  | 'hydration'
  | 'elimination'
  | 'vital_signs'
  | 'sleep'
  | 'behavior'
  | 'assistance'
  | 'other';

export type CareCategory = DiaryCategory;

export interface CareDiaryEntry {
  id: string;
  patient_id: string;
  recorded_at: string; // ISO string
  category: DiaryCategory;
  description: string;
  notes?: string;
  recorded_by?: string;
  operator_name?: string;
  patient?: Patient;
  created_at?: string;
}

export type AppointmentCategory =
  | 'medical_visit'
  | 'physiotherapy'
  | 'nursing_care'
  | 'exam'
  | 'assistance'
  | 'therapy'
  | 'other';

export type AppointmentType = AppointmentCategory;

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  patient_id?: string | null;
  patient_name?: string;
  title: string;
  appointment_date?: string; // YYYY-MM-DD
  start_time: string; // ISO or HH:mm
  end_time?: string; // ISO or HH:mm
  appointment_type?: AppointmentType;
  category?: AppointmentCategory;
  location?: string;
  doctor_name?: string;
  description?: string;
  notes?: string;
  status: AppointmentStatus;
  created_by?: string;
  patient?: Patient;
  created_at?: string;
}
