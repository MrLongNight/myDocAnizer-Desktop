import React from 'react';
import { X, ShieldCheck, Info, Cpu, CheckCircle2 } from 'lucide-react';

export interface InfoTopic {
  title: string;
  category?: string;
  simpleExplanation: string;
  technicalDetails?: {
    label: string;
    value: string;
    description?: string;
  }[];
  privacyNote?: string;
}

export interface InfoModalProps {
  isOpen?: boolean;
  onClose: () => void;
  topic: InfoTopic | null;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen = true, onClose, topic }) => {
  if (!isOpen || !topic) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Info className="w-4 h-4" />
            </div>
            <div>
              {topic.category && (
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                  {topic.category}
                </span>
              )}
              <h3 className="text-sm font-bold text-slate-100">{topic.title}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Simple explanation for everyone */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Verständlich erklärt</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-800/30 text-xs text-cyan-100/90 leading-relaxed">
              {topic.simpleExplanation}
            </div>
          </div>

          {/* Technical Specs for IT Nerds / Security Enthusiasts */}
          {topic.technicalDetails && topic.technicalDetails.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-slate-400" />
                <span>Technische Spezifikationen & Algorithmen</span>
              </div>
              <div className="space-y-1.5 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs">
                {topic.technicalDetails.map((detail, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-slate-800/60 last:border-0 gap-0.5">
                    <span className="text-slate-400 font-medium text-[11px]">{detail.label}:</span>
                    <span className="font-mono text-[11px] text-cyan-300 font-semibold">{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Privacy Note */}
          {topic.privacyNote && (
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{topic.privacyNote}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Verstanden & Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
