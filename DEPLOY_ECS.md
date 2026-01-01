# Part 2: Deploying to AWS ECS (Elastic Container Service)

This guide explains how to take the image you pushed to ECR and run it on AWS ECS using **Fargate** (Serverless Compute).

## Prerequisites

*   Completed the steps in `DEPLOY_ECR.md`.
*   An image exists in your ECR repository (`todo-react-app`).

## Step 1: Create an ECS Cluster

1.  Go to the **AWS Console > ECS**.
2.  Click **Clusters** > **Create Cluster**.
3.  **Cluster name**: `todo-app-cluster`.
4.  **Infrastructure**: Select **Fargate (only)**.
5.  Click **Create**.

## Step 2: Create a Task Definition

The "Task Definition" describes *how* to run your container (CPU, Memory, Image URL).

1.  Go to **Task definitions** (left sidebar).
2.  Click **Create new task definition** > **Create new task definition**.
3.  **Task definition family**: `todo-app-task`.
4.  **Infrastructure**:
    *   **Launch type**: AWS Fargate.
    *   **OS/Architecture**: Linux/X86_64.
5.  **Task size**:
    *   CPU: `.5 vCPU` (approx 512).
    *   Memory: `1 GB`.
    *   *(This is plenty for a simple React app)*.
6.  **Container - 1**:
    *   **Name**: `todo-container`
    *   **Image URI**: Paste your ECR URL (e.g., `<ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/todo-react-app:latest`)
    *   **Container Port**: `80` (Important: This must match the EXPOSE port in `Dockerfile.prod`).
    *   **Protocol**: TCP.
7.  Click **Create**.

## Step 3: Run the Service

The "Service" ensures your task runs continuously and is accessible.

1.  Go to your Cluster (`todo-app-cluster`).
2.  Under the **Services** tab, click **Create**.
3. **Service Details**:
    *   **Task definition family**: `todo-app-task`.
    *   **Task definition revision**: Select the latest revision.
    *   **Service name**: auto-generated
4. **Environment**: Leave default.
5.  **Deployment configuration**:
    *   **Scheduling strategy**: `Replica`.
    *   **Desired tasks**: `2`.
6.  Click **Create**.

## Step 4: Access Your App

1.  Wait for the Service Status to become **Active** and the Task Status to be **Running**.
2.  Click on the **Tasks** tab inside your Service.
3.  Click on the **Task ID** (e.g., `1234abcd...`).
4.  Look for the **Public IP** under the **Networking** section.
5.  Open that IP in your browser: `http://<Public-IP>`

🎉 **Congratulations!** Your React app is now running on AWS ECS Fargate!

---

## Troubleshooting

*   **Task stops immediately?**
    *   Check **Logs** in the Task view.
    *   Ensure your `Dockerfile.prod` exposes port 80.
    *   Ensure your Task Definition maps port 80.
*   **Site not loading?**
    *   Check the **Security Group** attached to the Service. It *must* allow Inbound Traffic on Port 80 from `0.0.0.0/0`.
