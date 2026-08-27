import React, { useState } from 'react';
import {
  X,
  Pill,
  Building2,
  FileText,
  ShieldAlert,
  Info,
  CheckCircle2,
  Copy,
  ExternalLink,
  Tag,
  Layers,
  Sparkles,
} from 'lucide-react';
import { VademecumMedication } from '../../types';

interface VademecumDetailModalProps {
  medication: VademecumMedication;
  onClose: () => void;
}

export function VademecumDetailModal({
  medication,
  onClose,
}: VademecumDetailModalProps) {
  const [copiedAic, setCopiedAic] = useState(false);

  const handleCopyAic = () => {
    navigator.clipboard.writeText(medication.aic_code);
    setCopiedAic(true);
    setTimeout(() => setCopiedAic(false), 2000);
  };

  const getReimbursementBadge = (cls?: string) => {
    if (!cls) return 'bg-slate-100 text-slate-700 border-slate-200';
    if (cls.startsWith('A')) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (cls.startsWith('C')) return 'bg-blue-50 text-blue-800 border-blue-200';
    if (cls.startsWith('H')) return 'bg-purple-50 text-purple-800 border-purple-200';
    return 'bg-amber-50 text-amber-800 border-amber-200';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 text-white flex items-start justify-between shrink-0">
          <div className="flex items-start gap-3.5 pr-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/20 flex items-center justify-center shrink-0">
              <Pill className="w-6 h-6 text-teal-200" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/20 text-teal-100">
                  Farmaco AIFA
                </span>
                {medication.reimbursement_class && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-900/60 text-teal-200 border border-teal-500/30">
                    Classe {medication.reimbursement_class}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black tracking-tight text-white mt-1">
                {medication.trade_name}
              </h2>
              {medication.active_ingredient && (
                <p className="text-sm font-medium text-teal-100">
                  Principio Attivo: <span className="font-bold text-white">{medication.active_ingredient}</span>
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Chiudi scheda"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Safety Disclaimer Banner */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <strong className="font-semibold block text-amber-950">
                Strumento di Consultazione e Vademecum per Operatori (OSS)
              </strong>
              Le informazioni hanno finalità informativa e organizzativa. Non costituiscono prescrizione medica né autorizzazione a modificare dosaggi o modalità di somministrazione prescritte dal medico curante.
            </div>
          </div>

          {/* Primary Quick Identifiers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Codice AIC */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Codice AIC Ufficiale
                </span>
                <span className="text-sm font-mono font-bold text-slate-900 mt-0.5 block">
                  {medication.aic_code}
                </span>
              </div>
              <button
                onClick={handleCopyAic}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-teal-700 transition-colors cursor-pointer"
                title="Copia codice AIC"
              >
                {copiedAic ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copiato</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copia AIC</span>
                  </>
                )}
              </button>
            </div>

            {/* Codice ATC */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Classificazione ATC
              </span>
              <span className="text-sm font-mono font-bold text-teal-800 mt-0.5 block">
                {medication.atc_code || 'Non specificato'}
              </span>
            </div>
          </div>

          {/* Detailed Pharmaceutical Details Grid */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-200/80 pb-2">
              <Layers className="w-4 h-4 text-teal-700" />
              Caratteristiche Farmaceutiche e Confezione
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs">
              <div>
                <span className="text-slate-500 font-medium block">Dosaggio:</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {medication.dosage || 'N/D'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 font-medium block">Forma Farmaceutica:</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {medication.pharma_form || 'N/D'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 font-medium block">Via di Somministrazione:</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 font-semibold border border-teal-200 mt-0.5">
                  {medication.admin_route || 'Orale'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 font-medium block">Regime di Fornitura / Ricetta:</span>
                <span className="font-semibold text-slate-800">
                  {medication.prescription_regime || 'RR (Ricetta Ripetibile)'}
                </span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-slate-500 font-medium block">Descrizione Confezione:</span>
                <span className="font-semibold text-slate-800">
                  {medication.package_desc || 'Confezione standard autorizzata'}
                </span>
              </div>
            </div>
          </div>

          {/* Ditta Titolare AIC */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3 text-xs">
            <Building2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-500 font-medium block">Titolare AIC / Azienda Farmaceutica:</span>
              <span className="font-bold text-slate-900 text-sm">
                {medication.holder_company || 'Titolare registrato AIFA'}
              </span>
            </div>
          </div>

          {/* Official AIFA Notes / Indicazioni & Avvertenze per OSS */}
          {medication.official_notes && (
            <div className="p-4 bg-teal-50/50 border border-teal-200/80 rounded-2xl space-y-1.5">
              <h4 className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-teal-700" />
                Note AIFA, Istruzioni e Precauzioni di Somministrazione
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-normal">
                {medication.official_notes}
              </p>
            </div>
          )}

          {/* Source Attribution Footer */}
          <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span>Fonte: <strong>{medication.source || 'AIFA - Agenzia Italiana del Farmaco'}</strong></span>
            </div>
            {medication.source_updated_at && (
              <span>Aggiornato al: {new Date(medication.source_updated_at).toLocaleDateString('it-IT')}</span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
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
