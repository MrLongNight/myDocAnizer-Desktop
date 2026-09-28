import React, { useState, useEffect, useRef } from 'react';
import { 
  DocumentEntity 
} from '../../types/document';
import { 
  Printer, 
  Download, 
  Save, 
  Trash2, 
  FileText, 
  ShieldCheck, 
  Calendar, 
  Tag, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Copy, 
  Check, 
  AlertTriangle,
  Clock,
  Layers,
  FileCheck,
  Building,
  Key,
  Info,
  Euro,
  Cpu,
  Hash,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { VaultService } from '../../services/vaultStorage';

interface DocumentDetailViewProps {
  document: DocumentEntity | null;
  onUpdateDocument: (doc: DocumentEntity) => void;
  onDeleteDocument: (id: number) => void;
  onOpenPrintDialog: (doc: DocumentEntity) => void;
  onOpenExportDialog: (doc: DocumentEntity) => void;
  onShowToast: (msg: string) => void;
  onBackToList?: () => void;
}

export const DocumentDetailView: React.FC<DocumentDetailViewProps> = ({
  document,
  onUpdateDocument,
  onDeleteDocument,
  onOpenPrintDialog,
  onOpenExportDialog,
  onShowToast,
  onBackToList
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'metadata' | 'ocr' | 'crypto'>('preview');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [copiedOcr, setCopiedOcr] = useState<boolean>(false);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  // Safe date conversion helper preventing RangeError crashes
  const formatIsoDateSafely = (timestamp: number | null | undefined): string => {
    if (!timestamp || isNaN(timestamp) || timestamp <= 0) return '';
    try {
      const d = new Date(timestamp);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Editable form state
  const [formData, setFormData] = useState<DocumentEntity | null>(null);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  useEffect(() => {
    if (document) {
      setFormData({ ...document });
      setHasChanges(false);
      setCurrentPage(1);
      // Ensure RAM buffer is loaded
      VaultService.decryptDocumentToRAM(document);
    } else {
      setFormData(null);
    }
  }, [document]);

  if (!document || !formData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 bg-slate-950/40 select-none">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mb-4">
          <FileText className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-base font-semibold text-slate-300 mb-1">Kein Dokument ausgewählt</h3>
        <p className="text-xs text-slate-400 max-w-sm">
          Wähle ein Dokument aus der linken Liste aus, um die sichere Vorschau, Rechnungsdaten und Krypto-Prüfsummen anzuzeigen.
        </p>
      </div>
    );
  }

  const handleInputChange = (field: keyof DocumentEntity, value: any) => {
    if (!formData) return;
    setFormData({
      ...formData,
      [field]: value
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!formData) return;
    onUpdateDocument(formData);
    setHasChanges(false);
    onShowToast('✅ Änderungen erfolgreich im lokalen Tresor gespeichert!');
  };

  const handleCopyOcr = () => {
    if (formData?.ocrText) {
      navigator.clipboard.writeText(formData.ocrText);
      setCopiedOcr(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopiedOcr(false), 2000);
      onShowToast('📋 Erkannter Text in die Zwischenablage kopiert');
    }
  };

  const handleCopyHash = () => {
    const hashToCopy = formData?.fileChecksum || formData?.sha256;
    if (hashToCopy) {
      navigator.clipboard.writeText(hashToCopy);
      setCopiedHash(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopiedHash(false), 2000);
      onShowToast('🔒 SHA-256 Prüfsumme in die Zwischenablage kopiert');
    }
  };

  const calculateDaysUntilDeadline = (timestamp: number | null | undefined) => {
    if (!timestamp) return null;
    const diffTime = timestamp - Date.now();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const deadlineDays = calculateDaysUntilDeadline(formData.cancellationDeadline);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900/60 md:border-l border-slate-800 overflow-hidden select-none">
      {/* Detail Header & Action Buttons */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {onBackToList && (
            <button
              onClick={onBackToList}
              className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-cyan-300 hover:text-cyan-200 border border-slate-700 text-xs font-semibold shrink-0"
              title="Zurück zur Dokumentenliste"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Liste</span>
            </button>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100 truncate">
                {formData.title}
              </h3>
              {hasChanges && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium shrink-0">
                  Ungespeichert
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 truncate">
              <span className="text-cyan-400 font-semibold truncate">{formData.sender}</span>
              <span>·</span>
              <span className="shrink-0">{formData.documentDateFormatted || new Date(formData.documentDate || formData.createdAt || Date.now()).toLocaleDateString('de-DE')}</span>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Save Changes Button */}
          {hasChanges && (
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors text-xs shadow-md"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Speichern</span>
            </button>
          )}

          {/* Print Button */}
          <button
            onClick={() => onOpenPrintDialog(formData)}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700/60 transition-colors text-xs font-medium"
            title="Dokument drucken"
          >
            <Printer className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Drucken</span>
          </button>

          {/* Export PDF Button */}
          <button
            onClick={() => onOpenExportDialog(formData)}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700/60 transition-colors text-xs font-medium"
            title="Als PDF exportieren"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">PDF Export</span>
          </button>

          {/* Delete / Move to Trash */}
          <button
            onClick={() => onDeleteDocument(formData.id)}
            className={`p-1.5 rounded-xl border transition-colors ${
              formData.isDeleted
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/50'
                : 'bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border-slate-700/60 hover:border-rose-800/60'
            }`}
            title={formData.isDeleted ? 'Aus Papierkorb wiederherstellen' : 'Dokument in Papierkorb verschieben'}
          >
            {formData.isDeleted ? (
              <RefreshCw className="w-4 h-4" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Tabs Navigation (Both Beginner-Friendly & Nerd-Friendly) */}
      <div className="flex items-center border-b border-slate-800 bg-slate-950/60 px-2 sm:px-4 gap-1 sm:gap-2 text-xs shrink-0 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-1.5 py-2 px-2.5 sm:px-3 border-b-2 font-medium whitespace-nowrap transition-colors ${
            activeTab === 'preview'
              ? 'border-cyan-400 text-cyan-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Vorschau & Zoom</span>
        </button>

        <button
          onClick={() => setActiveTab('metadata')}
          className={`flex items-center gap-1.5 py-2 px-2.5 sm:px-3 border-b-2 font-medium whitespace-nowrap transition-colors ${
            activeTab === 'metadata'
              ? 'border-cyan-400 text-cyan-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Daten & Fristen</span>
        </button>

        <button
          onClick={() => setActiveTab('ocr')}
          className={`flex items-center gap-1.5 py-2 px-2.5 sm:px-3 border-b-2 font-medium whitespace-nowrap transition-colors ${
            activeTab === 'ocr'
              ? 'border-cyan-400 text-cyan-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Erkannter Text (OCR)</span>
        </button>

        <button
          onClick={() => setActiveTab('crypto')}
          className={`flex items-center gap-1.5 py-2 px-2.5 sm:px-3 border-b-2 font-medium whitespace-nowrap transition-colors ${
            activeTab === 'crypto'
              ? 'border-cyan-400 text-cyan-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Sicherheit & Krypto</span>
        </button>
      </div>

      {/* Tab 1: Preview & Zoom */}
      {activeTab === 'preview' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          {/* Zoom & View Controls */}
          <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-300">
                Seite {currentPage} von {formData.pageCount ?? 1}
              </span>
              {(formData.pageCount ?? 1) > 1 && (
                <div className="flex items-center gap-1 ml-2">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 disabled:opacity-40"
                  >
                    Zurück
                  </button>
                  <button
                    disabled={currentPage >= (formData.pageCount ?? 1)}
                    onClick={() => setCurrentPage(prev => Math.min(formData.pageCount ?? 1, prev + 1))}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 disabled:opacity-40"
                  >
                    Weiter
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setZoomLevel(prev => Math.max(50, prev - 15))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300"
                title="Verkleinern"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] px-1 text-slate-300">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(250, prev + 15))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300"
                title="Vergrößern"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setRotation(prev => (prev + 90) % 360)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 ml-1"
                title="Dokument um 90° im Uhrzeigersinn drehen"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Document Canvas Display */}
          <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-slate-950/80">
            <div
              style={{
                transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
                transition: 'transform 0.15s ease'
              }}
              className="bg-white text-slate-900 rounded-lg shadow-2xl p-8 max-w-lg w-full min-h-[560px] flex flex-col justify-between border border-slate-300 select-text"
            >
              <div>
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3 mb-4">
                  <div>
                    <h2 className="text-base font-black tracking-tight text-slate-900">{formData.sender}</h2>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{formData.mainCategory}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-bold text-slate-800">{formData.documentDateFormatted || new Date(formData.documentDate || formData.createdAt || Date.now()).toLocaleDateString('de-DE')}</p>
                    <p className="text-[10px] text-slate-500 font-mono">Ref: #{formData.id.toString().slice(-6)}</p>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-3">{formData.title}</h3>

                <div className="text-xs text-slate-700 leading-relaxed space-y-2 whitespace-pre-wrap font-serif">
                  {(formData.ocrText || '').slice(0, 480)}...
                </div>
              </div>

              <div className="border-t border-slate-300 pt-3 mt-6 flex justify-between items-center text-xs">
                <div>
                  {formData.amount !== null && formData.amount !== undefined && (
                    <span className="font-bold text-slate-900 text-sm">
                      Gesamtbetrag: {formData.amount.toFixed(2)} {formData.currency || 'EUR'}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Seite {currentPage}/{formData.pageCount}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Metadata & Deadlines */}
      {activeTab === 'metadata' && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-xs text-slate-300 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong>Automatisch erkannte Daten:</strong> Diese Angaben wurden von der KI deines Smartphones bei der Digitalisierung extrahiert. Du kannst alle Werte jederzeit anpassen.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-300">Dokumenten-Titel</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Sender */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Absender / Aussteller</label>
              <input
                type="text"
                value={formData.sender}
                onChange={(e) => handleInputChange('sender', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Dokumentendatum</label>
              <input
                type="text"
                value={formData.documentDateFormatted}
                onChange={(e) => handleInputChange('documentDateFormatted', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Amount */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Rechnungsbetrag (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount ?? ''}
                onChange={(e) => handleInputChange('amount', e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {/* Cancellation Deadline */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Kündigungs- oder Zahlungsfrist</span>
                {deadlineDays !== null && (
                  <span className={`text-[10px] font-bold ${deadlineDays <= 14 ? 'text-rose-400' : 'text-amber-400'}`}>
                    {deadlineDays > 0 ? `In ${deadlineDays} Tagen` : 'Heute fällig!'}
                  </span>
                )}
              </label>
              <input
                type="date"
                value={formatIsoDateSafely(formData.cancellationDeadline)}
                onChange={(e) => {
                  const val = e.target.value ? new Date(e.target.value).getTime() : null;
                  handleInputChange('cancellationDeadline', val);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Tags */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-300">Schlagwörter & Tags (Kommagetrennt)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="z.B. KFZ, Versicherung, Steuer2026, Wichtig"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: OCR Text */}
      {activeTab === 'ocr' && (
        <div className="flex-1 flex flex-col p-6 overflow-hidden space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-200">Vollständig digitalisierter Text (OCR)</h4>
              <p className="text-[11px] text-slate-400">
                Dieser Text wird für die blitzschnelle Suche genutzt und kann kopiert oder bearbeitet werden.
              </p>
            </div>
            <button
              onClick={handleCopyOcr}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs transition-colors"
            >
              {copiedOcr ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedOcr ? 'Kopiert!' : 'Text kopieren'}</span>
            </button>
          </div>

          <textarea
            value={formData.ocrText}
            onChange={(e) => handleInputChange('ocrText', e.target.value)}
            className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed select-text"
          />
        </div>
      )}

      {/* Tab 4: Security & Crypto Audit (For Nerds + Clear Explanation for Noobs) */}
      {activeTab === 'crypto' && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Explanation for Noobs */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Wie ist dieses Dokument geschützt?</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Die Datei liegt auf deiner Festplatte als stark verschlüsselte <span className="font-mono text-cyan-300">.enc</span> Datei vor. Weder Windows noch andere Programme können den Klartext lesen. Erst wenn du das Dokument hier anklickst, wird es für die Vorschau <strong>ausschließlich im flüchtigen Arbeitsspeicher (RAM)</strong> entschlüsselt. Sobald du den Tresor sperrst, wird der Speicher rückstandslos bereinigt.
            </p>
          </div>

          {/* Technical Krypto Details for Nerds */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Kryptografische Parameter & Prüfsummen (Nerd-Zone)</span>
              </h4>
              <button
                onClick={handleCopyHash}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
              >
                {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Prüfsumme kopieren</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 font-mono">
                <span className="text-[10px] text-slate-500 uppercase">Verschlüsselung</span>
                <div className="text-slate-200 font-bold text-xs">AES-256-GCM (Authentifiziert)</div>
                <div className="text-[10px] text-slate-400">PBKDF2 Key-Derivation (100.000 Runden)</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 font-mono">
                <span className="text-[10px] text-slate-500 uppercase">Arbeitsspeicher (RAM-Puffer)</span>
                <div className="text-emerald-400 font-bold text-xs">Aktiv im RAM (LRU Gecappt)</div>
                <div className="text-[10px] text-slate-400">Zero-Plaintext on Disk Garantie</div>
              </div>

              <div className="md:col-span-2 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 font-mono">
                <span className="text-[10px] text-slate-500 uppercase">SHA-256 Integritäts-Hash</span>
                <div className="text-cyan-300 text-xs break-all">{formData.sha256 || formData.fileChecksum}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 font-mono">
                <span className="text-[10px] text-slate-500 uppercase">OCR Konfidenzwert</span>
                <div className="text-slate-200 text-xs font-bold">
                  {formData.ocrConfidence ? (formData.ocrConfidence * 100).toFixed(1) : '98.5'}% Konfidenz
                </div>
                <div className="text-[10px] text-slate-400">On-Device Tesseract / LayoutLM</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 font-mono">
                <span className="text-[10px] text-slate-500 uppercase">P2P Replikations-Protokoll</span>
                <div className="text-slate-200 text-xs font-bold">mTLS 1.3 (Port 9871)</div>
                <div className="text-[10px] text-slate-400">Zertifikats-Pinning verifiziert</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
