import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { localDb } from '../lib/localDb';
import {
  Medication,
  MedicationAdministration,
  MedicationImportReport,
  MedicationImportOptions,
  MealRelation,
  MedicationStatus,
} from '../types';

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

export async function getMedicationById(
  id: string
): Promise<{ data: Medication | null; error: string | null }> {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        return { data: data as Medication, error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase getMedicationById failed, fallback local:', err);
  }

  return { data: localDb.getMedicationById(id), error: null };
}

export async function createMedication(
  medication: Omit<Medication, 'id' | 'created_at' | 'updated_at'> & { id?: string }
): Promise<{ data: Medication | null; error: string | null }> {
  const now = new Date().toISOString();
  const status = medication.status || (medication.is_active ? 'active' : 'completed');
  const medToSave = {
    ...medication,
    status,
    is_active: status === 'active',
    updated_at: now,
  };
  const localSaved = localDb.addMedication(medToSave);

  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('medications')
        .insert([{
          ...medToSave,
          created_at: now,
          updated_at: now,
        }])
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
  const now = new Date().toISOString();
  const payload = {
    ...updates,
    updated_at: now,
  };

  const localUpdated = localDb.updateMedication(id, payload);

  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('medications')
        .update(payload)
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

  return { data: localUpdated, error: null };
}

/**
 * Segna la terapia come "Terminata" (⚪) senza cancellarla dallo storico.
 */
export async function terminateMedication(
  id: string,
  endDate?: string,
  reason?: string,
  notes?: string
): Promise<{ success: boolean; error: string | null }> {
  const now = new Date().toISOString();
  const actualEnd = endDate || now.slice(0, 10);
  const localRes = localDb.terminateMedication(id, actualEnd, reason, notes);

  try {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('medications')
        .update({
          status: 'completed',
          is_active: false,
          end_date: actualEnd,
          status_reason: reason || 'Terminata regolarmente',
          updated_at: now,
        })
        .eq('id', id);

      if (!error) return { success: true, error: null };
    }
  } catch (err) {
    console.warn('Supabase terminateMedication failed:', err);
  }

  return { success: !!localRes, error: null };
}

/**
 * Segna la terapia come "Sospesa" (🟠) senza cancellarla dallo storico.
 */
export async function suspendMedication(
  id: string,
  suspensionDate?: string,
  reason?: string,
  notes?: string
): Promise<{ success: boolean; error: string | null }> {
  const now = new Date().toISOString();
  const actualEnd = suspensionDate || now.slice(0, 10);
  const localRes = localDb.suspendMedication(id, actualEnd, reason, notes);

  try {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('medications')
        .update({
          status: 'suspended',
          is_active: false,
          end_date: actualEnd,
          status_reason: reason || 'Sospesa dal medico',
          updated_at: now,
        })
        .eq('id', id);

      if (!error) return { success: true, error: null };
    }
  } catch (err) {
    console.warn('Supabase suspendMedication failed:', err);
  }

  return { success: !!localRes, error: null };
}

/**
 * Riattiva una terapia precedentemente sospesa o terminata.
 */
export async function resumeMedication(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  const now = new Date().toISOString();
  const localRes = localDb.resumeMedication(id);

  try {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('medications')
        .update({
          status: 'active',
          is_active: true,
          end_date: null,
          status_reason: null,
          updated_at: now,
        })
        .eq('id', id);

      if (!error) return { success: true, error: null };
    }
  } catch (err) {
    console.warn('Supabase resumeMedication failed:', err);
  }

  return { success: !!localRes, error: null };
}

export async function toggleMedicationActive(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error: string | null }> {
  if (isActive) {
    return resumeMedication(id);
  } else {
    return suspendMedication(id, undefined, 'Sospensione manuale operatore');
  }
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

// ----------------------------------------------------------------------
// REGISTRO SOMMINISTRAZIONI (MEDICATION ADMINISTRATIONS)
// ----------------------------------------------------------------------
export async function getAdministrationsByPatient(
  patientId: string,
  medicationId?: string
): Promise<{ data: MedicationAdministration[]; error: string | null }> {
  try {
    if (isSupabaseConfigured()) {
      let query = supabase
        .from('medication_administrations')
        .select('*')
        .eq('patient_id', patientId);

      if (medicationId) {
        query = query.eq('medication_id', medicationId);
      }

      const { data, error } = await query
        .order('scheduled_date', { ascending: false })
        .order('scheduled_time', { ascending: false });

      if (!error && data && data.length > 0) {
        return { data: (data as MedicationAdministration[]) || [], error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase getAdministrations failed, fallback local:', err);
  }

  return { data: localDb.getAdministrations(patientId, medicationId), error: null };
}

export async function createAdministration(
  administration: Omit<MedicationAdministration, 'id' | 'created_at'> & { id?: string }
): Promise<{ data: MedicationAdministration | null; error: string | null }> {
  const localSaved = localDb.addAdministration(administration);

  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('medication_administrations')
        .insert([{
          ...administration,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (!error && data) {
        return { data: data as MedicationAdministration, error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase createAdministration failed, saved locally:', err);
  }

  return { data: localSaved, error: null };
}

export async function deleteAdministration(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  localDb.deleteAdministration(id);
  try {
    if (isSupabaseConfigured()) {
      await supabase.from('medication_administrations').delete().eq('id', id);
    }
  } catch (err) {
    console.warn('Supabase deleteAdministration failed:', err);
  }
  return { success: true, error: null };
}

/**
 * Parses raw CSV or JSON text and extracts medication items.
 */
export function parseMedicationsCsvOrJson(
  fileContent: string,
  defaultPatientId?: string
): {
  medications: Partial<Medication>[];
  invalidRows: { rowNumber: number; aic?: string; drugName?: string; error: string; rawData?: string }[];
  totalRows: number;
} {
  const trimmed = fileContent.trim();
  const invalidRows: { rowNumber: number; aic?: string; drugName?: string; error: string; rawData?: string }[] = [];
  const parsedMedications: Partial<Medication>[] = [];

  if (!trimmed) {
    throw new Error('Il contenuto del file da importare è vuoto.');
  }

  // 1. JSON FORMAT
  if (trimmed.startsWith('[') || (trimmed.startsWith('{') && !trimmed.startsWith('{\\rtf'))) {
    try {
      const parsedJson = JSON.parse(trimmed);
      const items: any[] = Array.isArray(parsedJson)
        ? parsedJson
        : Array.isArray(parsedJson.medications)
        ? parsedJson.medications
        : [parsedJson];

      items.forEach((item, index) => {
        const drugName = String(
          item.drug_name ||
          item.nome_farmaco ||
          item.farmaco ||
          item.trade_name ||
          item.denominazione ||
          item.name ||
          item['Nome Farmaco'] ||
          item['Denominazione'] ||
          ''
        ).trim();

        const aicRaw = String(
          item.aic_code ||
          item.aic ||
          item.codice_aic ||
          item.AIC ||
          item['Codice AIC'] ||
          item['AIC'] ||
          ''
        ).replace(/\D/g, '').trim();

        if (!drugName && !aicRaw) {
          invalidRows.push({
            rowNumber: index + 1,
            aic: aicRaw,
            drugName,
            error: 'Nome farmaco o Codice AIC mancante',
            rawData: JSON.stringify(item).slice(0, 100),
          });
          return;
        }

        const patientId = String(
          item.patient_id ||
          item.paziente_id ||
          item.patientId ||
          item['ID Paziente'] ||
          defaultPatientId ||
          ''
        ).trim();

        const dosage = String(
          item.dosage ||
          item.dosaggio ||
          item['Dosaggio'] ||
          '1 dose'
        ).trim();

        const unit = String(
          item.unit ||
          item.unita ||
          item['Unità'] ||
          'cpr'
        ).trim();

        const route = String(
          item.route ||
          item.via ||
          item.via_somministrazione ||
          item['Via Somministrazione'] ||
          'Orale'
        ).trim();

        const frequency = String(
          item.frequency ||
          item.frequenza ||
          item.posologia ||
          item['Frequenza'] ||
          '1 volta al giorno'
        ).trim();

        const timingTime = String(
          item.timing_time ||
          item.orario ||
          item.timing ||
          item['Orario'] ||
          '08:00'
        ).trim();

        const mealRelationRaw = String(
          item.meal_relation ||
          item.relazione_pasto ||
          item['Relazione Pasto'] ||
          'independent'
        ).toLowerCase().trim();

        let mealRelation: MealRelation = 'independent';
        if (mealRelationRaw.includes('before') || mealRelationRaw.includes('prima')) mealRelation = 'before';
        else if (mealRelationRaw.includes('during') || mealRelationRaw.includes('durante')) mealRelation = 'during';
        else if (mealRelationRaw.includes('after') || mealRelationRaw.includes('dopo')) mealRelation = 'after';

        const aicCode = aicRaw ? aicRaw.padStart(9, '0') : undefined;

        parsedMedications.push({
          id: item.id || (aicCode ? `med-aic-${aicCode}` : undefined),
          patient_id: patientId,
          drug_name: (drugName || (aicCode ? `Farmaco AIC ${aicCode}` : 'Farmaco')).toUpperCase(),
          active_ingredient: String(
            item.active_ingredient ||
            item.principio_attivo ||
            item['Principio Attivo'] ||
            ''
          ).trim().toUpperCase() || undefined,
          aic_code: aicCode,
          dosage,
          unit,
          route,
          frequency,
          timing_time: timingTime,
          start_date: item.start_date || item.data_inizio || undefined,
          end_date: item.end_date || item.data_fine || undefined,
          indication: item.indication || item.indicazione || undefined,
          meal_relation: mealRelation,
          notes: item.notes || item.note || undefined,
          is_active: item.is_active !== undefined ? Boolean(item.is_active) : true,
        });
      });

      return {
        medications: parsedMedications,
        invalidRows,
        totalRows: items.length,
      };
    } catch (e: any) {
      throw new Error(`Errore di parsing del file JSON: ${e?.message || 'Formato JSON non valido'}`);
    }
  }

  // 2. CSV / TSV FORMAT
  const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    throw new Error('Il file CSV è vuoto.');
  }

  const delimiter = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',';
  const rawHeaders = splitCsvRow(lines[0], delimiter).map((h) =>
    h.toLowerCase().trim().replace(/['"]/g, '')
  );

  const aicIdx = rawHeaders.findIndex((h) => h.includes('aic') || h.includes('codice_aic'));
  const drugIdx = rawHeaders.findIndex((h) =>
    h.includes('farmaco') || h.includes('drug') || h.includes('denominazione') || h.includes('nome')
  );
  const activeIdx = rawHeaders.findIndex((h) => h.includes('principio') || h.includes('active'));
  const doseIdx = rawHeaders.findIndex((h) => h.includes('dosaggio') || h.includes('dosage') || h.includes('dose'));
  const unitIdx = rawHeaders.findIndex((h) => h.includes('unita') || h.includes('unit') || h.includes('forma'));
  const routeIdx = rawHeaders.findIndex((h) => h.includes('via') || h.includes('route'));
  const freqIdx = rawHeaders.findIndex((h) => h.includes('frequenza') || h.includes('frequency') || h.includes('posologia'));
  const timeIdx = rawHeaders.findIndex((h) => h.includes('orario') || h.includes('timing') || h.includes('ora'));
  const startIdx = rawHeaders.findIndex((h) => h.includes('inizio') || h.includes('start'));
  const endIdx = rawHeaders.findIndex((h) => h.includes('fine') || h.includes('end'));
  const indIdx = rawHeaders.findIndex((h) => h.includes('indicazione') || h.includes('indication') || h.includes('motivo'));
  const mealIdx = rawHeaders.findIndex((h) => h.includes('pasto') || h.includes('meal'));
  const notesIdx = rawHeaders.findIndex((h) => h.includes('note') || h.includes('notes'));
  const patIdx = rawHeaders.findIndex((h) => h.includes('paziente') || h.includes('patient'));

  if (drugIdx === -1 && aicIdx === -1) {
    throw new Error(
      'Impossibile riconoscere le colonne del file CSV. Assicurati che contenga almeno "Nome Farmaco" (o "Denominazione") o "Codice AIC".'
    );
  }

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvRow(lines[i], delimiter);
    const rawAic = (aicIdx >= 0 ? cols[aicIdx] : '').replace(/\D/g, '').trim();
    const drugName = (drugIdx >= 0 ? cols[drugIdx] : '').trim();

    if (!drugName && !rawAic) {
      invalidRows.push({
        rowNumber: i + 1,
        aic: rawAic,
        drugName,
        error: 'Nome farmaco o Codice AIC assente nella riga',
        rawData: lines[i].slice(0, 80),
      });
      continue;
    }

    const patientId = (patIdx >= 0 && cols[patIdx] ? cols[patIdx].trim() : '') || defaultPatientId || '';
    const formattedAic = rawAic ? rawAic.padStart(9, '0') : undefined;

    const mealRaw = (mealIdx >= 0 ? cols[mealIdx] : '').toLowerCase();
    let mealRelation: MealRelation = 'independent';
    if (mealRaw.includes('prima') || mealRaw.includes('before')) mealRelation = 'before';
    else if (mealRaw.includes('durante') || mealRaw.includes('during')) mealRelation = 'during';
    else if (mealRaw.includes('dopo') || mealRaw.includes('after')) mealRelation = 'after';

    parsedMedications.push({
      id: formattedAic ? `med-aic-${formattedAic}` : undefined,
      patient_id: patientId,
      drug_name: (drugName || (formattedAic ? `Farmaco AIC ${formattedAic}` : 'Farmaco')).toUpperCase(),
      active_ingredient: (activeIdx >= 0 ? cols[activeIdx] : '').trim().toUpperCase() || undefined,
      aic_code: formattedAic,
      dosage: (doseIdx >= 0 && cols[doseIdx] ? cols[doseIdx].trim() : '1 dose'),
      unit: (unitIdx >= 0 && cols[unitIdx] ? cols[unitIdx].trim() : 'cpr'),
      route: (routeIdx >= 0 && cols[routeIdx] ? cols[routeIdx].trim() : 'Orale'),
      frequency: (freqIdx >= 0 && cols[freqIdx] ? cols[freqIdx].trim() : '1 volta al giorno'),
      timing_time: (timeIdx >= 0 && cols[timeIdx] ? cols[timeIdx].trim() : '08:00'),
      start_date: (startIdx >= 0 && cols[startIdx] ? cols[startIdx].trim() : undefined),
      end_date: (endIdx >= 0 && cols[endIdx] ? cols[endIdx].trim() : undefined),
      indication: (indIdx >= 0 && cols[indIdx] ? cols[indIdx].trim() : undefined),
      meal_relation: mealRelation,
      notes: (notesIdx >= 0 && cols[notesIdx] ? cols[notesIdx].trim() : undefined),
      is_active: true,
    });
  }

  return {
    medications: parsedMedications,
    invalidRows,
    totalRows: lines.length - 1,
  };
}

/**
 * Batch imports medications into the `medications` storage / table.
 * Includes AIC-based deduplication logic and automatic timestamp updates (updated_at).
 */
export async function batchUpsertMedications(
  medications: Partial<Medication>[],
  defaultPatientId?: string,
  sourceName: string = 'Importazione Dati'
): Promise<MedicationImportReport> {
  const now = new Date().toISOString();
  const report: MedicationImportReport = {
    totalRows: medications.length,
    inserted: 0,
    updated: 0,
    skipped: 0,
    invalidRows: [],
    importedAt: now,
    sourceName,
    patientId: defaultPatientId,
  };

  if (!medications || medications.length === 0) {
    return report;
  }

  // 1. In-memory deduplication pass across the incoming batch
  // Groups by `${patient_id}::${aic_code}` when AIC code is present
  const deduplicatedList: Partial<Medication>[] = [];
  const seenAicMap = new Map<string, number>();

  medications.forEach((med, idx) => {
    const patientId = med.patient_id || defaultPatientId || '';
    const aic = (med.aic_code || '').trim();

    if (patientId && aic) {
      const key = `${patientId}::${aic}`;
      if (seenAicMap.has(key)) {
        const existingIdx = seenAicMap.get(key)!;
        // Merge with latest incoming row
        deduplicatedList[existingIdx] = {
          ...deduplicatedList[existingIdx],
          ...med,
          patient_id: patientId,
          updated_at: now,
        };
        return;
      } else {
        seenAicMap.set(key, deduplicatedList.length);
      }
    }
    deduplicatedList.push({
      ...med,
      patient_id: patientId,
      updated_at: now,
    });
  });

  // 2. Perform upsert in Local Storage
  const localStats = localDb.batchUpsertMedications(deduplicatedList, defaultPatientId);
  report.inserted = localStats.inserted;
  report.updated = localStats.updated;

  // 3. Perform sync in Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      // Retrieve existing records to accurately update by AIC code
      const patientIds = Array.from(new Set(deduplicatedList.map((m) => m.patient_id).filter(Boolean)));
      
      for (const pId of patientIds) {
        const { data: existingDbMeds } = await supabase
          .from('medications')
          .select('id, aic_code, patient_id')
          .eq('patient_id', pId);

        const existingByAic = new Map<string, string>();
        if (existingDbMeds) {
          existingDbMeds.forEach((em: any) => {
            if (em.aic_code) {
              existingByAic.set(em.aic_code.trim(), em.id);
            }
          });
        }

        const patientMeds = deduplicatedList.filter((m) => (m.patient_id || defaultPatientId) === pId);
        
        for (const med of patientMeds) {
          const cleanAic = (med.aic_code || '').trim();
          const existingId = cleanAic ? existingByAic.get(cleanAic) : undefined;

          if (existingId) {
            // Update existing medication and refresh updated_at
            await supabase
              .from('medications')
              .update({
                drug_name: med.drug_name,
                active_ingredient: med.active_ingredient,
                aic_code: cleanAic || undefined,
                dosage: med.dosage,
                unit: med.unit,
                route: med.route,
                frequency: med.frequency,
                timing_time: med.timing_time,
                start_date: med.start_date,
                end_date: med.end_date,
                indication: med.indication,
                meal_relation: med.meal_relation || 'independent',
                notes: med.notes,
                is_active: med.is_active !== undefined ? med.is_active : true,
                updated_at: now,
              })
              .eq('id', existingId);
          } else {
            // Insert new medication
            const { data: insertedMed } = await supabase
              .from('medications')
              .insert([{
                patient_id: pId,
                drug_name: med.drug_name,
                active_ingredient: med.active_ingredient,
                aic_code: cleanAic || undefined,
                dosage: med.dosage || '1 dose',
                unit: med.unit || 'cpr',
                route: med.route || 'Orale',
                frequency: med.frequency || '1 volta al giorno',
                timing_time: med.timing_time || '08:00',
                start_date: med.start_date,
                end_date: med.end_date,
                indication: med.indication,
                meal_relation: med.meal_relation || 'independent',
                notes: med.notes,
                is_active: med.is_active !== undefined ? med.is_active : true,
                created_at: now,
                updated_at: now,
              }])
              .select('id, aic_code')
              .maybeSingle();

            if (insertedMed && cleanAic) {
              existingByAic.set(cleanAic, insertedMed.id);
            }
          }
        }
      }
    } catch (err) {
      console.warn('Supabase batchUpsertMedications sync warning:', err);
    }
  }

  return report;
}

/**
 * Main utility function to parse and import CSV or JSON data directly into the 'medications' table.
 * Includes AIC-based deduplication and updated_at modification timestamps.
 */
export async function importMedicationsData(
  fileContent: string,
  fileNameOrOptions?: string | MedicationImportOptions,
  defaultPatientId?: string,
  options?: MedicationImportOptions
): Promise<MedicationImportReport> {
  let opts: MedicationImportOptions | undefined;
  let sourceName = 'import_medications';
  let patientId = defaultPatientId;

  if (typeof fileNameOrOptions === 'object' && fileNameOrOptions !== null) {
    opts = fileNameOrOptions;
    patientId = opts.patientId || opts.defaultPatientId || defaultPatientId;
    sourceName = opts.sourceName || 'import_medications';
  } else if (typeof fileNameOrOptions === 'string') {
    sourceName = fileNameOrOptions;
    opts = options;
    patientId = opts?.patientId || opts?.defaultPatientId || defaultPatientId;
  }

  // 1. Parse file
  const { medications, invalidRows, totalRows } = parseMedicationsCsvOrJson(fileContent, patientId);

  // 2. Perform deduplication and import
  const report = await batchUpsertMedications(medications, patientId, sourceName);
  report.totalRows = totalRows;
  report.skipped = invalidRows.length;
  report.invalidRows = invalidRows;

  return report;
}

/**
 * Helper to split CSV row respecting quotation marks.
 */
function splitCsvRow(row: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"' || char === "'") {
      if (inQuotes && row[i + 1] === char) {
        current += char;
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
