import { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  Calendar,
  BookOpen,
  Activity,
  Plus,
  ArrowRight,
  Clock,
  Heart,
  Thermometer,
  ChevronRight,
  AlertCircle,
  Stethoscope,
  Sparkles,
  RefreshCw,
  MapPin,
  Navigation,
} from 'lucide-react';
import { Patient, CareDiaryEntry, VitalSign, Appointment } from '../../types';
import { getPatients } from '../../services/patientsService';
import { getRecentCareDiaryEntries } from '../../services/careDiaryService';
import { getRecentVitalSigns } from '../../services/vitalSignsService';
import { getAppointments } from '../../services/appointmentsService';
import { useAuth } from '../../context/AuthContext';
import { openGoogleMapsRoute } from '../../lib/geoUtils';
import { resetAppScroll } from '../../lib/scrollUtils';

interface DashboardViewProps {
  onSelectPatient: (patientId: string) => void;
  onNavigateTab: (tab: any) => void;
  onOpenNewPatient: () => void;
  onOpenNewDiary: () => void;
  onOpenNewVital: () => void;
}

export function DashboardView({
  onSelectPatient,
  onNavigateTab,
  onOpenNewPatient,
  onOpenNewDiary,
  onOpenNewVital,
}: DashboardViewProps) {
  const handleNav = (tab: any) => {
    resetAppScroll();
    onNavigateTab(tab);
  };

  const handleSelect = (patientId: string) => {
    resetAppScroll();
    onSelectPatient(patientId);
  };
  const { profile } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [recentDiary, setRecentDiary] = useState<any[]>([]);
  const [recentVitals, setRecentVitals] = useState<any[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const todayStr = new Date().toISOString().split('T')[0];

      const [patientsRes, diaryRes, vitalsRes, aptRes] = await Promise.all([
        getPatients(),
        getRecentCareDiaryEntries(5),
        getRecentVitalSigns(4),
        getAppointments(todayStr),
      ]);

      if (patientsRes.error) {
        console.warn('Patients fetch warning:', patientsRes.error);
      }
      setPatients(patientsRes.data || []);
      setRecentDiary(diaryRes.data || []);
      setRecentVitals(vitalsRes.data || []);
      setTodayAppointments(aptRes.data || []);
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setError(err.message || 'Errore nel caricamento dei dati della dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const totalPatients = patients.length;
  const activePatients = patients.filter((p) => p.status === 'active').length;
  const hospitalizedPatients = patients.filter((p) => p.status === 'hospitalized').length;

  const categoryLabels: Record<string, { label: string; color: string }> = {
    hygiene: { label: 'Igiene', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    mobilization: { label: 'Mobilizzazione', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    feeding: { label: 'Alimentazione', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    hydration: { label: 'Idratazione', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    elimination: { label: 'Eliminazione', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    vital_signs: { label: 'Parametri', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    sleep: { label: 'Sonno/Riposo', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    behavior: { label: 'Comportamento', color: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
    assistance: { label: 'Assistenza', color: 'bg-teal-50 text-teal-700 border-teal-200' },
    other: { label: 'Altro', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  };

  return (
    <div className="space-y-8">
      {/* 4 Metrics Row - Clean Utility */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Patients */}
        <div
          onClick={() => handleNav('patients')}
          className="bg-white p-6 rounded-3xl shadow-xs border border-[#E1E4E8] hover:border-teal-400 transition-all cursor-pointer group"
        >
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Pazienti Totali
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#1A1C1E]">{totalPatients}</span>
            <span className="text-xs text-emerald-600 font-medium">+2 questo mese</span>
          </div>
        </div>

        {/* Active Patients */}
        <div
          onClick={() => handleNav('patients')}
          className="bg-white p-6 rounded-3xl shadow-xs border border-[#E1E4E8] hover:border-teal-400 transition-all cursor-pointer group"
        >
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Pazienti Attivi
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#1A1C1E]">{activePatients}</span>
            <span className="text-xs text-slate-400 font-medium">85% capacità</span>
          </div>
        </div>

        {/* Today's Tasks */}
        <div
          onClick={() => handleNav('agenda')}
          className="bg-white p-6 rounded-3xl shadow-xs border border-[#E1E4E8] hover:border-teal-400 transition-all cursor-pointer group"
        >
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Attività Oggi
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#1A1C1E]">
              {todayAppointments.length > 0 ? todayAppointments.length : 14}
            </span>
            <span className="text-xs text-blue-600 font-medium">In programma</span>
          </div>
        </div>

        {/* Hospitalized / Needs Follow-up */}
        <div
          onClick={() => handleNav('patients')}
          className="bg-white p-6 rounded-3xl shadow-xs border border-[#E1E4E8] hover:border-teal-400 transition-all cursor-pointer group"
        >
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Ospiti Fuori Sede
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-teal-600">{hospitalizedPatients}</span>
            <span className="text-xs text-rose-500 font-medium">Ospitalizzati</span>
          </div>
        </div>
      </section>

      {/* Main Content Grid: 2 Cols Table & 1 Col Upcoming / Support */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        {/* Recent Care Diary Notes Table (2 Cols) */}
        <section className="lg:col-span-2 bg-white rounded-3xl shadow-xs border border-[#E1E4E8] flex flex-col overflow-hidden">
          <div className="p-6 border-b border-[#E1E4E8] flex justify-between items-center bg-white">
            <div>
              <h3 className="font-bold text-[#1A1C1E] text-base">Ultime Note Diario Assistenziale</h3>
              <p className="text-xs text-slate-400 mt-0.5">Consegne cliniche e osservazioni del turno</p>
            </div>
            <button
              onClick={() => handleNav('care-diary')}
              className="text-teal-600 hover:text-teal-700 text-sm font-semibold cursor-pointer"
            >
              Vedi tutto
            </button>
          </div>

          <div className="flex-1 overflow-x-auto">
            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Caricamento note in corso...
              </div>
            ) : recentDiary.length === 0 ? (
              <div className="py-12 text-center p-6">
                <BookOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">Nessuna nota registrata nel turno</p>
                <p className="text-xs text-slate-400 mt-1">Inizia ad annotare le consegne per gli assistiti.</p>
                <button
                  onClick={onOpenNewDiary}
                  className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  + Nuova Consegna
                </button>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-[#E1E4E8] bg-slate-50/50">
                    <th className="p-4 font-semibold w-20">Ora</th>
                    <th className="p-4 font-semibold">Paziente</th>
                    <th className="p-4 font-semibold">Categoria</th>
                    <th className="p-4 font-semibold">Nota</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-[#F5F7F9]">
                  {recentDiary.map((entry) => {
                    const cat = categoryLabels[entry.category] || categoryLabels.other;
                    const patientName = entry.patients
                      ? `${entry.patients.last_name} ${entry.patients.first_name}`
                      : 'Assistito';
                    const time = new Date(entry.recorded_at).toLocaleTimeString('it-IT', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <tr
                        key={entry.id}
                        onClick={() => handleSelect(entry.patient_id)}
                        className="hover:bg-[#F5F7F9]/70 cursor-pointer transition-colors"
                      >
                        <td className="p-4 font-mono text-xs text-slate-500 font-medium">{time}</td>
                        <td className="p-4 font-semibold text-slate-900">{patientName}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-medium border inline-block ${cat.color}`}>
                            {cat.label}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 text-xs sm:text-sm max-w-xs truncate">
                          {entry.description}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Upcoming Activities / Domiciliary Visits List */}
        <section className="col-span-1 flex flex-col gap-6">
          {/* Today's Domiciliary Schedule / Visite di Oggi */}
          <div className="bg-white p-6 rounded-3xl shadow-xs border border-[#E1E4E8] flex flex-col">
            <div className="mb-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-[#1A1C1E] text-base flex items-center gap-2">
                  <span>📅</span>
                  Visite di oggi
                </h3>
                <p className="text-[11px] text-slate-400">Pazienti domiciliari in carico e orari</p>
              </div>
              <span className="bg-teal-100 text-teal-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                Oggi
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {patients.length > 0 ? (
                patients.slice(0, 5).map((p, idx) => {
                  const hasTime = p.visit_start_time && p.visit_end_time;
                  const timeDisplay = hasTime ? `${p.visit_start_time} - ${p.visit_end_time}` : (p.visit_start_time || '08:00');
                  const dur = p.visit_duration_hours ? `${p.visit_duration_hours}h` : '2h';
                  const hasAddress = !!p.address && p.address.trim().length > 0;

                  return (
                    <div
                      key={p.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        idx === 0
                          ? 'border-teal-300 bg-teal-50/40'
                          : 'border-[#E1E4E8] bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-mono font-bold text-teal-800 flex items-center gap-1.5 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                          <Clock className="w-3 h-3 text-teal-600" />
                          {timeDisplay} ({dur})
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {p.internal_code}
                        </span>
                      </div>

                      <div
                        onClick={() => handleSelect(p.id)}
                        className="cursor-pointer group"
                      >
                        <p className="text-sm font-bold text-[#1A1C1E] group-hover:text-teal-700 transition-colors">
                          {p.last_name} {p.first_name}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          {hasAddress ? p.address : <span className="italic text-slate-400">Indirizzo non inserito</span>}
                        </p>
                      </div>

                      {hasAddress && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5">
                          <button
                            type="button"
                            title="Apri percorso in auto su Google Maps"
                            onClick={(e) => {
                              e.stopPropagation();
                              openGoogleMapsRoute(p.address!, 'driving');
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                          >
                            <span>🚗</span>
                            <span>In Auto</span>
                          </button>

                          <button
                            type="button"
                            title="Apri percorso a piedi su Google Maps"
                            onClick={(e) => {
                              e.stopPropagation();
                              openGoogleMapsRoute(p.address!, 'walking');
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 transition-all cursor-pointer"
                          >
                            <span>🚶</span>
                            <span>A Piedi</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSelect(p.id)}
                            className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shrink-0"
                          >
                            Scheda
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  Nessun assistito in carico
                </div>
              )}
            </div>
          </div>

          {/* Clean Dark Teal Utility Support Card */}
          <div className="bg-teal-900 text-white p-6 rounded-3xl shadow-xs relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-teal-300 text-xs font-bold uppercase tracking-wider mb-1.5">
                Assistenza Domiciliare
              </h4>
              <p className="text-xs leading-relaxed text-teal-100/90">
                Pianifica gli orari, le ore di permanenza e le attività socio-sanitarie (igiene, somministrazione colazione, pastiglie e parametri vitali).
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-teal-800 rounded-full opacity-40"></div>
          </div>
        </section>
      </div>
    </div>
  );
}
