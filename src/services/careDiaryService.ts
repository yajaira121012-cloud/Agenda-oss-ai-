import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { localDb } from '../lib/localDb';
import { CareDiaryEntry, DiaryCategory } from '../types';

export async function getCareDiaryByPatient(
  patientId: string,
  categoryFilter?: DiaryCategory | 'all'
): Promise<{ data: CareDiaryEntry[]; error: string | null }> {
  try {
    if (isSupabaseConfigured()) {
      let query = supabase
        .from('care_diary')
        .select('*')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false });

      if (categoryFilter && categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return { data: (data as CareDiaryEntry[]) || [], error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase getCareDiary failed, fallback local:', err);
  }

  let entries = localDb.getDiary(patientId);
  if (categoryFilter && categoryFilter !== 'all') {
    entries = entries.filter((e) => e.category === categoryFilter);
  }
  return { data: entries, error: null };
}

export async function getCareDiaryEntries(
  limit = 100,
  categoryFilter?: DiaryCategory | 'all'
): Promise<{ data: (CareDiaryEntry & { patient?: any })[]; error: string | null }> {
  try {
    if (isSupabaseConfigured()) {
      let query = supabase
        .from('care_diary')
        .select('*, patient:patients(id, first_name, last_name, internal_code, room_number)')
        .order('recorded_at', { ascending: false })
        .limit(limit);

      if (categoryFilter && categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return { data: (data as any) || [], error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase getCareDiaryEntries failed, fallback local:', err);
  }

  let entries = localDb.getDiary();
  if (categoryFilter && categoryFilter !== 'all') {
    entries = entries.filter((e) => e.category === categoryFilter);
  }
  const patients = localDb.getPatients();
  const enriched = entries.slice(0, limit).map((e) => {
    const p = patients.find((pat) => pat.id === e.patient_id);
    return {
      ...e,
      patient: p,
    } as CareDiaryEntry & { patient?: any };
  });

  return { data: enriched, error: null };
}

export async function getRecentCareDiaryEntries(
  limit = 10,
  categoryFilter?: DiaryCategory | 'all'
): Promise<{ data: (CareDiaryEntry & { patients?: { first_name: string; last_name: string; internal_code: string; room_number?: string } })[]; error: string | null }> {
  return getCareDiaryEntries(limit, categoryFilter) as any;
}

export async function createCareDiaryEntry(
  entry: Omit<CareDiaryEntry, 'id' | 'created_at'>
): Promise<{ data: CareDiaryEntry | null; error: string | null }> {
  const localSaved = localDb.addDiary(entry);
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('care_diary')
        .insert([entry])
        .select()
        .single();

      if (!error && data) {
        return { data: data as CareDiaryEntry, error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase createCareDiaryEntry failed, saved locally:', err);
  }

  return { data: localSaved, error: null };
}

export async function updateCareDiaryEntry(
  id: string,
  updates: Partial<CareDiaryEntry>
): Promise<{ data: CareDiaryEntry | null; error: string | null }> {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('care_diary')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return { data: data as CareDiaryEntry, error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase updateCareDiaryEntry failed:', err);
  }

  return { data: null, error: null };
}

export async function deleteCareDiaryEntry(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  localDb.deleteDiary(id);
  try {
    if (isSupabaseConfigured()) {
      await supabase.from('care_diary').delete().eq('id', id);
    }
  } catch (err) {
    console.warn('Supabase deleteCareDiaryEntry failed:', err);
  }
  return { success: true, error: null };
}
