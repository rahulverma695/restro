'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/StateContext';
import { 
  Sliders, 
  Plus, 
  Trash2, 
  Eye, 
  Database, 
  CheckSquare, 
  Type, 
  Mail, 
  List, 
  HelpCircle,
  Copy,
  ChevronRight
} from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'textarea' | 'dropdown';
  placeholder?: string;
  options?: string[];
}

interface FormSubmission {
  id: string;
  formName: string;
  timestamp: string;
  data: Record<string, string>;
}

const initialFields: FormField[] = [
  { id: 'f-1', label: 'Full Name', type: 'text', placeholder: 'Enter your name' },
  { id: 'f-2', label: 'Email Address', type: 'email', placeholder: 'your.email@example.com' },
  { id: 'f-3', label: 'Customer Feedback', type: 'textarea', placeholder: 'Tell us about your experience' }
];

const initialSubmissions: FormSubmission[] = [
  { id: 'sub-1', formName: 'Customer Feedback Form', timestamp: '2026-06-15, 11:20 AM', data: { 'Full Name': 'David Clark', 'Email Address': 'david@clarkcorp.com', 'Customer Feedback': 'The POS terminal layout is incredibly fast. Loving the light theme!' } },
  { id: 'sub-2', formName: 'Customer Feedback Form', timestamp: '2026-06-15, 10:05 AM', data: { 'Full Name': 'Alice Wonderland', 'Email Address': 'alice@wonderland.net', 'Customer Feedback': 'Requesting custom analytics exports in CSV format. Thanks!' } }
];

export default function FormsPage() {
  const { activeUser } = useAppState();
  const [fields, setFields] = useState<FormField[]>(initialFields);
  const [submissions, setSubmissions] = useState<FormSubmission[]>(initialSubmissions);
  const [activeTab, setActiveTab] = useState<'editor' | 'database'>('editor');
  const [formName, setFormName] = useState('Customer Feedback Form');

  const hasAccess = ['SuperAdmin', 'HRAdmin', 'Manager', 'Employee'].includes(activeUser.role);

  if (!hasAccess) {
    return <AccessDenied suite="Customer Touchpoints" role={activeUser.role} />;
  }

  // Field Manipulation Actions
  const addField = (type: FormField['type']) => {
    const defaultLabels: Record<FormField['type'], string> = {
      text: 'Text Label',
      email: 'Email Field',
      textarea: 'Comments Area',
      dropdown: 'Select Option'
    };

    const newField: FormField = {
      id: `field-${Date.now()}`,
      label: defaultLabels[type],
      type,
      placeholder: `Enter your ${type === 'dropdown' ? 'selection' : 'input'}`,
      options: type === 'dropdown' ? ['Option A', 'Option B', 'Option C'] : undefined
    };

    setFields(prev => [...prev, newField]);
  };

  const removeField = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
  };

  const updateFieldLabel = (id: string, newLabel: string) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, label: newLabel } : f));
  };

  const updateFieldPlaceholder = (id: string, newPlaceholder: string) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, placeholder: newPlaceholder } : f));
  };

  // Compile a mock submission based on current form layout
  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData: Record<string, string> = {};
    fields.forEach(f => {
      formData[f.label] = f.type === 'dropdown' ? (f.options?.[0] || 'Default') : `${f.label} test value`;
    });

    const newSub: FormSubmission = {
      id: `sub-${Date.now()}`,
      formName,
      timestamp: new Date().toLocaleString(),
      data: formData
    };

    setSubmissions(prev => [newSub, ...prev]);
    alert('Mock form submitted! You can check it in the Submissions Database tab.');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-[#F4F3EF] min-h-[calc(100vh-4rem)] select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E2E1DD] pb-4">
        <div className="flex items-center gap-3">
          <Sliders className="h-8 w-8 text-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)]" />
          <div>
            <h2 className="text-3xl font-extrabold text-[#1A1C18] tracking-tight">Form Builder</h2>
            <p className="text-sm text-[#5E6258] mt-1">Interactive drag-and-click custom forms editor and compiled submissions database ledger.</p>
          </div>
        </div>

        {/* Tab Swappers */}
        <div className="flex bg-[#EAE8E3] border border-[#E2E1DD] p-1 rounded-xl shadow-inner gap-1">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black tracking-wide cursor-pointer transition-colors ${
              activeTab === 'editor'
                ? 'bg-white text-black border border-[#E2E1DD] shadow-sm font-extrabold'
                : 'text-[#5E6258] hover:text-black'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" /> Form Creator
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black tracking-wide cursor-pointer transition-colors ${
              activeTab === 'database'
                ? 'bg-white text-black border border-[#E2E1DD] shadow-sm font-extrabold'
                : 'text-[#5E6258] hover:text-black'
            }`}
          >
            <Database className="h-3.5 w-3.5" /> Submissions Database
          </button>
        </div>
      </div>

      {activeTab === 'editor' ? (
        /* Form Editor Split Layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Panel: Field toolbox selection */}
          <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between h-[550px]">
            <div className="space-y-4">
              <div className="border-b border-[#E2E1DD] pb-3">
                <h3 className="text-xs font-bold text-black uppercase tracking-wider">Field Toolbox</h3>
                <p className="text-[10px] text-[#8C9086] mt-1">Click a field below to add it onto the custom form canvas.</p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => addField('text')}
                  className="flex items-center gap-3 w-full bg-[#FAF9F6] border border-[#E2E1DD] hover:border-[#8B5CF6]/30 px-4 py-3 rounded-xl text-left text-xs text-black font-extrabold shadow-sm transition-colors cursor-pointer"
                >
                  <Type className="h-4.5 w-4.5 text-[#8B5CF6]" /> Short Text Entry Field
                </button>
                <button
                  onClick={() => addField('email')}
                  className="flex items-center gap-3 w-full bg-[#FAF9F6] border border-[#E2E1DD] hover:border-[#8B5CF6]/30 px-4 py-3 rounded-xl text-left text-xs text-black font-extrabold shadow-sm transition-colors cursor-pointer"
                >
                  <Mail className="h-4.5 w-4.5 text-blue-500" /> Email Address Input
                </button>
                <button
                  onClick={() => addField('textarea')}
                  className="flex items-center gap-3 w-full bg-[#FAF9F6] border border-[#E2E1DD] hover:border-[#8B5CF6]/30 px-4 py-3 rounded-xl text-left text-xs text-black font-extrabold shadow-sm transition-colors cursor-pointer"
                >
                  <CheckSquare className="h-4.5 w-4.5 text-[#C0D930]" /> Long Comments Textarea
                </button>
                <button
                  onClick={() => addField('dropdown')}
                  className="flex items-center gap-3 w-full bg-[#FAF9F6] border border-[#E2E1DD] hover:border-[#8B5CF6]/30 px-4 py-3 rounded-xl text-left text-xs text-black font-extrabold shadow-sm transition-colors cursor-pointer"
                >
                  <List className="h-4.5 w-4.5 text-amber-500" /> Dropdown Selection Selector
                </button>
              </div>
            </div>

            <div className="bg-[#FAF9F6] border border-[#E2E1DD] p-4 rounded-xl space-y-2">
              <span className="text-[9px] font-bold text-[#8C9086] uppercase">Active Form Name</span>
              <input
                type="text"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                className="w-full bg-white border border-[#E2E1DD] rounded-lg px-2.5 py-1.5 text-xs text-black font-bold"
              />
            </div>
          </div>

          {/* Right Panel: Form canvas layout */}
          <div className="lg:col-span-2 bg-white border border-[#E2E1DD] rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[550px]">
            <div className="space-y-6">
              
              {/* Form Title Preview */}
              <div className="border-b border-[#E2E1DD] pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-black">{formName}</h3>
                  <p className="text-[10px] text-[#8C9086] mt-0.5 font-bold uppercase">Public URL Simulator</p>
                </div>
                <span className="text-[9px] text-emerald-600 font-extrabold bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full uppercase">
                  Active
                </span>
              </div>

              {/* Dynamic canvas fields list */}
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {fields.map((field) => (
                  <div 
                    key={field.id}
                    className="bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl p-4 space-y-3 relative hover:shadow-sm transition-all"
                  >
                    <button
                      onClick={() => removeField(field.id)}
                      className="absolute top-4 right-4 text-[#8C9086] hover:text-red-500 transition-colors cursor-pointer"
                      title="Remove Field"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Edit Field label */}
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-[#8C9086] uppercase">Field Label</label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={e => updateFieldLabel(field.id, e.target.value)}
                          className="w-full bg-white border border-[#E2E1DD] rounded-lg px-2.5 py-1 text-xs text-black font-bold"
                        />
                      </div>

                      {/* Edit Field placeholder */}
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-[#8C9086] uppercase">Placeholder / Description</label>
                        <input
                          type="text"
                          value={field.placeholder || ''}
                          onChange={e => updateFieldPlaceholder(field.id, e.target.value)}
                          className="w-full bg-white border border-[#E2E1DD] rounded-lg px-2.5 py-1 text-xs text-black"
                        />
                      </div>
                    </div>

                    {/* Canvas Input Preview */}
                    <div className="border-t border-[#E2E1DD]/50 pt-2 flex items-center justify-between text-[9px] text-[#8C9086] uppercase">
                      <span>Field Type: <strong className="text-black font-bold">{field.type}</strong></span>
                    </div>
                  </div>
                ))}

                {fields.length === 0 && (
                  <div className="border border-dashed border-[#E2E1DD] rounded-xl py-20 text-center text-xs text-[#8C9086] italic">
                    The Form Canvas is empty. Click fields in the toolbox to build your form.
                  </div>
                )}
              </div>
            </div>

            {/* Test submission action */}
            {fields.length > 0 && (
              <form onSubmit={handleTestSubmit} className="border-t border-[#E2E1DD] pt-4 flex justify-end">
                <button
                  type="submit"
                  className="bg-[#E1FF4B] border border-[#C0D930] hover:bg-[#d5f242] text-black font-black text-xs px-6 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Test Mock Form Submission
                </button>
              </form>
            )}

          </div>

        </div>
      ) : (
        /* Submissions Database view */
        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 space-y-6 shadow-sm min-h-[550px]">
          <div className="border-b border-[#E2E1DD] pb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider">Submissions Database Ledger</h3>
            <span className="text-[9px] text-[#5E6258] font-bold bg-[#FAF9F6] border border-[#E2E1DD] px-2.5 py-0.5 rounded-full uppercase">
              {submissions.length} total packets
            </span>
          </div>

          <div className="space-y-4">
            {submissions.map((sub) => (
              <div 
                key={sub.id} 
                className="bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-[#E2E1DD]/70 pb-2">
                  <h4 className="text-xs font-black text-black">{sub.formName}</h4>
                  <span className="text-[9px] text-[#8C9086] font-mono">{sub.timestamp}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(sub.data).map(([fieldLabel, value]) => (
                    <div key={fieldLabel} className="space-y-1 text-xs">
                      <span className="text-[8px] text-[#8C9086] font-bold uppercase">{fieldLabel}</span>
                      <p className="font-semibold text-black leading-relaxed">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {submissions.length === 0 && (
              <p className="text-xs text-[#8C9086] italic text-center py-20">No customer data packets submitted yet.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
