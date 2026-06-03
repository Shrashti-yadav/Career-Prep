import { Play, Briefcase, HelpCircle } from "lucide-react";
import { useState } from "react";

const ROLES = [
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Developer",
  "Product Manager",
  "Data Scientist",
  "DevOps Engineer",
  "QA Engineer",
  "UX Designer",
  "Business Analyst",
  "Solutions Architect",
];

const INTERVIEW_TYPES = [
  {
    id: "behavioral",
    label: "Behavioral",
    description: "Questions about your experience and soft skills",
  },
  {
    id: "technical",
    label: "Technical",
    description: "Questions about programming and technical concepts",
  },
  {
    id: "mixed",
    label: "Mixed",
    description: "Combination of behavioral and technical questions",
  },
];

export function InterviewSetup({ onStartInterview, isLoading }) {
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedType, setSelectedType] = useState("mixed");
  const [numQuestions, setNumQuestions] = useState(5);

  const handleStart = () => {
    if (selectedRole) {
      onStartInterview({
        role: selectedRole,
        type: selectedType,
        numQuestions,
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-blue-600" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900">
            Interview Practice
          </h2>

          <p className="text-gray-600 mt-2">
            Prepare for your next interview with targeted questions
          </p>
        </div>

        <div className="space-y-8">

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-4">
              Select Job Role
            </label>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    selectedRole === role
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Interview Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-4">
              Interview Type
            </label>

            <div className="grid md:grid-cols-3 gap-4">
              {INTERVIEW_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedType === type.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <p
                    className={`font-semibold text-sm ${
                      selectedType === type.id
                        ? "text-blue-700"
                        : "text-gray-900"
                    }`}
                  >
                    {type.label}
                  </p>

                  <p className="text-xs text-gray-600 mt-1">
                    {type.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Number of Questions */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-4">
              Number of Questions
            </label>

            <div className="flex items-center gap-6">
              <input
                type="range"
                min="1"
                max="20"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />

              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                <span className="text-2xl font-bold text-blue-600">
                  {numQuestions}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              {numQuestions} question{numQuestions !== 1 ? "s" : ""} •
              Estimated time: {numQuestions * 3}-{numQuestions * 5} minutes
            </p>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={!selectedRole || isLoading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 rounded-lg transition-colors text-lg"
          >
            <Play className="w-6 h-6" />
            {isLoading ? "Preparing Interview..." : "Start Interview"}
          </button>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />

            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Tips for success:</p>

              <ul className="text-xs space-y-1 ml-3 list-disc">
                <li>Speak clearly and take time to think before answering</li>
                <li>Provide specific examples from your experience</li>
                <li>Stay focused and answer the complete question</li>
                <li>Ask clarifying questions if needed</li>
              </ul>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}