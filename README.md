# Todo React App

A premium, interactive Todo application built with React and Vite, featuring a modern glassmorphism UI.

## 🚀 Features

*   **Modern UI**: Glassmorphism design with dynamic gradients and animations.
*   **Interactive**: Smooth hover effects and transitions.
*   **Persistent**: Todos are saved to local storage.
*   **Production Ready**: Includes configurations for Docker, AWS EC2, and AWS ECS.

## 🛠 Local Development

### Option 1: Using Node.js
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### Option 2: Using Docker Compose
```bash
docker-compose up --build
```

---

## ☁️ Deployment Guides

This repository includes step-by-step guides for deploying this application to AWS using different strategies.

### 1. Setup on EC2 (Virtual Machine)
Deploy the app manually to a single EC2 instance using PM2. Ideal for simple, low-cost hosting.
*   **[Read the EC2 Deployment Guide](./DEPLOY_EC2.md)**

### 2. Containerized Deployment (Production ⭐️)
The recommended way for scalable, production-grade applications. This allows you to run multiple replicas of your app with zero downtime.

Follow these guides in order:

1.  **[Part 1: Build & IPush to ECR](./DEPLOY_ECR.md)**
    *   Learn how to build a production Docker image and push it to AWS Elastic Container Registry.
    *   *Includes Fix for Mac M1/M2 users.*

2.  **[Part 2: Run on ECS Fargate](./DEPLOY_ECS.md)**
    *   Deploy your container to AWS Fargate (Serverless Compute).

3.  **[Part 3: Add Load Balancer (ALB)](./DEPLOY_ALB.md)**
    *   Attach an Application Load Balancer to distribute traffic and provide a stable URL.

### 3. Kubernetes Deployment (EKS) 🚀
Deploy to Amazon Elastic Kubernetes Service (EKS) using modern practices.
*   **[Read the EKS Deployment Guide](./DEPLOY_EKS.md)**
*   Covers both **Standard EC2 Node Groups** and the new **EKS Auto Mode**.
*   Includes `kubectl` and `eksctl` instructions.

---

## 📁 Project Structure

*   `src/`: React source code.
*   `Dockerfile`: Development Docker config.
*   `Dockerfile.prod`: Production Docker config (Nginx).
*   `docker-compose.yml`: Local development orchestration.
