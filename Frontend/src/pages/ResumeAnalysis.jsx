import React, { useState } from "react";
import axios from "axios";

import {
  Upload,
  FileText,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

import {
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ResumeAnalysis = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [jdFile, setJdFile] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");

  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) setResumeFile(file);
  };

  const handleJDUpload = (e) => {
    const file = e.target.files[0];
    if (file) setJdFile(file);
  };

  const handleAnalyze = async () => {
    try {
      if (!resumeFile) {
        alert("Please upload resume");
        return;
      }
      if (!jdFile && !selectedRole) {
        alert("Please upload JD or select role");
        return;
      }

      setLoading(true);
      setAnalysisData(null);
      setIsAnalyzed(false);

      const formData = new FormData();
      formData.append("resume", resumeFile);
      if (jdFile) formData.append("jd", jdFile);
      if (selectedRole) formData.append("role", selectedRole);

      const response = await axios.post(
        "http://localhost:5000/api/analyze/resume/analyze",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const output =
        response?.data?.result ||
        response?.data?.data ||
        response?.data;

      if (!output) throw new Error("No analysis data received");

      setAnalysisData(output);
      setIsAnalyzed(true);

      try {
        const user = JSON.parse(localStorage.getItem("user"));
        await fetch("http://localhost:5000/api/history/resume", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({
            fileName: resumeFile.name,
            role: selectedRole || "Not specified",
            atsScore: output.atsScore ?? 0,
            summary: output.summary ?? {},
            strengths: output.strengths ?? [],
            weaknesses: output.weaknesses ?? [],
            missingSkills: output.missingSkills ?? [],
            suggestions: output.suggestions ?? [],
            recruiterImpression: output.recruiterImpression ?? "",
            skillsData: output.skillsData ?? [],
            radarData: output.radarData ?? [],
          }),
        });
      } catch (err) {
        console.warn("Failed to save resume history:", err.message);
      }
    } catch (error) {
      console.error("ANALYSIS ERROR:", error);
      if (error.response) {
        alert(error.response.data?.message || "Backend Error Occurred");
      } else if (error.request) {
        alert("Cannot connect to backend server");
      } else {
        alert(error.message || "Analysis Failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const score = analysisData?.atsScore ?? 0;

  const getMatchLabel = (s) => {
    if (s >= 70) return "Good Match";
    if (s >= 40) return "Fair Match";
    return "Poor Match";
  };

  const getMatchColors = (s) => {
    if (s >= 70) return { bg: "bg-green-100", icon: "text-green-600", text: "text-green-700", border: "border-green-200" };
    if (s >= 40) return { bg: "bg-yellow-100", icon: "text-yellow-600", text: "text-yellow-700", border: "border-yellow-200" };
    return { bg: "bg-red-100", icon: "text-red-600", text: "text-red-700", border: "border-red-200" };
  };

  const getScoreColor = (s) => {
    if (s >= 70) return "text-blue-600";
    if (s >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getAtsMessage = (s) => {
    if (s >= 70) return "✅ Your resume is well optimized for ATS";
    if (s >= 40) return "⚠️ Your resume partially matches ATS criteria";
    return "❌ Your resume needs significant ATS improvements";
  };

  const matchColors = getMatchColors(score);
  const MatchIcon = score >= 40 ? TrendingUp : TrendingDown;

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER — matches CareerPrep AI blue/indigo */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-white text-2xl font-bold">Resume Analysis</h1>
          </div>
          <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
            AI Powered
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {!isAnalyzed ? (
          <>
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold mb-2">Upload Your Resume</h2>
              <p className="text-gray-600">Get instant ATS score and detailed feedback</p>
            </div>

            {/* UPLOAD SECTION */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Resume Upload */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-dashed hover:border-blue-500 transition">
                <div className="flex items-center gap-2 mb-3">
                  <Upload className="text-blue-600" />
                  <h3 className="text-xl font-semibold">Upload Resume</h3>
                </div>
                <p className="text-gray-500 mb-4">PDF, DOC, DOCX (Max 5MB)</p>
                <label className="border-2 border-dashed rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition">
                  <Upload className="w-10 h-10 text-blue-600 mb-3" />
                  <p className="text-gray-600">Click to upload or drag & drop</p>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                  />
                </label>
                {resumeFile && (
                  <div className="flex items-center gap-2 mt-4 bg-blue-50 p-3 rounded-lg">
                    <FileText className="text-blue-600" />
                    <span className="truncate">{resumeFile.name}</span>
                    <CheckCircle className="ml-auto text-green-600 flex-shrink-0" />
                  </div>
                )}
              </div>

              {/* JD Upload */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-dashed hover:border-blue-500 transition">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="text-blue-600" />
                  <h3 className="text-xl font-semibold">Upload Job Description</h3>
                </div>
                <p className="text-gray-500 mb-4">Upload JD or Select Role</p>
                <label className="border-2 border-dashed rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition">
                  <Upload className="w-10 h-10 text-blue-600 mb-3" />
                  <p className="text-gray-600">Upload JD</p>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleJDUpload}
                  />
                </label>
                {jdFile && (
                  <div className="flex items-center gap-2 mt-4 bg-blue-50 p-3 rounded-lg">
                    <FileText className="text-blue-600" />
                    <span className="truncate">{jdFile.name}</span>
                    <CheckCircle className="ml-auto text-green-600 flex-shrink-0" />
                  </div>
                )}
              </div>
            </div>

            {/* ROLE SELECTION */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
              <h3 className="text-xl font-semibold mb-4">Select Target Role</h3>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a Role</option>
                <option value="frontend">Frontend Developer</option>
                <option value="backend">Backend Developer</option>
                <option value="fullstack">Full Stack Developer</option>
                <option value="devops">DevOps Engineer</option>
                <option value="data">Data Scientist</option>
                <option value="ml">Machine Learning Engineer</option>
              </select>
            </div>

            {/* ANALYZE BUTTON */}
            <div className="flex justify-center mt-8">
              <button
                onClick={handleAnalyze}
                disabled={!resumeFile || (!selectedRole && !jdFile) || loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl text-lg font-semibold transition shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  "Analyze Resume"
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* RESULTS HEADER */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Analysis Results</h2>
              <button
                onClick={() => {
                  setIsAnalyzed(false);
                  setAnalysisData(null);
                  setShowDetails(false);
                  setResumeFile(null);
                  setJdFile(null);
                  setSelectedRole("");
                }}
                className="flex items-center gap-2 border border-blue-600 text-blue-600 px-5 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition"
              >
                <RotateCcw className="w-4 h-4" />
                Analyze Another
              </button>
            </div>

            {/* ATS SCORE */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div>
                  <h3 className="text-gray-500 text-lg mb-2">Overall ATS Score</h3>
                  <div className="flex items-end gap-2">
                    <span className={`text-7xl font-bold ${getScoreColor(score)}`}>{score}</span>
                    <span className="text-3xl text-gray-500">/100</span>
                  </div>
                  <p className="text-gray-500 mt-3">{getAtsMessage(score)}</p>
                </div>

                <div className="text-center mt-6 md:mt-0">
                  <div className={`${matchColors.bg} ${matchColors.border} border p-5 rounded-full inline-block`}>
                    <MatchIcon className={`w-10 h-10 ${matchColors.icon}`} />
                  </div>
                  <p className={`mt-2 font-semibold ${matchColors.text}`}>{getMatchLabel(score)}</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-700 ${
                      score >= 70 ? "bg-gradient-to-r from-blue-600 to-indigo-600"
                      : score >= 40 ? "bg-yellow-500"
                      : "bg-red-500"
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            </div>

            {/* SUMMARY */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <h3 className="text-2xl font-semibold mb-6">Resume Summary</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Name</p>
                  <p className="font-semibold">{analysisData?.summary?.name || "—"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Email</p>
                  <p className="font-semibold">{analysisData?.summary?.email || "—"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Phone</p>
                  <p className="font-semibold">{analysisData?.summary?.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Experience</p>
                  <p className="font-semibold">{analysisData?.summary?.experience || "—"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Education</p>
                  <p className="font-semibold">{analysisData?.summary?.education || "—"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-gray-500 text-sm">Skills</p>
                  <p className="font-semibold">{analysisData?.summary?.skills || "—"}</p>
                </div>
              </div>
            </div>

            {/* RECRUITER IMPRESSION */}
            {analysisData?.recruiterImpression && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="text-blue-600 w-5 h-5" />
                  <h3 className="text-lg font-semibold text-blue-800">Recruiter Impression</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{analysisData.recruiterImpression}</p>
              </div>
            )}

            {/* TOGGLE DETAILS BUTTON */}
            <div className="flex justify-center mb-8">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition shadow"
              >
                {showDetails ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                {showDetails ? "Hide" : "See"} Detailed Analysis
              </button>
            </div>

            {/* DETAILS */}
            {showDetails && (
              <>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-6 shadow">
                    <h3 className="text-2xl font-semibold text-green-700 mb-4 flex items-center gap-2">
                      <TrendingUp /> Strengths
                    </h3>
                    {analysisData?.strengths?.length ? (
                      <ul className="space-y-3">
                        {analysisData.strengths.map((item, index) => (
                          <li key={index} className="flex gap-2">
                            <CheckCircle className="text-green-600 w-5 h-5 mt-1 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-400 italic">No strengths found.</p>
                    )}
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 shadow">
                    <h3 className="text-2xl font-semibold text-orange-700 mb-4 flex items-center gap-2">
                      <TrendingDown /> Weaknesses
                    </h3>
                    {analysisData?.weaknesses?.length ? (
                      <ul className="space-y-3">
                        {analysisData.weaknesses.map((item, index) => (
                          <li key={index} className="flex gap-2">
                            <XCircle className="text-orange-600 w-5 h-5 mt-1 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-400 italic">No weaknesses found.</p>
                    )}
                  </div>
                </div>

                {analysisData?.missingSkills?.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 shadow">
                    <h3 className="text-2xl font-semibold text-red-700 mb-4 flex items-center gap-2">
                      <XCircle /> Missing Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysisData.missingSkills.map((skill, index) => (
                        <span key={index} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {analysisData?.suggestions?.length > 0 && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 mb-8 shadow">
                    <h3 className="text-2xl font-semibold text-indigo-700 mb-4 flex items-center gap-2">
                      <CheckCircle /> Suggestions
                    </h3>
                    <ul className="space-y-3">
                      {analysisData.suggestions.map((item, index) => (
                        <li key={index} className="flex gap-2">
                          <span className="text-indigo-600 font-bold mt-0.5">{index + 1}.</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysisData?.skillsData?.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <h3 className="text-2xl font-semibold mb-6">Skill Score Breakdown</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analysisData.skillsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="skill" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {analysisData?.radarData?.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <h3 className="text-2xl font-semibold mb-6">Competency Analysis</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <RadarChart data={analysisData.radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="category" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar name="Score" dataKey="score" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalysis;