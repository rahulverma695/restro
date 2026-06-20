'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/StateContext';
import { 
  Briefcase, 
  Plus, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  DollarSign, 
  MessageSquare,
  Search,
  Trash2
} from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

interface Contact {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  dealValue: number;
  notes: string[];
}

const initialContacts: Contact[] = [
  { id: 'c-1', name: 'Robert Downey', company: 'Stark Food Chains', email: 'robert@starkfoods.com', phone: '+1 (555) 902-8273', dealValue: 12000, notes: ['Interested in tablet terminals.', 'Wants a demo of checkout flows next Tuesday.'] },
  { id: 'c-2', name: 'Alice Cooper', company: 'Cooper Diner', email: 'alice@cooperdiner.com', phone: '+1 (555) 123-4567', dealValue: 4500, notes: ['Looking for simple shifts tracker.', 'Slight budget constraints.'] },
  { id: 'c-3', name: 'Bruce Wayne', company: 'Gotham Hotels', email: 'bruce@wayneenterprises.com', phone: '+1 (555) 987-6543', dealValue: 95000, notes: ['High priority prospect.', 'Requested detailed API schema docs for room bookings integration.'] }
];

export default function BiginPage() {
  const { activeUser } = useAppState();
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState<Omit<Contact, 'id' | 'notes'>>({
    name: '',
    company: '',
    email: '',
    phone: '',
    dealValue: 0
  });
  const [selectedContactId, setSelectedContactId] = useState<string>(initialContacts[0]?.id || '');
  const [newNote, setNewNote] = useState('');

  const hasAccess = ['SuperAdmin', 'HRAdmin', 'Manager', 'Employee'].includes(activeUser.role);

  if (!hasAccess) {
    return <AccessDenied suite="Sales CRM" role={activeUser.role} />;
  }

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name || !newContact.company) return;

    const contact: Contact = {
      ...newContact,
      id: `c-${Date.now()}`,
      notes: []
    };

    setContacts(prev => [...prev, contact]);
    setSelectedContactId(contact.id);
    setNewContact({ name: '', company: '', email: '', phone: '', dealValue: 0 });
    setShowAddForm(false);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !selectedContactId) return;

    setContacts(prev => prev.map(c => {
      if (c.id === selectedContactId) {
        return { ...c, notes: [newNote.trim(), ...c.notes] };
      }
      return c;
    }));
    setNewNote('');
  };

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    if (selectedContactId === id) {
      setSelectedContactId(contacts.find(c => c.id !== id)?.id || '');
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeContact = contacts.find(c => c.id === selectedContactId);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-[#F4F3EF] min-h-[calc(100vh-4rem)] select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E2E1DD] pb-4">
        <div className="flex items-center gap-3">
          <Briefcase className="h-8 w-8 text-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)]" />
          <div>
            <h2 className="text-3xl font-extrabold text-[#1A1C18] tracking-tight">Pipeline Deals — Contact CRM</h2>
            <p className="text-sm text-[#5E6258] mt-1">Pipeline-centric contact manager and quick communication touchpoint logs for sales reps.</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-[#E1FF4B] border border-[#C0D930] hover:bg-[#d5f242] text-black font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Contact
        </button>
      </div>

      {/* Main Split View Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Contact List */}
        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-5 space-y-4 shadow-sm h-[600px] flex flex-col">
          <div className="flex items-center justify-between border-b border-[#E2E1DD] pb-3">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider">Contacts</h3>
            <span className="text-[9px] text-[#5E6258] font-bold bg-[#FAF9F6] border border-[#E2E1DD] px-2 py-0.5 rounded-full uppercase">
              {contacts.length} Total
            </span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8C9086]" />
            <input
              type="text"
              placeholder="Search contacts or companies..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl pl-9 pr-4 py-2 text-xs text-black"
            />
          </div>

          {/* Contact scroll container */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredContacts.map(c => (
              <div
                key={c.id}
                onClick={() => setSelectedContactId(c.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                  selectedContactId === c.id
                    ? 'bg-[#FAF9F6] border-[#8B5CF6]/30 shadow-sm border-l-4 border-l-[#8B5CF6]'
                    : 'bg-transparent border-transparent hover:bg-[#FAF9F6]/55 hover:border-[#E2E1DD]'
                }`}
              >
                <div>
                  <h4 className="text-xs font-black text-black">{c.name}</h4>
                  <p className="text-[10px] text-[#8C9086] font-bold mt-0.5">{c.company}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-[#8B5CF6]">${c.dealValue.toLocaleString()}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteContact(c.id);
                    }}
                    className="text-[#8C9086] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Contact"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {filteredContacts.length === 0 && (
              <p className="text-xs text-[#8C9086] italic text-center py-12">No contacts match the search filters.</p>
            )}
          </div>
        </div>

        {/* Right Columns: Detail Workspace & Touchpoint Notes */}
        <div className="lg:col-span-2 space-y-6">
          {activeContact ? (
            <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 shadow-sm space-y-6">
              
              {/* Contact info header */}
              <div className="flex items-start justify-between border-b border-[#E2E1DD] pb-5">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-[#8B5CF6]/10 rounded-2xl flex items-center justify-center text-[#8B5CF6]">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-black">{activeContact.name}</h3>
                    <p className="text-xs text-[#5E6258] font-bold mt-0.5 flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" /> {activeContact.company}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[8px] text-[#8C9086] font-black uppercase">Associated Deal Value</span>
                  <p className="text-lg font-black text-[#8B5CF6]">${activeContact.dealValue.toLocaleString()}</p>
                </div>
              </div>

              {/* Grid with Details and Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Contact Coordinates */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-2">
                    Contact Coordinates
                  </h4>
                  <div className="space-y-3 text-xs text-[#5E6258]">
                    <div className="flex items-center gap-2.5">
                      <Mail className="h-4 w-4 text-[#8C9086]" />
                      <span className="font-semibold">{activeContact.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="h-4 w-4 text-[#8C9086]" />
                      <span className="font-semibold">{activeContact.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Add Quick note */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-2">
                    Log Touchpoint Note
                  </h4>
                  <form onSubmit={handleAddNote} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Sent pricing catalog..."
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      className="flex-1 bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-[#E1FF4B] border border-[#C0D930] hover:bg-[#d5f242] text-black font-extrabold text-xs px-4 rounded-xl shadow-sm transition-colors cursor-pointer"
                    >
                      Log
                    </button>
                  </form>
                </div>

              </div>

              {/* Touchpoint Timeline */}
              <div className="space-y-4 border-t border-[#E2E1DD] pt-5">
                <h4 className="text-[10px] font-black text-black uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[#C0D930]" /> Interaction Timeline
                </h4>
                
                <div className="space-y-3 pl-2">
                  {activeContact.notes.map((note, index) => (
                    <div key={index} className="flex gap-3 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C0D930] mt-1.5 shrink-0" />
                      <div className="bg-[#FAF9F6] border border-[#E2E1DD] p-3 rounded-xl flex-1 text-black font-semibold">
                        {note}
                      </div>
                    </div>
                  ))}
                  {activeContact.notes.length === 0 && (
                    <p className="text-xs text-[#8C9086] italic py-4">No interactions logged yet for this contact.</p>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-[#E2E1DD] rounded-2xl p-12 text-center text-[#8C9086] italic shadow-sm h-[600px] flex items-center justify-center">
              Select or add a contact to open CRM workspace.
            </div>
          )}
        </div>

      </div>

      {/* Add Contact Form Dialog Overlay */}
      {showAddForm && (
        <div className="bg-white border border-[#E2E1DD] p-6 rounded-2xl shadow-md max-w-xl mx-auto space-y-4">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-2">
            Create New CRM Contact
          </h3>
          <form onSubmit={handleAddContact} className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-[#8C9086] uppercase">Full Name</label>
              <input 
                type="text" 
                placeholder="Name"
                value={newContact.name}
                onChange={e => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-[#8C9086] uppercase">Company</label>
              <input 
                type="text" 
                placeholder="Company Name"
                value={newContact.company}
                onChange={e => setNewContact(prev => ({ ...prev, company: e.target.value }))}
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-[#8C9086] uppercase">Email</label>
              <input 
                type="email" 
                placeholder="email@example.com"
                value={newContact.email}
                onChange={e => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-[#8C9086] uppercase">Phone</label>
              <input 
                type="text" 
                placeholder="Phone number"
                value={newContact.phone}
                onChange={e => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-[9px] font-bold text-[#8C9086] uppercase">Deal Pipeline Value ($)</label>
              <input 
                type="number" 
                placeholder="e.g. 5000"
                value={newContact.dealValue || ''}
                onChange={e => setNewContact(prev => ({ ...prev, dealValue: Number(e.target.value) }))}
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black"
              />
            </div>
            <div className="col-span-2 flex justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="text-xs text-[#8C9086] bg-[#FAF9F6] border border-[#E2E1DD] px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="text-xs text-black bg-[#E1FF4B] border border-[#C0D930] px-4 py-2 rounded-xl font-bold"
              >
                Add Contact
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
