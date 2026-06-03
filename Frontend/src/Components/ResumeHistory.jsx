import { FileText, Clock, TrendingUp } from "lucide-react";

export function ResumeHistory({ resumes, onSelectResume, selectedResumeId }) {

  if (resumes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No resumes analyzed yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Upload your first resume to get started
        </p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getScoreColor = (score) => {
    if (!score) return "text-gray-400";
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-orange-600";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Analyses
        </h2>
      </div>

      <div className="divide-y divide-gray-200">
        {resumes.map((resume) => (
          <button
            key={resume._id}                                {/* ✅ MongoDB uses _id */}
            onClick={() => onSelectResume(resume._id)}      {/* ✅ MongoDB uses _id */}
            className={`
              w-full p-4 text-left transition-colors
              hover:bg-gray-50 focus:outline-none focus:bg-gray-50
              ${selectedResumeId === resume._id             
                ? "bg-blue-50 border-l-4 border-blue-500"  {/* ✅ _id */}
                : ""}
            `}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <p className="font-medium text-gray-900 truncate">
                    {resume.fileName}                       {/* ✅ matches schema */}
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  {formatDate(resume.createdAt)}            {/* ✅ mongoose timestamps */}
                </p>
                {/* ✅ show role if available */}
                {resume.role && (
                  <p className="text-xs text-gray-400 mt-1">
                    {resume.role}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end gap-1">
                {resume.atsScore != null ? (             /* ✅ matches schema */
                  <>
                    <div className={`flex items-center gap-1 ${getScoreColor(resume.atsScore)}`}>
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-bold">
                        {resume.atsScore}                  {/* ✅ matches schema */}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">score</span>
                  </>
                ) : (
                  <span className="text-xs text-gray-400">No score</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}