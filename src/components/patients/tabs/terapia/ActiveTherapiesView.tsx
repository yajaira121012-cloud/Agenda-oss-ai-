import React, { useState } from 'react';
import {
  Pill,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Plus,
  Edit2,
  FileText,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  Utensils,
  History,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { Medication, MedicationAdministration } from '../../../../types';

interface ActiveTherapiesViewProps {
  medications: Medication[];
  administrations: MedicationAdministration[];
  onOpenAddModal: () => void;
  onOpenEditModal: (med: Medication) => void;
  onOpenRecordAdminModal: (med: Medication) => void;
  onOpenTerminateModal: (med: Medication) => void;
  onOpenDetailModal: (med: Medication) => void;
}

export function ActiveTherapiesView({
  medications,
  administrations,
  onOpenAddModal,
  onOpenEditModal,
  onOpenRecordAdminModal,
  onOpenTerminateModal,
  onOpenDetailModal,
}: ActiveTherapiesViewProps) {
  const [filterText, setFilterText] = useState('');

  // Active therapies only (status !== 'completed' && status !== 'suspended' && is_active !== false)
  const activeMedications = medications.filter(
    (m) => (m.status === 'active' || (m.status === undefined && m.is_active !== false)) && m.is_active !== false
  );

  const filtered = activeMedications.filter((m) => {
    if (!filterText.trim()) return true;
    const query = filterText.toLowerCase();
    return (
      m.drug_name.toLowerCase().includes(query) ||
      (m.active_ingredient && m.active_ingredient.toLowerCase().includes(query)) ||
      (m.aic_code && m.aic_code.includes(query)) ||
      (m.prescribed_by && m.prescribed_by.toLowerCase().includes(query))
    );
  });

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

  const getTodayAdminsCount = (medId: string) => {
    const today = new Date().toISOString().slice(0, 10);
    return administrations.filter(
      (a) => a.medication_id === medId && a.scheduled_date === today && a.status === 'administered'
    ).length;
  };

  return (
    <div id="active-therapies-section" className="space-y-6">
      {/* Header & Quick stats banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Terapie in Corso</h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                {activeMedications.length} attive
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Farmaci attualmente somministrati al paziente secondo prescrizione medica
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-add-medication-active"
            onClick={onOpenAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Nuova Terapia</span>
          </button>
        </div>
      </div>

      {/* Filter bar if many items */}
      {activeMedications.length > 2 && (
        <div className="relative">
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Cerca farmaco attivo per nome commerciale, principio attivo o AIC..."
            className="w-full pl-4 pr-10 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          {filterText && (
            <button
              onClick={() => setFilterText('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              Azzera
            </button>
          )}
        </div>
      )}

      {/* Active Medications List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            <Pill className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-1">
            {filterText ? 'Nessun farmaco corrispondente ai criteri' : 'Nessuna terapia attiva in corso'}
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            {filterText
              ? 'Prova a modificare i filtri di ricerca.'
              : 'Non ci sono farmaci attualmente in corso per questo paziente. Puoi aggiungere una nuova terapia dal pulsante sottostante.'}
          </p>
          {!filterText && (
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Aggiungi Terapia
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((med) => {
            const todayCount = getTodayAdminsCount(med.id);
            const scheduledList = med.scheduled_times || (med.timing_time ? med.timing_time.split('–').map((s) => s.trim()) : []);

            return (
              <div
                key={med.id}
                id={`card-med-${med.id}`}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Top / Header */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/40">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          In corso
                        </span>
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
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {med.drug_name}
                      </h3>

                      {med.active_ingredient && (
                        <p className="text-sm font-medium text-slate-600 flex items-center gap-1 mt-0.5">
                          <span className="text-slate-400">Principio attivo:</span>
                          <span className="text-slate-700 font-semibold">{med.active_ingredient}</span>
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => onOpenDetailModal(med)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                      title="Apri scheda clinica dettagliata farmaco"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Card Body - Details */}
                <div className="p-5 space-y-4 flex-1">
                  {/* Key specs grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block mb-0.5 font-medium">Dosaggio & Forma</span>
                      <span className="font-bold text-slate-800 text-sm">
                        {med.dosage} {med.unit || ''}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block mb-0.5 font-medium">Via Somministrazione</span>
                      <span className="font-semibold text-slate-800 text-sm">
                        {med.route || 'Orale'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
                      <span className="text-slate-400 block mb-0.5 font-medium">Frequenza</span>
                      <span className="font-semibold text-slate-800 line-clamp-1">
                        {med.frequency}
                      </span>
                    </div>
                  </div>

                  {/* Scheduled Times (Orari Programmati) */}
                  <div className="bg-emerald-50/50 border border-emerald-100/80 rounded-xl p-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        Orari Programmati di Somministrazione
                      </span>
                      <span className="text-[11px] font-medium text-emerald-700">
                        {scheduledList.length} somministrazioni/die
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {scheduledList.length > 0 ? (
                        scheduledList.map((time, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-white text-emerald-900 border border-emerald-200 shadow-2xs"
                          >
                            🕒 {time}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 font-mono">
                          {med.timing_time || 'Orario standard (08:00)'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dates & Meal relation */}
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Data Inizio:
                      </span>
                      <span className="font-semibold text-slate-800">
                        {med.start_date
                          ? new Date(med.start_date).toLocaleDateString('it-IT')
                          : 'Non specificata'}
                      </span>
                    </div>

                    {med.end_date && (
                      <div className="flex items-center justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Fine prevista:
                        </span>
                        <span className="font-semibold text-slate-800">
                          {new Date(med.end_date).toLocaleDateString('it-IT')}
                        </span>
                      </div>
                    )}

                    {med.meal_relation && med.meal_relation !== 'independent' && (
                      <div className="flex items-center justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Utensils className="w-3.5 h-3.5" />
                          Assunzione pasti:
                        </span>
                        <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                          {getMealRelationLabel(med.meal_relation)}
                        </span>
                      </div>
                    )}

                    {med.prescribed_by && (
                      <div className="flex items-center justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-400 flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5" />
                          Prescritto da:
                        </span>
                        <span className="font-semibold text-slate-800">{med.prescribed_by}</span>
                      </div>
                    )}

                    {med.indication && (
                      <div className="py-1">
                        <span className="text-slate-400 block mb-0.5">Indicazione / Patologia:</span>
                        <p className="text-slate-700 font-medium">{med.indication}</p>
                      </div>
                    )}

                    {med.notes && (
                      <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60 text-amber-900 text-xs">
                        <span className="font-bold flex items-center gap-1 mb-0.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          Note Operatore OSS:
                        </span>
                        <p className="leading-relaxed">{med.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer - Action Buttons */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <button
                    id={`btn-record-admin-${med.id}`}
                    onClick={() => onOpenRecordAdminModal(med)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Registra Somministrazione</span>
                  </button>

                  <button
                    id={`btn-detail-med-${med.id}`}
                    onClick={() => onOpenDetailModal(med)}
                    className="inline-flex items-center gap-1 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition-colors"
                    title="Visualizza registro storico somministrazioni"
                  >
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    <span>Storico</span>
                  </button>

                  <button
                    id={`btn-terminate-med-${med.id}`}
                    onClick={() => onOpenTerminateModal(med)}
                    className="inline-flex items-center gap-1 px-3 py-2 bg-white hover:bg-amber-50 text-amber-700 border border-amber-200 hover:border-amber-300 text-xs font-semibold rounded-xl transition-colors"
                    title="Termina ciclo o sospendi terapia"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Termina / Sospendi</span>
                  </button>

                  <button
                    id={`btn-edit-med-${med.id}`}
                    onClick={() => onOpenEditModal(med)}
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
                    title="Modifica parametri terapia"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
