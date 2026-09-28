import React from 'react';
import { 
  FolderLock, 
  ScanLine, 
  Settings, 
  Lock, 
  Unlock, 
  Smartphone, 
  RefreshCw, 
  CheckCircle2,
  HelpCircle,
  Sun,
  Moon,
  Cpu
} from 'lucide-react';
import { ActiveMainView, PairedDevice } from '../types/document';
import { MyDocAnizerBanner } from './brand/MyDocAnizerBanner';

export interface TopSlimNavBarProps {
  activeView: ActiveMainView;
  onChangeView: (view: ActiveMainView) => void;
  documentCount: number;
  pairedDevice: PairedDevice | null;
  syncState: 'idle' | 'syncing' | 'offline' | 'error';
  syncProgress: number;
  isUnlocked: boolean;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  onToggleVaultLock: () => void;
  onTriggerSync: () => void;
  onWipeRAM: () => void;
  onOpenSettings: () => void;
  onOpenInfoModal: () => void;
}

export const TopSlimNavBar: React.FC<TopSlimNavBarProps> = ({
  activeView,
  onChangeView,
  documentCount,
  pairedDevice,
  syncState,
  syncProgress,
  isUnlocked,
  isDarkMode,
  setIsDarkMode,
  onToggleVaultLock,
  onTriggerSync,
  onWipeRAM,
  onOpenSettings,
  onOpenInfoModal
}) => {
  const isConnected = pairedDevice?.status === 'connected' && syncState !== 'offline';

  // Einheitliche Basis-Klasse für alle 6 kleinen Elemente
  const smallButtonBaseClass = 
    "w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-950/80 hover:bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-300 hover:text-cyan-300 transition-all text-xs relative group shadow-sm shrink-0 cursor-pointer select-none";

  return (
    <header className="h-16 px-2.5 sm:px-4 bg-slate-900/95 border-b border-slate-800 text-slate-100 flex items-center justify-between select-none shrink-0 backdrop-blur-md z-30 gap-1.5 sm:gap-3">
      {/* 1. GANZ LINKS: 3 kleine Elemente im einheitlichen Design */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* Element 1: Smartphone Sync & Connection */}
        <button
          onClick={onTriggerSync}
          className={smallButtonBaseClass}
          title={
            syncState === 'syncing' 
              ? `Synchronisiere (${syncProgress}%)...` 
              : isConnected 
              ? `Verbunden mit ${pairedDevice?.name || 'Smartphone'}. Klick für Sofort-Sync` 
              : 'Smartphone offline. Klick für Verbindungs-Check'
          }
        >
          {syncState === 'syncing' ? (
            <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
          ) : (
            <Smartphone className={`w-4 h-4 transition-colors ${isConnected ? 'text-emerald-400 group-hover:text-emerald-300' : 'text-slate-400 group-hover:text-slate-200'}`} />
          )}
          <span
            className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ring-2 ring-slate-950 ${
              isConnected ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-rose-500/80'
            } ${isConnected && syncState !== 'syncing' ? 'animate-pulse' : ''}`}
          />
        </button>

        {/* Element 2: RAM Zeroing Security Purge */}
        <button
          onClick={onWipeRAM}
          className={smallButtonBaseClass}
          title="Flüchtigen Arbeitsspeicher sofort bereinigen (Zero-Plaintext im RAM)"
        >
          <Cpu className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform duration-200" />
        </button>

        {/* Element 3: Lock / Unlock Vault */}
        <button
          onClick={onToggleVaultLock}
          className={`${smallButtonBaseClass} ${
            isUnlocked ? 'hover:border-emerald-500/40' : 'hover:border-rose-500/40'
          }`}
          title={isUnlocked ? 'Tresor jetzt sperren (AES-256 Lock)' : 'Tresor ist gesperrt'}
        >
          {isUnlocked ? (
            <Unlock className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform duration-200" />
          ) : (
            <Lock className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform duration-200" />
          )}
          <span
            className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ring-2 ring-slate-950 ${
              isUnlocked ? 'bg-emerald-400' : 'bg-rose-500'
            }`}
          />
        </button>
      </div>

      {/* 2. MITTIG: App Logo im Zentrum (deutlich größer), flankiert von Tresor (links) und Scannen (rechts) */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 shrink-0 mx-auto">
        {/* Workspace: Tresor (links vom Logo) */}
        <button
          onClick={() => onChangeView('vault')}
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 shrink-0 cursor-pointer shadow-sm ${
            activeView === 'vault'
              ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-cyan-950/50 font-bold border border-cyan-400/50'
              : 'bg-slate-950/80 text-slate-300 hover:text-slate-100 hover:bg-slate-800 border border-slate-800'
          }`}
          title="Dokumenten-Tresor"
        >
          <FolderLock className={`w-3.5 h-3.5 shrink-0 ${activeView === 'vault' ? 'text-slate-950' : 'text-cyan-400'}`} />
          <span>Tresor</span>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md font-bold ${
              activeView === 'vault'
                ? 'bg-slate-950/25 text-slate-950'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            {documentCount}
          </span>
        </button>

        {/* App Logo mittig - sichtbar größer als die flankierenden Buttons */}
        <div className="flex items-center justify-center shrink-0 px-2 sm:px-4 py-0.5">
          <MyDocAnizerBanner 
            variant="desktop" 
            height={52} 
            className="filter drop-shadow-md transition-all hover:scale-102 hover:opacity-95" 
          />
        </div>

        {/* Workspace: Scannen (rechts vom Logo) */}
        <button
          onClick={() => onChangeView('scanner')}
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 shrink-0 cursor-pointer shadow-sm ${
            activeView === 'scanner'
              ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-cyan-950/50 font-bold border border-cyan-400/50'
              : 'bg-slate-950/80 text-slate-300 hover:text-slate-100 hover:bg-slate-800 border border-slate-800'
          }`}
          title="Dokumente scannen"
        >
          <ScanLine className={`w-3.5 h-3.5 shrink-0 ${activeView === 'scanner' ? 'text-slate-950' : 'text-cyan-400'}`} />
          <span>Scannen</span>
        </button>
      </div>

      {/* 3. GANZ RECHTS: 3 kleine Elemente im einheitlichen Design */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* Element 4: Dark / Light Mode Switcher */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={smallButtonBaseClass}
          title={isDarkMode ? 'Heller Modus' : 'Dunkler Modus'}
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-200" />
          ) : (
            <Moon className="w-4 h-4 text-slate-300 group-hover:-rotate-12 transition-transform duration-200" />
          )}
        </button>

        {/* Element 5: Info & Data Privacy Button */}
        <button
          onClick={onOpenInfoModal}
          className={smallButtonBaseClass}
          title="Informationen zu lokaler Datensicherheit, Verschlüsselung und Netzwerk"
        >
          <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-cyan-300 group-hover:scale-110 transition-transform duration-200" />
        </button>

        {/* Element 6: Settings Gear Button */}
        <button
          onClick={onOpenSettings}
          className={smallButtonBaseClass}
          title="Einstellungen öffnen"
        >
          <Settings className="w-4 h-4 text-cyan-400 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>
    </header>
  );
};
