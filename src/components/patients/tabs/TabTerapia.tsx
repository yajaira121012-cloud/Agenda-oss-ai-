import React, { useState, useEffect } from 'react';
import {
  Pill,
  Plus,
  Trash2,
  Edit2,
  Clock,
  AlertCircle,
  CheckCircle2,
  X,
  Calendar,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { Medication, MealRelation } from '../../../types';
import {
  getMedicationsByPatient,
  createMedication,
  updateMedication,
  deleteMedication,
  toggleMedicationActive,
} from '../../../services/medicationsService';

interface TabTerapiaProps {
  patientId: string;
}

export function TabTerapia({ patientId }: TabTerapiaProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [drugName, setDrugName] = useState('');
  const [activeIngredient, setActiveIngredient] = useState('');
  const [dosage, setDosage] = useState('');
  const [unit, setUnit] = useState('cpr');
  const [route, setRoute] = useState('Orale');
  const [frequency, setFrequency] = useState('1 volta al giorno');
  const [timingTime, setTimingTime] = useState('08:00');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [indication, setIndication] = useState('');
  const [mealRelation, setMealRelation] = useState<MealRelation>('independent');
  const [notes, setNotes] = useState('');

  const loadMedications = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data, error } = await getMedicationsByPatient(patientId);
      if (error) {
        setErrorMessage(error);
      } else {
        setMedications(data || []);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Errore nel recupero della terapia');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedications();
  }, [patientId]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setDrugName('');
    setActiveIngredient('');
    setDosage('');
    setUnit('cpr');
    setRoute('Orale');
    setFrequency('1 volta al giorno');
    setTimingTime('08:00');
    setStartDate(new Date().toISOString().slice(0, 10));
    setEndDate('');
    setIndication('');
    setMealRelation('independent');
    setNotes('');
    setModalOpen(true);
  };

  const handleOpenEdit = (m: Medication) => {
    setEditingId(m.id);
    setDrugName(m.drug_name);
    setActiveIngredient(m.active_ingredient || '');
    setDosage(m.dosage);
    setUnit(m.unit || 'cpr');
    setRoute(m.route || 'Orale');
    setFrequency(m.frequency);
    setTimingTime(m.timing_time || '');
    setStartDate(m.start_date || '');
    setEndDate(m.end_date || '');
    setIndication(m.indication || '');
    setMealRelation(m.meal_relation);
    setNotes(m.notes || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drugName.trim() || !dosage.trim() || !frequency.trim()) {
      alert('Compila i campi obbligatori: Nome Farmaco, Dosaggio e Frequenza');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        patient_id: patientId,
        drug_name: drugName.trim(),
        active_ingredient: activeIngredient.trim() || undefined,
        dosage: dosage.trim(),
        unit: unit.trim() || 'cpr',
        route: route.trim() || 'Orale',
        frequency: frequency.trim(),
        timing_time: timingTime.trim() || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        indication: indication.trim() || undefined,
        meal_relation: mealRelation,
        notes: notes.trim() || undefined,
        is_active: true,
      };

      if (editingId) {
        const { error } = await updateMedication(editingId, payload);
        if (error) throw new Error(error);
      } else {
        const { error } = await createMedication(payload);
        if (error) throw new Error(error);
      }

      setModalOpen(false);
      loadMedications();
    } catch (err: any) {
      alert(err.message || 'Errore nel salvataggio della terapia');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const { success, error } = await toggleMedicationActive(id, !currentStatus);
    if (success) {
      loadMedications();
    } else {
      alert(error || 'Errore nel cambio stato');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Eliminare definitivamente la terapia "${name}"?`)) {
      const { success, error } = await deleteMedication(id);
      if (success) {
        loadMedications();
      } else {
        alert(error || 'Errore nella cancellazione');
      }
    }
  };

  const mealRelationLabels: Record<MealRelation, string> = {
    before: 'Prima dei pasti',
    during: 'Durante i pasti',
    after: 'Dopo i pasti',
    independent: 'Indipendente dai pasti',
  };

  const activeMeds = medications.filter((m) => m.is_active);
  const inactiveMeds = medications.filter((m) => !m.is_active);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Schema Terapia Farmacologica</h3>
          <p className="text-xs text-slate-500">
            Documentazione e pianificazione oraria delle somministrazioni prescritte dal medico
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Aggiungi Terapia
        </button>
      </div>

      {/* Medical disclaimer as mandated by prompt */}
      <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <strong>Nota Organizzativa:</strong> Questa sezione ha valore puramente organizzativo e di documentazione assistenziale. Le terapie devono essere prescritte dal Medico Curante o di Struttura. L'app non calcola dosaggi né fornisce suggerimenti clinici.
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Active Medications List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Terapie in Corso ({activeMeds.length})
          </h4>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Caricamento terapie...</div>
        ) : activeMeds.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
            <Pill className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <h4 className="font-bold text-slate-700 text-xs">Nessuna terapia attiva registrata</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Aggiungi i farmaci prescritti con posologia, orari e note di somministrazione.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-3 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg cursor-pointer"
            >
              + Aggiungi Farmaco
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeMeds.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                        <Pill className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{m.drug_name}</h4>
                        {m.active_ingredient && (
                          <span className="text-[11px] text-slate-500 italic block">
                            Principio: {m.active_ingredient}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="p-1 text-slate-400 hover:text-teal-600 rounded cursor-pointer"
                        title="Modifica"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id, m.drug_name)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                        title="Elimina"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Badges: Dosage, Route, Meal relation */}
                  <div className="flex flex-wrap gap-1.5 my-3 text-[11px]">
                    <span className="bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded border border-teal-200">
                      Dosaggio: {m.dosage} {m.unit || ''}
                    </span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      Via: {m.route || 'Orale'}
                    </span>
                    {m.timing_time && (
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {m.timing_time}
                      </span>
                    )}
                    <span className="bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                      {mealRelationLabels[m.meal_relation]}
                    </span>
                  </div>

                  {m.indication && (
                    <div className="text-xs text-slate-600 mb-2">
                      <span className="font-semibold text-slate-700">Indicazione:</span> {m.indication}
                    </div>
                  )}

                  {m.notes && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-2">
                      <span className="font-semibold text-slate-700 block mb-0.5">Note somministrazione:</span>
                      {m.notes}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Frequenza: {m.frequency}</span>
                  <button
                    onClick={() => handleToggle(m.id, m.is_active)}
                    className="text-amber-700 hover:text-amber-800 font-medium cursor-pointer"
                  >
                    Sospendi Terapia
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inactive / Suspended Medications */}
      {inactiveMeds.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Terapie Sospese / Concluse ({inactiveMeds.length})
          </h4>
          <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200 p-4">
            {inactiveMeds.map((m) => (
              <div key={m.id} className="py-2.5 flex items-center justify-between text-xs text-slate-500">
                <div>
                  <span className="font-bold text-slate-700 line-through mr-2">{m.drug_name}</span>
                  <span>{m.dosage} {m.unit}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggle(m.id, m.is_active)}
                    className="text-teal-600 hover:text-teal-700 font-semibold cursor-pointer"
                  >
                    Riattiva
                  </button>
                  <button
                    onClick={() => handleDelete(m.id, m.drug_name)}
                    className="text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: New / Edit Medication */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Pill className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingId ? 'Modifica Terapia Farmaco' : 'Registra Nuova Terapia Farmacologica'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Farmaco *</label>
                  <input
                    type="text"
                    required
                    value={drugName}
                    onChange={(e) => setDrugName(e.target.value)}
                    placeholder="es. Cardioaspirina, Lasix, Tachipirina..."
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Principio Attivo</label>
                  <input
                    type="text"
                    value={activeIngredient}
                    onChange={(e) => setActiveIngredient(e.target.value)}
                    placeholder="es. Acido acetilsalicilico, Paracetamolo..."
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dosaggio *</label>
                  <input
                    type="text"
                    required
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="es. 100, 1, 25..."
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unità di Misura</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="cpr">Compresse (cpr)</option>
                    <option value="gocce">Gocce</option>
                    <option value="bustina">Bustina</option>
                    <option value="mg">mg</option>
                    <option value="ml">ml</option>
                    <option value="fiala">Fiala</option>
                    <option value="cerotto">Cerotto transdermico</option>
                    <option value="UI">Unità Internazionali (UI)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Via Somministrazione</label>
                  <select
                    value={route}
                    onChange={(e) => setRoute(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="Orale">Orale</option>
                    <option value="Sublinguale">Sublinguale</option>
                    <option value="Transdermica">Transdermica</option>
                    <option value="Inalatoria / Aerosol">Inalatoria / Aerosol</option>
                    <option value="Rettale">Rettale</option>
                    <option value="Topica">Topica (crema/pomata)</option>
                    <option value="Sottocutanea">Sottocutanea</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Frequenza Assunzione *</label>
                  <input
                    type="text"
                    required
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    placeholder="es. 1 volta/die al mattino, al bisogno..."
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Orario / Fascia Oraria</label>
                  <input
                    type="text"
                    value={timingTime}
                    onChange={(e) => setTimingTime(e.target.value)}
                    placeholder="es. 08:00 oppure 08:00 - 20:00"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Relazione con i Pasti</label>
                  <select
                    value={mealRelation}
                    onChange={(e) => setMealRelation(e.target.value as MealRelation)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="independent">Indipendente dai pasti</option>
                    <option value="before">Prima del pasto (a digiuno)</option>
                    <option value="during">Durante il pasto</option>
                    <option value="after">Subito dopo il pasto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Indicazione Terapeutica</label>
                  <input
                    type="text"
                    value={indication}
                    onChange={(e) => setIndication(e.target.value)}
                    placeholder="es. Ipertensione, Dolore, Diuretico..."
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Note per l'Operatore (modalità assunzione, deglutizione, cautele)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="es. Da tritare / non tritare, assumere con abbondante acqua o yogurt..."
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {saving ? 'Salvataggio...' : 'Salva Terapia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
