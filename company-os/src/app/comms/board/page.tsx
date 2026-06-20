'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/StateContext';
import { MessagesSquare, Plus, Megaphone, Clock, Calendar } from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

export default function NoticeBoardPage() {
  const { activeUser, announcements, employees, postAnnouncement } = useAppState();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Access check
  if (activeUser.role !== 'SuperAdmin' && activeUser.role !== 'Manager' && activeUser.role !== 'Employee') {
    return <AccessDenied suite="Asynchronous Comms" role={activeUser.role} />;
  }

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    postAnnouncement(title, content);
    setTitle('');
    setContent('');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E1DD] pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-black tracking-tight flex items-center gap-3">
            <Megaphone className="h-8 w-8 text-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)]" />
            Global Notice Board
          </h2>
          <p className="text-sm text-[#5E6258] mt-1">Review announcements, corporate updates, and system-wide notice logs.</p>
        </div>
      </div>

      {/* Split Layout: Notice Board Feed and Publish Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Notice board feed */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-[#8B5CF6] rounded-full"></span>
            Broadcast Feed Logs ({announcements.length})
          </h3>
          
          <div className="space-y-4">
            {announcements.map((ann) => {
              const author = employees.find(e => e.id === ann.created_by);
              return (
                <div key={ann.id} className="bg-[#FAF9F6]/60 border border-[#E2E1DD] hover:border-[#8B5CF6]/30 rounded-2xl p-5 space-y-3 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 bg-[#6366F1]/10 text-[#6366F1] rounded-md flex items-center justify-center font-bold text-xs border border-[#6366F1]/20">
                        {author ? author.first_name[0] : 'S'}
                      </span>
                      <span className="text-xs font-bold text-black">
                        {author ? `${author.first_name} ${author.last_name}` : 'System Admin'}
                      </span>
                      <span className="text-[9px] text-[#5E6258] font-bold uppercase">({author?.role || 'System'})</span>
                    </div>
                    
                    <span className="text-[9px] text-[#5E6258] font-bold flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {ann.created_at}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-sm font-extrabold text-black leading-snug">{ann.title}</h4>
                    <p className="text-xs text-[#5E6258] leading-relaxed whitespace-pre-line">{ann.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Publish Announcement Card Form */}
        <div className="bg-white border border-[#E2E1DD] border border-[#E2E1DD] rounded-2xl p-5 h-fit space-y-4 shadow-sm">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
            <Plus className="h-4 w-4 text-[#8B5CF6]" /> Broadcast Notice
          </h3>
          
          <form onSubmit={handlePost} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-[#5E6258]">Announcement Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Notice headline..."
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#8B5CF6] rounded-xl px-3 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none transition-all"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-[#5E6258]">Notice Details</label>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={4}
                placeholder="Type the message description..."
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#8B5CF6] rounded-xl px-4 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none transition-all resize-none"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-2 bg-[#8B5CF6] hover:bg-[#8B5CF6]/80 text-xs font-bold text-black uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(139,92,246,0.1)] cursor-pointer"
            >
              Post Announcement
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
