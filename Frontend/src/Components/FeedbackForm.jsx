import { useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Star, Send, CheckCircle } from "lucide-react";

const FeedbackForm = () => {
  const { user } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    role:    "",
    message: "",
    rating:  0,
  });

  const [hoveredStar, setHoveredStar] = useState(0);
  const [loading, setLoading]         = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [error, setError]             = useState("");

  const handleSubmit = async () => {
    setError("");

    if (!form.rating) {
      setError("Please select a star rating");
      return;
    }
    if (!form.message.trim()) {
      setError("Please write a message");
      return;
    }
    if (!user) {
      setError("Please login to submit feedback");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        "http://localhost:5000/api/feedback",
        {
          role:    form.role,
          message: form.message,
          rating:  form.rating,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      setSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to submit feedback"
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ────────────────────────────────────────
  if (submitted) {
    return (
      <div className="bg-card border border-border rounded-2xl p-10 text-center max-w-md mx-auto">
        <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Thank You!</h3>
        <p className="text-muted-foreground text-sm">
          Your feedback has been submitted and will appear on the home page.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-8 max-w-md mx-auto">
      <h3 className="text-xl font-bold mb-1">Share Your Experience</h3>
      <p className="text-muted-foreground text-sm mb-6">
        Help others by sharing how CareerPrep AI helped you.
      </p>

      {/* Star Rating */}
      <div className="mb-5">
        <label className="text-sm font-medium mb-2 block">
          Your Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setForm({ ...form, rating: star })}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hoveredStar || form.rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Role (optional) */}
      <div className="mb-4">
        <label className="text-sm font-medium mb-2 block">
          Your Role <span className="text-muted-foreground">(optional)</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Frontend Developer, Student"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Message */}
      <div className="mb-6">
        <label className="text-sm font-medium mb-2 block">
          Your Message <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          placeholder="How did CareerPrep AI help you?"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          maxLength={500}
          className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <p className="text-xs text-muted-foreground text-right mt-1">
          {form.message.length}/500
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-500 text-sm mb-4">{error}</p>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Submit Feedback
          </>
        )}
      </button>

      {!user && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          Please{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            login
          </a>{" "}
          to submit feedback
        </p>
      )}
    </div>
  );
};

export default FeedbackForm;