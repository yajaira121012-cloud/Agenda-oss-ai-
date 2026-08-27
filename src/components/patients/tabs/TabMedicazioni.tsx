import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  Clock,
  Calendar,
  AlertCircle,
  FileText,
  Edit2,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Info,
  Check,
  ChevronRight,
  Droplet,
  HeartPulse,
} from 'lucide-react';
import {
  WoundDressingRecord,
  WoundType,
  WoundAnatomicalSite,
  WoundStage,
  WoundPerilesionalSkin,
  WoundExudateAmount,
  WoundExudateType,
  WoundBedType,
  WoundCleansingSolution,
  DressingFrequency,
} from '../../../types';
import {
  getWoundRecordsByPatient,
  createWoundRecord,
  updateWoundRecord,
  deleteWoundRecord,
} from '../../../services/woundService';
import {
  getWoundCareSuggestion,
  OSS_QUICK_SNIPPETS,
} from '../../../lib/woundCareGuide';
import { useAuth } from '../../../context/AuthContext';
import { resetAppScroll } from '../../../lib/scrollUtils';

interface TabMedicazioniProps {
  patientId: string;
}

export function TabMedicazioni({ patientId }: TabMedicazioniProps) {
  const { user, profile } = useAuth();
  const [records, setRecords] = useState<WoundDressingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'oss' | 'nurse' | 'arrossamenti'>('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<WoundDressingRecord | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [woundType, setWoundType] = useState<WoundType>('arrossamento_cute_integra');
  const [anatomicalSite, setAnatomicalSite] = useState<WoundAnatomicalSite>('sacro');
  const [customSiteDesc, setCustomSiteDesc] = useState<string>('Regione sacrale');
  const [stage, setStage] = useState<WoundStage>('stadio_1_eritema');
  const [dimensionsCm, setDimensionsCm] = useState<string>('');
  const [depthMm, setDepthMm] = useState<string>('Superficiale');
  const [woundBed, setWoundBed] = useState<WoundBedType>('cute_arrossata_integra');
  const [perilesionalSkin, setPerilesionalSkin] = useState<WoundPerilesionalSkin>('eritematosa');
  const [exudateAmount, setExudateAmount] = useState<WoundExudateAmount>('assente_asciutta');
  const [exudateType, setExudateType] = useState<WoundExudateType>('sieroso');
  const [cleansingSolution, setCleansingSolution] = useState<WoundCleansingSolution>('fisiologica_09');
  const [dressingApplied, setDressingApplied] = useState<string>(
    'Connettivina garze sterili impregnate di Acido Ialuronico'
  );
  const [secondaryDressing, setSecondaryDressing] = useState<string>('Garza sterile in TNT di copertura');
  const [dressingFrequency, setDressingFrequency] = useState<DressingFrequency>('giorni_alterni');
  const [nextDressingDate, setNextDressingDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().slice(0, 10);
  });
  const [painScale, setPainScale] = useState<number>(1);
  const [performedAction, setPerformedAction] = useState<
    'medicazione_completa' | 'controllo_ispettivo' | 'cambio_fissaggio' | 'rimozione_punti' | 'applicazione_crema_barriera' | 'segnalazione_infermiere'
  >('medicazione_completa');
  const [recordedDate, setRecordedDate] = useState<string>(
    () => new Date().toISOString().slice(0, 10)
  );
  const [recordedTime, setRecordedTime] = useState<string>(
    () => new Date().toTimeString().slice(0, 5)
  );
  const [notes, setNotes] = useState<string>('');

  // Real-time OSS smart guidance based on current selection
  const currentSuggestion = getWoundCareSuggestion(woundType, stage);

  const loadRecords = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data, error } = await getWoundRecordsByPatient(patientId);
      if (error) setErrorMessage(error);
      else setRecords(data || []);
    } catch (err: any) {
      setErrorMessage(err.message || 'Errore nel caricamento delle medicazioni');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [patientId]);

  const handleOpenNew = (defaultType?: WoundType, defaultStage?: WoundStage) => {
    setEditingRecord(null);
    const initialType = defaultType || 'arrossamento_cute_integra';
    const initialStage = defaultStage || 'stadio_1_eritema';
    setWoundType(initialType);
    setAnatomicalSite('sacro');
    setCustomSiteDesc('Regione sacrale');
    setStage(initialStage);
    setDimensionsCm('');
    setDepthMm('Superficiale');
    setWoundBed('cute_arrossata_integra');
    setPerilesionalSkin('eritematosa');
    setExudateAmount('assente_asciutta');
    setExudateType('sieroso');

    const sug = getWoundCareSuggestion(initialType, initialStage);
    setCleansingSolution(sug.cleansingSolution);
    setDressingApplied(sug.dressingApplied);
    setSecondaryDressing(sug.secondaryDressing);
    setDressingFrequency(sug.frequency);

    const d = new Date();
    d.setDate(d.getDate() + 2);
    setNextDressingDate(d.toISOString().slice(0, 10));
    setPainScale(1);
    setPerformedAction(sug.isOssCompetence ? 'medicazione_completa' : 'segnalazione_infermiere');
    setRecordedDate(new Date().toISOString().slice(0, 10));
    setRecordedTime(new Date().toTimeString().slice(0, 5));
    setNotes(sug.notesTemplate);
    setModalOpen(true);
  };

  const handleOpenEdit = (rec: WoundDressingRecord) => {
    const recDate = new Date(rec.recorded_at);
    setEditingRecord(rec);
    setWoundType(rec.wound_type);
    setAnatomicalSite(rec.anatomical_site);
    setCustomSiteDesc(rec.custom_site_desc || '');
    setStage(rec.stage);
    setDimensionsCm(rec.dimensions_cm || '');
    setDepthMm(rec.depth_mm || '');
    setWoundBed(rec.wound_bed || 'cute_arrossata_integra');
    setPerilesionalSkin(rec.perilesional_skin || 'eritematosa');
    setExudateAmount(rec.exudate_amount || 'assente_asciutta');
    setExudateType(rec.exudate_type || 'sieroso');
    setCleansingSolution(rec.cleansing_solution || 'fisiologica_09');
    setDressingApplied(rec.dressing_applied || '');
    setSecondaryDressing(rec.secondary_dressing || '');
    setDressingFrequency(rec.dressing_frequency || 'giorni_alterni');
    setNextDressingDate(rec.next_dressing_date || '');
    setPainScale(rec.pain_scale ?? 0);
    setPerformedAction(rec.performed_action || 'medicazione_completa');
    setRecordedDate(rec.recorded_at.slice(0, 10));
    setRecordedTime(recDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }));
    setNotes(rec.notes || '');
    setModalOpen(true);
  };

  // Apply suggested protocol button
  const handleApplySuggestion = () => {
    setCleansingSolution(currentSuggestion.cleansingSolution);
    setDressingApplied(currentSuggestion.dressingApplied);
    setSecondaryDressing(currentSuggestion.secondaryDressing);
    setDressingFrequency(currentSuggestion.frequency);
    setNotes((prev) => {
      if (!prev || prev.trim().length === 0) return currentSuggestion.notesTemplate;
      return `${prev}\n${currentSuggestion.notesTemplate}`;
    });
    setPerformedAction(currentSuggestion.isOssCompetence ? 'medicazione_completa' : 'segnalazione_infermiere');
  };

  // Apply quick snippet to notes and dressing
  const handleApplySnippet = (snippet: (typeof OSS_QUICK_SNIPPETS)[0]) => {
    if (snippet.dressing) setDressingApplied(snippet.dressing);
    if (snippet.secondary) setSecondaryDressing(snippet.secondary);
    if (snippet.cleansing) setCleansingSolution(snippet.cleansing);
    setNotes((prev) => {
      if (!prev || prev.trim().length === 0) return snippet.text;
      return `${prev} ${snippet.text}`;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    const operatorName =
      profile?.full_name || profile?.qualification || user?.email?.split('@')[0] || 'Operatore OSS';
    const combinedDate = new Date(`${recordedDate}T${recordedTime}:00`);

    const isCompetent = currentSuggestion.isOssCompetence;

    const payload = {
      patient_id: patientId,
      recorded_at: combinedDate.toISOString(),
      wound_type: woundType,
      anatomical_site: anatomicalSite,
      custom_site_desc: customSiteDesc.trim() || undefined,
      stage: stage,
      dimensions_cm: dimensionsCm.trim() || undefined,
      depth_mm: depthMm.trim() || undefined,
      wound_bed: woundBed,
      perilesional_skin: perilesionalSkin,
      exudate_amount: exudateAmount,
      exudate_type: exudateType,
      cleansing_solution: cleansingSolution,
      dressing_applied: dressingApplied.trim() || 'Medicazione protettiva standard',
      secondary_dressing: secondaryDressing.trim() || undefined,
      dressing_frequency: dressingFrequency,
      last_dressing_date: recordedDate,
      next_dressing_date: nextDressingDate || undefined,
      pain_scale: Number(painScale),
      performed_action: performedAction,
      competence_status: isCompetent ? ('gestibile_da_oss' as const) : ('avvisare_infermiere_mmg' as const),
      notes: notes.trim() || undefined,
      operator_name: operatorName,
      recorded_by: user?.email || operatorName,
    };

    try {
      if (editingRecord) {
        const { data, error } = await updateWoundRecord(editingRecord.id, payload);
        if (error) throw new Error(error);
        if (data) {
          setRecords((prev) => prev.map((r) => (r.id === data.id ? data : r)));
        }
      } else {
        const { data, error } = await createWoundRecord(payload);
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
    if (!window.confirm('Sei sicuro di voler eliminare questa registrazione?')) return;
    try {
      const { success, error } = await deleteWoundRecord(id);
      if (error) throw new Error(error);
      if (success) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
        if (editingRecord?.id === id) setModalOpen(false);
      }
    } catch (err: any) {
      alert('Errore eliminazione: ' + err.message);
    }
  };

  const filteredRecords = records.filter((r) => {
    if (activeFilter === 'oss') {
      return (
        r.stage === 'stadio_0_arrossamento_sbiancabile' ||
        r.stage === 'stadio_1_eritema' ||
        r.stage === 'stadio_2_flittene' ||
        r.wound_type === 'arrossamento_cute_integra' ||
        r.wound_type === 'arrossamento_macerazione_pannolone' ||
        r.wound_type === 'arrossamento_sfregamento_pieghe'
      );
    }
    if (activeFilter === 'nurse') {
      return (
        r.stage === 'stadio_3_sottocutaneo' ||
        r.stage === 'stadio_4_muscolo_osso' ||
        r.stage === 'non_stadiabile_escara' ||
        r.wound_type === 'ferita_chirurgica' ||
        r.wound_type === 'ulcera_vascolare'
      );
    }
    if (activeFilter === 'arrossamenti') {
      return (
        r.wound_type === 'arrossamento_cute_integra' ||
        r.wound_type === 'arrossamento_macerazione_pannolone' ||
        r.wound_type === 'arrossamento_sfregamento_pieghe' ||
        r.stage === 'stadio_0_arrossamento_sbiancabile' ||
        r.stage === 'stadio_1_eritema'
      );
    }
    return true;
  });

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

      {/* HEADER OPERATIVO OSS */}
      <div className="bg-white p-6 rounded-3xl border border-[#E1E4E8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center font-bold text-white shadow-xs shrink-0">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900">
                Medicazioni, Arrossamenti & Lesioni (Guida OSS)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                {records.length} {records.length === 1 ? 'Registrazione' : 'Registrazioni'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Monitoraggio cute integra, eritemi, macerazioni da pannolone, flittene (2° stadio) e suggerimenti pratici di cura
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <button
            onClick={() => handleOpenNew('arrossamento_cute_integra', 'stadio_1_eritema')}
            className="px-3.5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            title="Registra nuovo arrossamento o eritema"
          >
            <Droplet className="w-4 h-4" />
            + Nuovo Arrossamento
          </button>
          <button
            onClick={() => handleOpenNew('flittene_vescicola', 'stadio_2_flittene')}
            className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            + Nuova Medicazione (Stadio 1-2)
          </button>
        </div>
      </div>

      {/* BANNER EDUCATIVO SULLE COMPETENZE OSS (1° E 2° STADIO vs INFERMIERE) */}
      <div className="bg-gradient-to-r from-teal-50/80 via-white to-indigo-50/70 p-4 sm:p-5 rounded-3xl border border-teal-100 shadow-xs flex flex-col sm:flex-row items-start gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-teal-600/10 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-900 text-sm">
              Competenze Operative OSS (Arrossamenti, 1° e 2° Stadio)
            </h4>
            <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
              Profilo OSS
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            L'OSS gestisce <strong>in piena autonomia la prevenzione, l'igiene, l'idratazione e la cura degli arrossamenti/macerazioni da pannolone</strong> e le medicazioni semplici superficiali prescritte fino al <strong>2° stadio</strong> (garze connettivina/acido ialuronico, pasta di zinco, idrocolloidi sottili, scarico pressorio).
          </p>
          <p className="text-slate-500 text-[11px] pt-1 border-t border-slate-200/60">
            ⚠️ <strong>Dal 3° Stadio in su (sottocute, muscolo, necrosi nera o infezione)</strong>: competenza infermieristica/medica. L'OSS esegue solo il controllo ispettivo e la segnalazione immediata all'Infermiere ADI o Medico (MMG).
          </p>
        </div>
      </div>

      {/* FILTRI RAPIDI */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-colors shrink-0 cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Tutte ({records.length})
        </button>
        <button
          onClick={() => setActiveFilter('arrossamenti')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-colors shrink-0 cursor-pointer ${
            activeFilter === 'arrossamenti'
              ? 'bg-amber-500 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          🧴 Arrossamenti & Macerazioni
        </button>
        <button
          onClick={() => setActiveFilter('oss')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-colors shrink-0 cursor-pointer ${
            activeFilter === 'oss'
              ? 'bg-teal-600 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          🟢 Gestibili da OSS (Stadio 1-2)
        </button>
        <button
          onClick={() => setActiveFilter('nurse')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-colors shrink-0 cursor-pointer ${
            activeFilter === 'nurse'
              ? 'bg-rose-600 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          ⚠️ Segnalate a Infermiere / Medico
        </button>
      </div>

      {/* TABELLA STORICO MEDICAZIONI */}
      <div className="bg-white rounded-3xl border border-[#E1E4E8] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E1E4E8] flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              Diario Medicazioni & Monitoraggio Cute
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Storico controlli cute, prodotti applicati (Connettivina, Ossido di Zinco, ecc.) e data prossimo cambio
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-medium">Caricamento in corso...</div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm font-bold text-slate-700">Nessuna registrazione per questo filtro</p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => handleOpenNew('arrossamento_cute_integra', 'stadio_1_eritema')}
                className="px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold cursor-pointer"
              >
                + Registra Arrossamento
              </button>
              <button
                onClick={() => handleOpenNew('flittene_vescicola', 'stadio_2_flittene')}
                className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold cursor-pointer"
              >
                + Registra Medicazione
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E1E4E8] text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Data & Ora</th>
                  <th className="py-3.5 px-4">Sede & Tipologia</th>
                  <th className="py-3.5 px-4">Stadio & Livello Competenza</th>
                  <th className="py-3.5 px-4">Medicazione / Prodotto Applicato</th>
                  <th className="py-3.5 px-4">Detersione & Note OSS</th>
                  <th className="py-3.5 px-4">Prossimo Cambio</th>
                  <th className="py-3.5 px-4">Operatore</th>
                  <th className="py-3.5 px-4 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((rec) => {
                  const recDate = new Date(rec.recorded_at);
                  const isSevere =
                    rec.stage === 'stadio_3_sottocutaneo' ||
                    rec.stage === 'stadio_4_muscolo_osso' ||
                    rec.stage === 'non_stadiabile_escara';

                  const isArrossamento =
                    rec.wound_type === 'arrossamento_cute_integra' ||
                    rec.wound_type === 'arrossamento_macerazione_pannolone' ||
                    rec.wound_type === 'arrossamento_sfregamento_pieghe' ||
                    rec.stage === 'stadio_0_arrossamento_sbiancabile' ||
                    rec.stage === 'stadio_1_eritema';

                  return (
                    <tr
                      key={rec.id}
                      className={`hover:bg-[#F5F7F9]/80 transition-colors ${
                        isSevere ? 'bg-rose-50/30' : isArrossamento ? 'bg-amber-50/20' : ''
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
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 block">
                            {rec.custom_site_desc || rec.anatomical_site.replace('_', ' ').toUpperCase()}
                          </span>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                              isArrossamento
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {rec.wound_type === 'arrossamento_cute_integra'
                              ? 'Arrossamento (Cute integra)'
                              : rec.wound_type === 'arrossamento_macerazione_pannolone'
                              ? 'Macerazione da Pannolone'
                              : rec.wound_type === 'arrossamento_sfregamento_pieghe'
                              ? 'Sfregamento Pieghe'
                              : rec.wound_type === 'flittene_vescicola'
                              ? 'Flittene / Vescicola'
                              : rec.wound_type === 'abrasione_escoriazione'
                              ? 'Abrasione superficiale'
                              : rec.wound_type.replace('_', ' ')}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              isSevere
                                ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                : rec.stage === 'stadio_2_flittene'
                                ? 'bg-indigo-100 text-indigo-900'
                                : 'bg-teal-100 text-teal-900'
                            }`}
                          >
                            {rec.stage === 'stadio_0_arrossamento_sbiancabile'
                              ? 'Stadio 0: Arrossamento sbiancabile'
                              : rec.stage === 'stadio_1_eritema'
                              ? 'Stadio 1: Eritema cute integra'
                              : rec.stage === 'stadio_2_flittene'
                              ? 'Stadio 2: Flittene / Derma'
                              : rec.stage === 'stadio_3_sottocutaneo'
                              ? 'Stadio 3: Sottocute (Infermiere)'
                              : rec.stage === 'stadio_4_muscolo_osso'
                              ? 'Stadio 4: Muscolo/Osso (Infermiere)'
                              : rec.stage === 'non_stadiabile_escara'
                              ? 'Non Stadiabile: Escara (Infermiere)'
                              : rec.stage.replace('_', ' ')}
                          </span>

                          <div className="text-[10px] font-semibold">
                            {isSevere ? (
                              <span className="text-rose-700 flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3" /> Segnalare a Infermiere
                              </span>
                            ) : (
                              <span className="text-emerald-700 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> Autonomia OSS
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-800 max-w-xs">
                        <div className="font-bold text-[11px] text-teal-950">
                          {rec.dressing_applied}
                        </div>
                        {rec.secondary_dressing && (
                          <div className="text-[10px] text-slate-500">
                            Fissaggio: {rec.secondary_dressing}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 max-w-xs">
                        <div className="text-[10px] text-slate-500 font-semibold">
                          Detersione: {rec.cleansing_solution === 'fisiologica_09' ? 'Fisiologica 0.9%' : rec.cleansing_solution === 'detergente_lenitivo_ph_neutro' ? 'Detergente pH neutro' : rec.cleansing_solution}
                        </div>
                        {rec.notes && (
                          <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                            {rec.notes}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                        {rec.next_dressing_date ? (
                          <span className="inline-flex items-center gap-1 font-bold text-teal-800 bg-teal-50 px-2 py-1 rounded-xl">
                            <Calendar className="w-3 h-3 text-teal-600" />
                            {new Date(rec.next_dressing_date).toLocaleDateString('it-IT')}
                          </span>
                        ) : (
                          '—'
                        )}
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

      {/* MODALE INSERIMENTO / MODIFICA MEDICAZIONE CON SUGGERITORE OSS INTELLIGENTE */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-[#E1E4E8]">
            {/* Header Modale */}
            <div className="p-4 sm:p-5 border-b border-[#E1E4E8] flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingRecord ? 'Modifica Registrazione Cute' : 'Nuova Medicazione / Arrossamento'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Compilazione guidata per Operatore Socio Sanitario (OSS)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* 1. SELEZIONE TIPO & STADIO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Cosa hai riscontrato sulla cute?
                  </label>
                  <select
                    value={woundType}
                    onChange={(e) => {
                      const newType = e.target.value as WoundType;
                      setWoundType(newType);
                      // Auto-adjust stage accordingly
                      if (newType === 'arrossamento_cute_integra') setStage('stadio_1_eritema');
                      else if (newType === 'arrossamento_macerazione_pannolone') setStage('stadio_0_arrossamento_sbiancabile');
                      else if (newType === 'flittene_vescicola') setStage('stadio_2_flittene');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                  >
                    <optgroup label="Arrossamenti & Macerazioni (Competenza OSS)">
                      <option value="arrossamento_cute_integra">🧴 Arrossamento / Eritema da pressione (Cute integra)</option>
                      <option value="arrossamento_macerazione_pannolone">💧 Macerazione / Dermatite da pannolone</option>
                      <option value="arrossamento_sfregamento_pieghe">🔴 Arrossamento da sfregamento / Pieghe cutanee</option>
                    </optgroup>
                    <optgroup label="Lesioni e Vescicole (Competenza OSS - 2° Stadio)">
                      <option value="flittene_vescicola">🩹 Flittene / Vescicola (integra o sbrigliata)</option>
                      <option value="abrasione_escoriazione">✂️ Abrasione / Taglietto superficiale</option>
                      <option value="ldd_decubito">Lesione da Decubito (LDD)</option>
                    </optgroup>
                    <optgroup label="Altre situazioni (Controllo / Segnalazione Infermiere)">
                      <option value="ferita_chirurgica">Ferita Chirurgica (Controllo ispettivo)</option>
                      <option value="ulcera_vascolare">Ulcera Vascolare</option>
                      <option value="ustione">Ustione lieve</option>
                      <option value="altro">Altro</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Stadiazione della Lesione
                  </label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as WoundStage)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                  >
                    <optgroup label="Competenza OSS">
                      <option value="stadio_0_arrossamento_sbiancabile">
                        Stadio 0: Arrossamento iniziale sbiancabile al tocco
                      </option>
                      <option value="stadio_1_eritema">
                        Stadio 1: Eritema fisso NON sbiancabile (Cute integra)
                      </option>
                      <option value="stadio_2_flittene">
                        Stadio 2: Flittene / Vescicola / Lesione derma superficiale
                      </option>
                      <option value="in_guarigione_epitelizzazione">
                        In Guarigione / Epitelizzazione avanzata
                      </option>
                    </optgroup>
                    <optgroup label="⚠️ Oltre i limiti OSS (Competenza Infermieristica / Medico)">
                      <option value="stadio_3_sottocutaneo">
                        ⚠️ Stadio 3: Perdita spessore totale (Sottocute visibile)
                      </option>
                      <option value="stadio_4_muscolo_osso">
                        ⚠️ Stadio 4: Danno profondo a muscolo o osso
                      </option>
                      <option value="non_stadiabile_escara">
                        ⚠️ Non Stadiabile: Coperta da escara nera o slough spesso
                      </option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* 💡 BOX SMART ADVISOR OSS (SUGGERIMENTO AUTOMATICO DI CURA IN TEMPO REALE) */}
              <div
                className={`p-4 rounded-2xl border ${currentSuggestion.competenceBadge.bgClass} ${currentSuggestion.competenceBadge.borderClass} space-y-3`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-700" />
                    <span className="font-bold text-slate-900 text-xs">
                      Suggerimento Pratico & Protocollo per OSS:
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${currentSuggestion.competenceBadge.bgClass} ${currentSuggestion.competenceBadge.textClass} ${currentSuggestion.competenceBadge.borderClass}`}
                  >
                    {currentSuggestion.competenceBadge.label}
                  </span>
                </div>

                <div className="bg-white/80 p-3 rounded-xl border border-slate-200/70 space-y-2 text-[11px]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="font-bold text-slate-700 block text-[10px] uppercase">
                        Detersione consigliata:
                      </span>
                      <span className="text-slate-900 font-medium">
                        {currentSuggestion.cleansingSolution === 'fisiologica_09'
                          ? 'Soluzione Fisiologica 0.9% sterile a tampone'
                          : currentSuggestion.cleansingSolution === 'detergente_lenitivo_ph_neutro'
                          ? 'Acqua tiepida e detergente intimo pH neutro'
                          : currentSuggestion.cleansingSolution}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block text-[10px] uppercase">
                        Prodotto / Medicazione consigliata:
                      </span>
                      <span className="text-teal-900 font-bold">
                        {currentSuggestion.dressingApplied}
                      </span>
                    </div>
                  </div>

                  {/* Do & Don't per OSS */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="font-bold text-emerald-800 block text-[10px]">
                        ✓ COSA FARE (OSS):
                      </span>
                      <ul className="list-disc list-inside text-slate-600 text-[10px] space-y-0.5">
                        {currentSuggestion.instructions.dos.slice(0, 2).map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-bold text-rose-800 block text-[10px]">
                        ✗ COSA NON FARE:
                      </span>
                      <ul className="list-disc list-inside text-slate-600 text-[10px] space-y-0.5">
                        {currentSuggestion.instructions.donts.slice(0, 2).map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Pulsante Magico Applica Suggerimento */}
                <button
                  type="button"
                  onClick={handleApplySuggestion}
                  className="w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Applica Questo Protocollo Consigliato nel Modulo
                </button>
              </div>

              {/* 2. SEDE ANATOMICA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sede Anatomica</label>
                  <select
                    value={anatomicalSite}
                    onChange={(e) => {
                      setAnatomicalSite(e.target.value as WoundAnatomicalSite);
                      if (!customSiteDesc) {
                        setCustomSiteDesc(e.target.value.replace('_', ' '));
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                  >
                    <option value="sacro">Regione Sacrale (Sacro)</option>
                    <option value="tallone_dx">Tallone Destro</option>
                    <option value="tallone_sx">Tallone Sinistro</option>
                    <option value="pieghe_inguinali">Pieghe Inguinali / Perineo</option>
                    <option value="pieghe_sottomammarie">Pieghe Sottomammarie</option>
                    <option value="gluteo">Gluteo</option>
                    <option value="ischio">Regione Ischiatica (Ischio)</option>
                    <option value="trocantere_dx">Trocantere Destro</option>
                    <option value="trocantere_sx">Trocantere Sinistro</option>
                    <option value="malleolo">Malleolo</option>
                    <option value="dorso_scapola">Dorso / Scapola</option>
                    <option value="gomito">Gomito</option>
                    <option value="occipite">Occipite (Nuca)</option>
                    <option value="addome">Addome</option>
                    <option value="arto_inferiore">Arto Inferiore / Gamba</option>
                    <option value="arto_superiore">Arto Superiore / Braccio</option>
                    <option value="altro">Altra sede</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Dettaglio Sede (opzionale)
                  </label>
                  <input
                    type="text"
                    value={customSiteDesc}
                    onChange={(e) => setCustomSiteDesc(e.target.value)}
                    placeholder="Es. Sacro centrale, piega inguinale destra..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* 3. PRODOTTO / MEDICAZIONE APPLICATA & DETERSIONE */}
              <div className="space-y-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Soluzione di Detersione usata
                    </label>
                    <select
                      value={cleansingSolution}
                      onChange={(e) => setCleansingSolution(e.target.value as WoundCleansingSolution)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="fisiologica_09">Soluzione Fisiologica 0.9% sterile (A tampone)</option>
                      <option value="detergente_lenitivo_ph_neutro">Acqua tiepida + Detergente intimo a pH neutro</option>
                      <option value="acqua_sterile">Acqua Sterile</option>
                      <option value="clorexidina_acquosa">Clorexidina acquosa (Disinfezione)</option>
                      <option value="ringer_lattato">Ringer Lattato</option>
                      <option value="iodopovidone">Iodopovidone (Betadine)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Azione Eseguita dall'OSS
                    </label>
                    <select
                      value={performedAction}
                      onChange={(e) => setPerformedAction(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="medicazione_completa">Medicazione semplice completata (Connettivina/garze)</option>
                      <option value="applicazione_crema_barriera">Applicazione pasta barriera / crema idratante</option>
                      <option value="controllo_ispettivo">Solo controllo ispettivo cute</option>
                      <option value="cambio_fissaggio">Sostituzione cerotto / rete tubolare</option>
                      <option value="segnalazione_infermiere">⚠️ Segnalato a Infermiere ADI / Medico</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Medicazione / Prodotto Applicato
                  </label>
                  <input
                    type="text"
                    required
                    value={dressingApplied}
                    onChange={(e) => setDressingApplied(e.target.value)}
                    placeholder="Es. Garze Connettivina sterili (Acido Ialuronico), Pasta all'Ossido di Zinco, Idrocolloide..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Copertura secondaria / Fissaggio
                    </label>
                    <input
                      type="text"
                      value={secondaryDressing}
                      onChange={(e) => setSecondaryDressing(e.target.value)}
                      placeholder="Es. Garza sterile in TNT + cerotto di carta / rete elastica"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Frequenza Cambio & Prossimo Rinnovo
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={dressingFrequency}
                        onChange={(e) => setDressingFrequency(e.target.value as DressingFrequency)}
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-white text-[11px]"
                      >
                        <option value="giorni_alterni">A Giorni Alterni (48h)</option>
                        <option value="giornaliera">Giornaliera (24h)</option>
                        <option value="ad_ogni_cambio_pannolone">Ad ogni cambio pannolone</option>
                        <option value="ogni_3_giorni">Ogni 3 Giorni</option>
                        <option value="settimanale">Settimanale</option>
                        <option value="al_bisogno">Al bisogno</option>
                      </select>
                      <input
                        type="date"
                        value={nextDressingDate}
                        onChange={(e) => setNextDressingDate(e.target.value)}
                        className="w-full px-2 py-2 rounded-xl border border-slate-200 bg-white text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. PULSANTI RAPIDI PER LE NOTE OSS */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">
                  Frasi Rapide per Note OSS (clicca per inserire):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {OSS_QUICK_SNIPPETS.map((snippet, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplySnippet(snippet)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-900 border border-slate-200 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer text-left"
                    >
                      {snippet.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. NOTE ASSISTENZIALI */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Note Assistenziali & Consegne di Turno
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Es. Eseguita detersione delicata a tampone con fisiologica, applicate garze connettivina con garza sterile di copertura. Posizionato cuscino di scarico tallone..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                />
              </div>

              {/* Data & Ora Registrazione */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data Esecuzione</label>
                  <input
                    type="date"
                    required
                    value={recordedDate}
                    onChange={(e) => setRecordedDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ora</label>
                  <input
                    type="time"
                    required
                    value={recordedTime}
                    onChange={(e) => setRecordedTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer transition-all shadow-xs"
                >
                  {saving ? 'Salvataggio...' : 'Salva Registrazione Cute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
