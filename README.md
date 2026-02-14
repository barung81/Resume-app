# ResumeATS Pro 🚀

AI-powered resume optimizer that analyzes your resume against job descriptions, provides ATS compatibility scoring, keyword suggestions, and a rich Google Docs-like editor to perfect your resume.

## Features

- 📄 **Resume Upload** — PDF and DOCX support
- 🎯 **ATS Scoring** — AI-powered compatibility score (0-100)
- 🔑 **Keyword Analysis** — See matched and missing keywords
- 🤖 **Smart Suggestions** — AI recommends where to add keywords naturally
- 📝 **Rich Text Editor** — Google Docs-like editing experience (TipTap)
- 📥 **Multi-Format Download** — Export as PDF or DOCX
- 🔐 **User Authentication** — Sign up/login via Supabase
- 📊 **History Tracking** — Save and revisit past analyses

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite) + TipTap |
| Backend | Python (FastAPI) |
| Database & Auth | Supabase |
| LLM | Google Gemini (free tier) |
| Frontend Deployment | Netlify |
| Backend Deployment | Vercel |

---

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+
- A **Google Gemini API key** (free) — [Get one here](https://aistudio.google.com/apikey)
- A **Supabase project** (free) — [Create one here](https://supabase.com)

---

## Setup Instructions

### 1. Clone and Install

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
pip install -r requirements.txt
```

### 2. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **Project Settings → API** and note down:
   - **Project URL** (e.g., `https://xxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (keep secret!)
   - **JWT Secret** (under Settings → API → JWT Settings)

### 3. Set Up the Database

Go to **SQL Editor** in Supabase and run:

```sql
-- Create history table
CREATE TABLE history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_title TEXT,
  job_description TEXT,
  resume_text TEXT,
  ats_score INTEGER,
  matched_keywords JSONB,
  missing_keywords JSONB,
  suggestions JSONB,
  final_resume_html TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE history ENABLE ROW LEVEL SECURITY;

-- Policy: users can only access their own history
CREATE POLICY "Users can manage own history"
  ON history FOR ALL
  USING (auth.uid() = user_id);
```

### 4. Get a Gemini API Key

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Click "Create API Key"
3. Copy the key

### 5. Configure Environment Variables

**Frontend** (`frontend/.env`):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:8000
```

**Backend** (`backend/.env`):
```env
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```

### 6. Run Locally

**Backend** (terminal 1):
```bash
cd backend
pip install python-dotenv  # if not already installed
python -c "from dotenv import load_dotenv; load_dotenv()" # loads .env
uvicorn api.main:app --reload --port 8000
```

Or more simply, add dotenv support. Create `backend/run.py`:
```python
from dotenv import load_dotenv
load_dotenv()
import uvicorn
uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
```
Then run: `python run.py`

**Frontend** (terminal 2):
```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Deployment

### Frontend → Netlify

1. Connect your GitHub repo to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Set base directory: `frontend`
5. Add environment variables in Netlify dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` (your Vercel backend URL)

### Backend → Vercel

1. Connect your GitHub repo to Vercel
2. Set root directory to `backend`
3. Add environment variables in Vercel dashboard:
   - `GEMINI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_JWT_SECRET`
   - `FRONTEND_URL` (your Netlify URL)

> **Note:** Update `FRONTEND_URL` in backend and `VITE_API_URL` in frontend to point to the deployed URLs after deployment.

---

## Project Structure

```
Resume-app/
├── frontend/            # React (Vite)
│   ├── src/
│   │   ├── components/  # Navbar, FileUpload, ResumeEditor, etc.
│   │   ├── pages/       # Landing, Login, Signup, Dashboard, Analyze, Editor, History
│   │   ├── context/     # AuthContext
│   │   └── services/    # API client, Supabase client
│   └── netlify.toml
├── backend/             # Python (FastAPI)
│   ├── api/
│   │   ├── routes/      # resume, history, auth endpoints
│   │   ├── services/    # parser, llm, exporter, supabase
│   │   └── models/      # Pydantic schemas
│   └── vercel.json
└── README.md
```

---

## License

MIT
