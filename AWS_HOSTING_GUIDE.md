# AWS Hosting Guide (Using AWS CodeCommit)

This guide outlines how to host your application using **AWS CodeCommit** as your source repository.

## Architecture

- **Source Code**: **AWS CodeCommit** (Private Git repositories hosted on AWS).
- **Frontend**: **AWS Amplify**. Connects directly to CodeCommit.
- **Backend**: **AWS App Runner** via **Amazon ECR**. 
  - *Note: App Runner supports direct source deployment from GitHub/Bitbucket only. For CodeCommit, we must package the backend as a Docker image and deploy from Amazon ECR.*

---

## Prerequisites

1. **AWS CLI** installed and configured locally (`aws configure`).
2. **Docker** installed and running locally.
3. **Source Code** pushed to your AWS CodeCommit repository.

---

## Step 1: Deploy Frontend (AWS Amplify)

1. **Log in to AWS Console** and search for **AWS Amplify**.
2. Click **Create new app** -> **Host web app** (Amplify Hosting).
3. Select **AWS CodeCommit** and click **Continue**.
4. Select your **Repository** and **Branch** (e.g., `main`).
5. **Build Settings**:
   - Amplify detects `package.json` and configures the build.
   - **App name**: Give it a name.
   - **Build settings**:
     - Ensure **Base Directory** is set to `frontend`. (Click "Edit" on the build settings YAML if needed).
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
6. Click **Save and Deploy**.
7. **Wait**: Amplify will build and deploy. You will get a URL (e.g., `https://main.d12345.amplifyapp.com`).

---

## Step 2: Deploy Backend (App Runner via ECR)

Since App Runner cannot pull *code* directly from CodeCommit, we will build a Docker image and push it to Amazon ECR (Elastic Container Registry).

### A. Create ECR Repository
1. Go to **Amazon ECR** in AWS Console.
2. Click **Create repository**.
3. Visibility settings: **Private**.
4. Repository name: `velops-backend`.
5. Click **Create repository**.
6. Copy the **URI** of your new repository (e.g., `123456789012.dkr.ecr.us-east-1.amazonaws.com/velops-backend`).

### B. Build and Push Docker Image
Run these commands in your local terminal (from the project root):

1. **Login to ECR**:
   ```powershell
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <YOUR_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
   ```
   *(Replace `us-east-1` and `<YOUR_ACCOUNT_ID>` with your specific details)*

2. **Build the Image**:
   ```powershell
   docker build -t velops-backend ./backend
   ```

3. **Tag the Image**:
   ```powershell
   docker tag velops-backend:latest <YOUR_ECR_URI>:latest
   ```

4. **Push the Image**:
   ```powershell
   docker push <YOUR_ECR_URI>:latest
   ```

### C. Create App Runner Service
1. Go to **AWS App Runner** in Console.
2. Click **Create Service**.
3. **Source**: **Container Registry**.
4. **Provider**: **Amazon ECR**.
5. **Image URI**: Click **Browse** and select `velops-backend` tag `latest`.
6. **Deployment settings**:
   - **Trigger**: **Automatic** (deploys new version whenever you push a new image to ECR).
   - **ECR access role**: Select "Create new service role" (if first time).
7. **Next** -> **Configuration**:
   - **Service Name**: `velops-backend`.
   - **Port**: `5000`.
   - **Environment Variables**: Add contents of `backend/.env` manually here (e.g., `OPENAI_API_KEY`).
8. **Create & Deploy**.
9. Copy the **Default domain** URL once active.

---

## Step 3: Connect Frontend and Backend

1. Copy the **Backend URL** from Step 2C.
2. Go back to **AWS Amplify Console** -> Your App -> **Environment Variables**.
3. Create/Update variable: `VITE_API_BASE_URL` = `https://<YOUR_EMBEDDED_BACKEND_URL>` (No trailing slash).
4. Go to the **Hosting** tab and trigger a **Redeploy** to apply the changes.

---

## Summary of Workflow (Future Updates)

1. **Frontend Change**: Push to CodeCommit -> Amplify auto-deploys.
2. **Backend Change**: 
   - Push to CodeCommit (for version control).
   - **Run** `docker build` & `docker push` commands (locally or via AWS CodeBuild).
   - App Runner auto-deploys the new image.
