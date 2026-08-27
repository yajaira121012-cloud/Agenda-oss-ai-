import React, { useState, useEffect } from 'react';
import {
  Activity,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  CheckCircle2,
  X,
  Thermometer,
  Heart,
  Droplet,
  Scale,
  Wind,
  Clock,
  UserCheck,
} from 'lucide-react';
import { VitalSign } from '../../../types';
import {
  getVitalSignsByPatient,
  createVitalSign,
  updateVitalSign,
  deleteVitalSign,
} from '../../../services/vitalSignsService';
import { useAuth } from '../../../context/AuthContext';

interface TabParametriProps {
  patientId: string;
}

export function TabParametri({ patientId }: TabParametriProps) {
  const { user, profile } = useAuth();
  const [vitalSigns, setVitalSigns] = useState<VitalSign[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const now = new Date();
  const todayDateStr = now.toISOString().slice(0, 10);
  const nowTimeStr = now.toTimeString().slice(0, 5);

  const [recordDate, setRecordDate] = useState(todayDateStr);
  const [recordTime, setRecordTime] = useState(nowTimeStr);
  const [temperature, setTemperature] = useState<string>('');
  const [systolicBp, setSystolicBp] = useState<string>('');
  const [diastolicBp, setDiastolicBp] = useState<string>('');
  const [heartRate, setHeartRate] = useState<string>('');
  const [spo2, setSpo2] = useState<string>('');
  const [respiratoryRate, setRespiratoryRate] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [bloodGlucose, setBloodGlucose] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const loadVitals = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data, error } = await getVitalSignsByPatient(patientId);
      if (error) {
        setErrorMessage(error);
      } else {
        setVitalSigns(data || []);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Errore nel recupero parametri');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVitals();
  }, [patientId]);

  const handleOpenAdd = () => {
    const curNow = new Date();
    setEditingId(null);
    setRecordDate(curNow.toISOString().slice(0, 10));
    setRecordTime(curNow.toTimeString().slice(0, 5));
    setTemperature('');
    setSystolicBp('');
    setDiastolicBp('');
    setHeartRate('');
    setSpo2('');
    setRespiratoryRate('');
    setWeight('');
    setBloodGlucose('');
    setNotes('');
    setModalOpen(true);
  };

  const handleOpenEdit = (v: VitalSign) => {
    setEditingId(v.id);
    const dateObj = new Date(v.recorded_at);
    setRecordDate(dateObj.toISOString().slice(0, 10));
    setRecordTime(dateObj.toTimeString().slice(0, 5));
    setTemperature(v.temperature !== undefined && v.temperature !== null ? String(v.temperature) : '');
    setSystolicBp(v.systolic_bp !== undefined && v.systolic_bp !== null ? String(v.systolic_bp) : '');
    setDiastolicBp(v.diastolic_bp !== undefined && v.diastolic_bp !== null ? String(v.diastolic_bp) : '');
    setHeartRate(v.heart_rate !== undefined && v.heart_rate !== null ? String(v.heart_rate) : '');
    setSpo2(v.spo2 !== undefined && v.spo2 !== null ? String(v.spo2) : '');
    setRespiratoryRate(v.respiratory_rate !== undefined && v.respiratory_rate !== null ? String(v.respiratory_rate) : '');
    setWeight(v.weight !== undefined && v.weight !== null ? String(v.weight) : '');
    setBloodGlucose(v.blood_glucose !== undefined && v.blood_glucose !== null ? String(v.blood_glucose) : '');
    setNotes(v.notes || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const fullTimestamp = new Date(`${recordDate}T${recordTime}:00`).toISOString();
    const operatorName = profile?.full_name || user?.email?.split('@')[0] || 'Operatore OSS';

    try {
      const payload = {
        patient_id: patientId,
        recorded_at: fullTimestamp,
        temperature: temperature ? parseFloat(temperature) : null,
        systolic_bp: systolicBp ? parseInt(systolicBp, 10) : null,
        diastolic_bp: diastolicBp ? parseInt(diastolicBp, 10) : null,
        heart_rate: heartRate ? parseInt(heartRate, 10) : null,
        spo2: spo2 ? parseInt(spo2, 10) : null,
        respiratory_rate: respiratoryRate ? parseInt(respiratoryRate, 10) : null,
        weight: weight ? parseFloat(weight) : null,
        blood_glucose: bloodGlucose ? parseInt(bloodGlucose, 10) : null,
        notes: notes.trim() || undefined,
        recorded_by: user?.id,
        operator_name: operatorName,
      };

      if (editingId) {
        const { error } = await updateVitalSign(editingId, payload);
        if (error) throw new Error(error);
      } else {
        const { error } = await createVitalSign(payload);
        if (error) throw new Error(error);
      }

      setModalOpen(false);
      loadVitals();
    } catch (err: any) {
      alert(err.message || 'Errore durante il salvataggio dei parametri');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questa rilevazione?')) {
      const { success, error } = await deleteVitalSign(id);
      if (success) {
        loadVitals();
      } else {
        alert(error || 'Errore nella cancellazione');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Rilevazione Parametri Vitali</h3>
          <p className="text-xs text-slate-500">
            Pressione arteriosa, frequenza cardiaca, temperatura, SpO2, glicemia DTX e frequenza respiratoria
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Rileva Nuovi Parametri
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Caricamento parametri vitali...</div>
      ) : vitalSigns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
          <Activity className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <h4 className="font-bold text-slate-700 text-xs">Nessun parametro registrato</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Registra le prime rilevazioni cliniche per questo assistito.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-3 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg cursor-pointer"
          >
            + Rileva Parametro
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Data & Ora</th>
                  <th className="py-3 px-3">PA (Max/Min)</th>
                  <th className="py-3 px-3">FC (bpm)</th>
                  <th className="py-3 px-3">Temp (°C)</th>
                  <th className="py-3 px-3">SpO2 (%)</th>
                  <th className="py-3 px-3">DTX (mg/dL)</th>
                  <th className="py-3 px-3">FR (atti)</th>
                  <th className="py-3 px-3">Peso (kg)</th>
                  <th className="py-3 px-4">Operatore</th>
                  <th className="py-3 px-4 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vitalSigns.map((v) => {
                  const d = new Date(v.recorded_at);
                  const isFever = v.temperature && v.temperature >= 37.5;
                  const isHighBp = v.systolic_bp && (v.systolic_bp >= 140 || (v.diastolic_bp && v.diastolic_bp >= 90));
                  const isLowBp = v.systolic_bp && v.systolic_bp < 90;
                  const isLowSpo2 = v.spo2 && v.spo2 < 94;
                  const isAbnormalHr = v.heart_rate && (v.heart_rate < 50 || v.heart_rate > 100);
                  const isAbnormalGlucose = v.blood_glucose && (v.blood_glucose < 70 || v.blood_glucose > 180);

                  return (
                    <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">
                          {d.toLocaleDateString('it-IT')}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        {v.systolic_bp && v.diastolic_bp ? (
                          <span
                            className={`px-2 py-0.5 rounded font-mono font-semibold ${
                              isHighBp
                                ? 'bg-rose-100 text-rose-800'
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

                      <td className="py-3 px-3 whitespace-nowrap">
                        {v.heart_rate ? (
                          <span
                            className={`font-mono ${
                              isAbnormalHr ? 'font-bold text-amber-700' : 'text-slate-700'
                            }`}
                          >
                            {v.heart_rate}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        {v.temperature ? (
                          <span
                            className={`px-2 py-0.5 rounded font-mono ${
                              isFever
                                ? 'bg-rose-100 text-rose-800 font-bold border border-rose-200'
                                : 'text-slate-700'
                            }`}
                          >
                            {v.temperature}°
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        {v.spo2 ? (
                          <span
                            className={`px-2 py-0.5 rounded font-mono ${
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

                      <td className="py-3 px-3 whitespace-nowrap">
                        {v.blood_glucose ? (
                          <span
                            className={`font-mono ${
                              isAbnormalGlucose ? 'font-bold text-amber-700' : 'text-slate-700'
                            }`}
                          >
                            {v.blood_glucose}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-700">
                        {v.respiratory_rate || <span className="text-slate-300">-</span>}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-700">
                        {v.weight ? `${v.weight} kg` : <span className="text-slate-300">-</span>}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                        {v.operator_name || 'Operatore'}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(v)}
                            className="p-1 text-slate-400 hover:text-teal-600 rounded cursor-pointer"
                            title="Modifica"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(v.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                            title="Elimina"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: New / Edit Vital Sign */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingId ? 'Modifica Rilevazione Parametri' : 'Registra Parametri Vitali'}
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data Rilevazione *</label>
                  <input
                    type="date"
                    required
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ora Rilevazione *</label>
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">PA Sistolica (Max)</label>
                  <input
                    type="number"
                    placeholder="120"
                    value={systolicBp}
                    onChange={(e) => setSystolicBp(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400">mmHg</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">PA Diastolica (Min)</label>
                  <input
                    type="number"
                    placeholder="80"
                    value={diastolicBp}
                    onChange={(e) => setDiastolicBp(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400">mmHg</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Freq. Cardiaca</label>
                  <input
                    type="number"
                    placeholder="72"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400">bpm</span>
                </div>
              </div>

              {/* Temp, SpO2, DTX */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Temperatura</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="36.5"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400">°C</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SpO2</label>
                  <input
                    type="number"
                    placeholder="98"
                    value={spo2}
                    onChange={(e) => setSpo2(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400">%</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Glicemia DTX</label>
                  <input
                    type="number"
                    placeholder="110"
                    value={bloodGlucose}
                    onChange={(e) => setBloodGlucose(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400">mg/dL</span>
                </div>
              </div>

              {/* Respiratory Rate & Weight */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Freq. Respiratoria</label>
                  <input
                    type="number"
                    placeholder="16"
                    value={respiratoryRate}
                    onChange={(e) => setRespiratoryRate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400">atti / min</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Peso Corporeo</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="70.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400">kg</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Note Clinico-Assistenziali</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Sintomi riferiti dall'assistito, condizioni al momento della misurazione..."
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
