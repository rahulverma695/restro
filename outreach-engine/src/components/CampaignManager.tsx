'use client';

import { useState, useRef } from 'react';
import { 
  createCampaign, 
  toggleCampaign, 
  deleteCampaign, 
  saveSequenceStep, 
  deleteSequenceStep, 
  uploadLeadList 
} from '@/app/campaigns/actions';
import { 
  Send, 
  Users, 
  Plus, 
  Trash2, 
  FileText, 
  CheckCircle, 
  Clock, 
  Settings2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

interface CampaignRow {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  list_name: string;
  lead_count: number;
  lead_list_id: string | null;
}

interface LeadListRow {
  id: string;
  name: string;
  lead_count: number;
}

interface StepRow {
  id: string;
  campaign_id: string;
  step_number: number;
  delay_days: number;
  subject_template: string;
  body_template: string;
}

interface CampaignManagerProps {
  campaigns: CampaignRow[];
  leadLists: LeadListRow[];
  sequenceSteps: StepRow[];
}

export default function CampaignManager({
  campaigns,
  leadLists,
  sequenceSteps,
}: CampaignManagerProps) {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'sequences'>('campaigns');
  
  // Tab 1 States
  const [newCampaignName, setNewCampaignName] = useState('');
  const [selectedListId, setSelectedListId] = useState('');
  const [newListName, setNewListName] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<'idle' | 'parsing' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab 2 States
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id || '');
  const [editingStepNum, setEditingStepNum] = useState<number | null>(null);
  const [stepSubject, setStepSubject] = useState('');
  const [stepBody, setStepBody] = useState('');
  const [stepDelay, setStepDelay] = useState(3);

  const activeCampaign = campaigns.find(c => c.id === selectedCampaignId);
  const activeSteps = sequenceSteps
    .filter(s => s.campaign_id === selectedCampaignId)
    .sort((a, b) => a.step_number - b.step_number);

  // Parse CSV client-side
  const handleCSVUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile || !newListName) return;

    setUploadProgress('parsing');
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        
        if (lines.length < 2) {
          throw new Error('CSV file must contain a header row and at least one lead row.');
        }

        // Clean headers and match fields
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"_]/g, ''));
        const emailIdx = headers.findIndex(h => h.includes('email') || h === 'mail');
        const fNameIdx = headers.findIndex(h => h.includes('first') || h === 'firstname');
        const lNameIdx = headers.findIndex(h => h.includes('last') || h === 'lastname');
        const companyIdx = headers.findIndex(h => h.includes('company') || h.includes('organization'));
        const websiteIdx = headers.findIndex(h => h.includes('website') || h.includes('site') || h === 'url');

        if (emailIdx === -1) {
          throw new Error('Could not find an "email" header field in your CSV file.');
        }

        const leads: any[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          // Quick split that handles quotes loosely
          const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(cell => cell.replace(/^"|"$/g, '').trim());
          if (row.length <= emailIdx || !row[emailIdx]) continue;

          leads.push({
            email: row[emailIdx],
            first_name: fNameIdx !== -1 ? row[fNameIdx] : undefined,
            last_name: lNameIdx !== -1 ? row[lNameIdx] : undefined,
            company_name: companyIdx !== -1 ? row[companyIdx] : undefined,
            website: websiteIdx !== -1 ? row[websiteIdx] : undefined,
          });
        }

        if (leads.length === 0) {
          throw new Error('No valid rows with email addresses found.');
        }

        setUploadProgress('uploading');
        const res = await uploadLeadList(newListName, leads);

        if (res.success) {
          setUploadProgress('success');
          setNewListName('');
          setCsvFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        } else {
          throw new Error(res.error || 'Failed to save leads to database');
        }

      } catch (err: any) {
        setUploadProgress('error');
        setErrorMsg(err.message || 'Error processing file');
      }
    };

    reader.readAsText(csvFile);
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName) return;
    const res = await createCampaign(newCampaignName, selectedListId);
    if (res.success) {
      setNewCampaignName('');
      setSelectedListId('');
    }
  };

  const handleSaveStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignId || editingStepNum === null) return;

    const res = await saveSequenceStep(
      selectedCampaignId,
      editingStepNum,
      stepDelay,
      stepSubject,
      stepBody
    );

    if (res.success) {
      setEditingStepNum(null);
      setStepSubject('');
      setStepBody('');
      setStepDelay(3);
    }
  };

  const startNewStep = () => {
    const nextNum = activeSteps.length > 0 ? activeSteps[activeSteps.length - 1].step_number + 1 : 1;
    setEditingStepNum(nextNum);
    setStepSubject('');
    setStepBody('');
    setStepDelay(nextNum === 1 ? 0 : 3); // step 1 starts immediately (0 delay)
  };

  return (
    <div className="space-y-8">
      {/* Navigation Tabs */}
      <div className="flex border-b border-[#1E293B] gap-6">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`pb-4 text-sm font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'campaigns'
              ? 'text-[#6366F1] border-b-2 border-[#6366F1]'
              : 'text-[#475569] hover:text-[#94A3B8]'
          }`}
        >
          <Layers className="h-4 w-4" /> Campaigns & Lists
        </button>
        <button
          onClick={() => setActiveTab('sequences')}
          className={`pb-4 text-sm font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'sequences'
              ? 'text-[#6366F1] border-b-2 border-[#6366F1]'
              : 'text-[#475569] hover:text-[#94A3B8]'
          }`}
        >
          <Clock className="h-4 w-4" /> Email Sequences
        </button>
      </div>

      {/* Tab 1: Campaigns & Lists */}
      {activeTab === 'campaigns' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Columns: Campaigns Table & Lists Table */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Campaigns Table */}
            <div className="bg-[#090D1A] border border-[#1E293B] rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Active Campaigns</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#1E293B] text-xs font-semibold uppercase tracking-wider text-[#475569]">
                      <th className="py-3 px-4">Campaign Name</th>
                      <th className="py-3 px-4">Assigned List</th>
                      <th className="py-3 px-4">Leads</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]/40 text-sm">
                    {campaigns.map((c) => (
                      <tr key={c.id} className="hover:bg-[#1E293B]/10">
                        <td className="py-3.5 px-4 font-medium text-white">{c.name}</td>
                        <td className="py-3.5 px-4 text-xs text-[#94A3B8]">{c.list_name || 'No list linked'}</td>
                        <td className="py-3.5 px-4 text-xs text-white font-bold">{c.lead_count || 0}</td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => toggleCampaign(c.id, !c.is_active)}
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              c.is_active 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-[#1E293B] text-[#475569] border border-[#1E293B]'
                            }`}
                          >
                            {c.is_active ? 'Sending' : 'Inactive'}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedCampaignId(c.id);
                              setActiveTab('sequences');
                            }}
                            className="text-xs font-semibold text-[#6366F1] hover:text-[#8B5CF6] transition-colors bg-[#6366F1]/10 px-2 py-1 rounded"
                          >
                            Build Sequence
                          </button>
                          <button 
                            onClick={() => deleteCampaign(c.id)}
                            className="text-[#475569] hover:text-rose-400 transition-colors p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {campaigns.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-sm text-[#475569]">
                          No campaigns created yet. Build one on the right dashboard!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Lead Lists Table */}
            <div className="bg-[#090D1A] border border-[#1E293B] rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Imported Lead Lists</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#1E293B] text-xs font-semibold uppercase tracking-wider text-[#475569]">
                      <th className="py-3 px-4">List Name</th>
                      <th className="py-3 px-4">Contact Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]/40 text-sm">
                    {leadLists.map((l) => (
                      <tr key={l.id} className="hover:bg-[#1E293B]/10">
                        <td className="py-3.5 px-4 font-medium text-white">{l.name}</td>
                        <td className="py-3.5 px-4 text-xs text-[#94A3B8]">{l.lead_count} leads</td>
                      </tr>
                    ))}
                    {leadLists.length === 0 && (
                      <tr>
                        <td colSpan={2} className="py-8 text-center text-sm text-[#475569]">
                          No contact lists imported yet. Upload a CSV file on the right panel.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right Col: Forms */}
          <div className="space-y-6">
            
            {/* Create Campaign */}
            <div className="bg-[#090D1A] border border-[#1E293B] rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Create Outbound Campaign</h3>
              <form onSubmit={handleCreateCampaign} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#94A3B8]">Campaign Name</label>
                  <input
                    type="text"
                    required
                    value={newCampaignName}
                    onChange={(e) => setNewCampaignName(e.target.value)}
                    placeholder="e.g. Agency Outreach Q3"
                    className="w-full bg-[#030712] border border-[#1E293B] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6366F1] transition-colors"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#94A3B8]">Link Lead List</label>
                  <select
                    value={selectedListId}
                    onChange={(e) => setSelectedListId(e.target.value)}
                    className="w-full bg-[#030712] border border-[#1E293B] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6366F1] transition-colors"
                  >
                    <option value="">-- No list linked (Select later) --</option>
                    {leadLists.map(l => (
                      <option key={l.id} value={l.id}>{l.name} ({l.lead_count} contacts)</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-sm font-semibold text-white rounded-xl hover:from-[#4F46E5] hover:to-[#7C3AED] transition-colors"
                >
                  <Plus className="h-4 w-4" /> Create Campaign
                </button>
              </form>
            </div>

            {/* CSV Lead Uploader */}
            <div className="bg-[#090D1A] border border-[#1E293B] rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Import Leads (CSV)</h3>
              <p className="text-xs text-[#94A3B8]">
                Upload CSV files exported from Apollo/LinkedIn. The headers will map automatically (email is required).
              </p>
              
              <form onSubmit={handleCSVUpload} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#94A3B8]">List Name</label>
                  <input
                    type="text"
                    required
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="e.g. Apollo CEOs Bengaluru"
                    className="w-full bg-[#030712] border border-[#1E293B] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6366F1] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#94A3B8]">CSV File</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    required
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                    className="w-full bg-[#030712] border border-[#1E293B] rounded-xl px-4 py-2 text-xs text-white file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-[#1E293B] file:text-white hover:file:bg-[#2E3C51]"
                  />
                </div>

                {uploadProgress === 'parsing' && <p className="text-xs text-indigo-400">Parsing file fields...</p>}
                {uploadProgress === 'uploading' && <p className="text-xs text-indigo-400 animate-pulse">Saving contacts to Neon...</p>}
                {uploadProgress === 'success' && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="h-4.5 w-4.5" /> List uploaded successfully!
                  </p>
                )}
                {uploadProgress === 'error' && (
                  <p className="text-xs text-rose-400 border border-rose-500/20 bg-rose-500/5 p-2 rounded">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={uploadProgress === 'parsing' || uploadProgress === 'uploading'}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1E293B] border border-[#2E3C51] text-xs font-semibold text-white rounded-xl hover:bg-[#2E3C51] transition-colors disabled:opacity-50"
                >
                  <FileText className="h-4 w-4" /> Import Contacts
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* Tab 2: Sequence Builder */}
      {activeTab === 'sequences' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Col: Step Builder / Editor */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#090D1A] border border-[#1E293B] rounded-2xl p-6 space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Sequence steps for: {activeCampaign?.name || 'No Campaign Selected'}</h3>
                  <p className="text-xs text-[#94A3B8]">Create sequence templates. Steps will wait for their respective delay days before firing.</p>
                </div>
                {!editingStepNum && (
                  <button
                    onClick={startNewStep}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#6366F1] text-xs font-semibold text-white hover:bg-[#4F46E5] transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Step
                  </button>
                )}
              </div>

              {/* Editing Step Form */}
              {editingStepNum !== null && (
                <form onSubmit={handleSaveStep} className="space-y-4 p-5 bg-[#030712] rounded-xl border border-indigo-500/20">
                  <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                    <span className="text-sm font-bold text-[#6366F1]">Configuring Step {editingStepNum}</span>
                    <button 
                      type="button" 
                      onClick={() => setEditingStepNum(null)}
                      className="text-xs text-[#475569] hover:text-[#94A3B8]"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-[#94A3B8]">Subject Template</label>
                      <input 
                        type="text" 
                        required
                        value={stepSubject}
                        onChange={(e) => setStepSubject(e.target.value)}
                        placeholder="e.g. Quick question for {{first_name}} at {{company_name}}"
                        className="w-full bg-[#090D1A] border border-[#1E293B] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6366F1]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#94A3B8]">Delay (Days since last send)</label>
                      <input 
                        type="number" 
                        required
                        min="0"
                        value={stepDelay}
                        onChange={(e) => setStepDelay(parseInt(e.target.value) || 0)}
                        placeholder="e.g. 3"
                        className="w-full bg-[#090D1A] border border-[#1E293B] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6366F1]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-[#94A3B8]">Email Body Template (HTML supported)</label>
                      <span className="text-[10px] text-[#475569]">Supports placeholder: {"{{first_name}}, {{company_name}}"}</span>
                    </div>
                    <textarea 
                      required
                      rows={8}
                      value={stepBody}
                      onChange={(e) => setStepBody(e.target.value)}
                      placeholder="Hi {{first_name}},\n\nSaw your website at {{website}}..."
                      className="w-full bg-[#090D1A] border border-[#1E293B] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6366F1] font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-xs font-semibold text-white rounded-lg transition-colors"
                  >
                    Save Step Template
                  </button>
                </form>
              )}

              {/* Timeline list of steps */}
              {activeSteps.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-[#1E293B] rounded-2xl">
                  <Calendar className="h-8 w-8 text-[#475569] mx-auto mb-2" />
                  <p className="text-sm text-[#475569]">No sequence steps configured. Click Add Step to write your first email.</p>
                </div>
              ) : (
                <div className="relative border-l border-[#1E293B] ml-4 space-y-8 pl-6">
                  {activeSteps.map((step) => (
                    <div key={step.id} className="relative group">
                      
                      {/* Timeline dot */}
                      <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#090D1A] border border-[#1E293B] group-hover:border-[#6366F1] transition-colors">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#475569] group-hover:bg-[#6366F1]"></span>
                      </span>

                      <div className="bg-[#030712] border border-[#1E293B] group-hover:border-[#2E3C51] rounded-xl p-5 space-y-3 transition-colors">
                        
                        {/* Step metadata */}
                        <div className="flex items-center justify-between border-b border-[#1E293B] pb-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white bg-[#1E293B] px-2 py-0.5 rounded text-[10px]">Step {step.step_number}</span>
                            <span className="text-[#94A3B8] font-medium flex items-center gap-1">
                              <Clock className="h-3 w-3" /> 
                              {step.step_number === 1 ? 'Starts immediately' : `Waits ${step.delay_days} days after previous step`}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingStepNum(step.step_number);
                                setStepSubject(step.subject_template);
                                setStepBody(step.body_template);
                                setStepDelay(step.delay_days);
                              }}
                              className="text-xs text-[#6366F1] hover:text-[#8B5CF6] transition-colors"
                            >
                              Edit Template
                            </button>
                            <button
                              onClick={() => deleteSequenceStep(step.id)}
                              className="text-xs text-[#475569] hover:text-rose-400 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* Subject */}
                        <div className="space-y-0.5">
                          <p className="text-[10px] uppercase font-bold text-[#475569] tracking-wider">Subject Line</p>
                          <p className="text-sm font-semibold text-white">{step.subject_template}</p>
                        </div>

                        {/* Body Preview */}
                        <div className="space-y-0.5">
                          <p className="text-[10px] uppercase font-bold text-[#475569] tracking-wider">Message Content</p>
                          <pre className="text-xs text-[#94A3B8] font-sans whitespace-pre-line truncate max-h-24 overflow-hidden border border-[#1E293B]/20 p-2.5 bg-[#090D1A] rounded-lg">
                            {step.body_template}
                          </pre>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>

          {/* Right Col: Campaign Selector */}
          <div className="bg-[#090D1A] border border-[#1E293B] rounded-2xl p-6 space-y-4 h-fit">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-[#6366F1]" /> Active Settings
            </h3>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#94A3B8]">Select Campaign to Edit</label>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="w-full bg-[#030712] border border-[#1E293B] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6366F1] transition-colors"
              >
                {campaigns.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
                {campaigns.length === 0 && (
                  <option value="">No campaigns available</option>
                )}
              </select>
            </div>

            {activeCampaign && (
              <div className="pt-4 border-t border-[#1E293B] space-y-3 text-xs text-[#94A3B8]">
                <div className="flex justify-between">
                  <span>Linked List:</span>
                  <span className="font-semibold text-white">{activeCampaign.list_name || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Leads:</span>
                  <span className="font-semibold text-white">{activeCampaign.lead_count} contacts</span>
                </div>
                <div className="flex justify-between">
                  <span>Sequence Steps:</span>
                  <span className="font-semibold text-white">{activeSteps.length} email templates</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
