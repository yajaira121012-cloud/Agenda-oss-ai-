import {
  Patient,
  PatientCondition,
  PatientAid,
  PatientSensoryInfo,
  VitalSign,
  CareDiaryEntry,
  Appointment,
  Medication,
  MedicationAdministration,
  FoodRecord,
  VademecumMedication,
  BowelRecord,
  CatheterRecord,
  WoundDressingRecord,
} from '../types';
import { AIFA_OFFICIAL_MEDICATIONS } from '../data/aifaOfficialMedications';

const STORAGE_PREFIX = 'agenda_oss_local_';

const INITIAL_MEDICATIONS: Medication[] = [
  {
    id: 'med-001-tachipirina-1000',
    patient_id: 'pat-001-mario-rossi',
    drug_name: 'Tachipirina 1000 mg',
    active_ingredient: 'Paracetamolo',
    aic_code: '024982012',
    dosage: '1',
    unit: 'cpr',
    pharma_form: 'Compresse',
    route: 'Orale',
    frequency: '3 volte al giorno (ogni 8 ore)',
    timing_time: '08:00 – 14:00 – 20:00',
    scheduled_times: ['08:00', '14:00', '20:00'],
    start_date: '2026-08-25',
    end_date: '2026-08-30',
    status: 'active',
    is_active: true,
    indication: 'Febbre e dolore osteoarticolare diffuso',
    meal_relation: 'after',
    notes: 'Assumere a stomaco pieno con abbondante acqua.',
    prescribed_by: 'Dott.ssa Laura Fontana (MMG)',
    created_at: '2026-08-25T07:30:00.000Z',
    updated_at: '2026-08-25T07:30:00.000Z',
  },
  {
    id: 'med-002-bisoprololo-5',
    patient_id: 'pat-001-mario-rossi',
    drug_name: 'Bisoprololo 5 mg',
    active_ingredient: 'Bisoprololo fumarato',
    aic_code: '034567023',
    dosage: '1',
    unit: 'cpr',
    pharma_form: 'Compresse rivestite con film',
    route: 'Orale',
    frequency: '1 volta al giorno al mattino',
    timing_time: '08:00',
    scheduled_times: ['08:00'],
    start_date: '2026-01-10',
    status: 'active',
    is_active: true,
    indication: 'Ipertensione arteriosa / Controllo frequenza cardiaca',
    meal_relation: 'before',
    notes: 'Rilevare sempre frequenza cardiaca e pressione arteriosa prima della somministrazione.',
    prescribed_by: 'Dott. M. Conti (Cardiologo)',
    created_at: '2026-01-10T08:00:00.000Z',
    updated_at: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'med-003-cardioaspirina-100',
    patient_id: 'pat-001-mario-rossi',
    drug_name: 'Cardioaspirina 100 mg',
    active_ingredient: 'Acido acetilsalicilico',
    aic_code: '028258019',
    dosage: '1',
    unit: 'cpr',
    pharma_form: 'Compresse gastroresistenti',
    route: 'Orale',
    frequency: '1 volta al giorno dopo pranzo',
    timing_time: '12:00',
    scheduled_times: ['12:00'],
    start_date: '2025-06-15',
    status: 'active',
    is_active: true,
    indication: 'Prevenzione secondaria cardio-vascolare',
    meal_relation: 'during',
    notes: 'Deglutire intera durante il pasto. Non frantumare la compressa.',
    prescribed_by: 'Dott. M. Conti (Cardiologo)',
    created_at: '2025-06-15T12:00:00.000Z',
    updated_at: '2025-06-15T12:00:00.000Z',
  },
  {
    id: 'med-004-amoxicillina-875',
    patient_id: 'pat-001-mario-rossi',
    drug_name: 'Amoxicillina 875 mg + acido clavulanico',
    active_ingredient: 'Amoxicillina triidrato / Potassio clavulanato',
    aic_code: '026089050',
    dosage: '1',
    unit: 'cpr',
    pharma_form: 'Compresse rivestite',
    route: 'Orale',
    frequency: '2 volte al giorno (ogni 12 ore)',
    timing_time: '08:00 – 20:00',
    scheduled_times: ['08:00', '20:00'],
    start_date: '2026-08-10',
    end_date: '2026-08-17',
    status: 'completed',
    is_active: false,
    status_reason: 'Ciclo antibiotico di 7 giorni completato regolarmente con risoluzione sintomatica.',
    indication: 'Infezione batterica vie aeree superiori',
    meal_relation: 'during',
    notes: 'Assumere all inizio dei pasti principali.',
    prescribed_by: 'Dott.ssa Laura Fontana (MMG)',
    created_at: '2026-08-10T08:00:00.000Z',
    updated_at: '2026-08-17T20:30:00.000Z',
  },
  {
    id: 'med-005-ibuprofene-600',
    patient_id: 'pat-001-mario-rossi',
    drug_name: 'Ibuprofene 600 mg',
    active_ingredient: 'Ibuprofene',
    aic_code: '034789012',
    dosage: '1',
    unit: 'bustina',
    pharma_form: 'Granulato per soluzione orale',
    route: 'Orale',
    frequency: '1 bustina dopo pranzo al bisogno',
    timing_time: '14:00',
    scheduled_times: ['14:00'],
    start_date: '2026-08-02',
    end_date: '2026-08-05',
    status: 'suspended',
    is_active: false,
    status_reason: 'Sospeso dal Medico Curante per pirosi gastrica e dolore epigastrico insorto al 3° giorno. Sostituito con Paracetamolo.',
    indication: 'Dolore lombosacrale acuto post-mobilizzazione',
    meal_relation: 'after',
    notes: 'Sospensione immediata concordata col medico. Evitare FANS orali.',
    prescribed_by: 'Dott.ssa Laura Fontana (MMG)',
    created_at: '2026-08-02T14:00:00.000Z',
    updated_at: '2026-08-05T15:00:00.000Z',
  },
];

const INITIAL_ADMINISTRATIONS: MedicationAdministration[] = [
  {
    id: 'adm-001',
    medication_id: 'med-001-tachipirina-1000',
    patient_id: 'pat-001-mario-rossi',
    drug_name: 'Tachipirina 1000 mg',
    dosage: '1 cpr',
    scheduled_date: '2026-08-25',
    scheduled_time: '08:00',
    administered_at: '2026-08-25T08:05:00.000Z',
    status: 'administered',
    administered_by: 'Yajaira',
    recorded_by: 'Yajaira',
    notes: 'Somministrata a colazione, deglutita senza difficoltà con acqua.',
    created_at: '2026-08-25T08:06:00.000Z',
  },
  {
    id: 'adm-002',
    medication_id: 'med-001-tachipirina-1000',
    patient_id: 'pat-001-mario-rossi',
    drug_name: 'Tachipirina 1000 mg',
    dosage: '1 cpr',
    scheduled_date: '2026-08-25',
    scheduled_time: '14:00',
    administered_at: '2026-08-25T14:10:00.000Z',
    status: 'administered',
    administered_by: 'Marco',
    recorded_by: 'Yajaira',
    notes: 'Somministrazione pomeridiana effettuata dall operatore Marco durante il passaggio di consegne.',
    created_at: '2026-08-25T14:15:00.000Z',
  },
  {
    id: 'adm-003',
    medication_id: 'med-001-tachipirina-1000',
    patient_id: 'pat-001-mario-rossi',
    drug_name: 'Tachipirina 1000 mg',
    dosage: '1 cpr',
    scheduled_date: '2026-08-25',
    scheduled_time: '20:00',
    administered_at: '2026-08-25T20:00:00.000Z',
    status: 'administered',
    administered_by: 'Yajaira',
    recorded_by: 'Yajaira',
    notes: 'Assunta regolarmente a cena.',
    created_at: '2026-08-25T20:02:00.000Z',
  },
  {
    id: 'adm-004',
    medication_id: 'med-001-tachipirina-1000',
    patient_id: 'pat-001-mario-rossi',
    drug_name: 'Tachipirina 1000 mg',
    dosage: '1 cpr',
    scheduled_date: '2026-08-26',
    scheduled_time: '08:00',
    administered_at: '2026-08-26T08:00:00.000Z',
    status: 'administered',
    administered_by: 'Yajaira',
    recorded_by: 'Yajaira',
    notes: 'Paziente afebbrile, assunta regolarmente.',
    created_at: '2026-08-26T08:03:00.000Z',
  },
  {
    id: 'adm-005',
    medication_id: 'med-001-tachipirina-1000',
    patient_id: 'pat-001-mario-rossi',
    drug_name: 'Tachipirina 1000 mg',
    dosage: '1 cpr',
    scheduled_date: '2026-08-26',
    scheduled_time: '14:00',
    administered_at: '2026-08-26T14:15:00.000Z',
    status: 'refused',
    administered_by: '—',
    recorded_by: 'Yajaira',
    notes: 'Paziente assopito con lieve senso di nausea post-prandiale; ha espressamente rifiutato la compressa. Avvisato il coordinatore.',
    created_at: '2026-08-26T14:20:00.000Z',
  },
  {
    id: 'adm-006',
    medication_id: 'med-001-tachipirina-1000',
    patient_id: 'pat-001-mario-rossi',
    drug_name: 'Tachipirina 1000 mg',
    dosage: '1 cpr',
    scheduled_date: '2026-08-26',
    scheduled_time: '20:00',
    administered_at: '2026-08-26T20:05:00.000Z',
    status: 'administered',
    administered_by: 'Yajaira',
    recorded_by: 'Yajaira',
    notes: 'Ripresa corretta assunzione a cena.',
    created_at: '2026-08-26T20:08:00.000Z',
  },
  {
    id: 'adm-007',
    medication_id: 'med-001-tachipirina-1000',
    patient_id: 'pat-001-mario-rossi',
    drug_name: 'Tachipirina 1000 mg',
    dosage: '1 cpr',
    scheduled_date: '2026-08-27',
    scheduled_time: '08:00',
    administered_at: '2026-08-27T08:00:00.000Z',
    status: 'administered',
    administered_by: 'Yajaira',
    recorded_by: 'Yajaira',
    notes: 'Assunta a colazione.',
    created_at: '2026-08-27T08:05:00.000Z',
  },
  {
    id: 'adm-008',
    medication_id: 'med-002-bisoprololo-5',
    patient_id: 'pat-001-mario-rossi',
    drug_name: 'Bisoprololo 5 mg',
    dosage: '1 cpr',
    scheduled_date: '2026-08-27',
    scheduled_time: '08:00',
    administered_at: '2026-08-27T08:00:00.000Z',
    status: 'administered',
    administered_by: 'Yajaira',
    recorded_by: 'Yajaira',
    notes: 'PA 125/75 mmHg, FC 68 bpm. Somministrata regolarmente.',
    created_at: '2026-08-27T08:05:00.000Z',
  },
  {
    id: 'adm-009',
    medication_id: 'med-004-amoxicillina-875',
    patient_id: 'pat-001-mario-rossi',
    drug_name: 'Amoxicillina 875 mg + acido clavulanico',
    dosage: '1 cpr',
    scheduled_date: '2026-08-17',
    scheduled_time: '20:00',
    administered_at: '2026-08-17T20:00:00.000Z',
    status: 'administered',
    administered_by: 'Yajaira',
    recorded_by: 'Yajaira',
    notes: 'Ultima somministrazione del ciclo di 7 giorni completata.',
    created_at: '2026-08-17T20:05:00.000Z',
  },
  {
    id: 'adm-010',
    medication_id: 'med-005-ibuprofene-600',
    patient_id: 'pat-001-mario-rossi',
    drug_name: 'Ibuprofene 600 mg',
    dosage: '1 bustina',
    scheduled_date: '2026-08-05',
    scheduled_time: '14:00',
    administered_at: '2026-08-05T14:30:00.000Z',
    status: 'omitted',
    administered_by: '—',
    recorded_by: 'Yajaira',
    notes: 'Omissa su disposizione del medico per sospensione terapia per bruciore di stomaco.',
    created_at: '2026-08-05T14:35:00.000Z',
  },
];

const INITIAL_BOWEL_RECORDS: BowelRecord[] = [
  {
    id: 'bowel-001',
    patient_id: 'pat-001-mario-rossi',
    recorded_at: '2026-08-27T08:30:00.000Z',
    evacuated: true,
    bristol_type: 4,
    amount: 'normale',
    consistency_desc: 'Formata, liscia e morbida (Ideale)',
    color: 'marrone_normale',
    intervention: 'spontanea',
    diuresis: 'presente_fisiologica',
    abdominal_state: 'trattabile_morbido',
    notes: 'Evacuazione spontanea su comoda. Nessun dolore riferito.',
    operator_name: 'Yajaira (OSS)',
    recorded_by: 'Yajaira',
    created_at: '2026-08-27T08:35:00.000Z',
  },
  {
    id: 'bowel-002',
    patient_id: 'pat-001-mario-rossi',
    recorded_at: '2026-08-26T09:15:00.000Z',
    evacuated: true,
    bristol_type: 3,
    amount: 'normale',
    consistency_desc: 'Cilindrica con crepe superficiali',
    color: 'marrone_normale',
    intervention: 'spontanea',
    diuresis: 'presente_fisiologica',
    abdominal_state: 'trattabile_morbido',
    notes: 'Scarica fisiologica mattutina regolare.',
    operator_name: 'Yajaira (OSS)',
    recorded_by: 'Yajaira',
    created_at: '2026-08-26T09:20:00.000Z',
  },
  {
    id: 'bowel-003',
    patient_id: 'pat-001-mario-rossi',
    recorded_at: '2026-08-24T18:00:00.000Z',
    evacuated: false,
    bristol_type: null,
    amount: 'non_valutabile',
    consistency_desc: 'Nessuna evacuazione nella giornata',
    abdominal_state: 'teso_globoso',
    diuresis: 'presente_fisiologica',
    notes: 'Alvo chiuso da 24h. Riferito lieve senso di gonfiore e meteorismo.',
    operator_name: 'Yajaira (OSS)',
    recorded_by: 'Yajaira',
    created_at: '2026-08-24T18:05:00.000Z',
  },
  {
    id: 'bowel-004',
    patient_id: 'pat-001-mario-rossi',
    recorded_at: '2026-08-23T10:00:00.000Z',
    evacuated: true,
    bristol_type: 2,
    amount: 'abbondante',
    consistency_desc: 'Formata a pezzi grumosi (Stipsi lieve)',
    color: 'marrone_normale',
    intervention: 'microclisma',
    diuresis: 'presente_fisiologica',
    abdominal_state: 'trattabile_morbido',
    notes: 'Evacuazione efficace dopo somministrazione di microclisma di glicerina.',
    operator_name: 'Yajaira (OSS)',
    recorded_by: 'Yajaira',
    created_at: '2026-08-23T10:30:00.000Z',
  },
  {
    id: 'bowel-005',
    patient_id: 'pat-002-maria-bianchi',
    recorded_at: '2026-08-27T10:00:00.000Z',
    evacuated: true,
    bristol_type: 4,
    amount: 'normale',
    consistency_desc: 'Formata morbida',
    color: 'marrone_normale',
    intervention: 'stimolo_comoda',
    diuresis: 'presente_fisiologica',
    abdominal_state: 'trattabile_morbido',
    notes: 'Assistita alla comoda con deambulatore. Scarica regolare.',
    operator_name: 'Yajaira (OSS)',
    recorded_by: 'Yajaira',
    created_at: '2026-08-27T10:15:00.000Z',
  },
  {
    id: 'bowel-006',
    patient_id: 'pat-003-antonio-esposito',
    recorded_at: '2026-08-26T12:00:00.000Z',
    evacuated: true,
    bristol_type: 5,
    amount: 'scarsa',
    consistency_desc: 'Pezzi morbidi con bordi netti',
    color: 'marrone_normale',
    intervention: 'pannolone',
    diuresis: 'presente_fisiologica',
    abdominal_state: 'trattabile_morbido',
    notes: 'Scarica rilevata al cambio presidio di mezzogiorno. Igiene intima eseguita.',
    operator_name: 'Yajaira (OSS)',
    recorded_by: 'Yajaira',
    created_at: '2026-08-26T12:20:00.000Z',
  },
];

const INITIAL_CATHETER_RECORDS: CatheterRecord[] = [
  {
    id: 'cath-001',
    patient_id: 'pat-001-mario-rossi',
    recorded_at: '2026-08-27T08:30:00.000Z',
    has_catheter: true,
    catheter_type: 'foley_2vie',
    material: 'silicone_100',
    gauge_ch: 'Ch 16',
    balloon_ml: 10,
    insertion_date: '2026-08-10',
    last_replacement_date: '2026-08-10',
    next_replacement_date: '2026-09-10',
    diuresis_amount_ml: 1400,
    diuresis_hours: 24,
    urine_color: 'giallo_paglierino',
    urine_aspect: 'limpido',
    bag_emptied: true,
    bag_replaced: false,
    bag_type: 'letto_valvola_antireflusso',
    meatus_hygiene_done: true,
    patency_check: 'pervio_normale',
    notes: 'Catetere pervio a caduta libera. Sacca svuotata (1400 ml nelle 24h), urine normocromiche e limpide. Igiene e disinfezione meato uretrale con soluzione acquosa eseguita.',
    operator_name: 'Yajaira (OSS)',
    recorded_by: 'Yajaira',
    created_at: '2026-08-27T08:35:00.000Z',
  },
  {
    id: 'cath-002',
    patient_id: 'pat-001-mario-rossi',
    recorded_at: '2026-08-26T08:00:00.000Z',
    has_catheter: true,
    catheter_type: 'foley_2vie',
    material: 'silicone_100',
    gauge_ch: 'Ch 16',
    balloon_ml: 10,
    insertion_date: '2026-08-10',
    last_replacement_date: '2026-08-10',
    next_replacement_date: '2026-09-10',
    diuresis_amount_ml: 1250,
    diuresis_hours: 24,
    urine_color: 'giallo_paglierino',
    urine_aspect: 'limpido',
    bag_emptied: true,
    bag_replaced: false,
    bag_type: 'letto_valvola_antireflusso',
    meatus_hygiene_done: true,
    patency_check: 'pervio_normale',
    notes: 'Controllo diuresi 24h regolare. Nessuna trazione o piega sul raccordo.',
    operator_name: 'Yajaira (OSS)',
    recorded_by: 'Yajaira',
    created_at: '2026-08-26T08:05:00.000Z',
  },
];

const INITIAL_WOUND_RECORDS: WoundDressingRecord[] = [
  {
    id: 'wnd-001',
    patient_id: 'pat-001-mario-rossi',
    recorded_at: '2026-08-27T08:45:00.000Z',
    wound_type: 'flittene_vescicola',
    anatomical_site: 'tallone_sx',
    custom_site_desc: 'Tallone sinistro (posteriore)',
    stage: 'stadio_2_flittene',
    dimensions_cm: '2.0 x 1.5 cm',
    depth_mm: 'Superficiale',
    wound_bed: 'granulazione_rosso',
    perilesional_skin: 'eritematosa',
    exudate_amount: 'scarso',
    exudate_type: 'sieroso',
    cleansing_solution: 'fisiologica_09',
    dressing_applied: 'Connettivina garze sterili (Acido Ialuronico)',
    secondary_dressing: 'Garza sterile in TNT di protezione fissata con rete elastica',
    dressing_frequency: 'giorni_alterni',
    last_dressing_date: '2026-08-27',
    next_dressing_date: '2026-08-29',
    pain_scale: 2,
    performed_action: 'medicazione_completa',
    competence_status: 'gestibile_da_oss',
    notes: 'Detersione con soluzione fisiologica sterile a tampone delicato senza strofinare. Flittene mantenuto integro/protetto. Applicata garza sterile Connettivina e garza in TNT. Posizionato cuscino di scarico talloni e alternanza posture a 2 ore.',
    operator_name: 'Yajaira (OSS)',
    recorded_by: 'Yajaira',
    created_at: '2026-08-27T08:50:00.000Z',
  },
  {
    id: 'wnd-002',
    patient_id: 'pat-001-mario-rossi',
    recorded_at: '2026-08-26T09:00:00.000Z',
    wound_type: 'arrossamento_cute_integra',
    anatomical_site: 'sacro',
    custom_site_desc: 'Regione sacrale mediana',
    stage: 'stadio_1_eritema',
    dimensions_cm: '3.5 x 3.0 cm',
    depth_mm: 'Cute integra',
    wound_bed: 'cute_arrossata_integra',
    perilesional_skin: 'integra',
    exudate_amount: 'assente_asciutta',
    exudate_type: 'sieroso',
    cleansing_solution: 'fisiologica_09',
    dressing_applied: 'Pasta all\'Ossido di Zinco protettiva a velo sottile',
    secondary_dressing: 'Cuscino a cuneo per scarico posturale continuo',
    dressing_frequency: 'giornaliera',
    last_dressing_date: '2026-08-26',
    next_dressing_date: '2026-08-27',
    pain_scale: 1,
    performed_action: 'applicazione_crema_barriera',
    competence_status: 'gestibile_da_oss',
    notes: 'Rilevato arrossamento non sbiancabile su cute integra. Detersione delicata a tampone, applicata pasta protettiva all\'ossido di zinco senza frizionare. Impostato cambio postura a 2 ore.',
    operator_name: 'Yajaira (OSS)',
    recorded_by: 'Yajaira',
    created_at: '2026-08-26T09:10:00.000Z',
  },
];

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
  // MEDICATIONS & FARMACOLOGIA
  // ----------------------------------------------------------------------
  getAllMedications(): Medication[] {
    const data = getStored<Medication[]>('medications', []);
    if (!data || data.length === 0) {
      setStored('medications', INITIAL_MEDICATIONS);
      return INITIAL_MEDICATIONS;
    }
    return data;
  },

  getMedications(patientId?: string): Medication[] {
    const all = this.getAllMedications();
    if (!patientId) return all;
    return all.filter((m) => m.patient_id === patientId);
  },

  getMedicationById(id: string): Medication | null {
    const all = this.getAllMedications();
    return all.find((m) => m.id === id) || null;
  },

  addMedication(med: Omit<Medication, 'id' | 'created_at'> & { id?: string }): Medication {
    const all = this.getAllMedications();
    const now = new Date().toISOString();
    const status = med.status || (med.is_active ? 'active' : 'completed');
    const created: Medication = {
      ...med,
      id: med.id || 'med-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      status,
      is_active: status === 'active',
      created_at: now,
      updated_at: now,
    };
    all.unshift(created);
    setStored('medications', all);
    return created;
  },

  updateMedication(id: string, updates: Partial<Medication>): Medication | null {
    const all = this.getAllMedications();
    const idx = all.findIndex((m) => m.id === id);
    if (idx < 0) return null;

    let is_active = all[idx].is_active;
    let status = all[idx].status || (is_active ? 'active' : 'completed');

    if (updates.status !== undefined) {
      status = updates.status;
      is_active = updates.status === 'active';
    } else if (updates.is_active !== undefined) {
      is_active = updates.is_active;
      status = updates.is_active ? 'active' : (status === 'suspended' ? 'suspended' : 'completed');
    }

    const updated: Medication = {
      ...all[idx],
      ...updates,
      status,
      is_active,
      updated_at: new Date().toISOString(),
    };
    all[idx] = updated;
    setStored('medications', all);
    return updated;
  },

  terminateMedication(
    id: string,
    endDate?: string,
    reason?: string,
    notes?: string
  ): Medication | null {
    return this.updateMedication(id, {
      status: 'completed',
      is_active: false,
      end_date: endDate || new Date().toISOString().slice(0, 10),
      status_reason: reason || 'Terminata regolarmente',
      notes: notes ? `${notes}` : undefined,
    });
  },

  suspendMedication(
    id: string,
    suspensionDate?: string,
    reason?: string,
    notes?: string
  ): Medication | null {
    return this.updateMedication(id, {
      status: 'suspended',
      is_active: false,
      end_date: suspensionDate || new Date().toISOString().slice(0, 10),
      status_reason: reason || 'Sospesa dal medico',
      notes: notes ? `${notes}` : undefined,
    });
  },

  resumeMedication(id: string): Medication | null {
    return this.updateMedication(id, {
      status: 'active',
      is_active: true,
      end_date: undefined,
      status_reason: undefined,
    });
  },

  batchUpsertMedications(
    meds: Partial<Medication>[],
    defaultPatientId?: string
  ): { inserted: number; updated: number; total: number } {
    const all = this.getAllMedications();
    let inserted = 0;
    let updated = 0;
    const now = new Date().toISOString();

    // Index existing medications by `${patient_id}::${aic_code}` and by `id`
    const aicPatientMap = new Map<string, number>();
    const idMap = new Map<string, number>();

    all.forEach((m, idx) => {
      if (m.id) idMap.set(m.id, idx);
      if (m.patient_id && m.aic_code && m.aic_code.trim()) {
        aicPatientMap.set(`${m.patient_id}::${m.aic_code.trim()}`, idx);
      }
    });

    meds.forEach((med) => {
      const patientId = med.patient_id || defaultPatientId || '';
      const cleanAic = (med.aic_code || '').trim();
      const aicKey = patientId && cleanAic ? `${patientId}::${cleanAic}` : '';

      let targetIdx = -1;

      // 1. Check deduplication by AIC code for this patient
      if (aicKey && aicPatientMap.has(aicKey)) {
        targetIdx = aicPatientMap.get(aicKey)!;
      } else if (med.id && idMap.has(med.id)) {
        // 2. Check deduplication by explicit ID
        targetIdx = idMap.get(med.id)!;
      }

      if (targetIdx >= 0) {
        // Update existing record and refresh updated_at
        all[targetIdx] = {
          ...all[targetIdx],
          ...med,
          patient_id: patientId || all[targetIdx].patient_id,
          updated_at: now,
        };
        updated++;
      } else {
        // Insert new record
        const newId = med.id || 'med-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
        const created: Medication = {
          id: newId,
          patient_id: patientId,
          drug_name: med.drug_name || 'Farmaco',
          active_ingredient: med.active_ingredient,
          aic_code: cleanAic || undefined,
          dosage: med.dosage || '1 dose',
          unit: med.unit || 'cpr',
          pharma_form: med.pharma_form || 'Compresse',
          route: med.route || 'Orale',
          frequency: med.frequency || '1 volta al giorno',
          timing_time: med.timing_time || '08:00',
          scheduled_times: med.scheduled_times || (med.timing_time ? [med.timing_time] : ['08:00']),
          start_date: med.start_date,
          end_date: med.end_date,
          status: med.status || 'active',
          status_reason: med.status_reason,
          prescribed_by: med.prescribed_by,
          indication: med.indication,
          meal_relation: med.meal_relation || 'independent',
          notes: med.notes,
          is_active: med.is_active !== undefined ? med.is_active : true,
          created_at: med.created_at || now,
          updated_at: now,
        };
        all.unshift(created);
        const newIdx = 0;
        // Re-index
        idMap.set(newId, newIdx);
        if (aicKey) {
          aicPatientMap.set(aicKey, newIdx);
        }
        inserted++;
      }
    });

    setStored('medications', all);
    return { inserted, updated, total: all.length };
  },

  deleteMedication(id: string): boolean {
    let all = this.getAllMedications();
    all = all.filter((m) => m.id !== id);
    setStored('medications', all);
    return true;
  },

  // ----------------------------------------------------------------------
  // MEDICATION ADMINISTRATIONS (REGISTRO SOMMINISTRAZIONI)
  // ----------------------------------------------------------------------
  getAllAdministrations(): MedicationAdministration[] {
    const data = getStored<MedicationAdministration[]>('medication_administrations', []);
    if (!data || data.length === 0) {
      setStored('medication_administrations', INITIAL_ADMINISTRATIONS);
      return INITIAL_ADMINISTRATIONS;
    }
    return data;
  },

  getAdministrations(patientId?: string, medicationId?: string): MedicationAdministration[] {
    let all = this.getAllAdministrations();
    if (patientId) {
      all = all.filter((a) => a.patient_id === patientId);
    }
    if (medicationId) {
      all = all.filter((a) => a.medication_id === medicationId);
    }
    // Sort descending by date and time
    return all.sort((a, b) => {
      const timeA = new Date(a.administered_at || `${a.scheduled_date}T${a.scheduled_time}`).getTime();
      const timeB = new Date(b.administered_at || `${b.scheduled_date}T${b.scheduled_time}`).getTime();
      return timeB - timeA;
    });
  },

  addAdministration(
    admin: Omit<MedicationAdministration, 'id' | 'created_at'> & { id?: string }
  ): MedicationAdministration {
    const all = this.getAllAdministrations();
    const now = new Date().toISOString();
    const created: MedicationAdministration = {
      ...admin,
      id: admin.id || 'adm-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      created_at: now,
    };
    all.unshift(created);
    setStored('medication_administrations', all);
    return created;
  },

  deleteAdministration(id: string): boolean {
    let all = this.getAllAdministrations();
    all = all.filter((a) => a.id !== id);
    setStored('medication_administrations', all);
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
  // BOWEL MOVEMENTS & ALVO / SCARICHE (Bristol Stool Scale)
  // ----------------------------------------------------------------------
  getAllBowelRecords(): BowelRecord[] {
    const data = getStored<BowelRecord[]>('bowel_records', []);
    if (!data || data.length === 0) {
      setStored('bowel_records', INITIAL_BOWEL_RECORDS);
      return INITIAL_BOWEL_RECORDS;
    }
    return data;
  },

  getBowelRecords(patientId?: string): BowelRecord[] {
    const all = this.getAllBowelRecords();
    let filtered = patientId ? all.filter((r) => r.patient_id === patientId) : all;
    // Order by recorded_at descending
    return filtered.sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
  },

  addBowelRecord(record: Omit<BowelRecord, 'id' | 'created_at'> & { id?: string }): BowelRecord {
    const all = this.getAllBowelRecords();
    const now = new Date().toISOString();
    const created: BowelRecord = {
      ...record,
      id: record.id || 'bowel-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      created_at: now,
    };
    all.unshift(created);
    setStored('bowel_records', all);
    return created;
  },

  updateBowelRecord(id: string, updates: Partial<BowelRecord>): BowelRecord | null {
    const all = this.getAllBowelRecords();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    const updated: BowelRecord = {
      ...all[idx],
      ...updates,
    };
    all[idx] = updated;
    setStored('bowel_records', all);
    return updated;
  },

  deleteBowelRecord(id: string): boolean {
    let all = this.getAllBowelRecords();
    all = all.filter((r) => r.id !== id);
    setStored('bowel_records', all);
    return true;
  },

  // ----------------------------------------------------------------------
  // CATETERE VESCICALE (GESTIONE & MONITORAGGIO DIURESI)
  // ----------------------------------------------------------------------
  getAllCatheterRecords(patientId?: string): CatheterRecord[] {
    let all = getStored<CatheterRecord[]>('catheter_records', INITIAL_CATHETER_RECORDS);
    if (!all || all.length === 0) {
      all = INITIAL_CATHETER_RECORDS;
      setStored('catheter_records', all);
    }
    const filtered = patientId ? all.filter((r) => r.patient_id === patientId) : all;
    return filtered.sort(
      (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
    );
  },

  addCatheterRecord(
    record: Omit<CatheterRecord, 'id' | 'created_at'> & { id?: string }
  ): CatheterRecord {
    const all = this.getAllCatheterRecords();
    const now = new Date().toISOString();
    const created: CatheterRecord = {
      ...record,
      id: record.id || 'cath-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      created_at: now,
    };
    all.unshift(created);
    setStored('catheter_records', all);
    return created;
  },

  updateCatheterRecord(id: string, updates: Partial<CatheterRecord>): CatheterRecord | null {
    const all = this.getAllCatheterRecords();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    const updated: CatheterRecord = {
      ...all[idx],
      ...updates,
    };
    all[idx] = updated;
    setStored('catheter_records', all);
    return updated;
  },

  deleteCatheterRecord(id: string): boolean {
    let all = this.getAllCatheterRecords();
    all = all.filter((r) => r.id !== id);
    setStored('catheter_records', all);
    return true;
  },

  // ----------------------------------------------------------------------
  // CONTROLLO MEDICAZIONI & LESIONI DA DECUBITO (LDD)
  // ----------------------------------------------------------------------
  getAllWoundRecords(patientId?: string): WoundDressingRecord[] {
    let all = getStored<WoundDressingRecord[]>('wound_dressing_records', INITIAL_WOUND_RECORDS);
    if (!all || all.length === 0) {
      all = INITIAL_WOUND_RECORDS;
      setStored('wound_dressing_records', all);
    }
    const filtered = patientId ? all.filter((r) => r.patient_id === patientId) : all;
    return filtered.sort(
      (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
    );
  },

  addWoundRecord(
    record: Omit<WoundDressingRecord, 'id' | 'created_at'> & { id?: string }
  ): WoundDressingRecord {
    const all = this.getAllWoundRecords();
    const now = new Date().toISOString();
    const created: WoundDressingRecord = {
      ...record,
      id: record.id || 'wnd-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      created_at: now,
    };
    all.unshift(created);
    setStored('wound_dressing_records', all);
    return created;
  },

  updateWoundRecord(
    id: string,
    updates: Partial<WoundDressingRecord>
  ): WoundDressingRecord | null {
    const all = this.getAllWoundRecords();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    const updated: WoundDressingRecord = {
      ...all[idx],
      ...updates,
    };
    all[idx] = updated;
    setStored('wound_dressing_records', all);
    return updated;
  },

  deleteWoundRecord(id: string): boolean {
    let all = this.getAllWoundRecords();
    all = all.filter((r) => r.id !== id);
    setStored('wound_dressing_records', all);
    return true;
  },

  // ----------------------------------------------------------------------
  // CARTELLA CLINICO-ASSISTENZIALE COMPLETA (PDF EXPORT DATASET)
  // ----------------------------------------------------------------------
  getFullPatientDossier(patientId: string) {
    const patient = this.getPatient(patientId);
    if (!patient) return null;

    const conditions = this.getConditions(patientId);
    const aids = this.getAids(patientId);
    const sensory = this.getSensoryInfo(patientId);
    const vitals = this.getVitals(patientId);
    const diary = this.getDiary(patientId);
    const medications = this.getMedications(patientId);
    const administrations = this.getAdministrations(patientId);
    const foodHydration = this.getFoodRecords(patientId);
    const bowelRecords = this.getAllBowelRecords(patientId);
    const catheterRecords = this.getAllCatheterRecords(patientId);
    const woundRecords = this.getAllWoundRecords(patientId);
    const appointments = this.getAppointments().filter(
      (a) => a.patient_id === patientId || a.patient_name?.toLowerCase().includes(patient.last_name.toLowerCase())
    );

    return {
      patient,
      conditions,
      aids,
      sensory,
      vitals,
      diary,
      medications,
      administrations,
      foodHydration,
      bowelRecords,
      catheterRecords,
      woundRecords,
      appointments,
      generatedAt: new Date().toISOString(),
    };
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

  // ----------------------------------------------------------------------
  // VADEMECUM FARMACI ITALIANI (AIFA)
  // ----------------------------------------------------------------------
  getVademecumMedications(
    search?: string,
    filters?: {
      reimbursementClass?: string;
      route?: string;
      prescriptionRegime?: string;
    }
  ): VademecumMedication[] {
    let list = getStored<VademecumMedication[]>('vademecum_medications', []);
    if (!list || list.length === 0) {
      setStored('vademecum_medications', AIFA_OFFICIAL_MEDICATIONS);
      list = AIFA_OFFICIAL_MEDICATIONS;
    }

    let results = [...list];

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      results = results.filter((m) => {
        const trade = (m.trade_name || '').toLowerCase();
        const active = (m.active_ingredient || '').toLowerCase();
        const aic = (m.aic_code || '').toLowerCase();
        const atc = (m.atc_code || '').toLowerCase();
        const holder = (m.holder_company || '').toLowerCase();
        return (
          trade.includes(q) ||
          active.includes(q) ||
          aic.includes(q) ||
          atc.includes(q) ||
          holder.includes(q)
        );
      });
    }

    if (filters?.reimbursementClass) {
      const cls = filters.reimbursementClass.toLowerCase();
      results = results.filter((m) =>
        (m.reimbursement_class || '').toLowerCase().startsWith(cls)
      );
    }

    if (filters?.route) {
      const r = filters.route.toLowerCase();
      results = results.filter((m) =>
        (m.admin_route || '').toLowerCase().includes(r)
      );
    }

    if (filters?.prescriptionRegime) {
      const p = filters.prescriptionRegime.toLowerCase();
      results = results.filter((m) =>
        (m.prescription_regime || '').toLowerCase().includes(p)
      );
    }

    return results;
  },

  getVademecumMedicationById(id: string): VademecumMedication | null {
    const list = this.getVademecumMedications();
    return list.find((m) => m.id === id || m.aic_code === id) || null;
  },

  getVademecumMedicationByAic(aic: string): VademecumMedication | null {
    const list = this.getVademecumMedications();
    const cleanAic = aic.trim();
    return list.find((m) => m.aic_code === cleanAic) || null;
  },

  upsertVademecumMedication(med: VademecumMedication): VademecumMedication {
    const list = this.getVademecumMedications();
    const now = new Date().toISOString();
    const existingIdx = list.findIndex(
      (m) => m.aic_code === med.aic_code || (med.id && m.id === med.id)
    );

    if (existingIdx >= 0) {
      const updated: VademecumMedication = {
        ...list[existingIdx],
        ...med,
        updated_at: now,
      };
      list[existingIdx] = updated;
      setStored('vademecum_medications', list);
      return updated;
    } else {
      const created: VademecumMedication = {
        ...med,
        id: med.id || 'aifa-' + (med.aic_code || Date.now()),
        created_at: now,
        updated_at: now,
      };
      list.unshift(created);
      setStored('vademecum_medications', list);
      return created;
    }
  },

  batchUpsertVademecum(
    meds: VademecumMedication[]
  ): { inserted: number; updated: number; total: number } {
    const list = this.getVademecumMedications();
    let inserted = 0;
    let updated = 0;
    const now = new Date().toISOString();

    const aicMap = new Map<string, number>();
    list.forEach((m, idx) => {
      if (m.aic_code) aicMap.set(m.aic_code.trim(), idx);
    });

    meds.forEach((med) => {
      const cleanAic = (med.aic_code || '').trim();
      if (!cleanAic) return;

      if (aicMap.has(cleanAic)) {
        const idx = aicMap.get(cleanAic)!;
        list[idx] = {
          ...list[idx],
          ...med,
          updated_at: now,
        };
        updated++;
      } else {
        const created: VademecumMedication = {
          ...med,
          id: med.id || 'aifa-' + cleanAic,
          created_at: now,
          updated_at: now,
        };
        list.push(created);
        aicMap.set(cleanAic, list.length - 1);
        inserted++;
      }
    });

    setStored('vademecum_medications', list);
    return { inserted, updated, total: list.length };
  },

  resetVademecumToDefault(): VademecumMedication[] {
    setStored('vademecum_medications', AIFA_OFFICIAL_MEDICATIONS);
    return AIFA_OFFICIAL_MEDICATIONS;
  },
};

