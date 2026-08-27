import { CatheterRecord } from '../types';
import { localDb } from '../lib/localDb';

export async function getCatheterRecordsByPatient(patientId: string): Promise<{ data: CatheterRecord[] | null; error: string | null }> {
  try {
    const data = localDb.getAllCatheterRecords(patientId);
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Errore nel recupero dati catetere vescicale' };
  }
}

export async function createCatheterRecord(
  record: Omit<CatheterRecord, 'id' | 'created_at'>
): Promise<{ data: CatheterRecord | null; error: string | null }> {
  try {
    const data = localDb.addCatheterRecord(record);
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Errore nel salvataggio del controllo catetere' };
  }
}

export async function updateCatheterRecord(
  id: string,
  updates: Partial<CatheterRecord>
): Promise<{ data: CatheterRecord | null; error: string | null }> {
  try {
    const data = localDb.updateCatheterRecord(id, updates);
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Errore nell\'aggiornamento del record catetere' };
  }
}

export async function deleteCatheterRecord(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const success = localDb.deleteCatheterRecord(id);
    return { success, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || 'Errore nell\'eliminazione del record catetere' };
  }
}
