export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- AGENDA OSS - DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) FOR SUPABASE
-- Esegui questo script nel "SQL Editor" del tuo progetto Supabase.
-- ==============================================================================

-- 1. Abilita estensione UUID se non già presente
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabella Profili Operatori (collegata ad auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    qualification TEXT DEFAULT 'Operatore Socio-Sanitario (OSS)',
    department TEXT DEFAULT 'Reparto Degenza',
    badge_number TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabella Pazienti / Assistiti
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    gender TEXT CHECK (gender IN ('M', 'F', 'other')) DEFAULT 'other',
    internal_code TEXT NOT NULL UNIQUE,
    status TEXT CHECK (status IN ('active', 'inactive', 'hospitalized', 'archived')) DEFAULT 'active' NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    notes TEXT,
    room_number TEXT,
    bed_number TEXT,
    emergency_contact_name TEXT,
    emergency_contact_relation TEXT,
    emergency_contact_phone TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabella Patologie e Anamnesi
CREATE TABLE IF NOT EXISTS public.patient_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('pathology', 'allergy', 'intolerance', 'surgery', 'previous_history', 'note')) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    diagnosed_year TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabella Ausili e Mobilità
CREATE TABLE IF NOT EXISTS public.patient_aids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    aid_type TEXT CHECK (aid_type IN ('none', 'cane', 'walker', 'wheelchair', 'special_bed', 'hoist', 'other')) NOT NULL,
    custom_name TEXT,
    is_current BOOLEAN DEFAULT true NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabella Sensorialità e Protesi
CREATE TABLE IF NOT EXISTS public.patient_sensory_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL UNIQUE REFERENCES public.patients(id) ON DELETE CASCADE,
    hearing TEXT CHECK (hearing IN ('normal', 'hypoacusis', 'deafness', 'other')) DEFAULT 'normal',
    hearing_aid TEXT CHECK (hearing_aid IN ('none', 'yes', 'bilateral', 'right', 'left')) DEFAULT 'none',
    vision TEXT CHECK (vision IN ('normal', 'reduced', 'blindness', 'glasses', 'other')) DEFAULT 'normal',
    dentures TEXT CHECK (dentures IN ('none', 'yes', 'upper', 'lower', 'complete')) DEFAULT 'none',
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Tabella Parametri Vitali
CREATE TABLE IF NOT EXISTS public.vital_signs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    temperature NUMERIC(4, 1),
    systolic_bp NUMERIC(4, 0),
    diastolic_bp NUMERIC(4, 0),
    heart_rate NUMERIC(4, 0),
    spo2 NUMERIC(4, 0),
    respiratory_rate NUMERIC(3, 0),
    weight NUMERIC(5, 1),
    blood_glucose NUMERIC(4, 0),
    notes TEXT,
    recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    operator_name TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Tabella Terapia Farmacologica
CREATE TABLE IF NOT EXISTS public.medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    drug_name TEXT NOT NULL,
    active_ingredient TEXT,
    dosage TEXT NOT NULL,
    unit TEXT DEFAULT 'cpr',
    route TEXT DEFAULT 'Orale',
    frequency TEXT NOT NULL,
    timing_time TEXT,
    start_date DATE,
    end_date DATE,
    indication TEXT,
    meal_relation TEXT CHECK (meal_relation IN ('before', 'during', 'after', 'independent')) DEFAULT 'independent',
    notes TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Tabella Alimentazione e Idratazione
CREATE TABLE IF NOT EXISTS public.food_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'hydration')) NOT NULL,
    food_intake_level TEXT CHECK (food_intake_level IN ('all', 'almost_all', 'half', 'little', 'refused')) NOT NULL,
    liquid_ml NUMERIC(5, 0),
    diet_type TEXT DEFAULT 'Normale',
    notes TEXT,
    recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    operator_name TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Tabella Diario Assistenziale (Consegne e Attività OSS)
CREATE TABLE IF NOT EXISTS public.care_diary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    category TEXT CHECK (category IN (
        'hygiene', 'mobilization', 'feeding', 'hydration',
        'elimination', 'vital_signs', 'sleep', 'behavior', 'assistance', 'other'
    )) NOT NULL,
    description TEXT NOT NULL,
    notes TEXT,
    recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    operator_name TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Tabella Agenda e Appuntamenti
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    appointment_type TEXT DEFAULT 'medical_visit',
    location TEXT,
    doctor_name TEXT,
    description TEXT,
    notes TEXT,
    status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled' NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ATTIVAZIONE ROW LEVEL SECURITY (RLS) SU TUTTE LE TABELLE
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_aids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_sensory_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_diary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- DEFINIZIONE DELLE POLICY RLS PER UTENTI AUTENTICATI
-- Permette agli operatori registrati e autenticati di leggere e gestire le cartelle
-- ==============================================================================

-- Profiles: ognuno gestisce il proprio profilo, ma gli operatori autenticati possono leggere i colleghi
DROP POLICY IF EXISTS "Profili visibili a operatori autenticati" ON public.profiles;
CREATE POLICY "Profili visibili a operatori autenticati" ON public.profiles
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Modifica proprio profilo" ON public.profiles;
CREATE POLICY "Modifica proprio profilo" ON public.profiles
    FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Patients: operatori autenticati possono gestire i pazienti
DROP POLICY IF EXISTS "Gestione pazienti operatori" ON public.patients;
CREATE POLICY "Gestione pazienti operatori" ON public.patients
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Condizioni, Anamnesi e Patologie
DROP POLICY IF EXISTS "Gestione condizioni pazienti" ON public.patient_conditions;
CREATE POLICY "Gestione condizioni pazienti" ON public.patient_conditions
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Ausili
DROP POLICY IF EXISTS "Gestione ausili pazienti" ON public.patient_aids;
CREATE POLICY "Gestione ausili pazienti" ON public.patient_aids
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Sensorialità
DROP POLICY IF EXISTS "Gestione sensorialita pazienti" ON public.patient_sensory_info;
CREATE POLICY "Gestione sensorialita pazienti" ON public.patient_sensory_info
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Parametri vitali
DROP POLICY IF EXISTS "Gestione parametri vitali" ON public.vital_signs;
CREATE POLICY "Gestione parametri vitali" ON public.vital_signs
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Terapie
DROP POLICY IF EXISTS "Gestione terapie" ON public.medications;
CREATE POLICY "Gestione terapie" ON public.medications
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Alimentazione e Idratazione
DROP POLICY IF EXISTS "Gestione alimentazione" ON public.food_records;
CREATE POLICY "Gestione alimentazione" ON public.food_records
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Diario Assistenziale
DROP POLICY IF EXISTS "Gestione diario assistenziale" ON public.care_diary;
CREATE POLICY "Gestione diario assistenziale" ON public.care_diary
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Agenda
DROP POLICY IF EXISTS "Gestione appuntamenti agenda" ON public.appointments;
CREATE POLICY "Gestione appuntamenti agenda" ON public.appointments
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- TRIGGER CREAZIONE AUTOMATICA PROFILO SU REGISTRAZIONE AUTH
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, qualification)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'qualification', 'Operatore Socio-Sanitario (OSS)')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
`;

export const SCHEMA_SQL = SUPABASE_SQL_SCHEMA;
