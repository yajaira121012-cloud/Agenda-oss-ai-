import React, { useState } from 'react';
import {
  User,
  Save,
  CheckCircle2,
  AlertCircle,
  Phone,
  Briefcase,
  MapPin,
  Home,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function ProfileView() {
  const { user, profile, updateCurrentProfile } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name || 'Yajaira');
  const [qualification, setQualification] = useState(
    profile?.qualification || 'Operatore Socio-Sanitario (OSS)'
  );
  const [department, setDepartment] = useState(
    profile?.department || 'Assistenza Domiciliare (ADI) - Territorio'
  );
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert('Inserisci il tuo Nome e Cognome');
      return;
    }

    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const { error } = await updateCurrentProfile({
        full_name: fullName.trim(),
        qualification: qualification.trim(),
        department: department.trim() || undefined,
        phone: phone.trim() || undefined,
      });

      if (error) throw new Error(error);

      setSuccessMessage('Profilo operatore aggiornato e salvato con successo!');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const displayName = profile?.full_name || fullName || 'Yajaira';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-[#E1E4E8] shadow-xs flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-2xl shadow-xs">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#1A1C1E]">{displayName}</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 font-semibold border border-teal-200">
              Operatore Socio-Sanitario
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <span>{user?.email || 'yajaira121012@gmail.com'}</span>
            {phone && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <Phone className="w-3 h-3 text-teal-600" />
                  {phone}
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-[#E1E4E8] shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-[#F5F7F9]">
          <User className="w-5 h-5 text-teal-600" />
          <h2 className="text-sm font-bold text-[#1A1C1E]">Modifica Nome, Cognome & Recapito Telefonico</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nome e Cognome *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="es. Yajaira Rossi"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-[#E1E4E8] rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Recapito Telefonico Personale / Di Turno
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="es. 340 1234567"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-[#E1E4E8] rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Qualifica Professionale
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="es. Operatore Socio-Sanitario (OSS) / OSSS"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-[#E1E4E8] rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Servizio / Territorio / Settore
            </label>
            <div className="relative">
              <Home className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="es. Assistenza Domiciliare (ADI) - Cure Domiciliari"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-[#E1E4E8] rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-[#F5F7F9]">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvataggio in corso...' : 'Salva Modifiche Profilo'}
          </button>
        </div>
      </form>
    </div>
  );
}
