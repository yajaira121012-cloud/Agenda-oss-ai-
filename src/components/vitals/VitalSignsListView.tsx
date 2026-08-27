import React, { useState, useEffect } from 'react';
import {
  Activity,
  Plus,
  Filter,
  Search,
  User,
  Clock,
  Trash2,
  AlertCircle,
  X,
  Thermometer,
  Heart,
  Droplet,
  CheckCircle2,
} from 'lucide-react';
import { VitalSign, Patient } from '../../types';
import {
  getRecentVitalSigns,
  createVitalSign,
  deleteVitalSign,
} from '../../services/vitalSignsService';
import { getPatients } from '../../services/patientsService';
import { useAuth } from '../../context/AuthContext';

interface VitalSignsListViewProps {
  onSelectPatient: (patientId: string) => void;
}

export function VitalSignsListView({ onSelectPatient }: VitalSignsListViewProps) {
  const { user, profile } = useAuth();
  const [vitals, setVitals] = useState<VitalSign[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters
  const [selectedPatientId, setSelectedPatientId] = useState('all');
  const [onlyAbnormal, setOnlyAbnormal] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const now = new Date();
  const [patientId, setPatientId] = useState('');
  const [recordDate, setRecordDate] = useState(now.toISOString().slice(0, 10));
  const [recordTime, setRecordTime] = useState(now.toTimeString().slice(0, 5));
  const [temperature, setTemperature] = useState('');
  const [systolicBp, setSystolicBp] = useState('');
  const [diastolicBp, setDiastolicBp] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [spo2, setSpo2] = useState('');
  const [respiratoryRate, setRespiratoryRate] = useState('');
  const [bloodGlucose, setBloodGlucose] = useState('');
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [vitalsRes, patientsRes] = await Promise.all([
        getRecentVitalSigns(100),
        getPatients(),
      ]);

      if (vitalsRes.error) setErrorMessage(vitalsRes.error);
      else setVitals(vitalsRes.data || []);

      if (patientsRes.data) setPatients(patientsRes.data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Errore nel caricamento parametri');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    const curNow = new Date();
    setPatientId(patients.length > 0 ? patients[0].id : '');
    setRecordDate(curNow.toISOString().slice(0, 10));
    setRecordTime(curNow.toTimeString().slice(0, 5));
    setTemperature('');
    setSystolicBp('');
    setDiastolicBp('');
    setHeartRate('');
    setSpo2('');
    setRespiratoryRate('');
    setBloodGlucose('');
    setNotes('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      alert('Seleziona un assistito');
      return;
    }

    setSaving(true);
    const fullTimestamp = new Date(`${recordDate}T${recordTime}:00`).toISOString();
    const operatorName = profile?.full_name || user?.email?.split('@')[0] || 'Operatore OSS';

    try {
      const { error } = await createVitalSign({
        patient_id: patientId,
        recorded_at: fullTimestamp,
        temperature: temperature ? parseFloat(temperature) : null,
        systolic_bp: systolicBp ? parseInt(systolicBp, 10) : null,
        diastolic_bp: diastolicBp ? parseInt(diastolicBp, 10) : null,
        heart_rate: heartRate ? parseInt(heartRate, 10) : null,
        spo2: spo2 ? parseInt(spo2, 10) : null,
        respiratory_rate: respiratoryRate ? parseInt(respiratoryRate, 10) : null,
        blood_glucose: bloodGlucose ? parseInt(bloodGlucose, 10) : null,
        notes: notes.trim() || undefined,
        recorded_by: user?.id,
        operator_name: operatorName,
      });

      if (error) throw new Error(error);

      setModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Errore salvataggio parametri');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Eliminare questa rilevazione dei parametri vitali?')) {
      const { success, error } = await deleteVitalSign(id);
      if (success) {
        loadData();
      } else {
        alert(error || 'Errore cancellazione');
      }
    }
  };

  const filteredVitals = vitals.filter((v) => {
    const matchesPatient = selectedPatientId === 'all' || v.patient_id === selectedPatientId;
    const isFever = v.temperature && v.temperature >= 37.5;
    const isHighBp = v.systolic_bp && (v.systolic_bp >= 140 || (v.diastolic_bp && v.diastolic_bp >= 90));
    const isLowBp = v.systolic_bp && v.systolic_bp < 90;
    const isLowSpo2 = v.spo2 && v.spo2 < 94;
    const isAbnormalHr = v.heart_rate && (v.heart_rate < 50 || v.heart_rate > 100);
    const isAbnormal = isFever || isHighBp || isLowBp || isLowSpo2 || isAbnormalHr;

    if (onlyAbnormal && !isAbnormal) return false;
    return matchesPatient;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#E1E4E8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1A1C1E]">Rilevazioni Parametri Vitali Reparto</h1>
            <p className="text-xs text-slate-500">
              Controllo parametri, monitoraggio della pressione arteriosa, febbre, frequenza e saturazione
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Rileva Parametri
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl p-4 md:p-5 border border-[#E1E4E8] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
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

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer bg-slate-50 px-3 py-2 rounded-xl border border-[#E1E4E8]">
            <input
              type="checkbox"
              checked={onlyAbnormal}
              onChange={(e) => setOnlyAbnormal(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500"
            />
            <span className="text-rose-700">Mostra solo valori critici / alert</span>
          </label>
        </div>

        <span className="text-xs text-slate-400">
          Totale rilevazioni: <strong>{filteredVitals.length}</strong>
        </span>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Vitals Table */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-[#E1E4E8] p-12 text-center text-xs text-slate-400">
          Caricamento parametri...
        </div>
      ) : filteredVitals.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-[#E1E4E8] p-12 text-center">
          <Activity className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <h4 className="font-bold text-slate-700 text-xs">Nessuna rilevazione trovata</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Registra una nuova rilevazione per aggiornare il quadro clinico.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-3 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors cursor-pointer"
          >
            + Rileva Parametri
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#E1E4E8] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/50 border-b border-[#E1E4E8] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-5">Paziente / Stanza</th>
                  <th className="py-4 px-3">Data & Ora</th>
                  <th className="py-4 px-3">PA (Max/Min)</th>
                  <th className="py-4 px-3">FC (bpm)</th>
                  <th className="py-4 px-3">Temp (°C)</th>
                  <th className="py-4 px-3">SpO2 (%)</th>
                  <th className="py-4 px-3">DTX (mg/dL)</th>
                  <th className="py-4 px-4">Operatore</th>
                  <th className="py-4 px-5 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F7F9]">
                {filteredVitals.map((v) => {
                  const pat = (v as any).patient;
                  const d = new Date(v.recorded_at);
                  const isFever = v.temperature && v.temperature >= 37.5;
                  const isHighBp = v.systolic_bp && (v.systolic_bp >= 140 || (v.diastolic_bp && v.diastolic_bp >= 90));
                  const isLowBp = v.systolic_bp && v.systolic_bp < 90;
                  const isLowSpo2 = v.spo2 && v.spo2 < 94;
                  const isAbnormalHr = v.heart_rate && (v.heart_rate < 50 || v.heart_rate > 100);

                  return (
                    <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        {pat ? (
                          <button
                            onClick={() => onSelectPatient(pat.id)}
                            className="font-bold text-slate-900 hover:text-teal-700 hover:underline cursor-pointer block text-left"
                          >
                            {pat.last_name} {pat.first_name}
                            <span className="text-[11px] font-normal text-slate-400 block font-mono">
                              {pat.internal_code} {pat.room_number ? `• St. ${pat.room_number}` : ''}
                            </span>
                          </button>
                        ) : (
                          <span className="text-slate-400">Paziente sconosciuto</span>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-500">
                        <div>{d.toLocaleDateString('it-IT')}</div>
                        <div className="text-[10px] text-slate-400">{d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap font-mono">
                        {v.systolic_bp && v.diastolic_bp ? (
                          <span
                            className={`px-2 py-0.5 rounded font-semibold ${
                              isHighBp
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : isLowBp
                                ? 'bg-amber-100 text-amber-800'
                                : 'text-slate-800'
                            }`}
                          >
                            {v.systolic_bp}/{v.diastolic_bp}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap font-mono">
                        {v.heart_rate ? (
                          <span className={isAbnormalHr ? 'font-bold text-amber-700' : 'text-slate-700'}>
                            {v.heart_rate}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap font-mono">
                        {v.temperature ? (
                          <span
                            className={`px-2 py-0.5 rounded ${
                              isFever
                                ? 'bg-rose-100 text-rose-800 font-bold border border-rose-200'
                                : 'text-slate-700'
                            }`}
                          >
                            {v.temperature}°C
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap font-mono">
                        {v.spo2 ? (
                          <span
                            className={`px-2 py-0.5 rounded ${
                              isLowSpo2
                                ? 'bg-rose-100 text-rose-800 font-bold border border-rose-200'
                                : 'text-slate-700'
                            }`}
                          >
                            {v.spo2}%
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-700">
                        {v.blood_glucose ? `${v.blood_glucose} mg/dL` : <span className="text-slate-300">-</span>}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                        {v.operator_name || 'Operatore'}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: New Vital Sign */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Rilevazione Parametri Vitali</h3>
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
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ora *</label>
                  <input
                    type="time"
                    required
                    value={recordTime}
                    onChange={(e) => setRecordTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* PA and Heart Rate */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">PA Max (mmHg)</label>
                  <input
                    type="number"
                    placeholder="120"
                    value={systolicBp}
                    onChange={(e) => setSystolicBp(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">PA Min (mmHg)</label>
                  <input
                    type="number"
                    placeholder="80"
                    value={diastolicBp}
                    onChange={(e) => setDiastolicBp(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">FC (bpm)</label>
                  <input
                    type="number"
                    placeholder="72"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>
              </div>

              {/* Temp, SpO2, DTX */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="36.5"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SpO2 (%)</label>
                  <input
                    type="number"
                    placeholder="98"
                    value={spo2}
                    onChange={(e) => setSpo2(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">DTX (mg/dL)</label>
                  <input
                    type="number"
                    placeholder="110"
                    value={bloodGlucose}
                    onChange={(e) => setBloodGlucose(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Note Assistenziali</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Condizioni generali o sintomi riferiti..."
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
                  {saving ? 'Salvataggio...' : 'Salva Rilevazione'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
