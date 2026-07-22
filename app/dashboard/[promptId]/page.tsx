import { getPromptById } from "@/lib/actions/prompt";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Clock, Tag, Cpu, MessageSquare, History, ThumbsUp, ThumbsDown } from "lucide-react";
import CopyButton from "@/components/CopyButton";

export default async function PromptDetailPage({ params }: { params: Promise<{ promptId: string }> }) {
  const { promptId } = await params;
  const prompt = await getPromptById(promptId);

  if (!prompt) {
    notFound();
  }

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[var(--color-primary)] transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-[var(--color-foreground)] mb-2 break-words">
              {prompt.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                  prompt.status === "COMPLETED"
                    ? "bg-green-50 text-green-700"
                    : prompt.status === "DRAFT"
                    ? "bg-amber-50 text-amber-700"
                    : prompt.status === "IN_PROGRESS"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {prompt.status}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <Cpu size={12} />
                {prompt.model.name}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <Tag size={12} />
                {prompt.intent}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <Clock size={12} />
                {new Date(prompt.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Original Prompt */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <MessageSquare size={14} />
            Original Prompt
          </h2>
          <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
            {prompt.originalPrompt}
          </p>
        </div>

        {/* Final Prompt */}
        <div className="bg-[var(--color-foreground)] rounded-2xl p-6 shadow-sm border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-2">
              <Sparkles size={14} className="text-blue-400" />
              Optimized Prompt
            </h2>
            {prompt.finalPrompt && <CopyButton text={prompt.finalPrompt} />}
          </div>
          {prompt.finalPrompt ? (
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 overflow-auto max-h-[500px] custom-scrollbar">
              <p className="text-slate-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                {prompt.finalPrompt}
              </p>
            </div>
          ) : (
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-8 flex items-center justify-center">
              <p className="text-slate-700 text-sm italic text-center">
                No optimized prompt generated yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Interview Q&A */}
      {prompt.answers.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
            <MessageSquare size={14} />
            Interview Responses
          </h2>
          <div className="space-y-4">
            {prompt.answers.map((answer, idx) => (
              <div
                key={answer.id}
                className="border-l-2 border-[var(--color-primary)] pl-4"
              >
                <p className="text-sm font-semibold text-slate-700 mb-1">
                  {idx + 1}. {answer.question.question}
                </p>
                <p className="text-sm text-slate-600">{answer.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revision History */}
      {prompt.revisions.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
            <History size={14} />
            Revision History
          </h2>
          <div className="space-y-4">
            {prompt.revisions.map((revision) => (
              <div
                key={revision.id}
                className="border border-slate-100 rounded-xl p-4 hover:border-slate-200 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[var(--color-primary)] bg-blue-50 px-2.5 py-1 rounded-full">
                    Revision #{revision.revisionNumber}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(revision.createdAt).toLocaleString()}
                  </span>
                </div>
                {revision.additionalRequirement && (
                  <p className="text-xs text-slate-500 italic mb-2">
                    Feedback: &ldquo;{revision.additionalRequirement}&rdquo;
                  </p>
                )}
                <p className="text-sm text-slate-700 whitespace-pre-wrap line-clamp-6 font-mono bg-slate-50 p-3 rounded-lg">
                  {revision.promptText}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback History */}
      {prompt.feedbacks.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
            Feedback History
          </h2>
          <div className="flex flex-wrap gap-3">
            {prompt.feedbacks.map((fb) => (
              <div
                key={fb.id}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                  fb.isSatisfied
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : "bg-red-50 text-red-700 border border-red-100"
                }`}
              >
                {fb.isSatisfied ? <ThumbsUp size={14} /> : <ThumbsDown size={14} />}
                <span className="font-medium">
                  {fb.isSatisfied ? "Satisfied" : fb.additionalRequirement || "Rejected"}
                </span>
                <span className="text-xs opacity-60">
                  {new Date(fb.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
