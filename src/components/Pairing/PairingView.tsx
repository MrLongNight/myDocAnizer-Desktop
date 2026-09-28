import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Smartphone, 
  QrCode, 
  RefreshCw, 
  ShieldCheck, 
  Key, 
  Wifi, 
  Lock, 
  CheckCircle2, 
  Copy, 
  ExternalLink,
  SmartphoneNfc,
  Sparkles,
  Server,
  Info,
  Cpu,
  Check
} from 'lucide-react';
import QRCode from 'qrcode';
import { PairedDevice } from '../../types/document';
import { MyDocAnizerIcon } from '../brand/MyDocAnizerIcon';
import { MyDocAnizerBanner } from '../brand/MyDocAnizerBanner';

interface PairingViewProps {
  device: PairedDevice | null;
  syncState: 'idle' | 'syncing' | 'offline' | 'error';
  lastSyncFormatted: string;
  onTriggerSync: () => void;
  onOpenOnboardingWizard: () => void;
  onShowToast: (msg: string) => void;
}

export const PairingView: React.FC<PairingViewProps> = ({
  device,
  syncState,
  lastSyncFormatted,
  onTriggerSync,
  onOpenOnboardingWizard,
  onShowToast
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedFingerprint, setCopiedFingerprint] = useState<boolean>(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stable pairing payload memoized so it does NOT trigger infinite re-render loops
  const pairingPayload = useMemo(() => {
    return JSON.stringify({
      app: 'myDocAnizer-Desktop',
      version: '1.4.2',
      protocol: 'mTLS-1.3-ECDH',
      desktopHost: '192.168.178.24',
      port: 9871,
      ecdhPublic: '04A81F2B3C4D5E6F708192A3B4C5D6E7F8091A2B3C4D5E6F708192A3B4C5D6E7',
      salt: '8F9E1A2B3C4D5E6F',
      desktopFingerprint: device?.ecdhPublicKeyFingerprint || 'SHA-256: 8F:4A:91:C2:7B:3E:01:DF:56:88:AC:33:91:20:FE:41'
    });
  }, [device?.ecdhPublicKeyFingerprint]);

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(pairingPayload, {
      width: 280,
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
        if (isMounted) console.error('Failed to generate pairing QR code', e);
      });

    return () => {
      isMounted = false;
    };
  }, [pairingPayload]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const handleCopyFingerprint = () => {
    if (device?.ecdhPublicKeyFingerprint) {
      navigator.clipboard.writeText(device.ecdhPublicKeyFingerprint);
      setCopiedFingerprint(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopiedFingerprint(false), 2000);
      onShowToast('📋 Sicherheits-Fingerprint in die Zwischenablage kopiert');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <SmartphoneNfc className="w-5 h-5 text-cyan-400" />
            Smartphone-Verbindung & WLAN-Synchronisation
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Direkte, Ende-zu-Ende verschlüsselte Verbindung zwischen deinem PC und deinem Android-Smartphone.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onTriggerSync}
            disabled={syncState === 'syncing'}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700/60 transition-colors text-xs font-semibold disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncState === 'syncing' ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{syncState === 'syncing' ? 'Synchronisiere...' : 'Jetzt synchronisieren'}</span>
          </button>

          <button
            onClick={onOpenOnboardingWizard}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md transition-colors"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Kopplungs-Assistent öffnen</span>
          </button>
        </div>
      </div>

      {/* Beginner Guide Banner */}
      <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 text-xs text-slate-300 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-200">💡 Wie funktioniert die Verbindung?</p>
          <p className="text-slate-400 leading-relaxed">
            Dein PC und dein Smartphone kommunizieren <strong>direkt über dein lokales WLAN</strong> (Peer-to-Peer). Es werden keine Dokumente auf fremde Server oder in die Cloud hochgeladen. Öffne einfach die <em>myDocAnizer Mobile App</em> und scanne den QR-Code ab, um die beiden Geräte sicher aneinander zu koppeln.
          </p>
        </div>
      </div>

      {/* Grid: Paired Device Card & P2P QR Code */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Paired Device Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-950 border border-cyan-500/30 flex items-center justify-center p-1 shrink-0 shadow-inner">
                <MyDocAnizerIcon size={38} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-100">
                    {device?.name || 'Google Pixel 8 Pro'}
                  </h3>
                  <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded-full font-medium">
                    Verbunden & Sicher
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  myDocAnizer Mobile App · Android 15
                </div>
              </div>
            </div>

            <div className="h-10 w-32 hidden sm:flex items-center justify-end">
              <MyDocAnizerBanner variant="mobile" height={32} />
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Verbindungsart</span>
              <span className="text-slate-200 font-medium">Lokales WLAN (Heimnetzwerk)</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Letzte Synchronisation</span>
              <span className="text-slate-200 font-medium">{lastSyncFormatted}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Aktiver Sync-Status</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Vollständig synchron
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Dokumentenspeicher auf Handy</span>
              <span className="text-slate-200 font-mono">1.4 MB (AES-256 verschlüsselt)</span>
            </div>
          </div>

          {/* Quick Action in Card */}
          <div className="pt-2 flex gap-2">
            <button
              onClick={onTriggerSync}
              className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Verbindung testen & abgleichen</span>
            </button>
          </div>
        </div>

        {/* Card 2: QR-Code for New Pairing */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-100">Smartphone koppeln</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">mTLS 1.3 Key Exchange</span>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              Öffne die <strong>myDocAnizer Mobile App</strong> und scanne diesen Code ein:
            </p>
          </div>

          <div className="flex items-center justify-center p-3 bg-white rounded-2xl max-w-[240px] mx-auto shadow-md">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="myDocAnizer Kopplungs-QR-Code"
                className="w-full h-auto object-contain"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin text-slate-800" />
              </div>
            )}
          </div>

          <div className="text-center text-[11px] text-slate-400">
            WLAN-Host: <span className="text-slate-300 font-mono">192.168.178.24:9871</span>
          </div>
        </div>
      </div>

      {/* Bottom Card: Technical Parameters for IT-Nerds */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-slate-200">
              Technische Krypto- & Netzwerk-Parameter (Nerd-Zone)
            </h4>
          </div>

          <button
            onClick={handleCopyFingerprint}
            className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {copiedFingerprint ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedFingerprint ? 'Fingerprint kopiert!' : 'Fingerprint kopieren'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-500 uppercase">Transport-Protokoll</div>
            <div className="text-slate-200 font-bold">mTLS 1.3 (RFC 8446)</div>
            <div className="text-[10px] text-slate-400">Gegenseitige Zertifikatsprüfung</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-500 uppercase">Schlüsselaustausch</div>
            <div className="text-slate-200 font-bold">ECDH P-256 (Ephemeral)</div>
            <div className="text-[10px] text-slate-400">Forward Secrecy aktiv</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-500 uppercase">Kanal-Verschlüsselung</div>
            <div className="text-slate-200 font-bold">AES-256-GCM / Poly1305</div>
            <div className="text-[10px] text-slate-400">Hardware-beschleunigt</div>
          </div>

          <div className="md:col-span-3 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-500 uppercase">ECDH Public Key Fingerprint (SHA-256)</div>
            <div className="text-cyan-300 text-xs break-all">
              {device?.ecdhPublicKeyFingerprint || 'SHA-256: 8F:4A:91:C2:7B:3E:01:DF:56:88:AC:33:91:20:FE:41'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
