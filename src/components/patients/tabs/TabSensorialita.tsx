import React, { useState, useEffect } from 'react';
import {
  Ear,
  Eye,
  Smile,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import {
  PatientSensoryInfo,
  HearingStatus,
  HearingAidStatus,
  VisionStatus,
  DenturesStatus,
} from '../../../types';
import {
  getPatientSensoryInfo,
  upsertPatientSensoryInfo,
} from '../../../services/patientsService';

interface TabSensorialitaProps {
  patientId: string;
}

export function TabSensorialita({ patientId }: TabSensorialitaProps) {
  const [hearing, setHearing] = useState<HearingStatus>('normal');
  const [hearingAid, setHearingAid] = useState<HearingAidStatus>('none');
  const [vision, setVision] = useState<VisionStatus>('normal');
  const [dentures, setDentures] = useState<DenturesStatus>('none');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadSensory() {
      setLoading(true);
      try {
        const { data, error } = await getPatientSensoryInfo(patientId);
        if (data) {
          setHearing(data.hearing || 'normal');
          setHearingAid(data.hearing_aid || 'none');
          setVision(data.vision || 'normal');
          setDentures(data.dentures || 'none');
          setNotes(data.notes || '');
        }
      } catch (err: any) {
        console.error('Sensory info fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSensory();
  }, [patientId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const { data, error } = await upsertPatientSensoryInfo({
        patient_id: patientId,
        hearing,
        hearing_aid: hearingAid,
        vision,
        dentures,
        notes: notes.trim() || undefined,
      });

      if (error) throw new Error(error);

      setSuccessMessage('Dati sensoriali e protesi salvati con successo su Supabase!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Caricamento sensorialità...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Sensorialità, Comunicazione & Protesi</h3>
          <p className="text-xs text-slate-500">
            Monitoraggio di udito, vista, apparecchi acustici e protesi dentarie per l'assistenza quotidiana
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Salvataggio...' : 'Salva Modifiche'}
        </button>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Udito e Apparecchio Acustico */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Ear className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Udito & Apparecchio Acustico</h4>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Stato Udito</label>
            <div className="space-y-1.5">
              {[
                { id: 'normal', label: 'Normale / Conservato' },
                { id: 'hypoacusis', label: 'Ipoacusia / Sordità parziale' },
                { id: 'deafness', label: 'Sordità grave' },
                { id: 'other', label: 'Altro' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                    hearing === opt.id
                      ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="hearing_status"
                    checked={hearing === opt.id}
                    onChange={() => setHearing(opt.id as HearingStatus)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Apparecchio Acustico</label>
            <select
              value={hearingAid}
              onChange={(e) => setHearingAid(e.target.value as HearingAidStatus)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="none">No (Nessun apparecchio)</option>
              <option value="yes">Sì</option>
              <option value="bilateral">Sì - Bilaterale</option>
              <option value="right">Sì - Orecchio Destro</option>
              <option value="left">Sì - Orecchio Sinistro</option>
            </select>
          </div>
        </div>

        {/* 2. Vista & Occhiali */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Vista & Occhiali</h4>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Stato Vista</label>
            <div className="space-y-1.5">
              {[
                { id: 'normal', label: 'Normale / Conservata' },
                { id: 'glasses', label: 'Porta occhiali da vista' },
                { id: 'reduced', label: 'Ridotta / Ipovisione' },
                { id: 'blindness', label: 'Cecità / Cecità monoculare' },
                { id: 'other', label: 'Altro' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                    vision === opt.id
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="vision_status"
                    checked={vision === opt.id}
                    onChange={() => setVision(opt.id as VisionStatus)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Protesi Dentaria */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Smile className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Protesi Dentaria</h4>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Stato Protesi</label>
            <div className="space-y-1.5">
              {[
                { id: 'none', label: 'Nessuna protesi (Denti propri o edentulo)' },
                { id: 'yes', label: 'Sì (Generica)' },
                { id: 'upper', label: 'Protesi Superiore' },
                { id: 'lower', label: 'Protesi Inferiore' },
                { id: 'complete', label: 'Protesi Completa (Sup. + Inf.)' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                    dentures === opt.id
                      ? 'border-amber-500 bg-amber-50/50 text-amber-900 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="dentures_status"
                    checked={dentures === opt.id}
                    onChange={() => setDentures(opt.id as DenturesStatus)}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sensory Notes */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <label className="block text-xs font-semibold text-slate-700 mb-2">
          Note Assistenziali per la Comunicazione & Igiene delle Protesi
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="es. Parlare scandendo le parole frontalmente per agevolare la lettura labiale; togliere la dentiera prima del sonno e riporla nella vaschetta..."
          className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
        />
      </div>
    </form>
  );
}
