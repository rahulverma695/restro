'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/StateContext';
import { 
  HelpCircle, 
  Plus, 
  Trash2, 
  CheckCircle, 
  BarChart4, 
  Users, 
  Star,
  Activity,
  Award
} from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';

interface SurveyQuestion {
  id: string;
  questionText: string;
  type: 'Text' | 'Rating' | 'NPS';
}

interface Survey {
  id: string;
  title: string;
  questions: SurveyQuestion[];
  responsesCount: number;
  npsScore: number;
  satisfactionRate: number; // in percentage
}

const initialSurveys: Survey[] = [
  {
    id: 'srv-1',
    title: 'Post-Onboarding Satisfaction Survey',
    questions: [
      { id: 'q-1', questionText: 'How would you rate the hardware terminal responsiveness?', type: 'Rating' },
      { id: 'q-2', questionText: 'How likely are you to recommend RestroPOS to other restaurant owners?', type: 'NPS' },
      { id: 'q-3', questionText: 'What features would you like to see added in future updates?', type: 'Text' }
    ],
    responsesCount: 184,
    npsScore: 68,
    satisfactionRate: 92
  }
];

export default function SurveyPage() {
  const { activeUser } = useAppState();
  const [surveys, setSurveys] = useState<Survey[]>(initialSurveys);
  const [activeSurveyId, setActiveSurveyId] = useState<string>('srv-1');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<SurveyQuestion['type']>('Rating');

  const hasAccess = ['SuperAdmin', 'HRAdmin', 'Manager', 'Employee'].includes(activeUser.role);

  if (!hasAccess) {
    return <AccessDenied suite="Marketing Hub" role={activeUser.role} />;
  }

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    const newQuestion: SurveyQuestion = {
      id: `q-${Date.now()}`,
      questionText: newQuestionText.trim(),
      type: newQuestionType
    };

    setSurveys(prev => prev.map(s => {
      if (s.id === activeSurveyId) {
        return {
          ...s,
          questions: [...s.questions, newQuestion]
        };
      }
      return s;
    }));

    setNewQuestionText('');
    setShowAddForm(false);
  };

  const removeQuestion = (qId: string) => {
    setSurveys(prev => prev.map(s => {
      if (s.id === activeSurveyId) {
        return {
          ...s,
          questions: s.questions.filter(q => q.id !== qId)
        };
      }
      return s;
    }));
  };

  const activeSurvey = surveys.find(s => s.id === activeSurveyId);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-[#F4F3EF] min-h-[calc(100vh-4rem)] select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E2E1DD] pb-4">
        <div className="flex items-center gap-3">
          <HelpCircle className="h-8 w-8 text-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)]" />
          <div>
            <h2 className="text-3xl font-extrabold text-[#1A1C18] tracking-tight">Customer Surveys — Feedback</h2>
            <p className="text-sm text-[#5E6258] mt-1">Design multi-step customer surveys, collect feedback data points, and monitor Net Promoter Score charts.</p>
          </div>
        </div>
      </div>

      {activeSurvey ? (
        /* Split layout container */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Columns: Survey Editor Canvas */}
          <div className="lg:col-span-2 bg-white border border-[#E2E1DD] rounded-2xl p-6 shadow-sm min-h-[500px] flex flex-col justify-between">
            <div className="space-y-6">
              <div className="border-b border-[#E2E1DD] pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[8px] text-[#8C9086] font-bold uppercase tracking-wider">Active Survey Form</span>
                  <h3 className="text-lg font-black text-black mt-1">{activeSurvey.title}</h3>
                </div>
                <span className="text-[9px] text-[#5E6258] font-bold bg-[#FAF9F6] border border-[#E2E1DD] px-2 py-0.5 rounded-full uppercase">
                  Template Designer
                </span>
              </div>

              {/* Questions Canvas list */}
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {activeSurvey.questions.map((q, index) => (
                  <div 
                    key={q.id}
                    className="bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl p-4 flex items-start justify-between relative hover:shadow-sm transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="h-5 w-5 bg-white border border-[#E2E1DD] rounded-full flex items-center justify-center text-[10px] font-black text-black shrink-0">
                          {index + 1}
                        </span>
                        <h4 className="text-xs font-black text-black">{q.questionText}</h4>
                      </div>

                      {/* Mock input display based on question type */}
                      {q.type === 'Rating' && (
                        <div className="flex gap-1.5 text-amber-400 pl-7">
                          {[1, 2, 3, 4, 5].map(n => <Star key={n} className="h-4.5 w-4.5 fill-current" />)}
                        </div>
                      )}

                      {q.type === 'NPS' && (
                        <div className="flex gap-1 pl-7">
                          {Array.from({ length: 11 }, (_, i) => (
                            <span 
                              key={i} 
                              className="h-6 w-6 rounded border border-[#E2E1DD] bg-white flex items-center justify-center text-[10px] text-black font-extrabold"
                            >
                              {i}
                            </span>
                          ))}
                        </div>
                      )}

                      {q.type === 'Text' && (
                        <div className="pl-7">
                          <input 
                            type="text" 
                            placeholder="Text entry field placeholder..." 
                            className="bg-white border border-[#E2E1DD] rounded-lg px-2.5 py-1.5 text-xs text-black w-72" 
                            disabled 
                          />
                        </div>
                      )}

                    </div>

                    <button
                      onClick={() => removeQuestion(q.id)}
                      className="text-[#8C9086] hover:text-red-500 transition-colors cursor-pointer"
                      title="Remove Question"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {activeSurvey.questions.length === 0 && (
                  <div className="border border-dashed border-[#E2E1DD] rounded-xl py-20 text-center text-xs text-[#8C9086] italic">
                    The Survey Canvas is empty. Add questions below.
                  </div>
                )}
              </div>
            </div>

            {/* Append Question buttons bar */}
            <div className="border-t border-[#E2E1DD] pt-4 flex justify-between items-center">
              <span className="text-[10px] text-[#8C9086] font-bold">Inject new questions onto the canvas.</span>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-1 bg-[#E1FF4B] border border-[#C0D930] hover:bg-[#d5f242] text-black font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add Question Field
              </button>
            </div>

          </div>

          {/* Right Column: NPS Analytics Panel */}
          <div className="bg-white border border-[#E2E1DD] rounded-2xl p-6 shadow-sm space-y-6 h-[550px] overflow-y-auto">
            <div className="border-b border-[#E2E1DD] pb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
                <BarChart4 className="h-4 w-4 text-[#C0D930]" /> Survey Analytics Dashboard
              </h3>
            </div>

            <div className="space-y-6">
              
              {/* Main NPS Ring */}
              <div className="flex flex-col items-center justify-center p-6 bg-[#FAF9F6] border border-[#E2E1DD] rounded-2xl text-center space-y-2 shadow-sm">
                <span className="text-[9px] text-[#8C9086] font-bold uppercase tracking-wider">Net Promoter Score (NPS)</span>
                <div className="h-24 w-24 rounded-full border-4 border-[#8B5CF6] flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-black">+{activeSurvey.npsScore}</span>
                  <span className="text-[8px] text-[#8C9086] font-bold uppercase leading-none mt-1">Excellent</span>
                </div>
                <p className="text-[10px] text-[#5E6258] font-bold mt-2 flex items-center gap-1"><Users className="h-3.5 w-3.5" /> from {activeSurvey.responsesCount} responses</p>
              </div>

              {/* Other metrics */}
              <div className="space-y-4">
                <div className="bg-[#FAF9F6] border border-[#E2E1DD] p-4 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[#5E6258] font-semibold">
                    <Award className="h-4.5 w-4.5 text-[#C0D930]" />
                    <span>Customer Satisfaction Rate</span>
                  </div>
                  <strong className="text-black font-black">{activeSurvey.satisfactionRate}%</strong>
                </div>

                <div className="bg-[#FAF9F6] border border-[#E2E1DD] p-4 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[#5E6258] font-semibold">
                    <Activity className="h-4.5 w-4.5 text-blue-500" />
                    <span>Completion Rate</span>
                  </div>
                  <strong className="text-black font-black">74%</strong>
                </div>
              </div>

            </div>
          </div>

        </div>
      ) : (
        <div className="bg-white border border-[#E2E1DD] rounded-2xl p-12 text-center text-[#8C9086] italic shadow-sm h-[600px] flex items-center justify-center">
          No survey active.
        </div>
      )}

      {/* Add Question modal dialog */}
      {showAddForm && (
        <div className="bg-white border border-[#E2E1DD] p-6 rounded-2xl shadow-md max-w-xl mx-auto space-y-4">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-[#E2E1DD] pb-2">
            Append Question to Survey
          </h3>
          <form onSubmit={handleAddQuestion} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#8C9086] uppercase">Response Format Type</label>
                <select
                  value={newQuestionType}
                  onChange={e => setNewQuestionType(e.target.value as SurveyQuestion['type'])}
                  className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black"
                >
                  <option value="Rating">Rating Scale (1-5 Stars)</option>
                  <option value="NPS">NPS Grid Scale (0-10)</option>
                  <option value="Text">Short Text Response Box</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#8C9086] uppercase">Question Copy Text</label>
                <input
                  type="text"
                  placeholder="e.g. How was our checkout speed?"
                  value={newQuestionText}
                  onChange={e => setNewQuestionText(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#E2E1DD] rounded-xl px-3 py-2 text-xs text-black font-bold"
                  required
                />
              </div>
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
                Append Question
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
