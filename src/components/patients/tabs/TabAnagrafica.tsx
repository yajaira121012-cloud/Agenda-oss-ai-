import React, { useState } from 'react';
import {
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileText,
  HeartHandshake,
  Edit2,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { Patient } from '../../../types';
import { updatePatient } from '../../../services/patientsService';
import { PatientDomicileCard } from '../PatientDomicileCard';

interface TabAnagraficaProps {
  patient: Patient;
  onPatientUpdated: (updated: Patient) => void;
}

export function TabAnagrafica({ patient, onPatientUpdated }: TabAnagraficaProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState(patient.first_name);
  const [lastName, setLastName] = useState(patient.last_name);
  const [birthDate, setBirthDate] = useState(patient.birth_date);
  const [gender, setGender] = useState(patient.gender);
  const [fiscalCode, setFiscalCode] = useState(patient.fiscal_code || '');
  const [phone, setPhone] = useState(patient.phone || '');
  const [email, setEmail] = useState(patient.email || '');
  const [address, setAddress] = useState(patient.address || '');
  const [notes, setNotes] = useState(patient.notes || '');

  // Emergency contact / relative
  const [emergencyName, setEmergencyName] = useState(patient.emergency_contact_name || '');
  const [emergencyRelation, setEmergencyRelation] = useState(patient.emergency_contact_relation || '');
  const [emergencyPhone, setEmergencyPhone] = useState(patient.emergency_contact_phone || '');
  const [emergencyFiscalCode, setEmergencyFiscalCode] = useState(patient.emergency_contact_fiscal_code || '');

  const calculateAge = (dateString: string): number => {
    const today = new Date();
    const birth = new Date(dateString);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data, error } = await updatePatient(patient.id, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        birth_date: birthDate,
        gender,
        fiscal_code: fiscalCode.trim().toUpperCase() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
        emergency_contact_name: emergencyName.trim() || undefined,
        emergency_contact_relation: emergencyRelation.trim() || undefined,
        emergency_contact_phone: emergencyPhone.trim() || undefined,
        emergency_contact_fiscal_code: emergencyFiscalCode.trim().toUpperCase() || undefined,
      });

      if (error) throw new Error(error);
      if (data) {
        onPatientUpdated(data);
        setIsEditing(false);
      }
    } catch (err: any) {
      alert(err.message || 'Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm">Modifica Dati Anagrafici Assistito</h3>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Annulla
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nome *</label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Cognome *</label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Sesso</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="F">Femmina (F)</option>
              <option value="M">Maschio (M)</option>
              <option value="other">Altro</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Codice Fiscale Assistito</label>
            <input
              type="text"
              maxLength={16}
              placeholder="es. RSSMRA45A01F205X"
              value={fiscalCode}
              onChange={(e) => setFiscalCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 text-xs sm:text-sm font-mono uppercase tracking-wider border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Data di Nascita *</label>
            <input
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Telefono</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Indirizzo Residenza</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Parente / Referente Familiare & Emergenza
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Nome e Cognome Parente</label>
              <input
                type="text"
                placeholder="es. Laura Ferrari"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Grado di Parentela</label>
              <input
                type="text"
                placeholder="es. Figlia, Coniuge, Tutore"
                value={emergencyRelation}
                onChange={(e) => setEmergencyRelation(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Telefono Parente</label>
              <input
                type="tel"
                placeholder="es. +39 347 1234567"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Codice Fiscale Parente</label>
              <input
                type="text"
                maxLength={16}
                placeholder="es. FRRLRA72T54F205Z"
                value={emergencyFiscalCode}
                onChange={(e) => setEmergencyFiscalCode(e.target.value.toUpperCase())}
                className="w-full px-2.5 py-1.5 text-xs font-mono uppercase tracking-wider border border-slate-300 rounded-lg bg-white"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Note Assistenziali & Preferenze</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl cursor-pointer shadow-xs disabled:opacity-50"
          >
            {saving ? 'Salvataggio...' : 'Salva Modifiche'}
          </button>
        </div>
      </form>
    );
  }

  const age = calculateAge(patient.birth_date);

  return (
    <div className="space-y-6">
      {/* Overview Details Grid */}
      <div className="bg-white rounded-3xl p-6 border border-[#E1E4E8] shadow-xs">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#F5F7F9]">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-[#1A1C1E] text-sm">Informazioni Anagrafiche & Recapiti</h3>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Modifica Dati
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
          <div>
            <span className="text-slate-400 block font-medium mb-1">Nome Completo</span>
            <span className="text-[#1A1C1E] font-bold text-sm">
              {patient.last_name} {patient.first_name}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium mb-1">Codice Fiscale Assistito</span>
            <span className="text-teal-900 font-mono font-bold text-xs bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 inline-block tracking-wider">
              {patient.fiscal_code || 'Non inserito'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium mb-1">Data di Nascita ed Età</span>
            <span className="text-[#1A1C1E] font-semibold">
              {new Date(patient.birth_date).toLocaleDateString('it-IT')} ({age} anni)
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium mb-1">Sesso</span>
            <span className="text-[#1A1C1E] font-semibold">
              {patient.gender === 'F' ? 'Femmina (F)' : patient.gender === 'M' ? 'Maschio (M)' : 'Altro'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium mb-1">Telefono Assistito</span>
            <span className="text-[#1A1C1E] font-semibold">
              {patient.phone || 'Non specificato'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium mb-1">Email Assistito</span>
            <span className="text-[#1A1C1E] font-semibold">
              {patient.email || 'Non specificata'}
            </span>
          </div>

          <div className="md:col-span-3">
            <span className="text-slate-400 block font-medium mb-1">Indirizzo Residenza / Domicilio</span>
            <span className="text-[#1A1C1E] font-semibold text-sm">
              {patient.address || 'Non specificato'}
            </span>
          </div>
        </div>
      </div>

      {/* Sezione Mappa e Domicilio */}
      <PatientDomicileCard
        address={patient.address}
        floorDoorbell={patient.floor_doorbell}
        patientName={`${patient.first_name} ${patient.last_name}`}
        onEditAddress={() => setIsEditing(true)}
      />

      {/* Emergency Contact & Relative Card */}
      <div className="bg-white rounded-3xl p-6 border border-[#E1E4E8] shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#F5F7F9]">
          <HeartHandshake className="w-5 h-5 text-rose-600" />
          <h3 className="font-bold text-[#1A1C1E] text-sm">Parente di Riferimento & Contatto d'Emergenza</h3>
        </div>

        {patient.emergency_contact_name || patient.emergency_contact_phone || patient.emergency_contact_fiscal_code ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs bg-rose-50/40 p-4 rounded-2xl border border-rose-100">
            <div>
              <span className="text-slate-500 block font-medium mb-1">Nome Referente Parente</span>
              <span className="text-[#1A1C1E] font-bold text-sm">{patient.emergency_contact_name || 'N.D.'}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium mb-1">Grado di Parentela</span>
              <span className="text-[#1A1C1E] font-semibold">{patient.emergency_contact_relation || 'Referente familiare'}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium mb-1">Telefono Urgenze</span>
              <span className="text-rose-700 font-bold font-mono text-sm">{patient.emergency_contact_phone || 'N.D.'}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium mb-1">Codice Fiscale Parente</span>
              <span className="text-slate-800 font-mono font-bold text-xs bg-white px-2 py-0.5 rounded border border-rose-200 inline-block tracking-wider">
                {patient.emergency_contact_fiscal_code || 'Non inserito'}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 italic py-2">
            Nessun parente di riferimento registrato. Modifica la scheda per inserire i dati del familiare.
          </div>
        )}
      </div>

      {/* General Notes Card */}
      <div className="bg-white rounded-3xl p-6 border border-[#E1E4E8] shadow-xs">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#F5F7F9]">
          <FileText className="w-5 h-5 text-slate-600" />
          <h3 className="font-bold text-[#1A1C1E] text-sm">Note Assistenziali & Preferenze</h3>
        </div>
        <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
          {patient.notes || 'Nessuna nota registrata.'}
        </p>
      </div>
    </div>
  );
}
