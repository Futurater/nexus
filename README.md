<p align="center">
  <img src="https://img.shields.io/badge/NEXUS-Video%20Conferencing-2563EB?style=for-the-badge&logoColor=white" alt="NEXUS Badge"/>
</p>

<h1 align="center">🎥 NEXUS — Video Conferencing Platform</h1>

<p align="center">
  A full-stack, real-time video conferencing web application built with the <strong>MERN stack</strong> and <strong>WebRTC</strong>. <br/>
  Connect face-to-face from anywhere — with live chat, screen sharing, live captions, and AI-powered meeting recaps.
</p>

## ✨ Highlights

| Feature | Description |
| :--- | :--- |
| **🎥 Video Calls** | High-quality, low-latency streaming powered by WebRTC. |
| **💬 Live Chat** | Real-time messaging seamlessly integrated into the call interface. |
| **🖥️ Screen Share** | Instantly broadcast your entire screen, window, or specific tab. |
| **🗣️ Live Captions** | Real-time speech-to-text transcriptions natively rendered in the browser. |
| **🤖 AI Recaps** | Automatically generate clean markdown summaries of your transcripts using Google Gemini 1.5 Flash. |
| **📜 History Logs** | Everything is securely saved—review past meeting transcripts and recaps from your dashboard. |

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Material UI (MUI), Socket.IO-client |
| **Backend** | Node.js, Express, Socket.IO |
| **Database** | MongoDB & Mongoose |
| **AI & APIs** | Google Gemini, Web Speech API, WebRTC |

## 🚀 Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nehalikareddy/Nexus-VideoCall.git
   cd Nexus-VideoCall
   ```

2. **Start the Backend:**
   Create a `.env` file in the `backend/` folder containing your `MONGO_URI` and `GEMINI_API_KEY`.
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Start the Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🌐 Deployment

| Platform | Setup Overview | Requirements |
| :--- | :--- | :--- |
| **Render** (Backend) | Create a **Web Service**, point it to the `backend` folder. | Provide `MONGO_URI` and `GEMINI_API_KEY` secrets. |
| **Vercel** (Frontend) | Create a **Static Site** (Vite preset), point it to the `frontend` folder. | Ensure frontend connects natively to backend URL. |

---
<p align="center">
  Built with ❤️ using React, Node.js, WebRTC, and Gemini AI.
</p>
