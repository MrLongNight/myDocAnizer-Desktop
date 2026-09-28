import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShieldCheck, 
  Shield,
  QrCode, 
  CheckCircle2, 
  Lock, 
  Smartphone, 
  Laptop, 
  ArrowRight, 
  ArrowLeft, 
  Loader2, 
  Key, 
  X, 
  Info, 
  Fingerprint, 
  AlertTriangle,
  Zap,
  HelpCircle,
  HardDrive,
  Wifi,
  ArrowRightLeft,
  Cpu,
  ScanLine,
  FolderLock,
  RefreshCw,
  FileText,
  Sparkles,
  BookOpen,
  Eye
} from 'lucide-react';
import QRCode from 'qrcode';
import { MyDocAnizerIcon } from '../brand/MyDocAnizerIcon';
import { MyDocAnizerBanner } from '../brand/MyDocAnizerBanner';
import { InfoModal, InfoTopic } from '../common/InfoModal';
import { VaultSecurityConfig } from '../../types/document';

interface OnboardingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinishOnboarding: (configUpdates: Partial<VaultSecurityConfig>) => void;
  onShowToast: (msg: string) => void;
}

export const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({
  isOpen,
  onClose,
  onFinishOnboarding,
  onShowToast
}) => {
  const [step, setStep] = useState<number>(1);
  const [step1SubTab, setStep1SubTab] = useState<'graphic' | 'explanations'>('graphic');
  const [animPhase, setAnimPhase] = useState<1 | 2 | 3 | 4>(1);
  const [isAnimPlaying, setIsAnimPlaying] = useState<boolean>(true);

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [syncDownloadProgress, setSyncDownloadProgress] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Auto-play timer for step 1 animation sequence
  useEffect(() => {
    if (!isAnimPlaying || step1SubTab !== 'graphic' || step !== 1) return;
    const timer = setInterval(() => {
      setAnimPhase(prev => (prev >= 4 ? 1 : (prev + 1) as 1 | 2 | 3 | 4));
    }, 3500);
    return () => clearInterval(timer);
  }, [isAnimPlaying, step1SubTab, step]);

  // Configuration Choices
  const [appAuthMethod, setAppAuthMethod] = useState<'os_system' | 'pin' | 'none'>('os_system');
  const [pinCode, setPinCode] = useState<string>('1234');
  const [decryptionMode, setDecryptionMode] = useState<'app_start' | 'on_demand' | 'os_startup'>('app_start');

  // Info Modal state for Noobs & Nerds
  const [activeInfoTopic, setActiveInfoTopic] = useState<InfoTopic | null>(null);

  const downloadTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepTransitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stable pairing payload
  const pairingPayload = useMemo(() => {
    return JSON.stringify({
      app: 'myDocAnizer-Desktop',
      version: '1.4.2',
      protocol: 'mTLS-1.3-ECDH',
      desktopHost: '192.168.178.24',
      port: 9871,
      ecdhPublic: '04A81F2B3C4D5E6F708192A3B4C5D6E7F8091A2B3C4D5E6F708192A3B4C5D6E7',
      salt: '8F9E1A2B3C4D5E6F'
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(pairingPayload, {
      width: 260,
      margin: 2,
      color: {
        dark: '#020617',
        light: '#FFFFFF'
      }
    })
      .then(url => {
        if (isMounted) setQrCodeDataUrl(url);
      })
      .catch(e => {
        if (isMounted) console.error('Failed to generate connection QR code', e);
      });

    return () => {
      isMounted = false;
    };
  }, [pairingPayload]);

  useEffect(() => {
    return () => {
      if (downloadTimerRef.current) clearInterval(downloadTimerRef.current);
      if (stepTransitionTimeoutRef.current) clearTimeout(stepTransitionTimeoutRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const handleSimulatePhoneScanned = () => {
    setStep(3);
    setIsDownloading(true);
    setSyncDownloadProgress(10);

    if (downloadTimerRef.current) clearInterval(downloadTimerRef.current);

    downloadTimerRef.current = setInterval(() => {
      setSyncDownloadProgress(prev => {
        if (prev >= 95) {
          if (downloadTimerRef.current) clearInterval(downloadTimerRef.current);
          stepTransitionTimeoutRef.current = setTimeout(() => {
            setIsDownloading(false);
            setStep(4);
            onShowToast('🎉 Dokumente & Master-Key erfolgreich synchronisiert!');
          }, 450);
          return 100;
        }
        return prev + 18;
      });
    }, 240);
  };

  const handleComplete = () => {
    if (downloadTimerRef.current) clearInterval(downloadTimerRef.current);
    if (stepTransitionTimeoutRef.current) clearTimeout(stepTransitionTimeoutRef.current);

    onFinishOnboarding({
      appAuthMethod,
      pinCode: pinCode || '1234',
      hasPin: appAuthMethod === 'pin',
      decryptionMode,
      hasMasterKey: true,
      masterKeyHint: 'Master-Key aus myDocAnizer Mobile (Synchronisiert)'
    });
    onClose();
  };

  // Info topics for Popups
  const infoTopics: Record<string, InfoTopic> = {
    connectionSecurity: {
      title: 'Direkte verschlüsselte Verbindung',
      category: 'Netzwerk & Datenschutz',
      simpleExplanation:
        'Dein PC und dein Smartphone verbinden sich direkt in deinem heimischen WLAN miteinander. Deine Daten verlassen dieses Netzwerk nicht, es sei denn, du richtest selbst aktiv eine Cloud-Sicherung (wie z.B. Google Drive) ein.',
      technicalDetails: [
        { label: 'Protokoll', value: 'mTLS 1.3 (RFC 8446) gegenseitig zertifiziert' },
        { label: 'Kanalverschlüsselung', value: 'AES-256-GCM / ChaCha20-Poly1305' },
        { label: 'Schlüsselaustausch', value: 'ECDH P-256 (Ephemeral, Perfect Forward Secrecy)' },
        { label: 'Serverlose P2P-Topologie', value: 'Keine Drittanbieter-Relay-Server im Standardbetrieb' }
      ],
      privacyNote: 'Keine Registrierung, kein Cloud-Zwang, volle Datenhoheit auf deiner eigenen Hardware.'
    },
    localNetwork: {
      title: '100% Privates Heimnetzwerk & Cloud-Freiheit',
      category: 'Netzwerkarchitektur',
      simpleExplanation:
        'myDocAnizer funktioniert vollständig offline und lokal. Der Datenaustausch zwischen PC und Smartphone findet auf kürzestem Weg in deinem eigenen WLAN statt. Externe Cloud-Server sehen deine Dokumente zu keinem Zeitpunkt – außer du aktivierst z.B. Google Drive selbst ganz gezielt.',
      technicalDetails: [
        { label: 'Topologie', value: 'Reines lokales LAN/WLAN ohne Cloud-Relay' },
        { label: 'Cloud-Status', value: 'Zero-Cloud by default; Cloud nur auf expliziten Nutzerbefehl' },
        { label: 'DNS / Externe Calls', value: 'Keine Telemetrie oder Dokumenten-Uploads an Fremdserver' }
      ]
    },
    masterKeySecurity: {
      title: 'Zentraler Master-Key Schutz',
      category: 'Kryptografie & Schlüsselverwaltung',
      simpleExplanation:
        'Da du myDocAnizer Mobile bereits eingerichtet hast, existiert dein Master-Key bereits. Er dient als zentraler Schlüssel für die Dokumentenverschlüsselung. Beim Verbinden wird er durch den verschlüsselten mTLS-Kanal auf deinen PC übertragen.',
      technicalDetails: [
        { label: 'Key Derivation', value: 'Argon2id / PBKDF2 mit individuellem Salt' },
        { label: 'Cipher', value: 'AES-256-GCM mit 12-Byte Nonce & 16-Byte Auth Tag' },
        { label: 'Schlüsselspeicher', value: 'Sichere OS-Schlüsselverwaltung (Windows Hello / DPAPI)' }
      ]
    },
    ramSecurity: {
      title: 'Zero-Plaintext & RAM-Sicherheit',
      category: 'Speichersicherheit & Forensik',
      simpleExplanation:
        'Dokumente werden auf der PC-Festplatte ausschließlich verschlüsselt (*.enc) abgelegt. Beim Betrachten oder Bearbeiten wird das Dokument nur kurzzeitig im flüchtigen Arbeitsspeicher (RAM) gehalten und beim Sperren der App sofort rückstandslos genullt.',
      technicalDetails: [
        { label: 'Festplatten-Format', value: 'Reine Binär-Ciphertexte (*.enc) ohne Klartext-Header' },
        { label: 'RAM-Verwaltung', value: 'In-Memory Decryption Buffer mit LRU-Begrenzung' },
        { label: 'Zeroing-Protokoll', value: 'Sicheres Überschreiben (memset_s Simulation) beim App-Lock' }
      ]
    },
    appAuth: {
      title: 'App-Autorisierung vs. Daten-Verschlüsselung',
      category: 'Sicherheitskonzept',
      simpleExplanation:
        'Die App-Autorisierung schützt das Öffnen dieses Programms auf deinem Computer (z.B. mit deinem Fingerabdruck, Windows Hello, Touch ID oder einer PIN). Die eigentliche Dokumenten-Verschlüsselung arbeitet unabhängig davon mit deinem persönlichen Master-Key.',
      technicalDetails: [
        { label: 'System-Authentifizierung', value: 'OS Credential Manager / Biometrie API' },
        { label: 'Schlüsselspeicher', value: 'Windows DPAPI / macOS Keychain / Linux Secret Service' },
        { label: 'Trennung der Ebenen', value: 'UI-Zugangssperre getrennt von AES-256 Verschlüsselungsebene' }
      ]
    },
    decryptionModes: {
      title: 'Optionen zur Dokumenten-Entschlüsselung',
      category: 'Schlüsselverwaltung & Performance',
      simpleExplanation:
        'Da du bereits myDocAnizer Mobile nutzt, existiert dein Master-Key bereits. Du entscheidest, wie komfortabel Dokumente auf diesem Computer geöffnet werden:\n\n• Standard: Dokumente werden beim App-Start entschlüsselt, damit die Suche und Vorschau blitzschnell sind.\n• High-Secure: Jedes Dokument wird erst im Moment des Anklickens einzeln entschlüsselt.\n• Auto-Entschlüsselung bei Systemstart: Bereitet den Tresor schon beim Hochfahren vor.',
      technicalDetails: [
        { label: 'Master-Key Herkunft', value: 'PBKDF2 / Argon2id deriviert aus Mobil-Passkey' },
        { label: 'RAM-Sicherheit', value: 'Entschlüsselte Inhalte verbleiben im flüchtigen Speicher und werden nie im Klartext auf die Festplatte geschrieben.' }
      ]
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <MyDocAnizerIcon size={38} glow={true} />
              <div>
                <div className="flex items-center gap-2 flex-nowrap">
                  <h2 className="text-base font-bold text-slate-100 whitespace-nowrap">Verbindungs-Assistent</h2>
                  <span className="text-[10px] bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-full font-mono font-bold whitespace-nowrap shrink-0">
                    Schritt {step} | 4
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {step === 1 && 'Willkommen & Sicherheit'}
                  {step === 2 && 'Smartphone verbinden (QR-Code)'}
                  {step === 3 && 'Dokumente übertragen'}
                  {step === 4 && 'Zugriff & Verschlüsselung konfigurieren'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="grid grid-cols-4 h-1.5 bg-slate-800 shrink-0">
            <div className={`h-full transition-all duration-300 ${step >= 1 ? 'bg-cyan-400' : ''}`} />
            <div className={`h-full transition-all duration-300 ${step >= 2 ? 'bg-cyan-400' : ''}`} />
            <div className={`h-full transition-all duration-300 ${step >= 3 ? 'bg-cyan-400' : ''}`} />
            <div className={`h-full transition-all duration-300 ${step >= 4 ? 'bg-cyan-400' : ''}`} />
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-6">
            {/* STEP 1: Brand Intro & Security */}
            {step === 1 && (
              <div className="space-y-5">
                {/* Step 1 Mode Toggle (Aufsplittung in Schaubild / Erklärungen) */}
                <div className="flex items-center justify-center p-1 bg-slate-950 border border-slate-800 rounded-2xl max-w-md mx-auto shadow-inner">
                  <button
                    type="button"
                    onClick={() => setStep1SubTab('graphic')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      step1SubTab === 'graphic'
                        ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md shadow-cyan-950/50'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5 shrink-0" />
                    <span>Schaubild & Live-Sync</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep1SubTab('explanations')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      step1SubTab === 'explanations'
                        ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md shadow-cyan-950/50'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span>Verständliche Erklärungen</span>
                  </button>
                </div>

                {/* VIEW A: DEDICATED GRAPHIC & DYNAMIC WORKFLOW ANIMATION */}
                {step1SubTab === 'graphic' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden space-y-4">
                      {/* Ambient Dynamic Background Glows based on Active Phase */}
                      <div className={`absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-72 blur-3xl pointer-events-none rounded-full transition-all duration-700 ${
                        animPhase === 4 ? 'bg-emerald-500/20' : 'bg-cyan-500/15'
                      }`} />
                      <div className={`absolute top-1/2 right-1/4 -translate-y-1/2 w-72 h-72 blur-3xl pointer-events-none rounded-full transition-all duration-700 ${
                        animPhase === 2 ? 'bg-pink-500/25' : 'bg-teal-500/15'
                      }`} />

                      {/* Header & Playback Controls inside Graphic Card */}
                      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                          <span className="text-xs font-bold text-slate-100">
                            Funktionsweise: myDocAnizer Desktop ⇆ Mobile
                          </span>
                        </div>

                        {/* Interactive Phase Control Selector */}
                        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setIsAnimPlaying(!isAnimPlaying)}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-cyan-300 transition-colors flex items-center gap-1"
                            title={isAnimPlaying ? 'Animation pausieren' : 'Animation automatisch abspielen'}
                          >
                            <span>{isAnimPlaying ? '⏸ Pause' : '▶ Play'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => { setAnimPhase(1); setIsAnimPlaying(true); }}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 transition-colors"
                            title="Ablauf neu starten"
                          >
                            🔄 Reset
                          </button>
                        </div>
                      </div>

                      {/* Timeline Step Navigation Bar */}
                      <div className="relative z-10 grid grid-cols-4 gap-1.5 p-1 bg-slate-900/80 rounded-2xl border border-slate-800/80">
                        {[
                          { num: 1, title: '1. WLAN-Kopplung', color: 'cyan' },
                          { num: 2, title: '2. Beleg Scannen', color: 'pink' },
                          { num: 3, title: '3. P2P-Transfer', color: 'teal' },
                          { num: 4, title: '4. AES-256 Tresor', color: 'emerald' }
                        ].map((item) => (
                          <button
                            key={item.num}
                            type="button"
                            onClick={() => {
                              setAnimPhase(item.num as 1 | 2 | 3 | 4);
                              setIsAnimPlaying(false);
                            }}
                            className={`py-1.5 px-1 rounded-xl text-[10px] font-bold transition-all text-center truncate ${
                              animPhase === item.num
                                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md scale-102'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                            }`}
                          >
                            {item.title}
                          </button>
                        ))}
                      </div>

                      {/* Main Dynamic Animation Stage */}
                      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 py-3 min-h-[170px]">
                        
                        {/* LEFT: myDocAnizer Desktop */}
                        <div className={`flex flex-col items-center text-center p-3 rounded-2xl transition-all duration-300 w-full md:w-auto ${
                          animPhase === 4 
                            ? 'bg-slate-900 border-2 border-emerald-500/60 shadow-xl shadow-emerald-950/40 scale-105' 
                            : animPhase === 1 
                            ? 'bg-slate-900 border border-cyan-500/50 shadow-lg' 
                            : 'bg-slate-900/60 border border-slate-800'
                        }`}>
                          <div className="relative p-2 rounded-xl bg-slate-950 border border-slate-800">
                            <MyDocAnizerBanner variant="desktop" height={44} />
                            {animPhase === 4 && (
                              <span className="absolute -top-2 -right-2 p-1 rounded-full bg-emerald-500 text-slate-950 shadow-lg animate-bounce">
                                <ShieldCheck className="w-4 h-4" />
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-2">
                            <Laptop className="w-4 h-4 text-cyan-400" />
                            <span className="text-xs font-bold text-slate-100">myDocAnizer Desktop</span>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-0.5">PC Arbeitsbereich & Tresor</span>
                          
                          <div className={`mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-medium transition-all ${
                            animPhase === 4 
                              ? 'bg-emerald-950 border border-emerald-500/60 text-emerald-300 font-bold' 
                              : 'bg-cyan-950/60 border border-cyan-800/40 text-cyan-200'
                          }`}>
                            <FolderLock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>Dateien verschlüsselt gespeichert</span>
                          </div>
                        </div>

                        {/* CENTER: WLAN Bridge & Active Animation Elements */}
                        <div className="flex-1 flex flex-col items-center justify-center max-w-[260px] w-full px-2 my-1 md:my-0">
                          
                          {/* Connection Badge */}
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-[10px] font-semibold shadow-md">
                            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Direktes Heim-WLAN</span>
                          </div>

                          {/* Dynamic Wireless Stream Canvas */}
                          <div className="w-full relative flex items-center justify-center my-4 h-12">
                            {/* Connecting Line Base */}
                            <div className="absolute inset-x-0 h-1 bg-slate-800 rounded-full overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/40 via-teal-400 to-pink-500/40" />
                            </div>

                            {/* Phase 1: Radar Waves (Pairing Handshake) */}
                            {animPhase === 1 && (
                              <div className="relative flex items-center justify-center">
                                <div className="absolute w-12 h-12 rounded-full border border-cyan-400/60 animate-radar-expand pointer-events-none" />
                                <div className="p-2 rounded-xl bg-slate-900 border border-cyan-500/50 text-cyan-300 shadow-lg z-10 flex items-center gap-1">
                                  <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
                                  <span className="text-[10px] font-mono font-bold">mTLS Handshake</span>
                                </div>
                              </div>
                            )}

                            {/* Phase 2: Scanning Pulse Node */}
                            {animPhase === 2 && (
                              <div className="p-2 rounded-xl bg-slate-900 border border-pink-500/60 text-pink-300 shadow-lg z-10 flex items-center gap-1.5 animate-pulse">
                                <ScanLine className="w-4 h-4 text-pink-400" />
                                <span className="text-[10px] font-mono font-bold">Kamera-Erfassung</span>
                              </div>
                            )}

                            {/* Phase 3: Flying Encrypted Document Packet */}
                            {animPhase === 3 && (
                              <div className="absolute z-20 top-1/2 -translate-y-1/2 animate-doc-flight flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-pink-500 to-teal-400 text-slate-950 text-[10px] font-bold shadow-xl border border-white/40">
                                <FileText className="w-3.5 h-3.5" />
                                <span>Rechnung.enc</span>
                                <Lock className="w-3 h-3 text-slate-950" />
                              </div>
                            )}

                            {/* Phase 4: Vault Arrival Checkmark */}
                            {animPhase === 4 && (
                              <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-500/60 text-emerald-300 shadow-lg z-10 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span className="text-[10px] font-mono font-bold">Tresor Gesichert</span>
                              </div>
                            )}
                          </div>

                          {/* Security Status */}
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Shield className="w-3 h-3 text-emerald-400" />
                            <span>100% Privat ohne Cloud-Zwang</span>
                          </div>
                        </div>

                        {/* RIGHT: myDocAnizer Mobile */}
                        <div className={`flex flex-col items-center text-center p-3 rounded-2xl transition-all duration-300 w-full md:w-auto ${
                          animPhase === 2 
                            ? 'bg-slate-900 border-2 border-pink-500/60 shadow-xl shadow-pink-950/40 scale-105' 
                            : animPhase === 3
                            ? 'bg-slate-900 border border-teal-500/50 shadow-lg'
                            : 'bg-slate-900/60 border border-slate-800'
                        }`}>
                          <div className="relative p-2 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                            {/* Laser sweep overlay during scanning phase */}
                            {animPhase === 2 && (
                              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent shadow-[0_0_8px_rgba(244,114,182,1)] animate-laser-sweep pointer-events-none z-10" />
                            )}
                            <MyDocAnizerBanner variant="mobile" height={44} />
                          </div>
                          <div className="flex items-center gap-1.5 mt-2">
                            <Smartphone className="w-4 h-4 text-pink-400" />
                            <span className="text-xs font-bold text-slate-100">myDocAnizer Mobile</span>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-0.5">Smartphone App & Scanner</span>

                          <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-pink-950/60 border border-pink-800/40 text-[10px] text-pink-200 font-medium">
                            <ScanLine className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                            <span>Integrierter Handy-Scanner</span>
                          </div>
                        </div>
                      </div>

                      {/* Phase Live Explanatory Text Banner */}
                      <div className="relative z-10 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex items-start gap-3 shadow-inner">
                        <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 shrink-0 mt-0.5">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-slate-100">
                            {animPhase === 1 && '1. Automatische Erkennung im Heim-WLAN'}
                            {animPhase === 2 && '2. Mobiler Handy-Scanner mit Auto-Korrektur'}
                            {animPhase === 3 && '3. Verschlüsselter P2P-Sync direkt auf deinen PC'}
                            {animPhase === 4 && '4. Sichere Ablage im lokalen AES-256 Tresor'}
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            {animPhase === 1 && 'Smartphone und PC finden sich automatisch in deinem eigenen Heimnetzwerk und tauschen kryptografische Handshake-Schlüssel aus.'}
                            {animPhase === 2 && 'Du fotografierst Belege oder Dokumente mit der myDocAnizer Mobile App. Der Scanner schneidet Ränder automatisch zu und schärft den Text.'}
                            {animPhase === 3 && 'Das Dokument reist verschlüsselt über dein lokales WLAN direkt an deinen PC. Es berührt zu keinem Zeitpunkt externe Cloud-Server.'}
                            {animPhase === 4 && 'Das Dokument trifft im PC-Arbeitsbereich ein und wird sofort geschützt im AES-256 Tresor auf deiner Festplatte hinterlegt.'}
                          </p>
                        </div>
                      </div>

                      {/* 3 Core Pillars Summary Cards */}
                      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2">
                          <FolderLock className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span className="text-[11px] font-medium text-slate-200">Dateien verschlüsselt gespeichert</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2">
                          <ScanLine className="w-4 h-4 text-pink-400 shrink-0" />
                          <span className="text-[11px] font-medium text-slate-200">Handy-Scanner inklusive</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-[11px] font-medium text-slate-200">100% Privat ohne Cloud-Zwang</span>
                        </div>
                      </div>
                    </div>

                    {/* Navigation helper */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400">
                        Möchtest du alle Details im Klartext lesen?
                      </span>
                      <button
                        type="button"
                        onClick={() => setStep1SubTab('explanations')}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 hover:underline"
                      >
                        <span>Zu den Erklärungen</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* VIEW B: DEDICATED EXPLANATIONS (Ohne Fachbegriffe, mit Fakten-Buttons) */}
                {step1SubTab === 'explanations' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Sicherheitskonzept & Funktionsweise</span>
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        myDocAnizer Desktop verbindet sich direkt mit deiner myDocAnizer Mobile App. Die 4 wichtigsten Säulen einfach erklärt:
                      </p>
                    </div>

                    {/* The 4 Key Security Features Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Card 1: Verschlüsselte Übertragung */}
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 transition-colors flex flex-col justify-between space-y-2.5">
                        <div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                              <Lock className="w-4 h-4 text-cyan-400" />
                              <span>Verschlüsselte Übertragung</span>
                            </div>
                            <button
                              onClick={() => setActiveInfoTopic(infoTopics.connectionSecurity)}
                              className="text-[10px] text-cyan-400 hover:text-cyan-200 bg-cyan-950/60 border border-cyan-800/40 px-2.5 py-0.5 rounded-md flex items-center gap-1"
                              title="Technische Details"
                            >
                              <HelpCircle className="w-3 h-3" />
                              <span>Fakten</span>
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                            Wie ein geschützter Datentresor: Alle Dokumente werden während der Übertragung abhörsicher verschlüsselt. Niemand im WLAN kann mitlesen.
                          </p>
                        </div>
                        <div className="text-[10px] font-medium text-slate-500">
                          Ende-zu-Ende geschützte Übertragung
                        </div>
                      </div>

                      {/* Card 2: 100% Lokales Heimnetzwerk */}
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 transition-colors flex flex-col justify-between space-y-2.5">
                        <div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                              <Wifi className="w-4 h-4 text-emerald-400" />
                              <span>100% Privates Heimnetzwerk</span>
                            </div>
                            <button
                              onClick={() => setActiveInfoTopic(infoTopics.localNetwork)}
                              className="text-[10px] text-emerald-400 hover:text-emerald-200 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-0.5 rounded-md flex items-center gap-1"
                              title="Technische Details"
                            >
                              <HelpCircle className="w-3 h-3" />
                              <span>Fakten</span>
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                            Reine Direktverbindung. Deine Dokumente verlassen dein Heimnetzwerk nicht – außer du richtest selbst aktiv ein Cloud-Backup (z.B. Google Drive) ein.
                          </p>
                        </div>
                        <div className="text-[10px] font-medium text-slate-500">
                          Ohne Cloud-Zwang · Rein lokal im Heimnetz
                        </div>
                      </div>

                      {/* Card 3: Zentraler Tresor-Schlüssel */}
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 transition-colors flex flex-col justify-between space-y-2.5">
                        <div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                              <Key className="w-4 h-4 text-cyan-400" />
                              <span>Sicherer Tresor-Schlüssel</span>
                            </div>
                            <button
                              onClick={() => setActiveInfoTopic(infoTopics.masterKeySecurity)}
                              className="text-[10px] text-cyan-400 hover:text-cyan-200 bg-cyan-950/60 border border-cyan-800/40 px-2.5 py-0.5 rounded-md flex items-center gap-1"
                              title="Technische Details"
                            >
                              <HelpCircle className="w-3 h-3" />
                              <span>Fakten</span>
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                            Dein persönlicher Schlüssel aus myDocAnizer Mobile sichert alle Dokumente ab. Nur du besitzt den passenden Schlüssel zur Entschlüsselung.
                          </p>
                        </div>
                        <div className="text-[10px] font-medium text-slate-500">
                          Dateien sind verschlüsselt gespeichert
                        </div>
                      </div>

                      {/* Card 4: Rückstandsfreier Speicher */}
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-teal-500/40 transition-colors flex flex-col justify-between space-y-2.5">
                        <div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold text-teal-300">
                              <Cpu className="w-4 h-4 text-teal-400" />
                              <span>Geschützter Speicher</span>
                            </div>
                            <button
                              onClick={() => setActiveInfoTopic(infoTopics.ramSecurity)}
                              className="text-[10px] text-teal-400 hover:text-teal-200 bg-teal-950/60 border border-teal-800/40 px-2.5 py-0.5 rounded-md flex items-center gap-1"
                              title="Technische Details"
                            >
                              <HelpCircle className="w-3 h-3" />
                              <span>Fakten</span>
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                            Dokumente liegen geschützt auf der Festplatte. Bei der Anzeige verbleiben sie sicher im flüchtigen Speicher und hinterlassen keine ungeschützten Spuren.
                          </p>
                        </div>
                        <div className="text-[10px] font-medium text-slate-500">
                          Sicherer Tresor ohne unverschlüsselte Kopien
                        </div>
                      </div>
                    </div>

                    {/* Back to diagram button */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => setStep1SubTab('graphic')}
                        className="text-xs text-slate-400 hover:text-slate-200 font-medium flex items-center gap-1"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span>Zurück zum Schaubild</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: QR Code Scan */}
            {step === 2 && (
              <div className="space-y-5 text-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    Scanne den QR-Code mit der myDocAnizer Mobile App
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Öffne die <strong>myDocAnizer Mobile App</strong> auf deinem Smartphone, tippe auf das Menü und wähle <em>PC verbinden</em>.
                  </p>
                </div>

                <div className="flex items-center justify-center p-4 bg-white rounded-2xl max-w-[240px] mx-auto shadow-xl">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="Verbindungs-QR-Code"
                      className="w-full h-auto object-contain"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-slate-800">
                      <Loader2 className="w-7 h-7 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="pt-2 flex flex-col items-center gap-2">
                  <button
                    onClick={handleSimulatePhoneScanned}
                    className="px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span>Smartphone hat QR-Code gescannt (Weiter)</span>
                  </button>
                  <span className="text-[11px] text-slate-500">
                    Die Verbindung wird automatisch erkannt, sobald die Kamera den Code erfasst.
                  </span>
                </div>
              </div>
            )}

            {/* STEP 3: Initial Download & Master-Key Sync */}
            {step === 3 && (
              <div className="space-y-6 text-center py-6">
                {/* Visual Direct P2P Device-to-Device Sync (No generic cloud icon) */}
                <div className="flex items-center justify-center gap-4 text-slate-300">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center shadow-lg">
                    <Smartphone className="w-7 h-7 text-pink-400" />
                    <span className="text-[10px] text-slate-400 mt-1 font-mono">Mobile</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1 text-cyan-400">
                      <span className="w-6 h-0.5 bg-cyan-500/50"></span>
                      <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-md">
                        <Lock className="w-4 h-4 animate-pulse" />
                      </div>
                      <span className="w-6 h-0.5 bg-cyan-500/50"></span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-300 mt-1 font-semibold">
                      Lokaler mTLS Datentunnel
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center shadow-lg">
                    <Laptop className="w-7 h-7 text-cyan-400" />
                    <span className="text-[10px] text-slate-400 mt-1 font-mono">Desktop</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-100">
                    {isDownloading ? 'Dokumente & Master-Key werden synchronisiert...' : 'Synchronisation abgeschlossen!'}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    Deine vorhandenen Dokumente und der verschlüsselte Master-Key aus dem myDocAnizer Mobile Tresor werden über das lokale Netzwerk auf deinen PC übertragen.
                  </p>
                </div>

                <div className="space-y-2 max-w-sm mx-auto">
                  <div className="flex justify-between text-xs font-mono text-slate-300">
                    <span>Verschlüsselter P2P-Transfer</span>
                    <span className="text-cyan-400 font-bold">{syncDownloadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-teal-400 h-full transition-all duration-200"
                      style={{ width: `${syncDownloadProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: App Authorization & Document Decryption Options */}
            {step === 4 && (
              <div className="space-y-6">
                {/* Intro Explanation */}
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-100">
                    Zugriffsschutz & Dokumenten-Verschlüsselung konfigurieren
                  </h3>
                  <p className="text-xs text-slate-400">
                    Passe an, wie du dich an diesem Computer autorisierst und wie deine verschlüsselten Dokumente geladen werden.
                  </p>
                </div>

                {/* Section A: App Access Authorization */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Fingerprint className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-xs font-bold text-slate-200">
                        1. Zugriff auf die Desktop-App absichern
                      </h4>
                    </div>

                    <button
                      onClick={() => setActiveInfoTopic(infoTopics.appAuth)}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Erklärung</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <label
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        appAuthMethod === 'os_system'
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200 shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="radio"
                          name="appAuthMethod"
                          checked={appAuthMethod === 'os_system'}
                          onChange={() => setAppAuthMethod('os_system')}
                          className="text-cyan-500"
                        />
                        <span className="font-bold text-slate-200">OS-Sicherheit</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Windows Hello / Touch ID / Systempasswort
                      </p>
                    </label>

                    <label
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        appAuthMethod === 'pin'
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200 shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="radio"
                          name="appAuthMethod"
                          checked={appAuthMethod === 'pin'}
                          onChange={() => setAppAuthMethod('pin')}
                          className="text-cyan-500"
                        />
                        <span className="font-bold text-slate-200">Eigene PIN</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        4- oder 6-stellige Tresor-PIN für die App
                      </p>
                    </label>

                    <label
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        appAuthMethod === 'none'
                          ? 'bg-amber-500/15 border-amber-500/50 text-amber-200 shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="radio"
                          name="appAuthMethod"
                          checked={appAuthMethod === 'none'}
                          onChange={() => setAppAuthMethod('none')}
                          className="text-amber-500"
                        />
                        <span className="font-bold text-amber-300">Ohne Abfrage</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        App öffnet direkt ohne Sperrbildschirm
                      </p>
                    </label>
                  </div>

                  {appAuthMethod === 'pin' && (
                    <div className="pt-2 flex items-center gap-3">
                      <span className="text-xs text-slate-300 font-medium">PIN festlegen:</span>
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

                  {appAuthMethod === 'none' && (
                    <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-300 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>
                        Sicherheitshinweis: Jeder Nutzer mit Zugang zu diesem Computer kann die App ohne Passwort öffnen. Die Dokumentendateien bleiben dennoch per Master-Key verschlüsselt.
                      </span>
                    </div>
                  )}
                </div>

                {/* Section B: Document Decryption & Master-Key Management */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-xs font-bold text-slate-200">
                        2. Entschlüsselung der Dokumente (Master-Key)
                      </h4>
                    </div>

                    <button
                      onClick={() => setActiveInfoTopic(infoTopics.decryptionModes)}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Erklärung</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Der zentrale Master-Key wurde aus deinem bestehenden myDocAnizer Mobile Tresor übertragen. Wähle den gewünschten Modus:
                  </p>

                  <div className="space-y-2 text-xs">
                    <label
                      className={`p-3 rounded-xl border cursor-pointer transition-all block ${
                        decryptionMode === 'app_start'
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-slate-200">
                        <input
                          type="radio"
                          name="decryptionMode"
                          checked={decryptionMode === 'app_start'}
                          onChange={() => setDecryptionMode('app_start')}
                          className="text-cyan-500"
                        />
                        <span>Standard (Empfohlen): Beim Start der App entschlüsseln</span>
                      </div>
                      <p className="text-[11px] text-slate-400 ml-6 mt-1">
                        Der Master-Key wird im sicheren OS-Schlüsselspeicher hinterlegt. Sofortige Volltextsuche & flüssige Vorschau.
                      </p>
                    </label>

                    <label
                      className={`p-3 rounded-xl border cursor-pointer transition-all block ${
                        decryptionMode === 'on_demand'
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-slate-200">
                        <input
                          type="radio"
                          name="decryptionMode"
                          checked={decryptionMode === 'on_demand'}
                          onChange={() => setDecryptionMode('on_demand')}
                          className="text-cyan-500"
                        />
                        <span>High-Secure: Immer erst bei individuellem Zugriff entschlüsseln</span>
                      </div>
                      <p className="text-[11px] text-slate-400 ml-6 mt-1">
                        Jedes Dokument wird erst im Moment des Anklickens kurzzeitig im Arbeitsspeicher (RAM) entschlüsselt.
                      </p>
                    </label>

                    <label
                      className={`p-3 rounded-xl border cursor-pointer transition-all block ${
                        decryptionMode === 'os_startup'
                          ? 'bg-amber-500/15 border-amber-500/50 text-amber-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-amber-300">
                        <input
                          type="radio"
                          name="decryptionMode"
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

                  {decryptionMode === 'os_startup' && (
                    <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-300 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>
                        Sicherheitshinweis: Dokumente werden schon vor dem ersten Starten der App im Hintergrund vorbereitet. Nutze dies nur auf vertrauenswürdigen Einzelbenutzer-Geräten.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
            <button
              onClick={() => setStep(prev => Math.max(1, prev - 1))}
              disabled={step === 1 || isDownloading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-semibold disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Zurück</span>
            </button>

            {step < 4 ? (
              <button
                onClick={() => {
                  if (step === 2) {
                    handleSimulatePhoneScanned();
                  } else {
                    setStep(prev => prev + 1);
                  }
                }}
                disabled={isDownloading}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-950/60"
              >
                <span>Weiter</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-950/70"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Einrichtung abschließen & Tresor öffnen</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reusable Info Modal for deeper technical / beginner questions */}
      <InfoModal
        isOpen={!!activeInfoTopic}
        onClose={() => setActiveInfoTopic(null)}
        topic={activeInfoTopic}
      />
    </>
  );
};
