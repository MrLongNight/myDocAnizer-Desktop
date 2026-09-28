import React from 'react';
import { 
  FolderLock, 
  ScanLine, 
  SmartphoneNfc, 
  Settings, 
  ShieldCheck,
  ChevronRight,
  HardDrive,
  Info
} from 'lucide-react';
import { ActiveTab } from '../types/document';
import { MyDocAnizerIcon } from './brand/MyDocAnizerIcon';

interface NavigationRailProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  documentCount: number;
  pendingSyncCount?: number;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
  activeTab,
  setActiveTab,
  documentCount,
  pendingSyncCount = 0
}) => {
  const navItems = [
    {
      id: 'vault' as ActiveTab,
      label: 'Dokumenten-Tresor',
      sublabel: 'Ablage, Suche & Fristen',
      techDetail: 'AES-256 / FTS5 Volltext',
      icon: FolderLock,
      badge: documentCount
    },
    {
      id: 'scanner' as ActiveTab,
      label: 'Dokument scannen',
      sublabel: 'PC-Scanner ➔ Android KI',
      techDetail: 'WIA / SANE / eSCL Scans',
      icon: ScanLine,
      badge: undefined
    },
    {
      id: 'pairing' as ActiveTab,
      label: 'Smartphone-Sync',
      sublabel: 'WLAN-Verbindung & QR-Code',
      techDetail: 'mTLS 1.3 & ECDH P-256',
      icon: SmartphoneNfc,
      badge: pendingSyncCount > 0 ? `${pendingSyncCount} neu` : undefined
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Sicherheit & Einstellungen',
      sublabel: 'PIN, Speicherort & Logos',
      techDetail: 'Zero-Knowledge & Backups',
      icon: Settings,
      badge: undefined
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      {/* Top Navigation Items */}
      <div className="p-3 space-y-2">
        {/* App Title Section with Icon */}
        <div className="px-2 pt-1 pb-3 border-b border-slate-800/80 flex items-center gap-3">
          <MyDocAnizerIcon size={36} />
          <div>
            <div className="font-bold text-slate-100 text-sm tracking-tight flex items-center gap-1.5">
              <span>myDocAnizer</span>
              <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/60 border border-cyan-800/50 px-1.5 py-0.2 rounded">
                PC
              </span>
            </div>
            <div className="text-[11px] text-slate-400">Desktop Dokumenten-Tresor</div>
          </div>
        </div>

        {/* Section Label */}
        <div className="px-2 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Hauptbereiche</span>
          <span className="text-[9px] text-emerald-400 font-mono">100% LOKAL</span>
        </div>

        {/* Navigation Buttons */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/35 font-medium shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-slate-100 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold leading-snug truncate">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-400 leading-tight truncate">
                      {item.sublabel}
                    </div>
                  </div>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-full shrink-0 ml-1 ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: Security & Privacy Guarantee */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Sicherheits-Garantie
            </span>
            <span className="text-[9px] text-cyan-400 font-mono bg-cyan-950 px-1 py-0.2 rounded border border-cyan-800/40">
              Zero-Cloud
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Keine fremden Server. Deine Dokumente bleiben verschlüsselt auf deiner Festplatte und synchronisieren sich nur im heimischen WLAN.
          </p>
        </div>
      </div>
    </aside>
  );
};
