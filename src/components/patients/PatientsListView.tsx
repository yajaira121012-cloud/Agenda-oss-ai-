import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Archive,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Activity,
  Pill,
  User,
  Calendar,
  X,
  Phone,
  Clock,
  Home,
  MapPin,
  RefreshCw,
  Sparkles,
  Droplets,
  Coffee,
} from 'lucide-react';
import { Patient, PatientStatus, DomiciliaryChecklist } from '../../types';
import {
  getPatients,
  createPatient,
  updatePatient,
  archivePatient,
} from '../../services/patientsService';
import { useAuth } from '../../context/AuthContext';
import { openGoogleMapsRoute } from '../../lib/geoUtils';

interface PatientsListViewProps {
  onSelectPatient: (patientId: string, initialSubTab?: string) => void;
  openNewModalDirectly?: boolean;
  onCloseNewModal?: () => void;
}

const ALL_DAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

export function PatientsListView({
  onSelectPatient,
  openNewModalDirectly = false,
  onCloseNewModal,
}: PatientsListViewProps) {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PatientStatus | 'all'>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal State for New / Edit Patient
  const [modalOpen, setModalOpen] = useState(openNewModalDirectly);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'M' | 'F' | 'other'>('F');
  const [internalCode, setInternalCode] = useState('');
  const [status, setStatus] = useState<PatientStatus>('active');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [floorDoorbell, setFloorDoorbell] = useState('');
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('09:00');
  const [visitDays, setVisitDays] = useState<string[]>(['Lun', 'Mar', 'Mer', 'Gio', 'Ven']);
  const [checklist, setChecklist] = useState<DomiciliaryChecklist>({
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
  });
  const [notes, setNotes] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  const calculateDuration = (start: string, end: string) => {
    try {
      const [startH, startM] = start.split(':').map(Number);
      const [endH, endM] = end.split(':').map(Number);
      let diffMinutes = endH * 60 + endM - (startH * 60 + startM);
      if (diffMinutes < 0) diffMinutes += 24 * 60;
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return {
        hours,
        minutes,
        totalHours: +(diffMinutes / 60).toFixed(1),
        text: minutes > 0 ? `${hours}h ${minutes}m` : `${hours} ore`,
      };
    } catch {
      return { hours: 2, minutes: 0, totalHours: 2, text: '2 ore' };
    }
  };

  const currentDuration = calculateDuration(startTime, endTime);

  const loadPatientsList = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data, error } = await getPatients(searchQuery, statusFilter);
      if (error) {
        setErrorMessage(error);
      } else {
        setPatients(data || []);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Errore nel recupero pazienti');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatientsList();
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    if (openNewModalDirectly) {
      handleOpenCreate();
    }
  }, [openNewModalDirectly]);

  const handleOpenCreate = () => {
    setEditingPatient(null);
    setFirstName('');
    setLastName('');
    setBirthDate('');
    setGender('F');
    const nextNum = String(patients.length + 1).padStart(3, '0');
    setInternalCode(`OSS-${nextNum}`);
    setStatus('active');
    setPhone('');
    setEmail('');
    setAddress('');
    setFloorDoorbell('');
    setStartTime('07:00');
    setEndTime('09:00');
    setVisitDays(['Lun', 'Mar', 'Mer', 'Gio', 'Ven']);
    setChecklist({
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
    });
    setNotes('');
    setEmergencyName('');
    setEmergencyRelation('');
    setEmergencyPhone('');
    setModalOpen(true);
  };

  const handleOpenEdit = (p: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPatient(p);
    setFirstName(p.first_name);
    setLastName(p.last_name);
    setBirthDate(p.birth_date);
    setGender(p.gender);
    setInternalCode(p.internal_code);
    setStatus(p.status);
    setPhone(p.phone || '');
    setEmail(p.email || '');
    setAddress(p.address || '');
    setFloorDoorbell(p.floor_doorbell || '');
    setStartTime(p.visit_start_time || '07:00');
    setEndTime(p.visit_end_time || '09:00');
    setVisitDays(p.visit_days || ['Lun', 'Mar', 'Mer', 'Gio', 'Ven']);
    setChecklist(
      p.interventions_checklist || {
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
    setNotes(p.notes || '');
    setEmergencyName(p.emergency_contact_name || '');
    setEmergencyRelation(p.emergency_contact_relation || '');
    setEmergencyPhone(p.emergency_contact_phone || '');
    setModalOpen(true);
  };

  const handleArchive = async (p: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Sei sicuro di voler archiviare la cartella di ${p.first_name} ${p.last_name}?`)) {
      const { success, error } = await archivePatient(p.id);
      if (success) {
        loadPatientsList();
      } else {
        alert(error || 'Errore durante l\'archiviazione');
      }
    }
  };

  const handleSavePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !birthDate || !internalCode.trim()) {
      alert('Compila tutti i campi obbligatori (*): Nome, Cognome, Data di nascita, Codice Interno');
      return;
    }

    setSaving(true);
    try {
      const duration = calculateDuration(startTime, endTime);
      const payload: Partial<Patient> = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        birth_date: birthDate,
        gender,
        internal_code: internalCode.trim(),
        status,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        floor_doorbell: floorDoorbell.trim() || undefined,
        domiciliary_care_enabled: true,
        visit_start_time: startTime,
        visit_end_time: endTime,
        visit_duration_hours: duration.totalHours,
        visit_days: visitDays,
        interventions_checklist: checklist,
        notes: notes.trim() || undefined,
        emergency_contact_name: emergencyName.trim() || undefined,
        emergency_contact_relation: emergencyRelation.trim() || undefined,
        emergency_contact_phone: emergencyPhone.trim() || undefined,
      };

      if (editingPatient) {
        const { error } = await updatePatient(editingPatient.id, payload);
        if (error) throw new Error(error);
      } else {
        const { error } = await createPatient({
          ...payload,
          created_by: user?.id,
        } as any);
        if (error) throw new Error(error);
      }

      setModalOpen(false);
      if (onCloseNewModal) onCloseNewModal();
      loadPatientsList();
    } catch (err: any) {
      alert(err.message || 'Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const calculateAge = (dateString: string): number => {
    const today = new Date();
    const birth = new Date(dateString);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getStatusBadge = (st: PatientStatus) => {
    switch (st) {
      case 'active':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Attivo a Domicilio</span>;
      case 'hospitalized':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Ricoverato ospedale</span>;
      case 'inactive':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">Inattivo / Dimesso</span>;
      case 'archived':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">Archiviato</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-3xl p-6 border border-[#E1E4E8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider">
            <span>Assistenza Domiciliare OSS</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-[#1A1C1E] mt-0.5">
            Pazienti & Assistiti a Domicilio
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            Gestisci orari di accesso, attività del turno (igiene, colazione, pastiglie, parametri) e diari assistenziali.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={loadPatientsList}
            title="Aggiorna lista"
            className="p-2.5 rounded-xl border border-[#E1E4E8] hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            id="btn-add-patient"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs md:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuovo Assistito Domiciliare</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-3xl p-4 md:p-5 border border-[#E1E4E8] shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="patient-search-input"
            type="text"
            placeholder="Cerca per cognome, nome, indirizzo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-[#E1E4E8] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 mr-1 flex items-center gap-1 shrink-0 font-medium">
            <Filter className="w-3.5 h-3.5" /> Stato:
          </span>
          {[
            { id: 'all', label: 'Tutti' },
            { id: 'active', label: 'Attivi' },
            { id: 'hospitalized', label: 'Ricoverati' },
            { id: 'archived', label: 'Archiviati' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                statusFilter === f.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Patients List / Grid */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-[#E1E4E8] p-12 text-center text-slate-400 text-xs">
          Caricamento assistiti a domicilio...
        </div>
      ) : patients.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-[#E1E4E8] p-12 text-center">
          <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Nessun assistito trovato</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'Nessun risultato corrispondente ai criteri di ricerca impostati.'
              : 'Non ci sono ancora pazienti registrati.'}
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors cursor-pointer"
          >
            + Aggiungi il primo assistito a domicilio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((p) => {
            const age = calculateAge(p.birth_date);
            const dur = p.visit_start_time && p.visit_end_time ? calculateDuration(p.visit_start_time, p.visit_end_time) : null;
            return (
              <div
                key={p.id}
                onClick={() => onSelectPatient(p.id)}
                className="bg-white rounded-3xl border border-[#E1E4E8] p-6 shadow-xs hover:border-teal-400 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Top card info */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-[#1A1C1E] text-base group-hover:text-teal-700 transition-colors">
                          {p.last_name} {p.first_name}
                        </h3>
                        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {p.internal_code}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{age} anni ({new Date(p.birth_date).toLocaleDateString('it-IT')})</span>
                      </div>
                    </div>

                    <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-xs">
                      {p.first_name[0]}
                      {p.last_name[0]}
                    </div>
                  </div>

                  {/* Prominent Domiciliary Time Block */}
                  <div className="p-3 bg-gradient-to-r from-teal-50 to-emerald-50/40 rounded-2xl border border-teal-200/70 mb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-teal-900 font-bold text-xs">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        <span>
                          {p.visit_start_time || '07:00'} - {p.visit_end_time || '09:00'}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded-md">
                        {dur ? dur.text : `${p.visit_duration_hours || 2} ore`}
                      </span>
                    </div>

                    {/* Quick activity checklist indicators */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.interventions_checklist?.hygiene_total && (
                        <span className="text-[10px] bg-white border border-teal-100 text-teal-800 px-1.5 py-0.5 rounded-md font-medium">
                          🧼 Igiene
                        </span>
                      )}
                      {p.interventions_checklist?.breakfast && (
                        <span className="text-[10px] bg-white border border-teal-100 text-teal-800 px-1.5 py-0.5 rounded-md font-medium">
                          🥣 Colazione
                        </span>
                      )}
                      {p.interventions_checklist?.medication_assistance && (
                        <span className="text-[10px] bg-white border border-teal-100 text-teal-800 px-1.5 py-0.5 rounded-md font-medium">
                          💊 Pastiglie
                        </span>
                      )}
                      {p.interventions_checklist?.vital_signs && (
                        <span className="text-[10px] bg-white border border-teal-100 text-teal-800 px-1.5 py-0.5 rounded-md font-medium">
                          🩺 Parametri
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Address & Status */}
                  <div className="space-y-1.5 mb-3">
                    {p.address && (
                      <div className="text-[11px] text-slate-600 flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="truncate">{p.address}</span>
                      </div>
                    )}
                    {p.emergency_contact_phone && (
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
                        <Phone className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">
                          {p.emergency_contact_name || 'Rif.'}: {p.emergency_contact_phone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Section Shortcuts at Bottom of Card */}
                <div className="pt-3.5 border-t border-[#F5F7F9] flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {p.address && (
                      <button
                        title="Apri percorso stradale in Google Maps"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await openGoogleMapsRoute(p.address!);
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <span>🗺️</span>
                        <span>Percorso</span>
                      </button>
                    )}
                    <button
                      title="Apri Dettaglio Turno Domiciliare"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPatient(p.id, 'domiciliare');
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Clock className="w-3 h-3" />
                      <span>Turno</span>
                    </button>
                    <button
                      title="Apri Diario Assistenziale"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPatient(p.id, 'diario');
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Diario</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleOpenEdit(p, e)}
                      title="Modifica scheda"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {p.status !== 'archived' && (
                      <button
                        onClick={(e) => handleArchive(p, e)}
                        title="Archivia paziente"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: New / Edit Patient with Domiciliary Fields */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-[#E1E4E8] my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingPatient ? 'Modifica Cartella Assistito Domiciliare' : 'Nuovo Assistito a Domicilio'}
                  </h3>
                  <p className="text-xs text-slate-500">Configura orari di visita a domicilio, compiti e anagrafica</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setModalOpen(false);
                  if (onCloseNewModal) onCloseNewModal();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePatient} className="space-y-4">
              {/* Row 1: Name, Last Name, Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="es. Mario"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cognome *
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="es. Rossi"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sesso
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="M">Maschio (M)</option>
                    <option value="F">Femmina (F)</option>
                    <option value="other">Altro</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Birth date, Internal Code, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data di Nascita *
                  </label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Codice Assistito *
                  </label>
                  <input
                    type="text"
                    required
                    value={internalCode}
                    onChange={(e) => setInternalCode(e.target.value)}
                    placeholder="es. OSS-001"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Stato
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="active">Attivo a Domicilio</option>
                    <option value="hospitalized">Ricoverato</option>
                    <option value="inactive">Inattivo / Sospeso</option>
                  </select>
                </div>
              </div>

              {/* Section: Domiciliary Time & Duration */}
              <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-teal-600" />
                    Orario di Accesso a Domicilio
                  </span>
                  <span className="text-xs font-bold text-teal-800 bg-white px-2.5 py-0.5 rounded-lg border border-teal-200 shadow-2xs">
                    Durata: {currentDuration.text}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-teal-900 mb-1">
                      Ora Arrivo (Inizio)
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-teal-900 mb-1">
                      Ora Uscita (Fine)
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Days of visit */}
                <div className="mt-3">
                  <label className="block text-[11px] font-semibold text-teal-900 mb-1">
                    Giorni di Visita
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_DAYS.map((d) => {
                      const isSel = visitDays.includes(d);
                      return (
                        <button
                          type="button"
                          key={d}
                          onClick={() =>
                            setVisitDays((prev) =>
                              prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
                            )
                          }
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border ${
                            isSel
                              ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                              : 'bg-white text-slate-600 border-teal-200 hover:bg-teal-50'
                          }`}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Section: Checklist of Activities during Visit */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  ✨ Attività da svolgere nelle {currentDuration.text}:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { key: 'hygiene_total' as const, label: '🧼 Igiene Generale' },
                    { key: 'hygiene_intimate' as const, label: '🚿 Igiene Intima' },
                    { key: 'pad_change' as const, label: '🩲 Cambio Pannolone' },
                    { key: 'dressing' as const, label: '👕 Vestizione' },
                    { key: 'breakfast' as const, label: '🥣 Colazione / Pasto' },
                    { key: 'hydration' as const, label: '💧 Idratazione' },
                    { key: 'medication_assistance' as const, label: '💊 Pastiglie / Terapia' },
                    { key: 'vital_signs' as const, label: '🩺 Parametri Vitali' },
                    { key: 'mobilization' as const, label: '🦽 Alzata in Poltrona' },
                    { key: 'bed_making' as const, label: '🛏️ Rifacimento Letto' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center gap-2 p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={!!checklist[item.key]}
                        onChange={(e) =>
                          setChecklist((prev) => ({
                            ...prev,
                            [item.key]: e.target.checked,
                          }))
                        }
                        className="rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-[11px] font-medium text-slate-800">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Row: Address & Intercom */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Indirizzo a Domicilio
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="es. Via dei Mille 12, Milano"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Piano, Scala e Citofono
                  </label>
                  <input
                    type="text"
                    value={floorDoorbell}
                    onChange={(e) => setFloorDoorbell(e.target.value)}
                    placeholder="es. Piano 2° - Scala B - Cit. 14"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Referente Familiare / Emergenza
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="Nome referente (es. Laura)"
                    className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    value={emergencyRelation}
                    onChange={(e) => setEmergencyRelation(e.target.value)}
                    placeholder="Grado parentela (es. Figlia)"
                    className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="tel"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="Telefono (es. 347 1234567)"
                    className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    if (onCloseNewModal) onCloseNewModal();
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Salvataggio...' : editingPatient ? 'Aggiorna Assistito' : 'Salva Assistito a Domicilio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
