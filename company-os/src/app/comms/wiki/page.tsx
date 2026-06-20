'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppState } from '@/context/StateContext';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  FileText,
  Clock,
  Save,
  HelpCircle,
  Search
} from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

function WikiContent() {
  const { 
    activeUser, 
    employees, 
    wikiDocs, 
    saveWikiDoc, 
    deleteWikiDoc,
    permissions 
  } = useAppState();

  const searchParams = useSearchParams();
  const router = useRouter();

  const docId = searchParams.get('docId');
  const mode = searchParams.get('mode'); // 'create' | 'edit' | null

  const [searchQuery, setSearchQuery] = useState('');
  
  // Editor form states
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // Collapsible folders state
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['HR & Onboarding', 'Engineering SOPs', 'General Policies']);

  const canEditWiki = activeUser.role === 'SuperAdmin' || activeUser.role === 'HRAdmin' || activeUser.role === 'Manager';

  // Access check
  const hasAccess = activeUser.role === 'SuperAdmin' || activeUser.role === 'Manager' || activeUser.role === 'Employee';
  if (!hasAccess) {
    return <AccessDenied suite="Asynchronous Comms" role={activeUser.role} />;
  }

  // Gating check for edit/create
  if ((mode === 'create' || mode === 'edit') && !canEditWiki) {
    return <AccessDenied suite="Asynchronous Comms" role={activeUser.role} />;
  }

  const getDocFolder = (doc: typeof wikiDocs[0]) => {
    const title = doc.title.toLowerCase();
    if (title.includes('handbook') || title.includes('onboarding') || title.includes('hr')) {
      return 'HR & Onboarding';
    }
    if (title.includes('next.js') || title.includes('development') || title.includes('standards') || title.includes('engineering')) {
      return 'Engineering SOPs';
    }
    return 'General Policies';
  };

  const toggleFolder = (folderName: string) => {
    setExpandedFolders(prev => 
      prev.includes(folderName) 
        ? prev.filter(f => f !== folderName) 
        : [...prev, folderName]
    );
  };

  const parseMarkdown = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed === '') return <div key={idx} className="h-2.5" />;
      
      // Headers
      if (trimmed.startsWith('# ')) {
        return <h1 key={idx} className="text-base font-extrabold text-[#1A1C18] mt-4 mb-2 tracking-tight uppercase border-b border-[#E2E1DD] pb-1">{trimmed.substring(2)}</h1>;
      }
      if (trimmed.startsWith('## ')) {
        return <h2 key={idx} className="text-xs font-extrabold text-[#1A1C18] mt-3.5 mb-1.5 uppercase tracking-wide">{trimmed.substring(3)}</h2>;
      }
      if (trimmed.startsWith('### ')) {
        return <h3 key={idx} className="text-[10px] font-extrabold text-[#1A1C18] mt-3 mb-1 uppercase">{trimmed.substring(4)}</h3>;
      }
      
      // Bullets
      if (trimmed.startsWith('- ')) {
        return <li key={idx} className="list-disc ml-5 text-xs text-[#5E6258] font-semibold my-1 leading-relaxed">{trimmed.substring(2)}</li>;
      }
      
      // Numbered lists
      const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numberedMatch) {
        return <li key={idx} className="list-decimal ml-5 text-xs text-[#5E6258] font-semibold my-1 leading-relaxed">{numberedMatch[2]}</li>;
      }

      // Inline bold parsing
      let parts: React.ReactNode[] = [];
      let lastIdx = 0;
      const boldRegex = /\*\*(.*?)\*\*/g;
      let match;
      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIdx) {
          parts.push(line.substring(lastIdx, match.index));
        }
        parts.push(<strong key={match.index} className="font-extrabold text-[#1A1C18]">{match[1]}</strong>);
        lastIdx = boldRegex.lastIndex;
      }
      if (lastIdx < line.length) {
        parts.push(line.substring(lastIdx));
      }

      return (
        <p key={idx} className="text-xs text-[#5E6258] font-semibold leading-relaxed my-1 select-text">
          {parts.length > 0 ? parts : line}
        </p>
      );
    });
  };

  // Filter docs
  const filteredDocs = wikiDocs.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedDoc = wikiDocs.find(d => d.id === docId);
  const docAuthor = selectedDoc ? employees.find(e => e.id === selectedDoc.created_by) : null;

  // Handlers
  const handleSelectDoc = (id: string) => {
    router.push(`/comms/wiki?docId=${id}`);
  };

  const handleStartCreate = () => {
    setEditTitle('');
    setEditContent('');
    router.push('/comms/wiki?mode=create');
  };

  const handleStartEdit = () => {
    if (!selectedDoc) return;
    setEditTitle(selectedDoc.title);
    setEditContent(selectedDoc.content);
    router.push(`/comms/wiki?docId=${selectedDoc.id}&mode=edit`);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle || !editContent) return;
    saveWikiDoc(editTitle, editContent, selectedDoc?.id);
    router.push(selectedDoc?.id ? `/comms/wiki?docId=${selectedDoc.id}` : '/comms/wiki');
  };

  const handleDelete = () => {
    if (!docId) return;
    deleteWikiDoc(docId);
    router.push('/comms/wiki');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 h-[calc(100vh-4rem)] flex flex-col select-none overflow-hidden bg-[#F4F3EF]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E1DD] pb-4 shrink-0">
        <div>
          <h2 className="text-3xl font-extrabold text-black tracking-tight flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)]" />
            Knowledge Base Wiki
          </h2>
          <p className="text-sm text-[#5E6258] mt-1">Review Standard Operating Procedures (SOPs), onboarding guides, and shared company documents.</p>
        </div>
        
        {mode !== 'create' && canEditWiki && (
          <button
            onClick={handleStartCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-xs font-bold text-black hover:from-[#4F46E5] hover:to-[#7C3AED] transition-all cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.15)] uppercase tracking-wider"
          >
            <Plus className="h-4 w-4" /> Create SOP Document
          </button>
        )}
      </div>

      {/* Workspace Split Panels */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0 overflow-hidden">
        
        {/* Left Col: Document Directory */}
        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 flex flex-col min-h-0 overflow-hidden shadow-sm">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider shrink-0 mb-4 pb-2 border-b border-[#E2E1DD]/60">SOP Article Directory</h3>
          
          {/* Search bar */}
          <div className="relative mb-4 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#5E6258]" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search index..."
              className="w-full bg-[#FAF9F6] border border-[#E2E1DD] hover:border-[#8B5CF6]/40 focus:border-[#8B5CF6] rounded-xl pl-9 pr-3 py-1.5 text-xs text-black focus:outline-none transition-all placeholder-[#8C9086]"
            />
          </div>

          {/* Collapsible Nested Folders */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {['HR & Onboarding', 'Engineering SOPs', 'General Policies'].map((folder) => {
              const folderDocs = filteredDocs.filter(d => getDocFolder(d) === folder);
              const isExpanded = expandedFolders.includes(folder);
              
              return (
                <div key={folder} className="space-y-1.5">
                  <button 
                    onClick={() => toggleFolder(folder)}
                    className="w-full flex items-center justify-between text-[10px] font-extrabold text-[#1A1C18] uppercase tracking-wider bg-[#FAF9F6] border border-[#E2E1DD] px-3 py-2 rounded-xl hover:bg-[#EAE8E3]/50 transition-colors shrink-0"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="text-[#8B5CF6] font-extrabold">{isExpanded ? '▼' : '▶'}</span>
                      {folder}
                    </span>
                    <span className="text-[8px] text-[#5E6258] bg-[#EAE8E3] px-2 py-0.5 rounded-full font-bold">
                      {folderDocs.length}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="pl-3 border-l border-[#E2E1DD] ml-2.5 space-y-1.5">
                      {folderDocs.map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => handleSelectDoc(doc.id)}
                          className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl transition-all duration-200 text-left border ${
                            docId === doc.id
                              ? 'bg-[#E1FF4B] border-[#8B5CF6] text-black shadow-sm font-extrabold'
                              : 'bg-white border-[#E2E1DD] hover:bg-[#FAF9F6] text-[#5E6258] hover:text-black'
                          }`}
                        >
                          <FileText className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${docId === doc.id ? 'text-[#8B5CF6]' : 'text-[#8C9086]'}`} />
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <p className="text-[11px] font-bold truncate">{doc.title}</p>
                            <p className="text-[8px] text-[#8C9086] font-semibold">
                              Updated {doc.updated_at}
                            </p>
                          </div>
                        </button>
                      ))}
                      {folderDocs.length === 0 && (
                        <p className="text-[9px] text-[#8C9086] italic py-1 pl-1">No articles in directory.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: SOP Viewer / Editor Workspace */}
        <div className="lg:col-span-2 bg-white border border-[#E2E1DD] rounded-2xl flex flex-col min-h-0 overflow-hidden shadow-sm">
          {mode === 'create' || (mode === 'edit' && selectedDoc) ? (
            // Editor workspace
            <form onSubmit={handleSave} className="flex flex-col h-full overflow-hidden p-6 space-y-4">
              <div className="flex items-center justify-between shrink-0 border-b border-[#E2E1DD] pb-4">
                <h3 className="text-xs font-bold text-black uppercase tracking-wider">
                  {mode === 'create' ? 'Draft SOP Page' : `Modify: ${selectedDoc?.title}`}
                </h3>
                <button
                  type="button"
                  onClick={() => router.push(docId ? `/comms/wiki?docId=${docId}` : '/comms/wiki')}
                  className="flex items-center gap-1 text-xs text-[#5E6258] hover:text-black font-bold"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Cancel
                </button>
              </div>

              <div className="space-y-1.5 shrink-0">
                <label className="text-[10px] uppercase font-bold text-[#5E6258] tracking-wider">Page Header Title</label>
                <input 
                  type="text" 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  placeholder="e.g. Office Access Credentials & Wi-Fi"
                  className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#8B5CF6] rounded-xl px-4 py-2.5 text-xs text-black focus:outline-none transition-all placeholder-[#8C9086]"
                />
              </div>

              <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
                <label className="text-[10px] uppercase font-bold text-[#5E6258] tracking-wider shrink-0">Article Body Content</label>
                <textarea 
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  required
                  placeholder="Draft details and markdown instructions..."
                  className="flex-1 w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#8B5CF6] rounded-xl p-4 text-xs text-black focus:outline-none font-mono resize-none"
                />
              </div>

              <div className="pt-2 shrink-0">
                <button 
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-xs font-bold text-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-purple-500/10 cursor-pointer"
                >
                  <Save className="h-4 w-4" /> Save Wiki SOP Page
                </button>
              </div>
            </form>
          ) : selectedDoc ? (
            // Viewer workspace
            <div className="flex flex-col h-full overflow-hidden p-6">
              {/* Toolbar */}
              <div className="flex items-center justify-between shrink-0 border-b border-[#E2E1DD] pb-4">
                <div className="space-y-0.5">
                  <h3 className="text-md font-extrabold text-black leading-tight">{selectedDoc.title}</h3>
                  <p className="text-[9px] text-[#5E6258] font-bold uppercase">
                    Updated {selectedDoc.updated_at} {docAuthor ? `by ${docAuthor.first_name} ${docAuthor.last_name}` : ''}
                  </p>
                </div>
                
                {canEditWiki && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleStartEdit}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E293B] border border-[#2E3C51] text-white rounded-lg hover:bg-[#2E3C51]/95 transition-colors cursor-pointer font-bold"
                    >
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </button>
                    {/* Delete button (Only manager/creator can delete) */}
                    {(activeUser.role === 'SuperAdmin' || activeUser.role === 'Manager' || activeUser.id === selectedDoc.created_by) && (
                      <button 
                        onClick={handleDelete}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-lg hover:bg-rose-500/20 transition-all cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Content text */}
              <div className="flex-1 overflow-y-auto pt-6 space-y-2 select-text">
                {parseMarkdown(selectedDoc.content)}
              </div>
            </div>
          ) : (
            // Empty State
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-sm text-[#5E6258]">
              <HelpCircle className="h-12 w-12 text-[#1E293B] mb-2 animate-bounce" />
              <p className="font-extrabold uppercase tracking-wider text-black">No Document Selected</p>
              <p className="text-xs text-[#5E6258] mt-0.5 leading-relaxed max-w-[200px]">Select a handbook link or SOP page from the index directory sidebar to inspect.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function WikiPage() {
  return (
    <React.Suspense fallback={
      <div className="p-8 text-center text-xs text-[#5E6258] select-none font-bold uppercase tracking-wider animate-pulse">
        Loading SOP Wiki Database...
      </div>
    }>
      <WikiContent />
    </React.Suspense>
  );
}
