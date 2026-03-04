<p align="center">
  <img src="public/favicon.svg" width="80" alt="HridaySetu Logo" />
</p>

<h1 align="center">HridaySetu</h1>

<p align="center">
  <strong>AI-Powered Healthcare Report Analysis Platform</strong><br/>
  <sub>Upload medical reports. Get instant AI-driven clinical insights.</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/shadcn/ui-Radix-000000?logo=radixui&logoColor=white" alt="shadcn/ui" />
  <img src="https://img.shields.io/badge/Recharts-2.15-FF6384?logo=chartdotjs&logoColor=white" alt="Recharts" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/AWS-SageMaker-FF9900?logo=amazonaws&logoColor=white" alt="AWS SageMaker" />
  <img src="https://img.shields.io/badge/AWS-API_Gateway-FF9900?logo=amazonapigateway&logoColor=white" alt="API Gateway" />
  <img src="https://img.shields.io/badge/Med42-Llama3_8B-8B5CF6" alt="Med42" />
  <img src="https://img.shields.io/badge/OCR-Document_AI-10B981" alt="OCR" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

---

## Overview

HridaySetu is a privacy-first, AI-powered healthcare platform that lets patients and doctors upload medical reports (blood tests, lab panels, diagnostic scans), extracts structured data via OCR, and generates clinical summaries, plain-language explanations, and actionable health insights — all powered by a clinical AI model.

## The Problem

- Patients receive complex lab reports they cannot understand
- Medical data is scattered across hospitals with no unified view
- Doctors spend excessive time interpreting routine reports
- Existing health AI tools are trained on foreign datasets, not Indian clinical data
- No easy way to track health trends across multiple reports over time

## How HridaySetu Solves It

| Feature | Description |
|---------|-------------|
| **Smart Document Extraction** | Upload a PDF or photo of any medical report — OCR extracts every parameter, value, and reference range into structured data |
| **Clinical Intelligence Engine** | AI analyzes the extracted data and generates a clinical summary, patient-friendly explanation, and structured insights (severity, abnormal markers, possible causes, follow-up recommendations) |
| **AI Health Assistant** | Conversational chat with full report context — ask "what is my bilirubin?" and get the exact value with clinical meaning |
| **Health Trends & Insights** | Track parameter trends across multiple reports over time with dynamic charts |
| **Multi-Role Access** | Separate dashboards for Patients, Doctors, and Admins with role-specific views |
| **Sample Reports** | 5 built-in sample medical reports for instant testing without uploading |
| **Privacy-First** | All data processed through your own configured endpoints — nothing shared externally |

## Tech Stack

### Frontend

| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework with hooks and functional components |
| **TypeScript 5.8** | Type safety across the entire codebase |
| **Vite 5.4** | Lightning-fast dev server and optimized production builds |
| **Tailwind CSS 3.4** | Utility-first styling with custom design tokens |
| **shadcn/ui** | Accessible component library built on Radix UI primitives |
| **Lucide React** | Beautiful, consistent icon set |
| **Recharts** | Responsive charts for health trend visualization |
| **React Router DOM 6** | Client-side routing with nested layouts |
| **TanStack React Query** | Server state management and data fetching |
| **React Hook Form + Zod** | Form handling with schema validation |
| **date-fns** | Lightweight date formatting |

### AI / Backend

| Technology | Purpose |
|-----------|---------|
| **AWS SageMaker** | Hosts the Med42 clinical reasoning model (Llama3-Med42-8B) |
| **AWS API Gateway** | REST endpoints for OCR and analysis services |
| **Document OCR** | Extracts text from uploaded medical report images/PDFs |
| **Med42 (Llama3-8B)** | Clinical AI model for report analysis, summaries, and chat |
| **Vite Proxy** | Dev-time API proxy; CloudFront/Amplify proxy in production |

### Design & UX

| Aspect | Implementation |
|--------|---------------|
| **Theme** | Dark sidebar + light content area with teal (`#14b8a6`) accent |
| **Typography** | Inter font family with `font-display` for headings |
| **Animations** | `tailwindcss-animate` for fade-ins, pulse effects, and transitions |
| **Glassmorphism** | Backdrop blur + translucent backgrounds on header and cards |
| **Responsive** | Mobile-first design with collapsible sidebar |
| **Accessibility** | Radix UI primitives with ARIA labels, screen-reader support |

## Project Structure

```
src/
├── components/
│   ├── chat/           # ChatPanel — conversational AI with report context
│   ├── common/         # AiBadge, shared components
│   ├── dashboard/      # StatCard, ReportCard
│   ├── layout/         # AppLayout, AppSidebar
│   ├── ui/             # shadcn/ui primitives (dialog, button, badge, etc.)
│   └── upload/         # UploadZone with drag-drop, sample reports, processing stepper
├── contexts/           # AppContext — global state (user, reports, chat sessions)
├── pages/
│   ├── Index.tsx        # Landing page with role selection
│   ├── Dashboard.tsx    # User dashboard with stats & recent reports
│   ├── ChatPage.tsx     # AI Health Assistant with per-user session isolation
│   ├── ReportDetail.tsx # Full report view with AI insights, zoom preview
│   ├── InsightsPage.tsx # Health trends, parameter charts, abnormal breakdown
│   └── AnalyticsPage.tsx
├── services/
│   ├── aiService.ts     # OCR, reasoning, and chat API integration
│   └── mockData.ts      # Seed data for demo mode
├── types/
│   └── index.ts         # TypeScript interfaces (Report, ChatSession, User, etc.)
└── hooks/               # Custom React hooks
```

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- Access to the OCR and Analysis API endpoints (AWS SageMaker)

### Installation

```bash
# Clone the repository
git clone https://github.com/AI-for-bharat/HridaySetu.git
cd HridaySetu

# Install dependencies
npm install

# Start development server
npm run dev
```

The app runs at `http://localhost:8080`. The Vite dev server proxies `/api/ocr` and `/api/analysis` to the configured AWS endpoints.

### Environment Variables (Optional)

Create a `.env` file to override the default API endpoints:

```env
VITE_OCR_URL=/api/ocr
VITE_AI_ANALYSIS_URL=/api/analysis
VITE_AI_ANALYSIS_MODEL=m42-health/Llama3-Med42-8B
```

### Build for Production

```bash
npm run build
```

Output is in `dist/` — ready for static hosting (S3, CloudFront, Amplify, Vercel, etc.).

## Deployment (AWS)

### Option A: S3 + CloudFront

```bash
# Upload build to S3
aws s3 sync dist/ s3://hridaysetu-frontend --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

Configure CloudFront behaviors for `/api/ocr*` and `/api/analysis*` to proxy to API Gateway.

### Option B: AWS Amplify

1. Connect your Git repo in Amplify Console
2. Add proxy rewrites for `/api/ocr` → OCR endpoint and `/api/analysis` → Analysis endpoint
3. Deploy — get an instant `https://xxx.amplifyapp.com` URL

## Key Design Decisions

- **2048-token model context limit** — System prompts and report text are dynamically truncated to fit within the Med42-8B model's strict `input + output ≤ 2048` token budget
- **Structured data over raw OCR for chat** — Chat context uses compact parameter tables instead of full OCR text to maximize the usable token budget
- **Per-user chat isolation** — Each role (patient/doctor/admin) has independent chat sessions via `userId` on `ChatSession`
- **Denial response filtering** — Stale "I cannot access your data" model responses are stripped from conversation history to prevent feedback loops
- **Real report priority** — Chat context only links to user-uploaded reports (identified by `ocrContent` or `previewUrl`), never mock seed data

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

---

<p align="center">
  Built with ❤️ by <strong>AI for Bharat</strong>
</p>
