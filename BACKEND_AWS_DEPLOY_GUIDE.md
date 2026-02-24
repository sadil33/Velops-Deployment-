# Backend Deployment Guide (AWS CodeCommit + ECR + App Runner)

This guide details exactly how to deploy your Node.js backend using AWS CodeCommit, Amazon ECR, and AWS App Runner.

## Prerequisites

1.  **AWS CLI** installed and configured (`aws configure`).
2.  **Docker Desktop** installed and running.
3.  An **AWS User** with permissions for CodeCommit, ECR, and App Runner.

---

## Part 1: Source Control (CodeCommit)

1.  **Create Repository**:
    *   Go to **AWS CodeCommit** console.
    *   Click **Create repository** -> Name it `velops-project`.
    *   Click **Create**.
2.  **Push Local Code**:
    *   In your terminal, inside `c:\Users\ashaik\Tech_Project`:
    ```powershell
    git remote remove origin
    # Replace with your specific CodeCommit URL
    git remote add origin https://git-codecommit.us-east-1.amazonaws.com/v1/repos/velops-project
    git add .
    git commit -m "Initial commit"
    git push -u origin main
    ```

---

## Part 2: Container Registry (Amazon ECR)

Since App Runner cannot build directly from CodeCommit source, we must build a Docker image and push it to ECR.

1.  **Create Repository**:
    *   Go to **Amazon ECR** console.
    *   Click **Create repository**.
    *   **Visibility**: Private.
    *   **Repository name**: `velops-backend`.
    *   Click **Create repository**.
2.  **Authenticate Docker to ECR** (Run in PowerShell):
    ```powershell
    # Replace <REGION> (e.g., us-east-1) and <ACCOUNT_ID>
    aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <YOUR_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
    ```
3.  **Build the Image**:
    ```powershell
    # Run from project root
    docker build -t velops-backend -f backend/Dockerfile ./backend
    ```
4.  **Tag the Image**:
    ```powershell
    docker tag velops-backend:latest <YOUR_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/velops-backend:latest
    ```
5.  **Push the Image**:
    ```powershell
    docker push <YOUR_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/velops-backend:latest
    ```

---

## Part 3: Hosting (AWS App Runner)

1.  Go to **AWS App Runner** console.
2.  Click **Create Service**.
3.  **Source & Deployment**:
    *   **Source**: **Container Registry**.
    *   **Provider**: **Amazon ECR**.
    *   **Image URI**: Click **Browse** and select `velops-backend` tag `latest`.
    *   **Deployment settings**: Choose **Automatic** (this ensures that whenever you push a new image to ECR, App Runner redeploys).
    *   **ECR Access Role**: Select "Create new service role" (or use existing `AppRunnerECRAccessRole`).
4.  **Configuration**:
    *   **Service name**: `velops-backend-service`.
    *   **Virtual CPU & Memory**: 1 vCPU, 2 GB.
    *   **Port**: `5000`.
5.  **Environment Variables**:
    *   Add all keys from your `backend/.env` file here.
    *   Example: `OPENAI_API_KEY`, `PDF_PATH` (Note: ephemeral storage warning applies).
6.  **Review & Create**:
    *   Click **Create & deploy**.
    *   Wait for the status to turn **Running**.
7.  **Get URL**:
    *   Copy the **Default domain** (e.g., `https://xyz.us-east-1.awsapprunner.com`).

---

## Part 4: Updating the Backend

When you change backend code:
1.  Commit changes to CodeCommit (optional, for history).
2.  Run the **Build**, **Tag**, and **Push** commands from Part 2.
3.  App Runner detects the new image and deploys automatically.
