import React, { useState, useEffect, useRef } from 'react';
import { 
  ScanLine, 
  RotateCw, 
  Trash2, 
  Plus, 
  Send, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  Sliders, 
  Info,
  Layers,
  Sparkles,
  ArrowRight,
  Eye,
  Cpu
} from 'lucide-react';
import { MOCK_SCANNERS } from '../../data/initialDocuments';
import { DocumentEntity, ScanPage, ScannerHardwareDevice } from '../../types/document';
import { MyDocAnizerIcon } from '../brand/MyDocAnizerIcon';
import { MyDocAnizerBanner } from '../brand/MyDocAnizerBanner';

interface ScanToAndroidViewProps {
  onScanCompleted: (newDoc: DocumentEntity) => void;
  onNavigateToVault: (docId: number) => void;
  onShowToast: (msg: string) => void;
  pairedDeviceName?: string;
}

export const ScanToAndroidView: React.FC<ScanToAndroidViewProps> = ({
  onScanCompleted,
  onNavigateToVault,
  onShowToast,
  pairedDeviceName = 'Google Pixel 8 Pro'
}) => {
  const [selectedScannerId, setSelectedScannerId] = useState<string>(MOCK_SCANNERS[0].id);
  const [colorMode, setColorMode] = useState<'color' | 'grayscale' | 'bw'>('color');
  const [dpi, setDpi] = useState<number>(300);
  const [sourceType, setSourceType] = useState<'flatbed' | 'adf'>('flatbed');

  // Scanning progress state
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanStatusText, setScanStatusText] = useState<string>('');

  // Scanned pages state
  const [pages, setPages] = useState<ScanPage[]>([]);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);

  // Transmission / AI pipeline simulation state
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [pipelineStep, setPipelineStep] = useState<number>(0);
  const [completedDoc, setCompletedDoc] = useState<DocumentEntity | null>(null);

  // Timer references to prevent memory leaks on unmount
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pipelineTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      pipelineTimeoutsRef.current.forEach(clearTimeout);
      pipelineTimeoutsRef.current = [];
    };
  }, []);

  const activeScanner = MOCK_SCANNERS.find(s => s.id === selectedScannerId) || MOCK_SCANNERS[0];

  const handleStartScan = (isNextPage: boolean = false) => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);

    setIsScanning(true);
    setScanProgress(10);
    setScanStatusText(`${activeScanner.name}: Scannermotor gestartet, erfasse Bilddaten...`);

    scanIntervalRef.current = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 90) {
          if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
          scanTimeoutRef.current = setTimeout(() => {
            setIsScanning(false);
            const newPageNumber = isNextPage ? pages.length + 1 : 1;
            const newPage: ScanPage = {
              id: `scan_page_${Date.now()}`,
              pageNumber: newPageNumber,
              rotation: 0,
              dpi,
              colorMode,
              detectedDocumentType: 'Rechnung / Geschäftsbrief',
              extractedTitleHint: newPageNumber === 1 ? 'Münchner Stadtwerke - Fernwärme & Strom Abrechnung 2026' : undefined
            };

            if (isNextPage) {
              setPages(prevPages => [...prevPages, newPage]);
              setSelectedPageIndex(pages.length);
              onShowToast(`📄 Seite ${newPageNumber} erfolgreich hinzugefügt`);
            } else {
              setPages([newPage]);
              setSelectedPageIndex(0);
              onShowToast('📄 Seite 1 erfolgreich gescannt');
            }
          }, 400);
          return 100;
        }
        return prev + 18;
      });
    }, 250);
  };

  const handleRotatePage = (index: number) => {
    setPages(prev => prev.map((p, i) => i === index ? { ...p, rotation: (p.rotation + 90) % 360 } : p));
  };

  const handleDeletePage = (index: number) => {
    const updated = pages.filter((_, i) => i !== index);
    setPages(updated);
    if (selectedPageIndex >= updated.length) {
      setSelectedPageIndex(Math.max(0, updated.length - 1));
    }
    onShowToast('🗑️ Gespeichertes Scanblatt entfernt');
  };

  const handleSendToAndroid = () => {
    if (pages.length === 0) return;

    pipelineTimeoutsRef.current.forEach(clearTimeout);
    pipelineTimeoutsRef.current = [];

    setIsTransmitting(true);
    setPipelineStep(1); // 1: Verschlüsselung

    const t1 = setTimeout(() => {
      setPipelineStep(2); // 2: Übertragung an Smartphone
      const t2 = setTimeout(() => {
        setPipelineStep(3); // 3: KI-Texterkennung (OCR) auf Android
        const t3 = setTimeout(() => {
          setPipelineStep(4); // 4: Kategorisierung & Ablage
          const t4 = setTimeout(() => {
            setPipelineStep(5); // 5: Abgeschlossen

            const newDocId = Date.now();
            const createdDoc: DocumentEntity = {
              id: newDocId,
              title: 'Münchner Stadtwerke - Fernwärme & Strom Abrechnung 2026',
              fileName: `scan_${new Date().toISOString().split('T')[0]}_001.enc`,
              filePath: `vault/docs/scan_${newDocId}.enc`,
              fileChecksum: '9f8a3c2e1b4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f',
              sha256: '9f8a3c2e1b4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f',
              fileSizeBytes: 188416,
              fileSizeFormatted: '184 KB',
              docType: 'Rechnung',
              colorMode: colorMode === 'color' ? '24-bit Farbe' : colorMode === 'grayscale' ? 'Graustufen' : 'S/W',
              mainCategory: 'Finanzen & Verträge',
              mainCategoryId: 'finances',
              subCategory: 'Energie & Stadtwerke',
              subCategoryId: 'utilities',
              sender: 'Stadtwerke München GmbH',
              documentDate: Date.now() - 86400000 * 2,
              documentDateFormatted: new Date(Date.now() - 86400000 * 2).toLocaleDateString('de-DE'),
              createdAt: Date.now(),
              updatedAt: Date.now(),
              amount: 142.80,
              currency: 'EUR',
              taxDeductible: true,
              cancellationDeadline: Date.now() + 86400000 * 45, // 45 days in future
              pageCount: pages.length,
              tags: 'Stadtwerke, Strom, Heizung, 2026, Steuerrelevant',
              status: 'processed',
              ocrText: `Stadtwerke München GmbH\nEmmy-Noether-Straße 2, 80992 München\n\nJahresabrechnung 2025/2026 - Fernwärme & Ökostrom\nVertragskonto: 200481920\n\nGesamtbetrag fällig zum 15.10.2026: 142,80 EUR\n\nIhr Arbeitspreis Fernwärme beträgt 9,82 ct/kWh.\nKündigungsfrist für diesen Tarif: 6 Wochen zum Quartalsende.`,
              ocrConfidence: 0.98,
              previewImageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=700&auto=format&fit=crop&q=80',
              isEncrypted: true,
              encryptionAlgorithm: 'AES-256-GCM',
              isSynced: true,
              syncTimestamp: Date.now(),
              isDeleted: false,
              sourceDevice: `PC Scanner (${activeScanner.name})`
            };

            setCompletedDoc(createdDoc);
            onScanCompleted(createdDoc);
            setIsTransmitting(false);
            onShowToast('🎉 Dokument erfolgreich digitalisiert & im Tresor abgelegt!');
          }, 900);
          pipelineTimeoutsRef.current.push(t4);
        }, 1100);
        pipelineTimeoutsRef.current.push(t3);
      }, 1000);
      pipelineTimeoutsRef.current.push(t2);
    }, 800);
    pipelineTimeoutsRef.current.push(t1);
  };

  const handleResetScanSession = () => {
    setPages([]);
    setCompletedDoc(null);
    setPipelineStep(0);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden select-none">
      {/* Top Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ScanLine className="w-4 h-4 text-cyan-400" />
              Dokument scannen & automatisch verarbeiten
            </h2>
            <span className="text-[10px] bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-medium">
              PC-Scanner ➔ Android KI ➔ Tresor
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Digitalisiere Unterlagen an deinem PC-Scanner. Die myDocAnizer App auf deinem Smartphone übernimmt die Texterkennung & Ablage.
          </p>
        </div>

        {pages.length > 0 && !completedDoc && (
          <button
            onClick={handleResetScanSession}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs border border-slate-700/60 transition-colors"
          >
            Scan verwerfen
          </button>
        )}
      </div>

      {/* Main Responsive Two-Column Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Column: Scanner Settings */}
        <div className="w-full md:w-80 bg-slate-900/80 md:border-r border-b md:border-b-0 border-slate-800 p-3 sm:p-4 flex flex-col justify-between overflow-y-auto shrink-0 max-h-[35vh] md:max-h-full">
          <div className="space-y-3 sm:space-y-4">
            {/* Friendly explanation for Beginners */}
            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-slate-300 flex items-start gap-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong>Schritt 1:</strong> Lege das Papier auf den Scanner und klicke auf <em>Scan starten</em>.
              </div>
            </div>

            {/* Scanner Device Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Scanner auswählen</span>
                <span className="text-[10px] text-cyan-400 font-mono">{activeScanner.protocol}</span>
              </label>
              <select
                value={selectedScannerId}
                onChange={(e) => setSelectedScannerId(e.target.value)}
                disabled={isScanning || isTransmitting}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {MOCK_SCANNERS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.connectionType})
                  </option>
                ))}
              </select>
            </div>

            {/* Scan Parameters */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Scan-Einstellungen</span>
              </div>

              {/* Color Mode */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Farbe</label>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => setColorMode('color')}
                    className={`py-1.5 text-xs rounded-lg transition-colors ${
                      colorMode === 'color'
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Farbe
                  </button>
                  <button
                    onClick={() => setColorMode('grayscale')}
                    className={`py-1.5 text-xs rounded-lg transition-colors ${
                      colorMode === 'grayscale'
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Grau
                  </button>
                  <button
                    onClick={() => setColorMode('bw')}
                    className={`py-1.5 text-xs rounded-lg transition-colors ${
                      colorMode === 'bw'
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    S/W Text
                  </button>
                </div>
              </div>

              {/* Resolution DPI */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Auflösung (Schärfe)</label>
                <div className="grid grid-cols-3 gap-1">
                  {[150, 300, 600].map((res) => (
                    <button
                      key={res}
                      onClick={() => setDpi(res)}
                      className={`py-1.5 text-xs rounded-lg font-mono transition-colors ${
                        dpi === res
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {res} DPI
                    </button>
                  ))}
                </div>
              </div>

              {/* Source (Flatbed vs ADF) */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Einzug</label>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => setSourceType('flatbed')}
                    className={`py-1.5 text-xs rounded-lg transition-colors ${
                      sourceType === 'flatbed'
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Flachbett
                  </button>
                  <button
                    onClick={() => setSourceType('adf')}
                    disabled={!activeScanner.supportsAdf}
                    className={`py-1.5 text-xs rounded-lg transition-colors disabled:opacity-40 ${
                      sourceType === 'adf'
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Dokumenteneinzug
                  </button>
                </div>
              </div>
            </div>

            {/* Technical Nerd Details Card */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-[11px] font-mono text-slate-400">
              <div className="text-cyan-400 font-bold flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                Treiber & Schnittstelle
              </div>
              <div>Protokoll: {activeScanner.protocol} (mTLS)</div>
              <div>Buffer: Flüchtig im RAM</div>
            </div>
          </div>

          {/* Trigger Scan Button */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button
              onClick={() => handleStartScan(false)}
              disabled={isScanning || isTransmitting}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-950/60 disabled:opacity-50 transition-all"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Scanner liest ein...</span>
                </>
              ) : (
                <>
                  <ScanLine className="w-4 h-4" />
                  <span>{pages.length > 0 ? 'Neu scannen' : 'Scan starten'}</span>
                </>
              )}
            </button>

            {pages.length > 0 && (
              <button
                onClick={() => handleStartScan(true)}
                disabled={isScanning || isTransmitting}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs flex items-center justify-center gap-1.5 border border-slate-700/60 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                <span>Nächste Seite anhängen (Mehrseitig)</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Scan Workspace / Preview / Processing Pipeline */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/70 p-6">
          {/* Scanning Progress Bar */}
          {isScanning && (
            <div className="mb-4 p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/50 space-y-2 animate-pulse">
              <div className="flex items-center justify-between text-xs text-cyan-300">
                <span className="font-semibold">{scanStatusText}</span>
                <span className="font-mono">{scanProgress}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-cyan-400 h-full transition-all duration-200"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Empty State */}
          {pages.length === 0 && !isScanning && !completedDoc && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400/80 shadow-lg">
                <ScanLine className="w-10 h-10" />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="text-base font-bold text-slate-200">Bereit zum Scannen</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Wähle links deinen Scanner aus und klicke auf <strong>Scan starten</strong>. Du kannst anschließend Seiten prüfen, drehen und mit einem Klick verschlüsselt an dein Smartphone übertragen.
                </p>
              </div>
            </div>
          )}

          {/* Pages Preview & Send Pipeline */}
          {pages.length > 0 && !completedDoc && (
            <div className="flex-1 flex flex-col overflow-hidden space-y-4">
              {/* Toolbar */}
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200">
                    {pages.length} {pages.length === 1 ? 'Seite gescannt' : 'Seiten gescannt'}
                  </span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400 font-mono">{dpi} DPI {colorMode}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRotatePage(selectedPageIndex)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 text-xs"
                    title="Aktuelle Seite um 90° drehen"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Drehen</span>
                  </button>

                  <button
                    onClick={() => handleDeletePage(selectedPageIndex)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 flex items-center gap-1 text-xs"
                    title="Diese Seite löschen"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Entfernen</span>
                  </button>

                  <button
                    onClick={handleSendToAndroid}
                    disabled={isTransmitting}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-md shadow-cyan-950/60 transition-all ml-2"
                  >
                    {isTransmitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>An {pairedDeviceName} übertragen</span>
                  </button>
                </div>
              </div>

              {/* Scanned Document Canvas */}
              <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-slate-950 border border-slate-800/80 rounded-2xl">
                {pages[selectedPageIndex] && (
                  <div
                    style={{
                      transform: `rotate(${pages[selectedPageIndex].rotation}deg)`,
                      transition: 'transform 0.2s ease'
                    }}
                    className="bg-white text-slate-900 rounded-lg shadow-2xl p-8 max-w-md w-full min-h-[480px] border border-slate-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="border-b-2 border-slate-900 pb-2 mb-4 flex justify-between items-center">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                          GESCANNTE SEITE {pages[selectedPageIndex].pageNumber}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{dpi} DPI</span>
                      </div>
                      <div className="space-y-2 text-xs text-slate-700 font-serif">
                        <p className="font-bold text-slate-900 text-sm">Stadtwerke München GmbH</p>
                        <p>Jahresabrechnung 2025/2026 - Fernwärme & Ökostrom</p>
                        <p className="text-[11px] text-slate-500">Vertragskonto: 200481920</p>
                        <div className="pt-4 space-y-1 text-slate-600">
                          <p>Verbrauchszeitraum: 01.01.2025 - 31.12.2025</p>
                          <p className="font-bold text-slate-800">Gesamtbetrag fällig: 142,80 EUR</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-[10px] text-slate-400 font-mono">
                      Seite {selectedPageIndex + 1} von {pages.length}
                    </div>
                  </div>
                )}
              </div>

              {/* Transmission Pipeline Step Visualizer */}
              {isTransmitting && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Verarbeitungs-Pipeline läuft...</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-[11px]">
                    <div className={`p-2 rounded-lg border ${pipelineStep >= 1 ? 'bg-cyan-950/40 border-cyan-800/60 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                      1. AES-256 Verschlüsselung
                    </div>
                    <div className={`p-2 rounded-lg border ${pipelineStep >= 2 ? 'bg-cyan-950/40 border-cyan-800/60 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                      2. WLAN-Stream an Smartphone
                    </div>
                    <div className={`p-2 rounded-lg border ${pipelineStep >= 3 ? 'bg-cyan-950/40 border-cyan-800/60 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                      3. On-Device Texterkennung (OCR)
                    </div>
                    <div className={`p-2 rounded-lg border ${pipelineStep >= 4 ? 'bg-cyan-950/40 border-cyan-800/60 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                      4. Sichere Ablage im Tresor
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Finished Document Success View */}
          {completedDoc && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-100">Dokument erfolgreich verarbeitet!</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  {completedDoc.title} wurde automatisch kategorisiert, verschlüsselt und in deinem Tresor abgelegt.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigateToVault(completedDoc.id)}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  Im Tresor anzeigen
                </button>
                <button
                  onClick={handleResetScanSession}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs border border-slate-700/60 transition-colors"
                >
                  Weiteres Dokument scannen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
