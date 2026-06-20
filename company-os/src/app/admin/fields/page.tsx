'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/StateContext';
import { Sliders, PlusCircle, ShieldAlert, ClipboardList, Settings } from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

export default function FieldsPage() {
  const { activeUser, customFieldsSchema, addCustomFieldSchema } = useAppState();

  // New field states
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState<'text' | 'dropdown'>('text');
  const [optionsStr, setOptionsStr] = useState('');

  const hasAccess = activeUser.role === 'SuperAdmin';

  if (!hasAccess) {
    return <AccessDenied suite="Command Center" role={activeUser.role} />;
  }

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldName.trim()) return;

    let options: string[] | undefined = undefined;
    if (fieldType === 'dropdown') {
      options = optionsStr.split(',').map(o => o.trim()).filter(o => o.length > 0);
      if (options.length === 0) {
        alert('Please specify at least one dropdown option.');
        return;
      }
    }

    addCustomFieldSchema(fieldName.trim(), fieldType, options);
    setFieldName('');
    setOptionsStr('');
    alert(`Custom profile field "${fieldName}" injected successfully!`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none bg-[#F4F3EF] min-h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#E2E1DD] pb-4">
        <Sliders className="h-8 w-8 text-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)]" />
        <div>
          <h2 className="text-3xl font-extrabold text-[#1A1C18] tracking-tight">Profile Fields Generator</h2>
          <p className="text-sm text-[#5E6258] mt-1">SuperAdmin console to dynamically inject custom data fields and metadata rules into employee profiles.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form */}
        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 shadow-sm h-fit space-y-4">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2 border-b border-[#E2E1DD] pb-2">
            <PlusCircle className="h-4 w-4 text-[#C0D930]" /> Inject Custom Field
          </h3>

          <form onSubmit={handleAddField} className="space-y-4 text-xs font-semibold">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-[#5E6258]">Field Name (Key)</label>
              <input 
                type="text" 
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                required
                placeholder="e.g. GitHub Username..."
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-[#5E6258]">Input Value Type</label>
              <select
                value={fieldType}
                onChange={(e) => setFieldType(e.target.value as any)}
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3 py-2 text-xs text-black focus:outline-none transition-all"
              >
                <option value="text">Plain Text Input</option>
                <option value="dropdown">Selection Dropdown</option>
              </select>
            </div>

            {fieldType === 'dropdown' && (
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-[#5E6258]">Dropdown Options (Comma-separated)</label>
                <input 
                  type="text" 
                  value={optionsStr}
                  onChange={(e) => setOptionsStr(e.target.value)}
                  required
                  placeholder="e.g. Option A, Option B, Option C..."
                  className="w-full bg-[#FAF9F6] border border-[#E2E1DD] focus:border-[#C0D930] rounded-xl px-3 py-2 text-xs text-black placeholder-[#8C9086] focus:outline-none transition-all"
                />
              </div>
            )}

            <button 
              type="submit"
              className="w-full py-2.5 bg-black hover:bg-black/90 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
            >
              Inject Profile Field Schema
            </button>
          </form>
        </div>

        {/* Right Column: Schema List */}
        <div className="lg:col-span-2 bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E2E1DD] pb-3">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-[#8B5CF6]" /> Current Injected Custom Schema Fields
            </h3>
            <span className="text-[9px] text-[#5E6258] font-bold bg-[#FAF9F6] border border-[#E2E1DD] px-2.5 py-0.5 rounded-full uppercase">
              {customFieldsSchema.length} Injected
            </span>
          </div>

          <div className="space-y-3">
            {customFieldsSchema.map((field) => (
              <div 
                key={field.id} 
                className="bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs"
              >
                <div className="space-y-1">
                  <h4 className="font-extrabold text-black">{field.name}</h4>
                  <p className="text-[8px] text-[#8C9086] font-mono leading-none uppercase">ID: {field.id} • Type: {field.type}</p>
                </div>

                {field.options && (
                  <div className="flex flex-wrap gap-1.5 shrink-0 max-w-sm sm:max-w-md mt-2 sm:mt-0">
                    {field.options.map((opt, idx) => (
                      <span key={idx} className="bg-white border border-[#E2E1DD] text-[#5E6258] px-2.5 py-0.5 rounded text-[8px] font-bold">
                        {opt}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
