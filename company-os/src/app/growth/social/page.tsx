'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/StateContext';
import { 
  Globe, 
  Plus, 
  Trash2, 
  Send, 
  Clock, 
  BarChart2, 
  CheckCircle,
  FileImage
} from 'lucide-react';

const Twitter = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Facebook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
import AccessDenied from '@/components/AccessDenied';

interface SocialPost {
  id: string;
  content: string;
  platforms: string[];
  scheduledTime: string;
  status: 'Scheduled' | 'Published';
  likes: number;
  shares: number;
}

const initialPosts: SocialPost[] = [
  { id: 'post-1', content: 'Exciting news! RestroPOS has just launched version 3.5. Say goodbye to monthly seat fees forever!', platforms: ['Twitter/X', 'LinkedIn'], scheduledTime: '2026-06-16, 09:00 AM', status: 'Scheduled', likes: 0, shares: 0 },
  { id: 'post-2', content: 'Our hybrid offline database sync keeps your billing active even when the internet goes down. Perfect for peak restaurant hours.', platforms: ['LinkedIn', 'Facebook'], scheduledTime: '2026-06-15, 04:00 PM', status: 'Published', likes: 142, shares: 38 }
];

const PLATFORMS = ['Twitter/X', 'LinkedIn', 'Facebook', 'Instagram'];

export default function SocialPage() {
  const { activeUser } = useAppState();
  const [posts, setPosts] = useState<SocialPost[]>(initialPosts);
  const [newContent, setNewContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Twitter/X']);
  const [scheduledTime, setScheduledTime] = useState('2026-06-16T10:00');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const hasAccess = ['SuperAdmin', 'HRAdmin', 'Manager', 'Employee'].includes(activeUser.role);

  if (!hasAccess) {
    return <AccessDenied suite="Growth Suite" role={activeUser.role} />;
  }

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim() || selectedPlatforms.length === 0) return;

    const formattedTime = scheduledTime.replace('T', ', ');
    const post: SocialPost = {
      id: `post-${Date.now()}`,
      content: newContent.trim(),
      platforms: selectedPlatforms,
      scheduledTime: formattedTime,
      status: 'Scheduled',
      likes: 0,
      shares: 0
    };

    setPosts(prev => [post, ...prev]);
    setNewContent('');
    setSelectedPlatforms(['Twitter/X']);
    setShowAddForm(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const togglePlatform = (p: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const deletePost = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  // Engagement stats
  const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);
  const totalShares = posts.reduce((sum, p) => sum + p.shares, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-[#F4F3EF] min-h-[calc(100vh-4rem)] select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E2E1DD] pb-4">
        <div className="flex items-center gap-3">
          <Globe className="h-8 w-8 text-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)]" />
          <div>
            <h2 className="text-3xl font-extrabold text-[#1A1C18] tracking-tight">Social Publisher</h2>
            <p className="text-sm text-[#5E6258] mt-1">Compose multi-platform social media posts, schedule publishing timelines, and review follower analytics.</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-[#E1FF4B] border border-[#C0D930] hover:bg-[#d5f242] text-black font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Schedule Post
        </button>
      </div>

      {showSuccess && (
        <div className="bg-[#C0D930]/10 border border-[#C0D930] rounded-xl p-4 text-xs font-extrabold text-black flex items-center gap-2 max-w-xl">
          <CheckCircle className="h-5 w-5 text-[#C0D930]" />
          Post scheduled successfully on target platforms.
        </div>
      )}

      {/* Composition Modal Form Overlay */}
      {showAddForm && (
        <div className="bg-white border border-[#E2E1DD] p-6 rounded-2xl shadow-md max-w-xl mx-auto space-y-4">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-2">
            Compose Social Post
          </h3>
          <form onSubmit={handleCreatePost} className="space-y-4">
            
            {/* Platform Selector buttons */}
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-[#8C9086] uppercase">Target Channels</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map(p => {
                  const isSelected = selectedPlatforms.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePlatform(p)}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-[#FAF9F6] border-[#8B5CF6] text-black'
                          : 'bg-transparent border-[#E2E1DD] text-[#5E6258] hover:bg-[#FAF9F6]/55'
                      }`}
                    >
                      {p === 'Twitter/X' && <Twitter className="h-3.5 w-3.5" />}
                      {p === 'LinkedIn' && <Linkedin className="h-3.5 w-3.5" />}
                      {p === 'Facebook' && <Facebook className="h-3.5 w-3.5" />}
                      {p === 'Instagram' && <Instagram className="h-3.5 w-3.5" />}
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-[#8C9086] uppercase">Post Content Copy</label>
              <textarea
                placeholder="What is happening? Share updates about POS releases..."
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black h-28 resize-none font-sans"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-[#8C9086] uppercase">Scheduled Time</label>
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={e => setScheduledTime(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black"
                required
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-[#E2E1DD] pt-3">
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="text-xs text-[#8C9086] bg-[#FAF9F6] border border-[#E2E1DD] px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="text-xs text-black bg-[#E1FF4B] border border-[#C0D930] px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" /> Queue Post
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Analytics widgets and posting timeline queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Scheduled Queue Timeline */}
        <div className="lg:col-span-2 bg-white border border-[#E2E1DD] rounded-2xl p-6 shadow-sm flex flex-col h-[550px]">
          <div className="border-b border-[#E2E1DD] pb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#C0D930]" /> Social Publishing Timeline
            </h3>
            <span className="text-[9px] text-[#5E6258] font-bold bg-[#FAF9F6] border border-[#E2E1DD] px-2.5 py-0.5 rounded-full uppercase">
              {posts.filter(p => p.status === 'Scheduled').length} Queued
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
            {posts.map(p => (
              <div 
                key={p.id}
                className="bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl p-4 space-y-3 relative hover:border-[#8B5CF6]/30 transition-all"
              >
                <button
                  onClick={() => deletePost(p.id)}
                  className="absolute top-4 right-4 text-[#8C9086] hover:text-red-500 transition-colors cursor-pointer"
                  title="Remove Post"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

                <div className="flex items-center justify-between border-b border-[#E2E1DD]/70 pb-2">
                  <div className="flex flex-wrap gap-1.5">
                    {p.platforms.map(pl => (
                      <span key={pl} className="text-[8px] font-black text-black bg-white border border-[#E2E1DD] px-2 py-0.5 rounded-md uppercase">
                        {pl}
                      </span>
                    ))}
                  </div>
                  <span className="text-[9px] text-[#8C9086] font-mono">{p.scheduledTime}</span>
                </div>

                <p className="text-xs text-[#1A1C18] font-semibold leading-relaxed">
                  {p.content}
                </p>

                <div className="flex justify-between items-center border-t border-[#E2E1DD]/50 pt-2 text-[9px] text-[#5E6258]">
                  <span>Status: <strong className={`uppercase ${p.status === 'Published' ? 'text-emerald-600' : 'text-amber-600'}`}>{p.status}</strong></span>
                  {p.status === 'Published' && (
                    <span className="font-extrabold text-black">♥ {p.likes} Likes • ⮂ {p.shares} Shares</span>
                  )}
                </div>
              </div>
            ))}
            {posts.length === 0 && (
              <p className="text-xs text-[#8C9086] italic text-center py-20">No scheduled posts queued.</p>
            )}
          </div>
        </div>

        {/* Right Side: Channel Analytics Dashboard */}
        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 shadow-sm space-y-6 h-[550px] overflow-y-auto">
          <div className="border-b border-[#E2E1DD] pb-3">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-[#C0D930]" /> Social Channel Analytics
            </h3>
          </div>

          <div className="space-y-6">
            
            {/* Total Followers */}
            <div className="bg-[#FAF9F6] border border-[#E2E1DD] p-5 rounded-2xl text-center space-y-1 shadow-sm">
              <span className="text-[9px] text-[#8C9086] font-bold uppercase tracking-wider">Total Combined Followers</span>
              <h3 className="text-3xl font-black text-black">12,450</h3>
              <p className="text-[9px] text-emerald-600 font-extrabold">+12% this month</p>
            </div>

            {/* Platform breakdowns */}
            <div className="space-y-3">
              <h4 className="text-[9px] font-black text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-1">
                Followers by Platform
              </h4>

              <div className="space-y-2 text-xs text-[#5E6258] font-semibold">
                <div className="flex justify-between items-center bg-[#FAF9F6] border border-[#E2E1DD] p-3 rounded-xl">
                  <span className="flex items-center gap-1"><Twitter className="h-3.5 w-3.5 text-sky-400" /> Twitter/X</span>
                  <strong className="text-black font-black">4,520</strong>
                </div>
                <div className="flex justify-between items-center bg-[#FAF9F6] border border-[#E2E1DD] p-3 rounded-xl">
                  <span className="flex items-center gap-1"><Linkedin className="h-3.5 w-3.5 text-blue-700" /> LinkedIn</span>
                  <strong className="text-black font-black">5,890</strong>
                </div>
                <div className="flex justify-between items-center bg-[#FAF9F6] border border-[#E2E1DD] p-3 rounded-xl">
                  <span className="flex items-center gap-1"><Facebook className="h-3.5 w-3.5 text-blue-900" /> Facebook</span>
                  <strong className="text-black font-black">2,040</strong>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
