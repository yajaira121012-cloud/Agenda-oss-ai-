import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  Stethoscope,
} from 'lucide-react';
import { Appointment, AppointmentType } from '../../../types';
import {
  getAppointmentsByPatient,
  createAppointment,
  deleteAppointment,
  toggleAppointmentStatus,
} from '../../../services/appointmentsService';

interface TabAgendaProps {
  patientId: string;
}

export function TabAgenda({ patientId }: TabAgendaProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const now = new Date();
  const [title, setTitle] = useState('');
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('medical_visit');
  const [startDate, setStartDate] = useState(now.toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [description, setDescription] = useState('');

  const loadAppointments = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data, error } = await getAppointmentsByPatient(patientId);
      if (error) {
        setErrorMessage(error);
      } else {
        setAppointments(data || []);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Errore nel recupero agenda');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [patientId]);

  const handleOpenAdd = () => {
    setTitle('');
    setAppointmentType('medical_visit');
    setStartDate(new Date().toISOString().slice(0, 10));
    setStartTime('09:00');
    setEndTime('10:00');
    setLocation('');
    setDoctorName('');
    setDescription('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Inserisci il titolo dell’appuntamento');
      return;
    }

    setSaving(true);
    const startIso = new Date(`${startDate}T${startTime}:00`).toISOString();
    const endIso = endTime ? new Date(`${startDate}T${endTime}:00`).toISOString() : undefined;

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
      loadAppointments();
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
      loadAppointments();
    } else {
      alert(error || 'Errore aggiornamento stato');
    }
  };

  const handleDelete = async (id: string, titleName: string) => {
    if (confirm(`Eliminare l'appuntamento "${titleName}"?`)) {
      const { success, error } = await deleteAppointment(id);
      if (success) {
        loadAppointments();
      } else {
        alert(error || 'Errore cancellazione');
      }
    }
  };

  const typeLabels: Record<AppointmentType, { label: string; color: string }> = {
    medical_visit: { label: 'Visita Medica Specialistica', color: 'bg-teal-50 text-teal-800 border-teal-200' },
    physiotherapy: { label: 'Fisioterapia / Riabilitazione', color: 'bg-blue-50 text-blue-800 border-blue-200' },
    nursing_care: { label: 'Medicazione / Prestazione Infermieristica', color: 'bg-purple-50 text-purple-800 border-purple-200' },
    exam: { label: 'Esami Clinici / Prelievo / RX', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    assistance: { label: 'Assistenza OSS', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    therapy: { label: 'Somministrazione Terapia', color: 'bg-rose-50 text-rose-800 border-rose-200' },
    other: { label: 'Altro Appuntamento', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Agenda & Appuntamenti Assistito</h3>
          <p className="text-xs text-slate-500">
            Visite specialistiche, sedute fisioterapiche, esami diagnostici e trasporti sanitari
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nuovo Appuntamento
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Caricamento appuntamenti...</div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
          <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <h4 className="font-bold text-slate-700 text-xs">Nessun appuntamento in programma</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Pianifica visite specialistiche, esami ematici o fisioterapia per questo assistito.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-3 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg cursor-pointer"
          >
            + Aggiungi Appuntamento
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => {
            const startDateObj = new Date(a.start_time);
            const isCompleted = a.status === 'completed';
            const tInfo = typeLabels[a.appointment_type] || typeLabels.other;

            return (
              <div
                key={a.id}
                className={`bg-white rounded-2xl p-5 border transition-all ${
                  isCompleted ? 'border-slate-200 opacity-70 bg-slate-50/50' : 'border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tInfo.color}`}>
                        {tInfo.label}
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          isCompleted ? 'line-through text-slate-600' : 'text-slate-900'
                        }`}
                      >
                        {a.title}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                      <span className="flex items-center gap-1 font-semibold text-slate-800">
                        <Calendar className="w-3.5 h-3.5 text-teal-600" />
                        {startDateObj.toLocaleDateString('it-IT')}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {startDateObj.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {a.location && (
                        <span className="flex items-center gap-1 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {a.location}
                        </span>
                      )}
                      {a.doctor_name && (
                        <span className="flex items-center gap-1 text-slate-600">
                          <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                          Dott. {a.doctor_name}
                        </span>
                      )}
                    </div>

                    {a.description && (
                      <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {a.description}
                      </p>
                    )}
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
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: New Appointment */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Pianifica Appuntamento Assistito</h3>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Titolo / Prestazione *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="es. Visita Cardiologica di Controllo, Elettrocardiogramma..."
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo di Attività *</label>
                <select
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value as AppointmentType)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white font-medium"
                >
                  <option value="medical_visit">Visita Medica Specialistica</option>
                  <option value="physiotherapy">Fisioterapia / Riabilitazione Motoria</option>
                  <option value="nursing_care">Medicazione / Intervento Infermieristico</option>
                  <option value="exam">Esami Clinici / Prelievo / RX</option>
                  <option value="other">Altro Appuntamento</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Luogo / Reparto</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="es. Ospedale Civile, Ambulatorio 3..."
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Medico / Specialista</label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="es. Dott. Bianchi"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Note & Istruzioni per il Trasporto / Accompagnamento OSS
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="es. Richiesta ambulanza con barella, portare cartella clinica e documenti..."
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
                  {saving ? 'Salvataggio...' : 'Pianifica Appuntamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
