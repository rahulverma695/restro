'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/StateContext';
import { 
  Mail, 
  Briefcase, 
  Search, 
  Monitor, 
  User, 
  MapPin, 
  ChevronRight, 
  Phone,
  GitMerge,
  Award,
  Laptop,
  X
} from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

export default function DirectoryPage() {
  const { activeUser, employees } = useAppState();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'summary' | 'assets' | 'hierarchy'>('summary');
  const viewMode = 'list';
  const [drawerEmpId, setDrawerEmpId] = useState<string | null>(null);

  // RBAC clearance check
  const hasAccess = 
    activeUser.role === 'SuperAdmin' || 
    activeUser.role === 'HRAdmin' || 
    activeUser.role === 'Manager' ||
    activeUser.role === 'Employee';

  if (!hasAccess) {
    return <AccessDenied suite="HR Operations" role={activeUser.role} />;
  }

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
    const email = emp.email.toLowerCase();
    const dept = emp.department.toLowerCase();
    const role = emp.role.toLowerCase();
    return (
      fullName.includes(searchQuery.toLowerCase()) ||
      email.includes(searchQuery.toLowerCase()) ||
      dept.includes(searchQuery.toLowerCase()) ||
      role.includes(searchQuery.toLowerCase())
    );
  });

  const selectedEmp = employees.find(e => e.id === selectedEmpId) || employees[0];
  const reportingManager = employees.find(e => e.first_name + ' ' + e.last_name === selectedEmp?.reporting_manager) || 
                           employees.find(e => e.role === 'SuperAdmin');

  // Drawer Employee details
  const drawerEmp = employees.find(e => e.id === drawerEmpId) || null;
  const drawerReportingManager = drawerEmp ? employees.find(e => e.first_name + ' ' + e.last_name === drawerEmp.reporting_manager) || 
                                           employees.find(e => e.role === 'SuperAdmin') : null;

  const mockScores: Record<string, { percent: number; grade: string; text: string }> = {
    e1: { percent: 98, grade: 'Tier A+', text: 'Exceptional Timesheet Logging' },
    e2: { percent: 92, grade: 'Tier A', text: 'Highly Compliant Shift Punch' },
    e3: { percent: 95, grade: 'Tier A+', text: 'Consistent Ledger Availability' },
    e4: { percent: 100, grade: 'Tier S', text: 'Flawless Uptime Status logs' },
  };

  const currentScore = mockScores[selectedEmp?.id] || { percent: 94, grade: 'Tier A', text: 'Good Standings' };
  const drawerScore = drawerEmp ? (mockScores[drawerEmp.id] || { percent: 94, grade: 'Tier A', text: 'Good Standings' }) : null;

  // Gate Employee Directory details: Hide compliance ratings and authority tiers from Employees viewing other coworkers
  const canViewPerformanceMetrics = (targetId: string) => {
    return activeUser.role === 'SuperAdmin' || 
           activeUser.role === 'HRAdmin' || 
           activeUser.role === 'Manager' || 
           targetId === activeUser.id;
  };

  const currentTab = canViewPerformanceMetrics(selectedEmp?.id) ? activeTab : 'summary';

  // Org chart hierarchy mapping
  // e4 (Alex) CEO/SuperAdmin -> e1 (Nikhil, HRAdmin) & e3 (Jane, Finance Manager)
  // e3 -> e2 (John, Employee)
  const ceo = employees.find(e => e.id === 'e4');
  const level1 = employees.filter(e => e.reporting_manager === 'Alex Johnson');
  const level2 = employees.filter(e => e.reporting_manager === 'Jane Smith');

  const handleCardClick = (empId: string) => {
    setDrawerEmpId(empId);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col select-none overflow-hidden bg-[#F4F3EF] relative">
      
      {/* 1. Header Toolbar */}
      <div className="h-16 px-6 border-b border-[#E2E1DD] bg-white flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-extrabold text-black uppercase tracking-wider">Teammate Directory</h2>
        </div>
      </div>

      {/* 2. Main Content view */}
      <div className="flex-1 min-h-0 relative">
        {viewMode === 'list' ? (
          /* List Mode Split view */
          <div className="h-full flex">
            {/* Left List Pane */}
            <div className="w-80 border-r border-[#E2E1DD] flex flex-col h-full bg-[#FAF9F6] shrink-0">
              <div className="p-4 border-b border-[#E2E1DD] space-y-3 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-black uppercase tracking-wider">Coworkers</span>
                  <span className="text-[9px] text-[#5E6258] font-bold bg-[#EAE8E3] border border-[#E2E1DD] px-2 py-0.5 rounded-full">
                    {filteredEmployees.length} Total
                  </span>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#5E6258]" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search staff, dept, role..."
                    className="w-full bg-white border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl pl-9 pr-3 py-1.5 text-xs text-black focus:outline-none transition-all placeholder-[#8C9086]"
                  />
                </div>
              </div>

              {/* Scrollable list items */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5 bg-[#FAF9F6]">
                {filteredEmployees.map((emp) => {
                  const isSelected = emp.id === selectedEmpId;
                  let statusBadge = 'bg-[#8C9086]';
                  if (emp.status === 'online') statusBadge = 'bg-[#3CD070]';
                  if (emp.status === 'on_leave') statusBadge = 'bg-[#8B5CF6]';

                  return (
                    <button
                      key={emp.id}
                      onClick={() => setSelectedEmpId(emp.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 text-left border ${
                        isSelected
                          ? 'bg-white border-[#E2E1DD] text-black shadow-sm border-l-4 border-l-[#E1FF4B] font-extrabold'
                          : 'bg-transparent border-transparent hover:border-[#E2E1DD] text-[#5E6258] hover:text-black hover:bg-white/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative h-9 w-9 bg-[#EAE8E3] border border-[#E2E1DD] rounded-full flex items-center justify-center font-extrabold text-black text-xs shrink-0">
                          {emp.first_name[0]}{emp.last_name[0]}
                          <span className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white ${statusBadge}`} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-black leading-tight">{emp.first_name} {emp.last_name}</h4>
                          <p className="text-[9px] text-[#5E6258] font-bold uppercase mt-0.5">{emp.role}</p>
                        </div>
                      </div>
                      <ChevronRight className={`h-4 w-4 text-[#8C9086] transition-transform ${isSelected ? 'translate-x-0.5 text-black' : ''}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right detailed workspace pane */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F4F3EF]">
              {selectedEmp ? (
                <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                  
                  {/* Upper profile header container */}
                  <div className="p-6 border-b border-[#E2E1DD] bg-white shrink-0 space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="h-16 w-16 bg-[#EAE8E3] border border-[#E2E1DD] rounded-2xl flex items-center justify-center font-extrabold text-black text-xl shadow-sm">
                        {selectedEmp.first_name[0]}{selectedEmp.last_name[0]}
                      </div>
                      <div className="text-center sm:text-left space-y-1">
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                          <h2 className="text-xl font-extrabold text-black">{selectedEmp.first_name} {selectedEmp.last_name}</h2>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                            selectedEmp.status === 'online'
                              ? 'bg-[#3CD070]/10 text-[#3CD070] border border-[#3CD070]/20'
                              : selectedEmp.status === 'on_leave'
                              ? 'bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20'
                              : 'bg-[#8C9086]/10 text-[#5E6258] border border-[#8C9086]/20'
                          }`}>
                            {selectedEmp.status === 'online' ? 'Active Duty' : selectedEmp.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#5E6258] font-extrabold uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1">
                          <Briefcase className="h-3.5 w-3.5 text-[#C0D930]" />
                          <span>{selectedEmp.role} • {selectedEmp.department}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tabs navigation */}
                    {canViewPerformanceMetrics(selectedEmp.id) && (
                      <div className="flex gap-2 border-t border-[#E2E1DD] pt-3 shrink-0">
                        {(['summary', 'assets', 'hierarchy'] as const).map(tab => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all border ${
                              activeTab === tab
                                ? 'bg-black border-black text-white shadow-sm'
                                : 'bg-transparent border-transparent text-[#5E6258] hover:text-black'
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tab Contents */}
                  <div className="p-6 flex-1 min-h-0 overflow-y-auto space-y-6">
                    
                    {currentTab === 'summary' && (
                      <div className={`grid grid-cols-1 ${canViewPerformanceMetrics(selectedEmp.id) ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
                        
                        {/* Column 1: Contact Details */}
                        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 space-y-4 shadow-sm">
                          <h3 className="text-[10px] font-extrabold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-2">
                            Teammate Details
                          </h3>
                          <div className="space-y-3 text-xs">
                            <div className="space-y-0.5">
                              <span className="text-[9px] text-[#5E6258] font-bold uppercase">Official Email</span>
                              <p className="text-black font-semibold flex items-center gap-1.5">
                                <Mail className="h-3.5 w-3.5 text-[#8C9086]" />
                                {selectedEmp.email}
                              </p>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[9px] text-[#5E6258] font-bold uppercase">Phone Extension</span>
                              <p className="text-black font-semibold flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 text-[#8C9086]" />
                                +1 (555) 019-{selectedEmp.id.replace('e', '0')}
                              </p>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[9px] text-[#5E6258] font-bold uppercase">HQ Location</span>
                              <p className="text-black font-semibold flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-[#8C9086]" />
                                San Francisco HQ
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Column 2: Circular Progress Compliance Score */}
                        {canViewPerformanceMetrics(selectedEmp.id) && (
                          <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 flex flex-col items-center justify-between text-center shadow-sm">
                            <h3 className="text-[10px] font-extrabold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-2 w-full text-left">
                              Compliance Rating
                            </h3>
                            
                            <div className="relative h-28 w-28 flex items-center justify-center my-2">
                              <svg className="h-full w-full transform -rotate-90">
                                <circle 
                                  cx="56" 
                                  cy="56" 
                                  r="44" 
                                  className="stroke-[#EAE8E3]" 
                                  strokeWidth="8" 
                                  fill="transparent" 
                                />
                                <circle 
                                  cx="56" 
                                  cy="56" 
                                  r="44" 
                                  className="stroke-[#C0D930]" 
                                  strokeWidth="8" 
                                  fill="transparent" 
                                  strokeDasharray={276}
                                  strokeDashoffset={276 - (276 * currentScore.percent) / 100}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <div className="absolute flex flex-col items-center justify-center">
                                <span className="text-2xl font-extrabold text-black leading-none">{currentScore.percent}%</span>
                                <span className="text-[8px] font-bold text-[#5E6258] uppercase tracking-wider mt-1">{currentScore.grade}</span>
                              </div>
                            </div>

                            <div className="space-y-0.5">
                              <p className="text-[10px] font-bold text-black">{currentScore.text}</p>
                              <p className="text-[9px] text-[#5E6258]">Calculated shift metrics compliance</p>
                            </div>
                          </div>
                        )}

                        {/* Column 3: Reporting Managers */}
                        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-sm">
                          <div>
                            <h3 className="text-[10px] font-extrabold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-2">
                              Reporting Line
                            </h3>
                            
                            {reportingManager ? (
                              <div className="flex items-center gap-3 mt-4">
                                <div className="h-9 w-9 bg-[#EAE8E3] border border-[#E2E1DD] rounded-xl flex items-center justify-center text-black font-bold text-xs shrink-0">
                                  {reportingManager.first_name[0]}{reportingManager.last_name[0]}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-black">{reportingManager.first_name} {reportingManager.last_name}</p>
                                  <p className="text-[9px] text-[#5E6258] font-bold uppercase mt-0.5">{reportingManager.role}</p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 mt-4">
                                <div className="h-9 w-9 bg-black text-white rounded-xl flex items-center justify-center font-bold text-xs shrink-0">
                                  CEO
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-black">Board of Directors</p>
                                  <p className="text-[9px] text-[#5E6258] font-bold uppercase mt-0.5">Corporate Sovereigns</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {canViewPerformanceMetrics(selectedEmp.id) && (
                            <div className="border-t border-[#E2E1DD] pt-3 flex items-center justify-between text-[10px] text-[#5E6258] font-bold uppercase tracking-wider">
                              <span>Authority Tier</span>
                              <span className="text-[#C0D930]">{selectedEmp.role === 'SuperAdmin' ? 'Tier 1 (Root)' : selectedEmp.role === 'Manager' ? 'Tier 2 (Manager)' : 'Tier 3 (Staff)'}</span>
                            </div>
                          )}
                        </div>

                      </div>
                    )}

                    {currentTab === 'assets' && (
                      <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4 shadow-sm">
                        <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2 border-b border-[#E2E1DD] pb-2">
                          <Monitor className="h-4 w-4 text-[#C0D930]" />
                          Assigned Hardware & Access Credentials
                        </h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {selectedEmp.assets.map((asset, idx) => (
                            <div key={idx} className="bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl p-4 space-y-2 hover:border-[#C0D930]/30 transition-colors shadow-sm">
                              <div className="flex items-center justify-between">
                                <LaptopIcon category={asset} />
                                <span className="text-[8px] font-extrabold text-[#3CD070] bg-[#3CD070]/10 border border-[#3CD070]/20 px-2 py-0.5 rounded-full uppercase">
                                  Active
                                </span>
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-black leading-snug">{asset}</h4>
                                <p className="text-[8px] text-[#8C9086] font-mono mt-0.5">ID: SN-OS-{(selectedEmp.id + idx).toUpperCase()}</p>
                              </div>
                            </div>
                          ))}
                          {selectedEmp.assets.length === 0 && (
                            <p className="text-xs text-[#5E6258] py-4 italic">No physical corporate hardware credentials logged.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {currentTab === 'hierarchy' && (
                      <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-6 shadow-sm">
                        <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2 border-b border-[#E2E1DD] pb-2">
                          <GitMerge className="h-4 w-4 text-[#C0D930]" /> Org Tree Structure
                        </h3>

                        <div className="flex flex-col items-center py-6 space-y-6">
                          {reportingManager && (
                            <div className="bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl p-3 text-center w-52 shadow-sm">
                              <span className="text-[8px] font-extrabold text-[#8B5CF6] uppercase">Supervisor</span>
                              <p className="text-xs font-bold text-black mt-1">{reportingManager.first_name} {reportingManager.last_name}</p>
                              <p className="text-[9px] text-[#5E6258] font-bold">{reportingManager.role}</p>
                            </div>
                          )}
                          
                          {reportingManager && <div className="h-8 w-[1px] bg-[#E2E1DD]" />}

                          <div className="bg-[#FAF9F6] border-2 border-[#E1FF4B] rounded-xl p-3.5 text-center w-60 shadow-md relative">
                            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[8px] font-extrabold bg-[#E1FF4B] text-black border border-[#C0D930] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              Active Target
                            </span>
                            <p className="text-xs font-bold text-black mt-1">{selectedEmp.first_name} {selectedEmp.last_name}</p>
                            <p className="text-[9px] text-black font-extrabold mt-0.5 uppercase">{selectedEmp.role}</p>
                          </div>

                          {selectedEmp.role === 'Manager' && <div className="h-8 w-[1px] bg-[#E2E1DD]" />}

                          {selectedEmp.role === 'Manager' && (
                            <div className="flex gap-4">
                              {employees.filter(e => e.reporting_manager === `${selectedEmp.first_name} ${selectedEmp.last_name}`).map(sub => (
                                <div key={sub.id} className="bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl p-2.5 text-center w-40 shadow-sm">
                                  <span className="text-[8px] font-extrabold text-[#5E6258] uppercase font-bold">Reports To</span>
                                  <p className="text-xs font-bold text-black mt-0.5">{sub.first_name} {sub.last_name}</p>
                                  <p className="text-[9px] text-[#5E6258]">{sub.role}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-sm text-[#5E6258]">
                  <User className="h-10 w-10 text-[#8C9086] mb-2 animate-bounce" />
                  <p className="font-extrabold uppercase tracking-wider text-black">Select a Teammate</p>
                  <p className="text-xs text-[#5E6258] mt-0.5">Use the listing index on the left to inspect detailed profile registry.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Tree / Org Chart Mode */
          <div className="h-full w-full overflow-auto p-12 bg-[#F4F3EF] flex flex-col items-center justify-start min-h-[500px]">
            
            {/* Draggable/Pannable Org Tree visualizer structure */}
            <div className="flex flex-col items-center space-y-12">
              
              {/* Level 0: CEO */}
              {ceo && (
                <div className="flex flex-col items-center relative">
                  <div 
                    onClick={() => handleCardClick(ceo.id)}
                    className="cursor-pointer bg-white border border-[#E2E1DD] hover:border-[#8B5CF6] hover:shadow-lg rounded-2xl p-4 w-60 text-center transition-all shadow-sm"
                  >
                    <span className="text-[8px] font-extrabold text-[#C0D930] bg-[#FAF9F6] border border-[#E2E1DD] px-2 py-0.5 rounded-full uppercase tracking-wide">
                      Root Chief
                    </span>
                    <p className="text-xs font-extrabold text-black mt-2">{ceo.first_name} {ceo.last_name}</p>
                    <p className="text-[9px] text-[#5E6258] font-semibold uppercase">{ceo.role} • {ceo.department}</p>
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      <span className="h-1.5 w-1.5 bg-[#3CD070] rounded-full" />
                      <span className="text-[8px] text-[#8C9086] font-bold uppercase">Online</span>
                    </div>
                  </div>
                  
                  {/* Branching Lines */}
                  <div className="h-12 w-[1px] bg-[#E2E1DD]" />
                </div>
              )}

              {/* Level 1: Admins / Managers */}
              <div className="flex gap-8 relative items-start justify-center">
                {level1.map((emp) => {
                  const hasReports = employees.some(e => e.reporting_manager === `${emp.first_name} ${emp.last_name}`);
                  
                  return (
                    <div key={emp.id} className="flex flex-col items-center relative">
                      <div 
                        onClick={() => handleCardClick(emp.id)}
                        className="cursor-pointer bg-white border border-[#E2E1DD] hover:border-[#8B5CF6] hover:shadow-lg rounded-2xl p-4 w-56 text-center transition-all shadow-sm z-10"
                      >
                        <span className="text-[8px] font-extrabold text-[#8B5CF6] bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 px-2 py-0.5 rounded-full uppercase tracking-wide">
                          {emp.role}
                        </span>
                        <p className="text-xs font-extrabold text-black mt-2">{emp.first_name} {emp.last_name}</p>
                        <p className="text-[9px] text-[#5E6258] font-semibold uppercase">{emp.department}</p>
                        <div className="flex items-center justify-center gap-1.5 mt-2">
                          <span className={`h-1.5 w-1.5 rounded-full ${emp.status === 'online' ? 'bg-[#3CD070]' : emp.status === 'on_leave' ? 'bg-[#8B5CF6]' : 'bg-[#8C9086]'}`} />
                          <span className="text-[8px] text-[#8C9086] font-bold uppercase capitalize">{emp.status.replace('_', ' ')}</span>
                        </div>
                      </div>

                      {hasReports && (
                        <>
                          <div className="h-12 w-[1px] bg-[#E2E1DD]" />
                          
                          {/* Level 2: Engineers reporting to Jane (e3) */}
                          <div className="flex gap-4">
                            {employees.filter(e => e.reporting_manager === `${emp.first_name} ${emp.last_name}`).map((sub) => (
                              <div 
                                key={sub.id}
                                onClick={() => handleCardClick(sub.id)}
                                className="cursor-pointer bg-white border border-[#E2E1DD] hover:border-[#8B5CF6] hover:shadow-lg rounded-xl p-3 w-44 text-center transition-all shadow-sm"
                              >
                                <span className="text-[8px] font-extrabold text-[#5E6258] bg-[#FAF9F6] border border-[#E2E1DD] px-1.5 py-0.2 rounded-full uppercase tracking-wide">
                                  {sub.role}
                                </span>
                                <p className="text-xs font-extrabold text-black mt-1.5">{sub.first_name} {sub.last_name}</p>
                                <p className="text-[8px] text-[#8C9086] font-bold uppercase">{sub.department}</p>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        )}
      </div>

      {/* 3. Sliding Profile Drawer (slides from right) */}
      <div 
        className={`fixed top-0 right-0 h-full w-96 bg-white border-l border-[#E2E1DD] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out p-6 flex flex-col justify-between overflow-y-auto ${
          drawerEmpId ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {drawerEmp ? (
          <div className="flex-1 flex flex-col justify-between h-full">
            <div className="space-y-6">
              
              {/* Close and Header */}
              <div className="flex items-center justify-between border-b border-[#E2E1DD] pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-[#EAE8E3] border border-[#E2E1DD] rounded-xl flex items-center justify-center font-extrabold text-black text-sm">
                    {drawerEmp.first_name[0]}{drawerEmp.last_name[0]}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-black">{drawerEmp.first_name} {drawerEmp.last_name}</h3>
                    <p className="text-[9px] text-[#8C9086] font-extrabold uppercase">{drawerEmp.role} • {drawerEmp.department}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setDrawerEmpId(null)}
                  className="h-8 w-8 rounded-lg hover:bg-[#FAF9F6] border border-[#E2E1DD]/60 flex items-center justify-center text-[#5E6258] hover:text-black cursor-pointer transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Status & Contacts */}
              <div className="space-y-4">
                <div className="bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl p-4 space-y-3">
                  <h4 className="text-[9px] font-extrabold text-black uppercase tracking-wider border-b border-[#E2E1DD]/60 pb-1.5">Teammate Info</h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[8px] text-[#8C9086] font-bold uppercase">Status</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`h-2 w-2 rounded-full ${drawerEmp.status === 'online' ? 'bg-[#3CD070]' : drawerEmp.status === 'on_leave' ? 'bg-[#8B5CF6]' : 'bg-[#8C9086]'}`} />
                        <span className="font-extrabold uppercase text-black">{drawerEmp.status === 'online' ? 'Active Duty' : drawerEmp.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[8px] text-[#8C9086] font-bold uppercase">Email Address</span>
                      <p className="font-semibold text-black mt-0.5 truncate">{drawerEmp.email}</p>
                    </div>
                    <div>
                      <span className="text-[8px] text-[#8C9086] font-bold uppercase">HQ Extension</span>
                      <p className="font-semibold text-black mt-0.5">+1 (555) 019-{drawerEmp.id.replace('e', '0')}</p>
                    </div>
                  </div>
                </div>

                {/* Assigned Hardware */}
                <div className="bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl p-4 space-y-3">
                  <h4 className="text-[9px] font-extrabold text-black uppercase tracking-wider border-b border-[#E2E1DD]/60 pb-1.5">Hardware Profile</h4>
                  <div className="space-y-2.5">
                    {drawerEmp.assets.map((asset, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-white border border-[#E2E1DD]/60 p-2.5 rounded-lg">
                        <div className="flex items-center gap-2">
                          <LaptopIcon category={asset} />
                          <span className="font-bold text-black truncate max-w-[180px]">{asset}</span>
                        </div>
                        <span className="text-[7px] font-mono text-[#8C9086]">SN-{drawerEmp.id.toUpperCase()}{idx}</span>
                      </div>
                    ))}
                    {drawerEmp.assets.length === 0 && (
                      <p className="text-[10px] text-[#8C9086] italic">No hardware provisioned.</p>
                    )}
                  </div>
                </div>

                {/* Performance compliance (gate checking) */}
                {drawerScore && canViewPerformanceMetrics(drawerEmp.id) && (
                  <div className="bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[8px] text-[#8C9086] font-bold uppercase">Shift Compliance</span>
                      <p className="text-sm font-extrabold text-black">{drawerScore.text}</p>
                      <p className="text-[8px] text-[#8C9086] uppercase font-bold">{drawerScore.grade} rating</p>
                    </div>
                    <div className="h-12 w-12 bg-white border border-[#E2E1DD] rounded-lg flex items-center justify-center font-extrabold text-xs text-black">
                      {drawerScore.percent}%
                    </div>
                  </div>
                )}

                {/* Reporting supervisor */}
                {drawerReportingManager && (
                  <div className="bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl p-4 space-y-2">
                    <span className="text-[8px] text-[#8C9086] font-bold uppercase">Supervisor Line</span>
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 bg-white border border-[#E2E1DD] rounded-lg flex items-center justify-center font-bold text-[10px] text-black">
                        {drawerReportingManager.first_name[0]}{drawerReportingManager.last_name[0]}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-black">{drawerReportingManager.first_name} {drawerReportingManager.last_name}</p>
                        <p className="text-[8px] text-[#8C9086] font-extrabold uppercase">{drawerReportingManager.role}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

            <div className="pt-6 border-t border-[#E2E1DD] flex gap-2">
              <button 
                onClick={() => setDrawerEmpId(null)}
                className="w-full py-2 bg-black hover:bg-black/90 text-[10px] font-extrabold uppercase tracking-wider text-white rounded-xl shadow-md cursor-pointer text-center"
              >
                Close Drawer
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#8C9086] italic text-center py-12">No employee details loaded.</p>
        )}
      </div>

    </div>
  );
}

// Helper category component
function LaptopIcon({ category }: { category: string }) {
  if (category.toLowerCase().includes('macbook') || category.toLowerCase().includes('laptop') || category.toLowerCase().includes('thinkpad')) {
    return <Laptop className="h-4 w-4 text-[#C0D930]" />;
  }
  if (category.toLowerCase().includes('monitor') || category.toLowerCase().includes('screen')) {
    return <Monitor className="h-4 w-4 text-[#3CD070]" />;
  }
  return <Award className="h-4 w-4 text-[#8B5CF6]" />;
}
