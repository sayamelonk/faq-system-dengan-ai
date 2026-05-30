import React, { useState, useEffect, useRef } from "react";
import { Headphones, LogOut, Inbox, Clock, CheckCircle2, Search, Sparkles, ChevronRight } from "lucide-react";
import { Question, Stats } from "../types";
import { motion } from "motion/react";

interface DashboardPageProps {
  questions: Question[];
  stats: Stats;
  onLogout: () => void;
  onSelectQuestion: (question: Question) => void;
}

export default function DashboardPage({ questions, stats, onLogout, onSelectQuestion }: DashboardPageProps) {
  const [activeFilter, setActiveFilter] = useState<'Semua' | 'Menunggu' | 'Terjawab'>('Semua');
  const [searchQuery, setSearchQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Restore persisted UI state (filter, search, and scroll) on mount
  useEffect(() => {
    try {
      const savedFilter = localStorage.getItem('jadimaju_filter');
      if (savedFilter === 'Semua' || savedFilter === 'Menunggu' || savedFilter === 'Terjawab') {
        setActiveFilter(savedFilter as any);
      }
      const savedSearch = localStorage.getItem('jadimaju_search');
      if (savedSearch) setSearchQuery(savedSearch);

      const savedScroll = localStorage.getItem('jadimaju_dashboard_scroll');
      if (savedScroll && wrapperRef.current) {
        wrapperRef.current.scrollTop = parseInt(savedScroll, 10) || 0;
      }
    } catch (err) {
      // ignore storage errors
    }
  }, []);

  // Persist filter and search when changed
  useEffect(() => {
    try {
      localStorage.setItem('jadimaju_filter', activeFilter);
    } catch (err) {}
  }, [activeFilter]);

  useEffect(() => {
    try {
      localStorage.setItem('jadimaju_search', searchQuery);
    } catch (err) {}
  }, [searchQuery]);

  const filteredQuestions = questions.filter(q => {
    // Filter status
    const matchesFilter = 
      activeFilter === 'Semua' || 
      (activeFilter === 'Menunggu' && q.status === 'Menunggu') ||
      (activeFilter === 'Terjawab' && q.status === 'Terjawab');
    
    // Search query
    const matchesSearch = 
      q.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.questionText.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Save current scroll position before navigating to detail
  const handleRowClick = (q: Question) => {
    try {
      if (wrapperRef.current) {
        localStorage.setItem('jadimaju_dashboard_scroll', String(wrapperRef.current.scrollTop || 0));
      }
    } catch (err) {
      // ignore
    }
    onSelectQuestion(q);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      
      {/* Header Panel */}
      <header className="w-full bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-brand-light-green flex items-center justify-center text-brand-green">
            <Headphones className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900 flex items-center">
              Jadimaju
            </h1>
            <p className="text-[10px] font-bold tracking-widest text-#4f46e5 uppercase">
              Admin Panel
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center space-x-2 text-sm font-semibold text-gray-500 hover:text-red-600 transition-all px-4 py-2 hover:bg-red-50/50 rounded-xl border border-transparent hover:border-red-100"
          id="btn-admin-logout"
        >
          <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
          <span>Keluar</span>
        </button>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 flex flex-col">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight" id="dashboard-title">Dashboard</h2>
          <p className="text-gray-500 text-sm mt-1">
            Kelola pertanyaan pelanggan dan kirim jawaban dengan bantuan AI.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Stats Card: Total */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between glow-subtle">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                Total Pertanyaan
              </p>
              <div className="text-3xl font-extrabold text-gray-900 mt-2">
                {stats.total}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
              <Inbox className="w-6 h-6 stroke-2" />
            </div>
          </div>

          {/* Stats Card: Pending */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between glow-subtle">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                Menunggu Jawaban
              </p>
              <div className="text-3xl font-extrabold text-gray-900 mt-2">
                {stats.pending}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
              <Clock className="w-6 h-6 stroke-2" />
            </div>
          </div>

          {/* Stats Card: Answered */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between glow-subtle">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                Sudah Terjawab
              </p>
              <div className="text-3xl font-extrabold text-gray-900 mt-2">
                {stats.answered}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-6 h-6 stroke-2" />
            </div>
          </div>
        </div>

        {/* Controls: Search and filter tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex space-x-2 bg-white/40 p-1 rounded-xl self-start border border-gray-100/50">
            {(['Semua', 'Menunggu', 'Terjawab'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all uppercase cursor-pointer ${
                  activeFilter === tab
                    ? 'bg-brand-green text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-950 hover:bg-white/20'
                }`}
                id={`filter-${tab.toLowerCase()}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:max-w-md">
            <input
              type="text"
              placeholder="Cari nama, email, atau pertanyaan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100/80 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-green focus:bg-white text-gray-800 placeholder-gray-400 font-medium shadow-xs"
              id="search-input"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Table/List Area */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto" ref={wrapperRef}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-50/50 bg-gray-50/20">
                  <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-gray-400 uppercase w-1/4">
                    Pelanggan
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-gray-400 uppercase w-2/5">
                    Pertanyaan
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-gray-400 uppercase w-1/5">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-gray-400 uppercase w-1/5">
                    Tanggal
                  </th>
                  <th className="p-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredQuestions.length > 0 ? (
                  filteredQuestions.map((q) => (
                    <tr
                      key={q.id}
                      onClick={() => handleRowClick(q)}
                      className="hover:bg-gray-50/40 transition-colors cursor-pointer group"
                      id={`row-${q.id}`}
                    >
                      {/* Customer col */}
                      <td className="px-6 py-5.5">
                        <div className="font-bold text-gray-900 group-hover:text-brand-green transition-all">
                          {q.name}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{q.email}</div>
                      </td>

                      {/* Question col */}
                      <td className="px-6 py-5.5 max-w-xs md:max-w-md">
                        <div className="text-gray-600 line-clamp-2 leading-relaxed text-sm antialiased font-medium wrap-break-word">
                          {q.questionText}
                        </div>
                        {q.status === "Menunggu" && q.aiDraft && (
                          <div className="flex items-center text-[11px] font-bold text-brand-green mt-2 space-x-1">
                            <Sparkles className="w-3.5 h-3.5 fill-brand-green animate-pulse" />
                            <span>Draft AI tersedia</span>
                          </div>
                        )}
                      </td>

                      {/* Status col */}
                      <td className="px-6 py-5.5">
                        {q.status === "Terjawab" ? (
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-extrabold rounded-full border border-emerald-100 flex items-center w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 inline-block"></span>
                            Terjawab
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[11px] font-extrabold rounded-full border border-amber-100/80 flex items-center w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 inline-block animate-ping"></span>
                            Menunggu
                          </span>
                        )}
                      </td>

                      {/* Date col */}
                      <td className="px-6 py-5.5 text-xs text-gray-500 font-semibold tracking-tight whitespace-nowrap">
                        {q.createdAt}
                      </td>

                      {/* Arrow Col */}
                      <td className="p-4">
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all" />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400 text-sm font-medium">
                      Tidak ada pertanyaan yang sesuai dengan kriteria pencarian Anda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
