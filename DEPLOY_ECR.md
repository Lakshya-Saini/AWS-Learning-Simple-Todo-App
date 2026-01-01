# Part 1: Initial Setup & AWS ECR (Elastic Container Registry)

This guide deals with **building a production-ready Docker image** and pushing it to **AWS ECR**.

## Prerequisites

1.  **AWS Account**: You need access to the AWS Console.
2.  **AWS CLI Installed**: [Install instructions](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).
3.  **Docker Desktop Installed**: Ensure Docker is running locally.

## Step 1: Create a Production Dockerfile

The standard `Dockerfile` we used earlier is for *development*. For AWS, we want a high-performance **production** build served by Nginx.

Create a new file named `Dockerfile.prod` in your project root:

```dockerfile
# Stage 1: Build the React App
FROM node:22-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# (Optional) Add custom nginx.conf if needed, but default works for simple apps
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Step 2: Configure AWS CLI

If you haven't already, configure your CLI with your credentials:

```bash
aws configure
```
*   **AWS Access Key ID**: (Enter your key)
*   **AWS Secret Access Key**: (Enter your secret)
*   **Default region name**: `us-east-1` (or your preferred region like `ap-south-1`)
*   **Default output format**: `json`

## Step 3: Create an ECR Repository

1.  Go to the AWS Console > **Elastic Container Registry**.
2.  Click **Create repository**.
3.  **Repository name**: `todo-react-app`.
4.  Keep other settings as default (Private).
5.  Click **Create repository**.

## Step 4: Login to ECR

Retrieve an authentication token and authenticate your Docker client to your registry. Replace `<REGION>` and `<ACCOUNT_ID>` with your real values.

```bash
aws ecr get-login-password --region <REGION> | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com
```

> **Tip**: You can copy this exact command from the ECR Console by selecting your repository and clicking the "View push commands" button.

## Step 5: Build, Tag, and Push

Run these commands in your project root:

1.  **Build the Image** (using the production Dockerfile):
    *   **Crucial for Mac Users**: You must specify `--platform linux/amd64` so it runs on AWS Fargate.
    ```bash
    docker build --platform linux/amd64 -f Dockerfile.prod -t todo-react-app .
    ```

2.  **Tag the Image**:
    Match the tag to your ECR repository URL.
    ```bash
    docker tag todo-react-app:latest <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/todo-react-app:latest
    ```

3.  **Push to ECR**:
    ```bash
    docker push <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/todo-react-app:latest
    ```

**Success!** Your production-ready image is now stored in AWS ECR. You can proceed to deploying it on ECS.
