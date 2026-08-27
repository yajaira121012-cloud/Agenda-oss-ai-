import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  Clock,
  Printer,
  Info,
  Sparkles,
  Filter,
  Edit2,
  AlertCircle,
  FileText,
  Syringe,
  Check,
  CalendarDays,
  List,
} from 'lucide-react';
import {
  BowelRecord,
  BristolType,
  BowelAmount,
  BowelColor,
  BowelIntervention,
  AbdominalState,
  DiuresisStatus,
} from '../../../types';
import {
  getBowelRecordsByPatient,
  createBowelRecord,
  updateBowelRecord,
  deleteBowelRecord,
} from '../../../services/bowelService';
import { useAuth } from '../../../context/AuthContext';
import { resetAppScroll } from '../../../lib/scrollUtils';

interface TabAlvoProps {
  patientId: string;
}

// Descrizioni e metadati della Scala di Bristol
export const BRISTOL_SCALE_INFO: Record<
  BristolType,
  {
    title: string;
    description: string;
    clinicalMeaning: string;
    tag: 'Stipsi Severa' | 'Stipsi Lieve' | 'Normale' | 'Ideale' | 'Scarse Fibre' | 'Tendenza Diarrea' | 'Diarrea Severa';
    colorClass: string;
    bgClass: string;
    borderClass: string;
  }
> = {
  1: {
    title: 'Tipo 1 - Palline dure / Nocciole',
    description: 'Pezzi duri e separati, feci caprine. Difficili da espellere.',
    clinicalMeaning: 'Stipsi severa',
    tag: 'Stipsi Severa',
    colorClass: 'text-amber-900',
    bgClass: 'bg-amber-100',
    borderClass: 'border-amber-400',
  },
  2: {
    title: 'Tipo 2 - Salsiccia grumosa',
    description: 'A forma di salsiccia ma formata da molti grumi uniti.',
    clinicalMeaning: 'Stipsi lieve',
    tag: 'Stipsi Lieve',
    colorClass: 'text-amber-800',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-300',
  },
  3: {
    title: 'Tipo 3 - Cilindrica con crepe',
    description: 'Come un salame o salsiccia con crepe superficiali.',
    clinicalMeaning: 'Normale / Fisiologico',
    tag: 'Normale',
    colorClass: 'text-emerald-800',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-300',
  },
  4: {
    title: 'Tipo 4 - Liscia e morbida (Ideale)',
    description: 'Come un serpente o salsiccia, morbida e liscia.',
    clinicalMeaning: 'Ottimale / Ideale',
    tag: 'Ideale',
    colorClass: 'text-teal-800',
    bgClass: 'bg-teal-50',
    borderClass: 'border-teal-300',
  },
  5: {
    title: 'Tipo 5 - Pezzi morbidi con bordi netti',
    description: 'Pezzi morbidi separati con bordi netti, facili da espellere.',
    clinicalMeaning: 'Mancanza fibre',
    tag: 'Scarse Fibre',
    colorClass: 'text-blue-800',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-300',
  },
  6: {
    title: 'Tipo 6 - Pezzi soffici / Pastose',
    description: 'Pezzi soffici frastagliati, feci pastose o semiliquide.',
    clinicalMeaning: 'Lieve diarrea / infiammazione',
    tag: 'Tendenza Diarrea',
    colorClass: 'text-orange-800',
    bgClass: 'bg-orange-50',
    borderClass: 'border-orange-300',
  },
  7: {
    title: 'Tipo 7 - Feci acquose / Liquide',
    description: 'Completamente acquosa senza parti solide.',
    clinicalMeaning: 'Diarrea severa / rischio disidratazione',
    tag: 'Diarrea Severa',
    colorClass: 'text-rose-800',
    bgClass: 'bg-rose-50',
    borderClass: 'border-rose-300',
  },
};

const MONTH_NAMES = [
  'Gennaio',
  'Febbraio',
  'Marzo',
  'Aprile',
  'Maggio',
  'Giugno',
  'Luglio',
  'Agosto',
  'Settembre',
  'Ottobre',
  'Novembre',
  'Dicembre',
];

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

export function TabAlvo({ patientId }: TabAlvoProps) {
  const { user, profile } = useAuth();
  const [records, setRecords] = useState<BowelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'calendar' | 'table'>('calendar');
  const [showBristolGuide, setShowBristolGuide] = useState(false);

  // Month navigation state
  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BowelRecord | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields - Semplificato: SCARICA NORMALE vs ASSENTE + Clistere
  const [recordDate, setRecordDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [recordTime, setRecordTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [evacuated, setEvacuated] = useState<boolean>(true); // true = Scarica Normale/Presente, false = Assente
  const [intervention, setIntervention] = useState<BowelIntervention>('spontanea');
  const [amount, setAmount] = useState<BowelAmount>('normale');
  const [bristolType, setBristolType] = useState<BristolType | null>(4);
  const [abdominalState, setAbdominalState] = useState<AbdominalState>('trattabile_morbido');
  const [color, setColor] = useState<BowelColor>('marrone_normale');
  const [notes, setNotes] = useState('');
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);

  const loadRecords = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data, error } = await getBowelRecordsByPatient(patientId);
      if (error) {
        setErrorMessage(error);
      } else {
        setRecords(data || []);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Errore nel recupero del registro albo scariche');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [patientId]);

  // Calendar Calculation Helper: map of "YYYY-MM-DD" -> BowelRecord[]
  const recordsByDate = useMemo(() => {
    const map: Record<string, BowelRecord[]> = {};
    for (const rec of records) {
      const dateStr = rec.recorded_at.slice(0, 10);
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(rec);
    }
    return map;
  }, [records]);

  // Consecutive days calculation from today backwards
  const consecutiveDaysStatus = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let consecutiveNoEvacuationDays = 0;
    let foundEvacuation = false;
    let lastEvacDateStr: string | null = null;
    let lastEvacRecord: BowelRecord | null = null;

    // Check last 14 days
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().slice(0, 10);
      const dayRecs = recordsByDate[dStr] || [];
      const hadEvacuation = dayRecs.some((r) => r.evacuated);

      if (hadEvacuation) {
        if (!foundEvacuation) {
          lastEvacDateStr = dStr;
          lastEvacRecord = dayRecs.find((r) => r.evacuated) || null;
        }
        foundEvacuation = true;
        break;
      } else {
        // If we haven't found any evacuation yet, increment no-evacuation streak
        consecutiveNoEvacuationDays++;
      }
    }

    return {
      daysWithoutEvacuation: foundEvacuation ? consecutiveNoEvacuationDays : consecutiveNoEvacuationDays,
      lastEvacDateStr,
      lastEvacRecord,
      is3rdDay: consecutiveNoEvacuationDays === 3,
      is4thDayOrMore: consecutiveNoEvacuationDays >= 4,
    };
  }, [recordsByDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  // Quick Open Modal on a specific day
  const handleDayClick = (dateStr: string, defaultEvacuated: boolean = true) => {
    const existingRecs = recordsByDate[dateStr];
    if (existingRecs && existingRecs.length > 0) {
      // Edit latest record for that day
      handleOpenEdit(existingRecs[0]);
    } else {
      // Create new record for that day
      setEditingRecord(null);
      setRecordDate(dateStr);
      setRecordTime(new Date().toTimeString().slice(0, 5));
      setEvacuated(defaultEvacuated);
      setIntervention('spontanea');
      setAmount(defaultEvacuated ? 'normale' : 'non_valutabile');
      setBristolType(defaultEvacuated ? 4 : null);
      setAbdominalState(defaultEvacuated ? 'trattabile_morbido' : 'teso_globoso');
      setColor('marrone_normale');
      setNotes(defaultEvacuated ? '' : 'Alvo chiuso / Nessuna evacuazione nella giornata.');
      setShowAdvancedDetails(false);
      setModalOpen(true);
    }
  };

  // Quick Direct 1-Click Action from Calendar (without modal if simple)
  const handleQuickLog = async (
    dateStr: string,
    isEvac: boolean,
    useClisma: boolean = false,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    const operatorName =
      profile?.full_name || profile?.qualification || user?.email?.split('@')[0] || 'Operatore OSS';
    const nowTime = new Date().toTimeString().slice(0, 5);
    const combinedDate = new Date(`${dateStr}T${nowTime}:00`);

    const payload = {
      patient_id: patientId,
      recorded_at: combinedDate.toISOString(),
      evacuated: isEvac,
      bristol_type: isEvac ? ((useClisma ? 2 : 4) as BristolType) : null,
      amount: (isEvac ? 'normale' : 'non_valutabile') as BowelAmount,
      consistency_desc: isEvac
        ? useClisma
          ? 'Evacuazione con Clistere'
          : 'Scarica Normale'
        : 'Assente / Alvo Chiuso',
      intervention: (useClisma ? 'clisma' : isEvac ? 'spontanea' : 'spontanea') as BowelIntervention,
      abdominal_state: (isEvac ? 'trattabile_morbido' : 'teso_globoso') as AbdominalState,
      color: (isEvac ? 'marrone_normale' : undefined) as BowelColor | undefined,
      notes: useClisma
        ? 'Somministrato clistere evacuativo per 4ª giornata di alvo chiuso. Scarica ottenuta con successo.'
        : !isEvac
        ? 'Alvo chiuso / Assente durante il turno.'
        : 'Scarica fisiologica normale.',
      operator_name: operatorName,
      recorded_by: user?.email || operatorName,
    };

    try {
      const { data, error } = await createBowelRecord(payload);
      if (error) throw new Error(error);
      if (data) {
        setRecords((prev) => [data, ...prev]);
      }
    } catch (err: any) {
      alert('Errore salvataggio rapido: ' + err.message);
    }
  };

  const handleOpenEdit = (rec: BowelRecord) => {
    const recDate = new Date(rec.recorded_at);
    setEditingRecord(rec);
    setRecordDate(rec.recorded_at.slice(0, 10));
    setRecordTime(recDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }));
    setEvacuated(rec.evacuated);
    setBristolType(rec.bristol_type || null);
    setAmount(rec.amount || (rec.evacuated ? 'normale' : 'non_valutabile'));
    setColor(rec.color || 'marrone_normale');
    setIntervention(rec.intervention || 'spontanea');
    setAbdominalState(rec.abdominal_state || 'trattabile_morbido');
    setNotes(rec.notes || '');
    setShowAdvancedDetails(
      !!rec.color && rec.color !== 'marrone_normale' || (rec.bristol_type !== 4 && !!rec.bristol_type)
    );
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    const operatorName =
      profile?.full_name || profile?.qualification || user?.email?.split('@')[0] || 'Operatore OSS';
    const combinedDate = new Date(`${recordDate}T${recordTime}:00`);
    const isoString = combinedDate.toISOString();

    const consistencyDesc = evacuated
      ? intervention === 'clisma' || intervention === 'microclisma'
        ? `Evacuazione con ${intervention === 'clisma' ? 'Clistere' : 'Microclisma'}`
        : bristolType
        ? BRISTOL_SCALE_INFO[bristolType].title
        : 'Scarica Normale'
      : 'Assente / Alvo Chiuso';

    const payload = {
      patient_id: patientId,
      recorded_at: isoString,
      evacuated,
      bristol_type: evacuated ? bristolType || 4 : null,
      amount: evacuated ? amount : 'non_valutabile',
      consistency_desc: consistencyDesc,
      color: evacuated ? color : undefined,
      intervention: evacuated ? intervention : undefined,
      abdominal_state: abdominalState,
      diuresis: 'presente_fisiologica' as DiuresisStatus,
      notes: notes.trim() || undefined,
      operator_name: operatorName,
      recorded_by: user?.email || operatorName,
    };

    try {
      if (editingRecord) {
        const { data, error } = await updateBowelRecord(editingRecord.id, payload);
        if (error) throw new Error(error);
        if (data) {
          setRecords((prev) => prev.map((r) => (r.id === data.id ? data : r)));
        }
      } else {
        const { data, error } = await createBowelRecord(payload);
        if (error) throw new Error(error);
        if (data) {
          setRecords((prev) => [data, ...prev]);
        }
      }
      setModalOpen(false);
      resetAppScroll();
    } catch (err: any) {
      setErrorMessage(err.message || 'Errore nel salvataggio della registrazione');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Sei sicuro di voler eliminare questa annotazione dall\'albo delle scariche?')) return;
    try {
      const { success, error } = await deleteBowelRecord(id);
      if (error) throw new Error(error);
      if (success) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
        if (editingRecord?.id === id) setModalOpen(false);
      }
    } catch (err: any) {
      alert('Errore eliminazione: ' + err.message);
    }
  };

  // Calendar Grid builder
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

  const calendarDays = useMemo(() => {
    const days = [];
    const prevMonthDays = new Date(year, month, 0).getDate();

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevDate = new Date(year, month - 1, d);
      const dateStr = prevDate.toISOString().slice(0, 10);
      days.push({
        date: prevDate,
        dateStr,
        dayNumber: d,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const cur = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        date: cur,
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
      });
    }

    // Next month filler days (fill up to 35 or 42)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      const dateStr = nextDate.toISOString().slice(0, 10);
      days.push({
        date: nextDate,
        dateStr,
        dayNumber: i,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month, daysInMonth, firstDayIndex]);

  const todayStr = new Date().toISOString().slice(0, 10);

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

      {/* BANNER CLINICO INTELLIGENTE PER PROTOCOLLO CLISTERE (3ª e 4ª GIORNATA) */}
      {consecutiveDaysStatus.daysWithoutEvacuation >= 3 && (
        <div
          className={`p-5 rounded-3xl border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
            consecutiveDaysStatus.daysWithoutEvacuation >= 4
              ? 'bg-rose-50 border-rose-300 text-rose-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shrink-0 ${
                consecutiveDaysStatus.daysWithoutEvacuation >= 4
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-amber-500 text-white shadow-xs'
              }`}
            >
              <Syringe className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    consecutiveDaysStatus.daysWithoutEvacuation >= 4
                      ? 'bg-rose-200 text-rose-900 border border-rose-300'
                      : 'bg-amber-200 text-amber-900 border border-amber-300'
                  }`}
                >
                  {consecutiveDaysStatus.daysWithoutEvacuation >= 4
                    ? `🚨 4ª GIORNATA ASSENTE — PROCEDERE CON CLISTERE`
                    : `⚠️ NOTIFICA 3ª GIORNATA SENZA SCARICA`}
                </span>
                <span className="text-xs font-semibold opacity-75">Protocollo Alvo OSS / ADI</span>
              </div>
              <h3 className="text-base font-bold mt-1 text-slate-900">
                {consecutiveDaysStatus.daysWithoutEvacuation >= 4
                  ? `L'assistito non si scarica da ${consecutiveDaysStatus.daysWithoutEvacuation} giorni consecutivi!`
                  : `Attenzione: Terza giornata di alvo chiuso / scarica assente.`}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
                {consecutiveDaysStatus.daysWithoutEvacuation >= 4
                  ? `È trascorso il limite di sicurezza. Come da protocollo assistenziale per la 4ª giornata di alvo chiuso, è il momento di eseguire il clistere/microclisma evacuativo autorizzato dal medico/infermiere.`
                  : `Se l'alvo resterà chiuso anche per la 4ª giornata consecutiva, scatterà l'obbligo di intervento con clistere o microclisma. Verificare l'idratazione e la palpazione dell'addome.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
            <button
              onClick={() => handleQuickLog(todayStr, true, true)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-2 ${
                consecutiveDaysStatus.daysWithoutEvacuation >= 4
                  ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-200'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              <Syringe className="w-4 h-4" />
              Esegui & Registra Clistere Oggi
            </button>
            <button
              onClick={() => handleDayClick(todayStr, true)}
              className="px-4 py-2.5 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 text-emerald-600" />
              Scarica Normale
            </button>
          </div>
        </div>
      )}

      {/* BARRA SUPERIORE CONTROLLI & NAVIGAZIONE MESE */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E1E4E8] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Sinistra: Navigatore Mese Calendario */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
              title="Mese Precedente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleCurrentMonth}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-white transition-all cursor-pointer"
            >
              Oggi
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
              title="Mese Successivo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-lg font-black text-[#1A1C1E] tracking-tight">
            {MONTH_NAMES[month]} {year}
          </h2>
        </div>

        {/* Destra: Switch Vista (Calendario / Elenco) & Pulsanti Rapidi */}
        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto justify-end">
          {/* Switch Vista */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setActiveView('calendar')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                activeView === 'calendar'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Mappa / Calendario
            </button>
            <button
              onClick={() => setActiveView('table')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                activeView === 'table'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Elenco Storico
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            title="Stampa Calendario Albo Scariche"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleDayClick(todayStr, true)}
            className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Compila Albo
          </button>
        </div>
      </div>

      {/* LEGENDA RAPIDA & SEMPLICE */}
      <div className="bg-white px-5 py-3 rounded-2xl border border-[#E1E4E8] flex items-center justify-between flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
            Legenda Calendario:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-700">🟢 Scarica Normale (Evacuato)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="font-semibold text-slate-700">⚪/🟡 Assente (Alvo Chiuso)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-teal-600" />
            <span className="font-semibold text-slate-700">💉 Clistere / Microclisma</span>
          </div>
        </div>

        <button
          onClick={() => setShowBristolGuide(!showBristolGuide)}
          className="text-teal-700 font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer"
        >
          <Info className="w-3.5 h-3.5" />
          {showBristolGuide ? 'Chiudi Guida Bristol' : 'Mostra Scala di Bristol (Tipi 1-7)'}
        </button>
      </div>

      {/* GUIDA BRISTOL A SCOMPARSA */}
      {showBristolGuide && (
        <div className="bg-white p-5 rounded-3xl border border-teal-200 shadow-sm transition-all space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                7
              </span>
              <h3 className="font-bold text-slate-900 text-xs">
                Scala delle Feci di Bristol (Guida Rapida)
              </h3>
            </div>
            <button
              onClick={() => setShowBristolGuide(false)}
              className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
            {([1, 2, 3, 4, 5, 6, 7] as BristolType[]).map((typeNum) => {
              const info = BRISTOL_SCALE_INFO[typeNum];
              return (
                <div
                  key={typeNum}
                  className={`p-2.5 rounded-xl border ${info.bgClass} ${info.borderClass} flex flex-col justify-between text-[11px]`}
                >
                  <div>
                    <span className="font-black text-slate-900 block">Tipo {typeNum}</span>
                    <span className={`text-[10px] font-bold ${info.colorClass}`}>{info.tag}</span>
                    <p className="text-slate-600 mt-1 line-clamp-2 leading-snug">{info.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VISTA 1: CALENDARIO / MAPPA MENSILE DELL'ALBO */}
      {activeView === 'calendar' && (
        <div className="bg-white rounded-3xl border border-[#E1E4E8] shadow-xs overflow-hidden">
          {/* Header Giorni della Settimana */}
          <div className="grid grid-cols-7 border-b border-[#E1E4E8] bg-slate-50 text-center text-xs font-bold text-slate-500 uppercase tracking-wider py-3">
            {DAYS_OF_WEEK.map((d, i) => (
              <div key={d} className={i >= 5 ? 'text-teal-700' : ''}>
                {d}
              </div>
            ))}
          </div>

          {/* Griglia Giorni */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
            {calendarDays.map((dayItem) => {
              const dayRecs = recordsByDate[dayItem.dateStr] || [];
              const hasEvac = dayRecs.some((r) => r.evacuated);
              const hasNoEvac = dayRecs.some((r) => !r.evacuated);
              const hasClisma = dayRecs.some(
                (r) => r.intervention === 'clisma' || r.intervention === 'microclisma'
              );
              const isToday = dayItem.dateStr === todayStr;

              // Determina stile di sfondo del giorno
              let cardBg = dayItem.isCurrentMonth ? 'bg-white' : 'bg-slate-50/50';
              let badgeStatus = null;

              if (dayRecs.length > 0) {
                if (hasClisma) {
                  badgeStatus = {
                    label: 'Clistere Eseguito',
                    bg: 'bg-teal-100 text-teal-900 border-teal-300',
                    icon: Syringe,
                  };
                  cardBg = 'bg-teal-50/40';
                } else if (hasEvac) {
                  badgeStatus = {
                    label: 'Scarica Normale',
                    bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                    icon: CheckCircle2,
                  };
                  cardBg = 'bg-emerald-50/20';
                } else if (hasNoEvac) {
                  badgeStatus = {
                    label: 'Assente (Chiuso)',
                    bg: 'bg-amber-100 text-amber-900 border-amber-300',
                    icon: AlertCircle,
                  };
                  cardBg = 'bg-amber-50/30';
                }
              }

              return (
                <div
                  key={dayItem.dateStr}
                  onClick={() => handleDayClick(dayItem.dateStr, true)}
                  className={`min-h-[105px] p-2.5 sm:p-3 flex flex-col justify-between transition-all cursor-pointer hover:bg-slate-100/80 relative group ${cardBg} ${
                    !dayItem.isCurrentMonth ? 'opacity-40' : ''
                  }`}
                >
                  {/* Top: Numero Giorno & Indicatore Oggi */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-lg ${
                        isToday
                          ? 'bg-teal-600 text-white font-black shadow-xs'
                          : 'text-slate-700'
                      }`}
                    >
                      {dayItem.dayNumber}
                    </span>

                    {/* Quick Add buttons on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <button
                        onClick={(e) => handleQuickLog(dayItem.dateStr, true, false, e)}
                        title="Segna Scarica Normale"
                        className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center text-[10px] hover:scale-110"
                      >
                        ✓
                      </button>
                      <button
                        onClick={(e) => handleQuickLog(dayItem.dateStr, false, false, e)}
                        title="Segna Assente (Alvo Chiuso)"
                        className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center text-[10px] hover:scale-110"
                      >
                        ✗
                      </button>
                    </div>
                  </div>

                  {/* Centro: Stato Scarica del Giorno */}
                  <div className="my-1.5 space-y-1">
                    {badgeStatus ? (
                      <div
                        className={`px-2 py-1 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 shadow-2xs ${badgeStatus.bg}`}
                      >
                        <badgeStatus.icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{badgeStatus.label}</span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-300 italic group-hover:text-slate-500 text-center py-1">
                        + Tocca per scrivere
                      </div>
                    )}

                    {/* Dettaglio compatto se presente */}
                    {dayRecs.length > 0 && dayRecs[0].notes && (
                      <p className="text-[10px] text-slate-500 line-clamp-1 italic px-0.5">
                        {dayRecs[0].notes}
                      </p>
                    )}
                  </div>

                  {/* Footer: Numero rilevazioni se > 1 */}
                  {dayRecs.length > 1 && (
                    <div className="text-[9px] font-bold text-slate-400 text-right">
                      {dayRecs.length} registrazioni
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VISTA 2: ELENCO TABELLARE DETTAGLIATO */}
      {activeView === 'table' && (
        <div className="bg-white rounded-3xl border border-[#E1E4E8] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#E1E4E8] flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-base font-bold text-[#1A1C1E] flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                Elenco Cronologico Albo delle Scariche
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Riepilogo delle evacuazioni, clisteri somministrati e note dell'operatore
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs font-medium">
              Caricamento in corso...
            </div>
          ) : records.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <p className="text-sm font-bold text-slate-700">Nessuna annotazione nell'albo</p>
              <button
                onClick={() => handleDayClick(todayStr, true)}
                className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold cursor-pointer"
              >
                + Registra Scarica Ora
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#E1E4E8] text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Data & Ora</th>
                    <th className="py-3.5 px-4">Stato Scarica</th>
                    <th className="py-3.5 px-4">Intervento / Metodo</th>
                    <th className="py-3.5 px-4">Quantità / Bristol</th>
                    <th className="py-3.5 px-4">Note Assistenziali</th>
                    <th className="py-3.5 px-4">Operatore</th>
                    <th className="py-3.5 px-4 text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((rec) => {
                    const recDate = new Date(rec.recorded_at);
                    const isClisma =
                      rec.intervention === 'clisma' || rec.intervention === 'microclisma';

                    return (
                      <tr
                        key={rec.id}
                        className={`hover:bg-[#F5F7F9]/80 transition-colors ${
                          !rec.evacuated ? 'bg-amber-50/30' : isClisma ? 'bg-teal-50/30' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900">
                          {recDate.toLocaleDateString('it-IT', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}{' '}
                          <span className="font-mono text-slate-400 font-normal ml-1">
                            {recDate.toLocaleTimeString('it-IT', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {rec.evacuated ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Scarica Normale
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[11px]">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                              Assente / Alvo Chiuso
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-slate-700 capitalize">
                          {isClisma ? (
                            <span className="inline-flex items-center gap-1 text-teal-800 bg-teal-100 px-2 py-0.5 rounded-lg border border-teal-200">
                              <Syringe className="w-3 h-3 text-teal-700" />
                              {rec.intervention}
                            </span>
                          ) : (
                            rec.intervention?.replace('_', ' ') || 'Spontanea'
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                          {rec.evacuated ? (
                            <span>
                              {rec.amount || 'Normale'}{' '}
                              {rec.bristol_type && `(Bristol T${rec.bristol_type})`}
                            </span>
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
      )}

      {/* MODALE DI SCRITTURA / MODIFICA SEMPLIFICATA SUL CALENDARIO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-[#E1E4E8]">
            {/* Header */}
            <div className="p-5 border-b border-[#E1E4E8] flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingRecord ? 'Modifica Albo Scariche' : 'Annota Scarica nel Calendario'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Giorno:{' '}
                    <strong>
                      {new Date(recordDate).toLocaleDateString('it-IT', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </strong>
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

            {/* Form Body */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* SCELTA PRINCIPALE RAPIDA E CHIARA: SCARICA NORMALE vs ASSENTE */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Esito della Giornata *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEvacuated(true);
                      if (amount === 'non_valutabile') setAmount('normale');
                    }}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                      evacuated
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <span className="font-black text-sm block text-emerald-800">🟢 Scarica Normale</span>
                      <span className="text-[11px] text-slate-500">Evacuazione presente</span>
                    </div>
                    {evacuated && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEvacuated(false);
                      setAmount('non_valutabile');
                      setIntervention('spontanea');
                    }}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                      !evacuated
                        ? 'bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-500/20 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <span className="font-black text-sm block text-amber-800">⚠️ Assente</span>
                      <span className="text-[11px] text-slate-500">Alvo chiuso / No scarica</span>
                    </div>
                    {!evacuated && <AlertCircle className="w-5 h-5 text-amber-600" />}
                  </button>
                </div>
              </div>

              {/* OPZIONE CLISTERE / AUSILIO (Se scarica avvenuta) */}
              {evacuated && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Modalità / Somministrazione Clistere
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'spontanea', label: 'Spontanea / WC', icon: Check },
                      { id: 'clisma', label: 'Clistere (4ª gg)', icon: Syringe },
                      { id: 'microclisma', label: 'Microclisma', icon: Syringe },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setIntervention(item.id as BowelIntervention)}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
                          intervention === item.id
                            ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <item.icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Orario e Data */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Orario</label>
                  <input
                    type="time"
                    required
                    value={recordTime}
                    onChange={(e) => setRecordTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-teal-500"
                  />
                </div>
              </div>

              {/* Note dell'operatore */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Note OSS / Dettagli
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Es. Scarica regolare, addome trattabile..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-teal-500 placeholder:text-slate-400"
                />
              </div>

              {/* Dettagli avanzati opzionali (Scala Bristol, Quantità, Colore) */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdvancedDetails(!showAdvancedDetails)}
                  className="text-xs font-bold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                  {showAdvancedDetails ? 'Nascondi Dettagli Clinici' : '+ Dettagli Clinici (Bristol, Quantità, Addome)'}
                </button>

                {showAdvancedDetails && (
                  <div className="mt-3 p-3.5 bg-slate-50 rounded-2xl space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Quantità</label>
                        <select
                          value={amount}
                          onChange={(e) => setAmount(e.target.value as BowelAmount)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                        >
                          <option value="scarsa">Scarsa (+)</option>
                          <option value="normale">Normale (++)</option>
                          <option value="abbondante">Abbondante (+++)</option>
                          <option value="non_valutabile">Non valutabile</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Addome</label>
                        <select
                          value={abdominalState}
                          onChange={(e) => setAbdominalState(e.target.value as AbdominalState)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                        >
                          <option value="trattabile_morbido">Trattabile / Morbido</option>
                          <option value="teso_globoso">Teso / Globoso</option>
                          <option value="dolente">Dolente</option>
                          <option value="meteorismo">Meteorico</option>
                        </select>
                      </div>
                    </div>

                    {evacuated && (
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Tipo Bristol</label>
                        <div className="flex gap-1">
                          {([1, 2, 3, 4, 5, 6, 7] as BristolType[]).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setBristolType(t)}
                              className={`flex-1 py-1 rounded-md font-bold text-[11px] border cursor-pointer ${
                                bristolType === t
                                  ? 'bg-teal-600 text-white border-teal-600'
                                  : 'bg-white text-slate-700 border-slate-200'
                              }`}
                            >
                              T{t}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                {editingRecord && (
                  <button
                    type="button"
                    onClick={(e) => handleDelete(editingRecord.id, e)}
                    className="p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {saving ? 'Salvataggio...' : 'Salva nel Calendario'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
