import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  AlertOctagon,
  ShieldAlert,
  Scissors,
  History,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
} from 'lucide-react';
import { PatientCondition, ConditionType } from '../../../types';
import {
  getPatientConditions,
  addPatientCondition,
  deletePatientCondition,
} from '../../../services/patientsService';

interface TabAnamnesiProps {
  patientId: string;
}

export function TabAnamnesi({ patientId }: TabAnamnesiProps) {
  const [conditions, setConditions] = useState<PatientCondition[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Add condition form modal
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ConditionType>('pathology');
  const [description, setDescription] = useState('');
  const [diagnosedYear, setDiagnosedYear] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadConditions = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data, error } = await getPatientConditions(patientId);
      if (error) {
        setErrorMessage(error);
      } else {
        setConditions(data || []);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Errore nel caricamento anamnesi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConditions();
  }, [patientId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      const { error } = await addPatientCondition({
        patient_id: patientId,
        title: title.trim(),
        type,
        description: description.trim() || undefined,
        diagnosed_year: diagnosedYear.trim() || undefined,
        is_active: isActive,
        notes: notes.trim() || undefined,
      });

      if (error) throw new Error(error);

      setModalOpen(false);
      setTitle('');
      setDescription('');
      setDiagnosedYear('');
      setNotes('');
      loadConditions();
    } catch (err: any) {
      alert(err.message || 'Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, itemTitle: string) => {
    if (confirm(`Rimuovere la voce "${itemTitle}" dall'anamnesi dell'assistito?`)) {
      const { success, error } = await deletePatientCondition(id);
      if (success) {
        loadConditions();
      } else {
        alert(error || 'Errore nella cancellazione');
      }
    }
  };

  const pathologies = conditions.filter((c) => c.type === 'pathology');
  const allergies = conditions.filter((c) => c.type === 'allergy');
  const intolerances = conditions.filter((c) => c.type === 'intolerance');
  const surgeries = conditions.filter((c) => c.type === 'surgery');
  const previousHistory = conditions.filter((c) => c.type === 'previous_history');
  const clinicalNotes = conditions.filter((c) => c.type === 'note');

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Anamnesi Clinica & Patologie</h3>
          <p className="text-xs text-slate-500">
            Allergie, patologie croniche, interventi pregressi e intolleranze
          </p>
        </div>
        <button
          onClick={() => {
            setType('pathology');
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Aggiungi Voce Anamnestica
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Allergie e Intolleranze Box (Red / High Alert) */}
      <div className="bg-white rounded-2xl p-6 border-2 border-rose-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                Allergie & Intolleranze Note
                {allergies.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                    ALERT ATTIVO
                  </span>
                )}
              </h4>
              <span className="text-xs text-slate-500">Massima attenzione nella somministrazione pasti e igiene</span>
            </div>
          </div>
          <button
            onClick={() => {
              setType('allergy');
              setModalOpen(true);
            }}
            className="text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200 cursor-pointer"
          >
            + Aggiungi Allergia
          </button>
        </div>

        {allergies.length === 0 && intolerances.length === 0 ? (
          <div className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl">
            Nessuna allergia o intolleranza nota segnalata in cartella.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allergies.map((a) => (
              <div
                key={a.id}
                className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl flex items-start justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-rose-900 text-xs">{a.title}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-200 text-rose-800 font-semibold uppercase">
                      Allergia
                    </span>
                  </div>
                  {a.description && <p className="text-xs text-rose-700 mt-1">{a.description}</p>}
                </div>
                <button
                  onClick={() => handleDelete(a.id, a.title)}
                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {intolerances.map((i) => (
              <div
                key={i.id}
                className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-900 text-xs">{i.title}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200 text-amber-800 font-semibold uppercase">
                      Intolleranza
                    </span>
                  </div>
                  {i.description && <p className="text-xs text-amber-700 mt-1">{i.description}</p>}
                </div>
                <button
                  onClick={() => handleDelete(i.id, i.title)}
                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Patologie Croniche e Attive */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <HeartPulse className="w-5 h-5 text-teal-600" />
            <h4 className="font-bold text-slate-900 text-sm">Patologie & Condizioni Croniche</h4>
          </div>
          <button
            onClick={() => {
              setType('pathology');
              setModalOpen(true);
            }}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 px-2.5 py-1.5 rounded-lg border border-teal-200 cursor-pointer"
          >
            + Aggiungi Patologia
          </button>
        </div>

        {pathologies.length === 0 ? (
          <div className="text-xs text-slate-400 italic py-2">
            Nessuna patologia registrata in cartella.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pathologies.map((p) => (
              <div key={p.id} className="py-3 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">{p.title}</span>
                    {p.diagnosed_year && (
                      <span className="text-[11px] text-slate-400 font-mono">
                        (dal {p.diagnosed_year})
                      </span>
                    )}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        p.is_active
                          ? 'bg-teal-50 text-teal-700 border border-teal-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {p.is_active ? 'In corso' : 'Pregressa / Risolta'}
                    </span>
                  </div>
                  {p.description && <p className="text-xs text-slate-600 mt-1">{p.description}</p>}
                  {p.notes && <p className="text-[11px] text-slate-400 italic mt-0.5">Note: {p.notes}</p>}
                </div>
                <button
                  onClick={() => handleDelete(p.id, p.title)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interventi Chirurgici & Precedenti */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Interventi Chirurgici */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-slate-600" />
              <h4 className="font-bold text-slate-900 text-sm">Interventi Chirurgici</h4>
            </div>
            <button
              onClick={() => {
                setType('surgery');
                setModalOpen(true);
              }}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 px-2 py-1 rounded-lg cursor-pointer"
            >
              + Aggiungi
            </button>
          </div>

          {surgeries.length === 0 ? (
            <div className="text-xs text-slate-400 italic py-2">Nessun intervento chirurgico registrato.</div>
          ) : (
            <div className="space-y-2.5">
              {surgeries.map((s) => (
                <div
                  key={s.id}
                  className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">
                      {s.title} {s.diagnosed_year && <span className="font-mono text-slate-400">({s.diagnosed_year})</span>}
                    </div>
                    {s.description && <p className="text-slate-600 mt-0.5">{s.description}</p>}
                  </div>
                  <button
                    onClick={() => handleDelete(s.id, s.title)}
                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Precedenti Rilevanti */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-600" />
              <h4 className="font-bold text-slate-900 text-sm">Precedenti Rilevanti</h4>
            </div>
            <button
              onClick={() => {
                setType('previous_history');
                setModalOpen(true);
              }}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 px-2 py-1 rounded-lg cursor-pointer"
            >
              + Aggiungi
            </button>
          </div>

          {previousHistory.length === 0 ? (
            <div className="text-xs text-slate-400 italic py-2">Nessun precedente registrato.</div>
          ) : (
            <div className="space-y-2.5">
              {previousHistory.map((h) => (
                <div
                  key={h.id}
                  className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{h.title}</div>
                    {h.description && <p className="text-slate-600 mt-0.5">{h.description}</p>}
                  </div>
                  <button
                    onClick={() => handleDelete(h.id, h.title)}
                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Add Condition */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">Aggiungi Voce Anamnesi</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="pathology">Patologia Cronica / Attiva</option>
                  <option value="allergy">Allergia (Farmaco / Alimento / Sostanza)</option>
                  <option value="intolerance">Intolleranza Alimentare</option>
                  <option value="surgery">Intervento Chirurgico</option>
                  <option value="previous_history">Precedente Rilevante</option>
                  <option value="note">Nota Assistenziale Clinica</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Titolo / Diagnosi / Sostanza *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="es. Diabete Mellito Tipo 2, Penicillina, Ictus, ecc."
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Anno / Periodo Diagnosi
                  </label>
                  <input
                    type="text"
                    value={diagnosedYear}
                    onChange={(e) => setDiagnosedYear(e.target.value)}
                    placeholder="es. 2018"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stato</label>
                  <select
                    value={isActive ? 'true' : 'false'}
                    onChange={(e) => setIsActive(e.target.value === 'true')}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="true">Attiva / In corso</option>
                    <option value="false">Risolta / Pregressa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descrizione Dettagliata</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Sintomi, reazioni avverse note o dettagli..."
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
                  {saving ? 'Salvataggio...' : 'Salva in Cartella'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
