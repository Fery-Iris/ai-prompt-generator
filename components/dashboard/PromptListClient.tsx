"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  Search,
  Clock,
  FileText,
  Trash2,
  Copy,
  Check,
  LayoutGrid,
  List,
  ArrowUpDown,
  Filter,
  CheckSquare,
  Square,
  Sparkles,
  AlertTriangle,
  X,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { deletePromptAction, deleteMultiplePromptsAction } from "@/lib/actions/prompt";

interface PromptItem {
  id: string;
  title: string;
  intent: string;
  originalPrompt: string;
  finalPrompt: string | null;
  status: "DRAFT" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  model: {
    id: string;
    name: string;
  };
}

interface PromptListClientProps {
  initialPrompts: PromptItem[];
}

export default function PromptListClient({ initialPrompts }: PromptListClientProps) {
  const router = router_or_fallback();
  const [prompts, setPrompts] = useState<PromptItem[]>(initialPrompts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedModel, setSelectedModel] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title_asc" | "title_desc">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Selection state for bulk operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Modal & Deletion states
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    targetId?: string;
    isBulk?: boolean;
    title?: string;
  }>({ isOpen: false });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function router_or_fallback() {
    try {
      return useRouter();
    } catch {
      return null;
    }
  }

  // Extract unique model names for filter dropdown
  const uniqueModels = useMemo(() => {
    const modelsSet = new Set<string>();
    initialPrompts.forEach((p) => {
      if (p.model?.name) modelsSet.add(p.model.name);
    });
    return Array.from(modelsSet);
  }, [initialPrompts]);

  // Compute metrics summary
  const metrics = useMemo(() => {
    const total = prompts.length;
    const completed = prompts.filter((p) => p.status === "COMPLETED").length;
    const drafts = prompts.filter((p) => p.status === "DRAFT" || p.status === "IN_PROGRESS").length;
    return { total, completed, drafts };
  }, [prompts]);

  // Filtered & Sorted prompts
  const filteredPrompts = useMemo(() => {
    return prompts
      .filter((prompt) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = prompt.title.toLowerCase().includes(q);
          const matchesIntent = prompt.intent.toLowerCase().includes(q);
          const matchesModel = prompt.model?.name?.toLowerCase().includes(q) || false;
          if (!matchesTitle && !matchesIntent && !matchesModel) return false;
        }

        // Status filter
        if (selectedStatus !== "ALL" && prompt.status !== selectedStatus) {
          return false;
        }

        // Model filter
        if (selectedModel !== "ALL" && prompt.model?.name !== selectedModel) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === "title_asc") {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === "title_desc") {
          return b.title.localeCompare(a.title);
        }
        return 0;
      });
  }, [prompts, searchQuery, selectedStatus, selectedModel, sortBy]);

  // Handle Copy Prompt
  const handleCopy = (e: React.MouseEvent, prompt: PromptItem) => {
    e.stopPropagation();
    e.preventDefault();
    const textToCopy = prompt.finalPrompt || prompt.originalPrompt;
    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy);
    setCopiedId(prompt.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Selection toggle
  const toggleSelectPrompt = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredPrompts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPrompts.map((p) => p.id));
    }
  };

  // Open single delete modal
  const openSingleDeleteModal = (e: React.MouseEvent, prompt: PromptItem) => {
    e.stopPropagation();
    e.preventDefault();
    setDeleteModal({
      isOpen: true,
      targetId: prompt.id,
      isBulk: false,
      title: prompt.title,
    });
  };

  // Open bulk delete modal
  const openBulkDeleteModal = () => {
    if (selectedIds.length === 0) return;
    setDeleteModal({
      isOpen: true,
      isBulk: true,
      title: `${selectedIds.length} prompt terpilih`,
    });
  };

  // Execute Deletion
  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteModal.isBulk) {
        const res = await deleteMultiplePromptsAction(selectedIds);
        if (res.success) {
          setPrompts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
          setSelectedIds([]);
          setIsSelectMode(false);
        }
      } else if (deleteModal.targetId) {
        const idToDelete = deleteModal.targetId;
        const res = await deletePromptAction(idToDelete);
        if (res.success) {
          setPrompts((prev) => prev.filter((p) => p.id !== idToDelete));
          setSelectedIds((prev) => prev.filter((id) => id !== idToDelete));
        }
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
      setDeleteModal({ isOpen: false });
      if (router) {
        startTransition(() => {
          router.refresh();
        });
      }
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("ALL");
    setSelectedModel("ALL");
    setSortBy("newest");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            My Prompts
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[var(--color-primary)] border border-blue-100">
              {metrics.total}
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola, sortir, dan akses prompt yang telah Anda buat secara interaktif.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => {
              setIsSelectMode(!isSelectMode);
              if (isSelectMode) setSelectedIds([]);
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-xl border transition-all ${
              isSelectMode
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {isSelectMode ? <CheckSquare size={16} /> : <Square size={16} />}
            {isSelectMode ? "Selesai Pilih" : "Pilih Beberapa"}
          </button>

          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white bg-[var(--color-primary)] hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95"
          >
            <PlusCircle size={18} />
            Create New
          </Link>
        </div>
      </div>

      {/* Metrics Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[var(--color-primary)] flex items-center justify-center font-bold">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Prompt</p>
              <p className="text-xl font-bold text-slate-900">{metrics.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Selesai (Completed)</p>
              <p className="text-xl font-bold text-emerald-600">{metrics.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Draf & In Progress</p>
              <p className="text-xl font-bold text-amber-600">{metrics.drafts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls Toolbar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan judul, intent, atau model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[var(--color-primary)] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200/60"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter & Sort Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700">
              <Filter size={14} className="text-slate-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent border-none outline-none text-xs font-semibold text-slate-800 cursor-pointer pr-1"
              >
                <option value="ALL">Semua Status</option>
                <option value="COMPLETED">Completed</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>

            {/* Model Filter */}
            {uniqueModels.length > 1 && (
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700">
                <Sparkles size={14} className="text-slate-400" />
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs font-semibold text-slate-800 cursor-pointer pr-1"
                >
                  <option value="ALL">Semua Model</option>
                  {uniqueModels.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700">
              <ArrowUpDown size={14} className="text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none outline-none text-xs font-semibold text-slate-800 cursor-pointer pr-1"
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="title_asc">Judul (A - Z)</option>
                <option value="title_desc">Judul (Z - A)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 ml-auto sm:ml-0">
              <button
                onClick={() => setViewMode("grid")}
                title="Tampilan Grid"
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                title="Tampilan List"
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk action floating/sticky strip when items selected */}
        {isSelectMode && (
          <div className="flex items-center justify-between bg-blue-50/80 border border-blue-200/80 rounded-xl px-4 py-2 text-xs text-slate-800 transition-all animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <button
                onClick={handleSelectAll}
                className="font-semibold text-blue-700 hover:underline flex items-center gap-1.5"
              >
                {selectedIds.length === filteredPrompts.length ? (
                  <CheckSquare size={14} />
                ) : (
                  <Square size={14} />
                )}
                {selectedIds.length === filteredPrompts.length
                  ? "Batal Pilih Semua"
                  : "Pilih Semua (" + filteredPrompts.length + ")"}
              </button>
              <span className="text-slate-400">|</span>
              <span className="font-medium text-slate-700">
                {selectedIds.length} prompt terpilih
              </span>
            </div>

            {selectedIds.length > 0 && (
              <button
                onClick={openBulkDeleteModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-all shadow-xs"
              >
                <Trash2 size={13} />
                Hapus Terpilih ({selectedIds.length})
              </button>
            )}
          </div>
        )}
      </div>

      {/* Prompts Display (Grid / List / Empty) */}
      {filteredPrompts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 mx-auto bg-slate-100/80 rounded-2xl flex items-center justify-center text-slate-400">
            {prompts.length === 0 ? <FileText size={32} /> : <Search size={32} />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {prompts.length === 0 ? "Belum ada prompt" : "Tidak ditemukan prompt yang cocok"}
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              {prompts.length === 0
                ? "Mulai buat prompt AI pertama Anda yang telah dioptimalkan dengan generator cerdas kami."
                : "Coba ubah kata kunci pencarian atau reset filter untuk menampilkan prompt Anda."}
            </p>
          </div>

          <div className="pt-2">
            {prompts.length === 0 ? (
              <Link
                href="/dashboard/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-[var(--color-primary)] hover:bg-blue-700 transition-all shadow-sm"
              >
                <PlusCircle size={18} />
                Buat Prompt Pertama
              </Link>
            ) : (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                <RefreshCw size={15} />
                Reset Semua Filter
              </button>
            )}
          </div>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPrompts.map((prompt) => {
            const isSelected = selectedIds.includes(prompt.id);
            const isCompleted = prompt.status === "COMPLETED";

            return (
              <div
                key={prompt.id}
                onClick={() => {
                  if (isSelectMode) {
                    toggleSelectPrompt({} as any, prompt.id);
                  }
                }}
                className={`group relative bg-white border rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between hover:shadow-md ${
                  isSelected
                    ? "border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/20 shadow-sm"
                    : "border-slate-200/90 hover:border-slate-300"
                }`}
              >
                <div>
                  {/* Top Bar: Status + Model + Multi-select check */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      {isSelectMode && (
                        <button
                          onClick={(e) => toggleSelectPrompt(e, prompt.id)}
                          className={`text-slate-400 hover:text-blue-600 transition-colors`}
                        >
                          {isSelected ? (
                            <CheckSquare size={18} className="text-blue-600" />
                          ) : (
                            <Square size={18} />
                          )}
                        </button>
                      )}
                      <span
                        className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                          prompt.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                            : prompt.status === "DRAFT"
                            ? "bg-amber-50 text-amber-700 border-amber-200/60"
                            : "bg-blue-50 text-blue-700 border-blue-200/60"
                        }`}
                      >
                        {prompt.status}
                      </span>
                    </div>

                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60 truncate max-w-[120px]">
                      {prompt.model?.name || "AI Model"}
                    </span>
                  </div>

                  {/* Title */}
                  <Link
                    href={`/dashboard/${prompt.id}`}
                    className="block group-hover:text-[var(--color-primary)] transition-colors"
                  >
                    <h3 className="text-base font-bold text-slate-900 line-clamp-1 mb-1.5">
                      {prompt.title}
                    </h3>
                  </Link>

                  {/* Intent / Snippet */}
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed h-9">
                    {prompt.intent || prompt.originalPrompt}
                  </p>
                </div>

                {/* Footer Bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 mt-2">
                  <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                    <Clock size={13} />
                    {new Date(prompt.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    {/* Copy Button */}
                    <button
                      onClick={(e) => handleCopy(e, prompt)}
                      title="Salin Prompt"
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      {copiedId === prompt.id ? (
                        <Check size={14} className="text-emerald-600" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => openSingleDeleteModal(e, prompt)}
                      title="Hapus Prompt"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>

                    {/* Open Details */}
                    <Link
                      href={`/dashboard/${prompt.id}`}
                      title="Buka Prompt"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ml-0.5"
                    >
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white border border-slate-200/90 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-xs">
          {filteredPrompts.map((prompt) => {
            const isSelected = selectedIds.includes(prompt.id);

            return (
              <div
                key={prompt.id}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-slate-50/80 ${
                  isSelected ? "bg-blue-50/30" : ""
                }`}
              >
                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                  {isSelectMode && (
                    <button
                      onClick={(e) => toggleSelectPrompt(e, prompt.id)}
                      className="mt-0.5 sm:mt-0 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      {isSelected ? (
                        <CheckSquare size={18} className="text-blue-600" />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>
                  )}

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/dashboard/${prompt.id}`}
                        className="font-bold text-slate-900 hover:text-[var(--color-primary)] transition-colors text-sm sm:text-base truncate"
                      >
                        {prompt.title}
                      </Link>

                      <span
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                          prompt.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                            : prompt.status === "DRAFT"
                            ? "bg-amber-50 text-amber-700 border-amber-200/60"
                            : "bg-blue-50 text-blue-700 border-blue-200/60"
                        }`}
                      >
                        {prompt.status}
                      </span>

                      <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {prompt.model?.name}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 truncate max-w-xl">
                      {prompt.intent || prompt.originalPrompt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 text-xs text-slate-400 shrink-0">
                  <div className="flex items-center gap-1">
                    <Clock size={13} />
                    {new Date(prompt.createdAt).toLocaleDateString("id-ID")}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleCopy(e, prompt)}
                      title="Salin Prompt"
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      {copiedId === prompt.id ? (
                        <Check size={14} className="text-emerald-600" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>

                    <button
                      onClick={(e) => openSingleDeleteModal(e, prompt)}
                      title="Hapus Prompt"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>

                    <Link
                      href={`/dashboard/${prompt.id}`}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      Buka
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Hapus Prompt?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {deleteModal.isBulk
                    ? `Apakah Anda yakin ingin menghapus ${selectedIds.length} prompt terpilih? Tindakan ini tidak dapat dibatalkan.`
                    : `Apakah Anda yakin ingin menghapus prompt "${deleteModal.title}"? Data yang dihapus tidak dapat dikembalikan.`}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setDeleteModal({ isOpen: false })}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all disabled:opacity-50"
              >
                Batal
              </button>

              <button
                disabled={isDeleting}
                onClick={confirmDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-red-600 hover:bg-red-700 transition-all shadow-sm disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 size={13} />
                    Ya, Hapus
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
