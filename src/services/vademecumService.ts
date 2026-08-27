import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { localDb } from '../lib/localDb';
import { VademecumMedication, AifaImportReport } from '../types';

export interface VademecumFilterOptions {
  searchQuery?: string;
  reimbursementClass?: string; // 'A', 'C', 'H', 'OTC'
  route?: string; // 'Orale', 'Inalatoria', 'Sottocutanea', 'Parenterale', etc.
  prescriptionRegime?: string; // 'RR', 'RNR', 'OTC', 'SOP'
}

/**
 * Searches medications from Supabase `vademecum_medications` with localDb fallback.
 */
export async function searchVademecumMedications(
  options: VademecumFilterOptions = {}
): Promise<{ data: VademecumMedication[]; error: string | null; totalCount: number }> {
  const { searchQuery, reimbursementClass, route, prescriptionRegime } = options;

  try {
    if (isSupabaseConfigured()) {
      let query = supabase.from('vademecum_medications').select('*', { count: 'exact' });

      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.trim();
        // Supabase or search over trade_name, active_ingredient, aic_code, atc_code
        query = query.or(
          `trade_name.ilike.%${q}%,active_ingredient.ilike.%${q}%,aic_code.ilike.%${q}%,atc_code.ilike.%${q}%,holder_company.ilike.%${q}%`
        );
      }

      if (reimbursementClass) {
        query = query.ilike('reimbursement_class', `${reimbursementClass}%`);
      }

      if (route) {
        query = query.ilike('admin_route', `%${route}%`);
      }

      if (prescriptionRegime) {
        query = query.ilike('prescription_regime', `%${prescriptionRegime}%`);
      }

      query = query.order('trade_name', { ascending: true }).limit(200);

      const { data, error, count } = await query;

      if (!error && data && data.length > 0) {
        return {
          data: data as VademecumMedication[],
          error: null,
          totalCount: count ?? data.length,
        };
      }
    }
  } catch (err) {
    console.warn('Supabase searchVademecumMedications fallback to localDb:', err);
  }

  // Fallback to local storage
  const localResults = localDb.getVademecumMedications(searchQuery, {
    reimbursementClass,
    route,
    prescriptionRegime,
  });

  return {
    data: localResults,
    error: null,
    totalCount: localResults.length,
  };
}

/**
 * Fetches a single medication by AIC code.
 */
export async function getMedicationByAic(
  aicCode: string
): Promise<{ data: VademecumMedication | null; error: string | null }> {
  const cleanAic = aicCode.trim();

  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('vademecum_medications')
        .select('*')
        .eq('aic_code', cleanAic)
        .maybeSingle();

      if (!error && data) {
        return { data: data as VademecumMedication, error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase getMedicationByAic fallback to localDb:', err);
  }

  const local = localDb.getVademecumMedicationByAic(cleanAic);
  return { data: local, error: null };
}

/**
 * Inserts or updates a single medication in Vademecum.
 */
export async function saveVademecumMedication(
  medication: VademecumMedication
): Promise<{ data: VademecumMedication; error: string | null }> {
  const localSaved = localDb.upsertVademecumMedication(medication);

  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('vademecum_medications')
        .upsert(
          {
            ...medication,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'aic_code' }
        )
        .select()
        .single();

      if (!error && data) {
        return { data: data as VademecumMedication, error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase saveVademecumMedication error:', err);
  }

  return { data: localSaved, error: null };
}

/**
 * Parses CSV/TSV or JSON file content and batch imports into the Vademecum catalog.
 * Supports standard AIFA open data columns:
 * Codice AIC, Denominazione e Confezione (Trade Name), Principio Attivo, Ditta Titolare AIC,
 * ATC, Forma Farmaceutica, Dosaggio, Via di Somministrazione, Classe, Regime di Fornitura, Note.
 */
export async function parseAndImportAifaData(
  fileContent: string,
  fileName: string
): Promise<AifaImportReport> {
  const importTime = new Date().toISOString();
  const report: AifaImportReport = {
    totalRows: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    invalidRows: [],
    importedAt: importTime,
    sourceName: fileName || 'Importazione Dati AIFA',
  };

  const parsedMedications: VademecumMedication[] = [];
  const trimmed = fileContent.trim();

  // Handle JSON format
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsedJson = JSON.parse(trimmed);
      const items: any[] = Array.isArray(parsedJson) ? parsedJson : [parsedJson];
      report.totalRows = items.length;

      items.forEach((item, index) => {
        const aic = String(
          item.aic_code ||
          item.aic ||
          item.codice_aic ||
          item.AIC ||
          item['Codice AIC'] ||
          ''
        ).trim();

        const tradeName = String(
          item.trade_name ||
          item.denominazione ||
          item.nome_commerciale ||
          item.name ||
          item['Denominazione'] ||
          ''
        ).trim();

        if (!aic || !tradeName) {
          report.invalidRows.push({
            rowNumber: index + 1,
            aic,
            error: 'Campi obbligatori mancanti (AIC e Denominazione / Nome commerciale richiesti)',
            rawData: JSON.stringify(item).slice(0, 100),
          });
          report.skipped++;
          return;
        }

        parsedMedications.push({
          id: item.id || `aifa-${aic}`,
          trade_name: tradeName.toUpperCase(),
          active_ingredient: (
            item.active_ingredient ||
            item.principio_attivo ||
            item['Principio Attivo'] ||
            ''
          ).trim().toUpperCase(),
          aic_code: aic.padStart(9, '0'), // Standard 9 digits
          pharma_form: (item.pharma_form || item.forma || item['Forma Farmaceutica'] || '').trim(),
          dosage: (item.dosage || item.dosaggio || item['Dosaggio'] || '').trim(),
          package_desc: (item.package_desc || item.confezione || item['Confezione'] || '').trim(),
          units_count: String(item.units_count || item.unita || item['Unità'] || '').trim(),
          holder_company: (item.holder_company || item.titolare || item['Ditta'] || '').trim(),
          admin_route: (item.admin_route || item.via || item['Via Somministrazione'] || 'Orale').trim(),
          atc_code: (item.atc_code || item.atc || item['Codice ATC'] || '').trim().toUpperCase(),
          reimbursement_class: (item.reimbursement_class || item.classe || item['Classe'] || 'A').trim(),
          prescription_regime: (item.prescription_regime || item.regime || item['Regime Fornitura'] || 'RR').trim(),
          marketing_status: (item.marketing_status || item.stato || item['Stato'] || 'In commercio').trim(),
          official_notes: (item.official_notes || item.note || item['Note AIFA'] || '').trim(),
          source: `AIFA - Import (${fileName})`,
          source_updated_at: importTime,
        });
      });
    } catch (e: any) {
      throw new Error(`Errore di parsing del file JSON: ${e?.message || 'Formato non valido'}`);
    }
  } else {
    // Handle CSV / TSV format
    const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) {
      throw new Error('Il file è vuoto.');
    }

    report.totalRows = lines.length - 1; // excluding header
    const delimiter = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',';
    const headerLine = lines[0];
    const rawHeaders = splitCsvRow(headerLine, delimiter).map((h) =>
      h.toLowerCase().trim().replace(/['"]/g, '')
    );

    // Map common header variations
    const aicIdx = rawHeaders.findIndex((h) =>
      h.includes('aic') || h.includes('codice') || h === 'aic_code'
    );
    const tradeIdx = rawHeaders.findIndex((h) =>
      h.includes('denominazione') || h.includes('farmaco') || h.includes('trade_name') || h.includes('nome')
    );
    const activeIdx = rawHeaders.findIndex((h) =>
      h.includes('principio') || h.includes('active_ingredient')
    );
    const formIdx = rawHeaders.findIndex((h) =>
      h.includes('forma') || h.includes('pharma_form')
    );
    const doseIdx = rawHeaders.findIndex((h) =>
      h.includes('dosaggio') || h.includes('dosage')
    );
    const packIdx = rawHeaders.findIndex((h) =>
      h.includes('confezione') || h.includes('package_desc')
    );
    const holderIdx = rawHeaders.findIndex((h) =>
      h.includes('titolare') || h.includes('ditta') || h.includes('holder')
    );
    const atcIdx = rawHeaders.findIndex((h) =>
      h.includes('atc')
    );
    const routeIdx = rawHeaders.findIndex((h) =>
      h.includes('via') || h.includes('route')
    );
    const classIdx = rawHeaders.findIndex((h) =>
      h.includes('classe') || h.includes('rimborsabilita')
    );
    const regimeIdx = rawHeaders.findIndex((h) =>
      h.includes('regime') || h.includes('ricetta')
    );
    const notesIdx = rawHeaders.findIndex((h) =>
      h.includes('nota') || h.includes('note')
    );

    if (tradeIdx === -1 && aicIdx === -1) {
      throw new Error(
        'Impossibile riconoscere le colonne del file CSV. Assicurati che contenga almeno "Denominazione" (o "Nome") e "Codice AIC".'
      );
    }

    for (let i = 1; i < lines.length; i++) {
      const cols = splitCsvRow(lines[i], delimiter);
      const aic = (aicIdx >= 0 ? cols[aicIdx] : '').replace(/\D/g, '').trim();
      const tradeName = (tradeIdx >= 0 ? cols[tradeIdx] : '').trim();

      if (!tradeName || tradeName.length < 2) {
        report.invalidRows.push({
          rowNumber: i + 1,
          aic,
          error: 'Denominazione farmaco assente o non valida',
          rawData: lines[i].slice(0, 80),
        });
        report.skipped++;
        continue;
      }

      const formattedAic = aic ? aic.padStart(9, '0') : `IMP${i.toString().padStart(6, '0')}`;

      parsedMedications.push({
        id: `aifa-${formattedAic}`,
        trade_name: tradeName.toUpperCase(),
        active_ingredient: (activeIdx >= 0 ? cols[activeIdx] : '').trim().toUpperCase(),
        aic_code: formattedAic,
        pharma_form: (formIdx >= 0 ? cols[formIdx] : '').trim(),
        dosage: (doseIdx >= 0 ? cols[doseIdx] : '').trim(),
        package_desc: (packIdx >= 0 ? cols[packIdx] : '').trim(),
        holder_company: (holderIdx >= 0 ? cols[holderIdx] : '').trim(),
        admin_route: (routeIdx >= 0 && cols[routeIdx] ? cols[routeIdx] : 'Orale').trim(),
        atc_code: (atcIdx >= 0 ? cols[atcIdx] : '').trim().toUpperCase(),
        reimbursement_class: (classIdx >= 0 && cols[classIdx] ? cols[classIdx] : 'A').trim(),
        prescription_regime: (regimeIdx >= 0 && cols[regimeIdx] ? cols[regimeIdx] : 'RR').trim(),
        marketing_status: 'In commercio',
        official_notes: (notesIdx >= 0 ? cols[notesIdx] : '').trim(),
        source: `AIFA - Import (${fileName})`,
        source_updated_at: importTime,
      });
    }
  }

  // Batch upsert to LocalDb
  const localStats = localDb.batchUpsertVademecum(parsedMedications);
  report.inserted = localStats.inserted;
  report.updated = localStats.updated;

  // If Supabase is configured, sync batch to Supabase
  if (isSupabaseConfigured() && parsedMedications.length > 0) {
    try {
      const batchSize = 100;
      for (let j = 0; j < parsedMedications.length; j += batchSize) {
        const chunk = parsedMedications.slice(j, j + batchSize);
        await supabase.from('vademecum_medications').upsert(
          chunk.map((m) => ({
            ...m,
            updated_at: importTime,
          })),
          { onConflict: 'aic_code' }
        );
      }
    } catch (err) {
      console.warn('Supabase batch upsert error during import:', err);
    }
  }

  return report;
}

/**
 * Resets the Vademecum catalog to the default official AIFA dataset.
 */
export function resetVademecumCatalog(): VademecumMedication[] {
  return localDb.resetVademecumToDefault();
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
