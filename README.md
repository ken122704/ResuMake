# ResuMake: AI-Powered Resume Builder 🚀

A modern, full-stack web application designed to help job seekers and fresh tech graduates build ATS-optimized, professional resumes. ResuMake features a real-time, split-screen A4 preview and integrates Google's Gemini AI to instantly transform rough notes into powerful, professional bullet points.

## ✨ Key Features

- **Real-Time Split-Screen Engine:** A dynamic dual-column layout where form updates instantly render onto an accurate, print-ready A4 paper preview.
- **AI-Enhanced Copywriting:** Integrated with the Gemini API to automatically rewrite casual job or project descriptions into strong, action-oriented bullet points.
- **Developer-Friendly Sections:** Includes dedicated "Projects" and "Skills" arrays, allowing users without extensive work history to highlight full-stack web apps (like React/Firebase builds) or automation workflows.
- **Persistent Cloud Storage:** Resumes are safely saved and loaded using a backend database, with complex nested data (like multiple jobs and education) managed via structured JSONB columns.

## 🛠️ Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript
- **Styling & UI:** Tailwind CSS, Shadcn UI
- **Backend & Database:** Supabase (PostgreSQL, Row Level Security)
- **AI Integration:** Google Gemini 2.5 Flash API
