import logging
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

# Role-specific keyword sets for ATS scoring without JD
ROLE_KEYWORDS = {
    "frontend": [
        "html", "css", "javascript", "react", "vue", "angular", "typescript",
        "redux", "webpack", "responsive", "ui", "dom", "rest", "api", "git",
        "tailwind", "sass", "figma", "accessibility", "performance"
    ],
    "backend": [
        "python", "java", "node", "express", "django", "fastapi", "flask",
        "sql", "postgresql", "mysql", "mongodb", "redis", "rest", "api",
        "microservices", "docker", "aws", "authentication", "git", "linux"
    ],
    "fullstack": [
        "javascript", "typescript", "react", "node", "express", "python",
        "sql", "mongodb", "postgresql", "rest", "api", "docker", "git",
        "html", "css", "redux", "authentication", "deployment", "aws", "linux"
    ],
    "devops": [
        "docker", "kubernetes", "ci", "cd", "jenkins", "aws", "azure", "gcp",
        "terraform", "ansible", "linux", "bash", "monitoring", "git",
        "nginx", "pipeline", "infrastructure", "prometheus", "grafana"
    ],
    "data": [
        "python", "pandas", "numpy", "sql", "machine learning", "statistics",
        "visualization", "tableau", "power bi", "scikit", "tensorflow",
        "jupyter", "etl", "data wrangling", "matplotlib", "seaborn", "r"
    ],
    "ml": [
        "python", "tensorflow", "pytorch", "scikit", "keras", "nlp",
        "deep learning", "neural", "pandas", "numpy", "computer vision",
        "transformers", "model", "training", "evaluation", "mlops", "docker"
    ],
}


def calculate_ats_score(resume_text: str, role: str = "", jd_text: str = "") -> float:
    """
    ATS score (0-100) based on role keyword match.
    If JD is also provided, blends role score with JD similarity.
    """
    if not resume_text:
        return 0.0

    resume_lower = resume_text.lower()
    role_key = role.lower().strip()

    # ── Role-based keyword score (always calculated) ──────────────────
    keywords = ROLE_KEYWORDS.get(role_key, [])

    if keywords:
        matched = sum(1 for kw in keywords if kw in resume_lower)
        role_score = (matched / len(keywords)) * 100
    else:
        # Unknown role — fall back to basic word richness score
        words = set(resume_lower.split())
        role_score = min(len(words) / 2, 100)

    # ── JD similarity score (only if JD uploaded) ─────────────────────
    if not jd_text or not jd_text.strip():
        return round(role_score, 2)

    jd_lower = jd_text.lower()

    # TF-IDF cosine similarity
    tfidf_sim = 0.0
    try:
        vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
        tfidf = vectorizer.fit_transform([resume_lower, jd_lower])
        tfidf_sim = float(cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0])
    except Exception as e:
        logger.warning("TF-IDF failed: %s", e)

    # Keyword overlap with JD
    jd_words = set(jd_lower.split())
    resume_words = set(resume_lower.split())
    keyword_match = len(jd_words & resume_words) / max(len(jd_words), 1)

    jd_score = (tfidf_sim * 0.6 + keyword_match * 0.4) * 100

    # Blend: 50% role score + 50% JD score when JD is present
    final_score = (role_score * 0.5) + (jd_score * 0.5)
    return round(max(0.0, min(final_score, 100.0)), 2)