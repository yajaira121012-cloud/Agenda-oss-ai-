import React, { useState, useMemo } from 'react';
import {
  X,
  Pill,
  Clock,
  Calendar,
  UserCheck,
  Utensils,
  AlertCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  Plus,
  Trash2,
  FileText,
  Sparkles,
} from 'lucide-react';
import { Medication, MedicationAdministration, AdministrationStatus, MedicationStatus } from '../../../../types';

interface MedicationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  medication: Medication | null;
  administrations: MedicationAdministration[];
  onOpenRecordAdminModal: (med: Medication) => void;
  onDeleteAdministration: (adminId: string) => void;
  onOpenEditModal: (med: Medication) => void;
  onOpenTerminateModal: (med: Medication) => void;
  onResumeMedication: (medId: string) => void;
}

export function MedicationDetailModal({
  isOpen,
  onClose,
  medication,
  administrations,
  onOpenRecordAdminModal,
  onDeleteAdministration,
  onOpenEditModal,
  onOpenTerminateModal,
  onResumeMedication,
}: MedicationDetailModalProps) {
  if (!isOpen || !medication) return null;

  const status: MedicationStatus = medication.status || (medication.is_active ? 'active' : 'completed');

  // Filter administrations specific to this medication
  const medAdmins = useMemo(() => {
    return administrations.filter((a) => a.medication_id === medication.id);
  }, [administrations, medication.id]);

  // Adherence calculation
  const stats = useMemo(() => {
    const total = medAdmins.length;
    const administered = medAdmins.filter((a) => a.status === 'administered').length;
    const refused = medAdmins.filter((a) => a.status === 'refused').length;
    const omitted = medAdmins.filter((a) => a.status === 'omitted').length;
    const rate = total > 0 ? Math.round((administered / total) * 100) : 100;
    return { total, administered, refused, omitted, rate };
  }, [medAdmins]);

  const scheduledList = medication.scheduled_times || (medication.timing_time ? medication.timing_time.split('–').map((s) => s.trim()) : []);

  const getMealRelationLabel = (mr: string) => {
    switch (mr) {
      case 'before':
        return 'Prima dei pasti';
      case 'during':
        return 'Durante i pasti';
      case 'after':
        return 'Dopo i pasti';
      default:
        return 'Indipendente dai pasti';
    }
  };

  const renderStatusBadge = (adminStatus: AdministrationStatus) => {
    switch (adminStatus) {
      case 'administered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Somministrata
          </span>
        );
      case 'refused':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Rifiutata
          </span>
        );
      case 'omitted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Non somministrata
          </span>
        );
      case 'delayed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            Posticipata
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/60">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              status === 'active'
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                : status === 'suspended'
                ? 'bg-amber-50 text-amber-600 border-amber-100'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              <Pill className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {status === 'active' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    🟢 In corso
                  </span>
                )}
                {status === 'completed' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    ⚪ Terminata
                  </span>
                )}
                {status === 'suspended' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    🟠 Sospesa
                  </span>
                )}

                {medication.aic_code && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    AIC {medication.aic_code}
                  </span>
                )}

                {medication.pharma_form && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
                    {medication.pharma_form}
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold text-slate-900">{medication.drug_name}</h2>
              {medication.active_ingredient && (
                <p className="text-xs text-slate-600 mt-0.5 font-medium">
                  <span className="text-slate-400">Principio attivo:</span>{' '}
                  <span className="text-slate-800 font-semibold">{medication.active_ingredient}</span>
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Status Reason Banner (if completed or suspended) */}
          {status !== 'active' && medication.status_reason && (
            <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
              status === 'suspended'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${
                status === 'suspended' ? 'text-amber-600' : 'text-slate-500'
              }`} />
              <div>
                <h4 className="font-bold text-sm">
                  {status === 'suspended' ? 'Motivazione della Sospensione' : 'Motivazione Fine Ciclo Terapia'}
                </h4>
                <p className="mt-1 leading-relaxed text-slate-700">{medication.status_reason}</p>
                {medication.end_date && (
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">
                    Data conclusione: {new Date(medication.end_date).toLocaleDateString('it-IT')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Clinical specs grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5 font-medium">Dosaggio</span>
              <span className="font-bold text-slate-800 text-sm">
                {medication.dosage} {medication.unit || ''}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5 font-medium">Via Somministrazione</span>
              <span className="font-semibold text-slate-800 text-sm">{medication.route || 'Orale'}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5 font-medium">Frequenza</span>
              <span className="font-semibold text-slate-800">{medication.frequency}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5 font-medium">Assunzione Pasti</span>
              <span className="font-semibold text-slate-800">{getMealRelationLabel(medication.meal_relation)}</span>
            </div>
          </div>

          {/* Scheduled Times */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              Orari Programmati di Somministrazione
            </h4>
            <div className="flex items-center gap-2 flex-wrap">
              {scheduledList.length > 0 ? (
                scheduledList.map((time, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-white text-slate-800 border border-slate-200 shadow-2xs"
                  >
                    🕒 {time}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">{medication.timing_time || '08:00'}</span>
              )}
            </div>
          </div>

          {/* Period & Prescriber */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-slate-400 block">Periodo Terapeutico:</span>
                <span className="font-semibold text-slate-800">
                  Dal {medication.start_date ? new Date(medication.start_date).toLocaleDateString('it-IT') : '—'} al{' '}
                  {medication.end_date ? new Date(medication.end_date).toLocaleDateString('it-IT') : 'in corso'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
              <UserCheck className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-slate-400 block">Medico Prescrittore:</span>
                <span className="font-semibold text-slate-800">
                  {medication.prescribed_by || 'Non specificato'}
                </span>
              </div>
            </div>
          </div>

          {/* Indication and Notes */}
          {medication.indication && (
            <div className="text-xs">
              <span className="text-slate-400 block mb-1 font-medium">Indicazione Terapeutica:</span>
              <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                {medication.indication}
              </p>
            </div>
          )}

          {medication.notes && (
            <div className="text-xs">
              <span className="text-slate-400 block mb-1 font-medium">Note per l'Assistenza OSS:</span>
              <p className="text-amber-900 bg-amber-50/60 p-3 rounded-xl border border-amber-200/60 leading-relaxed font-medium">
                {medication.notes}
              </p>
            </div>
          )}

          {/* ========================================================================= */}
          {/* REGISTRO SOMMINISTRAZIONI DEDICATO PER QUESTO FARMACO */}
          {/* ========================================================================= */}
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <History className="w-4 h-4 text-blue-600" />
                    Registro Somministrazioni Farmaco
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    {stats.total} registrazioni
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Elenco cronologico di tutte le assunzioni e somministrazioni di questo specifico medicinale
                </p>
              </div>

              {status === 'active' && (
                <button
                  onClick={() => onOpenRecordAdminModal(medication)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Registra Somministrazione</span>
                </button>
              )}
            </div>

            {/* Micro stats banner */}
            {stats.total > 0 && (
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
                  <span className="text-xs text-emerald-700 font-medium block">Somministrate</span>
                  <span className="text-lg font-bold text-emerald-900">{stats.administered}</span>
                </div>

                <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 text-center">
                  <span className="text-xs text-rose-700 font-medium block">Rifiutate / Omesse</span>
                  <span className="text-lg font-bold text-rose-900">{stats.refused + stats.omitted}</span>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-center">
                  <span className="text-xs text-blue-700 font-medium block">Tasso di Aderenza</span>
                  <span className="text-lg font-bold text-blue-900">{stats.rate}%</span>
                </div>
              </div>
            )}

            {/* Administrations Table */}
            {medAdmins.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-500 mb-3">
                  Nessun evento di somministrazione registrato per questo farmaco.
                </p>
                {status === 'active' && (
                  <button
                    onClick={() => onOpenRecordAdminModal(medication)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    Registra la prima assunzione
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Data</th>
                      <th className="py-2.5 px-3">Orario</th>
                      <th className="py-2.5 px-3">Stato</th>
                      <th className="py-2.5 px-3">Somministrato da</th>
                      <th className="py-2.5 px-3">Registrato da</th>
                      <th className="py-2.5 px-3">Note Somministrazione</th>
                      <th className="py-2.5 px-3 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {medAdmins.map((adm) => (
                      <tr key={adm.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                          {adm.scheduled_date
                            ? new Date(adm.scheduled_date).toLocaleDateString('it-IT')
                            : '—'}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-medium text-slate-600 whitespace-nowrap">
                          {adm.scheduled_time || '08:00'}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">{renderStatusBadge(adm.status)}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                          {adm.administered_by || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                          {adm.recorded_by || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 max-w-xs">
                          {adm.notes ? (
                            <span className="line-clamp-2" title={adm.notes}>
                              {adm.notes}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => {
                              if (window.confirm('Eliminare questa voce dal registro?')) {
                                onDeleteAdministration(adm.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Elimina registrazione"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {status === 'active' ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenTerminateModal(medication);
                }}
                className="px-3.5 py-2 bg-white hover:bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold rounded-xl transition-colors"
              >
                Termina / Sospendi Terapia
              </button>
            ) : (
              <button
                onClick={() => {
                  onResumeMedication(medication.id);
                  onClose();
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Riattiva Terapia
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onOpenEditModal(medication);
              }}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition-colors"
            >
              Modifica Dati Terapia
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Chiudi Scheda
          </button>
        </div>
      </div>
    </div>
  );
}
