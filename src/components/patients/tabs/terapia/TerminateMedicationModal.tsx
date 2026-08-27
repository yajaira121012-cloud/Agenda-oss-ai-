import React, { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Info,
  ShieldCheck,
  Pill,
} from 'lucide-react';
import { Medication, MedicationStatus } from '../../../../types';

interface TerminateMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  medication: Medication | null;
  onTerminate: (
    medId: string,
    targetStatus: 'completed' | 'suspended',
    endDate: string,
    reason: string,
    notes?: string
  ) => Promise<void>;
}

const PRESET_REASONS_COMPLETED = [
  'Fine naturale del ciclo terapeutico prescritto (es. antibiotico)',
  'Raggiungimento dell obiettivo clinico',
  'Esito favorevole con risoluzione dei sintomi',
  'Conclusione piano terapeutico programmato',
  'Altro...',
];

const PRESET_REASONS_SUSPENDED = [
  'Sospeso dal Medico Curante (MMG/Specialista)',
  'Intolleranza gastrica o effetti collaterali segnalati',
  'Reazione avversa o allergica al principio attivo',
  'Sostituito con altro farmaco / cambio piano terapeutico',
  'Sospensione temporanea per ricovero ospedaliero',
  'Sospensione per valori pressori/cardiaci alterati',
  'Altro...',
];

export function TerminateMedicationModal({
  isOpen,
  onClose,
  medication,
  onTerminate,
}: TerminateMedicationModalProps) {
  const [targetStatus, setTargetStatus] = useState<'completed' | 'suspended'>('completed');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && medication) {
      setTargetStatus('completed');
      setEndDate(new Date().toISOString().slice(0, 10));
      setSelectedReason(PRESET_REASONS_COMPLETED[0]);
      setCustomReason('');
      setNotes('');
      setError(null);
    }
  }, [isOpen, medication]);

  if (!isOpen || !medication) return null;

  const reasonsList = targetStatus === 'completed' ? PRESET_REASONS_COMPLETED : PRESET_REASONS_SUSPENDED;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!endDate) {
      setError('Seleziona la data di conclusione o sospensione');
      return;
    }

    const finalReason = selectedReason === 'Altro...' ? customReason.trim() : selectedReason;
    if (!finalReason) {
      setError('Inserisci la motivazione della conclusione/sospensione');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onTerminate(medication.id, targetStatus, endDate, finalReason, notes.trim() || undefined);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Errore durante l\'aggiornamento dello stato della terapia');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-amber-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Termina o Sospendi Terapia</h3>
              <p className="text-xs text-slate-600 font-medium">{medication.drug_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Important Non-deletion notice */}
          <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200/80 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-blue-900">
              <span className="font-bold block mb-0.5">Integrità Cartella Clinico-Assistenziale</span>
              <p className="text-blue-800 leading-relaxed">
                Il farmaco <strong>non verrà cancellato</strong>: verrà conservato nello <strong>Storico Terapie</strong> con tutte le somministrazioni registrate per garantire la massima tracciabilità.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200">
              {error}
            </div>
          )}

          {/* Target Status Choice */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Seleziona Nuovo Stato Terapia *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setTargetStatus('completed');
                  setSelectedReason(PRESET_REASONS_COMPLETED[0]);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  targetStatus === 'completed'
                    ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <div className="font-bold text-xs flex items-center gap-1.5 mb-1">
                  <span>⚪</span>
                  <span>Terminata</span>
                </div>
                <p className={`text-[11px] leading-tight ${targetStatus === 'completed' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Ciclo concluso naturalmente o fine piano
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTargetStatus('suspended');
                  setSelectedReason(PRESET_REASONS_SUSPENDED[0]);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  targetStatus === 'suspended'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <div className="font-bold text-xs flex items-center gap-1.5 mb-1">
                  <span>🟠</span>
                  <span>Sospesa</span>
                </div>
                <p className={`text-[11px] leading-tight ${targetStatus === 'suspended' ? 'text-amber-100' : 'text-slate-500'}`}>
                  Interrotta dal medico o per effetti collaterali
                </p>
              </button>
            </div>
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Data di Fine / Sospensione Effettiva *
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          {/* Motive preset */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Motivazione della {targetStatus === 'completed' ? 'Conclusione' : 'Sospensione'} *
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            >
              {reasonsList.map((reason, idx) => (
                <option key={idx} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          {/* Custom motive input if "Altro..." */}
          {selectedReason === 'Altro...' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Specifica Motivazione Personalizzata *
              </label>
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="es. Sostituito con Tachipirina 500 per miglior tollerabilità"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
          )}

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Note Aggiuntive per il Diario / Cartella
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ulteriori indicazioni del medico o osservazioni dell'operatore..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Modal Actions */}
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
              className={`px-5 py-2.5 text-white text-xs font-bold rounded-xl shadow-xs transition-colors ${
                targetStatus === 'completed'
                  ? 'bg-slate-800 hover:bg-slate-900'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              {saving ? 'Archiviazione...' : `Sposta in Storico (${targetStatus === 'completed' ? '⚪ Terminata' : '🟠 Sospesa'})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
