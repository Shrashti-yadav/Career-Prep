import { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createSession, getSessions, reset, deleteSession } from '../features/sessions/sessionSlice';
import { toast } from 'react-toastify';
import SessionCard from "../components/SessionCard";

const ROLES = [
  "MERN Stack Developer",
  "MEAN Stack Developer",
  "Full Stack Python",
  "Full Stack Java",
  "Frontend Developer",
  "Backend Developer",
  "Data Scientist",
  "Data Analyst",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Cloud Engineer (AWS/Azure/GCP)",
  "Cybersecurity Engineer",
  "Blockchain Developer",
  "Mobile Developer (iOS/Android)",
  "Game Developer",
  "UI/UX Designer",
  "QA Automation Engineer",
  "Product Manager"
];

const LEVELS = ["Junior", "Mid-Level", "Senior"];
const TYPES = [
  { label: 'Oral only', value: 'oral-only' },
  { label: 'Coding Mix', value: 'coding-mix' }
];
const COUNTS = [5, 10, 15];

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { sessions, isLoading, isGenerating, isError, message } = useSelector((state) => state.sessions);

  const isProcessing = isGenerating;

  const [formData, setFormData] = useState({
    role: user.preferredRole || ROLES[0],
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

  const onChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(createSession(formData));
  };

  const viewSession = (session) => {
    if (session.status === 'completed') {
      navigate(`/review/${session._id}`);
    } else if (session.status === 'in-progress') {
      navigate(`/interview/${session._id}`);
    } else {
      toast.info('Session not ready yet');
    }
  };

  const handleDelete = (e, sessionId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this session?')) {
      dispatch(deleteSession(sessionId));
      toast.error('Session Deleted');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12 space-y-10 animate-in duration-700">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900">
            Welcome, <span className="text-teal-600">{user.name.split(' ')[0]}</span>
          </h1>
          <p className="text-slate-500 mt-1">Ready for your technical prep?</p>
        </div>

        <div className="bg-teal-50 px-4 py-2 rounded-2xl border border-teal-100">
          <p className="text-xs text-teal-600 font-bold uppercase">Total Sessions</p>
          <p className="text-2xl font-black text-teal-700">{sessions.length}</p>
        </div>
      </div>

      {/* 🔥 FEATURE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* AI Interview */}
        <div
          onClick={() => document.getElementById("interview-section").scrollIntoView({ behavior: "smooth" })}
          className="cursor-pointer bg-gradient-to-br from-teal-500 to-teal-700 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition"
        >
          <h2 className="text-xl font-bold">🎤 AI Interview</h2>
          <p className="text-sm opacity-90 mt-2">Practice real interview questions</p>
        </div>

        {/* Resume Analysis */}
        <div
          onClick={() => navigate('/resume-analysis')}
          className="cursor-pointer bg-white border border-slate-200 p-6 rounded-2xl shadow hover:shadow-lg hover:scale-105 transition"
        >
          <h2 className="text-xl font-bold text-slate-800">📄 Resume Analysis</h2>
          <p className="text-sm text-slate-500 mt-2">Check ATS score & suggestions</p>
        </div>

        {/* Resume Generator */}
        <div
          onClick={() => navigate('/revision')}
          className="cursor-pointer bg-white border border-slate-200 p-6 rounded-2xl shadow hover:shadow-lg hover:scale-105 transition"
        >
          <h2 className="text-xl font-bold text-slate-800">✨ Revision Notes</h2>
          <p className="text-sm text-slate-500 mt-2">Generate Last Minute Revision Notes</p>
        </div>

      </div>

      {/* INTERVIEW FORM */}
      <div id="interview-section" className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 px-6 py-5">
          <h2 className="text-lg font-bold text-white flex items-center">
            <span className="bg-teal-500 w-1.5 h-5 rounded-full mr-3"></span>
            New Interview
          </h2>
        </div>

        <form onSubmit={onSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">

          <select name="role" value={formData.role} onChange={onChange} className="input">
            {ROLES.map((role) => <option key={role}>{role}</option>)}
          </select>

          <select name="level" value={formData.level} onChange={onChange} className="input">
            {LEVELS.map((level) => <option key={level}>{level}</option>)}
          </select>

          <select name="count" value={formData.count} onChange={onChange} className="input">
            {COUNTS.map((count) => <option key={count}>{count} Qs</option>)}
          </select>

          <select name="interviewType" value={formData.interviewType} onChange={onChange} className="input">
            {TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
          </select>

          <button
            type="submit"
            disabled={isProcessing}
            className={`h-[48px] rounded-xl font-bold text-white ${isProcessing ? 'bg-slate-300' : 'bg-teal-600 hover:bg-teal-700'}`}
          >
            {isProcessing ? "Generating..." : "Start Interview"}
          </button>

        </form>
      </div>

      {/* HISTORY */}
      <div className="space-y-6 pb-20">
        <h2 className="text-2xl font-black text-slate-800 flex items-center">
          📊 Interview History
        </h2>

        {isLoading && sessions.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-12 w-12 border-t-2 border-teal-500 rounded-full"></div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-slate-50 border-dashed border-2 rounded-2xl py-16 text-center">
            <p className="text-slate-400 font-bold">No sessions yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <SessionCard
                key={session._id}
                session={session}
                onClick={viewSession}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;