import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { localDb } from '../lib/localDb';
import { FoodRecord } from '../types';

export async function getFoodRecordsByPatient(
  patientId: string
): Promise<{ data: FoodRecord[]; error: string | null }> {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('food_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return { data: (data as FoodRecord[]) || [], error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase getFoodRecords failed, fallback local:', err);
  }

  return { data: localDb.getFoodRecords(patientId), error: null };
}

export async function createFoodRecord(
  record: Omit<FoodRecord, 'id' | 'created_at'>
): Promise<{ data: FoodRecord | null; error: string | null }> {
  const localSaved = localDb.addFoodRecord(record);
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('food_records')
        .insert([record])
        .select()
        .single();

      if (!error && data) {
        return { data: data as FoodRecord, error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase createFoodRecord failed, saved locally:', err);
  }

  return { data: localSaved, error: null };
}

export async function deleteFoodRecord(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  localDb.deleteFoodRecord(id);
  try {
    if (isSupabaseConfigured()) {
      await supabase.from('food_records').delete().eq('id', id);
    }
  } catch (err) {
    console.warn('Supabase deleteFoodRecord failed:', err);
  }
  return { success: true, error: null };
}
