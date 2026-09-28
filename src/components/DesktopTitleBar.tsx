import React from 'react';
import { 
  Minus, 
  Square, 
  X, 
  Sun, 
  Moon, 
  Cpu, 
  Laptop,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { OSWindowStyle } from '../types/document';
import { VaultService } from '../services/vaultStorage';
import { MyDocAnizerBanner } from './brand/MyDocAnizerBanner';

interface DesktopTitleBarProps {
  osStyle: OSWindowStyle;
  setOsStyle: (style: OSWindowStyle) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  isUnlocked: boolean;
  onLockVault: () => void;
  onShowToast: (msg: string) => void;
}

export const DesktopTitleBar: React.FC<DesktopTitleBarProps> = ({
  osStyle,
  setOsStyle,
  isDarkMode,
  setIsDarkMode,
  isUnlocked,
  onLockVault,
  onShowToast
}) => {
  const handleWipeRAM = () => {
    const wipedCount = VaultService.wipeRAMDecryptionBuffers();
    onShowToast(`🧹 RAM-Sicherheitsspeicher bereinigt (${wipedCount} flüchtige Dokument-Puffer genullt)`);
  };

  return (
    <header className="h-10 bg-slate-900 border-b border-slate-800 text-slate-300 flex items-center justify-between px-3 select-none text-xs z-50 shrink-0">
      {/* Zone 1: macOS Window Controls (if macos style) or Brand Wordmark */}
      <div className="flex items-center gap-3">
        {osStyle === 'macos' && (
          <div className="flex items-center gap-1.5 mr-1">
            <button 
              onClick={() => onShowToast('Fenster schließen (Desktop Mock)')}
              className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-600 transition-colors flex items-center justify-center group"
              title="Schließen"
            >
              <X className="w-2 h-2 text-rose-950 opacity-0 group-hover:opacity-100" />
            </button>
            <button 
              onClick={() => onShowToast('Fenster minimieren')}
              className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-600 transition-colors flex items-center justify-center group"
              title="Minimieren"
            >
              <Minus className="w-2 h-2 text-amber-950 opacity-0 group-hover:opacity-100" />
            </button>
            <button 
              onClick={() => onShowToast('Vollbild umschalten')}
              className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-600 transition-colors flex items-center justify-center group"
              title="Maximieren"
            >
              <Square className="w-1.5 h-1.5 text-emerald-950 opacity-0 group-hover:opacity-100" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2.5">
          <MyDocAnizerBanner variant="desktop" height={24} />
          <span className="text-[10px] text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 rounded px-1.5 py-0.5 font-mono">
            Desktop App · 100% Lokaler Tresor
          </span>
        </div>
      </div>

      {/* Zone 2: Architecture & Storage Integrity */}
      <div className="hidden md:flex items-center gap-2 text-slate-400">
        <span className="flex items-center gap-1.5 text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>AES-256-GCM Verschlüsselt</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400">P2P mTLS 1.3 Sync</span>
        </span>
      </div>

      {/* Zone 3: OS Theme Switcher, RAM Wipe & Window Controls */}
      <div className="flex items-center gap-2">
        {/* Memory status indicator & Purge */}
        <button
          onClick={handleWipeRAM}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-slate-100 transition-colors text-[11px] border border-slate-700/50"
          title="Flüchtigen Arbeitsspeicher sofort bereinigen (Zero-Plaintext Sicherheit)"
        >
          <Cpu className="w-3 h-3 text-cyan-400" />
          <span className="hidden sm:inline">RAM bereinigen</span>
        </button>

        {/* OS Decor Switcher */}
        <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700/50">
          <button
            onClick={() => setOsStyle('windows')}
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
              osStyle === 'windows' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Windows 11 Fensterstil"
          >
            Win
          </button>
          <button
            onClick={() => setOsStyle('macos')}
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
              osStyle === 'macos' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="macOS Fensterstil"
          >
            Mac
          </button>
          <button
            onClick={() => setOsStyle('linux')}
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
              osStyle === 'linux' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Linux GNOME Fensterstil"
          >
            Linux
          </button>
        </div>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title={isDarkMode ? 'Heller Modus' : 'Dunkler Modus'}
        >
          {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Windows / Linux native window buttons */}
        {osStyle !== 'macos' && (
          <div className="flex items-center ml-2 border-l border-slate-800 pl-2">
            <button 
              onClick={() => onShowToast('Fenster minimiert')}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors rounded"
              title="Minimieren"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button 
              onClick={() => onShowToast('Fenster maximiert')}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors rounded"
              title="Maximieren"
            >
              <Square className="w-2.5 h-2.5" />
            </button>
            <button 
              onClick={() => onShowToast('Anwendung schließen (Desktop Mock)')}
              className="p-1.5 hover:bg-rose-900/60 text-slate-400 hover:text-rose-200 transition-colors rounded"
              title="Schließen"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
