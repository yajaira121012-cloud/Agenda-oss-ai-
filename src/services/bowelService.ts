import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { localDb } from '../lib/localDb';
import { BowelRecord } from '../types';

export async function getBowelRecordsByPatient(
  patientId: string
): Promise<{ data: BowelRecord[]; error: string | null }> {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('bowel_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return { data: (data as BowelRecord[]) || [], error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase getBowelRecords failed, fallback local:', err);
  }

  return { data: localDb.getBowelRecords(patientId), error: null };
}

export async function getAllBowelRecords(): Promise<{ data: BowelRecord[]; error: string | null }> {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('bowel_records')
        .select('*')
        .order('recorded_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return { data: (data as BowelRecord[]) || [], error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase getAllBowelRecords failed, fallback local:', err);
  }

  return { data: localDb.getAllBowelRecords(), error: null };
}

export async function createBowelRecord(
  record: Omit<BowelRecord, 'id' | 'created_at'>
): Promise<{ data: BowelRecord | null; error: string | null }> {
  const localSaved = localDb.addBowelRecord(record);
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('bowel_records')
        .insert([record])
        .select()
        .single();

      if (!error && data) {
        return { data: data as BowelRecord, error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase createBowelRecord failed, saved locally:', err);
  }

  return { data: localSaved, error: null };
}

export async function updateBowelRecord(
  id: string,
  updates: Partial<BowelRecord>
): Promise<{ data: BowelRecord | null; error: string | null }> {
  const localUpdated = localDb.updateBowelRecord(id, updates);
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('bowel_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return { data: data as BowelRecord, error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase updateBowelRecord failed:', err);
  }

  return { data: localUpdated, error: null };
}

export async function deleteBowelRecord(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  localDb.deleteBowelRecord(id);
  try {
    if (isSupabaseConfigured()) {
      await supabase.from('bowel_records').delete().eq('id', id);
    }
  } catch (err) {
    console.warn('Supabase deleteBowelRecord failed:', err);
  }

  return { success: true, error: null };
}
