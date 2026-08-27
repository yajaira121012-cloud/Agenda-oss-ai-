import React, { useState, useEffect, useMemo } from 'react';
import {
  Pill,
  Search,
  X,
  Filter,
  Layers,
  Upload,
  Download,
  Info,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Building2,
  Tag,
  FileSpreadsheet,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { VademecumMedication } from '../../types';
import {
  searchVademecumMedications,
  resetVademecumCatalog,
} from '../../services/vademecumService';
import { VademecumDetailModal } from './VademecumDetailModal';
import { AifaImportModal } from './AifaImportModal';

export function VademecumView() {
  const [medications, setMedications] = useState<VademecumMedication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedRoute, setSelectedRoute] = useState<string>('all');

  const [selectedMedication, setSelectedMedication] =
    useState<VademecumMedication | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [copiedAic, setCopiedAic] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await searchVademecumMedications({
        searchQuery,
        reimbursementClass: selectedClass !== 'all' ? selectedClass : undefined,
        route: selectedRoute !== 'all' ? selectedRoute : undefined,
      });
      setMedications(res.data);
    } catch (err) {
      console.error('Error loading vademecum medications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, selectedClass, selectedRoute]);

  const handleCopyAic = (aic: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(aic);
    setCopiedAic(aic);
    setTimeout(() => setCopiedAic(null), 2000);
  };

  const getReimbursementBadge = (cls?: string) => {
    if (!cls) return 'bg-slate-100 text-slate-700 border-slate-200';
    if (cls.startsWith('A')) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (cls.startsWith('C')) return 'bg-blue-50 text-blue-800 border-blue-200';
    if (cls.startsWith('H')) return 'bg-purple-50 text-purple-800 border-purple-200';
    return 'bg-amber-50 text-amber-800 border-amber-200';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E1E4E8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-700/20 shrink-0">
            <Pill className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                AIFA Open Data
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Banca Dati Ufficiale
              </span>
            </div>
            <h1 className="text-2xl font-black text-[#1A1C1E] mt-1 tracking-tight">
              Vademecum Farmaci Italiani
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Archivio informativo dei farmaci commercializzati in Italia, codici AIC, vie di somministrazione e note AIFA per l'assistenza socio-sanitaria domiciliare e residenziale.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Importa / Aggiorna AIFA</span>
          </button>
        </div>
      </div>

      {/* Info & Legal Disclaimer Banner */}
      <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-2xl flex items-start gap-3 text-xs text-teal-950">
        <Info className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Promemoria Operativo per l'Operatore OSS:</strong> Questo vademecum è uno strumento di supporto informativo e organizzativo. L'OSS non è autorizzato a prescrivere farmaci o variare terapie e dosaggi stabiliti dal medico curante o dallo specialista.
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-[#E1E4E8] shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cerca per nome commerciale (es. Tachipirina, Cardioaspirina, Lasix), principio attivo (es. Paracetamolo), codice AIC (es. 024982012) o ATC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Class Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Classe:
            </span>
            {[
              { id: 'all', label: 'Tutte' },
              { id: 'A', label: 'Classe A (SSN)' },
              { id: 'C', label: 'Classe C' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedClass(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedClass === item.id
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Route Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-500 mr-1">Via:</span>
            {[
              { id: 'all', label: 'Tutte' },
              { id: 'Orale', label: 'Orale' },
              { id: 'Sottocutanea', label: 'Sottocutanea' },
              { id: 'Inalatoria', label: 'Inalatoria' },
              { id: 'Rettale', label: 'Rettale' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedRoute(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedRoute === item.id
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Risultati: <strong className="text-slate-900">{medications.length}</strong> farmaci
          </div>
        </div>
      </div>

      {/* Medication Cards Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <span className="text-xs text-slate-500 font-medium">Caricamento farmaci AIFA in corso...</span>
        </div>
      ) : medications.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-[#E1E4E8] text-center max-w-lg mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Pill className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1A1C1E]">Nessun farmaco trovato</h3>
            <p className="text-xs text-slate-500 mt-1">
              Nessun medicinale corrisponde ai criteri di ricerca inseriti ({searchQuery}).
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedClass('all');
              setSelectedRoute('all');
            }}
            className="px-4 py-2 bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold rounded-xl hover:bg-teal-100 transition-colors cursor-pointer"
          >
            Azzera filtri di ricerca
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {medications.map((med) => (
            <div
              key={med.id || med.aic_code}
              onClick={() => setSelectedMedication(med)}
              className="bg-white rounded-3xl p-5 border border-[#E1E4E8] shadow-xs hover:shadow-md hover:border-teal-300 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Card Header badges */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    AIC: {med.aic_code}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {med.reimbursement_class && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getReimbursementBadge(
                          med.reimbursement_class
                        )}`}
                      >
                        Classe {med.reimbursement_class}
                      </span>
                    )}
                  </div>
                </div>

                {/* Drug Name & Active Ingredient */}
                <div>
                  <h3 className="text-base font-bold text-[#1A1C1E] group-hover:text-teal-700 transition-colors leading-tight">
                    {med.trade_name}
                  </h3>
                  {med.active_ingredient && (
                    <p className="text-xs font-medium text-slate-600 mt-0.5 line-clamp-1">
                      {med.active_ingredient}
                    </p>
                  )}
                </div>

                {/* Dosage & Packaging */}
                <div className="p-3 bg-slate-50 rounded-2xl space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Dosaggio / Forma:</span>
                    <span className="font-bold text-slate-900">
                      {med.dosage || ''} {med.pharma_form ? `• ${med.pharma_form}` : ''}
                    </span>
                  </div>
                  {med.package_desc && (
                    <div className="text-[11px] text-slate-600 line-clamp-1">
                      {med.package_desc}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                  <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 font-semibold border border-teal-200">
                    {med.admin_route || 'Orale'}
                  </span>
                  {med.atc_code && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono font-medium">
                      ATC: {med.atc_code}
                    </span>
                  )}
                  {med.prescription_regime && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {med.prescription_regime}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={(e) => handleCopyAic(med.aic_code, e)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-teal-700 transition-colors p-1"
                >
                  {copiedAic === med.aic_code ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copiato</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copia AIC</span>
                    </>
                  )}
                </button>

                <span className="text-teal-700 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Scheda AIFA &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedMedication && (
        <VademecumDetailModal
          medication={selectedMedication}
          onClose={() => setSelectedMedication(null)}
        />
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <AifaImportModal
          onClose={() => setIsImportModalOpen(false)}
          onImportCompleted={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
}
