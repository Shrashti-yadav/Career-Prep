import React from "react";
import { Routes, Route } from "react-router-dom";
import useSocket from "./Hooks/useSocket";
import { ToastContainer } from "react-toastify";

// Layout
import Header from "./Components/Header";
import Footer from "./Components/Footer";

// Pages
import Home from "./pages/Home"; // ✅ Landing Page
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import InterviewRunner from "./pages/InterviewRunner";
import SessionReview from "./pages/SessionReview";
import ResumeAnalysis from "./pages/ResumeAnalysis";
//import ResumeGenerator from "./pages/ResumeGenerator";
import RevisionNotes from "./pages/RevisionNotes";
import NotFound from "./pages/NotFound";

// Auth
import PrivateRoute from "./Components/PrivateRoute";

const App = () => {
  useSocket();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* Header always visible */}
      <Header />

      {/* Main content */}
      <main className="flex-grow container mx-auto p-4">

        <Routes>

          {/* ================= PUBLIC ROUTES ================= */}
          <Route path="/" element={<Home />} /> {/* ⭐ LANDING PAGE */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ================= PROTECTED ROUTES ================= */}
          <Route path="/" element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/interview/:sessionId" element={<InterviewRunner />} />
            <Route path="/review/:sessionId" element={<SessionReview />} />
            <Route path="/resume-analysis" element={<ResumeAnalysis />} />
            {/* <Route path="/resume-generator" element={<ResumeGenerator />} /> */}
            <Route path="/revision" element={<RevisionNotes />} />
          </Route>

          {/* ================= 404 ================= */}
          <Route path="*" element={<NotFound />} />

        </Routes>

      </main>

      {/* Footer only for public/marketing feel (optional keep always) */}
      <Footer />

      {/* Toast notifications */}
      <ToastContainer position="top-right" autoClose={3000} />

    </div>
  );
};

export default App;