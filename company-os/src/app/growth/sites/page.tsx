'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/StateContext';
import { 
  Globe, 
  Plus, 
  Trash2, 
  FileText, 
  Smartphone, 
  Monitor, 
  Sliders, 
  CheckCircle,
  FolderKanban,
  Edit2
} from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

interface PageSection {
  id: string;
  type: 'Hero' | 'Features' | 'CTA';
  title: string;
  subtitle: string;
  theme: 'Light' | 'Dark' | 'Brand';
}

interface WebPage {
  id: string;
  slug: string;
  name: string;
  sections: PageSection[];
}

const initialPages: WebPage[] = [
  {
    id: 'page-1',
    slug: 'home',
    name: 'Home Landing Page',
    sections: [
      { id: 'sec-1', type: 'Hero', title: 'The Lifetime POS OS for Cafe billing', subtitle: 'Replace recurring seat fees with a self-hosted cloud monorepo instance.', theme: 'Brand' },
      { id: 'sec-2', type: 'Features', title: 'Why Restaurant Owners Switch', subtitle: 'Zero per-seat markup fees, offline hybrid database synchronization, and local hardware connections.', theme: 'Light' }
    ]
  },
  {
    id: 'page-2',
    slug: 'pricing',
    name: 'Pricing Plans',
    sections: [
      { id: 'sec-3', type: 'Hero', title: 'Transparent One-Time Setup Licensing', subtitle: 'Pay once, own your data and database code forever.', theme: 'Dark' }
    ]
  }
];

export default function SitesPage() {
  const { activeUser } = useAppState();
  const [pages, setPages] = useState<WebPage[]>(initialPages);
  const [activePageId, setActivePageId] = useState<string>('page-1');
  const [activeSectionId, setActiveSectionId] = useState<string>('sec-1');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');

  const hasAccess = ['SuperAdmin', 'HRAdmin', 'Manager', 'Employee'].includes(activeUser.role);

  if (!hasAccess) {
    return <AccessDenied suite="Growth Suite" role={activeUser.role} />;
  }

  const handleCreatePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageName || !newPageSlug) return;

    const page: WebPage = {
      id: `page-${Date.now()}`,
      slug: newPageSlug.toLowerCase().replace(/\s+/g, '-'),
      name: newPageName,
      sections: [
        { id: `sec-${Date.now()}`, type: 'Hero', title: 'Welcome to your page', subtitle: 'Edit this subtitle text', theme: 'Light' }
      ]
    };

    setPages(prev => [...prev, page]);
    setActivePageId(page.id);
    setActiveSectionId(page.sections[0].id);
    setNewPageName('');
    setNewPageSlug('');
    setShowAddForm(false);
  };

  const handleUpdateSection = (field: 'title' | 'subtitle' | 'theme', value: string) => {
    setPages(prev => prev.map(p => {
      if (p.id === activePageId) {
        return {
          ...p,
          sections: p.sections.map(s => s.id === activeSectionId ? { ...s, [field]: value } : s)
        };
      }
      return p;
    }));
  };

  const deletePage = (id: string) => {
    setPages(prev => prev.filter(p => p.id !== id));
    if (activePageId === id) {
      setActivePageId(pages.find(p => p.id !== id)?.id || '');
    }
  };

  const activePage = pages.find(p => p.id === activePageId);
  const activeSection = activePage?.sections.find(s => s.id === activeSectionId);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-[#F4F3EF] min-h-[calc(100vh-4rem)] select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E2E1DD] pb-4">
        <div className="flex items-center gap-3">
          <Globe className="h-8 w-8 text-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)]" />
          <div>
            <h2 className="text-3xl font-extrabold text-[#1A1C18] tracking-tight">Website Builder — CMS</h2>
            <p className="text-sm text-[#5E6258] mt-1">Configure company websites, modify page sections layout templates, and preview desktop/mobile designs.</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-[#E1FF4B] border border-[#C0D930] hover:bg-[#d5f242] text-black font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Create Page
        </button>
      </div>

      {/* Split view Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Column 1: Page Registry list */}
        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 space-y-4 shadow-sm h-[580px] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-[#E2E1DD] pb-3">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider">Site Map Directory</h3>
            </div>

            <div className="space-y-2">
              {pages.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    setActivePageId(p.id);
                    if (p.sections[0]) {
                      setActiveSectionId(p.sections[0].id);
                    }
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                    activePageId === p.id
                      ? 'bg-[#FAF9F6] border-[#8B5CF6]/30 shadow-sm border-l-4 border-l-[#8B5CF6]'
                      : 'bg-transparent border-transparent hover:bg-[#FAF9F6]/55 hover:border-[#E2E1DD]'
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-black text-black">{p.name}</h4>
                    <p className="text-[10px] text-[#8C9086] font-mono leading-none mt-1">/{p.slug}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePage(p.id);
                    }}
                    className="text-[#8C9086] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Page"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#FAF9F6] border border-[#E2E1DD] p-4 rounded-xl text-center text-[10px] text-[#8C9086] font-bold">
            Domain: company.site
          </div>
        </div>

        {/* Column 2: Active Page Sections Editor controls */}
        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 space-y-5 shadow-sm h-[580px] overflow-y-auto">
          {activePage ? (
            <div className="space-y-5">
              <div className="border-b border-[#E2E1DD] pb-2">
                <h3 className="text-xs font-bold text-black uppercase tracking-wider">Section Editor</h3>
              </div>

              {/* Sections list in active page */}
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-[#8C9086] uppercase">Page Sections</label>
                {activePage.sections.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSectionId(s.id)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                      activeSectionId === s.id
                        ? 'bg-[#FAF9F6] border-[#8B5CF6] text-black font-extrabold'
                        : 'bg-transparent border-[#E2E1DD] text-[#5E6258] hover:bg-[#FAF9F6]/55'
                    }`}
                  >
                    <span className="text-[9px] text-[#8C9086] uppercase block font-bold leading-none">{s.type}</span>
                    <span className="text-xs mt-1 block truncate font-semibold">{s.title}</span>
                  </button>
                ))}
              </div>

              {/* Edit content form of active section */}
              {activeSection && (
                <div className="space-y-4 border-t border-[#E2E1DD] pt-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#8C9086] uppercase">Heading Title</label>
                    <input
                      type="text"
                      value={activeSection.title}
                      onChange={e => handleUpdateSection('title', e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#8C9086] uppercase">Subtitle Text</label>
                    <textarea
                      value={activeSection.subtitle}
                      onChange={e => handleUpdateSection('subtitle', e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black h-20 resize-none font-semibold leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#8C9086] uppercase">Section Background Theme</label>
                    <select
                      value={activeSection.theme}
                      onChange={e => handleUpdateSection('theme', e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black"
                    >
                      <option value="Light">Bone White Light Theme</option>
                      <option value="Dark">Charcoal Dark Theme</option>
                      <option value="Brand">Neon Lime Brand Accent</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-[#8C9086] italic text-center py-20">Select a page.</p>
          )}
        </div>

        {/* Column 3: Live Preview Frame */}
        <div className="lg:col-span-2 bg-white border border-[#E2E1DD] rounded-2xl p-5 shadow-sm h-[580px] flex flex-col justify-between">
          
          {/* Header controls (desktop/mobile switch) */}
          <div className="border-b border-[#E2E1DD] pb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
              <Globe className="h-4 w-4 text-[#C0D930]" /> Interactive Site Preview
            </h3>
            
            <div className="flex bg-[#EAE8E3] border border-[#E2E1DD] p-0.5 rounded-lg text-[#5E6258] gap-0.5">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded-md cursor-pointer transition-colors ${previewDevice === 'desktop' ? 'bg-white text-black shadow-sm' : 'hover:text-black'}`}
                title="Desktop View"
              >
                <Monitor className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded-md cursor-pointer transition-colors ${previewDevice === 'mobile' ? 'bg-white text-black shadow-sm' : 'hover:text-black'}`}
                title="Mobile View"
              >
                <Smartphone className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Device Mock Canvas */}
          <div className="flex-1 bg-[#EAE8E3] rounded-xl border border-[#E2E1DD]/50 p-4 flex items-center justify-center overflow-hidden">
            <div 
              className={`bg-white border border-[#D4D2CD] rounded-lg shadow-md transition-all duration-300 overflow-y-auto flex flex-col ${
                previewDevice === 'desktop' ? 'w-full h-full' : 'w-72 h-[380px]'
              }`}
            >
              
              {/* Site Navbar mock */}
              <div className="border-b border-[#EAE8E3] py-2.5 px-4 flex items-center justify-between bg-white shrink-0">
                <span className="text-[10px] font-black text-black">COMPANY.SITE</span>
                <div className="flex gap-2 text-[8px] font-black text-[#5E6258] uppercase">
                  <span>Home</span>
                  <span>Pricing</span>
                </div>
              </div>

              {/* Render dynamic sections preview */}
              <div className="flex-1">
                {activePage?.sections.map(s => {
                  const isBrand = s.theme === 'Brand';
                  const isDark = s.theme === 'Dark';

                  return (
                    <div 
                      key={s.id}
                      className={`py-8 px-6 text-center space-y-2 border-b border-[#EAE8E3]/60 transition-all ${
                        isBrand 
                          ? 'bg-[#E1FF4B] text-black' 
                          : isDark 
                            ? 'bg-[#0B0F19] text-white' 
                            : 'bg-white text-black'
                      }`}
                    >
                      <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full uppercase leading-none ${isBrand ? 'bg-black/10' : 'bg-black/5'}`}>
                        {s.type} Section
                      </span>
                      <h4 className="text-sm font-black tracking-tight leading-tight">{s.title}</h4>
                      <p className={`text-[10px] leading-relaxed max-w-sm mx-auto font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {s.subtitle}
                      </p>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Add Page Form modal */}
      {showAddForm && (
        <div className="bg-white border border-[#E2E1DD] p-6 rounded-2xl shadow-md max-w-xl mx-auto space-y-4">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-2">
            Create Web Page
          </h3>
          <form onSubmit={handleCreatePage} className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-[#8C9086] uppercase">Page Name</label>
              <input 
                type="text" 
                placeholder="e.g. Terms of Service"
                value={newPageName}
                onChange={e => setNewPageName(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black font-bold"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-[#8C9086] uppercase">URL Slug</label>
              <input 
                type="text" 
                placeholder="e.g. terms"
                value={newPageSlug}
                onChange={e => setNewPageSlug(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black"
                required
              />
            </div>
            <div className="col-span-2 flex justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="text-xs text-[#8C9086] bg-[#FAF9F6] border border-[#E2E1DD] px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="text-xs text-black bg-[#E1FF4B] border border-[#C0D930] px-4 py-2 rounded-xl font-bold"
              >
                Create Page
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
