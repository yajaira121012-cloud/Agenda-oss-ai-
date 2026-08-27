import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { localDb } from '../lib/localDb';
import { Medication } from '../types';

export async function getMedicationsByPatient(
  patientId: string
): Promise<{ data: Medication[]; error: string | null }> {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('patient_id', patientId)
        .order('is_active', { ascending: false })
        .order('drug_name', { ascending: true });

      if (!error && data && data.length > 0) {
        return { data: (data as Medication[]) || [], error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase getMedications failed, fallback local:', err);
  }

  return { data: localDb.getMedications(patientId), error: null };
}

export async function createMedication(
  medication: Omit<Medication, 'id' | 'created_at'>
): Promise<{ data: Medication | null; error: string | null }> {
  const localSaved = localDb.addMedication(medication);
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('medications')
        .insert([medication])
        .select()
        .single();

      if (!error && data) {
        return { data: data as Medication, error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase createMedication failed, saved locally:', err);
  }

  return { data: localSaved, error: null };
}

export async function updateMedication(
  id: string,
  updates: Partial<Medication>
): Promise<{ data: Medication | null; error: string | null }> {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('medications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return { data: data as Medication, error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase updateMedication failed:', err);
  }

  return { data: null, error: null };
}

export async function toggleMedicationActive(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error: string | null }> {
  try {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('medications')
        .update({ is_active: isActive })
        .eq('id', id);

      if (!error) return { success: true, error: null };
    }
  } catch (err) {
    console.warn('Supabase toggleMedicationActive failed:', err);
  }
  return { success: true, error: null };
}

export async function deleteMedication(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  localDb.deleteMedication(id);
  try {
    if (isSupabaseConfigured()) {
      await supabase.from('medications').delete().eq('id', id);
    }
  } catch (err) {
    console.warn('Supabase deleteMedication failed:', err);
  }
  return { success: true, error: null };
}
