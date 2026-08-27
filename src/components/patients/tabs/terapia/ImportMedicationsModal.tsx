import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
  Check,
} from 'lucide-react';
import { MedicationImportReport } from '../../../../types';
import { importMedicationsData } from '../../../../services/medicationsService';

interface ImportMedicationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  onImportCompleted: () => void;
}

export function ImportMedicationsModal({
  isOpen,
  onClose,
  patientId,
  onImportCompleted,
}: ImportMedicationsModalProps) {
  const [importing, setImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importReport, setImportReport] = useState<MedicationImportReport | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv') || file.name.endsWith('.json')) {
        setImportFile(file);
        setImportReport(null);
        setImportError(null);
      } else {
        setImportError('Sono supportati esclusivamente file in formato .CSV o .JSON');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImportFile(file);
      setImportReport(null);
      setImportError(null);
    }
  };

  const handleExecuteImport = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportError(null);
    try {
      const content = await importFile.text();
      const report = await importMedicationsData(content, {
        defaultPatientId: patientId,
        deduplicateByAic: true,
        overwriteExisting: true,
      });
      setImportReport(report);
      onImportCompleted();
    } catch (err: any) {
      setImportError(err.message || 'Errore durante l\'importazione dei dati');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-sky-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Importa Farmaci (CSV / JSON)</h3>
              <p className="text-xs text-slate-500">Deduplicazione automatica basata su Codice AIC</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {importError && (
            <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200">
              {importError}
            </div>
          )}

          {/* Drag and drop area */}
          {!importReport && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-sky-500 bg-sky-50/60'
                  : importFile
                  ? 'border-emerald-300 bg-emerald-50/40'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-full bg-white shadow-xs flex items-center justify-center mx-auto mb-3 text-sky-600">
                {importFile?.name.endsWith('.json') ? (
                  <FileCode className="w-6 h-6" />
                ) : (
                  <FileSpreadsheet className="w-6 h-6" />
                )}
              </div>

              {importFile ? (
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{importFile.name}</span>
                  <span className="text-[11px] text-slate-500">
                    {(importFile.size / 1024).toFixed(1)} KB — Clicca per sostituire
                  </span>
                </div>
              ) : (
                <div>
                  <span className="text-xs font-bold text-slate-800 block mb-1">
                    Trascina qui il file o clicca per sfogliare
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Formati supportati: CSV con intestazioni (AIC, Farmaco, Dose, ecc.) o JSON
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Import Result Report */}
          {importReport && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Importazione completata con successo!
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 text-center font-medium">
                <div className="p-2 bg-white rounded-xl border border-emerald-100">
                  <span className="text-slate-400 block text-[10px]">Totale Righe</span>
                  <span className="text-base font-bold text-slate-900">{importReport.totalRows}</span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-emerald-100">
                  <span className="text-emerald-600 block text-[10px]">Inseriti</span>
                  <span className="text-base font-bold text-emerald-700">{importReport.inserted}</span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-emerald-100">
                  <span className="text-blue-600 block text-[10px]">Aggiornati (AIC)</span>
                  <span className="text-base font-bold text-blue-700">{importReport.updated}</span>
                </div>
              </div>
            </div>
          )}

          {/* Info note */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              I record con Codice AIC corrispondente a una terapia già presente nella cartella verranno automaticamente aggiornati con le nuove indicazioni e la data di modifica corrente.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            {importReport ? 'Chiudi' : 'Annulla'}
          </button>

          {!importReport && (
            <button
              onClick={handleExecuteImport}
              disabled={!importFile || importing}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              {importing ? 'Elaborazione...' : 'Avvia Importazione'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
