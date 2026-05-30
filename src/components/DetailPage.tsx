import React, { useState, useEffect } from "react";
import { ArrowLeft, User, Mail, Calendar, Sparkles, RefreshCw, Check, CheckSquare, Trash2, ArrowUpRight, CheckCircle } from "lucide-react";
import { Question } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface DetailPageProps {
  question: Question;
  onBackToDashboard: () => void;
  onSaveDraftAnswer: (id: string, text: string) => Promise<boolean>;
  onSubmitFinalAnswer: (id: string, text: string) => Promise<boolean>;
  onDeleteQuestion: (id: string) => Promise<boolean>;
  onRegenerateAIDraft: (id: string) => Promise<string>;
}

export default function DetailPage({
  question,
  onBackToDashboard,
  onSaveDraftAnswer,
  onSubmitFinalAnswer,
  onDeleteQuestion,
  onRegenerateAIDraft
}: DetailPageProps) {
  const [responseInput, setResponseInput] = useState(question.humanAnswer || "");
  const [aiDraftLocal, setAiDraftLocal] = useState(question.aiDraft || "");
  
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [feedbackMsg, setFeedbackMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    setResponseInput(question.humanAnswer || "");
    setAiDraftLocal(question.aiDraft || "");
    setFeedbackMsg({ type: "", text: "" });
  }, [question]);

  const handleApplyDraft = () => {
    setResponseInput(aiDraftLocal);
    setFeedbackMsg({ type: "success", text: "Draf jawaban AI berhasil diterapkan ke kolom input jawaban Anda." });
  };

  const handleRegenerateDraft = async () => {
    setIsRegenerating(true);
    setFeedbackMsg({ type: "", text: "" });
    try {
      const generated = await onRegenerateAIDraft(question.id);
      if (generated) {
        setAiDraftLocal(generated);
        setFeedbackMsg({ type: "success", text: "Draf jawaban AI berhasil diperbaharui dengan modul Gemini." });
      } else {
        setFeedbackMsg({ type: "error", text: "Regenerasi gagal. Menggunakan default draf cadangan sistem." });
      }
    } catch (err) {
      setFeedbackMsg({ type: "error", text: "Gagal terhubung dengan endpoint draf Gemini AI." });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    setFeedbackMsg({ type: "", text: "" });
    try {
      const ok = await onSaveDraftAnswer(question.id, responseInput);
      if (ok) {
        setFeedbackMsg({ type: "success", text: "Draf balasan tersimpan dengan aman ke server database." });
      } else {
        setFeedbackMsg({ type: "error", text: "Gagal menyimpan draf." });
      }
    } catch (err) {
      setFeedbackMsg({ type: "error", text: "Terjadi kesalahan jaringan." });
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!responseInput.trim()) {
      setFeedbackMsg({ type: "error", text: "Jawaban balasan tidak boleh dibiarkan kosong." });
      return;
    }

    setIsFinalizing(true);
    setFeedbackMsg({ type: "", text: "" });
    try {
      const ok = await onSubmitFinalAnswer(question.id, responseInput);
      if (ok) {
        setFeedbackMsg({ type: "success", text: "Jawaban berhasil dikirim ke pelanggan dan status diperbaharui!" });
        setTimeout(() => {
          onBackToDashboard();
        }, 1500);
      } else {
        setFeedbackMsg({ type: "error", text: "Gagal memfinalisasi pengiriman jawaban." });
      }
    } catch (err) {
      setFeedbackMsg({ type: "error", text: "Terjadi kesalahan jaringan." });
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus pertanyaan ini secara permanen?")) {
      return;
    }
    setIsDeleting(true);
    setFeedbackMsg({ type: "", text: "" });
    try {
      const ok = await onDeleteQuestion(question.id);
      if (ok) {
        onBackToDashboard();
      } else {
        setFeedbackMsg({ type: "error", text: "Gagal menghapus pertanyaan." });
      }
    } catch (err) {
      setFeedbackMsg({ type: "error", text: "Terjadi kesalahan koneksi." });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans pb-16">
      
      {/* Detail Main wrapper */}
      <main className="max-w-4xl w-full mx-auto px-6 py-8 flex flex-col flex-1">
        
        {/* Back Link */}
        <div className="mb-6">
          <button
            onClick={onBackToDashboard}
            className="flex items-center space-x-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-all group"
            id="back-to-dashboard-link"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Kembali ke dashboard</span>
          </button>
        </div>

        {/* Dynamic Success Alert Banner */}
        <AnimatePresence>
          {feedbackMsg.text && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`mb-6 p-4 rounded-xl border text-xs font-bold ${
                feedbackMsg.type === "success"
                  ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                  : "bg-red-50 border-red-100 text-red-800"
              }`}
            >
              {feedbackMsg.text}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-6">
          {/* Card: Customer Question Block */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs glow-subtle">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 shrink-0 border border-slate-200">
                  <User className="w-6 h-6 stroke-2" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 tracking-tight" id="customer-name-detail">
                    {question.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-xs text-gray-400 font-semibold">
                    <span className="flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{question.email}</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{question.createdAt}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div>
                {question.status === "Terjawab" ? (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                    Terjawab
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-100/80 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 inline-block"></span>
                    Menunggu
                  </span>
                )}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">
                Isi Pertanyaan
              </p>
              <div className="bg-gray-50/50 p-5 rounded-xl border border-slate-200 text-sm md:text-base leading-relaxed text-gray-700 font-medium font-sans">
                {question.questionText}
              </div>
            </div>
          </section>

          {/* Card: Sparkle AI Draft Panel */}
          {aiDraftLocal && (
            <section className="bg-linear-to-br from-brand-light-green via-indigo-50/10 to-white rounded-2xl border border-indigo-100/80 p-6 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 relative z-10">
                <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-green/10 text-brand-green flex items-center justify-center">
                    <Sparkles className="w-4.5 h-4.5 fill-brand-green text-brand-green" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900">Draft Jawaban AI</h4>
                    <p className="text-[11px] font-medium text-gray-400">
                      Ditenagai Gemini · Tinjau dan edit sebelum dikirim
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleRegenerateDraft}
                    disabled={isRegenerating}
                    className="flex items-center space-x-1 text-xs hover:bg-white/90 border border-indigo-100/30 bg-white/50 px-3 py-2 rounded-lg text-gray-600 font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                    id="btn-regenerate-draft"
                    title="Regenerasi Draft AI"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 mr-1 text-indigo-600 ${isRegenerating ? "animate-spin" : ""}`} />
                    <span>{isRegenerating ? "Menyusun..." : "Regenerasi"}</span>
                  </button>

                  <button
                    onClick={handleApplyDraft}
                    disabled={isRegenerating}
                    className="flex items-center space-x-1.5 text-xs bg-brand-green hover:bg-brand-green-hover text-white font-bold px-4 py-2 rounded-lg cursor-pointer transition-all shadow-xs"
                    id="btn-apply-draft"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Pakai Draft</span>
                  </button>
                </div>
              </div>

              <div className="relative z-10 bg-white/70 border border-slate-100 p-5 rounded-xl text-xs md:text-sm text-gray-700 leading-relaxed font-medium font-sans whitespace-pre-wrap">
                {aiDraftLocal}
              </div>
            </section>
          )}

          {/* Response Editor: JAWABAN ANDA */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs glow-subtle">
            <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">
              Jawaban Anda
            </label>
            <textarea
              rows={8}
              value={responseInput}
              onChange={(e) => setResponseInput(e.target.value)}
              placeholder="Tuliskan jawaban balasan resmi di sini. Anda juga dapat menggunakan draf asisten AI di atas untuk mempercepat pengerjaan..."
              className="w-full p-4 bg-gray-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green focus:bg-white text-gray-800 placeholder-gray-400 font-medium leading-relaxed font-sans"
              id="detail-response-textarea"
            />

            {/* Bottom Actions Row */}
            <div className="mt-6 pt-6 border-t border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              {/* Left Action: Delete */}
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center justify-center space-x-2 text-xs font-bold text-red-500 hover:text-red-700 border border-red-100 hover:border-red-200 bg-red-50/20 hover:bg-red-50 px-4 py-2.5 rounded-xl transition-all disabled:opacity-50 cursor-pointer self-start sm:self-auto"
                id="btn-delete-question"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Pertanyaan</span>
              </button>

              {/* Right Actions: Save Draft or Send */}
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <button
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft || isFinalizing}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 px-5 py-3 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                  id="btn-save-draft-answer"
                >
                  <span>{isSavingDraft ? "Menyimpan..." : "Simpan sebagai Draft"}</span>
                </button>

                <button
                  onClick={handleFinalSubmit}
                  disabled={isSavingDraft || isFinalizing}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 text-xs font-extrabold text-white bg-brand-green hover:bg-brand-green-hover px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                  id="btn-finalize-answer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{isFinalizing ? "Megirimkan..." : "Simpan & Tandai Terjawab"}</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
