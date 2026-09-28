import React, { useState, useRef } from 'react';
import { X, Upload, Image, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { BrandStorage } from '../../services/brandStorage';

interface BrandUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const BrandUploadModal: React.FC<BrandUploadModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [currentIcon, setCurrentIcon] = useState<string | null>(BrandStorage.getIcon());
  const [currentBanner, setCurrentBanner] = useState<string | null>(BrandStorage.getBanner('desktop'));
  const [currentAndroidBanner, setCurrentAndroidBanner] = useState<string | null>(BrandStorage.getBanner('android'));

  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const iconInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const androidBannerInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processImageFile = async (file: File): Promise<string> => {
    // SVGs do not need canvas resizing; read directly
    if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('Konnte SVG-Datei nicht lesen'));
        reader.readAsDataURL(file);
      });
    }

    // For raster images (PNG, JPEG), optimize to max 1280px to prevent browser tab crash & quota overflow
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const maxDimension = 1280;
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to raw dataUrl if canvas context fails
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Export high-quality PNG
        const dataUrl = canvas.toDataURL('image/png', 0.95);
        resolve(dataUrl);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Konnte Bild nicht decodieren'));
      };

      img.src = objectUrl;
    });
  };

  const handleFileUpload = async (
    file: File,
    type: 'icon' | 'banner' | 'android_banner'
  ) => {
    const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
    const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');

    if (!isSvg && !isPng && !file.type.startsWith('image/')) {
      onShowToast('⚠️ Bitte nur Bilddateien (.png oder .svg) auswählen');
      return;
    }

    // Protect against huge files > 6MB
    if (file.size > 6 * 1024 * 1024) {
      onShowToast('⚠️ Datei ist zu groß (max. 6 MB). Bitte optimiere die Datei.');
      return;
    }

    setIsProcessing(true);
    try {
      const dataUrl = await processImageFile(file);

      if (type === 'icon') {
        const res = BrandStorage.setIcon(dataUrl);
        setCurrentIcon(dataUrl);
        onShowToast(`✅ Original-Icon (${file.name}) erfolgreich übernommen!${!res.persisted ? ' (Im Arbeitsspeicher gesichert)' : ''}`);
      } else if (type === 'banner') {
        const res = BrandStorage.setBanner(dataUrl, 'desktop');
        setCurrentBanner(dataUrl);
        onShowToast(`✅ Original-Desktop-Banner (${file.name}) übernommen!${!res.persisted ? ' (Im Arbeitsspeicher gesichert)' : ''}`);
      } else {
        const res = BrandStorage.setBanner(dataUrl, 'android');
        setCurrentAndroidBanner(dataUrl);
        onShowToast(`✅ Original-Android-Banner (${file.name}) übernommen!${!res.persisted ? ' (Im Arbeitsspeicher gesichert)' : ''}`);
      }
    } catch (err: any) {
      console.error('Error uploading brand asset:', err);
      onShowToast(`❌ Fehler beim Laden der Datei: ${err?.message || 'Unbekannter Fehler'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetAll = () => {
    BrandStorage.resetAll();
    setCurrentIcon(null);
    setCurrentBanner(null);
    setCurrentAndroidBanner(null);
    onShowToast('Alle Logos auf Standard zurückgesetzt');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">
                Originale Logo-Dateien einbinden (.png / .svg)
              </h3>
              <p className="text-[11px] text-slate-400">
                Wähle deine originalen Bilddateien direkt von deiner Festplatte aus – 100% unverändert & ohne Nachbau.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Info Banner */}
          <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-slate-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <div>
              Die ausgewählte Datei wird <strong>direkt als Original-Grafik</strong> (Base64) in deinem lokalen Browser-Tresor hinterlegt und sofort in der Titelleiste, Sidebar und im Kopplungs-Assistenten angezeigt.
            </div>
          </div>

          {/* 1. App Icon Dropzone */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <span>1. App-Icon</span>
                <span className="text-[10px] font-mono text-slate-400 font-normal">
                  (z.B. myDocAnizer_Icon-Only.png oder .svg)
                </span>
              </label>
              {currentIcon && (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Eigenes Original aktiv
                </span>
              )}
            </div>

            <div
              onClick={() => iconInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files[0];
                if (f) handleFileUpload(f, 'icon');
              }}
              className="border-2 border-dashed border-slate-700 hover:border-teal-500/60 rounded-xl p-4 bg-slate-950/60 hover:bg-slate-950 transition-all cursor-pointer flex items-center justify-between gap-4"
            >
              <input
                ref={iconInputRef}
                type="file"
                accept="image/png,image/svg+xml,image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileUpload(f, 'icon');
                }}
              />
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-2 shrink-0 overflow-hidden">
                  <img
                    src={currentIcon || '/myDocAnizer_Icon-Only.png'}
                    alt="Icon Vorschau"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-200">
                    Klicken zum Auswählen oder .png / .svg hierher ziehen
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Wird für Fenster-Icon, Taskleiste und Kopplungskarten verwendet
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-medium text-xs shrink-0 transition-colors"
              >
                Datei wählen
              </button>
            </div>
          </div>

          {/* 2. Desktop Banner Dropzone */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <span>2. Desktop-Banner</span>
                <span className="text-[10px] font-mono text-slate-400 font-normal">
                  (z.B. myDocAnizer_Logo-Banner.png / myDocAnizer-Light-Banner)
                </span>
              </label>
              {currentBanner && (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Eigenes Original aktiv
                </span>
              )}
            </div>

            <div
              onClick={() => bannerInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files[0];
                if (f) handleFileUpload(f, 'banner');
              }}
              className="border-2 border-dashed border-slate-700 hover:border-teal-500/60 rounded-xl p-4 bg-slate-950/60 hover:bg-slate-950 transition-all cursor-pointer flex items-center justify-between gap-4"
            >
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/png,image/svg+xml,image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileUpload(f, 'banner');
                }}
              />
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-12 w-44 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                  <img
                    src={currentBanner || '/myDocAnizer-Desktop.png'}
                    alt="Banner Vorschau"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-200">
                    Klicken zum Auswählen oder .png / .svg hierher ziehen
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Wird für die Titelleiste und linke Navigationsleiste verwendet
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium text-xs shrink-0 transition-colors"
              >
                Datei wählen
              </button>
            </div>
          </div>

          {/* 3. Android Banner Dropzone */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <span>3. Android-App Banner (Mobile)</span>
                <span className="text-[10px] font-mono text-slate-400 font-normal">
                  (myDocAnizer Mobile Banner)
                </span>
              </label>
              {currentAndroidBanner && (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Eigenes Original aktiv
                </span>
              )}
            </div>

            <div
              onClick={() => androidBannerInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files[0];
                if (f) handleFileUpload(f, 'android_banner');
              }}
              className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-xl p-4 bg-slate-950/60 hover:bg-slate-950 transition-all cursor-pointer flex items-center justify-between gap-4"
            >
              <input
                ref={androidBannerInputRef}
                type="file"
                accept="image/png,image/svg+xml,image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileUpload(f, 'android_banner');
                }}
              />
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-12 w-44 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                  <img
                    src={currentAndroidBanner || '/myDocAnizer-Mobile.png'}
                    alt="Android Banner Vorschau"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-200">
                    Klicken zum Auswählen oder .png / .svg hierher ziehen
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Wird im Kopplungs-Assistenten (Onboarding) für die Android-Gegenstelle angezeigt
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-medium text-xs shrink-0 transition-colors"
              >
                Datei wählen
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleResetAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 text-xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Auf Standard zurücksetzen
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs transition-colors"
          >
            Fertig
          </button>
        </div>
      </div>
    </div>
  );
};
