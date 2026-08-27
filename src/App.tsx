import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout, ActiveTab } from './components/layout/AppLayout';
import { DashboardView } from './components/dashboard/DashboardView';
import { PatientsListView } from './components/patients/PatientsListView';
import { PatientDetailView, PatientTab } from './components/patients/PatientDetailView';
import { CalendarView } from './components/calendar/CalendarView';
import { CareDiaryListView } from './components/diary/CareDiaryListView';
import { VitalSignsListView } from './components/vitals/VitalSignsListView';
import { ProfileView } from './components/profile/ProfileView';
import { SettingsView } from './components/settings/SettingsView';
import { resetAppScroll } from './lib/scrollUtils';

function AppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patientDetailTab, setPatientDetailTab] = useState<PatientTab>('anagrafica');

  // Quick Action Modal states triggered from Header or Dashboard
  const [openNewPatientModal, setOpenNewPatientModal] = useState(false);

  // Guarantee scroll resets to top whenever active tab or patient changes
  useEffect(() => {
    resetAppScroll();
  }, [activeTab, selectedPatientId, patientDetailTab]);

  // Handle patient selection from list, diary, vitals or calendar
  const handleSelectPatient = (patientId: string, subTab?: string) => {
    resetAppScroll();
    setSelectedPatientId(patientId);
    if (subTab) {
      if (subTab === 'care_diary' || subTab === 'diario') setPatientDetailTab('diario');
      else if (subTab === 'vital_signs' || subTab === 'parametri') setPatientDetailTab('parametri');
      else if (subTab === 'terapia') setPatientDetailTab('terapia');
      else if (subTab === 'anamnesi') setPatientDetailTab('anamnesi');
      else if (subTab === 'mobilita') setPatientDetailTab('mobilita');
      else if (subTab === 'sensorialita') setPatientDetailTab('sensorialita');
      else if (subTab === 'alimentazione') setPatientDetailTab('alimentazione');
      else if (subTab === 'alvo' || subTab === 'scariche' || subTab === 'bowel') setPatientDetailTab('alvo');
      else if (subTab === 'catetere' || subTab === 'catheter') setPatientDetailTab('catetere');
      else if (subTab === 'medicazioni' || subTab === 'medicazione' || subTab === 'wounds') setPatientDetailTab('medicazioni');
      else if (subTab === 'agenda') setPatientDetailTab('agenda');
      else if (subTab === 'domiciliare') setPatientDetailTab('domiciliare');
      else setPatientDetailTab('anagrafica');
    } else {
      setPatientDetailTab('anagrafica');
    }
    setActiveTab('patient-detail');
  };

  const handleBackToPatients = () => {
    resetAppScroll();
    setSelectedPatientId(null);
    setActiveTab('patients');
  };

  const handleQuickNewPatient = () => {
    resetAppScroll();
    setActiveTab('patients');
    setOpenNewPatientModal(true);
  };

  const handleQuickNewDiary = () => {
    resetAppScroll();
    setActiveTab('care-diary');
  };

  const handleQuickNewVital = () => {
    resetAppScroll();
    setActiveTab('vital-signs');
  };

  return (
    <ProtectedRoute>
      <AppLayout
        currentTab={activeTab}
        onSelectTab={(tab) => {
          if (tab !== 'patient-detail') {
            setSelectedPatientId(null);
          }
          setActiveTab(tab);
        }}
        onOpenQuickNewPatient={handleQuickNewPatient}
        onOpenQuickNewDiary={handleQuickNewDiary}
        onOpenQuickNewVital={handleQuickNewVital}
      >
        {/* 1. Dashboard */}
        {activeTab === 'dashboard' && (
          <DashboardView
            onSelectPatient={handleSelectPatient}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenNewPatient={handleQuickNewPatient}
            onOpenNewDiary={handleQuickNewDiary}
            onOpenNewVital={handleQuickNewVital}
          />
        )}

        {/* 2. Patients List */}
        {activeTab === 'patients' && (
          <PatientsListView
            onSelectPatient={handleSelectPatient}
            openNewModalDirectly={openNewPatientModal}
            onCloseNewModal={() => setOpenNewPatientModal(false)}
          />
        )}

        {/* 3. Patient Full Detail Scheda Cartella */}
        {activeTab === 'patient-detail' && selectedPatientId && (
          <PatientDetailView
            patientId={selectedPatientId}
            onBack={handleBackToPatients}
            initialTab={patientDetailTab}
          />
        )}

        {/* 4. Agenda & Calendar */}
        {activeTab === 'agenda' && (
          <CalendarView onSelectPatient={handleSelectPatient} />
        )}

        {/* 5. Care Diary */}
        {activeTab === 'care-diary' && (
          <CareDiaryListView onSelectPatient={handleSelectPatient} />
        )}

        {/* 6. Vital Signs */}
        {activeTab === 'vital-signs' && (
          <VitalSignsListView onSelectPatient={handleSelectPatient} />
        )}

        {/* 7. Operator Profile */}
        {activeTab === 'profile' && <ProfileView />}

        {/* 8. Settings & Supabase SQL Schema */}
        {activeTab === 'settings' && <SettingsView />}
      </AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

