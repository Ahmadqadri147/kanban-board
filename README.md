# 🚀 Real-Time Collaborative Kanban Board

A modern, highly responsive, and collaborative Kanban Board application. Built with a premium dark-themed glassmorphic UI, it supports seamless drag-and-drop operations, file attachment management, active progress tracking charts, and instant multi-client synchronization via WebSockets.

---

## 🌟 Features

- **Real-Time Collaboration:** Powered by Socket.io, task additions, moves, edits, and deletions instantly synchronize across all connected users.
- **Intuitive Drag-and-Drop:** Built using `@dnd-kit` for extremely smooth task reordering and columns transitions (To Do, In Progress, Done).
- **Responsive & Premium Design:** Styled with Tailwind CSS, custom gradients, glassmorphism, and micro-interactions.
- **Interactive Analytics:** Reactive stats and column distribution visual chart powered by `Recharts` that update in real time as tasks move.
- **Rich Task Metadata:** Custom labels, categories (Bug, Feature, Enhancement), priority levels (Low, Medium, High), and file attachment support (Images & PDFs up to 5MB).
- **Complete Test Coverage:** Robust unit and integration testing suite utilizing Vitest and React Testing Library.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS, PostCSS, Lucide Icons
- **Drag & Drop:** `@dnd-kit/core`, `@dnd-kit/sortable`
- **Charts:** Recharts
- **WebSockets:** Socket.io-client
- **Testing:** Vitest, React Testing Library, JSDOM

### Backend
- **Runtime:** Node.js
- **Framework:** Express
- **WebSockets:** Socket.io (with CORS support)
- **Monitoring:** Nodemon (for development auto-restart)

---

## 🚀 Getting Started

Follow these steps to run the application locally on your machine.

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (version 18+ is recommended).

### 2. Setup Backend Server
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start backend server in development mode (with nodemon auto-restart)
npm run dev
```
*The backend server will run on `http://localhost:3000`.*

### 3. Setup Frontend Client
Open a new terminal session:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start frontend development server
npm run dev
```
*The frontend application will run on `http://localhost:5173`.*

---

## 🧪 Testing Suite Guide

We use **Vitest** coupled with **React Testing Library** for fast, reliable unit and integration testing.

### Test Commands

Run these commands inside the `frontend` folder (`cd frontend` first):

| Command | Action | Best Used When... |
| :--- | :--- | :--- |
| `npm run test` | Starts Vitest in **Watch Mode** | **During Development.** Tests will automatically re-run whenever you save changes to your components or test files. |
| `npm run test:run` | Runs all tests **once** and exits | **Before Commit/Push or CI/CD.** Quickly verifies that everything is solid without keeping a process open. |
| `npm run test:ui` | Opens the **Vitest HTML UI** | **Visual Debugging.** Launch a rich browser-based dashboard to filter, run, inspect, and step through tests visually. |

### Test Structure
- **Unit Tests (`src/tests/unit/`):** Verifies component rendering, initial states, priority classes, category tags, validator functions, and form reset workflows.
- **Integration Tests (`src/tests/integration/`):** Mocks WebSocket connection events to verify correct state handling when events like `task:created`, `task:deleted`, `task:updated`, and `task:moved` are received.
- **End-to-End Tests (`src/tests/e2e/`):** Playwright E2E testing templates designed for automated browser interactions.

---

## 📁 Project Architecture

```text
kanban board/
├── backend/
│   ├── server.js            # Express & Socket.io server logic
│   ├── package.json
│   └── uploads/             # Stores uploaded attachments
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/          # Project assets & media
    │   ├── components/      # Modular React UI components
    │   │   ├── kanbanBoard.jsx
    │   │   ├── kanbanColumn.jsx
    │   │   ├── taskCard.jsx
    │   │   ├── taskForm.jsx
    │   │   ├── progressChart.jsx
    │   │   └── useSocket.js # Custom hook managing socket connections
    │   ├── tests/           # Testing directory
    │   │   ├── setup.js     # Testing library configurations
    │   │   ├── unit/
    │   │   ├── integration/
    │   │   └── e2e/
    │   ├── index.css        # Tailwind directives & design system overrides
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```
