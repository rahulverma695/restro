'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, LogIn, ChevronDown, Activity } from 'lucide-react';
import { useAppState } from '@/context/StateContext';

export default function Header() {
  const { activeUser, employees, switchActiveUser } = useAppState();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUserSwitch = (userId: string) => {
    switchActiveUser(userId);
    setIsDropdownOpen(false);
  };

  return (
    <header className="h-16 border-b border-[#E2E1DD] bg-[#FAF9F6] flex items-center justify-between px-8 shrink-0 select-none">
      
      {/* Active Role tag badge */}
      <div>
        <span className="text-[9px] font-extrabold text-[#1A1C18] bg-[#E1FF4B] px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-[#C0D930] shadow-sm">
          Authorization: {activeUser.role} ({activeUser.department})
        </span>
      </div>

      <div className="flex items-center gap-6">
        
        {/* Status indicator logs */}
        <div className="flex items-center gap-2 text-[10px] text-[#5E6258] font-extrabold uppercase tracking-wider border-r border-[#E2E1DD] pr-6">
          <Activity className="h-3.5 w-3.5 text-[#3CD070] animate-pulse" />
          <span>Intranet Node Active</span>
        </div>

        {/* Profile Dropdown */}
        <div 
          ref={dropdownRef}
          className="relative flex items-center gap-2.5 cursor-pointer bg-white border border-[#E2E1DD] hover:border-[#C0D930] px-3.5 py-1.5 rounded-xl transition-all duration-200 shadow-sm"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="h-6 w-6 bg-[#EAE8E3] text-[#1A1C18] rounded-md flex items-center justify-center font-extrabold text-xs uppercase border border-[#E2E1DD]">
            {activeUser.first_name[0]}{activeUser.last_name[0]}
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-[#1A1C18] leading-tight">
              {activeUser.first_name} {activeUser.last_name}
            </p>
            <p className="text-[9px] text-[#8C9086] leading-tight font-extrabold uppercase tracking-wider">
              {activeUser.role}
            </p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-[#5E6258]" />

          {/* Menu lists mock profiles */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-11 w-60 bg-white border border-[#E2E1DD] rounded-xl shadow-xl p-1.5 z-50" onClick={(e) => e.stopPropagation()}>
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-[#5E6258] px-3 py-2 border-b border-[#E2E1DD] mb-1">
                Switch Test Account
              </p>
              <div className="space-y-1">
                {employees.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => handleUserSwitch(emp.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-xs font-bold transition-all ${
                      emp.id === activeUser.id
                        ? 'bg-[#E1FF4B]/20 text-black border-l-2 border-[#C0D930]'
                        : 'text-[#5E6258] hover:bg-[#FAF9F6] hover:text-[#1A1C18]'
                    }`}
                  >
                    <LogIn className="h-3.5 w-3.5 text-[#8C9086]" />
                    <div className="flex-1">
                      <p className="text-xs text-[#1A1C18] leading-none font-bold">{emp.first_name} {emp.last_name}</p>
                      <p className="text-[9px] text-[#5E6258] leading-none uppercase mt-0.5 font-bold">{emp.role} • {emp.department}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </header>
  );
}
