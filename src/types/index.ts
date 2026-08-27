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
export type MedicationStatus = 'active' | 'completed' | 'suspended';
export type AdministrationStatus = 'administered' | 'refused' | 'omitted' | 'delayed';

export interface Medication {
  id: string;
  patient_id: string;
  drug_name: string;
  active_ingredient?: string;
  aic_code?: string; // Codice AIC ufficiale AIFA (es. "024982012")
  dosage: string;
  unit?: string; // cpr, gocce, fiala, cerotto, bustina, ml, UI
  pharma_form?: string; // Compresse, Gocce orali, Soluzione iniettabile, Bustine, Cerotto transdermico, ecc.
  route?: string; // Orale, Sublinguale, Transdermico, Rettale, Inalatorio, Sottocutaneo
  frequency: string; // 1 volta/die, 2 volte/die, 3 volte/die, al bisogno, ecc.
  timing_time?: string; // es. 08:00, 14:00, 20:00
  scheduled_times?: string[]; // es. ["08:00", "14:00", "20:00"]
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  status?: MedicationStatus; // 'active' (in corso), 'completed' (terminata), 'suspended' (sospesa)
  status_reason?: string; // Motivo fine o sospensione (es. "Fine ciclo antibiotico", "Intolleranza gastrica")
  prescribed_by?: string; // Medico prescrittore (es. "Dott.ssa Rossi MMG")
  indication?: string;
  meal_relation: MealRelation;
  notes?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MedicationAdministration {
  id: string;
  medication_id: string;
  patient_id: string;
  drug_name: string;
  dosage?: string;
  scheduled_date: string; // YYYY-MM-DD
  scheduled_time: string; // HH:mm (es. 08:00, 14:00, 20:00)
  administered_at: string; // ISO string o orario effettivo
  status: AdministrationStatus; // 'administered' | 'refused' | 'omitted' | 'delayed'
  administered_by: string; // Nome operatore che ha somministrato (es. "Yajaira", "Marco")
  recorded_by: string; // Nome utente che ha registrato l'evento (es. "Yajaira")
  notes?: string;
  created_at?: string;
}

export interface MedicationImportReport {
  totalRows: number;
  inserted: number;
  updated: number;
  skipped: number;
  invalidRows: { rowNumber: number; aic?: string; drugName?: string; error: string; rawData?: string }[];
  importedAt: string;
  sourceName: string;
  patientId?: string;
}

export interface MedicationImportOptions {
  patientId?: string;
  defaultPatientId?: string;
  sourceName?: string;
  overrideExisting?: boolean;
  overwriteExisting?: boolean;
  deduplicateByAic?: boolean;
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

// ==============================================================================
// REGISTRO / MONITORAGGIO DELL'ALVO E SCARICHE (Bristol Stool Scale)
// ==============================================================================
export type BristolType = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type BowelAmount = 'scarsa' | 'normale' | 'abbondante' | 'tracce' | 'non_valutabile';
export type BowelColor =
  | 'marrone_normale'
  | 'scuro_ipercromico'
  | 'melena_nero'
  | 'chiaro_acoliche'
  | 'ematochezia_sangue'
  | 'verniciate'
  | 'altro';
export type BowelIntervention =
  | 'spontanea'
  | 'stimolo_comoda'
  | 'microclisma'
  | 'clisma'
  | 'supposta'
  | 'lassativo_orale'
  | 'svuotamento_manuale'
  | 'pannolone'
  | 'altro';
export type AbdominalState =
  | 'trattabile_morbido'
  | 'teso_globoso'
  | 'dolente'
  | 'meteorismo'
  | 'non_valutato';
export type DiuresisStatus =
  | 'presente_fisiologica'
  | 'scarsa_concentrata'
  | 'abbondante'
  | 'assente'
  | 'ematuria'
  | 'catetere_vescicale';

export interface BowelRecord {
  id: string;
  patient_id: string;
  recorded_at: string; // ISO string o timestamp
  evacuated: boolean; // true = scarica avvenuta, false = alvo chiuso / non evacuato
  bristol_type?: BristolType | null; // Scala di Bristol 1-7
  amount?: BowelAmount; // Quantità
  consistency_desc?: string; // Descrizione consistenza
  color?: BowelColor; // Colore / Aspetto
  intervention?: BowelIntervention; // Metodo / Ausilio
  diuresis?: DiuresisStatus; // Diuresi associata
  abdominal_state?: AbdominalState; // Esame palpatorio addome
  notes?: string; // Note OSS / osservazioni cliniche
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

// ==============================================================================
// VADEMECUM FARMACI ITALIANI (AIFA)
// ==============================================================================
export interface VademecumMedication {
  id: string; // UUID o ID interno
  trade_name: string; // Nome commerciale (es. "TACHIPIRINA", "CARDIOASPIRINA")
  active_ingredient?: string; // Principio attivo (es. "PARACETAMOLO", "ACIDO ACETILSALICILICO")
  aic_code: string; // Codice AIC ufficiale AIFA (es. "024982012") - Univoco
  pharma_form?: string; // Forma farmaceutica (es. "COMPRESSE", "GOCCE ORALI", "SCIROPPO")
  dosage?: string; // Dosaggio (es. "500 MG", "100 MG", "25 MG/ML")
  package_desc?: string; // Descrizione confezione (es. "30 COMPRESSE IN BLISTER")
  units_count?: string; // Numero unità (es. "30", "1 FLACONE 120ML")
  holder_company?: string; // Ditta titolare AIC (es. "AZIENDE CHIMICHE RIUNITE ANGELINI FRANCESCO", "BAYER S.P.A.")
  admin_route?: string; // Via di somministrazione (es. "ORALE", "RETTALE", "PARENTERALE", "TOPICA")
  atc_code?: string; // Codice Classificazione ATC (es. "N02BE01", "B01AC06")
  reimbursement_class?: string; // Classe rimborsabilità (es. "A", "A con Nota AIFA", "C", "C-nn", "H")
  prescription_regime?: string; // Regime di fornitura (es. "RR", "RNR", "OTC", "SOP", "OSP")
  marketing_status?: string; // Stato di commercializzazione (es. "In commercio", "Revocato", "Sospeso", "Carenza")
  official_notes?: string; // Note e note AIFA ufficiali collegate
  source?: string; // Fonte ufficiale (es. "AIFA - Agenzia Italiana del Farmaco (Open Data)")
  source_updated_at?: string; // Data aggiornamento della fonte
  created_at?: string;
  updated_at?: string;
}

export interface AifaImportReport {
  totalRows: number;
  inserted: number;
  updated: number;
  skipped: number;
  invalidRows: { rowNumber: number; aic?: string; error: string; rawData?: string }[];
  importedAt: string;
  sourceName: string;
}

// ==============================================================================
// CATETERE VESCICALE (GESTIONE & MONITORAGGIO DIURESI)
// ==============================================================================
export type CatheterType =
  | 'foley_2vie'
  | 'foley_3vie'
  | 'sovrapubico'
  | 'intermittenza'
  | 'condom_urocontrol'
  | 'altro';

export type CatheterMaterial =
  | 'silicone_100'
  | 'lattice_siliconato'
  | 'idrogel'
  | 'pvc'
  | 'altro';

export type CatheterUrineColor =
  | 'giallo_paglierino'
  | 'ipercromiche_scure'
  | 'ematuriche_rosso'
  | 'torbide_sedimento'
  | 'marsala_marroncine'
  | 'altro';

export type CatheterUrineAspect =
  | 'limpido'
  | 'torbido'
  | 'sedimento_flocculi'
  | 'coaguli_ematici'
  | 'odore_pungente';

export type CatheterBagType =
  | 'letto_valvola_antireflusso'
  | 'gamba_cosciale'
  | 'circuito_chiuso_standard'
  | 'sacca_graduata_urimeter';

export type CatheterPatencyStatus =
  | 'pervio_normale'
  | 'ostruito_spillamento'
  | 'trazione_anomala'
  | 'perdita_circuito';

export interface CatheterRecord {
  id: string;
  patient_id: string;
  recorded_at: string; // ISO string
  has_catheter: boolean; // Presenza attiva catetere
  catheter_type?: CatheterType;
  material?: CatheterMaterial;
  gauge_ch?: string; // es. 'Ch 14', 'Ch 16', 'Ch 18'
  balloon_ml?: number; // es. 10 ml
  insertion_date?: string; // YYYY-MM-DD
  next_replacement_date?: string; // YYYY-MM-DD
  last_replacement_date?: string; // YYYY-MM-DD
  diuresis_amount_ml?: number; // ml urine registrate (es. 1200 ml)
  diuresis_hours?: number; // ore di rilevazione (es. 12h, 24h, turno)
  urine_color?: CatheterUrineColor;
  urine_aspect?: CatheterUrineAspect;
  bag_emptied?: boolean;
  bag_replaced?: boolean;
  bag_type?: CatheterBagType;
  meatus_hygiene_done?: boolean;
  patency_check?: CatheterPatencyStatus;
  notes?: string;
  operator_name?: string;
  recorded_by?: string;
  created_at?: string;
}

// ==============================================================================
// CONTROLLO MEDICAZIONI, ARROSSAMENTI & LESIONI DA DECUBITO (LDD) - GUIDA OSS
// ==============================================================================
export type WoundType =
  | 'arrossamento_cute_integra' // Arrossamento / Eritema da pressione (cute integra)
  | 'arrossamento_macerazione_pannolone' // Macerazione / Dermatite da pannolone / Incontinenza (IAD)
  | 'arrossamento_sfregamento_pieghe' // Arrossamento da sfregamento / Intertrigine pieghe sottomammarie/inguinali
  | 'flittene_vescicola' // Flittene / Vescicola da pressione o ustione (integra o sbrigliata)
  | 'abrasione_escoriazione' // Abrasioni superficiali / Escoriazione da trauma lieve
  | 'ldd_decubito' // Lesione da Decubito (LDD)
  | 'ferita_chirurgica' // Ferita chirurgica con punti/graffette
  | 'ulcera_vascolare' // Ulcera vascolare / venosa / arteriosa
  | 'ustione' // Ustione termica o chimica
  | 'lacerazione_trauma' // Lacerazione cutanea / Skin tear
  | 'altro';

export type WoundAnatomicalSite =
  | 'sacro'
  | 'tallone_dx'
  | 'tallone_sx'
  | 'trocantere_dx'
  | 'trocantere_sx'
  | 'ischio'
  | 'malleolo'
  | 'gluteo'
  | 'pieghe_inguinali'
  | 'pieghe_sottomammarie'
  | 'dorso_scapola'
  | 'gomito'
  | 'occipite'
  | 'addome'
  | 'arto_inferiore'
  | 'arto_superiore'
  | 'altro';

export type WoundStage =
  | 'stadio_0_arrossamento_sbiancabile' // Arrossamento iniziale / Eritema sbiancabile al tocco (Cute integra)
  | 'stadio_1_eritema' // Stadio 1: Eritema fisso NON sbiancabile (Cute integra, calore/indurimento)
  | 'stadio_2_flittene' // Stadio 2: Flittene / Vescicola / Lesione parziale del derma (Superficiale)
  | 'stadio_3_sottocutaneo' // Stadio 3: Lesione a tutto spessore, sottocute visibile (⚠️ Competenza Infermiere/MMG)
  | 'stadio_4_muscolo_osso' // Stadio 4: Danno profondo muscolo/osso/tendini (⚠️ Competenza Infermiere/MMG)
  | 'non_stadiabile_escara' // Non stadiabile: Escara necrotica nera o slough spesso (⚠️ Competenza Infermiere/MMG)
  | 'in_guarigione_epitelizzazione'; // Fase di guarigione / Epitelizzazione

export type WoundPerilesionalSkin =
  | 'integra'
  | 'eritematosa'
  | 'macerata'
  | 'disidratata_squamosa'
  | 'edematosa';

export type WoundExudateAmount =
  | 'assente_asciutta'
  | 'scarso'
  | 'moderato'
  | 'abbondante'
  | 'molto_abbondante';

export type WoundExudateType =
  | 'sieroso'
  | 'siero_ematico'
  | 'ematico'
  | 'purulento_maleodorante';

export type WoundBedType =
  | 'granulazione_rosso'
  | 'fibrina_slough_giallo'
  | 'necrosi_escara_nera'
  | 'epitelizzazione_rosa'
  | 'cute_arrossata_integra';

export type WoundCleansingSolution =
  | 'fisiologica_09'
  | 'ringer_lattato'
  | 'acqua_sterile'
  | 'clorexidina_acquosa'
  | 'detergente_lenitivo_ph_neutro'
  | 'iodopovidone';

export type DressingFrequency =
  | 'giornaliera'
  | 'giorni_alterni'
  | 'ogni_3_giorni'
  | 'settimanale'
  | 'ad_ogni_cambio_pannolone'
  | 'al_bisogno';

export interface WoundDressingRecord {
  id: string;
  patient_id: string;
  recorded_at: string; // ISO string
  wound_type: WoundType;
  anatomical_site: WoundAnatomicalSite;
  custom_site_desc?: string;
  stage: WoundStage;
  dimensions_cm?: string; // es. "3 x 2 cm"
  depth_mm?: string; // es. "Superficiale" o "5 mm"
  wound_bed?: WoundBedType;
  perilesional_skin?: WoundPerilesionalSkin;
  exudate_amount?: WoundExudateAmount;
  exudate_type?: WoundExudateType;
  cleansing_solution?: WoundCleansingSolution;
  dressing_applied: string; // es. "Connettivina garze sterili", "Pasta ossido di zinco", "Idrocolloide sottile"
  secondary_dressing?: string;
  dressing_frequency?: DressingFrequency;
  last_dressing_date?: string; // YYYY-MM-DD
  next_dressing_date?: string; // YYYY-MM-DD
  pain_scale?: number; // 0 - 10
  performed_action?: 'medicazione_completa' | 'controllo_ispettivo' | 'cambio_fissaggio' | 'rimozione_punti' | 'applicazione_crema_barriera' | 'segnalazione_infermiere';
  competence_status?: 'gestibile_da_oss' | 'avvisare_infermiere_mmg' | 'in_collaborazione';
  notes?: string;
  operator_name?: string;
  recorded_by?: string;
  created_at?: string;
}


