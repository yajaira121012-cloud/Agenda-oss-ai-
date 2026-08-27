import React, { useState, useEffect } from 'react';
import {
  Printer,
  X,
  FileText,
  User,
  HeartPulse,
  Pill,
  Activity,
  Utensils,
  Droplets,
  Layers,
  Accessibility,
  BookOpen,
  Calendar,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { localDb } from '../../lib/localDb';

interface PatientFullDossierModalProps {
  patientId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PatientFullDossierModal({
  patientId,
  isOpen,
  onClose,
}: PatientFullDossierModalProps) {
  const [dossier, setDossier] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && patientId) {
      setLoading(true);
      const data = localDb.getFullPatientDossier(patientId);
      setDossier(data);
      setLoading(false);
    }
  }, [isOpen, patientId]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const patient = dossier?.patient;
  const conditions = dossier?.conditions || [];
  const aids = dossier?.aids || [];
  const sensory = dossier?.sensory;
  const vitals = dossier?.vitals || [];
  const medications = dossier?.medications || [];
  const foodHydration = dossier?.foodHydration || [];
  const bowelRecords = dossier?.bowelRecords || [];
  const catheterRecords = dossier?.catheterRecords || [];
  const woundRecords = dossier?.woundRecords || [];
  const diary = dossier?.diary || [];
  const appointments = dossier?.appointments || [];

  const calculateAge = (dateString?: string): number => {
    if (!dateString) return 0;
    const today = new Date();
    const birth = new Date(dateString);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden border border-[#E1E4E8] print:max-h-none print:shadow-none print:border-none print:rounded-none print:w-full print:max-w-none">
        {/* MODAL ACTION BAR (Hidden in print) */}
        <div className="p-4 sm:p-5 border-b border-[#E1E4E8] flex items-center justify-between bg-slate-50 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">
                Cartella Clinico-Assistenziale Integrata (Completa)
              </h2>
              <p className="text-xs text-slate-500">
                Visualizzazione e Stampa/PDF di tutti i moduli dell'assistito
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Stampa / Salva in PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE DOSSIER CONTENT */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 space-y-8 print:p-0 print:overflow-visible print:space-y-6 text-slate-800 text-xs">
          {loading || !patient ? (
            <div className="p-12 text-center text-slate-400">Caricamento cartella clinica...</div>
          ) : (
            <>
              {/* DOSSIER HEADER (Institutional Header) */}
              <div className="border-b-2 border-slate-900 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[10px] font-bold tracking-widest text-teal-800 uppercase">
                      Servizio Sanitario Regionale / Assistenza Domiciliare Integrata (ADI)
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                      CARTELLA ASSISTENZIALE & CLINICA DOMICILIARE
                    </h1>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Dossier Informatizzato Operatore Socio Sanitario (OSS)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-mono font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-300 inline-block">
                      CODICE: {patient.internal_code}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Emesso il: {new Date().toLocaleDateString('it-IT')} ore {new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>

              {/* 1. DATI ANAGRAFICI E CONTATTI */}
              <section className="space-y-3">
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-teal-600 flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-700" />
                  1. Dati Anagrafici & Recapiti Assistito
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Cognome e Nome</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {patient.last_name} {patient.first_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Codice Fiscale</span>
                    <span className="font-mono font-bold text-slate-800">{patient.fiscal_code || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Data di Nascita (Età)</span>
                    <span className="text-slate-800">
                      {new Date(patient.birth_date).toLocaleDateString('it-IT')} ({calculateAge(patient.birth_date)} anni)
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Sesso & Stato</span>
                    <span className="text-slate-800">
                      {patient.gender === 'F' ? 'Femmina' : 'Maschio'} •{' '}
                      <strong className="text-teal-700">{patient.status === 'active' ? 'Attivo' : patient.status}</strong>
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Indirizzo Domicilio</span>
                    <span className="text-slate-800">{patient.address || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Telefono Assistito</span>
                    <span className="font-mono text-slate-800">{patient.phone || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Referente Emergenza</span>
                    <span className="text-slate-800">
                      {patient.emergency_contact_name} ({patient.emergency_contact_relation}) -{' '}
                      <strong className="font-mono">{patient.emergency_contact_phone}</strong>
                    </span>
                  </div>
                </div>
              </section>

              {/* 2. PIANO ASSISTENZIALE DOMICILIARE */}
              <section className="space-y-3">
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-teal-600 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-700" />
                  2. Piano Assistenziale Domiciliare & Orari Turno
                </h3>
                <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">FASCIA ORARIA ACCESSO</span>
                      <span className="font-bold text-teal-900 font-mono">
                        {patient.visit_start_time || '08:00'} - {patient.visit_end_time || '10:00'} ({patient.visit_duration_hours || 2} ore)
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">GIORNI DI VISITA</span>
                      <span className="font-semibold text-slate-800">
                        {patient.visit_days?.join(', ') || 'Tutti i giorni'}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] text-slate-400 font-bold block">NOTE ACCESSO / CITOFONO</span>
                      <span className="text-slate-700">{patient.floor_doorbell || '—'}</span>
                    </div>
                  </div>
                  {patient.domiciliary_notes && (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold block">CONSEGNE & ISTRUZIONI DOMICILIARI</span>
                      <p className="text-slate-800 text-xs mt-0.5">{patient.domiciliary_notes}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* 3. ANAMNESI & PATOLOGIE */}
              <section className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-teal-600 flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-teal-700" />
                  3. Anamnesi Patologica & Allergie
                </h3>
                {conditions.length === 0 ? (
                  <div className="text-slate-400 italic">Nessuna patologia cronica registrata.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {conditions.map((c: any) => (
                      <div key={c.id} className="p-2.5 bg-white border border-slate-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{c.condition_name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {c.category}
                          </span>
                        </div>
                        {c.notes && <p className="text-[11px] text-slate-600 mt-1">{c.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* 4. TERAPIA FARMACOLOGICA (AIFA) */}
              <section className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-teal-600 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-teal-700" />
                  4. Schema Terapeutico Farmacologico (Farmaci Prescritti)
                </h3>
                {medications.length === 0 ? (
                  <div className="text-slate-400 italic">Nessun farmaco attivo registrato.</div>
                ) : (
                  <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                        <th className="p-2">Farmaco / Principio Attivo</th>
                        <th className="p-2">AIC</th>
                        <th className="p-2">Dosaggio & Via</th>
                        <th className="p-2">Orari Somministrazione</th>
                        <th className="p-2">Indicazione & Note</th>
                        <th className="p-2">Stato</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {medications.map((m: any) => (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="p-2">
                            <span className="font-bold text-slate-900 block">{m.drug_name}</span>
                            <span className="text-[10px] text-slate-500">{m.active_ingredient}</span>
                          </td>
                          <td className="p-2 font-mono text-[11px]">{m.aic_code || '—'}</td>
                          <td className="p-2">
                            {m.dosage} {m.unit} ({m.route || 'Orale'})
                          </td>
                          <td className="p-2 font-mono font-bold text-teal-800">
                            {m.scheduled_times?.join(' – ') || m.timing_time || '—'}
                          </td>
                          <td className="p-2 text-[11px] text-slate-700">
                            <div>{m.indication || '—'}</div>
                            {m.notes && <div className="text-slate-500 italic text-[10px]">{m.notes}</div>}
                          </td>
                          <td className="p-2 font-bold text-[10px]">
                            <span
                              className={`px-2 py-0.5 rounded ${
                                m.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {m.status === 'active' ? 'ATTIVO' : m.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>

              {/* 5. MONITORAGGIO PARAMETRI VITALI */}
              <section className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-teal-600 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-700" />
                  5. Ultime Rilevazioni Parametri Vitali
                </h3>
                {vitals.length === 0 ? (
                  <div className="text-slate-400 italic">Nessun parametro rilevato.</div>
                ) : (
                  <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                        <th className="p-2">Data & Ora</th>
                        <th className="p-2">Pressione (PA)</th>
                        <th className="p-2">FC (bpm)</th>
                        <th className="p-2">SpO2 (%)</th>
                        <th className="p-2">Temp (°C)</th>
                        <th className="p-2">Glicemia (mg/dl)</th>
                        <th className="p-2">Dolore (NRS)</th>
                        <th className="p-2">Operatore</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {vitals.slice(0, 5).map((v: any) => (
                        <tr key={v.id}>
                          <td className="p-2 whitespace-nowrap font-bold">
                            {new Date(v.recorded_at).toLocaleDateString('it-IT')}{' '}
                            {new Date(v.recorded_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-2 font-mono">
                            {v.blood_pressure_systolic ? `${v.blood_pressure_systolic}/${v.blood_pressure_diastolic} mmHg` : '—'}
                          </td>
                          <td className="p-2 font-mono">{v.heart_rate ? `${v.heart_rate} bpm` : '—'}</td>
                          <td className="p-2 font-mono">{v.oxygen_saturation ? `${v.oxygen_saturation} %` : '—'}</td>
                          <td className="p-2 font-mono">{v.temperature ? `${v.temperature} °C` : '—'}</td>
                          <td className="p-2 font-mono">{v.blood_glucose ? `${v.blood_glucose} mg/dl` : '—'}</td>
                          <td className="p-2">{v.pain_scale !== undefined ? `${v.pain_scale}/10` : '—'}</td>
                          <td className="p-2 text-slate-500">{v.operator_name || 'OSS'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>

              {/* 6. ALIMENTAZIONE E DIARIO IDRICO */}
              <section className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-teal-600 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-teal-700" />
                  6. Alimentazione & Bilancio Idrico
                </h3>
                {foodHydration.length === 0 ? (
                  <div className="text-slate-400 italic">Nessun diario alimentare registrato.</div>
                ) : (
                  <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                        <th className="p-2">Data & Pasto</th>
                        <th className="p-2">Alimenti Assunti</th>
                        <th className="p-2">Quantità Consumata</th>
                        <th className="p-2">Liquidi Introdotti (ml)</th>
                        <th className="p-2">Deglutizione / Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {foodHydration.slice(0, 5).map((f: any) => (
                        <tr key={f.id}>
                          <td className="p-2 whitespace-nowrap font-bold">
                            {new Date(f.recorded_at).toLocaleDateString('it-IT')} ({f.meal_type})
                          </td>
                          <td className="p-2">{f.food_items || 'Pasto standard'}</td>
                          <td className="p-2">{f.amount_eaten || 'Totale'}</td>
                          <td className="p-2 font-mono font-bold text-teal-800">{f.water_intake_ml ? `${f.water_intake_ml} ml` : '—'}</td>
                          <td className="p-2 text-slate-600">{f.notes || 'Regolare'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>

              {/* 7. ALBO DELLE SCARICHE & MONITORAGGIO ALVO */}
              <section className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-teal-600 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-700" />
                  7. Albo delle Scariche / Monitoraggio dell'Alvo & Clisteri
                </h3>
                {bowelRecords.length === 0 ? (
                  <div className="text-slate-400 italic">Nessuna registrazione dell'alvo.</div>
                ) : (
                  <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                        <th className="p-2">Data & Ora</th>
                        <th className="p-2">Esito Evacuazione</th>
                        <th className="p-2">Scala di Bristol</th>
                        <th className="p-2">Quantità & Metodo</th>
                        <th className="p-2">Addome & Note</th>
                        <th className="p-2">Operatore</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {bowelRecords.slice(0, 6).map((b: any) => (
                        <tr key={b.id}>
                          <td className="p-2 whitespace-nowrap font-bold">
                            {new Date(b.recorded_at).toLocaleDateString('it-IT')}{' '}
                            {new Date(b.recorded_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-2">
                            {b.evacuated ? (
                              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                                ✓ SCARICA AVVENUTA
                              </span>
                            ) : (
                              <span className="font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded">
                                ✗ ALVO CHIUSO / ASSENTE
                              </span>
                            )}
                          </td>
                          <td className="p-2">{b.bristol_type ? `Tipo ${b.bristol_type}` : '—'}</td>
                          <td className="p-2">
                            {b.amount || 'Normale'} {b.intervention ? `(${b.intervention.replace('_', ' ')})` : ''}
                          </td>
                          <td className="p-2 text-slate-600">
                            {b.abdominal_state ? `Addome ${b.abdominal_state.replace('_', ' ')}. ` : ''}
                            {b.notes || ''}
                          </td>
                          <td className="p-2 text-slate-500">{b.operator_name || 'OSS'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>

              {/* 8. CATETERE VESCICALE & DIURESI */}
              <section className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-teal-600 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-teal-700" />
                  8. Catetere Vescicale & Controllo Diuresi
                </h3>
                {catheterRecords.length === 0 ? (
                  <div className="text-slate-400 italic">Nessun dato catetere registrato.</div>
                ) : (
                  <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                        <th className="p-2">Data & Ora</th>
                        <th className="p-2">Presidio & Calibro</th>
                        <th className="p-2">Diuresi (ml)</th>
                        <th className="p-2">Urine (Colore / Aspetto)</th>
                        <th className="p-2">Pervietà & Igiene</th>
                        <th className="p-2">Scadenza Sostituzione</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {catheterRecords.slice(0, 4).map((c: any) => (
                        <tr key={c.id}>
                          <td className="p-2 whitespace-nowrap font-bold">
                            {new Date(c.recorded_at).toLocaleDateString('it-IT')}
                          </td>
                          <td className="p-2 font-medium">
                            {c.has_catheter ? `${c.gauge_ch || 'Ch 16'} (${c.material?.replace('_100', '') || 'Silicone'})` : 'Assente'}
                          </td>
                          <td className="p-2 font-mono font-bold">{c.diuresis_amount_ml ? `${c.diuresis_amount_ml} ml / ${c.diuresis_hours || 24}h` : '—'}</td>
                          <td className="p-2">
                            {c.urine_color?.replace('_', ' ')} ({c.urine_aspect?.replace('_', ' ') || 'Limpido'})
                          </td>
                          <td className="p-2">
                            {c.patency_check === 'pervio_normale' ? 'Pervio' : c.patency_check}
                            {c.meatus_hygiene_done ? ' • Igiene ok' : ''}
                          </td>
                          <td className="p-2 font-bold text-teal-800">
                            {c.next_replacement_date ? new Date(c.next_replacement_date).toLocaleDateString('it-IT') : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>

              {/* 9. CONTROLLO MEDICAZIONI & LESIONI DA DECUBITO */}
              <section className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-teal-600 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-700" />
                  9. Controllo Medicazioni & Scheda Lesioni da Decubito (LDD)
                </h3>
                {woundRecords.length === 0 ? (
                  <div className="text-slate-400 italic">Nessuna lesione o medicazione attiva registrata.</div>
                ) : (
                  <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                        <th className="p-2">Data Medicazione</th>
                        <th className="p-2">Sede & Tipologia</th>
                        <th className="p-2">Stadio & Dimensioni</th>
                        <th className="p-2">Medicazione Applicata</th>
                        <th className="p-2">Prossimo Cambio</th>
                        <th className="p-2">Note di Guarigione</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {woundRecords.slice(0, 4).map((w: any) => (
                        <tr key={w.id}>
                          <td className="p-2 whitespace-nowrap font-bold">
                            {new Date(w.recorded_at).toLocaleDateString('it-IT')}
                          </td>
                          <td className="p-2">
                            <span className="font-bold">{w.custom_site_desc || w.anatomical_site}</span>
                            <span className="block text-[10px] text-slate-500">{w.wound_type?.replace('_', ' ')}</span>
                          </td>
                          <td className="p-2">
                            <span className="font-semibold">{w.stage?.replace('_', ' ')}</span>
                            {w.dimensions_cm && <span className="block font-mono text-[10px]">{w.dimensions_cm}</span>}
                          </td>
                          <td className="p-2 font-medium text-slate-800">{w.dressing_applied}</td>
                          <td className="p-2 font-bold text-indigo-700">
                            {w.next_dressing_date ? new Date(w.next_dressing_date).toLocaleDateString('it-IT') : '—'}
                          </td>
                          <td className="p-2 text-slate-600 text-[11px] max-w-xs">{w.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>

              {/* 10. MOBILITA, AUSILI E SENSORIALITA */}
              <section className="space-y-3">
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-teal-600 flex items-center gap-2">
                  <Accessibility className="w-4 h-4 text-teal-700" />
                  10. Mobilità, Ausili in Uso & Sensorialità
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-800 block mb-1">Ausili di Deambulazione & Presidi:</span>
                    {aids.length === 0 ? (
                      <span className="text-slate-400 italic">Nessun ausilio registrato.</span>
                    ) : (
                      <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                        {aids.map((a: any) => (
                          <li key={a.id}>
                            <strong>{a.aid_name}</strong> ({a.category})
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-800 block mb-1">Stato Sensoriale & Protesi:</span>
                    {sensory ? (
                      <div className="space-y-0.5 text-slate-700">
                        <div>Vista: {sensory.sight_status || 'Normale'} {sensory.uses_glasses ? '(Usa Occhiali)' : ''}</div>
                        <div>Udito: {sensory.hearing_status || 'Normale'} {sensory.uses_hearing_aid ? '(Apparecchio acustico)' : ''}</div>
                        <div>Linguaggio: {sensory.speech_status || 'Normale'}</div>
                        {sensory.denture_status && <div>Protesi dentaria: {sensory.denture_status}</div>}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Nessun dato registrato.</span>
                    )}
                  </div>
                </div>
              </section>

              {/* 11. ULTIME CONSEGNE DIARIO ASSISTENZIALE */}
              <section className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded-lg border-l-4 border-teal-600 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-teal-700" />
                  11. Diario Assistenziale & Consegne di Turno Recenti
                </h3>
                {diary.length === 0 ? (
                  <div className="text-slate-400 italic">Nessuna consegna registrata.</div>
                ) : (
                  <div className="space-y-2">
                    {diary.slice(0, 3).map((d: any) => (
                      <div key={d.id} className="p-2.5 bg-white border border-slate-200 rounded-lg">
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
                          <span>
                            {new Date(d.recorded_at).toLocaleDateString('it-IT')}{' '}
                            {new Date(d.recorded_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="font-bold uppercase text-teal-800">{d.category}</span>
                        </div>
                        <p className="text-slate-800 font-medium mt-1">{d.description}</p>
                        {d.notes && <p className="text-slate-500 text-[11px] mt-0.5">{d.notes}</p>}
                        <div className="text-[10px] text-right text-slate-400 mt-1">
                          Firmato: {d.operator_name || 'Operatore OSS'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* FIRME E CONVALIDA CARTELLE CLINICA */}
              <div className="pt-8 border-t-2 border-slate-300 grid grid-cols-3 gap-6 text-center text-xs">
                <div>
                  <div className="border-b border-slate-400 h-10 mb-1"></div>
                  <span className="font-bold text-slate-800 block">Firma Operatore OSS</span>
                  <span className="text-[10px] text-slate-400">Compilatore della scheda</span>
                </div>
                <div>
                  <div className="border-b border-slate-400 h-10 mb-1"></div>
                  <span className="font-bold text-slate-800 block">Firma Medico Curante (MMG)</span>
                  <span className="text-[10px] text-slate-400">Prescrizione e presa visione</span>
                </div>
                <div>
                  <div className="border-b border-slate-400 h-10 mb-1"></div>
                  <span className="font-bold text-slate-800 block">Firma Assistito / Caregiver</span>
                  <span className="text-[10px] text-slate-400">Consenso e presa visione</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
