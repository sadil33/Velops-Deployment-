# AWS Hosting Guide for Velops Project

This guide outlines the recommended approach to host your React Frontend and Node.js Backend on AWS.

## Architecture Overview

- **Frontend**: **AWS Amplify**. 
  - Best for: React/Vite apps.
  - Features: Automatic CI/CD from Git, CDN hosting, free SSL, simple configuration.
- **Backend**: **AWS App Runner**.
  - Best for: API services (Node.js/Express).
  - Features: Fully managed, auto-scaling, connects directly to your Git repo or Container Registry.

---

## Prerequisites

1. **AWS Account**: Ensure you have an active AWS account.
2. **GitHub Repository**: Push your project to a GitHub repository (private or public).

---

## Step 1: Deploy Frontend (AWS Amplify)

1. **Log in to AWS Console** and search for **AWS Amplify**.
2. Click **Create new app** -> **Host web app** (Amplify Hosting).
3. Select **GitHub** and click **Continue**.
4. Authorize AWS Amplify to access your GitHub account.
5. Select your repository and the branch (e.g., `main`).
6. **Build Settings**:
   - Amplify should auto-detect the settings because you are using Vite.
   - **Base Directory**: `frontend` (Important: Click "Edit" on the App build settings to set `frontend` as the base directory if your repo root is not the frontend root).
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run preview` (or leave blank, Amplify serves the `dist` folder automatically).
   - **Output Directory**: `dist`
7. Click **Save and Deploy**.
8. **Wait**: Amplify will build and deploy your site. Once done, you will get a URL (e.g., `https://main.d12345.amplifyapp.com`).

**Note on Environment Variables**:
- If your frontend needs the Backend URL, go to **App Settings** -> **Environment variables**.
- Add `VITE_API_BASE_URL` and set existing value to your **Backend URL** (which you will get in Step 2).
- You will need to trigger a **Redeploy** of the frontend after obtaining the Backend URL.

---

## Step 2: Deploy Backend (AWS App Runner)

1. **Log in to AWS Console** and search for **AWS App Runner**.
2. Click **Create Service**.
3. **Source**:
   - Option A (Easier): **Source Code Repository**. Connect GitHub, select repo/branch.
     - **Source Directory**: `backend`
     - **Runtime**: Node.js 18
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Port**: `5000`
   - Option B (Robust): **Container Registry**. (Requires building Docker image and pushing to ECR, see "Advanced" below).
4. **Configuration**:
   - **Service Name**: `velops-backend`
   - **Environment Variables**: Add any variables from your `.env` file here (e.g., `OPENAI_API_KEY`, `PDF_PATH`, etc.).
5. **Create & Deploy**:
   - It will take a few minutes.
   - Once active, copy the **Default domain** URL (e.g., `https://xyz.us-east-1.awsapprunner.com`).

---

## Step 3: Connect Frontend and Backend

1. Copy the **Backend URL** from Step 2.
2. Go back to **AWS Amplify Console** -> Your App -> **Environment Variables**.
3. Create/Update variable: `VITE_API_BASE_URL` = `https://<YOUR_EMBEDDED_BACKEND_URL>` (No trailing slash).
4. Go to the **Hosting** tab and trigger a **Redeploy** (Build) for the changes to take effect.

---

## Advanced: Docker Option (ECS/App Runner with Image)

If you prefer using Docker (recommended for consistency):
1. Navigate to `backend/`.
2. Build the image: `docker build -t velops-backend .`
3. Push to **Amazon ECR** (Elastic Container Registry).
4. In **App Runner**, select **Amazon ECR** as the source and choose your image.

A `Dockerfile` has been created in the `backend/` folder for this purpose.
