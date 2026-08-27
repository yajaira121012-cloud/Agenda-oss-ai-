import { useState, useEffect, useRef, ReactNode } from 'react';
import {
  Users,
  LayoutDashboard,
  Calendar,
  BookOpen,
  Activity,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  PlusCircle,
  AlertTriangle,
  Stethoscope,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { resetAppScroll } from '../../lib/scrollUtils';

export type ActiveTab =
  | 'dashboard'
  | 'patients'
  | 'patient-detail'
  | 'care-diary'
  | 'vital-signs'
  | 'agenda'
  | 'profile'
  | 'settings';

interface AppLayoutProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  children: ReactNode;
  onOpenQuickNewPatient?: () => void;
  onOpenQuickNewDiary?: () => void;
  onOpenQuickNewVital?: () => void;
}

export function AppLayout({
  currentTab,
  onSelectTab,
  children,
  onOpenQuickNewPatient,
  onOpenQuickNewDiary,
  onOpenQuickNewVital,
}: AppLayoutProps) {
  const { user, profile, signOut, isConfigured } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Automatically reset scroll position to top whenever active navigation tab changes
  useEffect(() => {
    resetAppScroll();
  }, [currentTab]);

  const navItems: { id: ActiveTab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Pazienti', icon: Users },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'care-diary', label: 'Diario', icon: BookOpen },
    { id: 'vital-signs', label: 'Parametri', icon: Activity },
    { id: 'profile', label: 'Profilo OSS', icon: User },
    { id: 'settings', label: 'Impostazioni & DB', icon: Settings },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    resetAppScroll();
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  const operatorName = profile?.full_name || user?.email?.split('@')[0] || 'Operatore OSS';
  const operatorRole = profile?.qualification || 'Operatore Socio-Sanitario';
  const initials = operatorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'OS';

  const todayFormatted = new Date().toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex h-screen w-full bg-[#F5F7F9] text-[#1A1C1E] font-sans overflow-hidden">
      {/* Desktop Left Sidebar - Clean Utility */}
      <aside className="hidden md:flex w-64 bg-white border-r border-[#E1E4E8] flex-col shrink-0">
        <div className="p-6 flex-1 flex flex-col overflow-y-auto">
          {/* App Logo & Title */}
          <div
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-3 mb-8 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-xs group-hover:bg-teal-700 transition-colors">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-teal-900 leading-tight">
                Agenda OSS
              </h1>
              <span className="text-[11px] text-slate-400 block font-medium">
                Cartella Assistenziale
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentTab === item.id ||
                (item.id === 'patients' && currentTab === 'patient-detail');
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 font-semibold shadow-xs'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? 'text-teal-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* DB Status Badge */}
          <div className="mt-6 pt-4 border-t border-[#E1E4E8]">
            <div className="flex items-center justify-between text-xs text-slate-500 px-2">
              <span className="flex items-center gap-1.5 font-medium">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConfigured ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                  }`}
                />
                Supabase DB
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {isConfigured ? 'Connesso' : 'Configura'}
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar Footer: Operator & Logout */}
        <div className="p-5 border-t border-[#E1E4E8] bg-white">
          <div
            onClick={() => onSelectTab('profile')}
            className="flex items-center gap-3 cursor-pointer p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div className="w-10 h-10 bg-slate-100 border border-[#E1E4E8] rounded-full flex items-center justify-center font-bold text-teal-800 text-xs">
              {initials}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate text-[#1A1C1E]">
                {operatorName}
              </p>
              <p className="text-xs text-slate-400 truncate">{operatorRole}</p>
            </div>
          </div>
          <button
            id="logout-button"
            onClick={() => signOut()}
            className="w-full mt-3 py-2 text-xs text-rose-600 font-medium hover:bg-rose-50 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer border border-transparent hover:border-rose-100"
          >
            <LogOut className="w-4 h-4" />
            Esci dall'applicazione
          </button>
        </div>
      </aside>

      {/* Mobile Header and Drawer */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-[#E1E4E8] h-14 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            aria-label="Apri menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center text-white">
              <Stethoscope className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm">Agenda OSS</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectTab('profile')}
            className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center border border-[#E1E4E8]"
          >
            {initials}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Modal */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative bg-white w-4/5 max-w-xs h-full shadow-2xl p-5 flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E1E4E8] mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-teal-600 rounded-xl flex items-center justify-center text-white">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <h2 className="font-bold text-slate-900 text-base">Agenda OSS</h2>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-left cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-teal-50 text-teal-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-[#E1E4E8]">
              <div className="text-xs font-semibold text-slate-800">{operatorName}</div>
              <div className="text-[11px] text-slate-400 mb-3">{operatorRole}</div>
              <button
                onClick={() => signOut()}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium hover:bg-rose-100 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Esci
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Column */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden pt-14 md:pt-0">
        {/* Supabase Warning Banner */}
        {!isConfigured && (
          <div className="bg-amber-500 text-white px-6 py-2 text-xs font-medium flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-100" />
              <span>
                <strong>Supabase non configurato:</strong> Inserisci le credenziali in Impostazioni per sincronizzare il database PostgreSQL.
              </span>
            </div>
            <button
              onClick={() => onSelectTab('settings')}
              className="ml-4 underline hover:text-amber-100 shrink-0 font-semibold cursor-pointer"
            >
              Configura ora
            </button>
          </div>
        )}

        {/* Clean Utility Top Header */}
        <header className="h-16 bg-white border-b border-[#E1E4E8] flex items-center justify-between px-6 sm:px-8 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-[#1A1C1E]">
              {currentTab === 'dashboard' && 'Dashboard Panoramica'}
              {currentTab === 'patients' && 'Anagrafica Assistiti'}
              {currentTab === 'patient-detail' && 'Cartella Assistito'}
              {currentTab === 'agenda' && 'Agenda & Calendario'}
              {currentTab === 'care-diary' && 'Diario Assistenziale'}
              {currentTab === 'vital-signs' && 'Rilevazione Parametri'}
              {currentTab === 'profile' && 'Profilo Operatore'}
              {currentTab === 'settings' && 'Impostazioni & Schema SQL'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs sm:text-sm text-slate-500 capitalize hidden sm:inline-block">
              {todayFormatted}
            </span>

            {/* Quick Action Inserimento Menu */}
            <div className="relative">
              <button
                id="quick-action-button"
                onClick={() => setQuickActionOpen(!quickActionOpen)}
                className="bg-teal-600 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium shadow-xs hover:bg-teal-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>+ Nuovo Inserimento</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {quickActionOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E1E4E8] py-2 z-50 text-xs"
                  onClick={() => setQuickActionOpen(false)}
                >
                  {onOpenQuickNewPatient && (
                    <button
                      onClick={onOpenQuickNewPatient}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-slate-700 cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-teal-600" />
                      <div>
                        <div className="font-semibold text-slate-900">Nuovo Paziente</div>
                        <div className="text-[10px] text-slate-400">Crea cartella assistito</div>
                      </div>
                    </button>
                  )}
                  {onOpenQuickNewDiary && (
                    <button
                      onClick={onOpenQuickNewDiary}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-slate-700 cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-teal-600" />
                      <div>
                        <div className="font-semibold text-slate-900">Nota Diario</div>
                        <div className="text-[10px] text-slate-400">Registra consegna di turno</div>
                      </div>
                    </button>
                  )}
                  {onOpenQuickNewVital && (
                    <button
                      onClick={onOpenQuickNewVital}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-slate-700 cursor-pointer"
                    >
                      <Activity className="w-4 h-4 text-rose-600" />
                      <div>
                        <div className="font-semibold text-slate-900">Parametro Vitale</div>
                        <div className="text-[10px] text-slate-400">Rileva PA, SpO2, Temp</div>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable View Content with #F5F7F9 background */}
        <div
          id="main-scroll-container"
          data-scroll-container="true"
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"
        >
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </div>
      </main>
    </div>
  );
}
