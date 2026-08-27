import { supabase } from '../lib/supabase';
import { Profile } from '../types';

export async function getCurrentUserProfile(
  userId: string
): Promise<{ data: Profile | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return { data: data as Profile, error: null };
  } catch (err: any) {
    console.error('Error fetching profile:', err);
    return { data: null, error: err.message || 'Errore nel recupero del profilo' };
  }
}

export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<{ data: Profile | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return { data: data as Profile, error: null };
  } catch (err: any) {
    console.error('Error updating profile:', err);
    return { data: null, error: err.message || 'Errore durante il salvataggio del profilo' };
  }
}
