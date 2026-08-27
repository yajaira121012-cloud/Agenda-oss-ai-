import React, { useState } from 'react';
import {
  Database,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Terminal,
  ExternalLink,
  Save,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SCHEMA_SQL } from '../../lib/schema-sql';
import { getSupabaseCredentials } from '../../lib/supabase';

export function SettingsView() {
  const { isConfigured, setCustomCredentials, clearCustomCredentials } = useAuth();

  const creds = getSupabaseCredentials();
  const [url, setUrl] = useState(creds.url || '');
  const [anonKey, setAnonKey] = useState(creds.anonKey || '');

  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      alert('Inserisci sia l’URL del progetto Supabase che la chiave anon/public.');
      return;
    }

    setCustomCredentials(url.trim(), anonKey.trim());
    setStatusMessage('Configurazione salvata con successo. Il client Supabase è stato reinizializzato.');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleReset = () => {
    if (confirm('Ripristinare le credenziali predefinite da .env?')) {
      clearCustomCredentials();
      const defaultCreds = getSupabaseCredentials();
      setUrl(defaultCreds.url || '');
      setAnonKey(defaultCreds.anonKey || '');
      setStatusMessage('Credenziali ripristinate.');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#E1E4E8] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1A1C1E]">Configurazione Database Supabase</h1>
            <p className="text-xs text-slate-500">
              Parametri di connessione cloud PostgreSQL, autenticazione Supabase Auth e schema SQL RLS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isConfigured ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Supabase Collegato
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-semibold">
              <AlertCircle className="w-3.5 h-3.5" />
              Non Configurato
            </span>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Supabase Keys Form */}
      <div className="bg-white rounded-3xl p-6 border border-[#E1E4E8] shadow-xs space-y-6">
        <div>
          <h2 className="text-sm font-bold text-[#1A1C1E] flex items-center gap-2">
            <Key className="w-4 h-4 text-teal-600" />
            Credenziali del Progetto (URL e Anon Key)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Puoi reperire questi parametri direttamente dalla dashboard del tuo progetto Supabase in <strong>Project Settings &gt; API</strong>.
          </p>
        </div>

        <form onSubmit={handleSaveCredentials} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project URL (VITE_SUPABASE_URL) *
            </label>
            <input
              type="url"
              required
              placeholder="https://xxxxxxxxxxxxxxxxxxxx.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-[#E1E4E8] rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Anon / Public API Key (VITE_SUPABASE_ANON_KEY) *
            </label>
            <input
              type="text"
              required
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-[#E1E4E8] rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Ripristina default
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              Salva e Applica
            </button>
          </div>
        </form>
      </div>

      {/* SQL Script Viewer and Instructions */}
      <div className="bg-white rounded-3xl p-6 border border-[#E1E4E8] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-[#1A1C1E] flex items-center gap-2">
              <Terminal className="w-4 h-4 text-teal-600" />
              Schema SQL Completo & Row Level Security (RLS)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Incolla ed esegui questo codice SQL nel <strong>SQL Editor</strong> del tuo progetto Supabase per creare tutte le 11 tabelle necessarie e attivare le policy di sicurezza.
            </p>
          </div>

          <button
            onClick={handleCopySql}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
              copied
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-white text-slate-700 border-[#E1E4E8] hover:bg-slate-50'
            }`}
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Copiato negli appunti!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                Copia Schema SQL
              </>
            )}
          </button>
        </div>

        <div className="relative">
          <pre className="bg-slate-900 text-teal-300 font-mono text-[11px] p-4 rounded-2xl overflow-x-auto max-h-72 border border-slate-800 leading-relaxed no-scrollbar">
            {SCHEMA_SQL}
          </pre>
        </div>
      </div>
    </div>
  );
}
