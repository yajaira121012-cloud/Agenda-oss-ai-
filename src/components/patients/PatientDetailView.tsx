import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  User,
  HeartPulse,
  Accessibility,
  Eye,
  Activity,
  Pill,
  Utensils,
  BookOpen,
  Calendar,
  Clock,
  Home,
  Phone,
  Bed,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MapPin,
} from 'lucide-react';
import { Patient } from '../../types';
import { getPatientById } from '../../services/patientsService';
import { PatientDomicileCard } from './PatientDomicileCard';
import { TabDomiciliare } from './tabs/TabDomiciliare';
import { TabAnagrafica } from './tabs/TabAnagrafica';
import { TabAnamnesi } from './tabs/TabAnamnesi';
import { TabMobilita } from './tabs/TabMobilita';
import { TabSensorialita } from './tabs/TabSensorialita';
import { TabParametri } from './tabs/TabParametri';
import { TabTerapia } from './tabs/TabTerapia';
import { TabAlimentazione } from './tabs/TabAlimentazione';
import { TabDiario } from './tabs/TabDiario';
import { TabAgenda } from './tabs/TabAgenda';

export type PatientTab =
  | 'domiciliare'
  | 'anagrafica'
  | 'anamnesi'
  | 'mobilita'
  | 'sensorialita'
  | 'parametri'
  | 'terapia'
  | 'alimentazione'
  | 'diario'
  | 'agenda';

interface PatientDetailViewProps {
  patientId: string;
  onBack: () => void;
  initialTab?: PatientTab;
}

export function PatientDetailView({
  patientId,
  onBack,
  initialTab = 'domiciliare',
}: PatientDetailViewProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<PatientTab>(initialTab);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadPatient = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data, error } = await getPatientById(patientId);
      if (error) {
        setErrorMessage(error);
      } else if (data) {
        setPatient(data);
      } else {
        setErrorMessage('Assistito non trovato.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Errore nel caricamento della scheda assistito');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatient();
  }, [patientId]);

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

  const tabs: { id: PatientTab; label: string; icon: typeof User }[] = [
    { id: 'domiciliare', label: 'Turno & Attività Domiciliari', icon: Clock },
    { id: 'anagrafica', label: 'Anagrafica & Recapiti', icon: User },
    { id: 'diario', label: 'Diario Assistenziale', icon: BookOpen },
    { id: 'parametri', label: 'Parametri Vitali', icon: Activity },
    { id: 'terapia', label: 'Terapia Farmaci', icon: Pill },
    { id: 'alimentazione', label: 'Alimentazione & Idratazione', icon: Utensils },
    { id: 'mobilita', label: 'Mobilità & Ausili', icon: Accessibility },
    { id: 'sensorialita', label: 'Sensorialità & Protesi', icon: Eye },
    { id: 'anamnesi', label: 'Anamnesi & Patologie', icon: HeartPulse },
    { id: 'agenda', label: 'Agenda & Visite', icon: Calendar },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        <span className="text-xs text-slate-500 font-medium">Caricamento scheda assistito a domicilio...</span>
      </div>
    );
  }

  if (errorMessage || !patient) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-900 text-base">Impossibile aprire la scheda</h3>
        <p className="text-xs text-slate-500">{errorMessage || 'Paziente non trovato'}</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Torna all'elenco pazienti
        </button>
      </div>
    );
  }

  const age = calculateAge(patient.birth_date);

  return (
    <div className="space-y-6">
      {/* Top Navigation & Quick Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2.5 rounded-xl border border-[#E1E4E8] shadow-xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Torna alla Lista Assistiti Domiciliari
        </button>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              patient.status === 'active'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : patient.status === 'discharged'
                ? 'bg-slate-100 text-slate-600 border-slate-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {patient.status === 'active'
              ? '● Assistito Attivo (Domicilio)'
              : patient.status === 'discharged'
              ? 'Dimesso'
              : 'Deceduto'}
          </span>
        </div>
      </div>

      {/* Patient Master Card Banner (Header Scheda Paziente) */}
      <div className="bg-white rounded-3xl p-6 border border-[#E1E4E8] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
              {patient.first_name[0]}
              {patient.last_name[0]}
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-[#1A1C1E]">
                  {patient.last_name} {patient.first_name}
                </h1>
                <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                  {patient.internal_code}
                </span>

                {/* Prominent Domiciliary Visit Schedule Badge */}
                {patient.visit_start_time && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold font-mono shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    Accesso: {patient.visit_start_time} - {patient.visit_end_time || 'Fine'} ({patient.visit_duration_hours || 2}h)
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                <span>
                  <strong>Età:</strong> {new Date(patient.birth_date).toLocaleDateString('it-IT')} ({age} anni)
                </span>
                <span>•</span>
                <span>
                  <strong>Sesso:</strong> {patient.gender === 'F' ? 'Femmina (F)' : patient.gender === 'M' ? 'Maschio (M)' : 'Altro'}
                </span>
                {patient.address && (
                  <>
                    <span>•</span>
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-teal-600" />
                      {patient.address}
                    </span>
                  </>
                )}
                {patient.phone && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {patient.phone}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Badges in Header */}
          <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
            {patient.emergency_contact_phone && (
              <div className="text-xs bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl text-rose-800">
                <span className="font-bold block text-[10px] uppercase text-rose-600">Emergenza / Familiare</span>
                <span className="font-semibold">{patient.emergency_contact_name || 'Referente'}: </span>
                <span className="font-mono">{patient.emergency_contact_phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Switcher Horizontal Bar */}
        <div className="mt-6 pt-4 border-t border-[#F5F7F9] flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sezione 📍 Domicilio del Paziente & Navigatore Google Maps */}
      <PatientDomicileCard
        address={patient.address}
        floorDoorbell={patient.floor_doorbell}
        patientName={`${patient.first_name} ${patient.last_name}`}
        onEditAddress={() => setActiveTab('anagrafica')}
      />

      {/* Render Active Tab Content */}
      <div className="transition-all">
        {activeTab === 'domiciliare' && (
          <TabDomiciliare
            patient={patient}
            onPatientUpdated={(updated) => setPatient(updated)}
            onNavigateToDiary={() => setActiveTab('diario')}
          />
        )}
        {activeTab === 'anagrafica' && (
          <TabAnagrafica patient={patient} onPatientUpdated={(updated) => setPatient(updated)} />
        )}
        {activeTab === 'diario' && <TabDiario patientId={patient.id} />}
        {activeTab === 'parametri' && <TabParametri patientId={patient.id} />}
        {activeTab === 'terapia' && <TabTerapia patientId={patient.id} />}
        {activeTab === 'alimentazione' && <TabAlimentazione patientId={patient.id} />}
        {activeTab === 'mobilita' && <TabMobilita patientId={patient.id} />}
        {activeTab === 'sensorialita' && <TabSensorialita patientId={patient.id} />}
        {activeTab === 'anamnesi' && <TabAnamnesi patientId={patient.id} />}
        {activeTab === 'agenda' && <TabAgenda patientId={patient.id} />}
      </div>
    </div>
  );
}
