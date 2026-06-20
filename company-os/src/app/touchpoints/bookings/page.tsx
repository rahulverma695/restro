'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/StateContext';
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  Video, 
  PhoneCall, 
  HelpCircle,
  Plus,
  Trash2
} from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  meetingType: string;
  staffName: string;
  date: string;
  timeSlot: string;
}

const initialBookings: Booking[] = [
  { id: 'book-1', clientName: 'David Lee', clientEmail: 'david.lee@pizzaclub.com', meetingType: '30m Product Demo', staffName: 'Nikhil Bhaviyavar', date: '2026-06-16', timeSlot: '10:00 AM - 10:30 AM' },
  { id: 'book-2', clientName: 'Marcus Aurelius', clientEmail: 'marcus@philosophyfoods.org', meetingType: '1h Support Session', staffName: 'Alex Johnson', date: '2026-06-16', timeSlot: '02:00 PM - 03:00 PM' }
];

const MEETING_TYPES = [
  { name: '30m Product Demo', duration: '30 mins', icon: Video, desc: 'Introductory overview of POS features.' },
  { name: '1h Support Session', duration: '60 mins', icon: HelpCircle, desc: 'Technical issue resolution & setup walkthrough.' },
  { name: '15m Quick Touchpoint', duration: '15 mins', icon: PhoneCall, desc: 'Follow-up or brief Q&A call.' }
];

const STAFF = ['Nikhil Bhaviyavar', 'Alex Johnson', 'Jane Smith', 'John Doe'];
const TIME_SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

export default function BookingsPage() {
  const { activeUser } = useAppState();
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  
  // Client selection states
  const [selectedMeetingType, setSelectedMeetingType] = useState(MEETING_TYPES[0].name);
  const [selectedStaff, setSelectedStaff] = useState(STAFF[0]);
  const [selectedDate, setSelectedDate] = useState('2026-06-16');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(TIME_SLOTS[0]);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const hasAccess = ['SuperAdmin', 'HRAdmin', 'Manager', 'Employee'].includes(activeUser.role);

  if (!hasAccess) {
    return <AccessDenied suite="Customer Touchpoints" role={activeUser.role} />;
  }

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail) return;

    const newBooking: Booking = {
      id: `book-${Date.now()}`,
      clientName,
      clientEmail,
      meetingType: selectedMeetingType,
      staffName: selectedStaff,
      date: selectedDate,
      timeSlot: `${selectedTimeSlot} - ${calculateEndTime(selectedTimeSlot, selectedMeetingType)}`
    };

    setBookings(prev => [newBooking, ...prev]);
    setClientName('');
    setClientEmail('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const calculateEndTime = (start: string, type: string) => {
    const isOneHour = type.includes('1h');
    const is15Min = type.includes('15m');
    const [hourStr, minAndPeriod] = start.split(':');
    const [minStr, period] = minAndPeriod.split(' ');
    
    let hour = parseInt(hourStr);
    let min = parseInt(minStr);

    if (isOneHour) {
      hour = hour === 12 ? 1 : hour + 1;
    } else if (is15Min) {
      min = min + 15;
    } else {
      min = min + 30;
    }

    if (min >= 60) {
      hour = hour === 12 ? 1 : hour + 1;
      min = min - 60;
    }

    const minFormatted = min < 10 ? `0${min}` : min;
    return `${hour}:${minFormatted} ${period}`;
  };

  const deleteBooking = (id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-[#F4F3EF] min-h-[calc(100vh-4rem)] select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E2E1DD] pb-4">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)]" />
          <div>
            <h2 className="text-3xl font-extrabold text-[#1A1C18] tracking-tight">Client Scheduler</h2>
            <p className="text-sm text-[#5E6258] mt-1">Client-facing appointment scheduler interface and internal reservations logs system.</p>
          </div>
        </div>
      </div>

      {/* Split view Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Client-Facing Booking Widget */}
        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="border-b border-[#E2E1DD] pb-3">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
              <Plus className="h-4 w-4 text-[#C0D930]" /> Appointment Scheduler Widget
            </h3>
          </div>

          {showSuccess && (
            <div className="bg-[#C0D930]/10 border border-[#C0D930] rounded-xl p-4 text-xs font-extrabold text-black flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-[#C0D930]" />
              Appointment scheduled successfully! A calendar invitation has been sent to client.
            </div>
          )}

          <form onSubmit={handleCreateBooking} className="space-y-4">
            
            {/* 1. Meeting type selector */}
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-[#8C9086] uppercase">Select Meeting Type</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {MEETING_TYPES.map(m => {
                  const MIcon = m.icon;
                  const isSelected = selectedMeetingType === m.name;
                  return (
                    <button
                      key={m.name}
                      type="button"
                      onClick={() => setSelectedMeetingType(m.name)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between h-24 transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-[#FAF9F6] border-[#8B5CF6] shadow-sm'
                          : 'bg-transparent border-[#E2E1DD] hover:bg-[#FAF9F6]/55'
                      }`}
                    >
                      <MIcon className={`h-4 w-4 ${isSelected ? 'text-[#8B5CF6]' : 'text-[#8C9086]'}`} />
                      <div>
                        <p className="text-[10px] font-black text-black">{m.name}</p>
                        <p className="text-[8px] text-[#8C9086] mt-0.5">{m.duration}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Staff and Date Picker */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-[#8C9086] uppercase">Assign Staff Member</label>
                <select
                  value={selectedStaff}
                  onChange={e => setSelectedStaff(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black"
                >
                  {STAFF.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-bold text-[#8C9086] uppercase">Choose Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black"
                />
              </div>
            </div>

            {/* 3. Time Slots */}
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-[#8C9086] uppercase">Available Time Slots</label>
              <div className="flex flex-wrap gap-2">
                {TIME_SLOTS.map(t => {
                  const isSelected = selectedTimeSlot === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTimeSlot(t)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-[#FAF9F6] border-[#8B5CF6] text-black font-extrabold shadow-sm'
                          : 'bg-transparent border-[#E2E1DD] text-[#5E6258] hover:bg-[#FAF9F6]/55'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Client Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#E2E1DD]/70 pt-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#8C9086] uppercase">Client Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Miller"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#8C9086] uppercase">Client Email</label>
                <input
                  type="email"
                  placeholder="e.g. john@pizza.com"
                  value={clientEmail}
                  onChange={e => setClientEmail(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#E1FF4B] border border-[#C0D930] hover:bg-[#d5f242] text-black font-black text-xs py-3 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Confirm Appointment Booking
            </button>

          </form>
        </div>

        {/* Right Column: Internal Bookings Log Dashboard */}
        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-6 shadow-sm flex flex-col h-[580px]">
          <div className="flex items-center justify-between border-b border-[#E2E1DD] pb-3">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider">Reservations Log Ledger</h3>
            <span className="text-[9px] text-[#5E6258] font-bold bg-[#FAF9F6] border border-[#E2E1DD] px-2.5 py-0.5 rounded-full uppercase">
              {bookings.length} Active Sessions
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {bookings.map(b => (
              <div
                key={b.id}
                className="bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl p-4 space-y-3 shadow-sm hover:border-[#8B5CF6]/30 transition-all flex items-start justify-between"
              >
                <div className="space-y-2">
                  <div>
                    <h4 className="text-xs font-black text-black">{b.clientName}</h4>
                    <p className="text-[9px] text-[#8C9086] font-mono leading-none mt-0.5">{b.clientEmail}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] text-[#5E6258] font-semibold">
                    <p className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-[#8C9086]" /> {b.timeSlot}</p>
                    <p className="flex items-center gap-1"><User className="h-3.5 w-3.5 text-[#8C9086]" /> {b.staffName}</p>
                    <p className="col-span-2 text-[9px] font-extrabold text-[#8B5CF6] bg-[#8B5CF6]/10 px-2 py-0.5 rounded-md inline-block max-w-max">
                      {b.meetingType}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteBooking(b.id)}
                  className="text-[#8C9086] hover:text-red-500 transition-colors cursor-pointer"
                  title="Cancel Appointment"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {bookings.length === 0 && (
              <p className="text-xs text-[#8C9086] italic text-center py-20">No active bookings registered in the ledger.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
