import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { localDb } from '../lib/localDb';
import {
  Patient,
  PatientStatus,
  PatientCondition,
  PatientAid,
  PatientSensoryInfo,
} from '../types';

export async function getPatients(
  searchQuery = '',
  statusFilter: PatientStatus | 'all' = 'all'
): Promise<{ data: Patient[]; error: string | null }> {
  try {
    if (isSupabaseConfigured()) {
      let query = supabase
        .from('patients')
        .select('*')
        .order('last_name', { ascending: true });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (searchQuery.trim()) {
        const q = searchQuery.trim();
        query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,internal_code.ilike.%${q}%`);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return { data: data as Patient[], error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase fetch failed, using local database fallback:', err);
  }

  // Fallback to local storage
  let localData = localDb.getPatients();
  if (statusFilter !== 'all') {
    localData = localData.filter((p) => p.status === statusFilter);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    localData = localData.filter(
      (p) =>
        p.first_name.toLowerCase().includes(q) ||
        p.last_name.toLowerCase().includes(q) ||
        p.internal_code.toLowerCase().includes(q)
    );
  }
  return { data: localData, error: null };
}

export async function getPatientById(
  id: string
): Promise<{ data: Patient | null; error: string | null }> {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        return { data: data as Patient, error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase getPatientById failed, fallback to local:', err);
  }

  const localPatient = localDb.getPatientById(id);
  return { data: localPatient, error: null };
}

export async function createPatient(
  patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>
): Promise<{ data: Patient | null; error: string | null }> {
  // Always save locally first to guarantee zero data loss
  const savedLocal = localDb.savePatient(patientData);

  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('patients')
        .insert([patientData])
        .select()
        .single();

      if (!error && data) {
        // update local with real supabase id
        localDb.updatePatient(savedLocal.id, { id: data.id });
        return { data: data as Patient, error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase create patient failed, saved locally:', err);
  }

  return { data: savedLocal, error: null };
}

export async function updatePatient(
  id: string,
  updates: Partial<Patient>
): Promise<{ data: Patient | null; error: string | null }> {
  const updatedLocal = localDb.updatePatient(id, updates);

  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('patients')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return { data: data as Patient, error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase update patient failed, saved locally:', err);
  }

  return { data: updatedLocal, error: null };
}

export async function archivePatient(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  localDb.archivePatient(id);
  try {
    if (isSupabaseConfigured()) {
      await supabase
        .from('patients')
        .update({ status: 'archived', updated_at: new Date().toISOString() })
        .eq('id', id);
    }
  } catch (err) {
    console.warn('Supabase archive failed, archived locally:', err);
  }
  return { success: true, error: null };
}

export async function deletePatient(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  localDb.deletePatient(id);
  try {
    if (isSupabaseConfigured()) {
      await supabase.from('patients').delete().eq('id', id);
    }
  } catch (err) {
    console.warn('Supabase delete failed, deleted locally:', err);
  }
  return { success: true, error: null };
}

// ----------------------------------------------------
// Condizioni, Anamnesi e Patologie
// ----------------------------------------------------
export async function getPatientConditions(
  patientId: string
): Promise<{ data: PatientCondition[]; error: string | null }> {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('patient_conditions')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return { data: (data as PatientCondition[]) || [], error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase getConditions failed, fallback local:', err);
  }

  return { data: localDb.getConditions(patientId), error: null };
}

export async function addPatientCondition(
  condition: Omit<PatientCondition, 'id' | 'created_at'>
): Promise<{ data: PatientCondition | null; error: string | null }> {
  const localSaved = localDb.addCondition(condition);
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('patient_conditions')
        .insert([condition])
        .select()
        .single();

      if (!error && data) {
        return { data: data as PatientCondition, error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase addCondition failed, saved locally:', err);
  }
  return { data: localSaved, error: null };
}

export async function deletePatientCondition(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  localDb.deleteCondition(id);
  try {
    if (isSupabaseConfigured()) {
      await supabase.from('patient_conditions').delete().eq('id', id);
    }
  } catch (err) {
    console.warn('Supabase deleteCondition failed, deleted locally:', err);
  }
  return { success: true, error: null };
}

// ----------------------------------------------------
// Mobilità e Ausili
// ----------------------------------------------------
export async function getPatientAids(
  patientId: string
): Promise<{ data: PatientAid[]; error: string | null }> {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('patient_aids')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return { data: (data as PatientAid[]) || [], error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase getAids failed, fallback local:', err);
  }
  return { data: localDb.getAids(patientId), error: null };
}

export async function addPatientAid(
  aid: Omit<PatientAid, 'id' | 'created_at'>
): Promise<{ data: PatientAid | null; error: string | null }> {
  const localSaved = localDb.addAid(aid);
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('patient_aids')
        .insert([aid])
        .select()
        .single();

      if (!error && data) {
        return { data: data as PatientAid, error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase addAid failed, saved locally:', err);
  }
  return { data: localSaved, error: null };
}

export async function deletePatientAid(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  localDb.deleteAid(id);
  try {
    if (isSupabaseConfigured()) {
      await supabase.from('patient_aids').delete().eq('id', id);
    }
  } catch (err) {
    console.warn('Supabase deleteAid failed, deleted locally:', err);
  }
  return { success: true, error: null };
}

// ----------------------------------------------------
// Sensorialità e Protesi
// ----------------------------------------------------
export async function getPatientSensoryInfo(
  patientId: string
): Promise<{ data: PatientSensoryInfo | null; error: string | null }> {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('patient_sensory_info')
        .select('*')
        .eq('patient_id', patientId)
        .maybeSingle();

      if (!error && data) {
        return { data: data as PatientSensoryInfo, error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase getSensoryInfo failed, fallback local:', err);
  }
  return { data: localDb.getSensoryInfo(patientId), error: null };
}

export async function upsertPatientSensoryInfo(
  info: Omit<PatientSensoryInfo, 'id' | 'updated_at'> & { id?: string }
): Promise<{ data: PatientSensoryInfo | null; error: string | null }> {
  const localSaved = localDb.upsertSensoryInfo(info);
  try {
    if (isSupabaseConfigured()) {
      const payload = {
        ...info,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('patient_sensory_info')
        .upsert(payload, { onConflict: 'patient_id' })
        .select()
        .single();

      if (!error && data) {
        return { data: data as PatientSensoryInfo, error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase upsertSensoryInfo failed, saved locally:', err);
  }
  return { data: localSaved, error: null };
}
