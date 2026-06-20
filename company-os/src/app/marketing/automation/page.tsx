'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/StateContext';
import { 
  Network, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Play,
  RotateCw,
  GitCommit,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

interface JourneyNode {
  id: string;
  type: 'Trigger' | 'Action' | 'Condition' | 'Outcome';
  label: string;
  desc: string;
  contactsCount: number;
  icon: any;
  connections: string[]; // next node IDs
}

const initialNodes: JourneyNode[] = [
  { id: 'node-1', type: 'Trigger', label: 'User Sign Up / Registration', desc: 'Triggers when a new account is registered', contactsCount: 1540, icon: Sparkles, connections: ['node-2'] },
  { id: 'node-2', type: 'Action', label: 'Send Welcome Email', desc: 'Dispatches standard intro newsletter', contactsCount: 1540, icon: Mail, connections: ['node-3'] },
  { id: 'node-3', type: 'Condition', label: 'Opened Email within 3 Days?', desc: 'Splits path based on message open state', contactsCount: 1210, icon: GitCommit, connections: ['node-4', 'node-5'] },
  { id: 'node-4', type: 'Outcome', label: 'Yes: Send Promo Voucher SMS', desc: 'Delivers 20% coupon code via mobile API', contactsCount: 780, icon: Smartphone, connections: [] },
  { id: 'node-5', type: 'Outcome', label: 'No: Send Follow-up Reminder', desc: 'Dispatches gentle check-in email', contactsCount: 430, icon: Mail, connections: [] }
];

export default function AutomationPage() {
  const { activeUser } = useAppState();
  const [nodes, setNodes] = useState<JourneyNode[]>(initialNodes);
  const [activeNodeId, setActiveNodeId] = useState<string>('node-3');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNodeType, setNewNodeType] = useState<JourneyNode['type']>('Action');
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeDesc, setNewNodeDesc] = useState('');

  const hasAccess = ['SuperAdmin', 'HRAdmin', 'Manager', 'Employee'].includes(activeUser.role);

  if (!hasAccess) {
    return <AccessDenied suite="Marketing Hub" role={activeUser.role} />;
  }

  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeLabel) return;

    const iconsMap: Record<JourneyNode['type'], any> = {
      Trigger: Sparkles,
      Action: Mail,
      Condition: GitCommit,
      Outcome: Smartphone
    };

    const node: JourneyNode = {
      id: `node-${Date.now()}`,
      type: newNodeType,
      label: newNodeLabel,
      desc: newNodeDesc,
      contactsCount: 0,
      icon: iconsMap[newNodeType],
      connections: []
    };

    // If there is an active node selected, append the new node to its connections
    if (activeNodeId) {
      setNodes(prev => prev.map(n => {
        if (n.id === activeNodeId) {
          return { ...n, connections: [...n.connections, node.id] };
        }
        return n;
      }));
    }

    setNodes(prev => [...prev, node]);
    setActiveNodeId(node.id);
    setNewNodeLabel('');
    setNewNodeDesc('');
    setShowAddForm(false);
  };

  const deleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id).map(n => ({
      ...n,
      connections: n.connections.filter(cId => cId !== id)
    })));
    if (activeNodeId === id) {
      setActiveNodeId(nodes.find(n => n.id !== id)?.id || '');
    }
  };

  const activeNode = nodes.find(n => n.id === activeNodeId);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-[#F4F3EF] min-h-[calc(100vh-4rem)] select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E2E1DD] pb-4">
        <div className="flex items-center gap-3">
          <Network className="h-8 w-8 text-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)]" />
          <div>
            <h2 className="text-3xl font-extrabold text-[#1A1C18] tracking-tight">Marketing Automation — Customer Journeys</h2>
            <p className="text-sm text-[#5E6258] mt-1">Design visual customer workflows, automate drip marketing sequences, and check contact volume metrics.</p>
          </div>
        </div>
      </div>

      {/* Main split-view workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Visual Flowchart Canvas */}
        <div className="lg:col-span-2 bg-white border border-[#E2E1DD] rounded-2xl p-6 shadow-sm min-h-[500px] flex flex-col justify-between">
          <div className="space-y-6">
            <div className="border-b border-[#E2E1DD] pb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
                <Play className="h-4 w-4 text-[#C0D930]" /> Interactive Workflow Journey Map
              </h3>
              <span className="text-[9px] text-[#5E6258] font-bold bg-[#FAF9F6] border border-[#E2E1DD] px-2.5 py-0.5 rounded-full uppercase">
                Campaign Builder
              </span>
            </div>

            {/* Vertical Flowchart layout */}
            <div className="flex flex-col items-center gap-6 overflow-y-auto max-h-[400px] py-4">
              {nodes.filter(n => n.type === 'Trigger' || n.type === 'Action' || n.type === 'Condition').map((node, index) => {
                const NodeIcon = node.icon;
                const isActive = activeNodeId === node.id;
                return (
                  <React.Fragment key={node.id}>
                    {/* Node block */}
                    <div className="flex items-center gap-4 w-full max-w-lg">
                      <button
                        type="button"
                        onClick={() => setActiveNodeId(node.id)}
                        className={`flex-1 text-left p-4 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                          isActive 
                            ? 'bg-[#FAF9F6] border-[#8B5CF6] shadow-sm border-l-4 border-l-[#8B5CF6]' 
                            : 'bg-transparent border-[#E2E1DD] hover:bg-[#FAF9F6]/55'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                            node.type === 'Trigger' ? 'bg-[#E1FF4B]/20 text-[#C0D930]' : 'bg-[#8B5CF6]/15 text-[#8B5CF6]'
                          }`}>
                            <NodeIcon className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <span className="text-[8px] text-[#8C9086] font-bold uppercase tracking-wider">{node.type}</span>
                            <h4 className="text-xs font-black text-black leading-tight mt-0.5">{node.label}</h4>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-black text-[#5E6258]">{node.contactsCount} leads</span>
                        </div>
                      </button>

                      <button
                        onClick={() => deleteNode(node.id)}
                        className="text-[#8C9086] hover:text-red-500 transition-colors cursor-pointer"
                        title="Delete Step"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Connecting arrow, conditional branches if it is a condition */}
                    {node.type === 'Condition' ? (
                      <div className="flex gap-16 justify-center w-full max-w-lg relative border-t border-[#E2E1DD] pt-4 my-2">
                        {node.connections.map(cId => {
                          const cNode = nodes.find(n => n.id === cId);
                          if (!cNode) return null;
                          const CNodeIcon = cNode.icon;
                          const isCActive = activeNodeId === cNode.id;
                          return (
                            <button
                              key={cId}
                              type="button"
                              onClick={() => setActiveNodeId(cId)}
                              className={`p-3 rounded-xl border text-left flex flex-col justify-between w-44 h-20 transition-all cursor-pointer ${
                                isCActive 
                                  ? 'bg-[#FAF9F6] border-[#8B5CF6] shadow-sm' 
                                  : 'bg-transparent border-[#E2E1DD] hover:bg-[#FAF9F6]/55'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="text-[8px] text-[#8C9086] font-bold uppercase">Outcome</span>
                                <CNodeIcon className="h-3.5 w-3.5 text-[#8B5CF6]" />
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-black leading-tight truncate">{cNode.label}</p>
                                <p className="text-[9px] text-[#8C9086] font-bold mt-1">{cNode.contactsCount} leads</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      index < nodes.filter(n => n.type === 'Trigger' || n.type === 'Action' || n.type === 'Condition').length - 1 && (
                        <div className="h-6 w-[1px] bg-[#E2E1DD] relative flex items-center justify-center">
                          <ArrowRight className="h-3.5 w-3.5 rotate-90 text-[#8C9086] absolute" />
                        </div>
                      )
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Quick add action at the bottom of the map */}
          <div className="border-t border-[#E2E1DD] pt-4 flex justify-between items-center">
            <span className="text-[10px] text-[#8C9086] font-bold">Select a node above, then append a child node.</span>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1 bg-[#E1FF4B] border border-[#C0D930] hover:bg-[#d5f242] text-black font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Append Node Step
            </button>
          </div>
        </div>

        {/* Right Column: Node Details & Metrics */}
        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 shadow-sm space-y-6 h-[550px] overflow-y-auto">
          {activeNode ? (
            <div className="space-y-6">
              <div className="border-b border-[#E2E1DD] pb-3">
                <span className="text-[9px] text-[#8B5CF6] font-extrabold bg-[#8B5CF6]/10 px-2.5 py-0.5 rounded-full uppercase">
                  {activeNode.type} Properties
                </span>
                <h3 className="text-md font-black text-black mt-2">{activeNode.label}</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[8px] text-[#8C9086] font-bold uppercase">Description</span>
                  <p className="text-xs text-[#5E6258] font-bold mt-1">{activeNode.desc || 'No description logged.'}</p>
                </div>

                <div className="bg-[#FAF9F6] border border-[#E2E1DD] p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8C9086] font-bold">Active Contacts Count</span>
                    <strong className="text-black font-extrabold">{activeNode.contactsCount} Leads</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8C9086] font-bold">Conversion Rate</span>
                    <strong className="text-[#C0D930] font-extrabold">
                      {activeNode.contactsCount > 0 ? Math.round((activeNode.contactsCount / 1540) * 100) : 0}%
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-[#8C9086] italic py-20 flex items-center justify-center h-full">
              Select a node on the journey canvas to edit configurations.
            </div>
          )}
        </div>

      </div>

      {/* Add Node form Modal */}
      {showAddForm && (
        <div className="bg-white border border-[#E2E1DD] p-6 rounded-2xl shadow-md max-w-xl mx-auto space-y-4">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-2">
            Append Journey Node to Workflow
          </h3>
          <form onSubmit={handleAddNode} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#8C9086] uppercase">Node Category Type</label>
                <select
                  value={newNodeType}
                  onChange={e => setNewNodeType(e.target.value as JourneyNode['type'])}
                  className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black"
                >
                  <option value="Action">Action (e.g. Send Email/SMS)</option>
                  <option value="Condition">Condition (e.g. Opened Email?)</option>
                  <option value="Outcome">Outcome (e.g. Yes/No Branches)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#8C9086] uppercase">Node Headline Label</label>
                <input
                  type="text"
                  placeholder="e.g. Send SMS coupon"
                  value={newNodeLabel}
                  onChange={e => setNewNodeLabel(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-[#8C9086] uppercase">Description / Operational details</label>
              <textarea
                placeholder="Workflow action specifications..."
                value={newNodeDesc}
                onChange={e => setNewNodeDesc(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black h-20 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-[#E2E1DD] pt-3">
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
                Append Node
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
