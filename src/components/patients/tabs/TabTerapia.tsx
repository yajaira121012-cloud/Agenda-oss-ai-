import React, { useState, useEffect, useCallback } from 'react';
import {
  Pill,
  History,
  Clock,
  Plus,
  Upload,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Medication, MedicationAdministration } from '../../../types';
import {
  getMedicationsByPatient,
  createMedication,
  updateMedication,
  deleteMedication,
  terminateMedication,
  suspendMedication,
  resumeMedication,
  getAdministrationsByPatient,
  createAdministration,
  deleteAdministration,
} from '../../../services/medicationsService';

import { ActiveTherapiesView } from './terapia/ActiveTherapiesView';
import { TherapyHistoryView } from './terapia/TherapyHistoryView';
import { AdministrationLogView } from './terapia/AdministrationLogView';
import { MedicationDetailModal } from './terapia/MedicationDetailModal';
import { RecordAdministrationModal } from './terapia/RecordAdministrationModal';
import { TerminateMedicationModal } from './terapia/TerminateMedicationModal';
import { MedicationFormModal } from './terapia/MedicationFormModal';
import { ImportMedicationsModal } from './terapia/ImportMedicationsModal';
import { resetAppScroll } from '../../../lib/scrollUtils';

interface TabTerapiaProps {
  patientId: string;
}

export type TerapiaSubTab = 'in_corso' | 'storico' | 'registro_somministrazioni';

export function TabTerapia({ patientId }: TabTerapiaProps) {
  const [activeSubTab, setActiveSubTab] = useState<TerapiaSubTab>('in_corso');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [administrations, setAdministrations] = useState<MedicationAdministration[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset scroll when switching between sub-tabs
  useEffect(() => {
    resetAppScroll();
  }, [activeSubTab]);

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);

  const [recordAdminModalOpen, setRecordAdminModalOpen] = useState(false);
  const [targetAdminMedication, setTargetAdminMedication] = useState<Medication | null>(null);

  const [terminateModalOpen, setTerminateModalOpen] = useState(false);
  const [targetTerminateMedication, setTargetTerminateMedication] = useState<Medication | null>(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDetailMedication, setSelectedDetailMedication] = useState<Medication | null>(null);

  const [importModalOpen, setImportModalOpen] = useState(false);

  // Load all medications and administrations
  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [medsRes, adminsRes] = await Promise.all([
        getMedicationsByPatient(patientId),
        getAdministrationsByPatient(patientId),
      ]);

      if (medsRes.error) {
        setErrorMessage(medsRes.error);
      } else {
        setMedications(medsRes.data || []);
      }

      if (adminsRes.data) {
        setAdministrations(adminsRes.data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Errore nel caricamento delle terapie e somministrazioni');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Counts
  const activeMedsCount = medications.filter(
    (m) => (m.status === 'active' || (m.status === undefined && m.is_active !== false)) && m.is_active !== false
  ).length;

  const totalMedsCount = medications.length;
  const totalAdminsCount = administrations.length;

  // Handlers
  const handleOpenAdd = () => {
    setEditingMedication(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (med: Medication) => {
    setEditingMedication(med);
    setFormModalOpen(true);
  };

  const handleSaveMedication = async (medData: Partial<Medication>) => {
    if (editingMedication) {
      const res = await updateMedication(editingMedication.id, medData);
      if (res.error) throw new Error(res.error);
    } else {
      const res = await createMedication({
        patient_id: patientId,
        drug_name: medData.drug_name!,
        dosage: medData.dosage!,
        frequency: medData.frequency!,
        meal_relation: medData.meal_relation || 'independent',
        is_active: true,
        ...medData,
      });
      if (res.error) throw new Error(res.error);
    }
    await loadData();
  };

  const handleOpenRecordAdmin = (med?: Medication) => {
    setTargetAdminMedication(med || null);
    setRecordAdminModalOpen(true);
  };

  const handleSaveAdministration = async (
    adminData: Omit<MedicationAdministration, 'id' | 'created_at'>
  ) => {
    const res = await createAdministration(adminData);
    if (res.error) throw new Error(res.error);
    await loadData();
  };

  const handleDeleteAdministration = async (adminId: string) => {
    await deleteAdministration(adminId);
    await loadData();
  };

  const handleOpenTerminate = (med: Medication) => {
    setTargetTerminateMedication(med);
    setTerminateModalOpen(true);
  };

  const handleTerminateMedication = async (
    medId: string,
    targetStatus: 'completed' | 'suspended',
    endDate: string,
    reason: string,
    notes?: string
  ) => {
    if (targetStatus === 'completed') {
      await terminateMedication(medId, endDate, reason, notes);
    } else {
      await suspendMedication(medId, endDate, reason, notes);
    }
    await loadData();
  };

  const handleResumeMedication = async (medId: string) => {
    await resumeMedication(medId);
    await loadData();
  };

  const handleOpenDetail = (med: Medication) => {
    setSelectedDetailMedication(med);
    setDetailModalOpen(true);
  };

  return (
    <div id="tab-terapia-container" className="space-y-6">
      {/* Top Header & Actions Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Terapia Farmacologica</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Cartella Clinico-Assistenziale
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestione completa delle terapie in corso, archivio storico farmacologico e registro somministrazioni
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleOpenRecordAdmin()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Registra Somministrazione</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nuova Terapia</span>
          </button>

          <button
            onClick={() => setImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
            title="Importa da file CSV o JSON con deduplicazione AIC"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Importa</span>
          </button>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            title="Ricarica dati terapia"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex items-center border-b border-slate-200 gap-2 overflow-x-auto pb-px">
        <button
          id="subtab-terapie-in-corso"
          onClick={() => setActiveSubTab('in_corso')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
            activeSubTab === 'in_corso'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>💊 Terapie in corso</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            activeSubTab === 'in_corso'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-slate-100 text-slate-600'
          }`}>
            {activeMedsCount}
          </span>
        </button>

        <button
          id="subtab-storico-terapie"
          onClick={() => setActiveSubTab('storico')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
            activeSubTab === 'storico'
              ? 'border-blue-600 text-blue-700 bg-blue-50/40 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <History className="w-4 h-4" />
          <span>📋 Storico terapie</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            activeSubTab === 'storico'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-slate-100 text-slate-600'
          }`}>
            {totalMedsCount}
          </span>
        </button>

        <button
          id="subtab-registro-somministrazioni"
          onClick={() => setActiveSubTab('registro_somministrazioni')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
            activeSubTab === 'registro_somministrazioni'
              ? 'border-purple-600 text-purple-700 bg-purple-50/40 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>🕒 Registro somministrazioni</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            activeSubTab === 'registro_somministrazioni'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-slate-100 text-slate-600'
          }`}>
            {totalAdminsCount}
          </span>
        </button>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main View Switcher */}
      {loading ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium text-slate-600">Caricamento cartella farmacologica...</p>
        </div>
      ) : (
        <>
          {activeSubTab === 'in_corso' && (
            <ActiveTherapiesView
              medications={medications}
              administrations={administrations}
              onOpenAddModal={handleOpenAdd}
              onOpenEditModal={handleOpenEdit}
              onOpenRecordAdminModal={handleOpenRecordAdmin}
              onOpenTerminateModal={handleOpenTerminate}
              onOpenDetailModal={handleOpenDetail}
            />
          )}

          {activeSubTab === 'storico' && (
            <TherapyHistoryView
              medications={medications}
              onOpenDetailModal={handleOpenDetail}
              onOpenEditModal={handleOpenEdit}
              onResumeMedication={handleResumeMedication}
              onOpenAddModal={handleOpenAdd}
            />
          )}

          {activeSubTab === 'registro_somministrazioni' && (
            <AdministrationLogView
              medications={medications}
              administrations={administrations}
              onOpenRecordModal={handleOpenRecordAdmin}
              onDeleteAdministration={handleDeleteAdministration}
            />
          )}
        </>
      )}

      {/* Modals */}
      <MedicationFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        medication={editingMedication}
        patientId={patientId}
        onSave={handleSaveMedication}
      />

      <RecordAdministrationModal
        isOpen={recordAdminModalOpen}
        onClose={() => setRecordAdminModalOpen(false)}
        medications={medications}
        initialMedication={targetAdminMedication}
        patientId={patientId}
        onSaveAdministration={handleSaveAdministration}
      />

      <TerminateMedicationModal
        isOpen={terminateModalOpen}
        onClose={() => setTerminateModalOpen(false)}
        medication={targetTerminateMedication}
        onTerminate={handleTerminateMedication}
      />

      <MedicationDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        medication={selectedDetailMedication}
        administrations={administrations}
        onOpenRecordAdminModal={handleOpenRecordAdmin}
        onDeleteAdministration={handleDeleteAdministration}
        onOpenEditModal={handleOpenEdit}
        onOpenTerminateModal={handleOpenTerminate}
        onResumeMedication={handleResumeMedication}
      />

      <ImportMedicationsModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        patientId={patientId}
        onImportCompleted={loadData}
      />
    </div>
  );
}
