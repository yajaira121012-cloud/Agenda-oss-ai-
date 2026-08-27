import { WoundDressingRecord } from '../types';
import { localDb } from '../lib/localDb';

export async function getWoundRecordsByPatient(patientId: string): Promise<{ data: WoundDressingRecord[] | null; error: string | null }> {
  try {
    const data = localDb.getAllWoundRecords(patientId);
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Errore nel recupero delle medicazioni e lesioni' };
  }
}

export async function createWoundRecord(
  record: Omit<WoundDressingRecord, 'id' | 'created_at'>
): Promise<{ data: WoundDressingRecord | null; error: string | null }> {
  try {
    const data = localDb.addWoundRecord(record);
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Errore nel salvataggio della medicazione' };
  }
}

export async function updateWoundRecord(
  id: string,
  updates: Partial<WoundDressingRecord>
): Promise<{ data: WoundDressingRecord | null; error: string | null }> {
  try {
    const data = localDb.updateWoundRecord(id, updates);
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Errore nell\'aggiornamento della medicazione' };
  }
}

export async function deleteWoundRecord(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const success = localDb.deleteWoundRecord(id);
    return { success, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || 'Errore nell\'eliminazione della medicazione' };
  }
}
