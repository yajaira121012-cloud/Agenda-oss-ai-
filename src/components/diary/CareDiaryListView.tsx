import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Filter,
  Search,
  User,
  Clock,
  Trash2,
  Edit2,
  AlertCircle,
  X,
} from 'lucide-react';
import { CareDiaryEntry, Patient, CareCategory } from '../../types';
import {
  getCareDiaryEntries,
  createCareDiaryEntry,
  updateCareDiaryEntry,
  deleteCareDiaryEntry,
} from '../../services/careDiaryService';
import { getPatients } from '../../services/patientsService';
import { useAuth } from '../../context/AuthContext';

interface CareDiaryListViewProps {
  onSelectPatient: (patientId: string) => void;
}

export function CareDiaryListView({ onSelectPatient }: CareDiaryListViewProps) {
  const { user, profile } = useAuth();
  const [entries, setEntries] = useState<CareDiaryEntry[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const now = new Date();
  const [patientId, setPatientId] = useState('');
  const [entryDate, setEntryDate] = useState(now.toISOString().slice(0, 10));
  const [entryTime, setEntryTime] = useState(now.toTimeString().slice(0, 5));
  const [category, setCategory] = useState<CareCategory>('hygiene');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [entriesRes, patientsRes] = await Promise.all([
        getCareDiaryEntries(100),
        getPatients(),
      ]);

      if (entriesRes.error) setErrorMessage(entriesRes.error);
      else setEntries(entriesRes.data || []);

      if (patientsRes.data) setPatients(patientsRes.data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Errore nel recupero diario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    const curNow = new Date();
    setEditingId(null);
    setPatientId(patients.length > 0 ? patients[0].id : '');
    setEntryDate(curNow.toISOString().slice(0, 10));
    setEntryTime(curNow.toTimeString().slice(0, 5));
    setCategory('hygiene');
    setDescription('');
    setNotes('');
    setModalOpen(true);
  };

  const handleOpenEdit = (entry: CareDiaryEntry) => {
    setEditingId(entry.id);
    setPatientId(entry.patient_id);
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
    if (!patientId || !description.trim()) {
      alert('Seleziona un assistito e inserisci la descrizione');
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
      loadData();
    } catch (err: any) {
      alert(err.message || 'Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Eliminare questa voce del diario?')) {
      const { success, error } = await deleteCareDiaryEntry(id);
      if (success) {
        loadData();
      } else {
        alert(error || 'Errore cancellazione');
      }
    }
  };

  const categoryLabels: Record<CareCategory, { label: string; color: string }> = {
    hygiene: { label: 'Igiene e Cura della Persona', color: 'bg-teal-50 text-teal-800 border-teal-200' },
    mobilization: { label: 'Mobilizzazione e Postura', color: 'bg-blue-50 text-blue-800 border-blue-200' },
    feeding: { label: 'Alimentazione', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    hydration: { label: 'Idratazione', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
    elimination: { label: 'Eliminazione / Alvo', color: 'bg-purple-50 text-purple-800 border-purple-200' },
    vital_signs: { label: 'Parametri e Controlli', color: 'bg-rose-50 text-rose-800 border-rose-200' },
    sleep: { label: 'Sonno e Riposo', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
    behavior: { label: 'Comportamento / Cognitivo', color: 'bg-yellow-50 text-yellow-900 border-yellow-200' },
    assistance: { label: 'Assistenza Generale', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    other: { label: 'Altro / Consegna', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  };

  const filteredEntries = entries.filter((e) => {
    const matchesPatient = selectedPatientId === 'all' || e.patient_id === selectedPatientId;
    const matchesCat = selectedCategory === 'all' || e.category === selectedCategory;
    const pat = (e as any).patient;
    const patName = pat ? `${pat.first_name} ${pat.last_name} ${pat.internal_code}`.toLowerCase() : '';
    const matchesSearch =
      !searchQuery.trim() ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.notes && e.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      patName.includes(searchQuery.toLowerCase());

    return matchesPatient && matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#E1E4E8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1A1C1E]">Diario Assistenziale & Consegne di Turno</h1>
            <p className="text-xs text-slate-500">
              Registro completo delle attività, igiene, mobilizzazioni, pasti e consegne per tutti gli assistiti
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nuova Consegna
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl p-4 md:p-5 border border-[#E1E4E8] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cerca per testo, paziente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-[#E1E4E8] rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Patient select */}
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="text-xs bg-slate-50 border border-[#E1E4E8] rounded-xl px-3 py-2 font-medium text-slate-700 focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value="all">Tutti gli Assistiti</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.last_name} {p.first_name} ({p.internal_code})
                </option>
              ))}
            </select>
          </div>

          {/* Category select */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-slate-50 border border-[#E1E4E8] rounded-xl px-3 py-2 font-medium text-slate-700 focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value="all">Tutte le Categorie</option>
              <option value="hygiene">Igiene</option>
              <option value="mobilization">Mobilizzazione</option>
              <option value="feeding">Alimentazione</option>
              <option value="hydration">Idratazione</option>
              <option value="elimination">Eliminazione</option>
              <option value="vital_signs">Parametri</option>
              <option value="sleep">Sonno e Riposo</option>
              <option value="behavior">Comportamento</option>
              <option value="assistance">Assistenza</option>
              <option value="other">Altro</option>
            </select>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Entries List */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-[#E1E4E8] p-12 text-center text-xs text-slate-400">
          Caricamento diario assistenziale...
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-[#E1E4E8] p-12 text-center">
          <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <h4 className="font-bold text-slate-700 text-xs">Nessuna consegna trovata</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Registra un intervento o modifica i filtri di ricerca.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-3 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors cursor-pointer"
          >
            + Aggiungi Consegna
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => {
            const pat = (entry as any).patient;
            const dateObj = new Date(entry.recorded_at);
            const cat = categoryLabels[entry.category] || categoryLabels.other;

            return (
              <div
                key={entry.id}
                className="bg-white rounded-3xl p-6 border border-[#E1E4E8] shadow-xs hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {pat && (
                      <button
                        onClick={() => onSelectPatient(pat.id)}
                        className="text-xs font-bold text-slate-900 hover:text-teal-700 hover:underline cursor-pointer"
                      >
                        {pat.last_name} {pat.first_name} ({pat.internal_code})
                        {pat.room_number && ` - St. ${pat.room_number}`}
                      </button>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cat.color}`}>
                      {cat.label}
                    </span>
                    <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {dateObj.toLocaleDateString('it-IT')} alle {dateObj.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(entry)}
                      className="p-1 text-slate-400 hover:text-teal-600 rounded cursor-pointer"
                      title="Modifica"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                      title="Elimina"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-medium mb-2">
                  {entry.description}
                </p>

                {entry.notes && (
                  <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 mb-2">
                    <span className="font-semibold text-slate-700">Note: </span>
                    {entry.notes}
                  </div>
                )}

                <div className="text-[11px] text-slate-400">
                  Operatore: <strong className="text-slate-600">{entry.operator_name || 'Operatore OSS'}</strong>
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
                  {editingId ? 'Modifica Registrazione Diario' : 'Nuova Consegna Assistenziale'}
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
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Paziente / Assistito *</label>
                <select
                  required
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white font-medium"
                >
                  <option value="">Seleziona paziente</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.last_name} {p.first_name} ({p.internal_code})
                    </option>
                  ))}
                </select>
              </div>

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
                  <option value="hygiene">Igiene e Cura della Persona</option>
                  <option value="mobilization">Mobilizzazione e Postura</option>
                  <option value="feeding">Alimentazione</option>
                  <option value="hydration">Idratazione</option>
                  <option value="elimination">Eliminazione / Alvo</option>
                  <option value="vital_signs">Parametri e Controlli</option>
                  <option value="sleep">Sonno e Riposo</option>
                  <option value="behavior">Comportamento / Stato Cognitivo</option>
                  <option value="assistance">Assistenza Generale</option>
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
                  placeholder="Descrivi dettagliatamente l'intervento svolto, lo stato dell'assistito, risposte alle cure..."
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Note & Consegne per il Turno Successivo
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="es. Da ricontrollare alle ore 17:00..."
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
