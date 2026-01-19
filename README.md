# Velops Deployment Project

A full-stack application for managing IDM deployments, ION workflows, and AI optimization tasks.

## 🚀 Live Demo
- **Frontend**: [https://velops-frontend.onrender.com](https://velops-frontend.onrender.com)
- **Backend**: [https://velops-backend.onrender.com](https://velops-backend.onrender.com)

## 📂 Project Structure
- **frontend/**: React + Vite application (UI).
- **backend/**: Node.js + Express server (Proxy & APIs).

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/sadil33/Velops-Deployment-.git
cd Velops-Deployment-
```

### 2. Backend Setup
```bash
cd backend
npm install
# Create .env file with:
# PORT=5000
# JIRA_EMAIL=...
# JIRA_API_TOKEN=...
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## ☁️ Deployment (Render.com)
This project is configured for Render.com.
- **Backend**: Web Service (Node)
- **Frontend**: Static Site (Vite Build)

## ✨ Remote Features
- **Keep-Alive Bot**: The backend includes a self-ping mechanism to stay active 24/7 on free tiers.
- **Secure Proxy**: Handles CORS and authenticates with external Infor APIs safely.
