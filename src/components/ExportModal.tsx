import React, { useState } from 'react';
import { 
  Download, 
  X, 
  FolderOpen, 
  FileText, 
  ShieldCheck, 
  CheckCircle2 
} from 'lucide-react';
import { DocumentEntity } from '../types/document';

interface ExportModalProps {
  isOpen: boolean;
  document: DocumentEntity | null;
  defaultExportDir: string;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  document,
  defaultExportDir,
  onClose,
  onShowToast
}) => {
  const [targetDir, setTargetDir] = useState<string>(defaultExportDir);
  const [targetFilename, setTargetFilename] = useState<string>(document?.fileName || 'Dokument_Export.pdf');

  if (!isOpen || !document) return null;

  const handleExport = () => {
    // Generate text/pdf file payload blob for browser download simulation
    const exportContent = `%PDF-1.7 (Unverschlüsselter Export aus myDocAnizer Desktop)
Titel: ${document.title}
Absender: ${document.sender}
Kategorie: ${document.mainCategory} / ${document.subCategory}
Erstellt am: ${new Date(document.documentDate || document.createdAt || Date.now()).toLocaleDateString('de-DE')}
Betrag: ${document.amount ? `${document.amount.toFixed(2)} EUR` : 'Keiner'}

--- OCR-VOLLTEXT ---
${document.ocrText || ''}
`;

    const blob = new Blob([exportContent], { type: 'application/pdf;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = targetFilename.endsWith('.pdf') ? targetFilename : `${targetFilename}.pdf`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    // Revoke object URL after browser download initialization to prevent memory leak & aborts
    setTimeout(() => URL.revokeObjectURL(url), 1500);

    onShowToast(`💾 PDF erfolgreich nach „${targetDir}\\${targetFilename}“ exportiert!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Unverschlüsseltes PDF exportieren
              </h3>
              <p className="text-[11px] text-slate-400 truncate max-w-xs">
                {document.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Dateiname</label>
              <input
                type="text"
                value={targetFilename}
                onChange={(e) => setTargetFilename(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Zielverzeichnis auf PC</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={targetDir}
                  onChange={(e) => setTargetDir(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-teal-500"
                />
                <button
                  onClick={() => onShowToast('📁 Verzeichnisdialog geöffnet')}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/60"
                >
                  Durchsuchen
                </button>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-[11px] text-amber-300 space-y-1">
            <div className="font-semibold">Sicherheitshinweis</div>
            <p className="text-amber-200/80">
              Die exportierte PDF-Datei wird unverschlüsselt in deinem PC-Dateisystem gespeichert. Achte darauf, sensible Daten nur auf geschützten Datenträgern zu sichern.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Jetzt Exportieren</span>
          </button>
        </div>
      </div>
    </div>
  );
};
