<p align="center">
  <img src="https://img.icons8.com/3d-fluency/94/quiz.png" alt="QuizMaster Logo" width="80"/>
</p>

<h1 align="center">🎓 QuizMaster — Test Series Platform</h1>

<p align="center">
  <em>A modern, AI-powered quiz and test series platform built for competitive exam preparation.</em>
</p>

<p align="center">
  <a href="https://quiz-master-go.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/🚀_Live_Demo-Visit_QuizMaster-brightgreen?style=for-the-badge&logoColor=white" alt="Live Demo"/>
  </a>
</p>

<div align="center">
  <table>
    <tr>
      <td><img src="https://github.com/user-attachments/assets/f423b191-aab2-4491-8de1-4aa0e16b5d81" width="400"/></td>
      <td><img src="https://github.com/user-attachments/assets/0d4a3d2d-ccd5-4309-8cff-c9b9862035fd" width="400"/></td>
      <td><img src="https://github.com/user-attachments/assets/73905488-4b1a-4727-a266-25de349b9f20" width="400"/></td>
      <td><img src="https://github.com/user-attachments/assets/16370b90-62d5-41b5-9807-0b8a681c5884" width="400"/></td>
      <td><img src="https://github.com/user-attachments/assets/7c4893e7-d3dc-4745-b50d-51833d77eb0f" width="400"/></td>
      <td><img src="https://github.com/user-attachments/assets/62c92287-5fcd-49f4-a725-df5a2c8073f1" width="400"/></td>
      <td><img src="https://github.com/user-attachments/assets/c3ffd799-4812-48dc-a47c-ddd81d8fa527" width="400"/></td>
      <td><img src="https://github.com/user-attachments/assets/75b793b3-d241-4564-8276-4a7d02b9dc5a" width="400"/></td>
      <td><img src="https://github.com/user-attachments/assets/a8ab0674-0f11-4356-b835-f0b0335b0c36" width="400"/></td>
      <td><img src="https://github.com/user-attachments/assets/e1ccc792-c8bd-4b60-bcfd-75af0acc7087" width="400"/></td>
      <td><img src="https://github.com/user-attachments/assets/8735615e-4d17-4837-9b74-df140211fc76" width="400"/></td>
      <td><img src="https://github.com/user-attachments/assets/0d71cb12-054b-400a-be3f-235313609f15" width="400"/></td>
    </tr>
  </table>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 19"/>
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/Firebase-10-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS"/>
  <img src="https://img.shields.io/badge/Gemini_AI-Powered-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Gemini AI"/>
  <img src="https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel"/>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#%EF%B8%8F-architecture">Architecture</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-project-structure">Project Structure</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

## ✨ Features

### 📝 Test Series & Quizzes
- **Create & manage test series** with multiple tests, subjects, and sections
- **Manual quiz creation** with rich question editor
- **AI-powered quiz generation** using Google Gemini for instant test creation
- **Section-wise quiz support** for organized exam simulation
- **Answer shuffling** to prevent cheating patterns

### 🤖 AI Integration
- **Gemini AI quiz generator** — auto-generate quizzes from any topic
- **Voice explanations** with Indian language support (Hindi, English, etc.)
- **Live voice assistant** for real-time doubt solving

### 📊 Analytics & Progress
- **Detailed test analysis** — accuracy, time spent, topic-wise breakdown
- **User analytics dashboard** — track performance over time
- **Leaderboards** — compete with peers on each test
- **Attempt history** — review and compare past attempts

### 🏆 Gamification
- **Achievements & badges** — earn rewards for milestones
- **Streaks & XP system** — stay motivated with daily goals
- **Leaderboard rankings** — climb the charts

### 💳 Monetization
- **Razorpay payment integration** for premium test series
- **Subscription management** — monthly/yearly plans
- **Free + paid series support** with access controls

### 🗂️ Study Tools
- **Flashcards** — create and study with spaced repetition
- **Study plan generator** — AI-powered personalized planning
- **Downloadable resources** — PDFs and study materials per series
- **Exam goal selector** — choose your target exam (JEE, NEET, etc.)

### 🔐 Auth & Admin
- **Firebase Authentication** — Google Sign-in, email/password
- **Admin panel** — manage users, series, and content
- **Role-based access** — admin, creator, student roles
- **Firestore security rules** — granular data protection

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 5, TailwindCSS 4 |
| **State Management** | React Context API (Auth, Subscription, Theme) |
| **Animations** | Framer Motion |
| **Routing** | React Router DOM v7 |
| **UI Icons** | Lucide React, React Icons |
| **Backend** | Firebase Cloud Functions, Node.js/Express |
| **Database** | Cloud Firestore |
| **Auth** | Firebase Authentication |
| **AI** | Google Gemini API (`@google/generative-ai`) |
| **Payments** | Razorpay (`react-razorpay`) |
| **Validation** | Zod |
| **PDF Export** | html2canvas-pro, html2pdf.js |
| **Drag & Drop** | dnd-kit |
| **Hosting** | Vercel (Frontend + Backend) |
| **CI/CD** | Vercel Auto Deploy |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                    CLIENT (React)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │   Auth   │ │  Quiz    │ │ Payment  │ │Analytics│ │
│  │ Context  │ │ Engine   │ │ Module   │ │ Engine  │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬────┘ │
│       │             │            │             │      │
│  ┌────┴─────────────┴────────────┴─────────────┴────┐│
│  │              Service Layer                        ││
│  │  geminiService │ paymentService │ analyticsService ││
│  └──────────────────────┬────────────────────────────┘│
└─────────────────────────┼────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   ┌─────────────┐ ┌───────────┐ ┌──────────────┐
   │  Firestore  │ │ Razorpay  │ │  Gemini API  │
   │  Database   │ │ Gateway   │ │  (Google AI) │
   └─────────────┘ └───────────┘ └──────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **Firebase** project with Firestore + Auth enabled
- **Razorpay** account (for payments)
- **Google Gemini** API key (for AI features)

### Installation

```bash
# Clone the repository
git clone https://github.com/SatVerseX/QuizMaster_web.git
cd quizmaster

# Install frontend dependencies
cd quiz-app
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Firebase, Razorpay, and Gemini API keys
```

### Environment Variables

Create a `.env` file in the `quiz-app/` directory:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

### Run Locally

```bash
# Start development server
npm run dev

# Build for production
npm run build:prod

# Preview production build
npm run preview
```

### Deploy

```bash
# Frontend deploys automatically to Vercel on git push
git push origin main

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Cloud Functions
firebase deploy --only functions
```

---

## 📁 Project Structure

```
quizmaster/
├── quiz-app/                   # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/          # Admin panel
│   │   │   ├── auth/           # Login, signup, auth guards
│   │   │   ├── dashboard/      # Student dashboard
│   │   │   ├── discussion/     # Discussion forums
│   │   │   ├── flashcards/     # Flashcard study tool
│   │   │   ├── gamification/   # Achievements, streaks
│   │   │   ├── homepage/       # Landing page sections
│   │   │   ├── payment/        # Razorpay integration
│   │   │   ├── planning/       # AI study planner
│   │   │   ├── progress/       # Analytics & tracking
│   │   │   ├── quiz/           # Quiz engine & UI
│   │   │   ├── test-analysis/  # Detailed result analysis
│   │   │   ├── testList/       # Browse & discover tests
│   │   │   └── testSeries/     # Test series management
│   │   ├── contexts/           # Auth, Subscription, Theme
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API & business logic
│   │   │   ├── geminiService.js
│   │   │   ├── paymentService.js
│   │   │   └── userAnalyticsService.js
│   │   ├── utils/              # Helpers & utilities
│   │   └── App.jsx             # Root component & routing
│   └── package.json
├── backend-quiz/               # Express.js backend (Vercel)
├── functions/                  # Firebase Cloud Functions
├── content/                    # Quiz content JSON files
├── firestore.rules             # Firestore security rules
├── firestore.indexes.json      # Firestore indexes
└── firebase.json               # Firebase project config
```

---

## 🧩 Key Modules

| Module | Description |
|--------|------------|
| `geminiService.js` | Integrates Google Gemini API for AI quiz generation and study planning |
| `paymentService.js` | Handles Razorpay payment flows, order creation, and verification |
| `userAnalyticsService.js` | Tracks user performance, generates insights and progress reports |
| `AuthContext.jsx` | Firebase auth state management across the app |
| `SubscriptionContext.jsx` | Manages subscription status and access control |
| `ThemeContext.jsx` | Dark/light theme switching with system preference detection |

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines

- Follow the existing component structure in `src/components/`
- Use React Context for shared state (avoid prop drilling)
- Write services in `src/services/` for API interactions
- Use Framer Motion for all animations
- Follow the existing naming conventions

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ for students preparing for competitive exams
</p>

<p align="center">
  <strong>⭐ Star this repo if you found it helpful!</strong>
</p>
