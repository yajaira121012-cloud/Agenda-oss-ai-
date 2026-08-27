import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Calendar,
  UserCheck,
  Pill,
  FileText,
} from 'lucide-react';
import { Medication, MedicationAdministration, AdministrationStatus } from '../../../../types';
import { useAuth } from '../../../../context/AuthContext';

interface RecordAdministrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  medications: Medication[];
  initialMedication: Medication | null;
  patientId: string;
  onSaveAdministration: (
    admin: Omit<MedicationAdministration, 'id' | 'created_at'>
  ) => Promise<void>;
}

export function RecordAdministrationModal({
  isOpen,
  onClose,
  medications,
  initialMedication,
  patientId,
  onSaveAdministration,
}: RecordAdministrationModalProps) {
  const { profile, user } = useAuth();
  const currentOperatorName = profile?.first_name || profile?.full_name || user?.user_metadata?.full_name || 'Yajaira';

  const [selectedMedId, setSelectedMedId] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('08:00');
  const [status, setStatus] = useState<AdministrationStatus>('administered');
  const [administeredBy, setAdministeredBy] = useState<string>('');
  const [recordedBy, setRecordedBy] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Setup initial values on open
  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().slice(0, 10);
      setScheduledDate(today);

      const targetMed = initialMedication || medications.find((m) => m.status === 'active' || m.is_active) || medications[0];
      if (targetMed) {
        setSelectedMedId(targetMed.id);
        const times = targetMed.scheduled_times || (targetMed.timing_time ? targetMed.timing_time.split('–').map((s) => s.trim()) : []);
        setScheduledTime(times.length > 0 ? times[0] : '08:00');
      }

      setStatus('administered');
      setAdministeredBy(currentOperatorName);
      setRecordedBy(currentOperatorName);
      setNotes('');
      setError(null);
    }
  }, [isOpen, initialMedication, medications, currentOperatorName]);

  if (!isOpen) return null;

  const currentMed = medications.find((m) => m.id === selectedMedId);
  const scheduledTimesList = currentMed?.scheduled_times || (currentMed?.timing_time ? currentMed.timing_time.split('–').map((s) => s.trim()) : []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMed) {
      setError('Seleziona un farmaco valido');
      return;
    }
    if (!scheduledDate) {
      setError('Inserisci la data di somministrazione');
      return;
    }
    if (!scheduledTime) {
      setError('Inserisci l\'orario programmato');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSaveAdministration({
        medication_id: currentMed.id,
        patient_id: patientId,
        drug_name: currentMed.drug_name,
        dosage: `${currentMed.dosage} ${currentMed.unit || ''}`.trim(),
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        administered_at: `${scheduledDate}T${scheduledTime}:00.000Z`,
        status,
        administered_by: status === 'refused' || status === 'omitted' ? '—' : (administeredBy || currentOperatorName),
        recorded_by: recordedBy || currentOperatorName,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Errore durante la registrazione della somministrazione');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Registra Somministrazione</h3>
              <p className="text-xs text-slate-500">Conferma l'avvenuta assunzione o registra il rifiuto</p>
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
          {error && (
            <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200">
              {error}
            </div>
          )}

          {/* Select Drug */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Farmaco Prescritto *
            </label>
            <select
              value={selectedMedId}
              onChange={(e) => {
                const medId = e.target.value;
                setSelectedMedId(medId);
                const chosen = medications.find((m) => m.id === medId);
                const times = chosen?.scheduled_times || (chosen?.timing_time ? chosen.timing_time.split('–').map((s) => s.trim()) : []);
                if (times.length > 0) setScheduledTime(times[0]);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              {medications.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.drug_name} — {m.dosage} {m.unit || ''} ({m.is_active ? '🟢 In corso' : '⚪ Storico'})
                </option>
              ))}
            </select>
            {currentMed?.active_ingredient && (
              <p className="text-[11px] text-slate-500 mt-1">
                Principio attivo: <span className="font-semibold">{currentMed.active_ingredient}</span>
              </p>
            )}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Data Somministrazione *
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Orario Somministrazione *
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Quick scheduled times chips */}
          {scheduledTimesList.length > 0 && (
            <div>
              <span className="text-[11px] text-slate-500 block mb-1">
                Orari previsti dal piano terapeutico:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {scheduledTimesList.map((time, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setScheduledTime(time)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                      scheduledTime === time
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    🕒 {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Status Choice */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Esito della Somministrazione *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('administered')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  status === 'administered'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>✓ Somministrata</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('refused')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  status === 'refused'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <XCircle className="w-4 h-4" />
                <span>✗ Rifiutata</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('omitted')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  status === 'omitted'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>⚠️ Non somministrata</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('delayed')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  status === 'delayed'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>🕒 Posticipata</span>
              </button>
            </div>
          </div>

          {/* Operator Details */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                Somministrato da *
              </label>
              {status === 'refused' || status === 'omitted' ? (
                <input
                  type="text"
                  disabled
                  value="— (Non somministrato)"
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-400 italic"
                />
              ) : (
                <input
                  type="text"
                  value={administeredBy}
                  onChange={(e) => setAdministeredBy(e.target.value)}
                  placeholder="Nome operatore (es. Yajaira, Marco)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Registrato da
              </label>
              <input
                type="text"
                value={recordedBy}
                onChange={(e) => setRecordedBy(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Note Evento / Motivazione Rifiuto
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                status === 'refused'
                  ? 'Specificare motivo del rifiuto (es. nausea, sonnolenza, rifiuto esplicito...)'
                  : 'Eventuali osservazioni (es. assunta con purea di mele, senza difficoltà...)'
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              {saving ? 'Salvataggio...' : 'Conferma e Registra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
