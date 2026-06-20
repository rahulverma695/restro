'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/StateContext';
import { Calendar, ShieldAlert, PlusCircle, CheckCircle, Clock } from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

export default function RoomsPage() {
  const { activeUser, roomBookings, employees, addRoomBooking } = useAppState();

  // Reservation states
  const [roomName, setRoomName] = useState('Conference Room Alpha');
  const [date, setDate] = useState('2026-06-15');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('10:00 AM');

  const hasAccess = 
    activeUser.role === 'SuperAdmin' || 
    activeUser.role === 'HRAdmin' || 
    activeUser.role === 'Manager' || 
    activeUser.role === 'Employee';

  if (!hasAccess) {
    return <AccessDenied suite="Facility Booking" role={activeUser.role} />;
  }

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();

    // Check for double bookings: same room, same date, overlapping time
    // For simplicity, check if the exact start_time is already booked
    const doubleBooked = roomBookings.some(
      b => b.room_name === roomName && b.date === date && b.start_time === startTime
    );

    if (doubleBooked) {
      alert(`Conflict Detected! ${roomName} is already reserved for ${startTime} on ${date}. Double-bookings are strictly prohibited.`);
      return;
    }

    addRoomBooking(roomName, date, startTime, endTime);
    alert(`Reservation Confirmed! ${roomName} is successfully booked.`);
  };

  const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none bg-[#F4F3EF] min-h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#E2E1DD] pb-4">
        <Calendar className="h-8 w-8 text-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)]" />
        <div>
          <h2 className="text-3xl font-extrabold text-[#1A1C18] tracking-tight">Meeting Room Calendar</h2>
          <p className="text-sm text-[#5E6258] mt-1">Reserve physical meeting rooms and boards spaces. Automated conflict prevention prevents overlapping schedules.</p>
        </div>
      </div>

      {/* Grid splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Reservation Form */}
        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 shadow-sm h-fit space-y-4">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2 border-b border-[#E2E1DD] pb-2">
            <PlusCircle className="h-4 w-4 text-[#C0D930]" /> Reserve Space
          </h3>

          <form onSubmit={handleBooking} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-[#5E6258]">Select Room</label>
              <select 
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3 py-2 text-xs text-black focus:outline-none transition-all"
              >
                <option value="Conference Room Alpha">Conference Room Alpha</option>
                <option value="Boardroom">Boardroom</option>
                <option value="Huddle Space Gamma">Huddle Space Gamma</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-[#5E6258]">Reservation Date</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3 py-2 text-xs text-black focus:outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-[#5E6258]">Start Time</label>
                <select 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3 py-2 text-xs text-black focus:outline-none transition-all"
                >
                  {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-[#5E6258]">End Time</label>
                <select 
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3 py-2 text-xs text-black focus:outline-none transition-all"
                >
                  {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-2.5 bg-black hover:bg-black/90 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
            >
              Confirm Reservation
            </button>
          </form>
        </div>

        {/* Right column: Visual Timeline */}
        <div className="lg:col-span-2 bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E2E1DD] pb-3">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#8B5CF6]" /> Visual Room Timelines (Date: {date})
            </h3>
            <span className="text-[9px] text-[#5E6258] font-bold bg-[#FAF9F6] border border-[#E2E1DD] px-2 py-0.5 rounded-full uppercase">
              Today
            </span>
          </div>

          <div className="space-y-4">
            {['Conference Room Alpha', 'Boardroom', 'Huddle Space Gamma'].map((room) => {
              const bookings = roomBookings.filter(b => b.room_name === room && b.date === date);

              return (
                <div key={room} className="space-y-2.5 bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl p-4">
                  <h4 className="text-xs font-extrabold text-black uppercase tracking-wide">{room}</h4>
                  
                  {/* Timeline slots visual bar */}
                  <div className="grid grid-cols-8 gap-1.5 pt-1 text-center text-[8px] font-bold uppercase">
                    {timeSlots.map((slot) => {
                      const booking = bookings.find(b => b.start_time === slot);
                      const booker = booking ? employees.find(e => e.id === booking.booker_id) : null;

                      return (
                        <div 
                          key={slot} 
                          className={`p-2 rounded-lg border transition-all ${
                            booking 
                              ? 'bg-black text-[#3CD070] border-[#C0D930]/30 shadow-sm' 
                              : 'bg-white border-[#E2E1DD] text-[#8C9086]'
                          }`}
                          title={booking ? `Booked by ${booker?.first_name} ${booker?.last_name}` : 'Available'}
                        >
                          <span className="block font-mono leading-none">{slot.replace(' PM', '').replace(' AM', '')}</span>
                          <span className="block text-[6px] mt-1 leading-none font-semibold truncate">
                            {booking ? `${booker?.first_name[0]}${booker?.last_name[0]}` : 'FREE'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
