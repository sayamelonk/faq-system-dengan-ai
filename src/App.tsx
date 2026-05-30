import React, { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import DashboardPage from "./components/DashboardPage";
import DetailPage from "./components/DetailPage";
import { Question, Stats } from "./types";
import { Loader } from "lucide-react";

export default function App() {
  // Page routing state - restore from localStorage
  const [currentPage, setCurrentPage] = useState<"landing" | "login" | "dashboard" | "detail">(() => {
    const saved = localStorage.getItem("jadimaju_current_page");
    return (saved as any) || "landing";
  });
  
  // App states
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem("jadimaju_admin_token");
  });

  // Load questions on mount
  useEffect(() => {
    fetchQuestions();
  }, []);

  // Guard: redirect invalid page states after loading completes
  useEffect(() => {
    if (loading) return;
    if (currentPage === "dashboard" && !adminToken) {
      setCurrentPage("landing");
    } else if (currentPage === "detail" && !selectedQuestion) {
      setCurrentPage(adminToken ? "dashboard" : "landing");
    }
  }, [loading, currentPage, adminToken, selectedQuestion]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/questions", { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
        
        // Restore selectedQuestion from localStorage if on detail page
        const savedPage = localStorage.getItem("jadimaju_current_page");
        const savedQuestionId = localStorage.getItem("jadimaju_selected_question_id");
        if (savedPage === "detail" && savedQuestionId) {
          const found = data.find(q => q.id === savedQuestionId);
          if (found) {
            setSelectedQuestion(found);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch questions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Compute stats on the fly dynamically
  const stats: Stats = {
    total: questions.length,
    pending: questions.filter(q => q.status === "Menunggu").length,
    answered: questions.filter(q => q.status === "Terjawab").length
  };

  // Persist currentPage to localStorage
  useEffect(() => {
    localStorage.setItem("jadimaju_current_page", currentPage);
  }, [currentPage]);

  // Persist selectedQuestion ID to localStorage
  useEffect(() => {
    if (selectedQuestion) {
      localStorage.setItem("jadimaju_selected_question_id", selectedQuestion.id);
    } else {
      localStorage.removeItem("jadimaju_selected_question_id");
    }
  }, [selectedQuestion]);

  // Handlers
  const handleAddNewQuestion = async (name: string, email: string, questionText: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, questionText })
      });
      if (res.ok) {
        await fetchQuestions(); // refresh state list
        return true;
      }
    } catch (err) {
      console.error("Error creating question:", err);
    }
    return false;
  };

  const handleAdminLogin = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.token) {
          localStorage.setItem("jadimaju_admin_token", result.token);
          setAdminToken(result.token);
          setCurrentPage("dashboard");
          return true;
        }
      }
    } catch (err) {
      console.error("Login request error:", err);
    }
    return false;
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("jadimaju_admin_token");
    setAdminToken(null);
    setCurrentPage("landing");
  };

  const handleRegenerateAIDraft = async (id: string): Promise<string> => {
    try {
      const res = await fetch(`/api/questions/${id}/draft`, {
        method: "POST"
      });
      if (res.ok) {
        const result = await res.json();
        setQuestions(prev => prev.map(q => q.id === id ? { ...q, aiDraft: result.aiDraft } : q));
        if (selectedQuestion?.id === id) {
          setSelectedQuestion(prev => prev ? { ...prev, aiDraft: result.aiDraft } : null);
        }
        return result.aiDraft;
      }
    } catch (err) {
      console.error("Failed to regenerate AI draft:", err);
    }
    return "";
  };

  const handleSaveDraftAnswer = async (id: string, text: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/questions/${id}/save-draft`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ humanAnswer: text })
      });
      if (res.ok) {
        const result = await res.json();
        setQuestions(prev => prev.map(q => q.id === id ? result.question : q));
        if (selectedQuestion?.id === id) {
          setSelectedQuestion(result.question);
        }
        return true;
      }
    } catch (err) {
      console.error("Error saving draft answer:", err);
    }
    return false;
  };

  const handleSubmitFinalAnswer = async (id: string, text: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/questions/${id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ humanAnswer: text })
      });
      if (res.ok) {
        const result = await res.json();
        setQuestions(prev => prev.map(q => q.id === id ? result.question : q));
        if (selectedQuestion?.id === id) {
          setSelectedQuestion(result.question);
        }
        return true;
      }
    } catch (err) {
      console.error("Error finalising answer submission:", err);
    }
    return false;
  };

  const handleDeleteQuestion = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setQuestions(prev => prev.filter(q => q.id !== id));
        setSelectedQuestion(null);
        return true;
      }
    } catch (err) {
      console.error("Error during question deletion:", err);
    }
    return false;
  };

  const handleSelectQuestion = (q: Question) => {
    setSelectedQuestion(q);
    setCurrentPage("detail");
  };

  // Back from Login or Dashboard page
  const handleBackToMain = () => {
    if (adminToken) {
      setCurrentPage("dashboard");
    } else {
      setCurrentPage("landing");
    }
  };

  const handleHeaderAdminClick = () => {
    if (adminToken) {
      setCurrentPage("dashboard");
    } else {
      setCurrentPage("login");
    }
  };

  return (
    <div className="text-gray-900 bg-[#f8fafc] antialiased">
      {loading && questions.length === 0 ? (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
          <div className="flex flex-col items-center space-y-4">
            <Loader className="w-8 h-8 animate-spin text-brand-green" />
            <p className="text-xs font-bold text-gray-400 tracking-wider uppercase">Loading Jadimaju...</p>
          </div>
        </div>
      ) : (
        <>
          {currentPage === "landing" && (
            <LandingPage
              onAdminLoginClick={handleHeaderAdminClick}
              onSubmitQuestion={handleAddNewQuestion}
            />
          )}

          {currentPage === "login" && (
            <LoginPage
              onBackToMain={() => setCurrentPage("landing")}
              onLoginSubmit={handleAdminLogin}
            />
          )}

          {currentPage === "dashboard" && adminToken && (
            <DashboardPage
              questions={questions}
              stats={stats}
              onLogout={handleAdminLogout}
              onSelectQuestion={handleSelectQuestion}
            />
          )}

          {currentPage === "detail" && selectedQuestion && (
            <DetailPage
              question={selectedQuestion}
              onBackToDashboard={() => {
                setSelectedQuestion(null);
                setCurrentPage("dashboard");
              }}
              onSaveDraftAnswer={handleSaveDraftAnswer}
              onSubmitFinalAnswer={handleSubmitFinalAnswer}
              onDeleteQuestion={handleDeleteQuestion}
              onRegenerateAIDraft={handleRegenerateAIDraft}
            />
          )}
        </>
      )}
    </div>
  );
}
