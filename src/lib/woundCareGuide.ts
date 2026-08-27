import {
  WoundType,
  WoundStage,
  WoundCleansingSolution,
  DressingFrequency,
} from '../types';

export interface WoundCareSuggestion {
  isOssCompetence: boolean;
  competenceBadge: {
    label: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
  };
  title: string;
  cleansingSolution: WoundCleansingSolution;
  dressingApplied: string;
  secondaryDressing: string;
  frequency: DressingFrequency;
  notesTemplate: string;
  instructions: {
    dos: string[];
    donts: string[];
  };
  nurseAlertMessage?: string;
}

export function getWoundCareSuggestion(
  woundType: WoundType,
  stage: WoundStage
): WoundCareSuggestion {
  // STADIO 3, 4, NON STADIABILE / ESCARA -> COMPETENZA INFERMIERISTICA / MMG
  if (
    stage === 'stadio_3_sottocutaneo' ||
    stage === 'stadio_4_muscolo_osso' ||
    stage === 'non_stadiabile_escara'
  ) {
    return {
      isOssCompetence: false,
      competenceBadge: {
        label: '⚠️ COMPETENZA INFERMIERISTICA / MMG',
        bgClass: 'bg-rose-50',
        textClass: 'text-rose-800',
        borderClass: 'border-rose-300',
      },
      title: 'Lesione Complessa / Profonda (Stadio 3-4 o Escara)',
      cleansingSolution: 'fisiologica_09',
      dressingApplied: 'In attesa di medicazione avanzata infermieristica / Prescrizione MMG',
      secondaryDressing: 'Copertura provvisoria con garza sterile in TNT',
      frequency: 'giornaliera',
      notesTemplate:
        '⚠️ Rilevata lesione a spessore totale/profonda. Non effettuata medicazione autonoma. Segnalato tempestivamente all\'Infermiere ADI e al Medico Curante (MMG) per prescrizione e presa in carico specialistica. Mantenuto scarico posturale continuo.',
      instructions: {
        dos: [
          'Ispezionare visivamente e annotare dimensioni, colore e odore',
          'Coprire temporaneamente con garza sterile asciutta senza manovre invasive',
          'Avvisare immediatamente l\'Infermiere del servizio ADI o il Medico Curante',
          'Garantire l\'alternanza delle posture ogni 2 ore e posizionare presidi di scarico',
        ],
        donts: [
          'NON tentare di rimuovere escara nera o fibrina (sbrigliamento vietato all\'OSS)',
          'NON applicare pomate o antibiotici topici non prescritti',
          'NON comprimere la zona lesa',
        ],
      },
      nurseAlertMessage:
        'Attenzione: Le lesioni di Stadio 3, 4 ed escare necrotiche richiedono valutazione e prescrizione da parte dell\'Infermiere o del Medico. L\'OSS collabora nel mantenimento della postura di scarico e nella segnalazione dell\'evoluzione.',
    };
  }

  // MACERAZIONE DA PANNAOLONE / INCONTINENZA / PIEGHE
  if (
    woundType === 'arrossamento_macerazione_pannolone' ||
    woundType === 'arrossamento_sfregamento_pieghe'
  ) {
    return {
      isOssCompetence: true,
      competenceBadge: {
        label: '✅ GESTIONE DIRETTA OSS (Igiene & Protezione Cute)',
        bgClass: 'bg-emerald-50',
        textClass: 'text-emerald-800',
        borderClass: 'border-emerald-300',
      },
      title: 'Macerazione da Incontinenza / Arrossamento Pieghe Cutanee',
      cleansingSolution: 'detergente_lenitivo_ph_neutro',
      dressingApplied:
        'Pasta all\'Ossido di Zinco protettiva / Crema barriera lenitiva a velo sottile',
      secondaryDressing: 'Garza in tessuto non tessuto (TNT) asciutta nelle pieghe per assorbire il sudore',
      frequency: 'ad_ogni_cambio_pannolone',
      notesTemplate:
        'Eseguita igiene con acqua tiepida e detergente a pH acuto-neutro. Asciugatura accurata per tamponamento delle pieghe cutanee. Applicato velo sottile di pasta protettiva all\'ossido di zinco. Cambio ausilio assorbente eseguito.',
      instructions: {
        dos: [
          'Lavare con acqua tiepida e detergente delicato a pH fisiologico',
          'Asciugare benissimo le pieghe cutanee TAMPONANDO delicatamente (mai strofinare)',
          'Applicare uno strato sottile e uniforme di pasta protettiva all\'ossido di zinco',
          'Cambiare frequentemente il presidio assorbente non appena bagnato',
        ],
        donts: [
          'NON frizionare o strofinare con la manopola o asciugamano',
          'NON applicare strati eccessivamente spessi di pasta che ostruiscono la traspirazione',
          'NON usare borotalco o polveri su cute umida o arrossata',
        ],
      },
    };
  }

  // ARROSSAMENTO / STADIO 0 E 1 (CUTE INTEGRA)
  if (
    woundType === 'arrossamento_cute_integra' ||
    stage === 'stadio_0_arrossamento_sbiancabile' ||
    stage === 'stadio_1_eritema'
  ) {
    return {
      isOssCompetence: true,
      competenceBadge: {
        label: '✅ COMPETENZA OSS (Prevenzione & Protezione Cute)',
        bgClass: 'bg-teal-50',
        textClass: 'text-teal-800',
        borderClass: 'border-teal-300',
      },
      title: 'Arrossamento / Eritema da Pressione (Cute Integra - Stadio 1)',
      cleansingSolution: 'fisiologica_09',
      dressingApplied:
        'Crema idratante lenitiva / Film protettivo trasparente in poliuretano o Pasta all\'Ossido di Zinco',
      secondaryDressing: 'Cuscino di scarico antidecubito / Proteggi-tallone in fibra cava',
      frequency: 'giornaliera',
      notesTemplate:
        'Rilevato arrossamento a cute integra. Detersione delicata con soluzione fisiologica a tampone. Applicata crema idratante protettiva senza massaggiare. Posizionato ausilio di scarico e programmata rotazione delle posture ogni 2 ore.',
      instructions: {
        dos: [
          'Detergere delicatamente con soluzione fisiologica o acqua tiepida a tampone',
          'Applicare crema lenitiva/idratante o pellicola protettiva trasparente',
          'Scarico totale della pressione: posizionare cuscini antidecubito o proteggi-talloni',
          'Cambiare postura ogni 2 ore (laterale dx, supino, laterale sx)',
        ],
        donts: [
          'NON massaggiare o frizionare la zona arrossata (peggiora l\'ischemia profonda dei tessuti)',
          'NON lasciare l\'assistito sulla stessa posizione per più di 2 ore',
          'NON usare disinfettanti alcolici o aggressivi su cute arrossata integra',
        ],
      },
    };
  }

  // FLITTENE / VESCICOLA / STADIO 2 SUPERFICIALE
  if (
    woundType === 'flittene_vescicola' ||
    stage === 'stadio_2_flittene' ||
    woundType === 'abrasione_escoriazione'
  ) {
    return {
      isOssCompetence: true,
      competenceBadge: {
        label: '✅ COMPETENZA OSS (Medicazione Semplice Superficiale)',
        bgClass: 'bg-indigo-50',
        textClass: 'text-indigo-800',
        borderClass: 'border-indigo-300',
      },
      title: 'Flittene / Vescicola / Lesione di 2° Stadio Superficiale',
      cleansingSolution: 'fisiologica_09',
      dressingApplied:
        'Garze Connettivina (Acido Ialuronico) sterili / Idrocolloide sottile',
      secondaryDressing: 'Garza sterile in TNT di protezione fissata con cerotto ipoallergenico in carta o rete tubolare',
      frequency: 'giorni_alterni',
      notesTemplate:
        'Detersione delicata con Soluzione Fisiologica 0.9% a tampone. Flittene mantenuto integro/protetto. Applicata garza sterile impregnata di acido ialuronico (Connettivina) e coperta con garza sterile in TNT fissata con cerotto traspirante. Posizionato scarico pressorio.',
      instructions: {
        dos: [
          'Detergere delicatamente con Soluzione Fisiologica 0.9% sterile per tamponamento',
          'Se il flittene è integro: MANTENERLO INTEGRO (è la migliore barriera biologica sterile naturale)',
          'Applicare garze impregnate di acido ialuronico (es. Connettivina garze) per favorire la riepitelizzazione',
          'Coprire con garza sterile e fissare con cerotto di carta traspirante o rete elastica',
          'Posizionare cuscino o ciambella di scarico per eliminare ogni pressione',
        ],
        donts: [
          'NON forare o rompere il flittene con aghi o forbici senza indicazione medica',
          'NON applicare cerotti a forte adesione direttamente sul tetto della vescicola',
          'NON strofinare la garza sul fondo della lesione',
        ],
      },
    };
  }

  // FERITA CHIRURGICA O ALTRO
  if (woundType === 'ferita_chirurgica') {
    return {
      isOssCompetence: false,
      competenceBadge: {
        label: '⚠️ COMPETENZA INFERMIERISTICA (Controllo Ispettivo OSS)',
        bgClass: 'bg-amber-50',
        textClass: 'text-amber-800',
        borderClass: 'border-amber-300',
      },
      title: 'Ferita Chirurgica con Punti / Graffette',
      cleansingSolution: 'fisiologica_09',
      dressingApplied: 'Medicazione sterile a piatto traspirante con bordo adesivo',
      secondaryDressing: 'Controllo tenuta cerotto e assenza di sanguinamento/arrossamento',
      frequency: 'giorni_alterni',
      notesTemplate:
        'Controllo ispettivo della ferita chirurgica: margini accostati, cute perilesionale integra, assenza di perdite o segni di flogosi. Medicazione mantenuta pulita e asciutta.',
      instructions: {
        dos: [
          'Eseguire controllo ispettivo quotidiano durante le manovre di igiene',
          'Verificare che i bordi siano accostati e non ci siano secrezioni o cattivi odori',
          'Mantenere la medicazione sempre pulita e rigorosamente asciutta',
          'Avvisare tempestivamente l\'Infermiere se la medicazione è sporca o si stacca',
        ],
        donts: [
          'NON bagnare la ferita chirurgica durante il bagno o spugnatura',
          'NON rimuovere punti o graffette (atto esclusivamente infermieristico/medico)',
        ],
      },
    };
  }

  // DEFAULT PER ALTRO / GENERALE
  return {
    isOssCompetence: true,
    competenceBadge: {
      label: '✅ COMPETENZA OSS (Medicazione di Base)',
      bgClass: 'bg-teal-50',
      textClass: 'text-teal-800',
      borderClass: 'border-teal-300',
    },
    title: 'Medicazione di Base / Lesione Superficiale',
    cleansingSolution: 'fisiologica_09',
    dressingApplied: 'Garze Connettivina sterili / Garza grassa protettiva',
    secondaryDressing: 'Garza sterile in TNT di copertura',
    frequency: 'giorni_alterni',
    notesTemplate:
      'Detersione con soluzione fisiologica sterile per tamponamento delicato. Applicata medicazione protettiva sterile connettivina garze e fissaggio traspirante.',
    instructions: {
      dos: [
        'Detersione a tampone con soluzione fisiologica 0.9%',
        'Applicare garze sterili protettive (es. Connettivina garze o garze grasse)',
        'Garantire il cambio postura e la riduzione della pressione',
      ],
      donts: [
        'NON eseguire manovre invasive',
        'NON usare cerotti aggressivi su cute fragile dell\'anziano',
      ],
    },
  };
}

export interface QuickSnippet {
  category: 'cura_crema' | 'comunicazioni' | 'medicazione' | 'postura';
  categoryLabel: string;
  label: string;
  dressing?: string;
  secondary?: string;
  cleansing?: WoundCleansingSolution;
  text: string;
}

export const OSS_QUICK_SNIPPETS: QuickSnippet[] = [
  // Igiene & Creme
  {
    category: 'cura_crema',
    categoryLabel: '🧴 Igiene & Creme',
    label: '🧴 Lavato, deterso con cura e applicata crema protettiva',
    dressing: 'Crema protettiva lenitiva / Pasta all\'ossido di zinco a velo sottile',
    secondary: 'Ausilio assorbente pulito',
    cleansing: 'detergente_lenitivo_ph_neutro' as WoundCleansingSolution,
    text: 'Eseguita igiene accurata con acqua tiepida e detergente delicato a pH neutro. Cute detersa per bene e asciugata con cura per tamponamento. Applicato velo sottile di crema protettiva/pasta barriera.',
  },
  {
    category: 'cura_crema',
    categoryLabel: '🧴 Igiene & Creme',
    label: '🧴 Pasta Ossido di Zinco (Pannolone / Pieghe)',
    dressing: 'Pasta all\'Ossido di Zinco protettiva a velo sottile',
    secondary: 'Ausilio assorbente pulito con cambio frequente',
    cleansing: 'detergente_lenitivo_ph_neutro' as WoundCleansingSolution,
    text: 'Igiene accurata con acqua tiepida e detergente intimo a pH neutro. Asciugatura meticolosa a tampone delle pieghe e applicato velo sottile di pasta all\'ossido di zinco.',
  },

  // Comunicazioni & Avvisi
  {
    category: 'comunicazioni',
    categoryLabel: '📞 Avvisi & Comunicazioni',
    label: '📞 Avvisato Infermiere ADI',
    text: '📞 Ho avvisato l\'Infermiere del servizio ADI per segnalare l\'arrossamento/stato della cute e richiedere valutazione.',
  },
  {
    category: 'comunicazioni',
    categoryLabel: '📞 Avvisi & Comunicazioni',
    label: '👨‍⚕️ Avvisato Medico Curante (MMG)',
    text: '👨‍⚕️ Ho avvisato il Medico Curante (MMG) per aggiornamento sulle condizioni cutanee e verifica prescrizione.',
  },
  {
    category: 'comunicazioni',
    categoryLabel: '📞 Avvisi & Comunicazioni',
    label: '⚠️ Avvisati Infermiere & Medico Curante',
    dressing: 'Garza sterile asciutta provvisoria',
    cleansing: 'fisiologica_09' as WoundCleansingSolution,
    text: '⚠️ Rilevata alterazione cutanea / arrossamento in evoluzione. Ho avvisato tempestivamente l\'Infermiere e il Medico Curante (MMG) per la presa in carico.',
  },

  // Medicazioni Semplici
  {
    category: 'medicazione',
    categoryLabel: '🩹 Medicazioni',
    label: '🩹 Connettivina garze + garza TNT',
    dressing: 'Connettivina garze sterili impregnate di Acido Ialuronico',
    secondary: 'Garza sterile in TNT di copertura e cerotto ipoallergenico di carta',
    cleansing: 'fisiologica_09' as WoundCleansingSolution,
    text: 'Deterso delicatamente con soluzione fisiologica 0.9% a tampone senza strofinare. Applicata garza sterile Connettivina (Acido Ialuronico) e coperta con garza in TNT.',
  },
  {
    category: 'medicazione',
    categoryLabel: '🩹 Medicazioni',
    label: '💧 Detersione Fisiologica a Tampone',
    dressing: 'Garza sterile asciutta di protezione',
    cleansing: 'fisiologica_09' as WoundCleansingSolution,
    text: 'Detersione con soluzione fisiologica sterile 0.9% per tamponamento delicato, senza strofinare. Cute perilesionale perfettamente asciugata.',
  },
  {
    category: 'medicazione',
    categoryLabel: '🩹 Medicazioni',
    label: '🛡️ Flittene integro PROTETTO (Non forato)',
    dressing: 'Idrocolloide extra-sottile / Garza grassa non aderente',
    secondary: 'Garza sterile in TNT di protezione',
    cleansing: 'fisiologica_09' as WoundCleansingSolution,
    text: 'Flittene integro mantenuto intatto come barriera sterile naturale (non forato). Applicata copertura protettiva con garza sterile e scarico continuo.',
  },

  // Postura & Scarico
  {
    category: 'postura',
    categoryLabel: '🛏️ Postura & Scarico',
    label: '🔄 Cambio Postura 2h & Scarico Pressione',
    secondary: 'Cuscino antidecubito di scarico',
    cleansing: 'fisiologica_09' as WoundCleansingSolution,
    text: 'Posizionato cuscino di scarico antidecubito a livello dei talloni/sacro. Programmata alternanza posturale ogni 2 ore (rotazione dx-supino-sx).',
  },
];

