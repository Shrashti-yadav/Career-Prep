import { CheckCircle, AlertCircle, TrendingUp, Award, Briefcase, GraduationCap, Sparkles } from "lucide-react";

export function AnalysisResults({ resume }) {

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-orange-600";
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-orange-100";
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Work";
  };

  if (resume.analysis_status === "analyzing" || resume.analysis_status === "pending") {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-blue-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
          <div className="h-3 bg-gray-200 rounded w-64"></div>
        </div>
      </div>
    );
  }

  if (resume.analysis_status === "failed") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-700 text-center">Analysis failed. Please try again.</p>
      </div>
    );
  }

  const score = resume.overall_score || 0;

  return (
    <div className="space-y-6">

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">

        <div className="flex items-center justify-between mb-4">

          <h2 className="text-2xl font-bold text-gray-800">Resume Analysis</h2>

          <Award className="w-8 h-8 text-blue-600" />

        </div>

        <p className="text-gray-600 mb-6">File: {resume.filename}</p>

        <div className="flex items-center gap-6">

          <div className={`${getScoreBgColor(score)} rounded-full w-24 h-24 flex items-center justify-center`}>

            <div className="text-center">

              <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
                {score}
              </div>

              <div className="text-xs text-gray-600">/ 100</div>

            </div>

          </div>

          <div>

            <p className={`text-xl font-semibold ${getScoreColor(score)}`}>
              {getScoreLabel(score)}
            </p>

            <p className="text-gray-600 mt-1">
              {resume.detailed_feedback}
            </p>

          </div>

        </div>

      </div>

      <div className="grid md:grid-cols-3 gap-4">

        <div className="bg-white rounded-lg p-6 border border-gray-200">

          <div className="flex items-center gap-2 mb-3">

            <Briefcase className="w-5 h-5 text-blue-600" />

            <h3 className="font-semibold text-gray-800">
              Experience
            </h3>

          </div>

          <p className="text-2xl font-bold text-gray-900">
            {resume.experience_years || "N/A"}
            {resume.experience_years ? " years" : ""}
          </p>

        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">

          <div className="flex items-center gap-2 mb-3">

            <GraduationCap className="w-5 h-5 text-blue-600" />

            <h3 className="font-semibold text-gray-800">
              Education
            </h3>

          </div>

          <p className="text-2xl font-bold text-gray-900">
            {resume.education_level || "Not specified"}
          </p>

        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">

          <div className="flex items-center gap-2 mb-3">

            <Sparkles className="w-5 h-5 text-blue-600" />

            <h3 className="font-semibold text-gray-800">
              Skills Found
            </h3>

          </div>

          <p className="text-2xl font-bold text-gray-900">
            {resume.skills?.length || 0}
          </p>

        </div>

      </div>

      {resume.skills && resume.skills.length > 0 && (

        <div className="bg-white rounded-xl p-6 border border-gray-200">

          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">

            <TrendingUp className="w-5 h-5 text-blue-600" />

            Identified Skills

          </h3>

          <div className="flex flex-wrap gap-2">

            {resume.skills.map((skill, index) => (

              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
              >
                {skill}
              </span>

            ))}

          </div>

        </div>

      )}

      {resume.strengths && resume.strengths.length > 0 && (

        <div className="bg-white rounded-xl p-6 border border-gray-200">

          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">

            <CheckCircle className="w-5 h-5 text-green-600" />

            Strengths

          </h3>

          <ul className="space-y-2">

            {resume.strengths.map((strength, index) => (

              <li key={index} className="flex items-start gap-2">

                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />

                <span className="text-gray-700">
                  {strength}
                </span>

              </li>

            ))}

          </ul>

        </div>

      )}

      {resume.improvements && resume.improvements.length > 0 && (

        <div className="bg-white rounded-xl p-6 border border-gray-200">

          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">

            <AlertCircle className="w-5 h-5 text-orange-600" />

            Areas for Improvement

          </h3>

          <ul className="space-y-2">

            {resume.improvements.map((improvement, index) => (

              <li key={index} className="flex items-start gap-2">

                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />

                <span className="text-gray-700">
                  {improvement}
                </span>

              </li>

            ))}

          </ul>

        </div>

      )}

    </div>
  );
}