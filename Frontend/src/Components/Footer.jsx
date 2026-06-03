import React from "react";
import { Link } from "react-router-dom";
import { Github, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // 🔧 Replace these with your actual links
  const SOCIAL = {
    github:   "https://github.com/YOUR_USERNAME",
    linkedin: "https://linkedin.com/in/YOUR_PROFILE",
    email:    "mailto:support@careerprepai.com",
  };

  return (
    <footer className="bg-slate-900 text-slate-300 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">AI</span>
              </div>
              <h2 className="text-xl font-bold text-white">CareerPrep AI</h2>
            </div>

            <p className="text-slate-400 max-w-md">
              AI-powered platform to help you prepare for interviews, analyze resumes,
              generate revision notes, and track your career readiness in one place.
            </p>

            {/* Social — link to your GitHub repo, LinkedIn, or support email */}
            <div className="flex gap-4 mt-6">
              <a
                href={SOCIAL.github}
                target="_blank"
                rel="noreferrer"
                title="GitHub — view source / project repo"
                className="w-10 h-10 bg-slate-800 hover:bg-teal-600 rounded-lg flex items-center justify-center transition"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href={SOCIAL.linkedin}
                target="_blank"
                rel="noreferrer"
                title="LinkedIn — connect with the developer"
                className="w-10 h-10 bg-slate-800 hover:bg-teal-600 rounded-lg flex items-center justify-center transition"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href={SOCIAL.email}
                title="Email — contact support"
                className="w-10 h-10 bg-slate-800 hover:bg-teal-600 rounded-lg flex items-center justify-center transition"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="hover:text-teal-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-teal-400 transition">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-teal-400 transition">
                  Login
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © {currentYear} CareerPrep AI. Built for consistent interview growth.
          </p>
          <div className="flex gap-6 text-sm">
            <a href={SOCIAL.email} className="text-slate-500 hover:text-teal-400 transition">
              Privacy Policy
            </a>
            <a href={SOCIAL.email} className="text-slate-500 hover:text-teal-400 transition">
              Terms
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;