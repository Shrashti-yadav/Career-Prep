import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  FileText, Sparkles, User, Trash2,
  Eye, BookOpen, RefreshCw,
  ChevronUp, X, CheckCircle,
  Star, Send, MessageSquare,
} from "lucide-react";

//const API_BASE = "http://localhost:5000";
const API_BASE = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";
const getToken = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.token;
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });

const atsColor = (score) => {
  if (score >= 90) return "bg-green-100 text-green-700";
  if (score >= 75) return "bg-teal-100 text-teal-700";
  if (score >= 60) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-600";
};

// ── Inline Feedback Form ─────────────────────────────────────
function FeedbackTab({ user }) {
  const { user: reduxUser } = useSelector((state) => state.auth);
  const activeUser = user || reduxUser;

  const [form, setForm]           = useState({ role: "", message: "", rating: 0 });
  const [hoveredStar, setHoveredStar] = useState(0);
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!form.rating)          return setError("Please select a star rating");
    if (!form.message.trim())  return setError("Please write a message");
    if (!activeUser)           return setError("Please login to submit feedback");

    try {
      setLoading(true);
      await axios.post(
        `${API_BASE}/api/feedback`,
        { role: form.role, message: form.message, rating: form.rating },
        { headers: { Authorization: `Bearer ${activeUser.token}` } }
      );
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Thank You!</h3>
        <p className="text-gray-500 text-sm max-w-xs">
          Your feedback has been submitted and will appear on the home page.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm({ role: "", message: "", rating: 0 }); }}
          className="mt-6 text-sm text-teal-600 hover:underline"
        >
          Submit another response
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-1">Share Your Experience</h3>
        <p className="text-gray-500 text-sm">Help others by sharing how CareerPrep AI helped you.</p>
      </div>

      {/* Star Rating */}
      <div className="mb-5">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Your Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setForm({ ...form, rating: star })}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hoveredStar || form.rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Role (optional) */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Your Role <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Frontend Developer, Student"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
        />
      </div>

      {/* Message */}
      <div className="mb-5">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Your Message <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          placeholder="How did CareerPrep AI help you?"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          maxLength={500}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none transition"
        />
        <p className="text-xs text-gray-400 text-right mt-1">{form.message.length}/500</p>
      </div>

      {error && (
        <p className="text-red-500 text-sm mb-4 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Submit Feedback
          </>
        )}
      </button>

      {!activeUser && (
        <p className="text-center text-sm text-gray-500 mt-4">
          Please{" "}
          <a href="/login" className="text-teal-600 hover:underline">login</a>{" "}
          to submit feedback
        </p>
      )}
    </div>
  );
}

// ── Main Profile Component ────────────────────────────────────
export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]         = useState(0);
  const [user, setUser]                   = useState(null);
  const [resumeHistory, setResumeHistory] = useState([]);
  const [notesHistory, setNotesHistory]   = useState([]);
  const [sessions, setSessions]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");

  const [expandedResume, setExpandedResume] = useState(null);
  const [selectedNote, setSelectedNote]     = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      const [resumeRes, notesRes, sessionRes] = await Promise.all([
        fetch(`${API_BASE}/api/history/resume`, { headers }),
        fetch(`${API_BASE}/api/history/notes`,  { headers }),
        fetch(`${API_BASE}/api/sessions`,        { headers }),
      ]);
      const resumeJson  = await resumeRes.json();
      const notesJson   = await notesRes.json();
      const sessionJson = await sessionRes.json();

      setResumeHistory(resumeJson.data  || resumeJson.result  || []);
      setNotesHistory(notesJson.data    || notesJson.result   || []);
      setSessions(
        Array.isArray(sessionJson)
          ? sessionJson
          : sessionJson.data || sessionJson.result || []
      );
    } catch (err) {
      console.error(err);
      setError("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  const deleteResume = async (id) => {
    if (!confirm("Delete this analysis?")) return;
    try {
      await fetch(`${API_BASE}/api/history/resume/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setResumeHistory((prev) => prev.filter((r) => r._id !== id));
      if (expandedResume === id) setExpandedResume(null);
    } catch { alert("Delete failed"); }
  };

  const deleteNotes = async (id) => {
    if (!confirm("Delete this notes session?")) return;
    try {
      await fetch(`${API_BASE}/api/history/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setNotesHistory((prev) => prev.filter((n) => n._id !== id));
      if (selectedNote?._id === id) setSelectedNote(null);
    } catch { alert("Delete failed"); }
  };

  const deleteSession = async (id) => {
    if (!window.confirm("Delete this session?")) return;
    try {
      await fetch(`${API_BASE}/api/sessions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setSessions((prev) => prev.filter((s) => s._id !== id));
    } catch { alert("Delete failed"); }
  };

  const tabs = [
    { label: "Resume Analysis",    icon: <FileText       className="w-4 h-4" />, count: resumeHistory.length },
    { label: "Revision Notes",     icon: <BookOpen       className="w-4 h-4" />, count: notesHistory.length  },
    { label: "Interview Sessions", icon: <Sparkles       className="w-4 h-4" />, count: sessions.length      },
    { label: "Feedback",           icon: <MessageSquare  className="w-4 h-4" />, count: null                 },
  ];

  const completedSessions = sessions.filter((s) => s.status === "completed");
  const avgScore = completedSessions.length
    ? Math.round(completedSessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / completedSessions.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── Profile Header ─────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <div className="flex flex-wrap items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white shrink-0">
              <User className="w-10 h-10" />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-800 mb-1">{user?.name || "User"}</h1>
              <p className="text-gray-500 text-sm">{user?.email || ""}</p>
              <p className="text-gray-400 text-xs mt-1">
                Preferred Role: <span className="text-teal-600 font-medium">{user?.preferredRole || "N/A"}</span>
              </p>
              <p className="text-gray-400 text-xs">
                Member since{" "}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
                  : "2026"}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-teal-500">{sessions.length}</p>
                <p className="text-xs text-gray-500 mt-0.5">Interviews</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-500">{resumeHistory.length}</p>
                <p className="text-xs text-gray-500 mt-0.5">Analyses</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-500">{notesHistory.length}</p>
                <p className="text-xs text-gray-500 mt-0.5">Notes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-500">{avgScore}%</p>
                <p className="text-xs text-gray-500 mt-0.5">Avg Score</p>
              </div>
            </div>

            <button
              onClick={fetchAll}
              className="p-2 rounded-full hover:bg-gray-100 transition"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* ── Tabs ───────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="border-b flex overflow-x-auto">
            {tabs.map((tab, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition ${
                  activeTab === i
                    ? "border-b-2 border-teal-500 text-teal-600"
                    : "text-gray-500 hover:text-teal-500"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== null && (
                  <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                    activeTab === i ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {loading && activeTab !== 3 ? (
            <div className="flex items-center justify-center py-16 text-gray-400 gap-3">
              <RefreshCw className="w-5 h-5 animate-spin" />
              Loading...
            </div>
          ) : (
            <>
              {/* ══ TAB 0: Resume Analysis ══════════════════ */}
              {activeTab === 0 && (
                <div>
                  {resumeHistory.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                      No resume analyses yet.{" "}
                      <button onClick={() => navigate("/resume-analysis")} className="text-teal-500 underline">
                        Analyse your resume
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            {["File", "Role", "Date", "ATS Score", "Suggestions", "Actions"].map((h) => (
                              <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {resumeHistory.map((item) => (
                            <React.Fragment key={item._id}>
                              <tr className="hover:bg-gray-50 transition">
                                <td className="px-5 py-3 text-sm font-medium text-gray-800">{item.fileName}</td>
                                <td className="px-5 py-3 text-sm text-gray-500">{item.role}</td>
                                <td className="px-5 py-3 text-sm text-gray-500">{formatDate(item.createdAt)}</td>
                                <td className="px-5 py-3">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${atsColor(item.atsScore)}`}>
                                    {item.atsScore}%
                                  </span>
                                </td>
                                <td className="px-5 py-3 text-sm text-gray-500">
                                  {item.suggestions?.length || 0} items
                                </td>
                                <td className="px-5 py-3">
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => setExpandedResume(expandedResume === item._id ? null : item._id)}
                                      className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                                      title="View details"
                                    >
                                      {expandedResume === item._id
                                        ? <ChevronUp className="w-4 h-4 text-teal-600" />
                                        : <Eye className="w-4 h-4 text-gray-500" />}
                                    </button>
                                    <button
                                      onClick={() => deleteResume(item._id)}
                                      className="p-1.5 hover:bg-red-50 rounded-lg transition"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-4 h-4 text-red-400" />
                                    </button>
                                  </div>
                                </td>
                              </tr>

                              {expandedResume === item._id && (
                                <tr>
                                  <td colSpan="6" className="bg-gray-50 px-6 py-5">
                                    <div className="grid md:grid-cols-2 gap-6">
                                      <div>
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Summary</h4>
                                        <div className="space-y-1 text-sm text-gray-600">
                                          {Object.entries(item.summary || {}).map(([k, v]) => v ? (
                                            <p key={k}><span className="font-medium capitalize">{k}:</span> {v}</p>
                                          ) : null)}
                                        </div>
                                      </div>

                                      <div className="space-y-3">
                                        {item.strengths?.length > 0 && (
                                          <div>
                                            <h4 className="text-sm font-semibold text-green-700 mb-1">Strengths</h4>
                                            <ul className="space-y-1">
                                              {item.strengths.map((s, i) => (
                                                <li key={i} className="text-xs text-gray-600 flex gap-2">
                                                  <span className="text-green-500 mt-0.5">✓</span>{s}
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                        {item.weaknesses?.length > 0 && (
                                          <div>
                                            <h4 className="text-sm font-semibold text-red-600 mb-1">Weaknesses</h4>
                                            <ul className="space-y-1">
                                              {item.weaknesses.map((w, i) => (
                                                <li key={i} className="text-xs text-gray-600 flex gap-2">
                                                  <span className="text-red-400 mt-0.5">✗</span>{w}
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                      </div>

                                      {item.missingSkills?.length > 0 && (
                                        <div>
                                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Missing Skills</h4>
                                          <div className="flex flex-wrap gap-2">
                                            {item.missingSkills.map((s, i) => (
                                              <span key={i} className="bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded-full border border-orange-200">
                                                {s}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {item.suggestions?.length > 0 && (
                                        <div>
                                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Suggestions</h4>
                                          <ul className="space-y-1">
                                            {item.suggestions.map((s, i) => (
                                              <li key={i} className="text-xs text-gray-600 flex gap-2">
                                                <span className="text-blue-400 mt-0.5">→</span>{s}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}

                                      {item.recruiterImpression && (
                                        <div className="md:col-span-2">
                                          <h4 className="text-sm font-semibold text-gray-700 mb-1">Recruiter Impression</h4>
                                          <p className="text-xs text-gray-600 bg-white border border-gray-200 rounded-lg p-3 leading-relaxed">
                                            {item.recruiterImpression}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ══ TAB 1: Revision Notes ════════════════════ */}
              {activeTab === 1 && (
                <div className="p-6">
                  {notesHistory.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      No revision notes yet.{" "}
                      <button onClick={() => navigate("/revision")} className="text-teal-500 underline">
                        Generate your first notes
                      </button>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {notesHistory.map((item) => (
                        <div key={item._id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition bg-white">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-800">{item.topic}</h3>
                                <p className="text-xs text-gray-400">{formatDate(item.createdAt)}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => deleteNotes(item._id)}
                              className="p-1.5 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>

                          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                            {item.summary || "No summary available"}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                              {item.keyPoints?.length || 0} concepts
                            </span>
                            <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full">
                              {item.tips?.length || 0} tips
                            </span>
                            <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full">
                              {item.quizCount || 0} quiz Qs
                            </span>
                          </div>

                          <button
                            onClick={() => setSelectedNote(item)}
                            className="w-full text-sm text-teal-600 hover:text-teal-700 border border-teal-200 hover:border-teal-400 rounded-lg py-2 transition"
                          >
                            View Notes →
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ══ TAB 2: Interview Sessions ════════════════ */}
              {activeTab === 2 && (
                <div>
                  {sessions.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      No interview sessions yet.{" "}
                      <button onClick={() => navigate("/")} className="text-teal-500 underline">
                        Start an interview
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            {["Role", "Level", "Type", "Date", "Score", "Status", "Actions"].map((h) => (
                              <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {sessions.map((s) => (
                            <tr key={s._id} className="hover:bg-gray-50 transition">
                              <td className="px-5 py-3 text-sm font-medium text-gray-800">{s.role}</td>
                              <td className="px-5 py-3 text-sm text-gray-500 capitalize">{s.level}</td>
                              <td className="px-5 py-3 text-sm text-gray-500">{s.interviewType}</td>
                              <td className="px-5 py-3 text-sm text-gray-500">{formatDate(s.createdAt)}</td>
                              <td className="px-5 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${atsColor(s.overallScore)}`}>
                                  {s.overallScore || 0}%
                                </span>
                              </td>
                              <td className="px-5 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  s.status === "completed"     ? "bg-green-100 text-green-700"
                                  : s.status === "in-progress" ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-600"
                                }`}>
                                  {s.status}
                                </span>
                              </td>
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      if (s.status === "completed") navigate(`/review/${s._id}`);
                                      else if (s.status === "in-progress") navigate(`/interview/${s._id}`);
                                    }}
                                    className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                                    title="View session"
                                  >
                                    <Eye className="w-4 h-4 text-gray-500" />
                                  </button>
                                  <button
                                    onClick={() => deleteSession(s._id)}
                                    className="p-1.5 hover:bg-red-50 rounded-lg transition"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ══ TAB 3: Feedback ══════════════════════════ */}
              {activeTab === 3 && <FeedbackTab user={user} />}
            </>
          )}
        </div>
      </div>

      {/* ══ NOTES MODAL ══════════════════════════════════════ */}
      {selectedNote && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedNote(null); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">

            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{selectedNote.topic}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(selectedNote.createdAt)}</p>
              </div>
              <button
                onClick={() => setSelectedNote(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">

              {selectedNote.summary && (
                <p className="text-gray-600 text-sm leading-relaxed bg-blue-50 rounded-xl p-4 border border-blue-100">
                  {selectedNote.summary}
                </p>
              )}

              <div className="flex gap-3">
                <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-medium">
                  {selectedNote.keyPoints?.length || 0} concepts
                </span>
                <span className="text-xs bg-purple-50 text-purple-600 px-3 py-1.5 rounded-full font-medium">
                  {selectedNote.tips?.length || 0} tips
                </span>
                <span className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-full font-medium">
                  {selectedNote.quizCount || 0} quiz Qs
                </span>
              </div>

              {selectedNote.keyPoints?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-4 text-base">Key Points</h3>
                  <div className="space-y-5">
                    {selectedNote.keyPoints.map((point, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{point.title}</p>
                          <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{point.description}</p>
                          {point.example && (
                            <pre className="bg-gray-100 rounded-lg p-3 mt-2 text-xs text-indigo-600 overflow-auto whitespace-pre-wrap font-mono">
                              {point.example}
                            </pre>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedNote.tips?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 text-base">💡 Important Tips</h3>
                  <ul className="space-y-2">
                    {selectedNote.tips.map((tip, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3 pt-2 border-t">
                <button
                  onClick={() => { setSelectedNote(null); navigate("/revision"); }}
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
                >
                  Generate Again
                </button>
                <button
                  onClick={() => setSelectedNote(null)}
                  className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}