import React, { useState, useEffect } from 'react';
import {
  Accessibility,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  Footprints,
} from 'lucide-react';
import { PatientAid, AidType } from '../../../types';
import {
  getPatientAids,
  addPatientAid,
  deletePatientAid,
} from '../../../services/patientsService';

interface TabMobilitaProps {
  patientId: string;
}

export function TabMobilita({ patientId }: TabMobilitaProps) {
  const [aids, setAids] = useState<PatientAid[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [aidType, setAidType] = useState<AidType>('walker');
  const [customName, setCustomName] = useState('');
  const [notes, setNotes] = useState('');
  const [isCurrent, setIsCurrent] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadAids = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data, error } = await getPatientAids(patientId);
      if (error) {
        setErrorMessage(error);
      } else {
        setAids(data || []);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Errore nel caricamento ausili');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAids();
  }, [patientId]);

  const aidTypeLabels: Record<AidType, string> = {
    none: 'Nessun ausilio (Autonomo)',
    cane: 'Bastone / Stampella',
    walker: 'Deambulatore / Rollator',
    wheelchair: 'Carrozzina / Sedia a rotelle',
    special_bed: 'Letto articolato / Sponde / Materasso antidecubito',
    hoist: 'Sollevatore meccanico / Telo di trasferimento',
    other: 'Altro ausilio personalizzato',
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await addPatientAid({
        patient_id: patientId,
        aid_type: aidType,
        custom_name: customName.trim() || undefined,
        is_current: isCurrent,
        notes: notes.trim() || undefined,
      });

      if (error) throw new Error(error);

      setModalOpen(false);
      setCustomName('');
      setNotes('');
      loadAids();
    } catch (err: any) {
      alert(err.message || 'Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, aidLabel: string) => {
    if (confirm(`Rimuovere l'ausilio "${aidLabel}"?`)) {
      const { success, error } = await deletePatientAid(id);
      if (success) {
        loadAids();
      } else {
        alert(error || 'Errore nella cancellazione');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Mobilità, Trasferimenti & Ausili</h3>
          <p className="text-xs text-slate-500">
            Ausili per la deambulazione, postura a letto, sollevatori e trasferimenti in sicurezza
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Registra Ausilio
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Caricamento ausili...</div>
      ) : aids.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
          <Footprints className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <h4 className="font-bold text-slate-700 text-xs">Nessun ausilio registrato</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Indica gli ausili utilizzati (carrozzina, deambulatore, letto speciale, sollevatore).
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-3 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg cursor-pointer"
          >
            + Aggiungi Ausilio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aids.map((aid) => (
            <div
              key={aid.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                      <Accessibility className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">
                        {aidTypeLabels[aid.aid_type] || aid.aid_type}
                      </h4>
                      {aid.custom_name && (
                        <span className="text-[11px] text-teal-700 font-medium">{aid.custom_name}</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(aid.id, aidTypeLabels[aid.aid_type])}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {aid.notes && (
                  <div className="mt-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-700 block mb-0.5">Istruzioni / Note OSS:</span>
                    {aid.notes}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  Registrato il {new Date(aid.created_at || '').toLocaleDateString('it-IT')}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md font-semibold ${
                    aid.is_current ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {aid.is_current ? 'In uso' : 'Non più in uso'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add Aid */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">Nuovo Ausilio / Dispositivo Mobilità</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo di Ausilio *</label>
                <select
                  value={aidType}
                  onChange={(e) => setAidType(e.target.value as AidType)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="none">Nessun ausilio (Autonomo)</option>
                  <option value="cane">Bastone / Stampella / Tripode</option>
                  <option value="walker">Deambulatore / Rollator</option>
                  <option value="wheelchair">Carrozzina / Sedia a rotelle</option>
                  <option value="special_bed">Letto articolato / Sponde / Materasso antidecubito</option>
                  <option value="hoist">Sollevatore meccanico / Telo di trasferimento</option>
                  <option value="other">Altro ausilio</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dettagli / Modello / Specifiche
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="es. Rollator a 4 ruote con freni, Carrozzina pieghevole..."
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Note operative per l'OSS (es. modalità trasferimento, sicurezza)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="es. Trasferimento letto-carrozzina con assistenza di 1 operatore e cintura..."
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
                  {saving ? 'Salvataggio...' : 'Salva Ausilio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
