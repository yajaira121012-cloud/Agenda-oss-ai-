import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Car,
  Clock,
  ExternalLink,
  Loader2,
  AlertCircle,
  Edit3,
  CheckCircle2,
} from 'lucide-react';
import {
  openGoogleMapsRoute,
  calculateRouteDistanceAndTime,
  DistanceCalculationResult,
} from '../../lib/geoUtils';

interface PatientDomicileCardProps {
  address?: string | null;
  patientName: string;
  floorDoorbell?: string | null;
  onEditAddress?: () => void;
  className?: string;
  compact?: boolean;
}

export function PatientDomicileCard({
  address,
  patientName,
  floorDoorbell,
  onEditAddress,
  className = '',
  compact = false,
}: PatientDomicileCardProps) {
  const [calculating, setCalculating] = useState(false);
  const [openingRoute, setOpeningRoute] = useState(false);
  const [distanceResult, setDistanceResult] = useState<DistanceCalculationResult | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);

  const hasAddress = !!address && address.trim().length > 0;

  const handleOpenRoute = async () => {
    if (!hasAddress) return;
    setOpeningRoute(true);
    try {
      await openGoogleMapsRoute(address);
    } catch (err: any) {
      console.warn('Fallback opening Maps:', err);
    } finally {
      setOpeningRoute(false);
    }
  };

  const handleCalculateDistance = async () => {
    if (!hasAddress) return;
    setCalculating(true);
    setCalcError(null);
    setDistanceResult(null);

    try {
      const res = await calculateRouteDistanceAndTime(address);
      setDistanceResult(res);
    } catch (err: any) {
      console.warn('Distance calculation warning:', err);
      setCalcError('Per calcolare distanza e tempo apri il percorso in Google Maps.');
    } finally {
      setCalculating(false);
    }
  };

  if (!hasAddress) {
    return (
      <div
        className={`bg-amber-50/70 border border-amber-200 rounded-3xl p-5 sm:p-6 transition-all ${className}`}
      >
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-base">📍</span>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Domicilio</h3>
            </div>
            <p className="text-xs text-amber-800 font-medium mt-1">
              Indirizzo non inserito
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Aggiungi l'indirizzo di residenza per calcolare la distanza e avviare il navigatore.
            </p>

            {onEditAddress && (
              <button
                type="button"
                onClick={onEditAddress}
                className="mt-3.5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                Modifica indirizzo
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-3xl p-5 sm:p-6 border border-[#E1E4E8] shadow-xs relative overflow-hidden transition-all ${className}`}
    >
      {/* Header with Title and Edit */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold shrink-0">
            📍
          </div>
          <div>
            <h3 className="font-bold text-[#1A1C1E] text-sm sm:text-base">Domicilio</h3>
            <span className="text-[11px] text-slate-400 block">Destinazione visita domiciliare</span>
          </div>
        </div>

        {onEditAddress && (
          <button
            type="button"
            onClick={onEditAddress}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-700 bg-slate-50 hover:bg-teal-50 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Modifica indirizzo
          </button>
        )}
      </div>

      {/* Main Address Display Box */}
      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 my-3">
        <div className="flex items-start gap-2.5">
          <MapPin className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              {address}
            </p>
            {floorDoorbell && (
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                <span className="font-semibold text-slate-500">Piano / Citofono:</span> {floorDoorbell}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Calculated Distance and Time Panel */}
      {distanceResult && (
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 mb-4 animate-in fade-in duration-200">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Distanza dal paziente
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/90 p-3 rounded-xl border border-emerald-100 flex items-center gap-2.5">
              <span className="text-xl">🚗</span>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Distanza</span>
                <span className="text-base font-bold text-emerald-950">
                  {distanceResult.formattedDistance}
                </span>
              </div>
            </div>
            <div className="bg-white/90 p-3 rounded-xl border border-emerald-100 flex items-center gap-2.5">
              <span className="text-xl">⏱️</span>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Tempo stimato</span>
                <span className="text-base font-bold text-emerald-950">
                  {distanceResult.formattedDuration}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error or Fallback Notice */}
      {calcError && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 mb-4 text-xs text-slate-600 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>{calcError}</span>
        </div>
      )}

      {/* Action Buttons (Large, Touch-Friendly for Mobile & Desktop OSS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Button 1: Apri percorso in Google Maps */}
        <button
          type="button"
          onClick={handleOpenRoute}
          disabled={openingRoute}
          className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-sm shadow-xs transition-all cursor-pointer min-h-[48px]"
        >
          {openingRoute ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Apertura navigatore...
            </>
          ) : (
            <>
              <span className="text-base">🗺️</span>
              <span>Apri percorso</span>
              <ExternalLink className="w-4 h-4 ml-auto opacity-70" />
            </>
          )}
        </button>

        {/* Button 2: Calcola distanza dal dispositivo */}
        <button
          type="button"
          onClick={handleCalculateDistance}
          disabled={calculating}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold text-sm border border-slate-200 transition-all cursor-pointer min-h-[48px]"
        >
          {calculating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
              Rilevamento e calcolo...
            </>
          ) : (
            <>
              <span className="text-base">📍</span>
              <span>Calcola distanza</span>
            </>
          )}
        </button>
      </div>

      <div className="text-[10px] text-slate-400 mt-3 text-center flex items-center justify-center gap-1">
        <span>🔒</span>
        <span>Posizione GPS utilizzata solo sul dispositivo e mai memorizzata</span>
      </div>
    </div>
  );
}
