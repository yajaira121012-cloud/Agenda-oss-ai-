import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Stethoscope,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  Trash2,
} from 'lucide-react';
import { Appointment, Patient, AppointmentType } from '../../types';
import {
  getAppointmentsByDateRange,
  createAppointment,
  deleteAppointment,
  toggleAppointmentStatus,
} from '../../services/appointmentsService';
import { getPatients } from '../../services/patientsService';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  isSameDay,
  isToday,
  eachDayOfInterval,
} from 'date-fns';
import { it } from 'date-fns/locale';

interface CalendarViewProps {
  onSelectPatient?: (patientId: string) => void;
}

type ViewMode = 'day' | 'week' | 'month';

export function CalendarView({ onSelectPatient }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form
  const [patientId, setPatientId] = useState('');
  const [title, setTitle] = useState('');
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('medical_visit');
  const [dateStr, setDateStr] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [description, setDescription] = useState('');

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // Calculate date range based on viewMode
      let start: Date;
      let end: Date;

      if (viewMode === 'day') {
        start = new Date(currentDate);
        start.setHours(0, 0, 0, 0);
        end = new Date(currentDate);
        end.setHours(23, 59, 59, 999);
      } else if (viewMode === 'week') {
        start = startOfWeek(currentDate, { weekStartsOn: 1 });
        end = endOfWeek(currentDate, { weekStartsOn: 1 });
      } else {
        start = startOfMonth(currentDate);
        end = endOfMonth(currentDate);
      }

      const [apptRes, patRes] = await Promise.all([
        getAppointmentsByDateRange(start.toISOString(), end.toISOString()),
        getPatients(),
      ]);

      if (apptRes.error) setErrorMessage(apptRes.error);
      else setAppointments(apptRes.data || []);

      if (patRes.data) setPatients(patRes.data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Errore nel caricamento calendario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentDate, viewMode]);

  const handlePrev = () => {
    if (viewMode === 'day') setCurrentDate(addDays(currentDate, -1));
    else if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNext = () => {
    if (viewMode === 'day') setCurrentDate(addDays(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleOpenAdd = (defaultDate?: Date) => {
    const d = defaultDate || currentDate;
    setPatientId(patients.length > 0 ? patients[0].id : '');
    setTitle('');
    setAppointmentType('medical_visit');
    setDateStr(format(d, 'yyyy-MM-dd'));
    setStartTime('09:00');
    setEndTime('10:00');
    setLocation('');
    setDoctorName('');
    setDescription('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !patientId) {
      alert('Seleziona un assistito e inserisci il titolo');
      return;
    }

    setSaving(true);
    const startIso = new Date(`${dateStr}T${startTime}:00`).toISOString();
    const endIso = endTime ? new Date(`${dateStr}T${endTime}:00`).toISOString() : undefined;

    try {
      const { error } = await createAppointment({
        patient_id: patientId,
        title: title.trim(),
        appointment_type: appointmentType,
        start_time: startIso,
        end_time: endIso,
        location: location.trim() || undefined,
        doctor_name: doctorName.trim() || undefined,
        description: description.trim() || undefined,
        status: 'scheduled',
      });

      if (error) throw new Error(error);

      setModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Errore nel salvataggio appuntamento');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'completed' ? 'scheduled' : 'completed';
    const { success, error } = await toggleAppointmentStatus(id, nextStatus as any);
    if (success) {
      loadData();
    } else {
      alert(error || 'Errore aggiornamento');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Eliminare l'evento "${name}"?`)) {
      const { success, error } = await deleteAppointment(id);
      if (success) {
        loadData();
      } else {
        alert(error || 'Errore eliminazione');
      }
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    const matchesPatient = selectedPatientId === 'all' || a.patient_id === selectedPatientId;
    const matchesType = selectedType === 'all' || a.appointment_type === selectedType;
    return matchesPatient && matchesType;
  });

  const typeLabels: Record<AppointmentType, { label: string; color: string; badge: string }> = {
    medical_visit: {
      label: 'Visita Medica',
      color: 'border-l-4 border-teal-500 bg-teal-50/70 text-teal-900',
      badge: 'bg-teal-100 text-teal-800',
    },
    physiotherapy: {
      label: 'Fisioterapia',
      color: 'border-l-4 border-blue-500 bg-blue-50/70 text-blue-900',
      badge: 'bg-blue-100 text-blue-800',
    },
    nursing_care: {
      label: 'Medicazione / Inf.',
      color: 'border-l-4 border-purple-500 bg-purple-50/70 text-purple-900',
      badge: 'bg-purple-100 text-purple-800',
    },
    exam: {
      label: 'Esami / RX',
      color: 'border-l-4 border-amber-500 bg-amber-50/70 text-amber-900',
      badge: 'bg-amber-100 text-amber-800',
    },
    assistance: {
      label: 'Assistenza OSS',
      color: 'border-l-4 border-emerald-500 bg-emerald-50/70 text-emerald-900',
      badge: 'bg-emerald-100 text-emerald-800',
    },
    therapy: {
      label: 'Somministrazione Terapia',
      color: 'border-l-4 border-rose-500 bg-rose-50/70 text-rose-900',
      badge: 'bg-rose-100 text-rose-800',
    },
    other: {
      label: 'Altro',
      color: 'border-l-4 border-slate-400 bg-slate-50 text-slate-800',
      badge: 'bg-slate-200 text-slate-700',
    },
  };

  // Week days interval
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  // Month days interval
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-3xl p-6 border border-[#E1E4E8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1A1C1E]">Agenda & Calendario Assistenziale</h1>
              <p className="text-xs text-slate-500">
                Pianificazione visite specialistiche, trasporti sanitari, esami e prestazioni
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Switcher + Action Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl">
            {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors cursor-pointer ${
                  viewMode === mode
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode === 'day' ? 'Giorno' : mode === 'week' ? 'Settimana' : 'Mese'}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleOpenAdd()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nuovo Appuntamento
          </button>
        </div>
      </div>

      {/* Date Navigation & Filters Bar */}
      <div className="bg-white rounded-3xl p-4 md:p-5 border border-[#E1E4E8] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Navigation Buttons */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-2 rounded-xl border border-[#E1E4E8] hover:bg-slate-50 text-slate-700 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-2 rounded-xl border border-[#E1E4E8] hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              Oggi
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-xl border border-[#E1E4E8] hover:bg-slate-50 text-slate-700 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="text-sm font-bold text-[#1A1C1E] capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: it })}
            {viewMode === 'day' && ` - ${format(currentDate, 'dd EEEE', { locale: it })}`}
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Patient select */}
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-medium text-slate-700 focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value="all">Tutti gli Assistiti</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.last_name} {p.first_name} ({p.internal_code})
                </option>
              ))}
            </select>
          </div>

          {/* Type select */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-medium text-slate-700 focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value="all">Tutti i Tipi</option>
              <option value="medical_visit">Visita Medica</option>
              <option value="physiotherapy">Fisioterapia</option>
              <option value="nursing_care">Medicazione / Inf.</option>
              <option value="exam">Esami / RX</option>
              <option value="other">Altro</option>
            </select>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* VIEW: WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((day) => {
            const dayAppts = filteredAppointments.filter((a) =>
              isSameDay(new Date(a.start_time), day)
            );
            const isCurrentDay = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={`bg-white rounded-2xl p-3 border flex flex-col min-h-[360px] ${
                  isCurrentDay
                    ? 'border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/10'
                    : 'border-slate-200 shadow-xs'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isCurrentDay ? 'bg-teal-600 text-white' : 'text-slate-900 bg-slate-100'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 capitalize">
                      {format(day, 'EEE', { locale: it })}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenAdd(day)}
                    className="text-slate-400 hover:text-teal-600 p-1 rounded hover:bg-slate-100 cursor-pointer"
                    title="Aggiungi appuntamento"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Day Appointments */}
                <div className="space-y-2 flex-1 overflow-y-auto">
                  {dayAppts.length === 0 ? (
                    <div className="text-[11px] text-slate-300 text-center py-6 italic">
                      Nessun impegno
                    </div>
                  ) : (
                    dayAppts.map((a) => {
                      const tInfo = typeLabels[a.appointment_type] || typeLabels.other;
                      const timeStr = format(new Date(a.start_time), 'HH:mm');
                      const pat = (a as any).patient;

                      return (
                        <div
                          key={a.id}
                          className={`p-2.5 rounded-xl border text-xs transition-all ${tInfo.color} ${
                            a.status === 'completed' ? 'opacity-60 line-through' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-bold text-[11px] leading-tight block">
                              {a.title}
                            </span>
                            <button
                              onClick={() => handleDelete(a.id, a.title)}
                              className="text-slate-400 hover:text-rose-600 cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-600 mt-1">
                            <Clock className="w-2.5 h-2.5" />
                            {timeStr}
                          </div>

                          {pat && (
                            <button
                              onClick={() => onSelectPatient && onSelectPatient(pat.id)}
                              className="mt-1 text-[10px] font-semibold text-teal-800 hover:underline block text-left"
                            >
                              {pat.last_name} {pat.first_name[0]}. ({pat.internal_code})
                            </button>
                          )}

                          <div className="mt-2 flex items-center justify-between text-[10px]">
                            <button
                              onClick={() => handleToggle(a.id, a.status)}
                              className="font-medium text-slate-700 hover:text-slate-900 cursor-pointer"
                            >
                              {a.status === 'completed' ? '✓ Fatto' : '○ Segna'}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW: DAY VIEW */}
      {viewMode === 'day' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">
              Appuntamenti di {format(currentDate, 'EEEE d MMMM yyyy', { locale: it })}
            </h3>
            <button
              onClick={() => handleOpenAdd(currentDate)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 text-xs font-semibold hover:bg-teal-100 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Aggiungi
            </button>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="text-xs text-slate-400 text-center py-10">
              Nessun appuntamento in programma per questa data.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 space-y-2">
              {filteredAppointments.map((a) => {
                const tInfo = typeLabels[a.appointment_type] || typeLabels.other;
                const pat = (a as any).patient;
                const isCompleted = a.status === 'completed';

                return (
                  <div key={a.id} className="pt-3 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="font-mono font-bold text-sm text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                        {format(new Date(a.start_time), 'HH:mm')}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold text-sm ${
                              isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                            }`}
                          >
                            {a.title}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${tInfo.badge}`}>
                            {tInfo.label}
                          </span>
                        </div>

                        {pat && (
                          <div className="text-xs text-slate-600 mt-1">
                            Paziente:{' '}
                            <strong
                              onClick={() => onSelectPatient && onSelectPatient(pat.id)}
                              className="text-teal-700 hover:underline cursor-pointer"
                            >
                              {pat.last_name} {pat.first_name} ({pat.internal_code})
                            </strong>
                            {pat.room_number && ` - Stanza ${pat.room_number}`}
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                          {a.location && <span>Luogo: {a.location}</span>}
                          {a.doctor_name && <span>Specialista: Dott. {a.doctor_name}</span>}
                        </div>

                        {a.description && (
                          <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            {a.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggle(a.id, a.status)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium cursor-pointer border ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {isCompleted ? 'Eseguito ✓' : 'Segna Eseguito'}
                      </button>
                      <button
                        onClick={() => handleDelete(a.id, a.title)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW: MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 pb-3 border-b border-slate-100">
            {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 pt-3">
            {monthDays.map((day) => {
              const dayAppts = filteredAppointments.filter((a) =>
                isSameDay(new Date(a.start_time), day)
              );
              const isCurrentDay = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => {
                    setCurrentDate(day);
                    setViewMode('day');
                  }}
                  className={`min-h-[75px] p-2 rounded-xl border text-xs flex flex-col justify-between cursor-pointer transition-all hover:border-teal-400 ${
                    isCurrentDay
                      ? 'border-teal-500 bg-teal-50/20 font-bold'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${isCurrentDay ? 'text-teal-700 font-bold' : 'text-slate-700'}`}>
                      {format(day, 'd')}
                    </span>
                    {dayAppts.length > 0 && (
                      <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {dayAppts.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayAppts.slice(0, 2).map((a) => (
                      <div
                        key={a.id}
                        className="text-[10px] truncate bg-slate-100 text-slate-800 px-1 py-0.5 rounded"
                      >
                        {a.title}
                      </div>
                    ))}
                    {dayAppts.length > 2 && (
                      <span className="text-[9px] text-teal-700 block font-semibold">
                        +{dayAppts.length - 2} altri
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: New Appointment */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Nuovo Evento / Appuntamento</h3>
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
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="">Seleziona paziente</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.last_name} {p.first_name} ({p.internal_code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Titolo / Prestazione *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="es. Visita Geriatrica, Prelievo ematico..."
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo di Appuntamento *</label>
                <select
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value as AppointmentType)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="medical_visit">Visita Medica Specialistica</option>
                  <option value="physiotherapy">Fisioterapia</option>
                  <option value="nursing_care">Medicazione / Assistenza</option>
                  <option value="exam">Esami Clinici / Radiologia</option>
                  <option value="other">Altro</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ora Inizio *</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ora Fine</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Luogo</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ambulatorio 2, Reparto..."
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Specialista</label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="Dott. Rossi"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Note & Trasporto</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Istruzioni accompagnamento OSS, digiuno o trasporto..."
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
                  {saving ? 'Salvataggio...' : 'Salva Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
