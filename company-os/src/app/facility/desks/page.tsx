'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/StateContext';
import { Monitor, User, Calendar, Map, CheckCircle2 } from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

export default function DesksPage() {
  const { activeUser, deskBookings, employees, addDeskBooking } = useAppState();
  const [date, setDate] = useState('2026-06-15');

  const hasAccess = 
    activeUser.role === 'SuperAdmin' || 
    activeUser.role === 'HRAdmin' || 
    activeUser.role === 'Manager' || 
    activeUser.role === 'Employee';

  if (!hasAccess) {
    return <AccessDenied suite="Facility Booking" role={activeUser.role} />;
  }

  const handleDeskClick = (deskId: string) => {
    const isBooked = deskBookings.some(b => b.desk_id === deskId && b.date === date);
    if (isBooked) {
      alert(`${deskId} is already occupied for today.`);
      return;
    }
    addDeskBooking(deskId, date);
    alert(`Desk Confirmed! ${deskId} is reserved for you on ${date}.`);
  };

  const deskRows = [
    ['Desk-01', 'Desk-02', 'Desk-03', 'Desk-04'],
    ['Desk-05', 'Desk-06', 'Desk-07', 'Desk-08'],
    ['Desk-09', 'Desk-10', 'Desk-11', 'Desk-12']
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none bg-[#F4F3EF] min-h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E1DD] pb-4">
        <div className="flex items-center gap-3">
          <Map className="h-8 w-8 text-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)]" />
          <div>
            <h2 className="text-3xl font-extrabold text-[#1A1C18] tracking-tight">Desk Hoteling Map</h2>
            <p className="text-sm text-[#5E6258] mt-1">Interactive office floor plan. Click on an available workspace to book your desk for the day.</p>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-white border border-[#E2E1DD] rounded-xl px-3 py-1.5 shadow-sm text-xs font-bold">
          <Calendar className="h-4 w-4 text-[#8C9086]" />
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="focus:outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Main Floor Plan Grid */}
      <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E2E1DD] pb-4">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
            <Monitor className="h-4 w-4 text-[#C0D930]" /> Office Bay Section A (Floor 4)
          </h3>
          
          <div className="flex gap-4 text-[9px] text-[#5E6258] font-bold uppercase">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 bg-black rounded" /> Occupied</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 bg-white border border-[#E2E1DD] rounded" /> Free</span>
          </div>
        </div>

        {/* Office Plan Map */}
        <div className="bg-[#FAF9F6] border border-[#E2E1DD] rounded-2xl p-8 max-w-4xl mx-auto flex flex-col gap-6 relative shadow-inner">
          
          {/* Floor boundary walls mock indicators */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[8px] font-extrabold text-[#8C9086] uppercase tracking-widest bg-white border border-[#E2E1DD] px-3.5 py-0.5 rounded-full">
            North Wall Window bay
          </div>

          <div className="space-y-6">
            {deskRows.map((row, rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-4 gap-6">
                {row.map((deskId) => {
                  const booking = deskBookings.find(b => b.desk_id === deskId && b.date === date);
                  const booker = booking ? employees.find(e => e.id === booking.booker_id) : null;
                  const isOccupied = booking !== undefined;

                  return (
                    <button
                      key={deskId}
                      onClick={() => handleDeskClick(deskId)}
                      className={`h-24 rounded-2xl border transition-all flex flex-col justify-between p-3.5 text-left cursor-pointer shadow-sm relative overflow-hidden group ${
                        isOccupied 
                          ? 'bg-black text-[#3CD070] border-[#C0D930]/30 hover:shadow-lg' 
                          : 'bg-white border-[#E2E1DD] hover:border-[#8B5CF6] hover:shadow-md'
                      }`}
                    >
                      {/* Desk Label */}
                      <span className={`text-[9px] font-extrabold uppercase ${isOccupied ? 'text-[#C0D930]' : 'text-black'}`}>
                        {deskId}
                      </span>

                      {/* Desk occupancy details */}
                      {isOccupied ? (
                        <div className="space-y-1">
                          <span className="text-[7px] text-[#8C9086] uppercase font-bold block">Reserved By</span>
                          <p className="text-[10px] font-extrabold text-white truncate max-w-[100px]" title={`${booker?.first_name} ${booker?.last_name}`}>
                            {booker?.first_name} {booker?.last_name[0]}.
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[8px] text-[#8C9086] font-bold uppercase">
                          <span className="h-1.5 w-1.5 bg-[#3CD070] rounded-full" />
                          <span>Book Space</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Wall indicator */}
          <div className="border-t border-[#E2E1DD] pt-4 text-center text-[8px] font-bold text-[#8C9086] uppercase tracking-widest mt-4">
            South Entry Hallway / Lift Lobby Entrance
          </div>
        </div>
      </div>

    </div>
  );
}
