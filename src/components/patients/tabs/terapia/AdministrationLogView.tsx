import React, { useState, useMemo } from 'react';
import {
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  UserCheck,
  Plus,
  Trash2,
  FileSpreadsheet,
  X,
  Pill,
} from 'lucide-react';
import { Medication, MedicationAdministration, AdministrationStatus } from '../../../../types';

interface AdministrationLogViewProps {
  medications: Medication[];
  administrations: MedicationAdministration[];
  onOpenRecordModal: (med?: Medication) => void;
  onDeleteAdministration: (adminId: string) => void;
}

export function AdministrationLogView({
  medications,
  administrations,
  onOpenRecordModal,
  onDeleteAdministration,
}: AdministrationLogViewProps) {
  const [selectedMedId, setSelectedMedId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | AdministrationStatus>('all');
  const [operatorFilter, setOperatorFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract distinct operator names
  const operators = useMemo(() => {
    const set = new Set<string>();
    administrations.forEach((a) => {
      if (a.administered_by && a.administered_by !== '—') set.add(a.administered_by);
      if (a.recorded_by) set.add(a.recorded_by);
    });
    return Array.from(set);
  }, [administrations]);

  // Filtered administrations
  const filtered = useMemo(() => {
    return administrations.filter((a) => {
      if (selectedMedId !== 'all' && a.medication_id !== selectedMedId) return false;
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (
        operatorFilter !== 'all' &&
        a.administered_by !== operatorFilter &&
        a.recorded_by !== operatorFilter
      ) {
        return false;
      }
      if (dateFilter && a.scheduled_date !== dateFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDrug = a.drug_name.toLowerCase().includes(q);
        const matchesNotes = a.notes?.toLowerCase().includes(q);
        const matchesAdminBy = a.administered_by.toLowerCase().includes(q);
        const matchesRecBy = a.recorded_by.toLowerCase().includes(q);
        if (!matchesDrug && !matchesNotes && !matchesAdminBy && !matchesRecBy) return false;
      }

      return true;
    });
  }, [administrations, selectedMedId, statusFilter, operatorFilter, dateFilter, searchQuery]);

  const resetFilters = () => {
    setSelectedMedId('all');
    setStatusFilter('all');
    setOperatorFilter('all');
    setDateFilter('');
    setSearchQuery('');
  };

  const hasFilters = selectedMedId !== 'all' || statusFilter !== 'all' || operatorFilter !== 'all' || dateFilter || searchQuery;

  const renderStatusBadge = (status: AdministrationStatus) => {
    switch (status) {
      case 'administered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Somministrata
          </span>
        );
      case 'refused':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Rifiutata
          </span>
        );
      case 'omitted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Non somministrata
          </span>
        );
      case 'delayed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            Posticipata
          </span>
        );
    }
  };

  return (
    <div id="administration-log-section" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Registro Somministrazioni Farmaci</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tracciabilità e log cronologico di ogni singolo evento di somministrazione o rifiuto
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenRecordModal()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Registra Somministrazione</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca per farmaco, note o operatore..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
            />
          </div>

          {/* Medication dropdown */}
          <div>
            <select
              value={selectedMedId}
              onChange={(e) => setSelectedMedId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Tutti i farmaci</option>
              {medications.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.drug_name}
                </option>
              ))}
            </select>
          </div>

          {/* Status dropdown */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Tutti gli esiti</option>
              <option value="administered">✓ Somministrata</option>
              <option value="refused">✗ Rifiutata</option>
              <option value="omitted">⚠️ Non somministrata</option>
              <option value="delayed">🕒 Posticipata</option>
            </select>
          </div>

          {/* Date filter */}
          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {hasFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              Visualizzazione di <strong>{filtered.length}</strong> su <strong>{administrations.length}</strong> somministrazioni registrate
            </span>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 font-semibold"
            >
              <X className="w-3.5 h-3.5" />
              Azzera filtri
            </button>
          </div>
        )}
      </div>

      {/* Table of administrations */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">
              Nessuna somministrazione registrata
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
              {hasFilters
                ? 'Nessun record corrisponde ai filtri impostati.'
                : 'Non ci sono ancora eventi di somministrazione registrati per questo paziente.'}
            </p>
            <button
              onClick={() => onOpenRecordModal()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Registra Prima Somministrazione
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Data & Orario</th>
                  <th className="py-3 px-4">Farmaco & Dose</th>
                  <th className="py-3 px-4">Esito</th>
                  <th className="py-3 px-4">Somministrato da</th>
                  <th className="py-3 px-4">Registrato da</th>
                  <th className="py-3 px-4">Note Evento</th>
                  <th className="py-3 px-4 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const formattedDate = item.scheduled_date
                    ? new Date(item.scheduled_date).toLocaleDateString('it-IT')
                    : '—';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Date & Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formattedDate}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {item.scheduled_time || '08:00'}
                        </div>
                      </td>

                      {/* Drug & Dosage */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Pill className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate max-w-[220px]">{item.drug_name}</span>
                        </div>
                        {item.dosage && (
                          <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                            Dose: {item.dosage}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderStatusBadge(item.status)}
                      </td>

                      {/* Administered By */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-semibold text-slate-800">
                          <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                          <span>{item.administered_by || '—'}</span>
                        </div>
                      </td>

                      {/* Recorded By */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                        <span>{item.recorded_by || '—'}</span>
                      </td>

                      {/* Notes */}
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                        {item.notes ? (
                          <span className="line-clamp-2 leading-relaxed" title={item.notes}>
                            {item.notes}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Nessuna nota</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            if (window.confirm('Sei sicuro di voler eliminare questa registrazione?')) {
                              onDeleteAdministration(item.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Elimina voce di somministrazione"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
