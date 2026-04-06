<p align="center">
  <img src="https://img.shields.io/badge/NEXUS-Video%20Conferencing-2563EB?style=for-the-badge&logoColor=white" alt="NEXUS Badge"/>
</p>

<h1 align="center">🎥 NEXUS — Video Conferencing Platform</h1>

<p align="center">
  A full-stack, real-time video conferencing web application built with the <strong>MERN stack</strong> and <strong>WebRTC</strong>. <br/>
  Connect face-to-face from anywhere — with live chat, screen sharing, live captions, and AI-powered meeting recaps.
</p>

## ✨ Key Features

- **Peer-to-Peer Video Calls**: High-quality, low-latency streaming powered by WebRTC.
- **In-Call Text Chat**: Real-time messaging seamlessly integrated into the call interface.
- **Screen Sharing**: Instantly share your entire screen, window, or specific tab to the room.
- **Live Captions**: Real-time speech-to-text transcriptions natively rendered in the browser.
- **AI Meeting Recaps**: Automatically generate beautiful markdown summaries of your transcripts using Google Gemini 1.5 Flash.
- **Persistent History**: Everything is securely saved—review past meeting transcripts and recaps from your dashboard at any time.

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, Material UI (MUI), Socket.IO-client
- **Backend:** Node.js, Express, Socket.IO
- **Database:** MongoDB & Mongoose
- **AI & API:** Google Gemini, Web Speech API, WebRTC

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

- **Backend:** Easily hosted as a Node.js Web Service on platforms like **Render.com** (requires your `MONGO_URI` and `GEMINI_API_KEY` secrets).
- **Frontend:** Optimized for static deployments on platforms like **Vercel** or Render Static Sites.

---
<p align="center">
  Built with ❤️ using React, Node.js, WebRTC, and Gemini AI.
</p>
