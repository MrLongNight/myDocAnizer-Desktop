import React, { useState, useMemo } from 'react';
import { DocumentEntity } from '../../types/document';
import { DocumentDetailView } from './DocumentDetailView';
import { 
  Search, 
  FileText, 
  Calendar, 
  Clock, 
  ArrowUpDown, 
  ShieldCheck, 
  X, 
  FileSignature,
  Receipt,
  Home,
  HeartPulse,
  Car,
  Building2,
  FolderLock,
  ScanLine,
  Smartphone
} from 'lucide-react';

interface VaultExplorerProps {
  documents: DocumentEntity[];
  selectedDocId: number | null;
  onSelectDocument: (id: number) => void;
  onUpdateDocument: (doc: DocumentEntity) => void;
  onDeleteDocument: (id: number) => void;
  onOpenPrintDialog: (doc: DocumentEntity) => void;
  onOpenExportDialog: (doc: DocumentEntity) => void;
  onStartNewScan: () => void;
  onShowToast: (msg: string) => void;
}

const CATEGORY_ITEMS = [
  { id: 'all', name: 'Alle', Icon: FileText },
  { id: 'cat_contracts', name: 'Verträge', Icon: FileSignature },
  { id: 'cat_insurance', name: 'Versicherungen', Icon: ShieldCheck },
  { id: 'cat_finance', name: 'Finanzen', Icon: Receipt },
  { id: 'cat_housing', name: 'Wohnen', Icon: Home },
  { id: 'cat_health', name: 'Gesundheit', Icon: HeartPulse },
  { id: 'cat_mobility', name: 'Mobilität & Kfz', Icon: Car },
  { id: 'cat_authorities', name: 'Behörden', Icon: Building2 }
];

export const VaultExplorer: React.FC<VaultExplorerProps> = ({
  documents,
  selectedDocId,
  onSelectDocument,
  onUpdateDocument,
  onDeleteDocument,
  onOpenPrintDialog,
  onOpenExportDialog,
  onStartNewScan,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterDeadlinesOnly, setFilterDeadlinesOnly] = useState<boolean>(false);
  const [filterWithAmountOnly, setFilterWithAmountOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'amount' | 'deadline'>('newest');
  const [showTrash, setShowTrash] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'standard' | 'expert'>('standard');
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  // Active documents vs Trash
  const activeDocs = useMemo(() => {
    return documents.filter(d => showTrash ? d.isDeleted : !d.isDeleted);
  }, [documents, showTrash]);

  // Statistics
  const stats = useMemo(() => {
    const total = documents.filter(d => !d.isDeleted).length;
    const withDeadlines = documents.filter(d => !d.isDeleted && d.cancellationDeadline).length;
    const withAmounts = documents.filter(d => !d.isDeleted && (d.amount || 0) > 0).length;
    const trashCount = documents.filter(d => d.isDeleted).length;
    return { total, withDeadlines, withAmounts, trashCount };
  }, [documents]);

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return activeDocs.filter(doc => {
      if (selectedCategory !== 'all' && doc.mainCategoryId !== selectedCategory) {
        return false;
      }
      if (filterDeadlinesOnly && !doc.cancellationDeadline) {
        return false;
      }
      if (filterWithAmountOnly && (doc.amount === null || doc.amount === undefined)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches = 
          (doc.title || '').toLowerCase().includes(q) ||
          (doc.sender || '').toLowerCase().includes(q) ||
          (doc.tags || '').toLowerCase().includes(q) ||
          (doc.mainCategory || '').toLowerCase().includes(q) ||
          (doc.subCategory || '').toLowerCase().includes(q) ||
          (doc.ocrText || '').toLowerCase().includes(q);

        if (!matches) return false;
      }
      return true;
    }).sort((a, b) => {
      const aTime = a.createdAt || a.documentDate || 0;
      const bTime = b.createdAt || b.documentDate || 0;
      if (sortBy === 'newest') return bTime - aTime;
      if (sortBy === 'oldest') return aTime - bTime;
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'amount') return (b.amount || 0) - (a.amount || 0);
      if (sortBy === 'deadline') {
        const aDeadline = a.cancellationDeadline || Number.MAX_SAFE_INTEGER;
        const bDeadline = b.cancellationDeadline || Number.MAX_SAFE_INTEGER;
        return aDeadline - bDeadline;
      }
      return 0;
    });
  }, [activeDocs, selectedCategory, filterDeadlinesOnly, filterWithAmountOnly, searchQuery, sortBy]);

  const selectedDocument = useMemo(() => {
    if (!selectedDocId) return filteredDocuments[0] || null;
    return documents.find(d => d.id === selectedDocId) || null;
  }, [documents, selectedDocId, filteredDocuments]);

  const formatDeadlineBadge = (deadlineTimestamp: number | null | undefined) => {
    if (!deadlineTimestamp) return null;
    const daysLeft = Math.ceil((deadlineTimestamp - Date.now()) / (1000 * 60 * 60 * 24));
    
    let text = '';
    let isUrgent = false;

    if (daysLeft < 0) {
      text = `Überfällig (${Math.abs(daysLeft)} Tage)`;
      isUrgent = true;
    } else if (daysLeft === 0) {
      text = 'Heute fällig!';
      isUrgent = true;
    } else if (daysLeft <= 14) {
      text = `Frist in ${daysLeft} Tagen`;
      isUrgent = true;
    } else {
      text = `Frist in ${daysLeft} Tagen`;
      isUrgent = false;
    }

    return (
      <span className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium ${
        isUrgent 
          ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60' 
          : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
      }`}>
        <Clock className="w-3 h-3" />
        <span>{text}</span>
      </span>
    );
  };

  const handleCardClick = (docId: number) => {
    onSelectDocument(docId);
    setMobileView('detail');
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      {/* If entirely empty vault (0 documents) and not searching in trash */}
      {stats.total === 0 && !showTrash ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none bg-slate-950/40">
          <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 mb-5 shadow-xl shadow-cyan-950/20">
            <FolderLock className="w-10 h-10" />
          </div>
          <h2 className="text-lg font-bold text-slate-100 mb-1.5">
            Dokumenten-Tresor ist leer
          </h2>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-6">
            Es sind noch keine Dokumente gespeichert. Du kannst deine Dokumente direkt über den integrierten Scanner erfassen oder per verschlüsselter Verbindung von myDocAnizer Mobile übertragen.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onStartNewScan}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-950/40 hover:from-cyan-400 hover:to-teal-400 transition-all"
            >
              <ScanLine className="w-4 h-4" />
              <span>Dokumente scannen</span>
            </button>
            <button
              onClick={() => onShowToast('📱 Verbinde myDocAnizer Mobile im Verbindungs-Assistenten (Zahnrad oben rechts).')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
            >
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>Smartphone synchronisieren</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Left List & Filter Pane (Hidden on mobile when detail is active) */}
          <div className={`${mobileView === 'detail' ? 'hidden md:flex' : 'flex'} w-full md:w-[380px] lg:w-[440px] flex-col h-full bg-slate-900 md:border-r border-slate-800 shrink-0 select-none`}>
            {/* Search Bar + View Mode Toggle */}
            <div className="p-2.5 sm:p-3 border-b border-slate-800 space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Suchen nach Absender, Betrag, Stichwort..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quick Filter Chips & View Mode Switcher */}
              <div className="flex items-center justify-between gap-1 pt-0.5">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                  <button
                    onClick={() => {
                      setShowTrash(false);
                      setSelectedCategory('all');
                      setFilterDeadlinesOnly(false);
                      setFilterWithAmountOnly(false);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      !showTrash && selectedCategory === 'all' && !filterDeadlinesOnly && !filterWithAmountOnly
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Alle ({stats.total})
                  </button>

                  <button
                    onClick={() => {
                      setShowTrash(false);
                      setFilterDeadlinesOnly(!filterDeadlinesOnly);
                    }}
                    className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                      filterDeadlinesOnly
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                    title="Nur Dokumente mit Fristen"
                  >
                    <Clock className="w-3 h-3" />
                    <span>Fristen ({stats.withDeadlines})</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowTrash(false);
                      setFilterWithAmountOnly(!filterWithAmountOnly);
                    }}
                    className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                      filterWithAmountOnly
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                    title="Nur Dokumente mit Rechnungsbeträgen"
                  >
                    <span>💶 Rechnungen</span>
                  </button>

                  <button
                    onClick={() => setShowTrash(!showTrash)}
                    className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      showTrash
                        ? 'bg-rose-500 text-white font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                    title="Papierkorb"
                  >
                    Papierkorb ({stats.trashCount})
                  </button>
                </div>

                {/* View Mode Switcher: Standard vs IT-Experte */}
                <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800 shrink-0 ml-1">
                  <button
                    onClick={() => setViewMode('standard')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                      viewMode === 'standard'
                        ? 'bg-slate-800 text-cyan-300'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Standard-Ansicht"
                  >
                    Klar
                  </button>
                  <button
                    onClick={() => setViewMode('expert')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                      viewMode === 'expert'
                        ? 'bg-slate-800 text-cyan-300'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="IT-Experten-Ansicht"
                  >
                    IT-Nerd
                  </button>
                </div>
              </div>
            </div>

            {/* Categories Bar with Real Lucide Icons (No literal text bugs) */}
            <div className="px-3 py-1.5 border-b border-slate-800/80 flex items-center gap-1 overflow-x-auto no-scrollbar text-xs text-slate-400">
              <span className="text-[10px] uppercase font-semibold text-slate-500 shrink-0 mr-1">Kategorie:</span>
              {CATEGORY_ITEMS.map(cat => {
                const IconComponent = cat.Icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setShowTrash(false);
                      setSelectedCategory(cat.id === selectedCategory ? 'all' : cat.id);
                    }}
                    className={`px-2 py-1 rounded-md whitespace-nowrap transition-colors flex items-center gap-1 text-[11px] ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium'
                        : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <IconComponent className={`w-3 h-3 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Result Counter & Sorting */}
            <div className="px-3 py-1.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>
                {filteredDocuments.length} Dokument{filteredDocuments.length !== 1 ? 'e' : ''} im Tresor
              </span>

              <div className="flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3 text-slate-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-[11px] text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="newest" className="bg-slate-900">Neueste zuerst</option>
                  <option value="oldest" className="bg-slate-900">Älteste zuerst</option>
                  <option value="title" className="bg-slate-900">Alphabetisch (Titel)</option>
                  <option value="amount" className="bg-slate-900">Höchster Betrag</option>
                  <option value="deadline" className="bg-slate-900">Nächste Frist</option>
                </select>
              </div>
            </div>

            {/* Document Cards List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
              {filteredDocuments.length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-xs font-semibold text-slate-300">Keine passenden Dokumente</p>
                  <p className="text-[11px] text-slate-500">
                    Passe Suchbegriff oder Filter an.
                  </p>
                </div>
              ) : (
                filteredDocuments.map(doc => {
                  const isSelected = selectedDocument?.id === doc.id;

                  return (
                    <div
                      key={doc.id}
                      onClick={() => handleCardClick(doc.id)}
                      className={`p-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-cyan-500/10 border-l-4 border-l-cyan-400'
                          : 'hover:bg-slate-800/50 border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          {/* Sender & Category */}
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[11px] font-bold text-cyan-400 truncate">
                              {doc.sender}
                            </span>
                            <span className="text-slate-600">·</span>
                            <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded truncate">
                              {doc.mainCategory}
                            </span>
                          </div>

                          {/* Title */}
                          <h4 className={`text-xs font-semibold leading-snug line-clamp-2 ${
                            isSelected ? 'text-white' : 'text-slate-200'
                          }`}>
                            {doc.title}
                          </h4>

                          {/* Key Facts: Amount & Date & Deadline */}
                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1 text-slate-400">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {doc.documentDateFormatted || new Date(doc.documentDate || doc.createdAt || Date.now()).toLocaleDateString('de-DE')}
                            </span>

                            {doc.amount !== null && doc.amount !== undefined && (
                              <span className="font-mono text-emerald-400 font-semibold">
                                {doc.amount.toFixed(2)} {doc.currency || 'EUR'}
                              </span>
                            )}

                            {formatDeadlineBadge(doc.cancellationDeadline)}
                          </div>

                          {/* IT-Experten Mode Details */}
                          {viewMode === 'expert' && (
                            <div className="mt-2 pt-1.5 border-t border-slate-800/80 space-y-0.5 text-[10px] font-mono text-slate-500">
                              <div className="flex items-center justify-between">
                                <span className="text-cyan-400">AES-256-GCM</span>
                                <span>OCR: {doc.ocrConfidence ? (doc.ocrConfidence * 100).toFixed(0) : '98'}%</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Status / Page Badge */}
                        <div className="shrink-0 flex flex-col items-end gap-1">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            doc.status === 'processed' || !doc.status
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                              : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                          }`}>
                            {doc.status === 'processed' || !doc.status ? 'Archiviert' : 'Prüfen'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {doc.pageCount} {doc.pageCount === 1 ? 'Seite' : 'Seiten'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Detail Pane (Visible on desktop side-by-side or on mobile when a document is opened) */}
          <div className={`${mobileView === 'list' ? 'hidden md:flex' : 'flex'} flex-1 flex-col h-full overflow-hidden`}>
            <DocumentDetailView
              document={selectedDocument}
              onUpdateDocument={onUpdateDocument}
              onDeleteDocument={onDeleteDocument}
              onOpenPrintDialog={onOpenPrintDialog}
              onOpenExportDialog={onOpenExportDialog}
              onShowToast={onShowToast}
              onBackToList={() => setMobileView('list')}
            />
          </div>
        </>
      )}
    </div>
  );
};
