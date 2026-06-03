import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  createSession,
  getSessions,
  reset,
  deleteSession,
} from "../features/sessions/sessionSlice";

import {
  Brain,
  FileText,
  BookOpen,
  Sparkles,
  Clock,
  Trash2,
} from "lucide-react";

import AnimatedBackground from "../Components/AnimatedBackground";

const ROLES = [
  "MERN Stack Developer",
  "MEAN Stack Developer",
  "Full Stack Python",
  "Full Stack Java",
  "Frontend Developer",
  "Backend Developer",
  "Data Scientist",
  "Machine Learning Engineer",
  "DevOps Engineer",
];

const LEVELS = ["Junior", "Mid-Level", "Senior"];

const TYPES = [
  { label: "Oral only", value: "oral-only" },
  { label: "Coding Mix", value: "coding-mix" },
];

const COUNTS = [5, 10, 15];

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const { sessions, isLoading, isGenerating, isError, message } =
    useSelector((state) => state.sessions);

  const [formData, setFormData] = useState({
    role: ROLES[0],
    level: LEVELS[0],
    interviewType: TYPES[1].value,
    count: COUNTS[0],
  });

  useEffect(() => {
    dispatch(getSessions());
  }, [dispatch]);

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
      dispatch(reset());
    }
  }, [isError, message, dispatch]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createSession(formData));
  };

  const handleViewSession = (session) => {
    if (session.status === "completed") {
      navigate(`/review/${session._id}`);
    } else if (session.status === "in-progress") {
      navigate(`/interview/${session._id}`);
    } else {
      toast.info("Session not ready yet");
    }
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();

    if (window.confirm("Delete this session?")) {
      dispatch(deleteSession(id));
      toast.success("Session deleted");
    }
  };

  return (
    <div className="min-h-screen">
      <AnimatedBackground variant="dashboard" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {user?.name?.split(" ")[0]}
              </span>
            </h1>

            <p className="text-slate-500 mt-2 text-sm sm:text-base">
              Practice smarter and crack your next interview 🚀
            </p>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* AI Interview */}
          <div
            onClick={() =>
              document
                .getElementById("interview-form")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="group cursor-pointer rounded-2xl border border-slate-200/70 
                       bg-gradient-to-br from-blue-500 to-indigo-600
                       p-6 text-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <Brain className="w-8 h-8 mb-4" />

            <h3 className="text-xl font-bold mb-2">
              AI Interview
            </h3>

            <p className="text-blue-100 text-sm">
              Start practicing with AI-generated questions
            </p>
          </div>

          {/* Resume */}
          <div
            onClick={() => navigate("/resume-analysis")}
            className="group cursor-pointer rounded-2xl border border-slate-200/70 
                       bg-white dark:bg-slate-900
                       p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <FileText className="w-8 h-8 mb-4 text-violet-600" />

            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              Resume Analysis
            </h3>

            <p className="text-slate-500 text-sm">
              Check ATS score and improve your resume
            </p>
          </div>

          {/* Revision */}
          <div
            onClick={() => navigate("/revision")}
            className="group cursor-pointer rounded-2xl border border-slate-200/70 
                       bg-white dark:bg-slate-900
                       p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <BookOpen className="w-8 h-8 mb-4 text-emerald-600" />

            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              Revision Notes
            </h3>

            <p className="text-slate-500 text-sm">
              Generate last-minute study notes instantly
            </p>
          </div>

        </div>

        {/* CREATE INTERVIEW */}
        <div
          id="interview-form"
          className="rounded-3xl overflow-hidden border border-slate-200/70 
                     bg-white/90 dark:bg-slate-900/90 
                     backdrop-blur-xl shadow-2xl"
        >

          {/* TOP HEADER */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">

            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  Create Interview Session
                </h2>

                <p className="text-blue-100 text-sm">
                  Customize your interview experience
                </p>
              </div>
            </div>

          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

              {/* ROLE */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Select Role
                </label>

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700
                             bg-white dark:bg-slate-900
                             px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ROLES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* LEVEL */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Experience Level
                </label>

                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700
                             bg-white dark:bg-slate-900
                             px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {LEVELS.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>

              {/* COUNT */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Questions
                </label>

                <select
                  name="count"
                  value={formData.count}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700
                             bg-white dark:bg-slate-900
                             px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {COUNTS.map((c) => (
                    <option key={c} value={c}>
                      {c} Questions
                    </option>
                  ))}
                </select>
              </div>

              {/* TYPE */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Interview Type
                </label>

                <select
                  name="interviewType"
                  value={formData.interviewType}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700
                             bg-white dark:bg-slate-900
                             px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={isGenerating}
              className="mt-8 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600
                         hover:from-blue-700 hover:to-indigo-700
                         text-white py-3.5 font-semibold text-lg
                         shadow-lg hover:shadow-xl transition-all"
            >
              {isGenerating ? "Generating..." : "Start Interview"}
            </button>

          </form>
        </div>

        {/* SESSION HISTORY */}
        <div>

          <h2 className="text-2xl font-bold flex items-center gap-2 mb-5 text-slate-800 dark:text-white">
            <Clock className="w-6 h-6" />
            Interview History
          </h2>

          {isLoading ? (
            <p className="text-slate-500">Loading...</p>
          ) : sessions?.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-10 text-center bg-white/70 dark:bg-slate-900/70">
              <p className="text-slate-500">
                No interview sessions yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">

              {sessions.map((session) => (
                <div
                  key={session._id}
                  onClick={() => handleViewSession(session)}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200/60 
                             bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/30
                             dark:from-slate-900 dark:via-slate-900 dark:to-slate-800
                             p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >

                  {/* Gradient Glow */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />

                  <div className="relative flex items-center justify-between">

                    {/* LEFT */}
                    <div className="space-y-2">

                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                        {session.role}
                      </h3>

                      <div className="flex items-center gap-2 flex-wrap">

                        {/* LEVEL */}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold
                          ${
                            session.level === "Senior"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300"
                              : session.level === "Mid-Level"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                          }`}
                        >
                          {session.level}
                        </span>

                        {/* STATUS */}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium
                          ${
                            session.status === "completed"
                              ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300"
                              : "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300"
                          }`}
                        >
                          {session.status}
                        </span>

                      </div>

                    </div>

                    {/* RIGHT */}
                    <div className="flex items-center gap-3">

                      {/* ICON */}
                      <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                        <Brain className="w-5 h-5" />
                      </div>

                      {/* DELETE */}
                      <button
                        onClick={(e) => handleDelete(e, session._id)}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg
                                   bg-red-50 hover:bg-red-100
                                   dark:bg-red-500/10 dark:hover:bg-red-500/20
                                   text-red-600 dark:text-red-400
                                   transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>

                  </div>
                </div>
              ))}

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;