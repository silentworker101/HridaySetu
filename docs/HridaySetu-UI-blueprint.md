# HridaySetu UI Modernization Blueprint

## 1. Design System Overview
- Product type: SaaS healthcare operations dashboard, not marketing site.
- Visual direction: calm clinical palette (blue + soft green accents), high whitespace, rounded cards, soft elevation.
- Typography:
  - Display: Manrope (headings, section titles)
  - Body: Inter (data labels, paragraphs, forms)
- Layout:
  - 1440px desktop max-width content containers
  - Left sidebar + top context header
  - Card-based modules with optional right contextual AI panel
- Accessibility:
  - High-contrast text against cards/background
  - Touch targets >= 40px on mobile
  - Severity states use icon + color + text labels

## 2. Severity and Badge System
- Severity colors:
  - Normal: green (`normal`)
  - Elevated: amber (`warning`)
  - Critical: red (`abnormal`)
- AI trust indicators:
  - `AI-generated` badge on model outputs
  - Confidence badges (simulated percentages)
  - Data source references block in report detail
- Alert states:
  - Informational (muted/accent cards)
  - Elevated warning banners
  - Error fallback messaging in chat/report flows

## 3. Low-Fidelity Wireframes

### Role Selection
```
+------------------------------------------------------------+
| HridaySetu Hero                                            |
| [Patient Card] [Doctor Card] [Admin Card]                 |
| trust chips: privacy | AI insights | dashboard workflow    |
+------------------------------------------------------------+
```

### Patient Dashboard
```
+----------------+-------------------------------------------+
| Sidebar        | Header + AI tag                           |
| nav            | [Stats x4]                                |
|                | [Recent Reports list]  [Upload Trend]     |
|                | [AI Insight panel + CTA]                  |
+----------------+-------------------------------------------+
```

### Report Detail + AI Analysis
```
+------------------------------------------------------------+
| Report Header (meta + severity + AI badges + actions)      |
+-------------------------------+----------------------------+
| Structured table             | AI Summary                 |
| (lab values + severity)      | Explanation                |
|                              | Confidence + sources       |
+-------------------------------+----------------------------+
```

### AI Chat
```
+------------------------------------------------------------+
| Context header + AI badge                                   |
| Message stream (assistant/user bubbles)                    |
| Suggested prompts (empty state)                            |
| Trust note + regenerate + input composer                   |
+------------------------------------------------------------+
```

## 4. High-Fidelity Mockup Notes
- Patient:
  - Upload module with staged processing and progress bar
  - Reports library filters and mobile-first search
  - AI analysis panel in report detail
- Doctor:
  - Data-dense patient list and flagged report focus
  - Clinical report review and AI chat continuity
- Admin:
  - KPI cards + trend chart + report type distribution
  - System monitoring table with operational statuses

## 5. Component Library
- Navigation:
  - Responsive sidebar (drawer on mobile, collapsible on desktop)
  - Sticky top header with context title and role label
- Data display:
  - `StatCard`, `ReportCard`, `SeverityBadge`, `AiBadge`
  - Structured lab table with horizontal-safe scrolling
- AI modules:
  - Upload processing states
  - AI summary cards with confidence/source chips
  - Chat bubbles + regenerate + suggestions
- Controls:
  - Button variants: primary gradient, outline, ghost
  - Filter controls, search inputs, select dropdowns

## 6. Interaction States
- Empty states: reports/chat empty flows with suggested actions
- Loading states: upload analysis progress + chat typing indicator
- Error states: chat fallback error message and missing report fallback
- Micro-interactions:
  - Card hover elevation
  - Smooth fade/slide utility animations
  - Sidebar toggle transitions

## 7. Scalable Navigation Architecture
- Role-aware route groupings:
  - Patient: dashboard, upload, reports, chat, insights
  - Doctor: dashboard, patients, reports, chat, search
  - Admin: dashboard, patients, doctors, analytics, system
- Shared shell and reusable cards allow future roles and API expansion without layout rewrites.

## 8. Full-Stack Extensibility Readiness
- UI separated from service layer (`aiService.ts` abstraction retained).
- All AI output zones explicitly marked as simulated/prototype.
- Components and pages are designed for API-backed data substitution with minimal refactor.
