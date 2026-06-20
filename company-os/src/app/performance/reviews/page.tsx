'use client';

import React from 'react';
import { useAppState } from '@/context/StateContext';
import { Award, ShieldAlert, Award as AwardIcon, UserCheck, Star } from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

export default function ReviewsPage() {
  const { activeUser, reviewScores } = useAppState();

  const hasAccess = 
    activeUser.role === 'SuperAdmin' || 
    activeUser.role === 'HRAdmin' || 
    activeUser.role === 'Manager' || 
    activeUser.role === 'Employee';

  if (!hasAccess) {
    return <AccessDenied suite="Performance OKRs" role={activeUser.role} />;
  }

  // Filter scores for target user (defaults to e2 John Doe, or activeUser if they are Employee)
  const targetId = activeUser.role === 'Employee' ? activeUser.id : 'e2';
  const scores = reviewScores.filter(s => s.employee_id === targetId);

  // Radar calculations
  // Center = (150, 150), Max radius = 100 (represents score of 5.0)
  const cx = 150;
  const cy = 150;
  const r = 100;

  const getPointsStr = (type: 'self' | 'peer' | 'manager') => {
    // Axes angles:
    // Coding (Up): angle = -90deg, x = cx, y = cy - r * (score/5)
    // Delivery (Right): angle = 0deg, x = cx + r * (score/5), y = cy
    // Comms (Down): angle = 90deg, x = cx, y = cy + r * (score/5)
    // Teamwork (Left): angle = 180deg, x = cx - r * (score/5), y = cy
    const sCoding = scores.find(s => s.dimension === 'Coding')?.[type] || 0;
    const sDelivery = scores.find(s => s.dimension === 'Delivery')?.[type] || 0;
    const sComms = scores.find(s => s.dimension === 'Comms')?.[type] || 0;
    const sTeamwork = scores.find(s => s.dimension === 'Teamwork')?.[type] || 0;

    const p0 = `${cx},${cy - r * (sCoding / 5)}`;
    const p1 = `${cx + r * (sDelivery / 5)},${cy}`;
    const p2 = `${cx},${cy + r * (sComms / 5)}`;
    const p3 = `${cx - r * (sTeamwork / 5)},${cy}`;

    return `${p0} ${p1} ${p2} ${p3}`;
  };

  const selfPoints = getPointsStr('self');
  const peerPoints = getPointsStr('peer');
  const managerPoints = getPointsStr('manager');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none bg-[#F4F3EF] min-h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#E2E1DD] pb-4">
        <Star className="h-8 w-8 text-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)]" />
        <div>
          <h2 className="text-3xl font-extrabold text-[#1A1C18] tracking-tight">360-Review Engine</h2>
          <p className="text-sm text-[#5E6258] mt-1">Interactive radar chart visualizations aggregating peer, self, and manager performance ratings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Radar Visualizer */}
        <div className="lg:col-span-7 bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-4 shadow-sm flex flex-col items-center">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-2 w-full text-left">
            Radar Performance Graph (Target: {activeUser.role === 'Employee' ? 'Self Profile' : 'John Doe'})
          </h3>

          <div className="relative h-[320px] w-[320px] bg-[#FAF9F6] border border-[#E2E1DD] rounded-full flex items-center justify-center shadow-inner">
            <svg viewBox="0 0 300 300" className="h-[300px] w-[300px] h-full w-full">
              
              {/* Concentric grid lines (Concentric boxes for radar chart) */}
              {[1, 2, 3, 4, 5].map((tick) => (
                <polygon
                  key={tick}
                  points={`${cx},${cy - r * (tick / 5)} ${cx + r * (tick / 5)},${cy} ${cx},${cy + r * (tick / 5)} ${cx - r * (tick / 5)},${cy}`}
                  fill="none"
                  stroke="#E2E1DD"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              ))}

              {/* Axis lines */}
              <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="#E2E1DD" strokeWidth="1" />
              <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="#E2E1DD" strokeWidth="1" />

              {/* Axis labels */}
              <text x={cx} y={cy - r - 8} textAnchor="middle" className="text-[10px] font-extrabold fill-black uppercase tracking-wider">Coding</text>
              <text x={cx + r + 8} y={cy + 4} textAnchor="start" className="text-[10px] font-extrabold fill-black uppercase tracking-wider">Delivery</text>
              <text x={cx} y={cy + r + 16} textAnchor="middle" className="text-[10px] font-extrabold fill-black uppercase tracking-wider">Comms</text>
              <text x={cx - r - 8} y={cy + 4} textAnchor="end" className="text-[10px] font-extrabold fill-black uppercase tracking-wider">Teamwork</text>

              {/* Polygons */}
              {/* Self */}
              <polygon points={selfPoints} fill="rgba(139, 92, 246, 0.12)" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
              {/* Peer */}
              <polygon points={peerPoints} fill="rgba(192, 217, 48, 0.15)" stroke="#C0D930" strokeWidth="2" strokeLinecap="round" />
              {/* Manager */}
              <polygon points={managerPoints} fill="rgba(26, 28, 24, 0.05)" stroke="black" strokeWidth="2" strokeLinecap="round" />

            </svg>
          </div>
        </div>

        {/* Right column: Legend & Scores card */}
        <div className="lg:col-span-5 bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-6 shadow-sm h-fit">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-3">Score Aggregates</h3>
          
          <div className="space-y-4">
            
            {/* Dimensions rating detail cards */}
            {scores.map(s => (
              <div key={s.dimension} className="bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl p-4 space-y-2.5">
                <h4 className="text-xs font-extrabold text-black uppercase tracking-wider">{s.dimension}</h4>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                  <div className="bg-white border border-[#E2E1DD] py-1.5 rounded-lg">
                    <span className="text-[8px] text-[#8C9086] uppercase block">Self</span>
                    <span className="text-black font-extrabold">{s.self.toFixed(1)}</span>
                  </div>
                  <div className="bg-white border border-[#E2E1DD] py-1.5 rounded-lg">
                    <span className="text-[8px] text-[#8C9086] uppercase block">Peer</span>
                    <span className="text-[#C0D930] font-extrabold">{s.peer.toFixed(1)}</span>
                  </div>
                  <div className="bg-white border border-[#E2E1DD] py-1.5 rounded-lg">
                    <span className="text-[8px] text-[#8C9086] uppercase block">Manager</span>
                    <span className="text-black font-extrabold">{s.manager.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}

          </div>
        </div>

      </div>

    </div>
  );
}
