import React, { useState, useEffect } from 'react';
import {
  X,
  Pill,
  Search,
  Sparkles,
  Clock,
  Calendar,
  UserCheck,
  Utensils,
  Plus,
  Trash2,
  FileText,
} from 'lucide-react';
import { Medication, MealRelation, VademecumMedication } from '../../../../types';
import { searchVademecumMedications } from '../../../../services/vademecumService';

interface MedicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  medication: Medication | null;
  patientId: string;
  onSave: (med: Partial<Medication>) => Promise<void>;
}

export function MedicationFormModal({
  isOpen,
  onClose,
  medication,
  patientId,
  onSave,
}: MedicationFormModalProps) {
  // Vademecum Autocomplete state
  const [vademecumSearch, setVademecumSearch] = useState('');
  const [vademecumResults, setVademecumResults] = useState<VademecumMedication[]>([]);
  const [searchingVademecum, setSearchingVademecum] = useState(false);

  // Form Fields
  const [drugName, setDrugName] = useState('');
  const [activeIngredient, setActiveIngredient] = useState('');
  const [aicCode, setAicCode] = useState('');
  const [dosage, setDosage] = useState('1');
  const [unit, setUnit] = useState('cpr');
  const [pharmaForm, setPharmaForm] = useState('Compresse');
  const [route, setRoute] = useState('Orale');
  const [frequency, setFrequency] = useState('1 volta al giorno');
  const [timingTime, setTimingTime] = useState('08:00');
  const [scheduledTimes, setScheduledTimes] = useState<string[]>(['08:00']);
  const [newTimeInput, setNewTimeInput] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [prescribedBy, setPrescribedBy] = useState('');
  const [indication, setIndication] = useState('');
  const [mealRelation, setMealRelation] = useState<MealRelation>('independent');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Setup initial values on open
  useEffect(() => {
    if (isOpen) {
      if (medication) {
        setDrugName(medication.drug_name || '');
        setActiveIngredient(medication.active_ingredient || '');
        setAicCode(medication.aic_code || '');
        setDosage(medication.dosage || '1');
        setUnit(medication.unit || 'cpr');
        setPharmaForm(medication.pharma_form || 'Compresse');
        setRoute(medication.route || 'Orale');
        setFrequency(medication.frequency || '1 volta al giorno');
        setTimingTime(medication.timing_time || '08:00');
        const times = medication.scheduled_times || (medication.timing_time ? medication.timing_time.split('–').map((s) => s.trim()) : ['08:00']);
        setScheduledTimes(times);
        setStartDate(medication.start_date || '');
        setEndDate(medication.end_date || '');
        setPrescribedBy(medication.prescribed_by || '');
        setIndication(medication.indication || '');
        setMealRelation(medication.meal_relation || 'independent');
        setNotes(medication.notes || '');
      } else {
        setDrugName('');
        setActiveIngredient('');
        setAicCode('');
        setDosage('1');
        setUnit('cpr');
        setPharmaForm('Compresse');
        setRoute('Orale');
        setFrequency('1 volta al giorno');
        setTimingTime('08:00');
        setScheduledTimes(['08:00']);
        setStartDate(new Date().toISOString().slice(0, 10));
        setEndDate('');
        setPrescribedBy('Dott.ssa Laura Fontana (MMG)');
        setIndication('');
        setMealRelation('independent');
        setNotes('');
      }
      setVademecumSearch('');
      setVademecumResults([]);
      setError(null);
    }
  }, [isOpen, medication]);

  // Vademecum autocomplete search debounce
  useEffect(() => {
    if (!vademecumSearch.trim()) {
      setVademecumResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingVademecum(true);
      try {
        const res = await searchVademecumMedications({
          searchQuery: vademecumSearch.trim(),
        });
        setVademecumResults(res.data.slice(0, 6));
      } catch (err) {
        console.error('Vademecum search error:', err);
      } finally {
        setSearchingVademecum(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [vademecumSearch]);

  const handleSelectVademecumMed = (vMed: VademecumMedication) => {
    setDrugName(vMed.trade_name);
    setActiveIngredient(vMed.active_ingredient || '');
    setAicCode(vMed.aic_code || '');
    setDosage(vMed.dosage || '1');
    setPharmaForm(vMed.pharma_form || 'Compresse');

    const form = (vMed.pharma_form || '').toLowerCase();
    if (form.includes('compress') || form.includes('cpr')) setUnit('cpr');
    else if (form.includes('gocc')) setUnit('gocce');
    else if (form.includes('bustin') || form.includes('granulat')) setUnit('bustina');
    else if (form.includes('sciropp') || form.includes('soluzion')) setUnit('ml');
    else if (form.includes('fial') || form.includes('iniettabil')) setUnit('fiala');
    else if (form.includes('cerott')) setUnit('cerotto');
    else if (form.includes('insulin') || form.includes('penna')) setUnit('UI');
    else setUnit('cpr');

    setRoute(vMed.admin_route || 'Orale');
    if (vMed.official_notes && !notes) {
      setNotes(vMed.official_notes);
    }
    setVademecumSearch('');
    setVademecumResults([]);
  };

  const handleAddScheduledTime = () => {
    if (!newTimeInput || scheduledTimes.includes(newTimeInput)) return;
    const updated = [...scheduledTimes, newTimeInput].sort();
    setScheduledTimes(updated);
    setTimingTime(updated.join(' – '));
    setNewTimeInput('');
  };

  const handleRemoveScheduledTime = (timeToRemove: string) => {
    const updated = scheduledTimes.filter((t) => t !== timeToRemove);
    setScheduledTimes(updated);
    setTimingTime(updated.join(' – '));
  };

  const handlePresetFrequency = (preset: '1' | '2' | '3' | 'bid') => {
    if (preset === '1') {
      setFrequency('1 volta al giorno (mattino)');
      setScheduledTimes(['08:00']);
      setTimingTime('08:00');
    } else if (preset === '2') {
      setFrequency('2 volte al giorno (ogni 12 ore)');
      setScheduledTimes(['08:00', '20:00']);
      setTimingTime('08:00 – 20:00');
    } else if (preset === '3') {
      setFrequency('3 volte al giorno (ogni 8 ore)');
      setScheduledTimes(['08:00', '14:00', '20:00']);
      setTimingTime('08:00 – 14:00 – 20:00');
    } else if (preset === 'bid') {
      setFrequency('Al bisogno');
      setScheduledTimes(['Al bisogno']);
      setTimingTime('Al bisogno');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drugName.trim()) {
      setError('Inserisci il nome commerciale del farmaco');
      return;
    }
    if (!dosage.trim()) {
      setError('Inserisci il dosaggio');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave({
        drug_name: drugName.trim(),
        active_ingredient: activeIngredient.trim() || undefined,
        aic_code: aicCode.trim() || undefined,
        dosage: dosage.trim(),
        unit: unit.trim() || 'cpr',
        pharma_form: pharmaForm.trim() || 'Compresse',
        route: route.trim() || 'Orale',
        frequency: frequency.trim(),
        timing_time: scheduledTimes.length > 0 ? scheduledTimes.join(' – ') : timingTime,
        scheduled_times: scheduledTimes.length > 0 ? scheduledTimes : [timingTime || '08:00'],
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        prescribed_by: prescribedBy.trim() || undefined,
        indication: indication.trim() || undefined,
        meal_relation: mealRelation,
        notes: notes.trim() || undefined,
        status: medication?.status || 'active',
        is_active: medication ? medication.is_active : true,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Errore nel salvataggio della terapia');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {medication ? 'Modifica Terapia Farmacologica' : 'Nuova Terapia Farmacologica'}
              </h3>
              <p className="text-xs text-slate-500">
                Compila i dettagli posologici e orari di somministrazione
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200">
              {error}
            </div>
          )}

          {/* Vademecum Autocomplete Search */}
          {!medication && (
            <div className="relative bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Cerca nel Vademecum AIFA per autocompletamento rapido
                </span>
                {searchingVademecum && (
                  <span className="text-[10px] text-emerald-600 font-medium animate-pulse">
                    Ricerca in corso...
                  </span>
                )}
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={vademecumSearch}
                  onChange={(e) => setVademecumSearch(e.target.value)}
                  placeholder="Es. Tachipirina, Bisoprololo, Cardioaspirina, Augmentin..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Suggestions Dropdown */}
              {vademecumResults.length > 0 && (
                <div className="absolute left-3.5 right-3.5 top-full mt-1 bg-white rounded-xl shadow-xl border border-emerald-200 z-30 max-h-48 overflow-y-auto divide-y divide-slate-100">
                  {vademecumResults.map((vMed) => (
                    <button
                      key={vMed.id}
                      type="button"
                      onClick={() => handleSelectVademecumMed(vMed)}
                      className="w-full text-left p-2.5 hover:bg-emerald-50 transition-colors flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-800">{vMed.trade_name}</div>
                        <div className="text-[11px] text-slate-500">
                          {vMed.active_ingredient} • {vMed.dosage} • {vMed.pharma_form}
                        </div>
                      </div>
                      {vMed.aic_code && (
                        <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                          AIC {vMed.aic_code}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Drug Name & Active Ingredient */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nome Commerciale Farmaco *
              </label>
              <input
                type="text"
                value={drugName}
                onChange={(e) => setDrugName(e.target.value)}
                placeholder="es. Tachipirina 1000 mg"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Principio Attivo
              </label>
              <input
                type="text"
                value={activeIngredient}
                onChange={(e) => setActiveIngredient(e.target.value)}
                placeholder="es. Paracetamolo"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* AIC Code, Dosage, Unit, Pharma Form */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Codice AIC
              </label>
              <input
                type="text"
                value={aicCode}
                onChange={(e) => setAicCode(e.target.value)}
                placeholder="es. 024982012"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Dosaggio *
              </label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="es. 1, 1000 mg, 20"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Unità Misura
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="cpr">cpr (compressa)</option>
                <option value="gocce">gocce</option>
                <option value="bustina">bustina</option>
                <option value="ml">ml</option>
                <option value="fiala">fiala</option>
                <option value="cerotto">cerotto</option>
                <option value="UI">UI</option>
                <option value="dose">dose</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Forma Farmaceutica
              </label>
              <input
                type="text"
                value={pharmaForm}
                onChange={(e) => setPharmaForm(e.target.value)}
                placeholder="es. Compresse, Gocce"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Route & Prescriber */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Via di Somministrazione
              </label>
              <select
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Orale">Orale (per bocca)</option>
                <option value="Sublinguale">Sublinguale</option>
                <option value="Transdermico">Transdermico (cerotto)</option>
                <option value="Sottocutaneo">Sottocutaneo (s.c.)</option>
                <option value="Inalatorio">Inalatorio / Aerosol</option>
                <option value="Rettale">Rettale (supposta)</option>
                <option value="Oftalmico">Oftalmico (collirio)</option>
                <option value="Topico">Topico / Cutaneo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Medico Prescrittore
              </label>
              <input
                type="text"
                value={prescribedBy}
                onChange={(e) => setPrescribedBy(e.target.value)}
                placeholder="es. Dott.ssa Laura Fontana (MMG)"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Frequency & Scheduled Times */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Orari Programmati di Somministrazione
              </label>
              {/* Presets */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handlePresetFrequency('1')}
                  className="px-2 py-0.5 text-[10px] font-semibold rounded bg-white hover:bg-slate-100 border border-slate-200"
                >
                  1x die (08:00)
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetFrequency('2')}
                  className="px-2 py-0.5 text-[10px] font-semibold rounded bg-white hover:bg-slate-100 border border-slate-200"
                >
                  2x die (08–20)
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetFrequency('3')}
                  className="px-2 py-0.5 text-[10px] font-semibold rounded bg-white hover:bg-slate-100 border border-slate-200"
                >
                  3x die (08–14–20)
                </button>
              </div>
            </div>

            <div>
              <input
                type="text"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="es. 3 volte al giorno (ogni 8 ore)"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Time chips */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {scheduledTimes.map((time, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 shadow-2xs"
                >
                  <span>🕒 {time}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveScheduledTime(time)}
                    className="text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <div className="flex items-center gap-1">
                <input
                  type="time"
                  value={newTimeInput}
                  onChange={(e) => setNewTimeInput(e.target.value)}
                  className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddScheduledTime}
                  disabled={!newTimeInput}
                  className="px-2 py-1 bg-slate-800 text-white rounded-lg text-xs font-semibold disabled:opacity-40"
                >
                  + Aggiungi
                </button>
              </div>
            </div>
          </div>

          {/* Dates & Meal relation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Data Inizio *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Data Fine Prevista
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Utensils className="w-3.5 h-3.5 text-slate-400" />
                Assunzione Pasti
              </label>
              <select
                value={mealRelation}
                onChange={(e) => setMealRelation(e.target.value as MealRelation)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="independent">Indipendente dai pasti</option>
                <option value="before">Prima dei pasti</option>
                <option value="during">Durante i pasti</option>
                <option value="after">Dopo i pasti</option>
              </select>
            </div>
          </div>

          {/* Indication */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Indicazione Clinica / Patologia Trattata
            </label>
            <input
              type="text"
              value={indication}
              onChange={(e) => setIndication(e.target.value)}
              placeholder="es. Ipertensione essenziale, Dolore acuto, Diabete tipo 2..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Note ed Avvertenze per l'Operatore OSS
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="es. Verificare PA e frequenza prima di somministrare. Non frantumare la compressa..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Annulla
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              {saving ? 'Salvataggio in corso...' : medication ? 'Salva Modifiche' : 'Crea Terapia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
