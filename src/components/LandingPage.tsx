import React, { useState } from "react";
import { Headphones, Sparkles, ShieldCheck, Clock, Send, Lock } from "lucide-react";
import { motion } from "motion/react";

interface LandingPageProps {
  onAdminLoginClick: () => void;
  onSubmitQuestion: (name: string, email: string, question: string) => Promise<boolean>;
}

export default function LandingPage({ onAdminLoginClick, onSubmitQuestion }: LandingPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !question.trim()) {
      setSubmitError("Mohon lengkapi semua bidang isian formulir.");
      return;
    }
    
    setSubmitError("");
    setIsSubmitting(true);
    
    try {
      const success = await onSubmitQuestion(name, email, question);
      if (success) {
        setName("");
        setEmail("");
        setQuestion("");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 8000);
      } else {
        setSubmitError("Gagal mengirim pertanyaan. Silakan coba sesaat lagi.");
      }
    } catch (err) {
      setSubmitError("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      {/* Navbar Header banner */}
      <header className="w-full bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-brand-light-green flex items-center justify-center text-brand-green">
            <Headphones className="w-5 h-5 stroke-[2.5]" id="logo-icon-headphones" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900 flex items-center">
              Jadimaju
            </h1>
            <p className="text-[10px] font-bold tracking-widest text-brand-green uppercase">
              Customer Care
            </p>
          </div>
        </div>

        <button
          onClick={onAdminLoginClick}
          className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-brand-green transition-all bg-gray-50 hover:bg-brand-light-green px-4 py-2 rounded-xl border border-gray-100"
          id="btn-admin-login"
        >
          <Lock className="w-4 h-4 text-gray-400 group-hover:text-brand-green" />
          <span>Admin Login</span>
        </button>
      </header>

      {/* Hero Header Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col items-center">
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center space-x-2 bg-brand-light-green px-4 py-1.5 rounded-full text-xs font-semibold text-brand-green mb-6 shadow-xs border border-indigo-100/50">
            <Sparkles className="w-3.5 h-3.5 fill-brand-green text-brand-green" />
            <span>Didukung oleh AI</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight max-w-2xl mx-auto mb-4">
            Ada yang bisa kami{" "}
            <span className="text-brand-green relative inline-block">
              bantu jawab?
            </span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto leading-relaxed text-sm md:text-base">
            Tuliskan pertanyaan Anda di formulir di bawah. Tim Customer Service
            kami akan membalas melalui email Anda secepatnya.
          </p>
        </motion.div>

        {/* Central Question Submission Form Card */}
        <motion.div 
          className="w-full max-w-2xl bg-white rounded-3xl p-8 border border-slate-200 shadow-md mb-12 relative overflow-hidden"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          id="form-card-container"
        >
          {showSuccess && (
            <motion.div 
              className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center p-8 text-center z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-16 h-16 rounded-full bg-brand-light-green flex items-center justify-center text-brand-green mb-4">
                <ShieldCheck className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Pertanyaan Terkirim!</h3>
              <p className="text-gray-500 text-sm max-w-md mb-6 leading-relaxed">
                Terima kasih. Pertanyaan Anda telah masuk ke antrean customer care kami. 
                Sistem AI kami saat ini telah membuatkan rancangan draf awal untuk segera ditinjau oleh operator manusia. Balasan resmi akan segera dikirimkan ke kotak masuk email Anda dalam waktu singkat.
              </p>
              <button 
                onClick={() => setShowSuccess(false)}
                className="px-6 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white text-sm font-semibold shadow-xs transition-all"
              >
                Kirim Pertanyaan Lain
              </button>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                placeholder="cth. Andi Pratama"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green focus:bg-white transition-all text-gray-800 placeholder-gray-400/80 font-medium"
                id="input-name"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="email@anda.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green focus:bg-white transition-all text-gray-800 placeholder-gray-400/80 font-medium"
                id="input-email"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-2">
                Pertanyaan Anda
              </label>
              <textarea
                rows={4}
                placeholder="Tuliskan pertanyaan Anda di sini. Semakin detail, semakin baik jawaban yang dapat kami berikan."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green focus:bg-white transition-all text-gray-800 placeholder-gray-400/80 leading-relaxed font-medium"
                id="input-question"
                required
              />
            </div>

            {submitError && (
              <p className="text-red-600 text-xs font-semibold">{submitError}</p>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-50">
              <p className="text-[11px] text-gray-400 max-w-sm text-center sm:text-left leading-relaxed">
                Dengan mengirim, Anda setuju jawaban dikirim ke email yang Anda berikan.
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3.5 bg-brand-green hover:bg-brand-green-hover active:scale-[0.98] text-white font-bold text-sm rounded-full shadow-md flex items-center justify-center space-x-2.5 transition-all cursor-pointer disabled:opacity-50"
                id="btn-submit-question"
              >
                <span>{isSubmitting ? "Mengirim..." : "Kirim Pertanyaan"}</span>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </motion.div>

        {/* Feature Cards Footer area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
          <div className="bg-white p-5 rounded-2xl border border-gray-100/60 shadow-xs flex items-start space-x-4">
            <div className="p-3 bg-brand-light-green rounded-xl text-brand-green shrink-0">
              <Sparkles className="w-5 h-5 fill-brand-green" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900 mb-0.5">AI-Assisted</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Draft jawaban disiapkan AI, ditinjau manusia.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100/60 shadow-xs flex items-start space-x-4">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900 mb-0.5">Privasi Terjaga</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Email Anda hanya untuk balasan CS.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100/60 shadow-xs flex items-start space-x-4">
            <div className="p-3 bg-slate-100 rounded-xl text-slate-600 shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900 mb-0.5">Respon Cepat</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Rata-rata dijawab dalam 1x24 jam kerja.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
