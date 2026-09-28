import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Key, 
  FolderOpen, 
  Database, 
  Cpu, 
  Trash2, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  HardDrive,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Info,
  Image,
  Upload
} from 'lucide-react';
import { VaultSecurityConfig } from '../../types/document';
import { VaultService } from '../../services/vaultStorage';
import { MyDocAnizerBanner } from '../brand/MyDocAnizerBanner';
import { MyDocAnizerIcon } from '../brand/MyDocAnizerIcon';

interface SettingsViewProps {
  securityConfig: VaultSecurityConfig;
  onUpdateSecurityConfig: (config: VaultSecurityConfig) => void;
  onResetVault: () => void;
  onShowToast: (msg: string) => void;
  onOpenBrandUpload?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  securityConfig,
  onUpdateSecurityConfig,
  onResetVault,
  onShowToast,
  onOpenBrandUpload
}) => {
  const [pinCode, setPinCode] = useState<string>(securityConfig.pinCode);
  const [autoLockMinutes, setAutoLockMinutes] = useState<number>(securityConfig.autoLockMinutes);
  const [exportDir, setExportDir] = useState<string>(securityConfig.exportDirectory);
  const [hasPin, setHasPin] = useState<boolean>(securityConfig.hasPin ?? true);

  const handleSaveSettings = () => {
    const updated: VaultSecurityConfig = {
      ...securityConfig,
      pinCode,
      autoLockMinutes,
      exportDirectory: exportDir,
      hasPin
    };
    onUpdateSecurityConfig(updated);
    VaultService.saveSecurityConfig(updated);
    onShowToast('✅ Einstellungen erfolgreich gespeichert');
  };

  const handleRunRAMWipe = () => {
    const wiped = VaultService.wipeRAMDecryptionBuffers();
    onShowToast(`🧹 Arbeitsspeicher bereinigt: ${wiped} Dokumentpuffer im flüchtigen Speicher rückstandslos genullt.`);
  };

  const handleResetToFactory = () => {
    if (confirm('Möchtest du den Dokumenten-Tresor auf die Standard-Beispieldaten zurücksetzen?')) {
      onResetVault();
      onShowToast('🔄 Dokumenten-Tresor auf Standardzustand zurückgesetzt');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 space-y-6 select-none max-w-4xl">
      {/* Header with Desktop Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-4">
          <MyDocAnizerBanner variant="desktop" height={42} />
          <div className="hidden sm:block border-l border-slate-800 pl-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Einstellungen & Schutz
            </h2>
            <p className="text-[11px] text-slate-400">
              PIN-Sperre, Speicherort, Logos & Krypto-Parameter
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Einstellungen speichern</span>
        </button>
      </div>

      {/* Section 1: PIN & Auto-Lock */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            Tresor-PIN & Automatische Sperre
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Schütze deine privaten Dokumente vor neugierigen Blicken an diesem Computer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-slate-300 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={hasPin}
                onChange={(e) => setHasPin(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0 w-4 h-4"
              />
              <span>PIN-Sperre aktivieren</span>
            </label>
            <p className="text-[11px] text-slate-500">
              Sperrt den Dokumenten-Tresor bei Inaktivität oder manuellem Klick auf „Sperren“.
            </p>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">
              4-stellige Entsperr-PIN
            </label>
            <input
              type="password"
              maxLength={6}
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              disabled={!hasPin}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500 disabled:opacity-40"
              placeholder="1234"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Automatisch sperren nach Inaktivität</span>
            </label>
            <select
              value={autoLockMinutes}
              onChange={(e) => setAutoLockMinutes(Number(e.target.value))}
              disabled={!hasPin}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 disabled:opacity-40"
            >
              <option value={1}>Nach 1 Minute Inaktivität</option>
              <option value={5}>Nach 5 Minuten</option>
              <option value={15}>Nach 15 Minuten (Empfohlen)</option>
              <option value={30}>Nach 30 Minuten</option>
              <option value={0}>Nie automatisch sperren (Nicht empfohlen)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 2: Storage & Export Directory */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-cyan-400" />
            Speicherorte & PDF-Export-Verzeichnis
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Hier legst du fest, wohin unverschlüsselte PDF-Exporte standardmäßig gespeichert werden.
          </p>
        </div>

        <div className="space-y-2 text-xs">
          <label className="block text-slate-400 font-medium">Standard-Exportpfad für PDFs</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={exportDir}
              onChange={(e) => setExportDir(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={() => onShowToast(`📂 Ordner ${exportDir} ausgewählt`)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/60 transition-colors flex items-center gap-1.5"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Durchsuchen</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Original Logo & Brand Management */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Image className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Logo & Banner (.png / .svg)
              </h3>
              <p className="text-[11px] text-slate-400">
                Die offiziellen myDocAnizer Vektor-Assets sind aktiv. Du kannst jederzeit eigene Dateien hochladen.
              </p>
            </div>
          </div>

          {onOpenBrandUpload && (
            <button
              onClick={onOpenBrandUpload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Eigene Datei wählen</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-1 shrink-0">
              <MyDocAnizerIcon size={36} />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">App-Icon</div>
              <div className="text-[10px] text-slate-400 font-mono">myDocAnizer Vektor-Icon</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
            <div className="h-12 w-36 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-1 shrink-0 overflow-hidden">
              <MyDocAnizerBanner variant="desktop" height={28} />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">Desktop-Banner</div>
              <div className="text-[10px] text-slate-400 font-mono">myDocAnizer Desktop</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Security Audit & RAM-Bereinigung */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Sicherheits-Audit & RAM-Bereinigung (Nerd-Zone)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Entschlüsselte Dokumente verweilen niemals auf der Festplatte, sondern nur temporär im RAM.
            </p>
          </div>

          <button
            onClick={handleRunRAMWipe}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors"
            title="Alle temporär im Arbeitsspeicher entschlüsselten Dokumente sofort löschen"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>RAM-Puffer leeren</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase">Krypto-Engine</span>
            <div className="text-slate-200 font-bold">AES-256-GCM</div>
            <div className="text-[10px] text-slate-400">Zero-Plaintext on Disk</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase">Netzwerk-Transport</span>
            <div className="text-slate-200 font-bold">mTLS 1.3 (RFC 8446)</div>
            <div className="text-[10px] text-slate-400">P2P Direkt-WLAN</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase">Schlüsseltausch</span>
            <div className="text-slate-200 font-bold">ECDH P-256</div>
            <div className="text-[10px] text-slate-400">Perfect Forward Secrecy</div>
          </div>
        </div>
      </div>

      {/* Section 5: Reset */}
      <div className="bg-rose-950/20 border border-rose-800/40 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Tresor auf Standardzustand zurücksetzen</span>
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Setzt Dokumente, Kategorien und Einstellungen auf die Standardwerte zurück.
          </p>
        </div>

        <button
          onClick={handleResetToFactory}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Zurücksetzen</span>
        </button>
      </div>
    </div>
  );
};
