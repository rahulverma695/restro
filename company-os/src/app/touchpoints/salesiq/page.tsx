'use client';

import React, { useState, useEffect } from 'react';
import { useAppState } from '@/context/StateContext';
import { 
  MessagesSquare, 
  Globe, 
  MapPin, 
  Clock, 
  Eye, 
  Send, 
  User, 
  Activity,
  Smile
} from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

interface Visitor {
  id: string;
  ip: string;
  country: string;
  countryCode: string;
  browser: string;
  currentPage: string;
  timeOnSite: string;
  chatStatus: 'idle' | 'active' | 'ended';
}

interface Message {
  id: string;
  sender: 'agent' | 'visitor';
  text: string;
  timestamp: string;
}

const initialVisitors: Visitor[] = [
  { id: 'v-1', ip: '198.162.0.12', country: 'United States', countryCode: 'US', browser: 'Chrome', currentPage: '/pricing', timeOnSite: '12m 45s', chatStatus: 'active' },
  { id: 'v-2', ip: '45.122.90.34', country: 'Germany', countryCode: 'DE', browser: 'Firefox', currentPage: '/features', timeOnSite: '4m 12s', chatStatus: 'idle' },
  { id: 'v-3', ip: '202.89.112.56', country: 'India', countryCode: 'IN', browser: 'Safari', currentPage: '/blog/pos-efficiency', timeOnSite: '1m 30s', chatStatus: 'idle' }
];

const mockBotReplies: Record<string, string[]> = {
  'v-1': [
    "Hello! I am reviewing your POS premium licensing options. Do you offer seasonal discounts?",
    "Thanks. What about onboarding support? Is that included in the setup fee?",
    "Excellent! I will discuss this with my team and get back to you."
  ],
  'v-2': [
    "Hi there, I am looking at your hardware terminal specifications. Are they compatible with standard cash drawers?",
    "Perfect, that helps. I'll submit a booking slot to discuss more."
  ]
};

export default function SalesIQPage() {
  const { activeUser } = useAppState();
  const [visitors, setVisitors] = useState<Visitor[]>(initialVisitors);
  const [activeChatVisitorId, setActiveChatVisitorId] = useState<string>('v-1');
  const [chats, setChats] = useState<Record<string, Message[]>>({
    'v-1': [
      { id: 'msg-1', sender: 'visitor', text: "Hi, I have a quick question about POS terminal features.", timestamp: '11:24 AM' }
    ]
  });
  const [replyIndex, setReplyIndex] = useState<Record<string, number>>({ 'v-1': 0, 'v-2': 0 });
  const [inputText, setInputText] = useState('');

  const hasAccess = ['SuperAdmin', 'HRAdmin', 'Manager', 'Employee'].includes(activeUser.role);

  if (!hasAccess) {
    return <AccessDenied suite="Customer Touchpoints" role={activeUser.role} />;
  }

  const activeVisitor = visitors.find(v => v.id === activeChatVisitorId);
  const activeMessages = chats[activeChatVisitorId] || [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatVisitorId) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'agent',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChats(prev => ({
      ...prev,
      [activeChatVisitorId]: [...(prev[activeChatVisitorId] || []), newMsg]
    }));
    setInputText('');

    // Trigger automated visitor reply after a short delay
    setTimeout(() => {
      const visitorReplies = mockBotReplies[activeChatVisitorId] || [];
      const currentReplyIdx = replyIndex[activeChatVisitorId] || 0;
      
      if (currentReplyIdx < visitorReplies.length) {
        const replyText = visitorReplies[currentReplyIdx];
        const replyMsg: Message = {
          id: `msg-${Date.now() + 1}`,
          sender: 'visitor',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setChats(prev => ({
          ...prev,
          [activeChatVisitorId]: [...(prev[activeChatVisitorId] || []), replyMsg]
        }));

        setReplyIndex(prev => ({
          ...prev,
          [activeChatVisitorId]: currentReplyIdx + 1
        }));
      }
    }, 1500);
  };

  const startChat = (visitorId: string) => {
    setActiveChatVisitorId(visitorId);
    setVisitors(prev => prev.map(v => v.id === visitorId ? { ...v, chatStatus: 'active' } : v));
    if (!chats[visitorId]) {
      setChats(prev => ({
        ...prev,
        [visitorId]: [
          { id: `msg-${Date.now()}`, sender: 'visitor', text: "Hello! I would like to learn more about the POS software.", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]
      }));
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-[#F4F3EF] min-h-[calc(100vh-4rem)] select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E2E1DD] pb-4">
        <div className="flex items-center gap-3">
          <MessagesSquare className="h-8 w-8 text-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)]" />
          <div>
            <h2 className="text-3xl font-extrabold text-[#1A1C18] tracking-tight">Live Chat — Customer Messaging</h2>
            <p className="text-sm text-[#5E6258] mt-1">Real-time visitor tracking map and customer support messaging simulation workspace.</p>
          </div>
        </div>
      </div>

      {/* 1. Live Visitor Map / Traffic Board */}
      <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="border-b border-[#E2E1DD] pb-3 flex items-center justify-between">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#C0D930]" /> Live Visitor Traffic Monitor
          </h3>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visitors.map(v => (
            <div 
              key={v.id} 
              className={`border border-[#E2E1DD] rounded-xl p-4 space-y-3 transition-all flex flex-col justify-between ${
                v.chatStatus === 'active' 
                  ? 'bg-[#FAF9F6] border-[#8B5CF6]/30 shadow-sm border-l-4 border-l-[#8B5CF6]' 
                  : 'bg-transparent hover:bg-[#FAF9F6]/30'
              }`}
            >
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-black">{v.ip}</span>
                  <span className="text-[9px] text-[#8C9086] font-extrabold bg-[#FAF9F6] border border-[#E2E1DD] px-1.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                    <Globe className="h-3 w-3" /> {v.countryCode}
                  </span>
                </div>

                <div className="space-y-1.5 text-[#5E6258] font-semibold">
                  <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[#8C9086]" /> {v.country}</p>
                  <p className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-[#8C9086]" /> Viewing <code className="bg-white border border-[#E2E1DD] px-1 rounded text-[10px] text-black font-mono">{v.currentPage}</code></p>
                  <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-[#8C9086]" /> Time on site: {v.timeOnSite}</p>
                </div>
              </div>

              {v.chatStatus === 'active' ? (
                <button
                  onClick={() => setActiveChatVisitorId(v.id)}
                  className="w-full bg-[#FAF9F6] border border-[#E2E1DD] hover:bg-white text-black font-extrabold text-[10px] py-1.5 rounded-lg text-center transition-colors cursor-pointer"
                >
                  View Active Conversation
                </button>
              ) : (
                <button
                  onClick={() => startChat(v.id)}
                  className="w-full bg-[#E1FF4B] border border-[#C0D930] hover:bg-[#d5f242] text-black font-black text-[10px] py-1.5 rounded-lg text-center transition-colors cursor-pointer"
                >
                  Initiate Live Chat
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. Dual-Pane Chat Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Active Chats */}
        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 space-y-4 shadow-sm h-[400px] flex flex-col">
          <div className="border-b border-[#E2E1DD] pb-3">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider">Active Conversations</h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {visitors.filter(v => v.chatStatus === 'active').map(v => (
              <button
                key={v.id}
                onClick={() => setActiveChatVisitorId(v.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                  activeChatVisitorId === v.id
                    ? 'bg-[#FAF9F6] border-[#8B5CF6]/30 shadow-sm border-l-4 border-l-[#8B5CF6]'
                    : 'bg-transparent border-transparent hover:bg-[#FAF9F6]/55 hover:border-[#E2E1DD]'
                }`}
              >
                <h4 className="text-xs font-black text-black">Visitor {v.ip}</h4>
                <p className="text-[9px] text-[#8C9086] font-bold mt-1 uppercase">Active chat • {v.countryCode}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Chat Message Area */}
        <div className="lg:col-span-2 bg-white border border-[#E2E1DD] rounded-2xl p-6 shadow-sm flex flex-col h-[400px] justify-between">
          {activeVisitor ? (
            <>
              {/* Chat Header */}
              <div className="border-b border-[#E2E1DD] pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-[#8B5CF6]/10 rounded-lg flex items-center justify-center text-[#8B5CF6]">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-black">Chatting with {activeVisitor.ip}</h4>
                    <p className="text-[8px] text-[#8C9086] font-bold uppercase">{activeVisitor.country} ({activeVisitor.browser})</p>
                  </div>
                </div>
                <span className="text-[9px] text-[#8B5CF6] font-extrabold bg-[#8B5CF6]/10 px-2 py-0.5 rounded-full uppercase">
                  Agent Connected
                </span>
              </div>

              {/* Chat Messages Panel */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                {activeMessages.map((msg) => {
                  const isAgent = msg.sender === 'agent';
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] rounded-xl p-3.5 border shadow-sm text-xs font-semibold ${
                        isAgent 
                          ? 'bg-[#E1FF4B] border-[#C0D930] text-black rounded-tr-none'
                          : 'bg-[#FAF9F6] border-[#E2E1DD] text-black rounded-tl-none'
                      }`}>
                        <p className="leading-relaxed">{msg.text}</p>
                        <span className="text-[8px] text-[#8C9086] block text-right mt-1 leading-none font-bold">
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Entry Form */}
              <form onSubmit={handleSendMessage} className="border-t border-[#E2E1DD] pt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Type your response to simulated customer..."
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  className="flex-1 bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-4 py-2.5 text-xs text-black"
                  required
                />
                <button
                  type="submit"
                  className="bg-[#E1FF4B] border border-[#C0D930] hover:bg-[#d5f242] text-black font-extrabold text-xs px-5 rounded-xl shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" /> Send
                </button>
              </form>
            </>
          ) : (
            <div className="text-center text-[#8C9086] italic py-20 flex items-center justify-center h-full">
              Select an active visitor on the left to review conversation stream.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
