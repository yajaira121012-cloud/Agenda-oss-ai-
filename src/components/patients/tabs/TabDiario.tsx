import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Sparkles,
  AlertCircle,
  Filter,
  X,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { CareDiaryEntry, CareCategory } from '../../../types';
import {
  getCareDiaryByPatient,
  createCareDiaryEntry,
  updateCareDiaryEntry,
  deleteCareDiaryEntry,
} from '../../../services/careDiaryService';
import { useAuth } from '../../../context/AuthContext';

interface TabDiarioProps {
  patientId: string;
}

export function TabDiario({ patientId }: TabDiarioProps) {
  const { user, profile } = useAuth();
  const [entries, setEntries] = useState<CareDiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const now = new Date();
  const [entryDate, setEntryDate] = useState(now.toISOString().slice(0, 10));
  const [entryTime, setEntryTime] = useState(now.toTimeString().slice(0, 5));
  const [category, setCategory] = useState<CareCategory>('hygiene');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  const loadDiary = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data, error } = await getCareDiaryByPatient(patientId);
      if (error) {
        setErrorMessage(error);
      } else {
        setEntries(data || []);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Errore nel recupero diario assistenziale');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiary();
  }, [patientId]);

  const handleOpenAdd = () => {
    const curNow = new Date();
    setEditingId(null);
    setEntryDate(curNow.toISOString().slice(0, 10));
    setEntryTime(curNow.toTimeString().slice(0, 5));
    setCategory('hygiene');
    setDescription('');
    setNotes('');
    setModalOpen(true);
  };

  const handleOpenEdit = (entry: CareDiaryEntry) => {
    setEditingId(entry.id);
    const dateObj = new Date(entry.recorded_at);
    setEntryDate(dateObj.toISOString().slice(0, 10));
    setEntryTime(dateObj.toTimeString().slice(0, 5));
    setCategory(entry.category);
    setDescription(entry.description);
    setNotes(entry.notes || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Inserisci la descrizione dell’intervento assistenziale');
      return;
    }

    setSaving(true);
    const fullTimestamp = new Date(`${entryDate}T${entryTime}:00`).toISOString();
    const operatorName = profile?.full_name || user?.email?.split('@')[0] || 'Operatore OSS';

    try {
      const payload = {
        patient_id: patientId,
        recorded_at: fullTimestamp,
        category,
        description: description.trim(),
        notes: notes.trim() || undefined,
        recorded_by: user?.id,
        operator_name: operatorName,
      };

      if (editingId) {
        const { error } = await updateCareDiaryEntry(editingId, payload);
        if (error) throw new Error(error);
      } else {
        const { error } = await createCareDiaryEntry(payload);
        if (error) throw new Error(error);
      }

      setModalOpen(false);
      loadDiary();
    } catch (err: any) {
      alert(err.message || 'Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Eliminare questa voce del diario assistenziale?')) {
      const { success, error } = await deleteCareDiaryEntry(id);
      if (success) {
        loadDiary();
      } else {
        alert(error || 'Errore nella cancellazione');
      }
    }
  };

  const categoryLabels: Record<CareCategory, { label: string; color: string }> = {
    hygiene: { label: 'Igiene e Cura della Persona', color: 'bg-teal-50 text-teal-800 border-teal-200' },
    mobilization: { label: 'Mobilizzazione e Postura', color: 'bg-blue-50 text-blue-800 border-blue-200' },
    feeding: { label: 'Alimentazione', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    hydration: { label: 'Idratazione', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
    elimination: { label: 'Eliminazione / Alvo / Diuresi', color: 'bg-purple-50 text-purple-800 border-purple-200' },
    vital_signs: { label: 'Parametri e Controlli', color: 'bg-rose-50 text-rose-800 border-rose-200' },
    sleep: { label: 'Sonno e Riposo', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
    behavior: { label: 'Comportamento / Stato Cognitivo', color: 'bg-yellow-50 text-yellow-900 border-yellow-200' },
    assistance: { label: 'Assistenza Generale / Supporto', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    other: { label: 'Altro / Consegna', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  };

  const filteredEntries =
    selectedCategory === 'all'
      ? entries
      : entries.filter((e) => e.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Diario Assistenziale & Consegne</h3>
          <p className="text-xs text-slate-500">
            Registrazione cronologica degli interventi, igiene, cambi posturali, comportamento e consegne turno
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-transparent border-none focus:outline-none text-slate-700 font-medium cursor-pointer"
            >
              <option value="all">Tutte le Categorie</option>
              <option value="hygiene">Igiene</option>
              <option value="mobilization">Mobilizzazione</option>
              <option value="nutrition">Alimentazione</option>
              <option value="hydration">Idratazione</option>
              <option value="elimination">Eliminazione</option>
              <option value="vitals">Parametri</option>
              <option value="sleep_rest">Sonno e Riposo</option>
              <option value="behavior">Comportamento</option>
              <option value="assistance">Assistenza</option>
              <option value="other">Altro</option>
            </select>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nuova Voce Diario
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Diary Timeline Entries */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Caricamento diario assistenziale...</div>
      ) : filteredEntries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
          <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <h4 className="font-bold text-slate-700 text-xs">Nessuna voce presente nel diario</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Documenta le attività di assistenza svolte durante il turno per questo assistito.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-3 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg cursor-pointer"
          >
            + Aggiungi Voce Diario
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => {
            const dateObj = new Date(entry.recorded_at);
            const cat = categoryLabels[entry.category] || categoryLabels.other;

            return (
              <div
                key={entry.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${cat.color}`}>
                      {cat.label}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {dateObj.toLocaleDateString('it-IT')}
                    </span>
                    <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {dateObj.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(entry)}
                      className="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg cursor-pointer transition-colors"
                      title="Modifica"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                      title="Elimina"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-medium mb-3">
                  {entry.description}
                </p>

                {entry.notes && (
                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3">
                    <span className="font-semibold text-slate-700 block mb-0.5">Note aggiuntive:</span>
                    {entry.notes}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>Operatore: <strong>{entry.operator_name || 'Operatore OSS'}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: New / Edit Diary Entry */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingId ? 'Modifica Voce Diario' : 'Nuova Registrazione Diario Assistenziale'}
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ora *</label>
                  <input
                    type="time"
                    required
                    value={entryTime}
                    onChange={(e) => setEntryTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria Intervento *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CareCategory)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white font-medium"
                >
                  <option value="hygiene">Igiene e Cura della Persona (Bagno, spugnatura, cambio panno)</option>
                  <option value="mobilization">Mobilizzazione e Postura (Cambio decubito, alzata, deambulazione)</option>
                  <option value="nutrition">Alimentazione (Somministrazione pasto, imboccamento)</option>
                  <option value="hydration">Idratazione (Assunzione liquidi)</option>
                  <option value="elimination">Eliminazione (Alvo, diuresi, catetere, alvo chiuso)</option>
                  <option value="vitals">Parametri e Controlli</option>
                  <option value="sleep_rest">Sonno e Riposo (Riposo notturno, agitazione)</option>
                  <option value="behavior">Comportamento / Stato Cognitivo (Orientamento, umore)</option>
                  <option value="assistance">Assistenza Generale / Attività Ricreative</option>
                  <option value="other">Altro / Consegna Turno</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descrizione Intervento Assistenziale *
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrivi dettagliatamente le cure prestate, la risposta dell'assistito, eventuali anomalie o cute integra/lesioni..."
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Note Aggiuntive / Consegne per il Turno Successivo
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="es. Da ricontrollare decubito ore 16:00, monitorare apporto liquidi..."
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
                  {saving ? 'Salvataggio...' : 'Salva Voce Diario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
