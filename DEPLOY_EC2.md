# Deploying to AWS EC2 (Manual Guide)

This comprehensive guide will walk you through deploying your React application to an AWS EC2 instance starting from scratch.

## Step 1: Create an EC2 Instance (Free Tier)

1.  **Log in to AWS Console**: Go to [aws.amazon.com](https://aws.amazon.com) and sign in.
2.  Navigate to the **EC2 Dashboard** and click **Launch Instance**.
3.  **Name**: Give your instance a name (e.g., `todo-react-app`).
4.  **Application and OS Images (AMI)**:
    *   Select **Amazon Linux**.
    *   Ensure "Amazon Linux 2023 AMI" (Free tier eligible) is selected.
5.  **Instance Type**:
    *   Select **t2.micro** or **t3.micro** (Free tier eligible).
6.  **Key Pair (Login)**:
    *   Click **Create new key pair**.
    *   Name: `todo-app-key`.
    *   Type: `RSA`.
    *   Format: `.pem` (for Mac/Linux) or `.ppk` (for Windows/PuTTY).
    *   Click **Create key pair** and **SAVE THE DOWNLOADED FILE SECURELY**. You cannot download it again.
7.  **Network Settings (Security Group)**:
    *   Select "Create security group".
    *   Check **Allow SSH traffic from**. Set to "Anywhere" (0.0.0.0/0) or "My IP" for better security.
    *   **IMPORTANT**: We need to open a port for our app.
        *   Click **Edit** (top right of Network settings box) if needed to see "Add security group rule".
        *   Click **Add security group rule**.
        *   Type: **Custom TCP**.
        *   Port range: **8080**.
        *   Source: **Anywhere** (0.0.0.0/0).
8.  **Launch**: Review connection details and click **Launch instance**.

## Step 2: Connect to your Instance (Mac/Linux)

1.  Open your terminal.
2.  Navigate to where you downloaded your key pair:
    ```bash
    cd ~/Downloads
    ```
3.  **Fix permissions** (Crucial step):
    AWS requires your key file to be read-only by you.
    ```bash
    chmod 400 todo-app-key.pem
    ```
4.  **Connect via SSH**:
    Find your instance's **Public IPv4 address** in the AWS Console.
    ```bash
    ssh -i todo-app-key.pem ec2-user@<YOUR-PUBLIC-IP>
    ```
    *Type `yes` when asked to verify the fingerprint.*

## Step 3: Set Up the Environment

Once connected to your EC2 instance, run the following commands one by one.

### 1. Update the System
```bash
sudo yum update -y
```

### 2. Install Git
```bash
sudo yum install git -y
```

### 3. Install Node.js (via NVM)
We will use NVM (Node Version Manager) to install a specific version of Node.js.

```bash
# Download and install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Activate NVM (without restarting terminal)
source ~/.bashrc

# Install Node.js v22
nvm install 22

# Verify installation
node -v
npm -v
```

## Step 4: Clone and Deploy the Application

### 1. Clone the Repository
Since this is a new instance, you'll need your code here.
*(Note: If your repo is private, you'll need to set up SSH keys or use a Personal Access Token. For public repos, just use the HTTPS link).*

```bash
# Clone directly from GitHub (replace with your actual repo URL)
git clone https://github.com/YOUR_USERNAME/todo-react-app.git

# Navigate into the folder
cd todo-react-app
```

> **Alternative**: If you don't have a git repo yet, you can upload files from your local computer:
> `scp -i todo-app-key.pem -r . ec2-user@<IP>:~/todo-react-app`

### 2. Install Dependencies
```bash
npm install
```

### 3. Build for Production
This compiles your code into optimized static files in the `dist/` folder.
```bash
npm run build
```

### 4. Run with PM2
We use `pm2` to keep the app running in the background, even if you close the terminal.

```bash
# Install PM2 globally
npm install -g pm2

# Start the app securely serving the 'dist' folder
pm2 serve dist 8080 --name "todo-app" --spa

# Check status
pm2 list
```

### 5. (Optional) Ensure Startup on Reboot
If your instance restarts, you want your app to come back automatically.

```bash
# Generate startup script
pm2 startup
# (Run the command output by the line above if requested)

# Save current process list
pm2 save
```

## Step 5: Access Your App

1.  Open your web browser.
2.  Go to `http://<YOUR-PUBLIC-IP>:8080`.

🎉 You should see your Todo App running!
