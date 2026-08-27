import React, { useState, useEffect } from 'react';
import {
  Activity,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  Clock,
  Printer,
  Calendar,
  AlertCircle,
  FileText,
  Edit2,
  Droplets,
  ShieldAlert,
  Info,
  Check,
} from 'lucide-react';
import {
  CatheterRecord,
  CatheterType,
  CatheterMaterial,
  CatheterUrineColor,
  CatheterUrineAspect,
  CatheterBagType,
  CatheterPatencyStatus,
} from '../../../types';
import {
  getCatheterRecordsByPatient,
  createCatheterRecord,
  updateCatheterRecord,
  deleteCatheterRecord,
} from '../../../services/catheterService';
import { useAuth } from '../../../context/AuthContext';
import { resetAppScroll } from '../../../lib/scrollUtils';

interface TabCatetereProps {
  patientId: string;
}

export function TabCatetere({ patientId }: TabCatetereProps) {
  const { user, profile } = useAuth();
  const [records, setRecords] = useState<CatheterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CatheterRecord | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [hasCatheter, setHasCatheter] = useState<boolean>(true);
  const [catheterType, setCatheterType] = useState<CatheterType>('foley_2vie');
  const [material, setMaterial] = useState<CatheterMaterial>('silicone_100');
  const [gaugeCh, setGaugeCh] = useState<string>('Ch 16');
  const [balloonMl, setBalloonMl] = useState<number>(10);
  const [insertionDate, setInsertionDate] = useState<string>(
    () => new Date().toISOString().slice(0, 10)
  );
  const [nextReplacementDate, setNextReplacementDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });
  const [recordedDate, setRecordedDate] = useState<string>(
    () => new Date().toISOString().slice(0, 10)
  );
  const [recordedTime, setRecordedTime] = useState<string>(
    () => new Date().toTimeString().slice(0, 5)
  );
  const [diuresisAmountMl, setDiuresisAmountMl] = useState<number | ''>(1200);
  const [diuresisHours, setDiuresisHours] = useState<number>(24);
  const [urineColor, setUrineColor] = useState<CatheterUrineColor>('giallo_paglierino');
  const [urineAspect, setUrineAspect] = useState<CatheterUrineAspect>('limpido');
  const [bagEmptied, setBagEmptied] = useState<boolean>(true);
  const [bagReplaced, setBagReplaced] = useState<boolean>(false);
  const [bagType, setBagType] = useState<CatheterBagType>('letto_valvola_antireflusso');
  const [meatusHygieneDone, setMeatusHygieneDone] = useState<boolean>(true);
  const [patencyCheck, setPatencyCheck] = useState<CatheterPatencyStatus>('pervio_normale');
  const [notes, setNotes] = useState<string>('');

  const loadRecords = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data, error } = await getCatheterRecordsByPatient(patientId);
      if (error) setErrorMessage(error);
      else setRecords(data || []);
    } catch (err: any) {
      setErrorMessage(err.message || 'Errore nel caricamento dei dati catetere');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [patientId]);

  // Current active catheter status
  const latestRecord = records[0] || null;
  const isCurrentlyCatheterized = latestRecord ? latestRecord.has_catheter : false;

  // Days until next replacement
  const daysUntilReplacement = latestRecord?.next_replacement_date
    ? Math.ceil(
        (new Date(latestRecord.next_replacement_date).getTime() - new Date().setHours(0, 0, 0, 0)) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const handleOpenNew = () => {
    setEditingRecord(null);
    setHasCatheter(latestRecord ? latestRecord.has_catheter : true);
    setCatheterType(latestRecord?.catheter_type || 'foley_2vie');
    setMaterial(latestRecord?.material || 'silicone_100');
    setGaugeCh(latestRecord?.gauge_ch || 'Ch 16');
    setBalloonMl(latestRecord?.balloon_ml || 10);
    setInsertionDate(latestRecord?.insertion_date || new Date().toISOString().slice(0, 10));
    setNextReplacementDate(
      latestRecord?.next_replacement_date ||
        new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
    );
    setRecordedDate(new Date().toISOString().slice(0, 10));
    setRecordedTime(new Date().toTimeString().slice(0, 5));
    setDiuresisAmountMl(1200);
    setDiuresisHours(24);
    setUrineColor('giallo_paglierino');
    setUrineAspect('limpido');
    setBagEmptied(true);
    setBagReplaced(false);
    setBagType(latestRecord?.bag_type || 'letto_valvola_antireflusso');
    setMeatusHygieneDone(true);
    setPatencyCheck('pervio_normale');
    setNotes('');
    setModalOpen(true);
  };

  const handleOpenEdit = (rec: CatheterRecord) => {
    const recDate = new Date(rec.recorded_at);
    setEditingRecord(rec);
    setHasCatheter(rec.has_catheter);
    setCatheterType(rec.catheter_type || 'foley_2vie');
    setMaterial(rec.material || 'silicone_100');
    setGaugeCh(rec.gauge_ch || 'Ch 16');
    setBalloonMl(rec.balloon_ml || 10);
    setInsertionDate(rec.insertion_date || rec.recorded_at.slice(0, 10));
    setNextReplacementDate(rec.next_replacement_date || '');
    setRecordedDate(rec.recorded_at.slice(0, 10));
    setRecordedTime(recDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }));
    setDiuresisAmountMl(rec.diuresis_amount_ml ?? '');
    setDiuresisHours(rec.diuresis_hours || 24);
    setUrineColor(rec.urine_color || 'giallo_paglierino');
    setUrineAspect(rec.urine_aspect || 'limpido');
    setBagEmptied(rec.bag_emptied ?? true);
    setBagReplaced(rec.bag_replaced ?? false);
    setBagType(rec.bag_type || 'letto_valvola_antireflusso');
    setMeatusHygieneDone(rec.meatus_hygiene_done ?? true);
    setPatencyCheck(rec.patency_check || 'pervio_normale');
    setNotes(rec.notes || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    const operatorName =
      profile?.full_name || profile?.qualification || user?.email?.split('@')[0] || 'Operatore OSS';
    const combinedDate = new Date(`${recordedDate}T${recordedTime}:00`);

    const payload = {
      patient_id: patientId,
      recorded_at: combinedDate.toISOString(),
      has_catheter: hasCatheter,
      catheter_type: hasCatheter ? catheterType : undefined,
      material: hasCatheter ? material : undefined,
      gauge_ch: hasCatheter ? gaugeCh : undefined,
      balloon_ml: hasCatheter ? Number(balloonMl) : undefined,
      insertion_date: hasCatheter ? insertionDate : undefined,
      next_replacement_date: hasCatheter ? nextReplacementDate : undefined,
      diuresis_amount_ml: hasCatheter && diuresisAmountMl !== '' ? Number(diuresisAmountMl) : undefined,
      diuresis_hours: hasCatheter ? Number(diuresisHours) : undefined,
      urine_color: hasCatheter ? urineColor : undefined,
      urine_aspect: hasCatheter ? urineAspect : undefined,
      bag_emptied: hasCatheter ? bagEmptied : undefined,
      bag_replaced: hasCatheter ? bagReplaced : undefined,
      bag_type: hasCatheter ? bagType : undefined,
      meatus_hygiene_done: hasCatheter ? meatusHygieneDone : undefined,
      patency_check: hasCatheter ? patencyCheck : undefined,
      notes: notes.trim() || undefined,
      operator_name: operatorName,
      recorded_by: user?.email || operatorName,
    };

    try {
      if (editingRecord) {
        const { data, error } = await updateCatheterRecord(editingRecord.id, payload);
        if (error) throw new Error(error);
        if (data) {
          setRecords((prev) => prev.map((r) => (r.id === data.id ? data : r)));
        }
      } else {
        const { data, error } = await createCatheterRecord(payload);
        if (error) throw new Error(error);
        if (data) {
          setRecords((prev) => [data, ...prev]);
        }
      }
      setModalOpen(false);
      resetAppScroll();
    } catch (err: any) {
      setErrorMessage(err.message || 'Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Sei sicuro di voler eliminare questa rilevazione del catetere?')) return;
    try {
      const { success, error } = await deleteCatheterRecord(id);
      if (error) throw new Error(error);
      if (success) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
        if (editingRecord?.id === id) setModalOpen(false);
      }
    } catch (err: any) {
      alert('Errore eliminazione: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Error Box */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* BANNER STATO ATTUALE CATETERE & SCADENZA */}
      <div className="bg-white p-6 rounded-3xl border border-[#E1E4E8] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs shrink-0 ${
                isCurrentlyCatheterized ? 'bg-teal-600' : 'bg-slate-400'
              }`}
            >
              <Droplets className="w-7 h-7" />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900">
                  {isCurrentlyCatheterized
                    ? 'Catetere Vescicale a Permanenza Presente'
                    : 'Nessun Catetere Vescicale Attivo'}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    isCurrentlyCatheterized
                      ? 'bg-teal-50 text-teal-800 border-teal-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {isCurrentlyCatheterized ? '● Attivo in Sede' : '○ Non presente / Rimosso'}
                </span>
              </div>

              {latestRecord && isCurrentlyCatheterized && (
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-2">
                  <span className="font-semibold">
                    Tipo: <strong>{latestRecord.catheter_type?.replace('_', ' ').toUpperCase()}</strong> ({latestRecord.gauge_ch || 'Ch 16'})
                  </span>
                  <span>•</span>
                  <span>
                    Materiale: <strong>{latestRecord.material?.replace('_', ' ')}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Palloncino: <strong>{latestRecord.balloon_ml || 10} ml</strong>
                  </span>
                  {latestRecord.insertion_date && (
                    <>
                      <span>•</span>
                      <span>
                        Inserito il: <strong>{new Date(latestRecord.insertion_date).toLocaleDateString('it-IT')}</strong>
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Replacement status warning or quick add */}
          <div className="flex items-center gap-3">
            {daysUntilReplacement !== null && isCurrentlyCatheterized && (
              <div
                className={`px-3.5 py-2 rounded-2xl border text-xs font-bold ${
                  daysUntilReplacement <= 3
                    ? 'bg-rose-50 text-rose-900 border-rose-300 animate-pulse'
                    : daysUntilReplacement <= 7
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : 'bg-teal-50 text-teal-900 border-teal-200'
                }`}
              >
                <div className="text-[10px] uppercase font-bold opacity-75">Sostituzione Programmata</div>
                <div>
                  {daysUntilReplacement <= 0
                    ? '🚨 SCADUTO / DA SOSTITUIRE'
                    : `In scadenza tra ${daysUntilReplacement} giorni`}
                </div>
              </div>
            )}

            <button
              onClick={handleOpenNew}
              className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nuova Rilevazione / Svuotamento
            </button>
          </div>
        </div>
      </div>

      {/* TABELLA STORICO RILEVAZIONI CATETERE & DIURESI */}
      <div className="bg-white rounded-3xl border border-[#E1E4E8] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E1E4E8] flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              Registro Monitoraggio Catetere Vescicale & Diuresi
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Controllo pervietà, svuotamento sacca, quantità urine, aspetto e igiene meato
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-medium">Caricamento in corso...</div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm font-bold text-slate-700">Nessuna registrazione catetere</p>
            <button
              onClick={handleOpenNew}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold cursor-pointer"
            >
              + Inserisci Primo Controllo
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E1E4E8] text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Data & Ora</th>
                  <th className="py-3.5 px-4">Stato Presidio</th>
                  <th className="py-3.5 px-4">Diuresi (ml)</th>
                  <th className="py-3.5 px-4">Aspetto & Colore Urine</th>
                  <th className="py-3.5 px-4">Pervietà & Igiene Meato</th>
                  <th className="py-3.5 px-4">Note Assistenziali</th>
                  <th className="py-3.5 px-4">Operatore</th>
                  <th className="py-3.5 px-4 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((rec) => {
                  const recDate = new Date(rec.recorded_at);
                  const isBlocked = rec.patency_check === 'ostruito_spillamento';
                  const isHematuria = rec.urine_color === 'ematuriche_rosso' || rec.urine_aspect === 'coaguli_ematici';

                  return (
                    <tr
                      key={rec.id}
                      className={`hover:bg-[#F5F7F9]/80 transition-colors ${
                        isBlocked || isHematuria ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900">
                        {recDate.toLocaleDateString('it-IT', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}{' '}
                        <span className="font-mono text-slate-400 font-normal ml-1">
                          {recDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {rec.has_catheter ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 font-bold text-[11px]">
                            <Droplets className="w-3.5 h-3.5 text-teal-600" />
                            {rec.gauge_ch || 'Foley'} ({rec.material?.replace('_100', '') || 'Silicone'})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-semibold text-[11px]">
                            Assente / Rimosso
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {rec.has_catheter && rec.diuresis_amount_ml ? (
                          <span className="font-bold text-slate-900 font-mono">
                            {rec.diuresis_amount_ml} ml{' '}
                            <span className="text-slate-400 font-normal text-[10px]">
                              / {rec.diuresis_hours || 24}h
                            </span>
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {rec.has_catheter ? (
                          <div className="space-y-0.5">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                rec.urine_color === 'ematuriche_rosso'
                              ? 'bg-rose-100 text-rose-900 border border-rose-200'
                              : rec.urine_color === 'ipercromiche_scure'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-emerald-50 text-emerald-800'
                              }`}
                            >
                              {rec.urine_color?.replace('_', ' ') || 'Normocromiche'}
                            </span>
                            <div className="text-[10px] text-slate-500">
                              {rec.urine_aspect?.replace('_', ' ') || 'Limpido'}
                            </div>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                        {rec.has_catheter ? (
                          <div className="space-y-0.5 text-[11px]">
                            <div className="flex items-center gap-1">
                              {rec.patency_check === 'pervio_normale' ? (
                                <span className="text-emerald-700 font-bold flex items-center gap-1">
                                  <Check className="w-3 h-3 text-emerald-600" /> Pervio
                                </span>
                              ) : (
                                <span className="text-rose-700 font-bold flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-rose-600" /> Ostruito / Spillamento
                                </span>
                              )}
                            </div>
                            {rec.meatus_hygiene_done && (
                              <div className="text-[10px] text-slate-500">✓ Igiene meato eseguita</div>
                            )}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">
                        {rec.notes || '—'}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-medium">
                        {rec.operator_name || 'OSS'}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(rec)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer"
                            title="Modifica"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(rec.id, e)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
        )}
      </div>

      {/* MODALE INSERIMENTO / MODIFICA CONTROLLO CATETERE */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-[#E1E4E8]">
            <div className="p-5 border-b border-[#E1E4E8] flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingRecord ? 'Modifica Rilevazione Catetere' : 'Registra Controllo Catetere & Diuresi'}
                  </h3>
                  <p className="text-xs text-slate-500">Monitoraggio presidio e bilancio diuretico</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Presenza Catetere Switch */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">Catetere Vescicale in Sede</span>
                  <span className="text-[11px] text-slate-500">
                    {hasCatheter ? 'Presidio attivo presente' : 'Nessun catetere / rimosso'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setHasCatheter(!hasCatheter)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    hasCatheter ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {hasCatheter ? 'PRESENTE' : 'ASSENTE'}
                </button>
              </div>

              {hasCatheter && (
                <>
                  {/* Tipo e Calibro */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Calibro (Ch / Fr)</label>
                      <select
                        value={gaugeCh}
                        onChange={(e) => setGaugeCh(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      >
                        <option value="Ch 12">Ch 12 (Sottile)</option>
                        <option value="Ch 14">Ch 14 (Standard)</option>
                        <option value="Ch 16">Ch 16 (Standard adulto)</option>
                        <option value="Ch 18">Ch 18 (Grande)</option>
                        <option value="Ch 20">Ch 20 (Ematuria/Lavaggio)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Materiale</label>
                      <select
                        value={material}
                        onChange={(e) => setMaterial(e.target.value as CatheterMaterial)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      >
                        <option value="silicone_100">Silicone 100% (Lunga durata)</option>
                        <option value="lattice_siliconato">Lattice Siliconato</option>
                        <option value="idrogel">Idrogel</option>
                        <option value="pvc">PVC / Altro</option>
                      </select>
                    </div>
                  </div>

                  {/* Quantità diuresi e orario */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Diuresi Svuotata (ml)</label>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={diuresisAmountMl}
                        onChange={(e) => setDiuresisAmountMl(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="Es. 1200"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Periodo (Ore)</label>
                      <select
                        value={diuresisHours}
                        onChange={(e) => setDiuresisHours(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      >
                        <option value={24}>24 Ore (Giornaliera)</option>
                        <option value={12}>12 Ore</option>
                        <option value={8}>8 Ore (Turno OSS)</option>
                      </select>
                    </div>
                  </div>

                  {/* Colore e Aspetto Urine */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Colore Urine</label>
                      <select
                        value={urineColor}
                        onChange={(e) => setUrineColor(e.target.value as CatheterUrineColor)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      >
                        <option value="giallo_paglierino">Giallo Paglierino (Normale)</option>
                        <option value="ipercromiche_scure">Ipercromiche / Concentrate</option>
                        <option value="ematuriche_rosso">Ematuriche (Sangue)</option>
                        <option value="torbide_sedimento">Torbide con Sedimento</option>
                        <option value="marsala_marroncine">Marsala / Marroni</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Aspetto Urine</label>
                      <select
                        value={urineAspect}
                        onChange={(e) => setUrineAspect(e.target.value as CatheterUrineAspect)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      >
                        <option value="limpido">Limpido</option>
                        <option value="torbido">Torbido</option>
                        <option value="sedimento_flocculi">Sedimento / Flocculi</option>
                        <option value="coaguli_ematici">Presenza Coaguli</option>
                        <option value="odore_pungente">Odore Pungente / Acre</option>
                      </select>
                    </div>
                  </div>

                  {/* Controlli OSS: Pervietà, Igiene Meato, Svuotamento */}
                  <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="font-bold text-slate-800 block text-[11px]">Azioni & Controlli OSS Eseguiti:</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={meatusHygieneDone}
                        onChange={(e) => setMeatusHygieneDone(e.target.checked)}
                        className="rounded text-teal-600"
                      />
                      <span className="text-slate-700">Igiene e disinfezione del meato uretrale eseguita</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bagEmptied}
                        onChange={(e) => setBagEmptied(e.target.checked)}
                        className="rounded text-teal-600"
                      />
                      <span className="text-slate-700">Sacca di raccolta svuotata regolarmente</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bagReplaced}
                        onChange={(e) => setBagReplaced(e.target.checked)}
                        className="rounded text-teal-600"
                      />
                      <span className="text-slate-700">Sacca di raccolta sostituita con nuova</span>
                    </label>
                  </div>

                  {/* Scadenza & Data Inserimento */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Data Inserimento</label>
                      <input
                        type="date"
                        value={insertionDate}
                        onChange={(e) => setInsertionDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Prossima Sostituzione</label>
                      <input
                        type="date"
                        value={nextReplacementDate}
                        onChange={(e) => setNextReplacementDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Data & Ora Rilevazione */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data Registrazione</label>
                  <input
                    type="date"
                    required
                    value={recordedDate}
                    onChange={(e) => setRecordedDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ora Registrazione</label>
                  <input
                    type="time"
                    required
                    value={recordedTime}
                    onChange={(e) => setRecordedTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Note OSS */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Note Assistenziali / OSS</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Es. Catetere ben posizionato, assenza di trazioni, urine limpide..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer"
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
