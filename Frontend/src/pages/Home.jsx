import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Brain,
  FileText,
  BookOpen,
  Zap,
  ArrowRight,
  CheckCircle2,
  Star,
  Quote,
} from "lucide-react";

const Home = () => {
  const { user } = useSelector((state) => state.auth);

  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);

  // ── Fetch real user feedbacks on mount ──────────────────
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/feedback");
        setFeedbacks(res.data?.data || []);
      } catch (err) {
        console.warn("Could not load feedbacks:", err.message);
        setFeedbacks([]);
      } finally {
        setFeedbackLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI Mock Interviews",
      description:
        "Practice with AI-powered interviews tailored to your target role and experience level.",
      iconBg: "bg-blue-500/10 dark:bg-blue-500/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      link: "/dashboard",
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Resume Analysis",
      description:
        "Get instant ATS optimization insights and personalized improvement suggestions.",
      iconBg: "bg-violet-500/10 dark:bg-violet-500/20",
      iconColor: "text-violet-600 dark:text-violet-400",
      link: "/resume-analysis",
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Smart Revision Notes",
      description:
        "AI-generated structured notes for DSA, OS, DBMS with revision support.",
      iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      link: "/revision",
    },
  ];

  const renderStars = (rating = 5) =>
    Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
      />
    ));

  return (
    <div className="min-h-screen">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative px-6 pt-24 pb-20 max-w-6xl mx-auto text-center">

        {user && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">
              Hello, {user?.name?.split(" ")[0]} 👋
            </span>
          </div>
        )}

        <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full mb-10">
          <Zap className="w-4 h-4" />
          <span className="text-sm font-medium">AI-Powered Interview Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
          Master Your Next
          <span className="block mt-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
            Tech Interview
          </span>
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
          Practice interviews, optimize your resume, and master core CS concepts
          with AI assistance designed to improve your performance step by step.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 justify-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition"
          >
            Start Practicing
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/resume-analysis"
            className="px-7 py-3 bg-background border border-border rounded-xl font-medium hover:bg-accent transition"
          >
            Explore Features
          </Link>
        </div>
      </section>

      {/* ── USER FEEDBACKS ───────────────────────────────── */}
      {!feedbackLoading && feedbacks.length > 0 && (
        <section className="px-6 pb-20 max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">What Our Users Say</h2>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">
              Real feedback from real people who used CareerPrep AI.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {feedbacks.slice(0, 6).map((fb, i) => (
              <div
                key={fb._id || i}
                className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 hover:shadow-lg transition"
              >
                {/* Quote icon */}
                <Quote className="w-6 h-6 text-blue-400 opacity-60" />

                {/* Message */}
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  "{fb.message}"
                </p>

                {/* Stars */}
                {fb.rating && (
                  <div className="flex gap-1">
                    {renderStars(fb.rating)}
                  </div>
                )}

                {/* User info */}
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {fb.userName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {fb.userName || "Anonymous"}
                    </p>
                    {fb.role && (
                      <p className="text-xs text-muted-foreground">
                        {fb.role}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section className="px-6 pb-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-3">
            Everything You Need to Succeed
          </h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">
            Complete AI-powered interview preparation suite built for real-world success.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-7">
          {features.map((f, i) => (
            <Link
              key={i}
              to={f.link}
              className="group bg-card border border-border rounded-2xl p-7 hover:shadow-xl transition"
            >
              <div className={`w-12 h-12 flex items-center justify-center rounded-xl mb-5 ${f.iconBg} ${f.iconColor}`}>
                {f.icon}
              </div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.description}
              </p>
              <div className="mt-5 text-sm text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                Learn more <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="px-6 pb-24 max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-12">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-blue-100 mb-8 text-base leading-relaxed">
            Join thousands of students preparing smarter with AI-driven practice.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-7 py-3 bg-white text-blue-600 rounded-xl font-bold"
          >
            Get Started <CheckCircle2 className="w-5 h-5" />
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;