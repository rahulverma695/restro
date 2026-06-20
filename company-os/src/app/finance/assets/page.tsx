'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/StateContext';
import { Briefcase, Laptop, Plus, CheckCircle, AlertTriangle, Monitor } from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

interface Asset {
  id: string;
  name: string;
  serialNumber: string;
  category: 'laptop' | 'monitor' | 'accessory' | 'tablet';
  assignee: string;
  status: 'assigned' | 'available' | 'maintenance';
}

const initialAssets: Asset[] = [
  { id: 'as01', name: 'MacBook Pro 16"', serialNumber: 'SN-MBP-98321', category: 'laptop', assignee: 'John Doe', status: 'assigned' },
  { id: 'as02', name: 'Dell UltraSharp 27" 4K Monitor', serialNumber: 'SN-DEL-45129', category: 'monitor', assignee: 'John Doe', status: 'assigned' },
  { id: 'as03', name: 'ThinkPad X1 Carbon', serialNumber: 'SN-TPK-00921', category: 'laptop', assignee: 'Nikhil Bhaviyavar', status: 'assigned' },
  { id: 'as04', name: 'iPad Pro 12.9" M2', serialNumber: 'SN-IPD-77291', category: 'tablet', assignee: 'Jane Smith', status: 'assigned' },
  { id: 'as05', name: 'Logitech MX Master 3S Mouse', serialNumber: 'SN-LOG-33019', category: 'accessory', assignee: 'Nikhil Bhaviyavar', status: 'assigned' },
  { id: 'as06', name: 'Dell UltraSharp 32" Curved', serialNumber: 'SN-DEL-99210', category: 'monitor', assignee: 'None', status: 'available' },
  { id: 'as07', name: 'Keychron K3 Keyboard', serialNumber: 'SN-KEY-88231', category: 'accessory', assignee: 'John Doe', status: 'assigned' },
  { id: 'as08', name: 'Framework Laptop 16', serialNumber: 'SN-FRM-12290', category: 'laptop', assignee: 'Alex Johnson', status: 'assigned' },
  { id: 'as09', name: 'YubiKey 5C NFC (2x Pack)', serialNumber: 'SN-YUB-01123', category: 'accessory', assignee: 'Alex Johnson', status: 'assigned' },
  { id: 'as10', name: 'Mac Studio M2 Max', serialNumber: 'SN-MCS-44912', category: 'laptop', assignee: 'None', status: 'maintenance' },
];

export default function HardwareAssetsPage() {
  const { activeUser } = useAppState();
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [filter, setFilter] = useState<string>('all');
  
  // Create Asset Form States
  const [name, setName] = useState('');
  const [sn, setSn] = useState('');
  const [cat, setCat] = useState<Asset['category']>('laptop');
  const [status, setStatus] = useState<Asset['status']>('available');
  const [assignee, setAssignee] = useState('');

  // RBAC validation check
  const hasAccess = activeUser.role === 'SuperAdmin' || activeUser.role === 'Manager';
  if (!hasAccess) {
    return <AccessDenied suite="Financial Ledger" role={activeUser.role} />;
  }

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sn) return;
    const newAsset: Asset = {
      id: `as_${Date.now()}`,
      name,
      serialNumber: sn,
      category: cat,
      assignee: assignee || 'None',
      status,
    };
    setAssets(prev => [...prev, newAsset]);
    setName('');
    setSn('');
    setAssignee('');
  };

  const filteredAssets = assets.filter(a => filter === 'all' || a.status === filter);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E1DD] pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-black tracking-tight flex items-center gap-3">
            <Laptop className="h-8 w-8 text-[#3CD070] shadow-sm" />
            Hardware Asset Inventory
          </h2>
          <p className="text-sm text-[#5E6258] mt-1">Audit company hardware inventory logs, assign devices, and manage repairs.</p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2">
          {['all', 'assigned', 'available', 'maintenance'].map(opt => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase border tracking-wider transition-all ${
                filter === opt
                  ? 'bg-[#E1FF4B] border-[#C0D930] text-[#3CD070] shadow-sm'
                  : 'bg-[#FAF9F6] border-[#E2E1DD] text-[#5E6258] hover:text-black'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Asset Table */}
        <div className="lg:col-span-3 bg-white border border-[#E2E1DD] border border-[#E2E1DD] rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider">Asset Register ({filteredAssets.length})</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E1DD] text-[9px] font-bold uppercase tracking-wider text-[#5E6258]">
                  <th className="py-2.5 px-3">Asset</th>
                  <th className="py-2.5 px-3">Serial Number</th>
                  <th className="py-2.5 px-3">Assignee</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E1DD]/40 text-xs text-[#5E6258]">
                {filteredAssets.map(asset => {
                  let badge = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                  if (asset.status === 'assigned') {
                    badge = 'bg-black hover:bg-black/90/10 text-[#00E5FF] border border-[#00E5FF]/20';
                  } else if (asset.status === 'maintenance') {
                    badge = 'bg-[#FF3E3E]/10 text-[#FF3E3E] border border-[#FF3E3E]/20';
                  }

                  return (
                    <tr key={asset.id} className="hover:bg-[#FAF9F6]">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-black flex items-center gap-1.5">
                          <Monitor className="h-3.5 w-3.5 text-[#3CD070]" />
                          {asset.name}
                        </div>
                        <span className="text-[8px] text-[#5E6258] font-extrabold uppercase">{asset.category}</span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[10px] text-black">{asset.serialNumber}</td>
                      <td className="py-3.5 px-3">
                        {asset.assignee === 'None' ? <span className="text-[#5E6258] italic">Warehouse</span> : asset.assignee}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${badge}`}>
                          {asset.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Provision Form */}
        <div className="bg-white border border-[#E2E1DD] border border-[#E2E1DD] rounded-2xl p-5 h-fit space-y-4">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
            <Plus className="h-4 w-4 text-[#3CD070]" /> Register Device
          </h3>
          
          <form onSubmit={handleCreateAsset} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-[#5E6258]">Device Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Dell U2723QE, iPad..."
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-[#5E6258]">Serial Number</label>
              <input 
                type="text" 
                value={sn}
                onChange={(e) => setSn(e.target.value)}
                required
                placeholder="SN-XXX-XXXX..."
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-[#5E6258]">Category</label>
              <select 
                value={cat}
                onChange={(e) => setCat(e.target.value as any)}
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-[#C0D930]"
              >
                <option value="laptop">Laptops / MacBooks</option>
                <option value="monitor">Screens & Displays</option>
                <option value="accessory">Accessory Kits</option>
                <option value="tablet">Mobile Tablets</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-[#5E6258]">Status</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-[#C0D930]"
              >
                <option value="available">Warehouse (Available)</option>
                <option value="assigned">Assigned Staff</option>
                <option value="maintenance">Maintenance Repair</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-[#5E6258]">Assignee Staff Name</label>
              <input 
                type="text" 
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="None..."
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none transition-all"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-2 bg-black hover:bg-black/90 hover:bg-black hover:bg-black/90/80 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-sm"
            >
              Log Hardware Asset
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
