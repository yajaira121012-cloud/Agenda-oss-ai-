import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { localDb } from '../lib/localDb';
import { VitalSign } from '../types';

export async function getVitalSignsByPatient(
  patientId: string
): Promise<{ data: VitalSign[]; error: string | null }> {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('vital_signs')
        .select('*')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return { data: (data as VitalSign[]) || [], error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase getVitalSigns failed, fallback local:', err);
  }

  return { data: localDb.getVitals(patientId), error: null };
}

export async function getRecentVitalSigns(
  limit = 10
): Promise<{ data: (VitalSign & { patients?: { first_name: string; last_name: string; internal_code: string } })[]; error: string | null }> {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('vital_signs')
        .select('*, patients(first_name, last_name, internal_code)')
        .order('recorded_at', { ascending: false })
        .limit(limit);

      if (!error && data && data.length > 0) {
        return { data: (data as any) || [], error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase getRecentVitalSigns failed, fallback local:', err);
  }

  const vitals = localDb.getVitals().slice(0, limit);
  const patients = localDb.getPatients();
  const enriched = vitals.map((v) => {
    const p = patients.find((pat) => pat.id === v.patient_id);
    return {
      ...v,
      patients: p ? { first_name: p.first_name, last_name: p.last_name, internal_code: p.internal_code } : undefined,
    };
  });

  return { data: enriched, error: null };
}

export async function createVitalSign(
  vitalSign: Omit<VitalSign, 'id' | 'created_at'>
): Promise<{ data: VitalSign | null; error: string | null }> {
  const localSaved = localDb.addVital(vitalSign);
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('vital_signs')
        .insert([vitalSign])
        .select()
        .single();

      if (!error && data) {
        return { data: data as VitalSign, error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase createVitalSign failed, saved locally:', err);
  }

  return { data: localSaved, error: null };
}

export async function updateVitalSign(
  id: string,
  updates: Partial<VitalSign>
): Promise<{ data: VitalSign | null; error: string | null }> {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('vital_signs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return { data: data as VitalSign, error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase updateVitalSign failed:', err);
  }

  return { data: null, error: null };
}

export async function deleteVitalSign(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  localDb.deleteVital(id);
  try {
    if (isSupabaseConfigured()) {
      await supabase.from('vital_signs').delete().eq('id', id);
    }
  } catch (err) {
    console.warn('Supabase deleteVitalSign failed:', err);
  }
  return { success: true, error: null };
}
