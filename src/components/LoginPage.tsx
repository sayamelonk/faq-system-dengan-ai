import React, { useState } from "react";
import { ArrowLeft, ShieldCheck, User, Lock, Loader } from "lucide-react";
import { motion } from "motion/react";

interface LoginPageProps {
  onBackToMain: () => void;
  onLoginSubmit: (username: string, password: string) => Promise<boolean>;
}

export default function LoginPage({ onBackToMain, onLoginSubmit }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorStatus, setErrorStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorStatus("Mohon masukkan nama pengguna dan kata sandi.");
      return;
    }

    setIsSubmitting(true);
    setErrorStatus("");

    try {
      const isOk = await onLoginSubmit(username, password);
      if (!isOk) {
        setErrorStatus("Nama admin atau Kata sandi salah. Silakan coba kembali.");
      }
    } catch (err) {
      setErrorStatus("Kesalahan saat menghubungi server keamanan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans p-6 relative justify-center">

      {/* Back button on top left */}
      <div className="absolute top-6 left-6">
        <button
          onClick={onBackToMain}
          className="flex items-center space-x-2 text-sm font-semibold text-gray-500 hover:text-gray-950 transition-all group"
          id="btn-back-to-home"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Kembali ke halaman utama</span>
        </button>
      </div>

      <div className="w-full max-w-md mx-auto">
        <motion.div
          className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md overflow-hidden"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          id="login-card"
        >
          {/* Centered green circle icon with shield/check */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-brand-green flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-7 h-7 stroke-2" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Admin Panel</h3>
            <p className="text-gray-400 text-sm mt-1">
              Masuk untuk mengelola pertanyaan pelanggan.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3.5 pl-11 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green focus:bg-white transition-all text-gray-800 placeholder-gray-400 font-medium"
                  id="login-username"
                  required
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3.5 pl-11 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green focus:bg-white transition-all text-gray-800 placeholder-gray-400 font-medium"
                  id="login-password"
                  required
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
              </div>
            </div>

            {errorStatus && (
              <p className="text-red-600 text-xs text-center font-semibold bg-red-50 py-2.5 px-3 rounded-lg border border-red-100">
                {errorStatus}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-brand-green hover:bg-brand-green-hover text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-75"
              id="login-submit-btn"
            >
              {isSubmitting ? (
                <Loader className="w-5 h-5 animate-spin text-white" />
              ) : (
                <span>Masuk</span>
              )}
            </button>
          </form>

          {/* Indigo/grey soft info wrap for demo credentials */}
          {/* <div className="mt-6 bg-[#f8fafc] border border-gray-100 p-4 rounded-xl text-center">
            <p className="text-xs text-slate-500 font-medium tracking-tight">
              Demo: <span className="text-slate-400">username</span> <span className="font-semibold text-slate-700">admin</span>, <span className="text-slate-400">password</span> <span className="font-semibold text-slate-700">admin123</span>
            </p>
          </div> */}
        </motion.div>
      </div>
    </div>
  );
}
