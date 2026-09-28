import React from 'react';
import { 
  Smartphone, 
  RefreshCw, 
  Lock, 
  Unlock, 
  ScanLine,
  Wifi,
  WifiOff,
  CheckCircle2,
  ShieldCheck,
  Image,
  HelpCircle
} from 'lucide-react';
import { PairedDevice, DocumentEntity } from '../types/document';
import { MyDocAnizerBanner } from './brand/MyDocAnizerBanner';

interface HeaderBarProps {
  device: PairedDevice | null;
  syncState: 'idle' | 'syncing' | 'offline' | 'error';
  syncProgress: number;
  lastSyncFormatted: string;
  isUnlocked: boolean;
  selectedDoc: DocumentEntity | null;
  onTriggerSync: () => void;
  onToggleVaultLock: () => void;
  onOpenPrintDialog: () => void;
  onOpenExportDialog: () => void;
  onStartNewScan: () => void;
  onToggleDeviceStatus: () => void;
  onOpenBrandUpload?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  device,
  syncState,
  syncProgress,
  lastSyncFormatted,
  isUnlocked,
  selectedDoc,
  onTriggerSync,
  onToggleVaultLock,
  onStartNewScan,
  onToggleDeviceStatus,
  onOpenBrandUpload
}) => {
  const isConnected = device?.status === 'connected' && syncState !== 'offline';

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex flex-col gap-2 shrink-0 z-40 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand Identity Banner */}
        <div className="flex items-center gap-3">
          <MyDocAnizerBanner variant="desktop" height={36} />
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-950/40 border border-cyan-800/40 text-[10px] text-cyan-300 font-mono">
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            <span>AES-256 Lokaler Tresor</span>
          </div>
        </div>

        {/* Center: Interactive Device Connection & Sync Status */}
        <div className="flex items-center gap-2">
          {/* Connection Status Button */}
          <button
            onClick={onToggleDeviceStatus}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              isConnected
                ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-300 hover:bg-emerald-900/40'
                : 'bg-rose-950/40 border-rose-700/50 text-rose-300 hover:bg-rose-900/40'
            }`}
            title="Klicken zum Umschalten zwischen Online-Sync und Offline-Tresor"
          >
            <span className="relative flex h-2 w-2">
              {isConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isConnected ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              ></span>
            </span>
            <Smartphone className="w-3.5 h-3.5" />
            <span className="truncate max-w-[190px]">
              {isConnected
                ? `${device?.name || 'Pixel 8 Pro'} verbunden`
                : 'Offline (Lokaler Modus)'}
            </span>
            <span className="text-[10px] opacity-70 border-l border-current pl-1.5 hidden xl:inline font-mono">
              mTLS 1.3
            </span>
          </button>

          {/* Sync Trigger with Friendly Timestamp */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onTriggerSync}
              disabled={syncState === 'syncing'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700/70 transition-all text-xs font-medium disabled:opacity-50"
              title="Daten jetzt manuell mit deinem Smartphone abgleichen (mTLS P2P-Tunnel)"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${syncState === 'syncing' ? 'animate-spin text-cyan-400' : 'text-slate-400'}`}
              />
              <span className="hidden sm:inline">
                {syncState === 'syncing' ? 'Synchronisiere...' : 'Jetzt synchronisieren'}
              </span>
            </button>
            <span className="hidden 2xl:inline text-[11px] text-slate-400 ml-1">
              ({lastSyncFormatted})
            </span>
          </div>
        </div>

        {/* Right: Quick Primary Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Logo Replacement Button */}
          {onOpenBrandUpload && (
            <button
              onClick={onOpenBrandUpload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-slate-100 border border-slate-700/60 transition-colors text-xs"
              title="Eigene originale Logos (.png / .svg) einbinden oder ansehen"
            >
              <Image className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Logos</span>
            </button>
          )}

          {/* Tresor Lock / Unlock */}
          <button
            onClick={onToggleVaultLock}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              isUnlocked
                ? 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200 hover:text-white'
                : 'bg-amber-950/60 border-amber-600/60 text-amber-300 hover:bg-amber-900/60 animate-pulse'
            }`}
            title={isUnlocked ? 'Dokumenten-Tresor sofort sperren (PIN erforderlich)' : 'Dokumenten-Tresor entsperren'}
          >
            {isUnlocked ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">Tresor sperren</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Entsperren</span>
              </>
            )}
          </button>

          {/* New Scan Button (Primary Accent) */}
          <button
            onClick={onStartNewScan}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold shadow-md shadow-cyan-950/50 transition-all text-xs"
            title="Dokument über Flachbett- oder Einzugsscanner digitalisieren & ans Handy senden"
          >
            <ScanLine className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Dokument scannen</span>
          </button>
        </div>
      </div>

      {/* Live Sync Progress Indicator */}
      {syncState === 'syncing' && (
        <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-500 to-teal-400 h-full transition-all duration-300 rounded-full"
            style={{ width: `${syncProgress}%` }}
          />
        </div>
      )}
    </div>
  );
};
