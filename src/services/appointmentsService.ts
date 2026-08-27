import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { localDb } from '../lib/localDb';
import { Appointment, AppointmentStatus } from '../types';

export async function getAppointments(
  dateFilter?: string
): Promise<{ data: (Appointment & { patients?: { first_name: string; last_name: string; internal_code: string; room_number?: string } })[]; error: string | null }> {
  try {
    if (isSupabaseConfigured()) {
      let query = supabase
        .from('appointments')
        .select('*, patients(first_name, last_name, internal_code, room_number)')
        .order('start_time', { ascending: true });

      if (dateFilter) {
        query = query.gte('start_time', `${dateFilter}T00:00:00.000Z`).lte('start_time', `${dateFilter}T23:59:59.999Z`);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return { data: (data as any) || [], error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase getAppointments failed, fallback local:', err);
  }

  let appointments = localDb.getAppointments();
  if (dateFilter) {
    appointments = appointments.filter((a) => a.start_time.startsWith(dateFilter));
  }
  const patients = localDb.getPatients();
  const enriched = appointments.map((a) => {
    const p = patients.find((pat) => pat.id === a.patient_id);
    return {
      ...a,
      patient: p,
      patients: p ? { first_name: p.first_name, last_name: p.last_name, internal_code: p.internal_code, room_number: p.room_number } : undefined,
    } as Appointment & { patients?: { first_name: string; last_name: string; internal_code: string; room_number?: string } };
  });

  return { data: enriched, error: null };
}

export async function getAppointmentsByDateRange(
  startDateIso: string,
  endDateIso: string
): Promise<{ data: (Appointment & { patient?: any; patients?: any })[]; error: string | null }> {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, patient:patients(id, first_name, last_name, internal_code, room_number)')
        .gte('start_time', startDateIso)
        .lte('start_time', endDateIso)
        .order('start_time', { ascending: true });

      if (!error && data && data.length > 0) {
        return { data: (data as any) || [], error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase getAppointmentsByDateRange failed, fallback local:', err);
  }

  const appointments = localDb.getAppointments().filter(
    (a) => a.start_time >= startDateIso && a.start_time <= endDateIso
  );
  const patients = localDb.getPatients();
  const enriched = appointments.map((a) => {
    const p = patients.find((pat) => pat.id === a.patient_id);
    return {
      ...a,
      patient: p,
    } as Appointment & { patient?: any; patients?: any };
  });

  return { data: enriched, error: null };
}

export async function getAppointmentsByPatient(
  patientId: string
): Promise<{ data: Appointment[]; error: string | null }> {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .order('start_time', { ascending: true });

      if (!error && data && data.length > 0) {
        return { data: (data as Appointment[]) || [], error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase getAppointmentsByPatient failed, fallback local:', err);
  }

  const list = localDb.getAppointments().filter((a) => a.patient_id === patientId);
  return { data: list, error: null };
}

export async function createAppointment(
  appointment: Omit<Appointment, 'id' | 'created_at'>
): Promise<{ data: Appointment | null; error: string | null }> {
  const localSaved = localDb.addAppointment(appointment);
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointment])
        .select()
        .single();

      if (!error && data) {
        return { data: data as Appointment, error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase createAppointment failed, saved locally:', err);
  }

  return { data: localSaved, error: null };
}

export async function updateAppointment(
  id: string,
  updates: Partial<Appointment>
): Promise<{ data: Appointment | null; error: string | null }> {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return { data: data as Appointment, error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase updateAppointment failed:', err);
  }

  return { data: null, error: null };
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<{ success: boolean; error: string | null }> {
  return (await updateAppointment(id, { status })) ? { success: true, error: null } : { success: false, error: 'Errore' };
}

export async function toggleAppointmentStatus(
  id: string,
  newStatus: AppointmentStatus
): Promise<{ success: boolean; error: string | null }> {
  return updateAppointmentStatus(id, newStatus);
}

export async function deleteAppointment(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  localDb.deleteAppointment(id);
  try {
    if (isSupabaseConfigured()) {
      await supabase.from('appointments').delete().eq('id', id);
    }
  } catch (err) {
    console.warn('Supabase deleteAppointment failed:', err);
  }
  return { success: true, error: null };
}
