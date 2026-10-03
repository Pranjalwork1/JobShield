# JobShield 🛡️
> **"Verify before you trust."**  
> Next-generation recruitment evidence intake and AI-powered fraud investigation platform powered by **Google Gemini 3.8 Flash** multimodal intelligence.

[![Next.js](https://img.shields.io/badge/Next.js-16.3.8-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-3.8%20Flash-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)

---

## 📸 Interface Preview

![JobShield Interface](../ui%20final.webp)

JobShield features an elevated glassmorphic aesthetic inspired by modern fintech command centers:
- **New Era Dynamic Island**: Pinned glassmorphic HUD capsule floating at top-center with live pulse indicators, real-time investigation telemetry, and expandable controls.
- **Volumetric 3D Metric Columns**: Holographic striped indicators providing instantaneous visual feedback across Documents, Pitch Credibility, Domain Legitimacy, and Overall Trust.
- **Zentra Segmented Workspace**: Elevated desktop canvas with rounded pill contours (`rounded-[44px]`), organized across *Overview*, *Evidence Deck*, *Risk Dossier*, and *Verification*.
- **Docked AI Prompt Capsule**: Natural language interaction bar with preset verification slash commands (`/offer-authenticity`, `/recruiter-identity`, `/wire-fraud-check`, `/salary-benchmark`).
- **Interactive Robot Companion**: Pinned assistant offering real-time guidance and instant intake focusing.

---

## 🎯 The Mission & The Problem

Employment scams have surged by over 400% in recent years. Predatory actors impersonate Fortune 500 recruiters, orchestrate fake multi-stage interviews, and distribute deceptive offer letters demanding:
* Upfront "mandatory onboarding equipment deposits" or "training certification fees".
* Immediate submission of government IDs (Aadhaar, SSN, PAN) and banking coordinates before formal hire.
* Phishing redirects through subtly mistyped corporate domains (typosquatting).

**JobShield solves this.** Rather than reducing complex fraud signals to an arbitrary, ungrounded "scam score," JobShield functions as an **evidence-backed investigation workstation**. It ingests actual offer letter PDFs, recruiter emails, WhatsApp/Telegram screenshots, and job URLs, passing them through Google Gemini's multimodal vision and reasoning models to isolate empirical, verifiable facts.

---

## 🏛️ System Architecture

```mermaid
graph TD
    subgraph Client ["Client Browser (Next.js Client Components)"]
        UI["Elevated Desktop Canvas<br/>(Plus Jakarta Sans)"]
        DI["New Era Dynamic Island<br/>(Live Pulse & Status HUD)"]
        Intake["Multimodal Evidence Deck<br/>(PDFs, Screenshots, Text, URLs)"]
        Hero["Volumetric Matrix<br/>(3D Holographic Striped Columns)"]
        Dossier["Risk Dossier & Interactive<br/>Verification Checklist"]
        Mascot["Sticky Robot Companion"]
        
        UI --> DI
        UI --> Intake
        UI --> Hero
        UI --> Dossier
        UI --> Mascot
    end

    subgraph Storage ["Browser Local-First Persistence (IndexedDB)"]
        IDB[("JobShieldDB (v1)")]
        F_Store["folders (Hierarchy)"]
        C_Store["cases (Isolated Dossiers)"]
        B_Store["evidence_blobs (Binary Files & PDFs)"]
        
        IDB --> F_Store
        IDB --> C_Store
        IDB --> B_Store
    end

    subgraph Server ["Next.js Serverless Route Handler"]
        API["POST /api/analyze"]
        Val["Multipart & Payload Validator<br/>(Size check &lt;= 10MB)"]
        Packer["Multimodal Part Packer<br/>(inlineData base64 / text)"]
        SchemaValidator["Zod Schema Validator<br/>(JobShieldAnalysisSchema)"]
        
        API --> Val --> Packer
        Packer --> SchemaValidator
    end

    subgraph GeminiAI ["Google AI Studio / Gemini API"]
        GeminiFlash["gemini-3.8-flash<br/>(@google/genai SDK)"]
        PromptEngine["Zero-Tolerance Anti-Scam System Prompt"]
        JSONEnforcer["Structured JSON Output Enforcement<br/>(responseJsonSchema)"]
        
        GeminiFlash --> PromptEngine
        PromptEngine --> JSONEnforcer
    end

    Intake <--> |"Read / Persist Cases & Blobs"| Storage
    Intake --> |"Submit Investigation Payload"| API
    Packer --> |"Multimodal Parts & Prompts"| GeminiFlash
    JSONEnforcer --> |"Strict JSON Response"| SchemaValidator
    SchemaValidator --> |"Validated Analysis Result"| Dossier
    Dossier --> |"Save Analysis State"| C_Store
```

---

## 🚀 Quick Start & Usage

### Prerequisites
- [Node.js](https://nodejs.org/) (v20.x or higher)
- [npm](https://www.npmjs.com/) (v10.x or higher)
- A **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/apikey).

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env.local
```

Add your Gemini API Key in `.env.local`:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
