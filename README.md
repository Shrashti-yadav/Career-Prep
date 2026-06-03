<div align="center">

# 🤖 CareerPrep AI

### AI-Powered Career Preparation Platform

*Practice interviews · Analyze resumes · Generate revision notes · Ace your next interview*

🌐 **Live Demo:** [https://career-prep-front.vercel.app/](https://career-prep-front.vercel.app/)



</div>

---

## 📌 Overview

**CareerPrep AI** is a full-stack AI platform designed to help students and developers prepare for technical interviews. It combines resume analysis, AI mock interviews, smart revision notes, and quiz practice — all powered by Google Gemini and LangGraph agentic pipelines.

---

## ✨ Features

### 📄 Resume Analysis
- Upload PDF or DOCX resume
- ATS scoring — role-based keyword match + TF-IDF cosine similarity against job description
- **Self-RAG** — Gemini re-evaluates its own analysis in adversarial auditor mode
- **Explainable RAG** — score breakdown by keyword match, experience depth, education fit, formatting, and skills coverage
- FAISS vector store for similar past analyses context
- Strengths, weaknesses, missing skills, suggestions, and recruiter impression
- History saved per user with full expandable details

### 🎤 AI Mock Interviews
- Generate role-specific interview questions (Junior / Mid / Senior)
- Supports coding-mix and oral interview types
- **Voice answer support** — audio uploaded to Gemini File Service, transcribed via Gemini 2.5 Flash
- AI evaluation of each answer with scores and feedback
- Session history with overall score tracking

### 📝 Smart Revision Notes
- Generate structured last-minute notes for any tech topic (DSA, OS, DBMS, etc.)
- Key concepts with examples, important points, common mistakes, interview tips
- Quick revision cheat sheet
- **Download as PDF** — dark-themed, professionally formatted
- Quiz generation from notes context (MCQ with difficulty levels)
- Notes history saved per user

### 👤 User Profile
- Complete activity dashboard — interviews, analyses, notes
- Resume analysis history with expandable details
- Revision notes viewer with modal
- Interview session tracking with scores and status
- Feedback submission with star rating

### 🏠 Home Page
- Real user feedback/testimonials fetched from database
- Feature showcase and CTA sections

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                │
│  Resume Analysis · Interview · Revision · Profile   │
└───────────────────┬─────────────────────────────────┘
                    │ REST API
┌───────────────────▼─────────────────────────────────┐
│              Backend (Express.js)                   │
│  Auth · History · Sessions · Feedback · Routes      │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│              AI Service (FastAPI)                   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │           LangGraph Pipelines               │   │
│  │                                             │   │
│  │  Resume Graph:                              │   │
│  │  RAG Lookup → Analyze → Self-RAG →          │   │
│  │  Explainable RAG → Finalize                 │   │
│  │                                             │   │
│  │  Interview Graph:                           │   │
│  │  Generate Questions → Format                │   │
│  │                                             │   │
│  │  Evaluation Graph:                          │   │
│  │  Evaluate Answer → Score → Feedback         │   │
│  │                                             │   │
│  │  Revision Graph:                            │   │
│  │  RAG Lookup → Generate Notes → Finalize     │   │
│  │  Quiz Graph:                                │   │
│  │  Generate MCQ → Format → Output             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Gemini 2.5 Flash · FAISS RAG · PyMuPDF            │
│  Gemini File Service (Audio Transcription)          │
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 14 / React 18 | UI framework |
| Tailwind CSS | Styling |
| Redux Toolkit | Auth state management |
| Recharts | ATS score charts |
| Axios | API calls |
| Lucide React | Icons |

### Backend (Express.js)
| Technology | Purpose |
|---|---|
| Express.js | REST API server |
| MongoDB + Mongoose | User data, history, feedback |
| JWT | Authentication |
| Multer | File uploads |

### AI Service (FastAPI + Python)
| Technology | Purpose |
|---|---|
| FastAPI | AI microservice |
| LangGraph | Agentic graph pipelines |
| Google Gemini 2.5 Flash | LLM for all AI tasks |
| Gemini File Service | Cloud audio upload + transcription |
| Gemini Embedding Model | Text embeddings for RAG |
| FAISS | Vector store for RAG |
| PyMuPDF (fitz) | PDF parsing + PDF generation |
| python-docx | DOCX resume parsing |
| scikit-learn | TF-IDF ATS scoring |
| pydub | Audio format conversion before upload |
| Tenacity | LLM retry logic |

---



## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB Atlas account
- Google Gemini API key

---

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/careerprep-ai.git
cd careerprep-ai
```

### 2. AI Service setup
```bash
cd ai-service
pip install -r requirements.txt
```

Create `ai-service/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=models/gemini-2.5-flash
GEMINI_EMBEDDING_MODEL=models/embedding-001
AI_SERVICE_PORT=8000
```

Start the AI service:
```bash
python main.py
```

---

### 3. Backend setup
```bash
cd Backend
npm install
```

Create `Backend/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
AI_SERVICE_URL=http://localhost:8000
GOOGLE_CLIENT_ID=your_google_client_id
FRONTEND_URL=http://localhost:5173
```

Start the backend:
```bash
npm run dev
```

---

### 4. Frontend setup
```bash
cd Frontend
npm install
```

Create `Frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_AI_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Start the frontend:
```bash
npm run dev
```

---

### 5. Open in browser
```
http://localhost:3000
```

---

## 🧠 RAG Pipeline (Resume Analysis)

```
Upload Resume
      │
      ▼
1. RAG Lookup      — search FAISS for similar past analyses
      │
      ▼
2. First-pass      — Gemini analyzes resume with RAG context
      │
      ▼
3. Self-RAG        — Gemini audits its own response critically
      │               (adversarial re-evaluation mode)
      ▼
4. Explainable RAG — Gemini justifies the ATS score
      │               with category-wise breakdown
      ▼
5. Finalize        — parse JSON, store in FAISS, return to user
```

---

## 🎤 Audio Transcription Pipeline

```
User records voice answer
      │
      ▼
pydub converts to MP3
      │
      ▼
Gemini File Service upload
      │
      ▼
Wait for PROCESSING → ACTIVE
      │
      ▼
Gemini 2.5 Flash transcribes audio
      │
      ▼
File deleted from cloud
      │
      ▼
Plain text → Evaluation Graph
```

---

## 📊 ATS Scoring Formula

**Without JD:**
```
score = (matched_role_keywords / total_keywords) × 100
```

**With Job Description:**
```
jd_score = (TF-IDF cosine similarity × 0.6) + (keyword overlap × 0.4)
final    = (role_score × 0.5) + (jd_score × 0.5)
```

---



<div align="center">

Built with ❤️.

</div>
