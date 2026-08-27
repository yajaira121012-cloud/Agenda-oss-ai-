import React, { useState } from 'react';
import {
  Clock,
  Home,
  CheckCircle2,
  AlertCircle,
  Save,
  Edit2,
  Calendar,
  Sparkles,
  MapPin,
  Phone,
  Shield,
  Heart,
  Droplets,
  Pill,
  Activity,
  Utensils,
  Coffee,
  BedDouble,
  UserCheck,
  Send,
} from 'lucide-react';
import { Patient, DomiciliaryChecklist } from '../../../types';
import { updatePatient } from '../../../services/patientsService';
import { createCareDiaryEntry } from '../../../services/careDiaryService';
import { useAuth } from '../../../context/AuthContext';
import { openGoogleMapsRoute } from '../../../lib/geoUtils';

interface TabDomiciliareProps {
  patient: Patient;
  onPatientUpdated: (updated: Patient) => void;
  onNavigateToDiary?: () => void;
}

const ALL_DAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

export function TabDomiciliare({
  patient,
  onPatientUpdated,
  onNavigateToDiary,
}: TabDomiciliareProps) {
  const { profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Domiciliary Care fields
  const [startTime, setStartTime] = useState(patient.visit_start_time || '07:00');
  const [endTime, setEndTime] = useState(patient.visit_end_time || '09:00');
  const [selectedDays, setSelectedDays] = useState<string[]>(
    patient.visit_days || ['Lun', 'Mar', 'Mer', 'Gio', 'Ven']
  );
  const [floorDoorbell, setFloorDoorbell] = useState(
    patient.floor_doorbell || ''
  );
  const [domiciliaryNotes, setDomiciliaryNotes] = useState(
    patient.domiciliary_notes || ''
  );

  const [checklist, setChecklist] = useState<DomiciliaryChecklist>(
    patient.interventions_checklist || {
      hygiene_total: true,
      hygiene_intimate: true,
      pad_change: true,
      dressing: true,
      breakfast: true,
      hydration: true,
      medication_assistance: true,
      vital_signs: true,
      mobilization: true,
      bed_making: true,
    }
  );

  // Quick diary entry feedback
  const [diarySending, setDiarySending] = useState(false);

  // Calculate duration in hours & minutes
  const calculateDuration = (start: string, end: string) => {
    try {
      const [startH, startM] = start.split(':').map(Number);
      const [endH, endM] = end.split(':').map(Number);
      let diffMinutes = endH * 60 + endM - (startH * 60 + startM);
      if (diffMinutes < 0) diffMinutes += 24 * 60; // crossover midnight
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return {
        hours,
        minutes,
        totalHours: +(diffMinutes / 60).toFixed(1),
        text:
          minutes > 0
            ? `${hours} ore e ${minutes} min`
            : `${hours} ${hours === 1 ? 'ora' : 'ore'}`,
      };
    } catch {
      return { hours: 2, minutes: 0, totalHours: 2, text: '2 ore' };
    }
  };

  const duration = calculateDuration(startTime, endTime);

  const handleToggleChecklist = (key: keyof DomiciliaryChecklist) => {
    setChecklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleToggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const { data, error } = await updatePatient(patient.id, {
        domiciliary_care_enabled: true,
        visit_start_time: startTime,
        visit_end_time: endTime,
        visit_duration_hours: duration.totalHours,
        visit_days: selectedDays,
        floor_doorbell: floorDoorbell.trim(),
        interventions_checklist: checklist,
        domiciliary_notes: domiciliaryNotes.trim(),
      });

      if (error) throw new Error(error);
      if (data) {
        onPatientUpdated(data);
      }
      setIsEditing(false);
      setSuccessMessage('Piano orario e attività domiciliari aggiornati con successo!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  // One-click quick diary entry for completed domiciliary visit
  const handleQuickLogVisit = async () => {
    setDiarySending(true);
    try {
      const activeTasks: string[] = [];
      if (checklist.hygiene_total) activeTasks.push('Igiene totale / spugnatura');
      if (checklist.hygiene_intimate) activeTasks.push('Igiene intima');
      if (checklist.pad_change) activeTasks.push('Cambio presidio assorbente');
      if (checklist.dressing) activeTasks.push('Vestizione');
      if (checklist.breakfast) activeTasks.push('Preparazione/somministrazione colazione');
      if (checklist.hydration) activeTasks.push('Idratazione');
      if (checklist.medication_assistance) activeTasks.push('Controllo assunzione pastiglie');
      if (checklist.vital_signs) activeTasks.push('Rilevazione parametri vitali');
      if (checklist.mobilization) activeTasks.push('Mobilizzazione e messa in poltrona');
      if (checklist.bed_making) activeTasks.push('Rifacimento letto e riordino');

      const desc = `Accesso Domiciliare (${startTime} - ${endTime}, durata: ${duration.text}): Eseguite le seguenti attività previste dal piano assistenziale: ${activeTasks.join(
        ', '
      )}. Paziente vigile e collaborante.`;

      await createCareDiaryEntry({
        patient_id: patient.id,
        category: 'assistance',
        description: desc,
        notes: `Operatore: ${profile?.full_name || 'Operatore OSS'}`,
        recorded_at: new Date().toISOString(),
      });

      setSuccessMessage('✅ Accesso domiciliare registrato con successo nel Diario Assistenziale!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert('Errore nella registrazione: ' + err.message);
    } finally {
      setDiarySending(false);
    }
  };

  const tasksList: {
    key: keyof DomiciliaryChecklist;
    title: string;
    description: string;
    icon: typeof Heart;
    color: string;
  }[] = [
    {
      key: 'hygiene_total',
      title: 'Igiene Generale / Spugnatura / Bagno',
      description: 'Igiene completa a letto o in bagno assistito, cura della cute',
      icon: Droplets,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      key: 'hygiene_intimate',
      title: 'Igiene Intima',
      description: 'Detersione intima con prodotti emollienti e asciugatura delicata',
      icon: Droplets,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    },
    {
      key: 'pad_change',
      title: 'Cambio Pannolone / Presidio Assorbente',
      description: 'Controllo cute sacrale/trocanterica e applicazione crema barriera',
      icon: Shield,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      key: 'dressing',
      title: 'Vestizione & Cura della Persona',
      description: 'Abbigliamento pulito, pettinatura, cura di unghie e viso',
      icon: UserCheck,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      key: 'breakfast',
      title: 'Colazione / Somministrazione Pasti',
      description: 'Preparazione latte/tè/biscotti o alimenti morbidi, supporto all’assunzione',
      icon: Coffee,
      color: 'text-orange-600 bg-orange-50 border-orange-200',
    },
    {
      key: 'hydration',
      title: 'Idratazione & Somministrazione Liquidi',
      description: 'Garantire apporto di acqua o bevande idratanti durante il turno',
      icon: Droplets,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
    },
    {
      key: 'medication_assistance',
      title: 'Assistenza Assunzione Pastiglie',
      description: 'Verifica dosette/terapia preparata e supervisione assunzione pastiglie',
      icon: Pill,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
    },
    {
      key: 'vital_signs',
      title: 'Misurazione Parametri Vitali',
      description: 'Pressione arteriosa (PA), saturazione (SpO2), battiti e glicemia',
      icon: Activity,
      color: 'text-red-600 bg-red-50 border-red-200',
    },
    {
      key: 'mobilization',
      title: 'Mobilizzazione & Alzata in Poltrona',
      description: 'Deambulazione assistita, trasferimento letto-poltrona con ausili',
      icon: Heart,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      key: 'bed_making',
      title: 'Rifacimento Letto & Riordino',
      description: 'Cambio lenzuola se necessario, areazione stanza e sanificazione piano',
      icon: BedDouble,
      color: 'text-slate-600 bg-slate-100 border-slate-200',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center justify-between font-medium shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          {onNavigateToDiary && (
            <button
              onClick={onNavigateToDiary}
              className="text-xs text-teal-700 underline font-semibold cursor-pointer"
            >
              Apri Diario &rarr;
            </button>
          )}
        </div>
      )}

      {/* Main Time & Schedule Card */}
      <div className="bg-white rounded-3xl p-6 border border-[#E1E4E8] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F5F7F9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1A1C1E]">
                Gestione Orari & Accesso a Domicilio
              </h2>
              <p className="text-xs text-slate-500">
                Pianificazione del turno di assistenza domiciliare per {patient.first_name} {patient.last_name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Modifica Orari & Compiti
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Salvataggio...' : 'Salva'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Time Overview / Editing Form */}
        <div className="mt-5">
          {isEditing ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ora Arrivo (Inizio Intervento) *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-semibold bg-slate-50 border border-[#E1E4E8] rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ora Uscita (Fine Intervento) *
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-semibold bg-slate-50 border border-[#E1E4E8] rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Calcolo Durata Stimata
                  </label>
                  <div className="px-3.5 py-2.5 text-sm font-bold text-teal-800 bg-teal-50 border border-teal-200 rounded-xl flex items-center gap-2">
                    <Clock className="w-4 h-4 text-teal-600" />
                    <span>{duration.text}</span>
                  </div>
                </div>
              </div>

              {/* Days selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Giorni di Visita Programmata
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_DAYS.map((day) => {
                    const isSel = selectedDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => handleToggleDay(day)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                          isSel
                            ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-[#E1E4E8] hover:bg-slate-100'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Intercom & Access notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Piano, Scala e Citofono
                  </label>
                  <input
                    type="text"
                    value={floorDoorbell}
                    onChange={(e) => setFloorDoorbell(e.target.value)}
                    placeholder="es. Piano 2° - Scala B - Citofono Rossi/Ferrari"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-[#E1E4E8] rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Istruzioni Accesso / Note Familiari
                  </label>
                  <input
                    type="text"
                    value={domiciliaryNotes}
                    onChange={(e) => setDomiciliaryNotes(e.target.value)}
                    placeholder="es. Chiavi custodite dal portiere o codice portone"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-[#E1E4E8] rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Highlight Time Block */}
              <div className="md:col-span-2 p-5 bg-gradient-to-br from-teal-50 via-teal-50/50 to-white rounded-2xl border border-teal-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block mb-1">
                    Orario di Turno a Domicilio
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-teal-950 font-mono tracking-tight">
                      {startTime} - {endTime}
                    </span>
                  </div>
                  <span className="text-xs text-teal-800 font-semibold mt-1 inline-block">
                    ⏱️ Durata prevista: <strong>{duration.text}</strong>
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                  <Clock className="w-6 h-6" />
                </div>
              </div>

              {/* Days Block */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-[#E1E4E8] flex flex-col justify-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                  Giorni del Servizio
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedDays.length > 0 ? (
                    selectedDays.map((d) => (
                      <span
                        key={d}
                        className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-teal-100 text-teal-800"
                      >
                        {d}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">Tutti i giorni al bisogno</span>
                  )}
                </div>
              </div>

              {/* Address / Intercom Block */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-[#E1E4E8] flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                    Indirizzo & Citofono
                  </span>
                  <p className="text-xs font-bold text-[#1A1C1E] truncate">
                    {patient.address || 'Indirizzo non specificato'}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {floorDoorbell || 'Citofono standard'}
                  </p>
                </div>
                {patient.address && (
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <button
                      type="button"
                      title="Apri percorso in auto su Google Maps"
                      onClick={() => {
                        openGoogleMapsRoute(patient.address!, 'driving');
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <span>🚗</span>
                      <span>Auto</span>
                    </button>
                    <button
                      type="button"
                      title="Apri percorso a piedi su Google Maps"
                      onClick={() => {
                        openGoogleMapsRoute(patient.address!, 'walking');
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-xl border border-teal-200 transition-colors cursor-pointer"
                    >
                      <span>🚶</span>
                      <span>Piedi</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interventions Checklist (Cosa faccio in quelle ore) */}
      <div className="bg-white rounded-3xl p-6 border border-[#E1E4E8] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F5F7F9]">
          <div>
            <h3 className="text-base font-bold text-[#1A1C1E] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600" />
              Attività Assistenziali nel Turno ({startTime} - {endTime})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Definisci e spunta le attività specifiche erogate a domicilio nelle {duration.text} di assistenza
            </p>
          </div>

          {/* One-click Action to record directly in care diary */}
          <button
            type="button"
            onClick={handleQuickLogVisit}
            disabled={diarySending}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {diarySending ? 'Registrazione...' : '⚡ Registra Accesso nel Diario'}
          </button>
        </div>

        {/* Task Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-5">
          {tasksList.map((task) => {
            const isChecked = !!checklist[task.key];
            const Icon = task.icon;

            return (
              <div
                key={task.key}
                onClick={() => {
                  handleToggleChecklist(task.key);
                  // auto-save preference on click if not in full edit mode
                  if (!isEditing) {
                    const newChecklist = {
                      ...checklist,
                      [task.key]: !isChecked,
                    };
                    setChecklist(newChecklist);
                    updatePatient(patient.id, {
                      interventions_checklist: newChecklist,
                    }).then((res) => {
                      if (res.data) onPatientUpdated(res.data);
                    });
                  }
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 select-none ${
                  isChecked
                    ? 'bg-teal-50/40 border-teal-300 shadow-xs'
                    : 'bg-slate-50/60 border-[#E1E4E8] hover:bg-slate-100/80 opacity-75'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${task.color}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4
                      className={`text-xs sm:text-sm font-bold ${
                        isChecked ? 'text-teal-950' : 'text-slate-700'
                      }`}
                    >
                      {task.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                      {task.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 mt-0.5">
                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors ${
                      isChecked
                        ? 'bg-teal-600 border-teal-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Access Notes Display */}
        {domiciliaryNotes && !isEditing && (
          <div className="mt-5 p-4 bg-slate-50 rounded-2xl border border-[#E1E4E8] text-xs">
            <span className="font-bold text-slate-700 block mb-1">
              📝 Note Specifiche di Consegna & Accesso:
            </span>
            <p className="text-slate-600 leading-relaxed">{domiciliaryNotes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
