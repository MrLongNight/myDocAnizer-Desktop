import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  DocumentEntity, 
  ActiveMainView, 
  OSWindowStyle, 
  PairedDevice, 
  VaultSecurityConfig 
} from './types/document';
import { VaultService } from './services/vaultStorage';
import { TopSlimNavBar } from './components/TopSlimNavBar';
import { VaultExplorer } from './components/VaultExplorer/VaultExplorer';
import { ScanToAndroidView } from './components/Scanner/ScanToAndroidView';
import { SettingsModal, SettingsTabId } from './components/Settings/SettingsModal';
import { OnboardingWizardModal } from './components/Onboarding/OnboardingWizardModal';
import { LockScreenModal } from './components/LockScreenModal';
import { PrintModal } from './components/PrintModal';
import { ExportModal } from './components/ExportModal';
import { BrandUploadModal } from './components/brand/BrandUploadModal';
import { InfoModal, InfoTopic } from './components/common/InfoModal';

export default function App() {
  // OS and Theme state
  const [osStyle, setOsStyle] = useState<OSWindowStyle>('windows');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Active Main Navigation Workspace ('vault' | 'scanner')
  const [activeView, setActiveView] = useState<ActiveMainView>('vault');

  // Vault data state
  const [documents, setDocuments] = useState<DocumentEntity[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [securityConfig, setSecurityConfig] = useState<VaultSecurityConfig>(VaultService.getSecurityConfig());
  const [pairedDevice, setPairedDevice] = useState<PairedDevice | null>(VaultService.getPairedDevice());

  // Sync state
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'offline' | 'error'>('idle');
  const [syncProgress, setSyncProgress] = useState<number>(0);

  // Modals state
  // WÄHREND DER TESTPHASE: Wizard startet immer automatisch beim Öffnen / Neuladen
  // (Später umschaltbar auf reines Erststart-Verhalten `!VaultService.isOnboardingCompleted()`)
  const ALWAYS_SHOW_WIZARD_DURING_TESTING = true;
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<SettingsTabId>('smartphone');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(true);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isBrandUploadOpen, setIsBrandUploadOpen] = useState<boolean>(false);
  const [targetPrintDoc, setTargetPrintDoc] = useState<DocumentEntity | null>(null);
  const [targetExportDoc, setTargetExportDoc] = useState<DocumentEntity | null>(null);

  // Info Modal state (for quick help & IT specs)
  const [infoTopic, setInfoTopic] = useState<InfoTopic | null>(null);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Timer and lifecycle references
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, []);

  // Inactivity Auto-Lock Monitor
  useEffect(() => {
    if (!securityConfig.isUnlocked || securityConfig.autoLockMinutes <= 0) return;

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // Throttled activity listening
    let throttleTimeout: ReturnType<typeof setTimeout> | null = null;
    const throttledHandler = () => {
      if (!throttleTimeout) {
        updateActivity();
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null;
        }, 1000);
      }
    };

    window.addEventListener('pointerdown', throttledHandler, { passive: true });
    window.addEventListener('keydown', throttledHandler, { passive: true });

    // Inactivity check every 20 seconds
    const checkInterval = setInterval(() => {
      const elapsedMs = Date.now() - lastActivityRef.current;
      const thresholdMs = securityConfig.autoLockMinutes * 60 * 1000;
      if (elapsedMs >= thresholdMs) {
        setSecurityConfig(prev => {
          if (!prev.isUnlocked) return prev;
          const lockedConfig = { ...prev, isUnlocked: false };
          VaultService.saveSecurityConfig(lockedConfig);
          VaultService.wipeRAMDecryptionBuffers();
          return lockedConfig;
        });
        showToast('🔒 Desktop-App automatisch gesperrt (Inaktivitäts-Timeout)');
      }
    }, 20000);

    return () => {
      window.removeEventListener('pointerdown', throttledHandler);
      window.removeEventListener('keydown', throttledHandler);
      if (throttleTimeout) clearTimeout(throttleTimeout);
      clearInterval(checkInterval);
    };
  }, [securityConfig.isUnlocked, securityConfig.autoLockMinutes, showToast]);

  // Load initial documents and check onboarding
  useEffect(() => {
    const loadedDocs = VaultService.getDocuments();
    setDocuments(loadedDocs);
    if (loadedDocs.length > 0) {
      setSelectedDocId(loadedDocs[0].id);
    }

    if (ALWAYS_SHOW_WIZARD_DURING_TESTING || !VaultService.isOnboardingCompleted()) {
      setIsOnboardingOpen(true);
    }
  }, []);

  // Synchronisation trigger
  const handleTriggerSync = () => {
    if (syncState === 'syncing') return;

    if (pairedDevice?.status === 'offline') {
      showToast('⚠️ myDocAnizer Mobile ist offline. Synchronisation kann nicht gestartet werden.');
      return;
    }

    if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

    setSyncState('syncing');
    setSyncProgress(10);
    showToast(`🔄 Synchronisiere verschlüsselten Datenstrom mit ${pairedDevice?.name || 'myDocAnizer Mobile'}...`);

    syncIntervalRef.current = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 90) {
          if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
          syncTimeoutRef.current = setTimeout(() => {
            setSyncState('idle');
            setSyncProgress(0);
            const now = Date.now();
            if (pairedDevice) {
              const updatedDevice = { ...pairedDevice, lastSyncTime: now };
              setPairedDevice(updatedDevice);
              VaultService.savePairedDevice(updatedDevice);
            }
            showToast('✅ Synchronisation erfolgreich: Dokumente & Krypto-Indizes auf aktuellem Stand!');
          }, 300);
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  const handleToggleVaultLock = () => {
    const nextState = !securityConfig.isUnlocked;
    const updatedConfig = { ...securityConfig, isUnlocked: nextState };
    setSecurityConfig(updatedConfig);
    VaultService.saveSecurityConfig(updatedConfig);
    if (!nextState) {
      VaultService.wipeRAMDecryptionBuffers();
      showToast('🔒 Desktop-App gesperrt (Flüchtiger RAM-Entschlüsselungspuffer geleert)');
    } else {
      showToast('🔓 Desktop-App entsperrt');
    }
  };

  const handleUnlockFromLockScreen = () => {
    const updatedConfig = { ...securityConfig, isUnlocked: true };
    setSecurityConfig(updatedConfig);
    VaultService.saveSecurityConfig(updatedConfig);
  };

  const handleUpdateDocument = (updatedDoc: DocumentEntity) => {
    const saved = VaultService.updateDocument(updatedDoc);
    setDocuments(prev => prev.map(d => d.id === saved.id ? saved : d));
  };

  const handleDeleteDocument = (id: number) => {
    VaultService.deleteDocument(id);
    setDocuments(prev =>
      prev.map(d =>
        d.id === id ? { ...d, isDeleted: true, deletedAt: Date.now() } : d
      )
    );
    showToast('🗑️ Dokument in den Papierkorb verschoben (Wird beim nächsten Sync repliziert)');
  };

  const handleScanCompleted = (newDoc: DocumentEntity) => {
    const saved = VaultService.updateDocument(newDoc);
    setDocuments(prev => [saved, ...prev.filter(d => d.id !== saved.id)]);
    setSelectedDocId(saved.id);
  };

  const handleNavigateToVault = (docId: number) => {
    setSelectedDocId(docId);
    setActiveView('vault');
  };

  const handleFinishOnboarding = (configUpdates: Partial<VaultSecurityConfig> | string) => {
    VaultService.setOnboardingCompleted(true);
    let updated: VaultSecurityConfig;
    if (typeof configUpdates === 'string') {
      updated = { ...securityConfig, pinCode: configUpdates, isUnlocked: true };
    } else {
      updated = { ...securityConfig, ...configUpdates, isUnlocked: true };
    }
    setSecurityConfig(updated);
    VaultService.saveSecurityConfig(updated);
    setIsOnboardingOpen(false);
    showToast('🎉 myDocAnizer Desktop erfolgreich verbunden und betriebsbereit!');
  };

  const handleResetVault = () => {
    VaultService.resetVaultToDefault();
    const freshDocs = VaultService.getDocuments();
    setDocuments(freshDocs);
    if (freshDocs.length > 0) {
      setSelectedDocId(freshDocs[0].id);
    }
  };

  const openSettingsTab = (tab: SettingsTabId) => {
    setSettingsInitialTab(tab);
    setIsSettingsOpen(true);
  };

  const handleWipeRAM = () => {
    const wipedCount = VaultService.wipeRAMDecryptionBuffers();
    showToast(`🧹 RAM-Sicherheitsspeicher bereinigt (${wipedCount} flüchtige Dokument-Puffer genullt)`);
  };

  const handleOpenGeneralHelp = () => {
    setInfoTopic({
      title: 'myDocAnizer Desktop – Funktionsweise & Datenschutz',
      category: 'Systemübersicht',
      simpleExplanation: 'myDocAnizer Desktop ist dein lokaler Arbeitsbereich auf dem Computer. Er synchronisiert sich direkt über dein Heimnetzwerk mit myDocAnizer Mobile. Alle Dokumente liegen verschlüsselt auf deinen eigenen Geräten und verlassen dein privates Netzwerk nur dann, wenn du externe Cloud-Dienste wie Google Drive selbst explizit aktivierst.',
      technicalDetails: [
        { label: 'Architektur', value: 'Zero-Knowledge P2P-Replikation ohne Drittanbieter-Server' },
        { label: 'Transport-Verschlüsselung', value: 'mTLS 1.3 mit ECDH X25519 & Ed25519 Schlüsselpaaren' },
        { label: 'Dokumenten-Verschlüsselung', value: 'AES-256-GCM mit Argon2id KDF & Auth-Tag Validierung' },
        { label: 'Desktop-Zugriffsschutz', value: 'Windows Hello / Apple Touch ID / Biometrie & PIN' },
        { label: 'Texterkennung (OCR)', value: 'Lokale On-Device Extraktion (Tesseract/ML-Kit)' },
        { label: 'Datenhoheit', value: 'Kein Cloud-Zwang; Cloud-Export nur auf expliziten Nutzerbefehl' }
      ]
    });
  };

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* 1. Single Unified Top Slim Navigation Bar */}
      <TopSlimNavBar
        activeView={activeView}
        onChangeView={setActiveView}
        documentCount={documents.filter(d => !d.isDeleted).length}
        pairedDevice={pairedDevice}
        syncState={syncState}
        syncProgress={syncProgress}
        isUnlocked={securityConfig.isUnlocked}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onToggleVaultLock={handleToggleVaultLock}
        onTriggerSync={handleTriggerSync}
        onWipeRAM={handleWipeRAM}
        onOpenSettings={() => openSettingsTab('smartphone')}
        onOpenInfoModal={handleOpenGeneralHelp}
      />

      {/* 3. Main Workspace Area (Clean, full-width, perfectly organized) */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {activeView === 'vault' && (
          <VaultExplorer
            documents={documents}
            selectedDocId={selectedDocId}
            onSelectDocument={setSelectedDocId}
            onUpdateDocument={handleUpdateDocument}
            onDeleteDocument={handleDeleteDocument}
            onOpenPrintDialog={(doc) => {
              setTargetPrintDoc(doc);
              setIsPrintModalOpen(true);
            }}
            onOpenExportDialog={(doc) => {
              setTargetExportDoc(doc);
              setIsExportModalOpen(true);
            }}
            onStartNewScan={() => setActiveView('scanner')}
            onShowToast={showToast}
          />
        )}

        {activeView === 'scanner' && (
          <ScanToAndroidView
            onScanCompleted={handleScanCompleted}
            onNavigateToVault={handleNavigateToVault}
            onShowToast={showToast}
            pairedDeviceName={pairedDevice?.name || 'myDocAnizer Mobile'}
          />
        )}
      </main>

      {/* 4. Centralized Tabbed Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        initialTab={settingsInitialTab}
        pairedDevice={pairedDevice}
        syncState={syncState}
        securityConfig={securityConfig}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSecurityConfig={setSecurityConfig}
        onTriggerSync={handleTriggerSync}
        onStartPairingWizard={() => {
          setIsSettingsOpen(false);
          setIsOnboardingOpen(true);
        }}
        onResetVault={handleResetVault}
        onOpenBrandUpload={() => {
          setIsSettingsOpen(false);
          setIsBrandUploadOpen(true);
        }}
        onShowToast={showToast}
      />

      {/* 5. Onboarding / Verbindungs-Assistent Modal */}
      <OnboardingWizardModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onFinishOnboarding={handleFinishOnboarding}
        onShowToast={showToast}
      />

      {/* 6. Lock Screen PIN & Biometrics Modal */}
      <LockScreenModal
        isOpen={!securityConfig.isUnlocked}
        expectedPin={securityConfig.pinCode || '1234'}
        authMethod={securityConfig.appAuthMethod || 'os_system'}
        onUnlock={handleUnlockFromLockScreen}
        onShowToast={showToast}
      />

      {/* 7. RAM-Only Print Stream Modal */}
      <PrintModal
        isOpen={isPrintModalOpen}
        document={targetPrintDoc}
        onClose={() => setIsPrintModalOpen(false)}
        onShowToast={showToast}
      />

      {/* 8. PDF Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        document={targetExportDoc}
        defaultExportDir={securityConfig.exportDirectory}
        onClose={() => setIsExportModalOpen(false)}
        onShowToast={showToast}
      />

      {/* 9. Brand Upload Modal (Direct SVG/PNG Import) */}
      <BrandUploadModal
        isOpen={isBrandUploadOpen}
        onClose={() => setIsBrandUploadOpen(false)}
        onShowToast={showToast}
      />

      {/* 10. General / Technical Info Popups */}
      {infoTopic && (
        <InfoModal
          topic={infoTopic}
          onClose={() => setInfoTopic(null)}
        />
      )}

      {/* 11. Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900/95 text-slate-100 border border-cyan-500/40 rounded-xl px-4 py-2.5 shadow-2xl backdrop-blur-md text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
