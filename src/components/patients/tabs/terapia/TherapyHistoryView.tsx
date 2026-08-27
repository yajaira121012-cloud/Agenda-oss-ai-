import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ChevronRight,
  Pill,
  Clock,
  UserCheck,
  FileText,
  X,
  Sparkles,
  Info,
} from 'lucide-react';
import { Medication, MedicationStatus } from '../../../../types';

interface TherapyHistoryViewProps {
  medications: Medication[];
  onOpenDetailModal: (med: Medication) => void;
  onOpenEditModal: (med: Medication) => void;
  onResumeMedication: (medId: string) => void;
  onOpenAddModal: () => void;
}

export function TherapyHistoryView({
  medications,
  onOpenDetailModal,
  onOpenEditModal,
  onResumeMedication,
  onOpenAddModal,
}: TherapyHistoryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | MedicationStatus>('all');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // Counts
  const counts = useMemo(() => {
    let active = 0;
    let completed = 0;
    let suspended = 0;

    medications.forEach((m) => {
      const status = m.status || (m.is_active ? 'active' : 'completed');
      if (status === 'active') active++;
      else if (status === 'suspended') suspended++;
      else completed++;
    });

    return { total: medications.length, active, completed, suspended };
  }, [medications]);

  // Filtered medications
  const filtered = useMemo(() => {
    return medications.filter((m) => {
      const status: MedicationStatus = m.status || (m.is_active ? 'active' : 'completed');

      // Status filter
      if (statusFilter !== 'all' && status !== statusFilter) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = m.drug_name.toLowerCase().includes(q);
        const matchesActiveIng = m.active_ingredient?.toLowerCase().includes(q);
        const matchesAic = m.aic_code?.includes(q);
        const matchesPrescriber = m.prescribed_by?.toLowerCase().includes(q);
        const matchesIndication = m.indication?.toLowerCase().includes(q);
        const matchesReason = m.status_reason?.toLowerCase().includes(q);

        if (!matchesName && !matchesActiveIng && !matchesAic && !matchesPrescriber && !matchesIndication && !matchesReason) {
          return false;
        }
      }

      // Start date filter
      if (startDateFilter && m.start_date && m.start_date < startDateFilter) {
        return false;
      }

      // End date filter
      if (endDateFilter && m.end_date && m.end_date > endDateFilter) {
        return false;
      }

      return true;
    });
  }, [medications, statusFilter, searchQuery, startDateFilter, endDateFilter]);

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setStartDateFilter('');
    setEndDateFilter('');
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || startDateFilter || endDateFilter;

  const getStatusBadge = (status?: MedicationStatus, isActive?: boolean) => {
    const computedStatus = status || (isActive ? 'active' : 'completed');
    switch (computedStatus) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            🟢 In corso
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            ⚪ Terminata
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            🟠 Sospesa
          </span>
        );
    }
  };

  return (
    <div id="therapy-history-section" className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Storico Terapie Farmacologiche</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Archivio cronologico completo di tutte le terapie prescritte, in corso, concluse o sospese
              </p>
            </div>
          </div>

          {/* Quick Counter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              Tutte ({counts.total})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}
            >
              🟢 In corso ({counts.active})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                statusFilter === 'completed'
                  ? 'bg-slate-700 text-white border-slate-700 shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              ⚪ Terminate ({counts.completed})
            </button>
            <button
              onClick={() => setStatusFilter('suspended')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                statusFilter === 'suspended'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
              }`}
            >
              🟠 Sospese ({counts.suspended})
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca per nome farmaco, principio attivo, AIC o prescrittore..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Date from */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 shrink-0">Dal:</span>
            <input
              type="date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date to */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 shrink-0">Al:</span>
            <input
              type="date"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Active Filter summary & reset */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              Visualizzazione di <strong>{filtered.length}</strong> su <strong>{medications.length}</strong> terapie registrate
            </span>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
            >
              <X className="w-3.5 h-3.5" />
              Azzera tutti i filtri
            </button>
          </div>
        )}
      </div>

      {/* History List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            <History className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-1">
            Nessuna terapia trovata
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            Non ci sono terapie storiche corrispondenti ai criteri di ricerca impostati.
          </p>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              Reimposta Filtri
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((med) => {
            const status: MedicationStatus = med.status || (med.is_active ? 'active' : 'completed');
            const scheduledList = med.scheduled_times || (med.timing_time ? med.timing_time.split('–').map((s) => s.trim()) : []);

            return (
              <div
                key={med.id}
                id={`history-item-${med.id}`}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Main info */}
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {getStatusBadge(med.status, med.is_active)}

                        {med.aic_code && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            AIC {med.aic_code}
                          </span>
                        )}

                        {med.pharma_form && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
                            {med.pharma_form}
                          </span>
                        )}

                        {med.route && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
                            Via: {med.route}
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          {med.drug_name}
                        </h3>
                        {med.active_ingredient && (
                          <p className="text-xs text-slate-600 mt-0.5 font-medium">
                            <span className="text-slate-400">Principio attivo:</span> {med.active_ingredient}
                          </p>
                        )}
                      </div>

                      {/* Period & Dosage inline */}
                      <div className="flex items-center gap-4 flex-wrap text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-medium">
                          <Pill className="w-3.5 h-3.5 text-blue-500" />
                          Dose: <strong>{med.dosage} {med.unit || ''}</strong> ({med.frequency})
                        </span>

                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Periodo:{' '}
                          <strong>
                            {med.start_date ? new Date(med.start_date).toLocaleDateString('it-IT') : '—'}
                          </strong>{' '}
                          al{' '}
                          <strong>
                            {med.end_date ? new Date(med.end_date).toLocaleDateString('it-IT') : (status === 'active' ? 'in corso' : 'non indicato')}
                          </strong>
                        </span>

                        {med.prescribed_by && (
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                            Prescrittore: <strong>{med.prescribed_by}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                      <button
                        onClick={() => onOpenDetailModal(med)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold rounded-xl border border-blue-200 transition-colors"
                      >
                        <History className="w-3.5 h-3.5 text-blue-600" />
                        <span>Dettaglio & Somministrazioni</span>
                        <ChevronRight className="w-3.5 h-3.5 text-blue-500" />
                      </button>

                      {status !== 'active' && (
                        <button
                          onClick={() => onResumeMedication(med.id)}
                          className="inline-flex items-center gap-1 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 transition-colors"
                          title="Riattiva questa terapia nel piano in corso"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Riattiva</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status Reason Box (for terminated or suspended) */}
                  {status !== 'active' && med.status_reason && (
                    <div className={`mt-3 p-3 rounded-xl border text-xs ${
                      status === 'suspended'
                        ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}>
                      <div className="flex items-start gap-2">
                        <Info className={`w-4 h-4 shrink-0 mt-0.5 ${
                          status === 'suspended' ? 'text-amber-600' : 'text-slate-500'
                        }`} />
                        <div>
                          <span className="font-bold block">
                            {status === 'suspended' ? 'Motivazione Sospensione:' : 'Motivazione Conclusione Terapia:'}
                          </span>
                          <p className="mt-0.5 leading-relaxed">{med.status_reason}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
