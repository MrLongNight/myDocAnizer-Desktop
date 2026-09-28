import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  QrCode, 
  RefreshCw, 
  ShieldCheck, 
  Lock, 
  Key, 
  Fingerprint, 
  HardDrive, 
  FolderOpen, 
  Image, 
  Upload, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  Save, 
  RotateCcw, 
  HelpCircle, 
  Trash2, 
  Info,
  Clock,
  Sparkles,
  Layers,
  FileCheck
} from 'lucide-react';
import QRCode from 'qrcode';
import { VaultSecurityConfig, PairedDevice } from '../../types/document';
import { VaultService } from '../../services/vaultStorage';
import { MyDocAnizerBanner } from '../brand/MyDocAnizerBanner';
import { MyDocAnizerIcon } from '../brand/MyDocAnizerIcon';
import { InfoModal, InfoTopic } from '../common/InfoModal';

export type SettingsTabId = 'smartphone' | 'appAuth' | 'encryption' | 'storage' | 'brand' | 'audit';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsTabId;
  securityConfig: VaultSecurityConfig;
  onUpdateSecurityConfig: (config: VaultSecurityConfig) => void;
  pairedDevice: PairedDevice | null;
  onUpdatePairedDevice?: (device: PairedDevice | null) => void;
  onTriggerSync: () => void;
  syncState: 'idle' | 'syncing' | 'offline' | 'error';
  lastSyncFormatted?: string;
  onResetVault: () => void;
  onOpenBrandUpload?: () => void;
  onStartPairingWizard?: () => void;
  onOpenWizard?: () => void;
  onShowToast: (msg: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'smartphone',
  securityConfig,
  onUpdateSecurityConfig,
  pairedDevice,
  onUpdatePairedDevice,
  onTriggerSync,
  syncState,
  lastSyncFormatted = 'Gerade eben',
  onResetVault,
  onOpenBrandUpload,
  onStartPairingWizard,
  onOpenWizard,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTabId>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Form State
  const [appAuthMethod, setAppAuthMethod] = useState<'os_system' | 'pin' | 'none'>(securityConfig.appAuthMethod || 'os_system');
  const [pinCode, setPinCode] = useState<string>(securityConfig.pinCode || '1234');
  const [autoLockMinutes, setAutoLockMinutes] = useState<number>(securityConfig.autoLockMinutes ?? 15);
  const [decryptionMode, setDecryptionMode] = useState<'app_start' | 'on_demand' | 'os_startup'>(
    securityConfig.decryptionMode || 'app_start'
  );
  const [exportDir, setExportDir] = useState<string>(securityConfig.exportDirectory || 'C:\\Users\\Desktop\\Documents\\myDocAnizer-Export');

  // Info modal topic
  const [activeInfoTopic, setActiveInfoTopic] = useState<InfoTopic | null>(null);

  // QR code state for pairing tab
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  React.useEffect(() => {
    if (activeTab === 'smartphone') {
      const payload = JSON.stringify({
        app: 'myDocAnizer-Desktop',
        version: '1.4.2',
        protocol: 'mTLS-1.3-ECDH',
        desktopHost: '192.168.178.24',
        port: 9871,
        ecdhPublic: '04A81F2B3C4D5E6F708192A3B4C5D6E7F8091A2B3C4D5E6F708192A3B4C5D6E7',
        salt: '8F9E1A2B3C4D5E6F'
      });
      QRCode.toDataURL(payload, {
        width: 220,
        margin: 2,
        color: { dark: '#020617', light: '#FFFFFF' }
      }).then(url => setQrCodeDataUrl(url)).catch(() => {});
    }
  }, [activeTab]);

  if (!isOpen) return null;

  const handleSave = () => {
    const updated: VaultSecurityConfig = {
      ...securityConfig,
      appAuthMethod,
      pinCode,
      hasPin: appAuthMethod === 'pin',
      autoLockMinutes,
      decryptionMode,
      exportDirectory: exportDir,
      hasMasterKey: true
    };
    onUpdateSecurityConfig(updated);
    VaultService.saveSecurityConfig(updated);
    onShowToast('✅ Einstellungen erfolgreich übernommen!');
    onClose();
  };

  const handleRunRAMWipe = () => {
    const wiped = VaultService.wipeRAMDecryptionBuffers();
    onShowToast(`🧹 Arbeitsspeicher bereinigt: ${wiped} Dokumentpuffer im RAM rückstandslos genullt.`);
  };

  const handleFactoryReset = () => {
    if (confirm('Möchtest du den Dokumenten-Tresor wirklich auf die Standard-Beispieldaten zurücksetzen?')) {
      onResetVault();
      onShowToast('🔄 Dokumenten-Tresor zurückgesetzt');
      onClose();
    }
  };

  // Info topics
  const infoTopics: Record<string, InfoTopic> = {
    smartphoneSync: {
      title: 'WLAN-Synchronisation mit dem Smartphone',
      category: 'Netzwerk & Übertragung',
      simpleExplanation:
        'Dein PC und die myDocAnizer Mobile App tauschen Dokumente direkt über dein lokales WLAN aus. Kein Hochladen in fremde Clouds.',
      technicalDetails: [
        { label: 'Protokoll', value: 'mTLS 1.3 über TCP Port 9871' },
        { label: 'Kryptografie', value: 'ECDH P-256 Schlüsseltausch mit Ephemeral Session Keys' },
        { label: 'Zertifikatsprüfung', value: 'Gegenseitige Authentifizierung (Client + Server Certs)' }
      ]
    },
    authMethods: {
      title: 'App-Autorisierungsmethoden',
      category: 'Zugriffsschutz',
      simpleExplanation:
        'Wähle, wie du die Desktop-App entsperren möchtest. Bei „OS-Sicherheit“ nutzt die App komfortabel die Fingerabdruck- oder Gesichtserkennung deines Computers.',
      technicalDetails: [
        { label: 'Windows', value: 'Windows Hello / DPAPI' },
        { label: 'macOS', value: 'Touch ID / Keychain' },
        { label: 'Linux', value: 'PAM / Secret Service API' }
      ]
    },
    decryption: {
      title: 'Master-Key & Entschlüsselungsmodi',
      category: 'Dokumentenverschlüsselung',
      simpleExplanation:
        'Der Master-Key wurde aus deiner myDocAnizer Mobile App synchronisiert.\n\n• Standard: Entschlüsselt Dokumente beim Start der App, damit du ohne Verzögerung suchen und blättern kannst.\n• High-Secure: Entschlüsselt jedes Dokument erst beim Anklicken im flüchtigen RAM.\n• OS-Start: Bereitet den Tresor beim Booten des Computers vor.',
      technicalDetails: [
        { label: 'Algorithmus', value: 'AES-256-GCM mit 12-Byte Nonce und 16-Byte Auth Tag' },
        { label: 'KDF', value: 'PBKDF2-HMAC-SHA512 (100.000 Iterationen)' },
        { label: 'RAM-Hygiene', value: 'LRU-Puffer-Capping mit sicherem Memory-Wipe beim Schließen' }
      ]
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col h-[85vh] max-h-[750px]">
          {/* Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <MyDocAnizerIcon size={36} />
              <div>
                <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span>Einstellungen & Konfiguration</span>
                  <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded-full">
                    myDocAnizer Desktop
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  Smartphone-Sync, Zugriffsschutz, Master-Key & Krypto-Parameter
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-cyan-950/50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Speichern</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Settings Body with Responsive Tabs */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Tabs Navigation (Horizontal on mobile, vertical on desktop) */}
            <div className="w-full md:w-60 bg-slate-950/80 border-b md:border-b-0 md:border-r border-slate-800 p-2 md:p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto shrink-0 no-scrollbar">
              <div className="hidden md:block px-2 py-1 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Einstellungen
              </div>

              <button
                onClick={() => setActiveTab('smartphone')}
                className={`flex items-center gap-2 md:gap-3 px-3 py-2 md:p-2.5 rounded-xl text-left text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  activeTab === 'smartphone'
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Smartphone className="w-4 h-4 shrink-0" />
                <span className="truncate">Smartphone & Sync</span>
              </button>

              <button
                onClick={() => setActiveTab('appAuth')}
                className={`flex items-center gap-2 md:gap-3 px-3 py-2 md:p-2.5 rounded-xl text-left text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  activeTab === 'appAuth'
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Fingerprint className="w-4 h-4 shrink-0" />
                <span className="truncate">Zugriffsschutz</span>
              </button>

              <button
                onClick={() => setActiveTab('encryption')}
                className={`flex items-center gap-2 md:gap-3 px-3 py-2 md:p-2.5 rounded-xl text-left text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  activeTab === 'encryption'
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Key className="w-4 h-4 shrink-0" />
                <span className="truncate">Master-Key & Krypto</span>
              </button>

              <button
                onClick={() => setActiveTab('storage')}
                className={`flex items-center gap-2 md:gap-3 px-3 py-2 md:p-2.5 rounded-xl text-left text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  activeTab === 'storage'
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                }`}
              >
                <HardDrive className="w-4 h-4 shrink-0" />
                <span className="truncate">Speicher & Export</span>
              </button>

              <button
                onClick={() => setActiveTab('brand')}
                className={`flex items-center gap-2 md:gap-3 px-3 py-2 md:p-2.5 rounded-xl text-left text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  activeTab === 'brand'
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Image className="w-4 h-4 shrink-0" />
                <span className="truncate">Logo & Brand</span>
              </button>

              <button
                onClick={() => setActiveTab('audit')}
                className={`flex items-center gap-2 md:gap-3 px-3 py-2 md:p-2.5 rounded-xl text-left text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  activeTab === 'audit'
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Cpu className="w-4 h-4 shrink-0" />
                <span className="truncate">Krypto-Audit</span>
              </button>
            </div>

            {/* Right Tab Content Panel */}
            <div className="flex-1 p-6 overflow-y-auto bg-slate-900/60">
              {/* TAB 1: Smartphone & Sync */}
              {activeTab === 'smartphone' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-cyan-400" />
                        <span>Smartphone-Verbindung & WLAN-Sync</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Verwalte das gekoppelte Android-Gerät mit der myDocAnizer Mobile App.
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveInfoTopic(infoTopics.smartphoneSync)}
                      className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Erklärung & IT-Fakten</span>
                    </button>
                  </div>

                  {/* Paired Device Card */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
                          <Smartphone className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                            <span>{pairedDevice?.name || 'Google Pixel 8 Pro'}</span>
                            <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2 py-0.2 rounded-full">
                              Verbunden
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            myDocAnizer Mobile · Zuletzt synchronisiert: {lastSyncFormatted}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={onTriggerSync}
                          disabled={syncState === 'syncing'}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${syncState === 'syncing' ? 'animate-spin text-cyan-400' : ''}`} />
                          <span>{syncState === 'syncing' ? 'Synchronisiere...' : 'Jetzt abgleichen'}</span>
                        </button>

                        <button
                          onClick={onOpenWizard}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-colors"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Neu verbinden</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* QR Code Quick View */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                    <div className="p-2 bg-white rounded-xl shrink-0">
                      {qrCodeDataUrl ? (
                        <img src={qrCodeDataUrl} alt="QR Code" className="w-28 h-28 object-contain" />
                      ) : (
                        <div className="w-28 h-28 flex items-center justify-center text-slate-900">
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1 text-xs text-slate-300">
                      <div className="font-bold text-slate-100">Neues Smartphone anlernen</div>
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        Scanne diesen Code in der myDocAnizer Mobile App, um ein neues Smartphone autorisiert im lokalen WLAN hinzuzufügen.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: App Access Authorization */}
              {activeTab === 'appAuth' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                        <Fingerprint className="w-4 h-4 text-cyan-400" />
                        <span>App-Zugriffsschutz (Desktop-Autorisierung)</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Bestimme, wie du dich beim Öffnen der Desktop-App an diesem Computer ausweist.
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveInfoTopic(infoTopics.authMethods)}
                      className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Erklärung & Details</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <label
                      className={`p-3.5 rounded-2xl border cursor-pointer block transition-all ${
                        appAuthMethod === 'os_system'
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-slate-200 text-xs">
                        <input
                          type="radio"
                          name="authMethodTab"
                          checked={appAuthMethod === 'os_system'}
                          onChange={() => setAppAuthMethod('os_system')}
                          className="text-cyan-500"
                        />
                        <span>OS-Sicherheitsfunktionen (Empfohlen)</span>
                      </div>
                      <p className="text-[11px] text-slate-400 ml-6 mt-1">
                        Nutzt Windows Hello, Touch ID, Fingerabdruck oder dein Betriebssystem-Passwort.
                      </p>
                    </label>

                    <label
                      className={`p-3.5 rounded-2xl border cursor-pointer block transition-all ${
                        appAuthMethod === 'pin'
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-slate-200 text-xs">
                        <input
                          type="radio"
                          name="authMethodTab"
                          checked={appAuthMethod === 'pin'}
                          onChange={() => setAppAuthMethod('pin')}
                          className="text-cyan-500"
                        />
                        <span>Eigene 4- oder 6-stellige PIN</span>
                      </div>
                      <p className="text-[11px] text-slate-400 ml-6 mt-1">
                        Fragt bei jedem Öffnen oder nach Inaktivität nach deiner gewählten PIN.
                      </p>
                    </label>

                    {appAuthMethod === 'pin' && (
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3 ml-4">
                        <span className="text-xs text-slate-300 font-medium">PIN ändern:</span>
                        <input
                          type="password"
                          maxLength={6}
                          value={pinCode}
                          onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-cyan-300 tracking-widest font-mono focus:outline-none focus:border-cyan-500 w-28 text-center"
                          placeholder="1234"
                        />
                      </div>
                    )}

                    <label
                      className={`p-3.5 rounded-2xl border cursor-pointer block transition-all ${
                        appAuthMethod === 'none'
                          ? 'bg-amber-500/15 border-amber-500/50 text-amber-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-amber-300 text-xs">
                        <input
                          type="radio"
                          name="authMethodTab"
                          checked={appAuthMethod === 'none'}
                          onChange={() => setAppAuthMethod('none')}
                          className="text-amber-500"
                        />
                        <span>App-Sperre deaktivieren</span>
                      </div>
                      <p className="text-[11px] text-slate-400 ml-6 mt-1">
                        Die App öffnet direkt ohne Passwortabfrage.
                      </p>
                    </label>

                    {appAuthMethod === 'none' && (
                      <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-300 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>
                          Sicherheitshinweis: Jeder, der Zugriff auf dieses Benutzerkonto hat, kann deine Dokumente in der App einsehen.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Auto-Lock Timeout */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Automatisch sperren bei Inaktivität</span>
                    </label>
                    <select
                      value={autoLockMinutes}
                      onChange={(e) => setAutoLockMinutes(Number(e.target.value))}
                      disabled={appAuthMethod === 'none'}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 disabled:opacity-40"
                    >
                      <option value={1}>Nach 1 Minute Inaktivität</option>
                      <option value={5}>Nach 5 Minuten</option>
                      <option value={15}>Nach 15 Minuten (Empfohlen)</option>
                      <option value={30}>Nach 30 Minuten</option>
                      <option value={0}>Nie automatisch sperren</option>
                    </select>
                  </div>
                </div>
              )}

              {/* TAB 3: Master-Key & Decryption */}
              {activeTab === 'encryption' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                        <Key className="w-4 h-4 text-cyan-400" />
                        <span>Master-Key & Dokumenten-Entschlüsselung</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Steuere, wie deine AES-256 verschlüsselten Dokumente geladen werden.
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveInfoTopic(infoTopics.decryption)}
                      className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Erklärung & IT-Fakten</span>
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">Zentraler Master-Key vorhanden</div>
                        <div className="text-[11px] text-slate-400">
                          {securityConfig.masterKeyHint || 'Aus myDocAnizer Mobile synchronisiert'}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleRunRAMWipe}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs border border-slate-700/60 transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                      <span>RAM-Puffer jetzt leeren</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <label
                      className={`p-3.5 rounded-2xl border cursor-pointer block transition-all ${
                        decryptionMode === 'app_start'
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-slate-200 text-xs">
                        <input
                          type="radio"
                          name="decryptionModeTab"
                          checked={decryptionMode === 'app_start'}
                          onChange={() => setDecryptionMode('app_start')}
                          className="text-cyan-500"
                        />
                        <span>Standard: Dokumente beim App-Start entschlüsseln</span>
                      </div>
                      <p className="text-[11px] text-slate-400 ml-6 mt-1">
                        Master-Key im sicheren OS-Schlüsselspeicher hinterlegt. Blitzschnelle Suche und Vorschau.
                      </p>
                    </label>

                    <label
                      className={`p-3.5 rounded-2xl border cursor-pointer block transition-all ${
                        decryptionMode === 'on_demand'
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-slate-200 text-xs">
                        <input
                          type="radio"
                          name="decryptionModeTab"
                          checked={decryptionMode === 'on_demand'}
                          onChange={() => setDecryptionMode('on_demand')}
                          className="text-cyan-500"
                        />
                        <span>High-Secure: Immer erst bei individuellem Zugriff entschlüsseln</span>
                      </div>
                      <p className="text-[11px] text-slate-400 ml-6 mt-1">
                        Jedes Dokument wird erst im Moment des Anklickens kurzzeitig im flüchtigen RAM entschlüsselt.
                      </p>
                    </label>

                    <label
                      className={`p-3.5 rounded-2xl border cursor-pointer block transition-all ${
                        decryptionMode === 'os_startup'
                          ? 'bg-amber-500/15 border-amber-500/50 text-amber-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-amber-300 text-xs">
                        <input
                          type="radio"
                          name="decryptionModeTab"
                          checked={decryptionMode === 'os_startup'}
                          onChange={() => setDecryptionMode('os_startup')}
                          className="text-amber-500"
                        />
                        <span>Automatisch beim Computer-Start entschlüsseln</span>
                      </div>
                      <p className="text-[11px] text-slate-400 ml-6 mt-1">
                        Hintergrunddienst bereitet Dokumente direkt nach dem OS-Login vor.
                      </p>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 4: Storage & Export */}
              {activeTab === 'storage' && (
                <div className="space-y-6">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-cyan-400" />
                      <span>Speicherorte & PDF-Export-Verzeichnis</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Pfade für exportierte unverschlüsselte PDF-Dateien.
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <label className="block text-slate-300 font-semibold">Standard-Exportpfad</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={exportDir}
                        onChange={(e) => setExportDir(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        onClick={() => onShowToast(`📂 Ordner ${exportDir} ausgewählt`)}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 transition-colors flex items-center gap-1.5"
                      >
                        <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Durchsuchen</span>
                      </button>
                    </div>
                  </div>

                  {/* Reset Section */}
                  <div className="pt-6 border-t border-slate-800">
                    <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-800/40 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-rose-300">Tresor zurücksetzen</div>
                        <div className="text-[11px] text-slate-400">
                          Setzt alle Beispieldokumente und Einstellungen auf den Standardzustand zurück.
                        </div>
                      </div>
                      <button
                        onClick={handleFactoryReset}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Zurücksetzen</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: Brand & Logos */}
              {activeTab === 'brand' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                        <Image className="w-4 h-4 text-cyan-400" />
                        <span>Logos & Erscheinungsbild</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Offizielle myDocAnizer Vektor-Assets & eigene Logo-Dateien (.png / .svg).
                      </p>
                    </div>

                    {onOpenBrandUpload && (
                      <button
                        onClick={onOpenBrandUpload}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Eigene Logos laden</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center text-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center p-2">
                        <MyDocAnizerIcon size={48} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">myDocAnizer Icon</div>
                        <div className="text-[10px] text-slate-400 font-mono">Vektor SVG</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center text-center gap-3">
                      <div className="h-16 w-full rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center p-2">
                        <MyDocAnizerBanner variant="desktop" height={36} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">myDocAnizer Desktop Banner</div>
                        <div className="text-[10px] text-slate-400 font-mono">Vektor SVG</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: Crypto Audit (Nerd Zone) */}
              {activeTab === 'audit' && (
                <div className="space-y-6">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                      <span>Kryptografisches Sicherheits-Audit (Nerd-Zone)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Verifizierte Architekturparameter & Cipher-Spezifikationen.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase">Dokumenten-Verschlüsselung</span>
                      <div className="text-slate-200 font-bold">AES-256-GCM (Authentifiziert)</div>
                      <div className="text-[10px] text-slate-400">12-Byte Nonce + 16-Byte Auth Tag</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase">Datenbank-Verschlüsselung</span>
                      <div className="text-slate-200 font-bold">SQLCipher 4.6.1</div>
                      <div className="text-[10px] text-slate-400">PBKDF2-HMAC-SHA512 (100k Runden)</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase">Netzwerk-Transport</span>
                      <div className="text-slate-200 font-bold">mTLS 1.3 (RFC 8446)</div>
                      <div className="text-[10px] text-slate-400">ECDH P-256 Schlüsselaustausch</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase">RAM-Puffer Zustand</span>
                      <div className="text-emerald-400 font-bold">Zero-Plaintext on Disk</div>
                      <div className="text-[10px] text-slate-400">LRU Gecappt, automatisches Memset-Zeroing</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <InfoModal
        isOpen={!!activeInfoTopic}
        onClose={() => setActiveInfoTopic(null)}
        topic={activeInfoTopic}
      />
    </>
  );
};
