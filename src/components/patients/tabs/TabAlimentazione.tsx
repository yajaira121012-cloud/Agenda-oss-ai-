import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Plus,
  Trash2,
  Droplet,
  Coffee,
  Sun,
  Moon,
  Cookie,
  AlertCircle,
  CheckCircle2,
  X,
  GlassWater,
} from 'lucide-react';
import { FoodRecord, MealType, FoodIntakeLevel } from '../../../types';
import {
  getFoodRecordsByPatient,
  createFoodRecord,
  deleteFoodRecord,
} from '../../../services/foodService';
import { useAuth } from '../../../context/AuthContext';

interface TabAlimentazioneProps {
  patientId: string;
}

export function TabAlimentazione({ patientId }: TabAlimentazioneProps) {
  const { user, profile } = useAuth();
  const [records, setRecords] = useState<FoodRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const now = new Date();
  const [recordDate, setRecordDate] = useState(now.toISOString().slice(0, 10));
  const [recordTime, setRecordTime] = useState(now.toTimeString().slice(0, 5));
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [foodIntake, setFoodIntake] = useState<FoodIntakeLevel>('all');
  const [liquidMl, setLiquidMl] = useState<string>('250');
  const [dietType, setDietType] = useState('Normale');
  const [notes, setNotes] = useState('');

  const loadRecords = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data, error } = await getFoodRecordsByPatient(patientId);
      if (error) {
        setErrorMessage(error);
      } else {
        setRecords(data || []);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Errore nel recupero alimentazione');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [patientId]);

  const handleOpenAdd = (type: MealType = 'lunch') => {
    const curNow = new Date();
    setRecordDate(curNow.toISOString().slice(0, 10));
    setRecordTime(curNow.toTimeString().slice(0, 5));
    setMealType(type);
    setFoodIntake('all');
    setLiquidMl(type === 'hydration' ? '200' : '250');
    setDietType('Normale');
    setNotes('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const fullTimestamp = new Date(`${recordDate}T${recordTime}:00`).toISOString();
    const operatorName = profile?.full_name || user?.email?.split('@')[0] || 'Operatore OSS';

    try {
      const { error } = await createFoodRecord({
        patient_id: patientId,
        recorded_at: fullTimestamp,
        meal_type: mealType,
        food_intake_level: foodIntake,
        liquid_ml: liquidMl ? parseInt(liquidMl, 10) : null,
        diet_type: dietType.trim() || 'Normale',
        notes: notes.trim() || undefined,
        recorded_by: user?.id,
        operator_name: operatorName,
      });

      if (error) throw new Error(error);

      setModalOpen(false);
      loadRecords();
    } catch (err: any) {
      alert(err.message || 'Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Eliminare questa registrazione alimentare?')) {
      const { success, error } = await deleteFoodRecord(id);
      if (success) {
        loadRecords();
      } else {
        alert(error || 'Errore nella cancellazione');
      }
    }
  };

  const mealLabels: Record<MealType, { label: string; icon: typeof Utensils; color: string }> = {
    breakfast: { label: 'Colazione', icon: Coffee, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    lunch: { label: 'Pranzo', icon: Sun, color: 'bg-orange-50 text-orange-700 border-orange-200' },
    dinner: { label: 'Cena', icon: Moon, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    snack: { label: 'Spuntino / Merenda', icon: Cookie, color: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
    hydration: { label: 'Idratazione (Liquidi)', icon: GlassWater, color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  };

  const intakeLabels: Record<FoodIntakeLevel, { label: string; color: string }> = {
    all: { label: 'Consumato Tutto (100%)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    almost_all: { label: 'Consumato Quasi Tutto (75%)', color: 'text-teal-700 bg-teal-50 border-teal-200' },
    half: { label: 'Consumata Metà (50%)', color: 'text-amber-700 bg-amber-50 border-amber-200' },
    little: { label: 'Consumato Poco (< 25%)', color: 'text-orange-700 bg-orange-50 border-orange-200' },
    refused: { label: 'Rifiutato / Digiuno', color: 'text-rose-700 bg-rose-50 border-rose-200 font-bold' },
  };

  // Calculate today's total hydration
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayHydration = records
    .filter((r) => r.recorded_at.startsWith(todayStr) && r.liquid_ml)
    .reduce((sum, r) => sum + (r.liquid_ml || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Diario Alimentare & Monitoraggio Idratazione</h3>
          <p className="text-xs text-slate-500">
            Registrazione pasti, quantitativi assunti, consistenza dieta e apporto idrico giornaliero
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenAdd('hydration')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-50 text-cyan-800 border border-cyan-200 text-xs font-semibold hover:bg-cyan-100 transition-colors cursor-pointer"
          >
            <Droplet className="w-4 h-4 text-cyan-600" />
            + Idratazione
          </button>
          <button
            onClick={() => handleOpenAdd('lunch')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            + Registra Pasto
          </button>
        </div>
      </div>

      {/* Hydration & Diet Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-cyan-50/70 border border-cyan-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center">
              <Droplet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-cyan-900">Apporto Idrico Oggi</div>
              <div className="text-xl font-bold text-cyan-950 font-mono">{todayHydration} ml</div>
            </div>
          </div>
          <span className="text-[11px] font-medium text-cyan-700 bg-white px-2.5 py-1 rounded-lg border border-cyan-200">
            Obiettivo: ~1500 ml
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Regime Dietetico</div>
              <div className="text-sm font-bold text-slate-900">Dieta Normale / Iposodica</div>
            </div>
          </div>
          <span className="text-[11px] text-slate-400">Verifica deglutizione</span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Food Records List */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Caricamento diario alimentare...</div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
          <Utensils className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <h4 className="font-bold text-slate-700 text-xs">Nessun pasto registrato</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Registra l'assunzione di colazione, pranzo, cena o idratazione per questo assistito.
          </p>
          <button
            onClick={() => handleOpenAdd('lunch')}
            className="mt-3 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg cursor-pointer"
          >
            + Registra Pasto
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {records.map((r) => {
            const mInfo = mealLabels[r.meal_type] || mealLabels.lunch;
            const Icon = mInfo.icon;
            const intake = intakeLabels[r.food_intake_level] || intakeLabels.all;
            const dateObj = new Date(r.recorded_at);

            return (
              <div key={r.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${mInfo.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{mInfo.label}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${intake.color}`}>
                        {intake.label}
                      </span>
                      {r.liquid_ml && (
                        <span className="text-[11px] font-mono text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                          {r.liquid_ml} ml liquidi
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                      <span>{dateObj.toLocaleDateString('it-IT')} alle {dateObj.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span>
                      {r.diet_type && <span>• Dieta: <strong>{r.diet_type}</strong></span>}
                      {r.operator_name && <span>• Registrato da: <em>{r.operator_name}</em></span>}
                    </div>

                    {r.notes && (
                      <p className="text-xs text-slate-600 mt-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        {r.notes}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(r.id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Elimina"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add Food Record */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Utensils className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Registrazione Pasto / Idratazione</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ora *</label>
                  <input
                    type="time"
                    required
                    value={recordTime}
                    onChange={(e) => setRecordTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo di Pasto / Somministrazione *</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as MealType)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="breakfast">Colazione</option>
                  <option value="lunch">Pranzo</option>
                  <option value="snack">Spuntino / Merenda</option>
                  <option value="dinner">Cena</option>
                  <option value="hydration">Idratazione Fuori Pasto (Acqua / Tisana)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quantità Assunta *</label>
                <select
                  value={foodIntake}
                  onChange={(e) => setFoodIntake(e.target.value as FoodIntakeLevel)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white font-semibold"
                >
                  <option value="all">Consumato Tutto (100%)</option>
                  <option value="almost_all">Consumato Quasi Tutto (75%)</option>
                  <option value="half">Consumata la Metà (50%)</option>
                  <option value="little">Consumato Poco (meno del 25%)</option>
                  <option value="refused">Rifiutato / Inappetente</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Liquidi Assunti (ml)</label>
                  <input
                    type="number"
                    placeholder="250"
                    value={liquidMl}
                    onChange={(e) => setLiquidMl(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400">es. 1 bicchiere = 150-200ml</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Consistenza / Dieta</label>
                  <select
                    value={dietType}
                    onChange={(e) => setDietType(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="Normale">Normale</option>
                    <option value="Morbida">Morbida</option>
                    <option value="Tritata">Tritata</option>
                    <option value="Omogeneizzata / Frullata">Omogeneizzata / Frullata</option>
                    <option value="Liquida addensata">Liquida addensata (disfagia)</option>
                    <option value="Iposodica">Iposodica</option>
                    <option value="Diabetica">Diabetica</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Note OSS (es. disfagia, tosse durante deglutizione, gradimento)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="es. Ha assunto i liquidi con cannuccia e cucchiaino senza difficoltà..."
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {saving ? 'Salvataggio...' : 'Salva Registrazione'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
