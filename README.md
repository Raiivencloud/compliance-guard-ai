# ComplianceGuard AI 🛡️

**ComplianceGuard** is a professional AI-powered auditing platform designed to automate legal compliance and privacy checks. Built with a modern tech stack, it leverages Google's Gemini AI to analyze complex policy documents and security frameworks in real-time.

## 🚀 Key Features

* **Policy Engine Integration:** Automated scanning of legal documents via a dedicated AI Policy Engine.
* **Real-time Auditing:** High-precision compliance gap identification using Google's Gemini model.
* **Interactive Dashboard:** Comprehensive view of audit results, integration status, and historical data.
* **Multilingual Support:** Built-in translation and language context management for global compliance standards.

## 🛠️ Technical Architecture

* **Frontend:** [React](https://react.dev/) + [Vite](https://vitejs.dev/) for a high-performance SPA.
* **Language:** [TypeScript](https://www.typescriptlang.org/) for robust type safety across the application.
* **Backend-as-a-Service:** [Firebase](https://firebase.google.com/) (Firestore & Auth) for secure data persistence and real-time updates.
* **AI Orchestration:** Integrated via `geminiAudit.ts` service using Google AI SDK.
* **Styling:** Modular CSS and common component architecture for UI consistency.

## 📦 Project Structure

```text
src/
├── components/     # UI Architecture (Dashboard, Landing, Modals)
├── contexts/       # Global State (Language & Auth)
├── hooks/          # Custom Logic (Translations & UI Helpers)
├── lib/            # Firebase & Utility Configurations
└── services/       # AI Logic (Gemini Audit Integration)
