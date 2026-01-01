# Part 3: Load Balancing with ALB (Application Load Balancer)

When running multiple replicas (e.g., 2 tasks), you cannot just use a single task's IP because:
1.  **IPs Change**: If a task restarts, it gets a new IP.
2.  **Load Distribution**: You want traffic to be shared between the two tasks.
3.  **Single Entry Point**: You need one static URL for your users.

## Step 1: Create an Application Load Balancer (ALB)

1.  Go to **EC2 Dashboard** > **Load Balancers** (left sidebar).
2.  Click **Create load balancer**.
3.  Select **Application Load Balancer**.
4.  **Basic Configuration**:
    *   **Name**: `todo-app-alb`.
    *   **Scheme**: **Internet-facing** (Crucial so you can access it).
    *   **IP address type**: IPv4.
5.  **Network mapping**:
    *   **VPC**: Select your default VPC (same as your ECS cluster).
    *   **Mappings**: Check **ALL** availability zones listed.
6.  **Security groups**:
    *   Create a new Security Group named `alb-sg`.
    *   **Inbound Rules**: Allow HTTP (Port 80) from Anywhere (`0.0.0.0/0`).
7.  **Listeners and routing**:
    *   **Listener**: HTTP:80.
    *   **Default action**: Click "Create target group".

## Step 2: Create a Target Group

(This opens in a new tab)

1.  **Choose a target type**: **IP addresses** (Required for Fargate).
2.  **Target group name**: `todo-app-targets`.
3.  **Protocol**: HTTP.
4.  **Port**: 80.
5.  **VPC**: Select your default VPC.
6.  **Health checks**:
    *   **Health check path**: `/` (or index.html).
7.  Click **Next**.
8.  **Register targets**:
    *   Do **NOT** register anything yet. ECS will do this automatically.
    *   Just click **Create target group**.

## Step 3: Finish Load Balancer

1.  Go back to the Load Balancer tab.
2.  Refresh the "Default action" list and select your new group: `todo-app-targets`.
3.  Click **Create load balancer**.
4.  Wait for the State to change from **Provisioning** to **Active**.

## Step 4: Update ECS Service to use ALB

You need to tell your existing ECS Service to send traffic to this new Load Balancer.

1.  Go to **ECS** > **Cluster** > **Service** (`todo-app-service`).
2.  Click **Update**.
3.  Find the **Load balancing** section.
    *   **Load balancer type**: Application Load Balancer.
    *   **Load balancer**: Select `todo-app-alb`.
4.  **Container to load balance**:
    *   Click **Add to load balancer**.
    *   **Production listener port**: `80:HTTP`.
    *   **Target group name**: Select `todo-app-targets`.
5.  Click **Update**.

## Step 5: Fix Security Groups (Crucial!)

Your App currently allows traffic directly from the internet. We should restrict it so it ONLY accepts traffic from the Load Balancer.

1.  Go to **EC2** > **Security Groups**.
2.  Find the Security Group used by your **ECS Tasks** (`todo-app-sg`).
3.  **Edit Inbound rules**:
    *   Delete the existing rule that allows Port 80 from `0.0.0.0/0`.
    *   **Add Rule**:
        *   **Type**: HTTP (Port 80).
        *   **Source**: **Custom** -> Start typing `alb-sg` (select the Security Group of your Load Balancer).
4.  Save rules.

## Step 6: Access Your App

1.  Go to **EC2** > **Load Balancers**.
2.  Select `todo-app-alb`.
3.  Copy the **DNS name** (e.g., `todo-app-alb-123456789.us-east-1.elb.amazonaws.com`).
4.  Open this URL in your browser.

🎉 **Done!** You now have a production-grade setup:
*   Users hit the **Load Balancer**.
*   ALB routes traffic to one of your **2 Tasks**.
*   If a task fails, ALB stops sending traffic to it.
*   Your tasks are secure and only accept traffic from the ALB.
