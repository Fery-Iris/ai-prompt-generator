"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, ArrowRight, MessageSquare, Wand2, ThumbsUp, ThumbsDown, Save } from "lucide-react";
import { useCompletion } from "@ai-sdk/react";
import { detectIntentAndGenerateQuestions, submitAnswersAndGetPromptData, submitFeedbackAndRevise, saveFinalPrompt } from "@/lib/actions/flow";

type WizardStage = "INPUT" | "DETECTING" | "INTERVIEW" | "GENERATING" | "REVIEW" | "SAVING";

export default function PromptWizard({ models }: { models: any[] }) {
  const router = useRouter();
  
  // State
  const [stage, setStage] = useState<WizardStage>("INPUT");
  const [modelId, setModelId] = useState(models.length > 0 ? models[0].id : "");
  const [originalPrompt, setOriginalPrompt] = useState("");
  
  const [promptId, setPromptId] = useState("");
  const [intent, setIntent] = useState("");
  const [questions, setQuestions] = useState<{id: string, text: string}[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  const [feedbackHistory, setFeedbackHistory] = useState<string[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState("");
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState("");

  const { completion, complete, isLoading: isGenerating, setCompletion } = useCompletion({
    api: "/api/refine",
    streamProtocol: "text",
  });

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalPrompt.trim() || !modelId) return;
    
    setErrorMsg("");
    setStage("DETECTING");
    
    const res = await detectIntentAndGenerateQuestions(originalPrompt, modelId);
    if (res.error || !res.promptId) {
      setErrorMsg(res.error || "Failed to detect intent.");
      setStage("INPUT");
      return;
    }
    
    setPromptId(res.promptId);
    setIntent(res.intent || "");
    setQuestions(res.questions || []);
    setStage("INTERVIEW");
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmitInterview = async () => {
    // Validate all questions are answered
    for (const q of questions) {
      if (!answers[q.id]?.trim()) {
        setErrorMsg("Please answer all follow-up questions to get the best result.");
        return;
      }
    }
    
    setErrorMsg("");
    setStage("GENERATING");
    
    const res = await submitAnswersAndGetPromptData(promptId, answers);
    if (res.error || !res.prompt) {
      setErrorMsg(res.error || "Failed to save answers.");
      setStage("INTERVIEW");
      return;
    }
    
    // Start streaming generation
    setCompletion("");
    await complete(originalPrompt, {
      body: { 
        intent, 
        answers: res.prompt.answers,
        previousFeedback: []
      }
    });
    
    setStage("REVIEW");
  };

  const handleSatisfied = async () => {
    setStage("SAVING");
    const title = `Prompt: ${intent}`;
    await submitFeedbackAndRevise(promptId, true);
    await saveFinalPrompt(promptId, completion, feedbackHistory.length + 1, title);
    router.push("/dashboard");
  };

  const handleNotSatisfied = () => {
    setShowFeedbackInput(true);
  };

  const submitFeedback = async () => {
    if (!currentFeedback.trim()) return;
    
    setStage("GENERATING");
    setShowFeedbackInput(false);
    
    // Save rejection in db
    await submitFeedbackAndRevise(promptId, false, currentFeedback);
    
    const newFeedbackHistory = [...feedbackHistory, currentFeedback];
    setFeedbackHistory(newFeedbackHistory);
    setCurrentFeedback("");
    
    // Fetch answers again to pass to stream
    const res = await submitAnswersAndGetPromptData(promptId, answers);
    
    setCompletion("");
    await complete(originalPrompt, {
      body: { 
        intent, 
        answers: res?.prompt?.answers || [],
        previousFeedback: newFeedbackHistory
      }
    });
    
    setStage("REVIEW");
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
      
      {/* Left Column: Interactive Flow */}
      <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col border-r border-slate-100">
        
        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 mb-6">
            {errorMsg}
          </div>
        )}

        {/* STAGE: INPUT */}
        {stage === "INPUT" && (
          <form onSubmit={handleStart} className="flex flex-col flex-1">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MessageSquare size={20} className="text-[var(--color-primary)]" />
              1. What do you want to create?
            </h2>
            
            <div className="space-y-4 flex-1">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Target AI Model</label>
                <select
                  value={modelId}
                  onChange={(e) => setModelId(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
                  required
                >
                  {models.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1 flex flex-col">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Simple Prompt</label>
                <textarea
                  value={originalPrompt}
                  onChange={(e) => setOriginalPrompt(e.target.value)}
                  placeholder="e.g. Write an email for marketing..."
                  className="w-full flex-1 min-h-[150px] px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all resize-none"
                  required
                />
              </div>
            </div>

            <button type="submit" className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white rounded-xl font-semibold hover:opacity-90 transition-all">
              Next Step <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* STAGE: DETECTING */}
        {stage === "DETECTING" && (
          <div className="flex flex-col flex-1 items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-blue-50 text-[var(--color-primary)] rounded-full flex items-center justify-center">
              <Loader2 size={32} className="animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Analyzing Intent...</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2">We are analyzing your prompt to generate personalized follow-up questions.</p>
            </div>
          </div>
        )}

        {/* STAGE: INTERVIEW */}
        {stage === "INTERVIEW" && (
          <div className="flex flex-col flex-1">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-blue-50 text-[var(--color-primary)] text-xs font-bold rounded-full mb-3 uppercase tracking-wide">Intent: {intent}</span>
              <h2 className="text-xl font-bold text-slate-900 mb-2">2. Let's dig deeper</h2>
              <p className="text-sm text-slate-500">Answer these questions to help the AI craft the perfect prompt.</p>
            </div>
            
            <div className="space-y-6 overflow-auto custom-scrollbar flex-1 pr-2">
              {questions.map((q, idx) => (
                <div key={q.id}>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{idx + 1}. {q.text}</label>
                  <input
                    type="text"
                    value={answers[q.id] || ""}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    placeholder="Your answer..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
                  />
                </div>
              ))}
            </div>

            <button onClick={handleSubmitInterview} className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all">
              <Wand2 size={18} /> Generate Prompt
            </button>
          </div>
        )}

        {/* STAGE: GENERATING & REVIEW */}
        {(stage === "GENERATING" || stage === "REVIEW" || stage === "SAVING") && (
          <div className="flex flex-col flex-1 justify-center">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles size={20} className="text-[var(--color-primary)]" />
              3. Review & Refine
            </h2>
            
            {stage === "GENERATING" ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 size={32} className="animate-spin text-[var(--color-primary)]" />
                <p className="text-sm font-medium text-slate-500">Crafting your optimized prompt...</p>
              </div>
            ) : stage === "SAVING" ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 size={32} className="animate-spin text-[var(--color-primary)]" />
                <p className="text-sm font-medium text-slate-500">Saving to library...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-sm text-slate-600">Are you satisfied with the generated prompt on the right?</p>
                
                {!showFeedbackInput ? (
                  <div className="flex gap-4">
                    <button onClick={handleSatisfied} className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-50 text-green-700 border border-green-200 rounded-xl font-semibold hover:bg-green-100 transition-all">
                      <ThumbsUp size={18} /> Yes, Save it!
                    </button>
                    <button onClick={handleNotSatisfied} className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-700 border border-red-200 rounded-xl font-semibold hover:bg-red-100 transition-all">
                      <ThumbsDown size={18} /> No, Refine it
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <label className="block text-sm font-semibold text-slate-700">What needs to be changed?</label>
                    <textarea
                      value={currentFeedback}
                      onChange={(e) => setCurrentFeedback(e.target.value)}
                      placeholder="e.g. Make it sound more professional, add a section for constraints..."
                      className="w-full min-h-[100px] px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all resize-none"
                    />
                    <div className="flex gap-3">
                      <button onClick={() => setShowFeedbackInput(false)} className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-all">
                        Cancel
                      </button>
                      <button onClick={submitFeedback} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-semibold hover:bg-blue-700 transition-all">
                        <Wand2 size={16} /> Regenerate
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Column: AI Output */}
      <div className="w-full md:w-1/2 bg-[var(--color-foreground)] p-6 sm:p-8 flex flex-col border-t md:border-t-0 border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white flex items-center gap-2">
            <Sparkles size={16} className="text-blue-400" />
            Optimized Prompt
          </h3>
          {(stage === "GENERATING" || isGenerating) && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
          )}
        </div>
        
        <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-6 overflow-auto custom-scrollbar relative">
          {completion ? (
            <div className="text-slate-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
              {completion}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-700 text-sm italic p-8 text-center">
              The AI generated prompt will appear here once you complete the interview steps.
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
