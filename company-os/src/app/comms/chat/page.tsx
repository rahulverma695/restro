'use client';
 
import React, { useState } from 'react';
import { useAppState } from '@/context/StateContext';
import { MessagesSquare, Send, Hash, Users, Clock, Plus, Search } from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';
 
interface ChatMessage {
  id: string;
  channel: string;
  senderName: string;
  senderRole: string;
  message: string;
  time: string;
}
 
const initialMessages: ChatMessage[] = [
  // Channel Messages
  { id: 'm1', channel: 'general', senderName: 'Nikhil Bhaviyavar', senderRole: 'Manager', message: 'Welcome everyone to the new Company OS portal! Feel free to test out your suite credentials.', time: '10:05 AM' },
  { id: 'm2', channel: 'general', senderName: 'John Doe', senderRole: 'Employee', message: 'This is awesome. The interface is ridiculously fast.', time: '10:12 AM' },
  { id: 'm3', channel: 'engineering', senderName: 'John Doe', senderRole: 'Employee', message: 'Hey guys, did we deploy the schema updates to Neon DB?', time: '09:30 AM' },
  { id: 'm4', channel: 'engineering', senderName: 'Alex Johnson', senderRole: 'SuperAdmin', message: 'Yes, both tables and seeds have been initialized successfully.', time: '09:45 AM' },
  { id: 'm5', channel: 'hr-ops', senderName: 'Nikhil Bhaviyavar', senderRole: 'Manager', message: 'Pending leave requests have been reviewed. Pls update your timesheets.', time: '08:15 AM' },
  
  // Seed DM Messages
  // Nikhil (e1) <-> John Doe (e2)
  { id: 'dm1', channel: 'dm-e1-e2', senderName: 'Nikhil Bhaviyavar', senderRole: 'Manager', message: 'Hey John, did you log your shift details for today?', time: '09:15 AM' },
  { id: 'dm2', channel: 'dm-e1-e2', senderName: 'John Doe', senderRole: 'Employee', message: 'Hi Nikhil, yes, clocked in at 9:00 AM. Handover comments have been submitted.', time: '09:18 AM' },
  
  // Nikhil (e1) <-> Jane Smith (e3)
  { id: 'dm3', channel: 'dm-e1-e3', senderName: 'Jane Smith', senderRole: 'Manager', message: 'Nikhil, please review the pending travel expense form on the Finance tab.', time: '10:30 AM' },
  { id: 'dm4', channel: 'dm-e1-e3', senderName: 'Nikhil Bhaviyavar', senderRole: 'Manager', message: 'On it, Jane. Approving it now.', time: '10:35 AM' },
  
  // John Doe (e2) <-> Alex Johnson (e4)
  { id: 'dm5', channel: 'dm-e2-e4', senderName: 'John Doe', senderRole: 'Employee', message: 'Hey Alex, my hardware profile shows MacBook Pro 16". Is it possible to request a dual-monitor stand too?', time: '08:45 AM' },
  { id: 'dm6', channel: 'dm-e2-e4', senderName: 'Alex Johnson', senderRole: 'SuperAdmin', message: 'Yes John, submit a ticket in the IT Helpdesk suite and I will assign the stand to you.', time: '08:50 AM' },
];
 
export default function ChatChannelsPage() {
  const { activeUser, employees } = useAppState();
  const [activeChannel, setActiveChannel] = useState('general');
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputVal, setInputVal] = useState('');
 
  // DM coworker finder search popover states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDmUserIds, setActiveDmUserIds] = useState<string[]>(() => {
    const ids = new Set<string>();
    initialMessages.forEach(m => {
      if (m.channel.startsWith('dm-')) {
        const parts = m.channel.replace('dm-', '').split('-');
        if (parts.includes(activeUser.id)) {
          const otherId = parts.find(p => p !== activeUser.id);
          if (otherId) ids.add(otherId);
        }
      }
    });
    return Array.from(ids);
  });
 
  // Access check
  if (activeUser.role !== 'SuperAdmin' && activeUser.role !== 'Manager' && activeUser.role !== 'Employee') {
    return <AccessDenied suite="Asynchronous Comms" role={activeUser.role} />;
  }
 
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      channel: activeChannel,
      senderName: `${activeUser.first_name} ${activeUser.last_name}`,
      senderRole: activeUser.role,
      message: inputVal.trim(),
      time: new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, newMessage]);
    setInputVal('');
  };
 
  const getDmChannelId = (uid1: string, uid2: string) => {
    const sorted = [uid1, uid2].sort();
    return `dm-${sorted[0]}-${sorted[1]}`;
  };
 
  const handleStartChat = (empId: string) => {
    if (!activeDmUserIds.includes(empId)) {
      setActiveDmUserIds(prev => [...prev, empId]);
    }
    const dmChanId = getDmChannelId(activeUser.id, empId);
    setActiveChannel(dmChanId);
    setIsSearchOpen(false);
    setSearchQuery('');
  };
 
  const channels = [
    { id: 'general', name: 'general', desc: 'Company-wide notices & announcements' },
    { id: 'engineering', name: 'engineering', desc: 'Dev discussions & incident logs' },
    { id: 'hr-ops', name: 'hr-ops', desc: 'Timesheet & leave compliance registers' },
  ];
 
  const activeDms = employees.filter(emp => activeDmUserIds.includes(emp.id) && emp.id !== activeUser.id);
  const filteredMessages = messages.filter(m => m.channel === activeChannel);
 
  const isDM = activeChannel.startsWith('dm-');
  let channelDisplayName = activeChannel;
  let channelDisplayDesc = 'Sync asynchronously across team chat channels and discussions.';
  let dmPartner: any = null;
 
  if (isDM) {
    const ids = activeChannel.replace('dm-', '').split('-');
    const partnerId = ids.find(id => id !== activeUser.id) || ids[0];
    dmPartner = employees.find(e => e.id === partnerId);
    if (dmPartner) {
      channelDisplayName = `${dmPartner.first_name} ${dmPartner.last_name}`;
      channelDisplayDesc = `${dmPartner.role} • ${dmPartner.department}`;
    }
  } else {
    const chanObj = channels.find(c => c.id === activeChannel);
    channelDisplayName = chanObj ? `#${chanObj.name}` : `#${activeChannel}`;
    channelDisplayDesc = chanObj ? chanObj.desc : '';
  }
 
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 h-[calc(100vh-4rem)] flex flex-col select-none overflow-hidden bg-[#F4F3EF]">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#E2E1DD] pb-4 shrink-0">
        <MessagesSquare className="h-8 w-8 text-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)]" />
        <div>
          <h2 className="text-3xl font-extrabold text-[#1A1C18] tracking-tight">Comms Hub</h2>
          <p className="text-sm text-[#5E6258]">Asynchronous messaging channels and direct user-to-user DMs.</p>
        </div>
      </div>
 
      {/* Chat pane split */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-0 overflow-hidden pb-6">
        
        {/* Left Side: Channel & DM lists */}
        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 flex flex-col min-h-0 overflow-hidden shadow-sm relative">
          <div className="flex-1 overflow-y-auto space-y-6 pr-2">
            
            {/* Channels Group */}
            <div>
              <h3 className="text-xs font-bold text-[#1A1C18] uppercase tracking-wider mb-3 pb-2 border-b border-[#E2E1DD]/60">Channels</h3>
              <div className="space-y-1.5">
                {channels.map((chan) => (
                  <button
                    key={chan.id}
                    onClick={() => setActiveChannel(chan.id)}
                    className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl transition-all duration-200 text-left border ${
                      activeChannel === chan.id
                        ? 'bg-[#E1FF4B] border-[#C0D930] text-black shadow-[0_4px_12px_rgba(225,255,75,0.08)] font-extrabold'
                        : 'bg-[#FAF9F6] border-[#E2E1DD] hover:bg-white/40 text-[#5E6258] hover:text-[#1A1C18]'
                    }`}
                  >
                    <Hash className={`h-4 w-4 shrink-0 ${activeChannel === chan.id ? 'text-[#8B5CF6]' : 'text-[#8C9086]'}`} />
                    <div className="space-y-0.5 overflow-hidden">
                      <p className="text-xs font-bold truncate">#{chan.name}</p>
                      <p className="text-[9px] text-[#8C9086] font-semibold leading-none truncate">{chan.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
 
            {/* Direct Messages Group */}
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E2E1DD]/60">
                <h3 className="text-xs font-bold text-[#1A1C18] uppercase tracking-wider">Direct Messages</h3>
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-1 rounded-lg hover:bg-[#FAF9F6] border border-[#E2E1DD] text-[#5E6258] hover:text-black cursor-pointer transition-colors"
                  title="Start New DM Chat"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
 
              {/* Coworker Search Popover */}
              {isSearchOpen && (
                <div className="absolute left-4 right-4 top-24 bg-white border border-[#E2E1DD] rounded-xl shadow-xl p-3 z-30 space-y-2.5">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8C9086]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search coworker..."
                      className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#8B5CF6] rounded-lg pl-8 pr-2 py-1 text-[10px] text-black focus:outline-none transition-all"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                    {employees
                      .filter(emp => emp.id !== activeUser.id)
                      .filter(emp => 
                        `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        emp.department.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(emp => (
                        <button
                          key={emp.id}
                          onClick={() => handleStartChat(emp.id)}
                          className="w-full flex items-center gap-2 p-1.5 hover:bg-[#FAF9F6] border border-transparent hover:border-[#E2E1DD] rounded-lg text-left transition-colors cursor-pointer"
                        >
                          <div className="h-6 w-6 rounded bg-[#EAE8E3] flex items-center justify-center font-extrabold text-[9px] text-black uppercase">
                            {emp.first_name[0]}{emp.last_name[0]}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-[10px] font-bold text-black truncate">{emp.first_name} {emp.last_name}</p>
                            <p className="text-[8px] text-[#8C9086] truncate capitalize">{emp.role} • {emp.department}</p>
                          </div>
                        </button>
                      ))}
                    {employees
                      .filter(emp => emp.id !== activeUser.id)
                      .filter(emp => 
                        `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        emp.department.toLowerCase().includes(searchQuery.toLowerCase())
                      ).length === 0 && (
                      <p className="text-[9px] text-[#8C9086] italic text-center py-2">No coworkers found.</p>
                    )}
                  </div>
                </div>
              )}
 
              {/* Active Conversations list */}
              <div className="space-y-1.5">
                {activeDms.map((emp) => {
                  const dmChanId = getDmChannelId(activeUser.id, emp.id);
                  const isSelected = activeChannel === dmChanId;
                  
                  let statusBadge = 'bg-[#8C9086]';
                  if (emp.status === 'online') statusBadge = 'bg-[#3CD070]';
                  else if (emp.status === 'on_leave') statusBadge = 'bg-[#8B5CF6]';
 
                  return (
                    <button
                      key={emp.id}
                      onClick={() => setActiveChannel(dmChanId)}
                      className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl transition-all duration-200 text-left border ${
                        isSelected
                          ? 'bg-[#E1FF4B] border-[#C0D930] text-black shadow-[0_4px_12px_rgba(225,255,75,0.08)] font-extrabold'
                          : 'bg-[#FAF9F6] border-[#E2E1DD] hover:bg-white/40 text-[#5E6258] hover:text-[#1A1C18]'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div className="h-7 w-7 rounded-lg bg-[#EAE8E3] border border-[#E2E1DD] flex items-center justify-center font-extrabold text-[10px] text-[#1A1C18] uppercase">
                          {emp.first_name[0]}{emp.last_name[0]}
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white ${statusBadge}`} />
                      </div>
                      <div className="space-y-0.5 overflow-hidden">
                        <p className="text-xs font-bold truncate text-[#1A1C18]">{emp.first_name} {emp.last_name}</p>
                        <p className="text-[9px] text-[#8C9086] font-semibold leading-none truncate capitalize">{emp.role} • {emp.department}</p>
                      </div>
                    </button>
                  );
                })}
                {activeDms.length === 0 && (
                  <p className="text-[10px] text-[#8C9086] italic text-center py-4">No active conversations. Start one by clicking +.</p>
                )}
              </div>
            </div>
 
          </div>
        </div>

        {/* Right Side: Message Stream timeline */}
        <div className="lg:col-span-3 bg-white border border-[#E2E1DD] rounded-2xl flex flex-col min-h-0 overflow-hidden shadow-sm">
          
          {/* Active channel header */}
          <div className="p-4 border-b border-[#E2E1DD] shrink-0 bg-[#FAF9F6]/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-black font-bold text-xs">
              {isDM ? (
                <div className="flex items-center gap-2.5">
                  <div className="relative shrink-0">
                    <div className="h-7 w-7 rounded-lg bg-[#EAE8E3] border border-[#E2E1DD] flex items-center justify-center font-extrabold text-[10px] text-[#1A1C18] uppercase">
                      {dmPartner?.first_name[0]}{dmPartner?.last_name[0]}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white ${
                      dmPartner?.status === 'online' ? 'bg-[#3CD070]' : dmPartner?.status === 'on_leave' ? 'bg-[#8B5CF6]' : 'bg-[#8C9086]'
                    }`} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#1A1C18]">{channelDisplayName}</span>
                    <p className="text-[9px] text-[#8C9086] font-semibold leading-none mt-0.5">{channelDisplayDesc}</p>
                  </div>
                </div>
              ) : (
                <>
                  <Hash className="h-4 w-4 text-[#8B5CF6]" />
                  <div>
                    <span>{channelDisplayName}</span>
                    <p className="text-[9px] text-[#8C9086] font-semibold leading-none mt-0.5">{channelDisplayDesc}</p>
                  </div>
                </>
              )}
            </div>
            
            <div className="text-[10px] text-[#5E6258] flex items-center gap-1.5 font-bold uppercase">
              <Users className="h-3.5 w-3.5" />
              <span>{isDM ? 'Direct Conversation' : 'Channel Encrypted'}</span>
            </div>
          </div>

          {/* Messages scroll pane */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF9F6]/30">
            {filteredMessages.map((msg) => (
              <div key={msg.id} className="bg-white border border-[#E2E1DD]/60 rounded-xl p-3.5 space-y-1 hover:border-[#E2E1DD]/80 transition-colors shadow-sm max-w-3xl">
                <div className="flex justify-between items-center text-[9px] font-bold text-[#8C9086] uppercase tracking-wider">
                  <span className="text-[#8B5CF6]">{msg.senderName} ({msg.senderRole})</span>
                  <span className="flex items-center gap-1 text-[#8C9086]">
                    <Clock className="h-2.5 w-2.5" /> {msg.time}
                  </span>
                </div>
                <p className="text-xs text-[#1A1C18] leading-relaxed select-text font-semibold">{msg.message}</p>
              </div>
            ))}
            {filteredMessages.length === 0 && (
              <p className="text-xs text-[#8C9086] text-center py-12 italic">No message packets sent on this channel.</p>
            )}
          </div>

          {/* Text Send input bar */}
          <div className="p-4 border-t border-[#E2E1DD] bg-[#FAF9F6]/80 shrink-0">
            <form onSubmit={handleSend} className="flex gap-2">
              <input 
                type="text" 
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                required
                placeholder={isDM ? `Type a message to ${channelDisplayName}...` : `Type a message to #${activeChannel}...`}
                className="flex-1 bg-white border border-[#E2E1DD] focus:border-[#8B5CF6] rounded-xl px-4 py-2.5 text-xs text-black focus:outline-none transition-all placeholder-[#8C9086]"
              />
              <button 
                type="submit"
                className="px-4 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="h-3 w-3" /> Send
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
