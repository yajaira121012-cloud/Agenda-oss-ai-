import React, { useState } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Download,
  FileText,
  HelpCircle,
  Check,
} from 'lucide-react';
import { AifaImportReport } from '../../types';
import {
  parseAndImportAifaData,
  resetVademecumCatalog,
} from '../../services/vademecumService';

interface AifaImportModalProps {
  onClose: () => void;
  onImportCompleted: () => void;
}

const SAMPLE_CSV = `Codice AIC,Denominazione,Principio Attivo,Dosaggio,Forma Farmaceutica,Confezione,Ditta Titolare,Via Somministrazione,Classe,Codice ATC,Note
024982012,TACHIPIRINA,PARACETAMOLO,500 mg,Compresse,30 compresse,Angelini Pharma S.p.A.,Orale,C,N02BE01,Intervallo min. 4-6h
028243015,CARDIOASPIRINA,ACIDO ACETILSALICILICO,100 mg,Compresse gastroresistenti,30 compresse,Bayer S.p.A.,Orale,A,B01AC06,Non frantumare
021501018,LASIX,FUROSEMIDE,25 mg,Compresse,30 compresse,Sanofi S.r.l.,Orale,A,C03CA01,Assumere al mattino`;

export function AifaImportModal({
  onClose,
  onImportCompleted,
}: AifaImportModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'template'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [pasteText, setPasteText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [report, setReport] = useState<AifaImportReport | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMessage(null);
    }
  };

  const handleImportFile = async () => {
    if (!file) {
      setErrorMessage('Seleziona un file CSV, TSV o JSON prima di procedere.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const text = await file.text();
      const result = await parseAndImportAifaData(text, file.name);
      setReport(result);
      onImportCompleted();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Errore durante l’elaborazione del file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportPastedText = async () => {
    if (!pasteText.trim()) {
      setErrorMessage('Incolla il contenuto dei dati da importare.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await parseAndImportAifaData(pasteText, 'Dati incollati');
      setReport(result);
      onImportCompleted();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Errore durante l’importazione del testo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetCatalog = () => {
    if (
      confirm(
        'Sei sicuro di voler ripristinare il catalogo Vademecum ai dati ufficiali AIFA predefiniti? Eventuali modifiche personalizzate locali verranno sovrascritte.'
      )
    ) {
      resetVademecumCatalog();
      setResetSuccess(true);
      onImportCompleted();
      setTimeout(() => setResetSuccess(false), 4000);
    }
  };

  const downloadSampleCsv = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'modello_import_aifa_vademecum.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Importa / Aggiorna Dati Ufficiali AIFA
              </h2>
              <p className="text-xs text-slate-400">
                Carica flussi dati CSV, TSV o JSON per aggiornare il Vademecum
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => {
                setActiveTab('upload');
                setReport(null);
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Carica File (CSV/JSON)
            </button>
            <button
              onClick={() => {
                setActiveTab('paste');
                setReport(null);
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'paste'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Incolla Dati
            </button>
            <button
              onClick={() => {
                setActiveTab('template');
                setReport(null);
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'template'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Guida Formato & Modello
            </button>
          </div>

          {/* Messages */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block">Errore importazione</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {resetSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Catalogo farmaci AIFA ripristinato con successo ai valori ufficiali predefiniti!</span>
            </div>
          )}

          {/* Import Report View */}
          {report && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Importazione Completata con Successo</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-white rounded-xl border border-emerald-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Righe Totali</span>
                  <span className="text-base font-black text-slate-800">{report.totalRows}</span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-emerald-200">
                  <span className="text-emerald-600 block text-[10px] uppercase font-bold">Nuovi Inseriti</span>
                  <span className="text-base font-black text-emerald-700">{report.inserted}</span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-emerald-200">
                  <span className="text-blue-600 block text-[10px] uppercase font-bold">Aggiornati</span>
                  <span className="text-base font-black text-blue-700">{report.updated}</span>
                </div>
              </div>

              {report.invalidRows.length > 0 && (
                <div className="pt-2 border-t border-emerald-200/80">
                  <span className="text-xs font-semibold text-amber-800 block mb-1">
                    Righe ignorate ({report.invalidRows.length}):
                  </span>
                  <div className="max-h-32 overflow-y-auto space-y-1 text-[11px] font-mono text-slate-700 bg-white p-2 rounded-lg border border-amber-200">
                    {report.invalidRows.map((inv, idx) => (
                      <div key={idx} className="border-b border-slate-100 pb-1 last:border-0">
                        Riga {inv.rowNumber}: {inv.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 1: Upload File */}
          {activeTab === 'upload' && !report && (
            <div className="space-y-4">
              <label
                htmlFor="aifa-file-upload"
                className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-teal-50/30 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-800 mb-1">
                  {file ? file.name : 'Seleziona o trascina il file AIFA (.csv, .tsv, .json)'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {file
                    ? `${(file.size / 1024).toFixed(1)} KB pronto per l’elaborazione`
                    : 'Supporta i tracciati ufficiali Open Data AIFA'}
                </span>
                <input
                  id="aifa-file-upload"
                  type="file"
                  accept=".csv,.tsv,.txt,.json"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleResetCatalog}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Ripristina predefiniti AIFA
                </button>

                <button
                  type="button"
                  disabled={!file || isProcessing}
                  onClick={handleImportFile}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {isProcessing ? (
                    <span>Elaborazione in corso...</span>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Avvia Importazione</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Paste Raw Data */}
          {activeTab === 'paste' && !report && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Incolla righe CSV / TSV o array JSON
                </label>
                <textarea
                  rows={8}
                  placeholder="Incolla qui i dati..."
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  className="w-full p-3.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  disabled={!pasteText.trim() || isProcessing}
                  onClick={handleImportPastedText}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {isProcessing ? 'Elaborazione...' : 'Elabora e Salva Dati'}
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Format & Template */}
          {activeTab === 'template' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-teal-700" />
                  Specifiche delle Colonne Supportate
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  L’importatore riconosce automaticamente le intestazioni standard AIFA e CSV in italiano o inglese:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-700">
                  <li><strong>Codice AIC:</strong> 9 cifre (identificativo univoco, es. 024982012)</li>
                  <li><strong>Denominazione / Nome commerciale:</strong> es. TACHIPIRINA</li>
                  <li><strong>Principio Attivo:</strong> es. PARACETAMOLO</li>
                  <li><strong>Dosaggio & Forma Farmaceutica:</strong> es. 500 mg, Compresse</li>
                  <li><strong>Ditta Titolare AIC:</strong> es. Angelini Pharma S.p.A.</li>
                  <li><strong>Via Somministrazione:</strong> Orale, Sottocutanea, ecc.</li>
                  <li><strong>Classe:</strong> A, C, H, OTC</li>
                  <li><strong>Codice ATC:</strong> es. N02BE01</li>
                </ul>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Scarica un file modello di esempio:</span>
                <button
                  onClick={downloadSampleCsv}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold border border-slate-300 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Scarica Modello CSV
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}
