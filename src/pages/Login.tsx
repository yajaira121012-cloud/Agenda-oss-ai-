import React, { useState } from 'react';
import {
  Stethoscope,
  Lock,
  Mail,
  UserCheck,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Database,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSupabaseCredentials, saveSupabaseConfig } from '../lib/supabase';

interface LoginProps {
  onSuccess?: () => void;
}

export function Login({ onSuccess }: LoginProps) {
  const { signIn, signUp, signInDemo, isConfigured, checkConfiguration } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('yajaira121012@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [fullName, setFullName] = useState('Yajaira');
  const [qualification, setQualification] = useState('Operatore Socio-Sanitario (OSS)');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showEmailConfirmHelp, setShowEmailConfirmHelp] = useState(false);

  // Modal for configuring Supabase credentials if not set via .env
  const [showConfigModal, setShowConfigModal] = useState(false);
  const currentCreds = getSupabaseCredentials();
  const [configUrl, setConfigUrl] = useState(currentCreds.url);
  const [configKey, setConfigKey] = useState(currentCreds.anonKey);
  const [configSuccess, setConfigSuccess] = useState(false);

  const openConfigModal = () => {
    const creds = getSupabaseCredentials();
    setConfigUrl(creds.url);
    setConfigKey(creds.anonKey);
    setShowConfigModal(true);
  };

  const handleQuickEnter = () => {
    signInDemo('Yajaira', 'Operatore Socio-Sanitario (OSS)');
    if (onSuccess) onSuccess();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setShowEmailConfirmHelp(false);

    if (!email.trim() || !password) {
      setErrorMessage('Inserisci sia email che password');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email.trim(), password);
        if (error) {
          const msg = error.message || '';
          if (msg.toLowerCase().includes('email not confirmed') || msg.toLowerCase().includes('email_not_confirmed')) {
            setErrorMessage('Email non ancora confermata su Supabase.');
            setShowEmailConfirmHelp(true);
          } else if (msg.toLowerCase().includes('invalid login credentials') || msg.toLowerCase().includes('invalid_credentials')) {
            setErrorMessage('Credenziali non valide o utente non ancora registrato. Se è il tuo primo accesso, seleziona la scheda "Nuovo Operatore" per creare l\'account.');
          } else {
            setErrorMessage(error.message || 'Errore durante l\'autenticazione.');
          }
        } else {
          if (onSuccess) onSuccess();
        }
      } else {
        if (!fullName.trim()) {
          setErrorMessage('Inserisci il tuo nome e cognome per il profilo');
          setLoading(false);
          return;
        }

        const { error } = await signUp(email.trim(), password, fullName.trim(), qualification);
        if (error) {
          setErrorMessage(error.message || 'Errore durante la registrazione.');
        } else {
          setSuccessMessage(
            'Registrazione completata! Se la conferma email è attiva su Supabase, controlla la tua posta oppure disattiva la conferma email nel pannello Supabase.'
          );
          setMode('login');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Si è verificato un errore imprevisto durante l\'accesso');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configUrl.trim() || !configKey.trim()) {
      setErrorMessage('Compila sia URL che Chiave Anonima di Supabase');
      return;
    }

    saveSupabaseConfig(configUrl.trim(), configKey.trim());
    checkConfiguration();
    setConfigSuccess(true);
    setTimeout(() => {
      setShowConfigModal(false);
      setConfigSuccess(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F5F7F9] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* App Logo */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-xs">
            <Stethoscope className="w-8 h-8" />
          </div>
        </div>

        <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-[#1A1C1E]">
          Agenda <span className="text-teal-600">OSS</span>
        </h1>
        <p className="mt-1 text-center text-xs text-slate-500">
          Cartella socio-sanitaria, diario assistenziale e rilevazione parametri
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Main Login Card */}
        <div className="bg-white py-8 px-6 border border-[#E1E4E8] rounded-3xl shadow-xs sm:px-10">
          {/* Mode Switcher */}
          <div className="flex rounded-2xl bg-slate-100 p-1 mb-6">
            <button
              type="button"
              id="tab-login"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Accedi
            </button>
            <button
              type="button"
              id="tab-register"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Nuovo Operatore
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div
              id="auth-error-alert"
              className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex flex-col gap-2"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>

              {showEmailConfirmHelp && (
                <div className="mt-2 pt-2 border-t border-rose-200 text-[11px] text-rose-700 space-y-1.5">
                  <p className="font-semibold">Perché succede?</p>
                  <p>
                    Supabase invia un link di conferma che punta a <code className="bg-rose-100 px-1 py-0.5 rounded">localhost</code> anziché al tuo indirizzo.
                  </p>
                  <p className="font-semibold pt-1">Come risolvere:</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Apri Supabase &rarr; <strong>Authentication</strong> &rarr; <strong>Providers</strong> &rarr; <strong>Email</strong>.</li>
                    <li>Disattiva l'opzione <strong>Confirm email</strong> e premi <em>Save</em>.</li>
                    <li>Torna qui e potrai accedere subito senza attesa!</li>
                  </ol>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleQuickEnter}
                      className="w-full py-1.5 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-center transition-colors cursor-pointer"
                    >
                      Entra subito come Yajaira (OSS) &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div
              id="auth-success-alert"
              className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {/* Auth Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nome e Cognome Operatore *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-fullname"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="es. Mario Rossi"
                      className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-[#E1E4E8] rounded-xl text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Qualifica Professionale
                  </label>
                  <select
                    id="reg-qualification"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="block w-full px-3.5 py-2.5 bg-slate-50 border border-[#E1E4E8] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="Operatore Socio-Sanitario (OSS)">Operatore Socio-Sanitario (OSS)</option>
                    <option value="OSS con Formazione Complementare (3S)">OSS con Formazione Complementare (3S)</option>
                    <option value="Operatore Socio-Assistenziale (OSA)">Operatore Socio-Assistenziale (OSA)</option>
                    <option value="Infermiera / Infermiere">Infermiera / Infermiere</option>
                    <option value="Coordinatore Assistenziale / RAA">Coordinatore Assistenziale / RAA</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Indirizzo Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operatore@struttura.it"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-[#E1E4E8] rounded-xl text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-[#E1E4E8] rounded-xl text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="pt-2 space-y-2.5">
              <button
                id="login-submit-button"
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl shadow-xs text-xs sm:text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Autenticazione in corso...</span>
                  </span>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Accedi all\'Agenda OSS' : 'Registra Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                id="demo-login-button"
                type="button"
                onClick={handleQuickEnter}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 focus:outline-none transition-colors cursor-pointer"
              >
                <span>Accesso Immediato Diretto (Yajaira - OSS)</span>
              </button>
            </div>
          </form>

          {/* Supabase Status in Footer */}
          <div className="mt-6 pt-5 border-t border-[#E1E4E8] flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-500" />
              <span>Supabase DB:</span>
              <strong className="text-emerald-700 font-semibold">
                Connesso
              </strong>
            </div>
            <button
              type="button"
              onClick={openConfigModal}
              className="text-teal-600 font-semibold hover:underline cursor-pointer"
            >
              Impostazioni
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span>Accesso protetto con crittografia Supabase Auth & RLS</span>
        </div>
      </div>

      {/* Supabase Connection Setup Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-[#E1E4E8]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#1A1C1E] text-base">Configurazione Database Supabase</h3>
                <p className="text-xs text-slate-500">Inserisci URL e Chiave Anonima del tuo progetto Supabase</p>
              </div>
            </div>

            {configSuccess && (
              <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Configurazione salvata con successo!
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  VITE_SUPABASE_URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://xyzcompany.supabase.co"
                  value={configUrl}
                  onChange={(e) => setConfigUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-[#E1E4E8] rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Definito nel file .env o modificabile qui
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  VITE_SUPABASE_ANON_KEY
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={configKey}
                  onChange={(e) => setConfigKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-[#E1E4E8] rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Chiave anon/public da Supabase Dashboard &rarr; Project Settings &rarr; API
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#F5F7F9]">
                {isConfigured && (
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Annulla
                  </button>
                )}
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl cursor-pointer shadow-xs transition-colors"
                >
                  Salva e Applica
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
