import React, { useState } from "react";
import {
  BookOpen,
  Download,
  PlayCircle,
  FileText,
  Lightbulb,
  CheckCircle,
  XCircle,
  RotateCcw,
  Trophy,
} from "lucide-react";

const API_BASE = "http://localhost:8000";

const RevisionNotes = () => {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState("");

  const [notes, setNotes] = useState(null);
  const [rawNotes, setRawNotes] = useState(null); // ✅ stores raw backend notes for PDF
  const [quizQuestions, setQuizQuestions] = useState([]);

  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);

  // =========================================
  // GENERATE NOTES
  // =========================================
  const handleGenerateNotes = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/revision/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, depth: "detailed" }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to generate notes");
      }

      const data = await response.json();

      setNotes(data.notes);
      setRawNotes(data.raw_notes);       // ✅ save raw notes for PDF
      setQuizQuestions(data.quiz || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // DOWNLOAD PDF
  // ✅ Sends already-generated notes — no duplicate LLM call
  // =========================================
  const handleDownloadPDF = async () => {
    if (!rawNotes) return;

    setPdfLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/revision/notes/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: notes.topic,
          notes_data: rawNotes, // ✅ send raw notes directly
        }),
      });

      // ✅ Check content-type BEFORE reading as blob
      const contentType = response.headers.get("content-type");

      if (!response.ok || !contentType?.includes("application/pdf")) {
        const errText = await response.text();
        let errMsg = "PDF generation failed";
        try {
          const errJson = JSON.parse(errText);
          errMsg = errJson.detail || errMsg;
        } catch {
          errMsg = errText || errMsg;
        }
        throw new Error(errMsg);
      }

      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error("Received empty PDF file");
      }

      const url = window.URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" })
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `${notes.topic.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error("PDF download error:", err);
      setError(`Failed to download PDF: ${err.message}`);
    } finally {
      setPdfLoading(false);
    }
  };

  // =========================================
  // QUIZ FUNCTIONS
  // =========================================
  const handleStartQuiz = () => {
    setShowQuiz(true);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setScore(0);
  };

  const handleSelectAnswer = (index) => {
    setSelectedAnswers({ ...selectedAnswers, [currentQuestion]: index });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const submitQuiz = () => {
    let total = 0;
    quizQuestions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) total++;
    });
    setScore(total);
    setQuizCompleted(true);
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setScore(0);
  };

  const handleBackToNotes = () => {
    setShowQuiz(false);
    setQuizCompleted(false);
  };

  const handleNewTopic = () => {
    setNotes(null);
    setRawNotes(null);
    setQuizQuestions([]);
    setTopic("");
    setError("");
    setShowQuiz(false);
    setQuizCompleted(false);
  };

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const percentage = Math.round((score / Math.max(quizQuestions.length, 1)) * 100);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <div className="bg-indigo-600 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              {showQuiz ? "Quiz Session" : "AI Revision Notes"}
            </h1>
          </div>
          <span className="bg-white text-indigo-600 px-4 py-1 rounded-full text-sm font-semibold">
            AI Powered
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* ================================================= */}
        {/* INPUT SECTION */}
        {/* ================================================= */}
        {!notes ? (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-800 mb-3">
                Generate Revision Notes
              </h2>
              <p className="text-gray-500 text-lg">
                Enter any topic and generate AI-powered notes + quiz
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
              <div className="mb-5">
                <label className="block text-gray-700 font-semibold mb-2">
                  Topic Name
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerateNotes()}
                  placeholder="React Hooks, DBMS, OOPs..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {error && (
                <div className="bg-red-100 text-red-600 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerateNotes}
                disabled={loading || !topic.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 transition-all text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Generating...
                  </span>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Generate Notes
                  </>
                )}
              </button>
            </div>
          </div>

        ) : !showQuiz ? (
          <>
            {/* ================================================= */}
            {/* NOTES SECTION */}
            {/* ================================================= */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Revision Notes</h2>
              <button
                onClick={handleNewTopic}
                className="border border-indigo-600 text-indigo-600 px-5 py-2 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
              >
                New Topic
              </button>
            </div>

            {/* ERROR BANNER */}
            {error && (
              <div className="bg-red-100 text-red-600 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* TOPIC CARD */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
              <h3 className="text-4xl font-bold text-indigo-600 mb-4">
                {notes.topic}
              </h3>
              <p className="text-gray-600 text-lg">{notes.summary}</p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-4 justify-center mb-8">
              <button
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {pdfLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Generating PDF...
                  </span>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download PDF
                  </>
                )}
              </button>

              <button
                onClick={handleStartQuiz}
                className="bg-green-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-green-700 transition"
              >
                <PlayCircle className="w-5 h-5" />
                Start Quiz
              </button>
            </div>

            {/* KEY POINTS */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h3 className="text-2xl font-bold mb-8 text-gray-800">Key Points</h3>
              <div className="space-y-8">
                {notes.keyPoints.map((point, index) => (
                  <div key={index}>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-gray-800 mb-2">
                          {point.title}
                        </h4>
                        <p className="text-gray-600 mb-4">{point.description}</p>
                        {point.example && (
                          <div className="bg-gray-100 rounded-xl p-4 overflow-auto">
                            <code className="text-sm text-indigo-600 whitespace-pre-wrap">
                              {point.example}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                    {index !== notes.keyPoints.length - 1 && <hr className="mt-8" />}
                  </div>
                ))}
              </div>
            </div>

            {/* TIPS */}
            {notes.tips?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Lightbulb className="w-6 h-6 text-yellow-500" />
                  <h3 className="text-2xl font-bold text-gray-800">Important Tips</h3>
                </div>
                <div className="space-y-4">
                  {notes.tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 shrink-0" />
                      <p className="text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>

        ) : (
          <>
            {/* ================================================= */}
            {/* QUIZ SECTION */}
            {/* ================================================= */}
            {!quizCompleted ? (
              <>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800">
                    Quiz: {notes.topic}
                  </h2>
                  <button
                    onClick={handleBackToNotes}
                    className="border border-indigo-600 text-indigo-600 px-5 py-2 rounded-xl hover:bg-indigo-600 hover:text-white transition"
                  >
                    Back to Notes
                  </button>
                </div>

                {/* PROGRESS */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                  <div className="flex justify-between mb-3 text-sm text-gray-600">
                    <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-indigo-600 h-3 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* QUESTION CARD */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    {quizQuestions[currentQuestion]?.question}
                  </h3>
                  <div className="space-y-4">
                    {quizQuestions[currentQuestion]?.options.map((option, index) => (
                      <div
                        key={index}
                        onClick={() => handleSelectAnswer(index)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedAnswers[currentQuestion] === index
                            ? "border-indigo-600 bg-indigo-50"
                            : "border-gray-200 hover:border-indigo-300"
                        }`}
                      >
                        <span className="font-bold mr-2">{["A", "B", "C", "D"][index]}.</span>
                        {option}
                      </div>
                    ))}
                  </div>
                </div>

                {/* NAVIGATION */}
                <div className="flex justify-between mt-8">
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestion === 0}
                    className="px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 disabled:opacity-50 transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    disabled={selectedAnswers[currentQuestion] === undefined}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    {currentQuestion === quizQuestions.length - 1 ? "Submit Quiz" : "Next"}
                  </button>
                </div>
              </>

            ) : (
              <>
                {/* RESULT */}
                <div className="text-center mb-8">
                  <div className="bg-white rounded-2xl shadow-lg p-10 inline-block">
                    <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-5" />
                    <h2 className="text-4xl font-bold text-gray-800 mb-4">Quiz Completed!</h2>
                    <div className="flex items-end justify-center gap-2 mb-4">
                      <span className="text-7xl font-bold text-indigo-600">{score}</span>
                      <span className="text-3xl text-gray-500">/ {quizQuestions.length}</span>
                    </div>
                    <p className="text-lg text-gray-600">
                      {percentage >= 80
                        ? "Excellent Work 🎉"
                        : percentage >= 60
                        ? "Good Job 👍"
                        : "Keep Practicing 📚"}
                    </p>
                  </div>
                </div>

                {/* ANSWER REVIEW */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-2xl font-bold mb-8">Answer Review</h3>
                  <div className="space-y-6">
                    {quizQuestions.map((q, index) => {
                      const correct = selectedAnswers[index] === q.correctAnswer;
                      return (
                        <div key={index}>
                          <div className="flex gap-3">
                            {correct ? (
                              <CheckCircle className="text-green-600 shrink-0 mt-1" />
                            ) : (
                              <XCircle className="text-red-600 shrink-0 mt-1" />
                            )}
                            <div>
                              <p className="font-semibold text-gray-800">{q.question}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                Your Answer:{" "}
                                <span className={correct ? "text-green-600" : "text-red-600"}>
                                  {q.options[selectedAnswers[index]] ?? "Not answered"}
                                </span>
                              </p>
                              {!correct && (
                                <p className="text-sm text-green-700 mt-1">
                                  Correct Answer: {q.options[q.correctAnswer]}
                                </p>
                              )}
                              {q.explanation && (
                                <div className="bg-gray-100 rounded-lg p-3 mt-3 text-sm text-gray-700">
                                  💡 {q.explanation}
                                </div>
                              )}
                            </div>
                          </div>
                          {index !== quizQuestions.length - 1 && <hr className="mt-6" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex gap-4 justify-center mt-8">
                  <button
                    onClick={handleRetakeQuiz}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Retake Quiz
                  </button>
                  <button
                    onClick={handleBackToNotes}
                    className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-xl hover:bg-indigo-600 hover:text-white transition"
                  >
                    Back to Notes
                  </button>
                  <button
                    onClick={handleNewTopic}
                    className="border border-gray-300 px-6 py-3 rounded-xl hover:bg-gray-100 transition"
                  >
                    New Topic
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RevisionNotes;