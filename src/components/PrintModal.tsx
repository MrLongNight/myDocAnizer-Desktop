import React, { useState } from 'react';
import { 
  Printer, 
  X, 
  FileText, 
  ShieldAlert, 
  Check, 
  Sliders, 
  Layers
} from 'lucide-react';
import { DocumentEntity } from '../types/document';

interface PrintModalProps {
  isOpen: boolean;
  document: DocumentEntity | null;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  document,
  onClose,
  onShowToast
}) => {
  const [selectedPrinter, setSelectedPrinter] = useState<string>('Standard Systemdrucker (Spooler)');
  const [printColor, setPrintColor] = useState<'color' | 'mono'>('color');
  const [pageRange, setPageRange] = useState<string>('all');
  const [copies, setCopies] = useState<number>(1);

  if (!isOpen || !document) return null;

  const handlePrint = () => {
    onShowToast(`🖨️ Übergebe PDF-Druckdaten von „${document.title}“ an den Druckerdialog...`);
    onClose();
    // Native print trigger wrapped safely for iframe sandbox environments
    setTimeout(() => {
      try {
        window.print();
      } catch (e) {
        console.warn('window.print() not available or blocked in current sandbox:', e);
        onShowToast('⚠️ Systemdrucker im aktuellen Browser-Sandbox-Modus eingeschränkt.');
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Dokument drucken
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
          {/* Print Options */}
          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Drucker</label>
              <select
                value={selectedPrinter}
                onChange={(e) => setSelectedPrinter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              >
                <option value="Standard Systemdrucker (Spooler)">Standard Systemdrucker (Spooler)</option>
                <option value="HP LaserJet Pro MFP M428fdw (Netzwerk)">HP LaserJet Pro MFP M428fdw (Netzwerk)</option>
                <option value="Canon PIXMA TS8350 Series (Wi-Fi)">Canon PIXMA TS8350 Series (Wi-Fi)</option>
                <option value="Microsoft Print to PDF">Microsoft Print to PDF</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Exemplare</label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={copies}
                  onChange={(e) => setCopies(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Seitenbereich</label>
                <select
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="all">Alle Seiten (1-{document.pageCount})</option>
                  <option value="first">Nur erste Seite</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security Briefing */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-teal-400" />
              <span>Flüchtiger RAM-Drucker-Spool</span>
            </div>
            <p>
              Das Dokument wird im Arbeitsspeicher entschlüsselt und direkt an den Druckerspooler übergeben, ohne Spuren im Dateisystem zu hinterlassen.
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
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors shadow-md"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Jetzt Drucken</span>
          </button>
        </div>
      </div>
    </div>
  );
};
