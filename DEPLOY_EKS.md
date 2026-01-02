# Deploying to Amazon EKS (Elastic Kubernetes Service)

This guide covers two distinct ways to deploy your application to Amazon EKS:
1.  **Standard Mode (EC2 Node Groups)**: You define and manage the EC2 instances that run your pods.
2.  **Auto Mode**: AWS automatically manages the compute, storage, and networking for you.

## 🛠 Prerequisites

Before proceeding, ensure you have the following tools installed and configured:

1.  **AWS CLI**: To interact with your AWS account.
    *   [Install Guide](https://docs.aws.amazon.com/eks/latest/userguide/install-awscli.html)
    *   Run `aws configure` to set up your credentials.
2.  **eksctl**: The official CLI for creating EKS clusters.
    *   [Install Guide](https://docs.aws.amazon.com/eks/latest/eksctl/installation.html)
3.  **kubectl**: The command line tool for Kubernetes.
    *   [Install Guide](https://kubernetes.io/docs/tasks/tools/#kubectl)

---

## Option 1: Standard EC2 Node Groups (Self-Managed)

In this method, you explicitly define "Node Groups". These are Auto Scaling Groups of EC2 instances that are registered with your cluster. You have full control over the instance type, disk size, and scaling configurations.

### 1. The Configuration File
We use `deployment/ec2-cluster-config.yaml`.

```yaml
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: simple-todo-react-app-ec2-cluster
  region: ap-south-1
  version: "1.34"

managedNodeGroups:
  - name: simple-todo-react-app-ec2-node-group
    instanceType: t3.small   # The EC2 instance type (2 vCPU, 2GB RAM)
    desiredCapacity: 2       # Start with 2 nodes
    volumeSize: 20           # 20GB disk per node
    # ... permissions ...
```

**Explanation:**
*   **metadata**: Defines the cluster name and region.
*   **managedNodeGroups**: AWS manages the provisioning of these nodes, but you decide the specs (`t3.small`).
*   **desiredCapacity**: Ensures you always have 2 servers running to host your pods.

### 2. Create the Cluster
Run the following command to provision the VPC, Control Plane, and Node Group:

```bash
eksctl create cluster -f deployment/ec2-cluster-config.yaml
```
*Note: This process typically takes 15–20 minutes.*

### 3. Deploy the Application
Once the cluster is ready, Deploy the standard Kubernetes manifests:

```bash
# Apply Deployment (replicas, image)
kubectl apply -f deployment/deployment.yaml

# Apply Service (LoadBalancer)
# CRITICAL: Ensures the Load Balancer is public-facing!
kubectl apply -f deployment/service.yaml
```

> **Why the Annotation?**
> By default, EKS often provisions **Internal** Load Balancers (accessible only inside the VPC) unless you explicitly specify `service.beta.kubernetes.io/aws-load-balancer-scheme: "internet-facing"`. If you skip this, your URL will exist but will be unreachable from the internet.

---

## Option 2: EKS Auto Mode (Fully Managed)

**EKS Auto Mode** is a newer operational mode where AWS automatically manages the infrastructure. Instead of defining Node Groups, AWS provisions instances into "Node Pools" automatically based on your pod requirements.

### 1. The Configuration File
We use `deployment/auto-mode-cluster-config.yaml`.

```yaml
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: todo-app-auto-cluster
  region: ap-south-1
  version: "1.34"

# Enable EKS Auto Mode
autoModeConfig:
  enabled: true

# Application Access (IRSA)
iam:
  withOIDC: true
```

**Explanation:**
*   **autoModeConfig.enabled**: This single flag tells AWS to handle the Compute (Node Pools), Storage (EBS CSI), and Networking (CNI/Load Balancers). You do NOT define instance types here.
*   **iam.withOIDC**: Enables "IAM Roles for Service Accounts", which is critical for security in managed clusters.

### 2. Create the Cluster
Run the following command:

```bash
eksctl create cluster -f deployment/auto-mode-cluster-config.yaml
```
*Note: While infrastructure management is automated, initial provisioning still takes time (approx 15 mins).*

### 3. Deploy the Application
The deployment steps are identical to standard Kubernetes:

```bash
# Apply Deployment
kubectl apply -f deployment/deployment.yaml

# Apply Service
# CRITICAL: Ensures the Load Balancer is public-facing!
kubectl apply -f deployment/service.yaml
```
> **Note on Connectivity**: Ensure your `service.yaml` includes the annotation `service.beta.kubernetes.io/aws-load-balancer-scheme: "internet-facing"`. Without it, AWS creates an **Internal** Load Balancer accessible only from within the VPC.

---

## 🔍 Verification & Access

After deploying (using either method), verify your app is running.

1.  **Check Nodes**:
    ```bash
    kubectl get nodes
    ```
2.  **Check Pods**:
    ```bash
    kubectl get pods
    ```
    *Status should be `Running`.*
3.  **Get Load Balancer URL**:
    ```bash
    kubectl get service todo-react-app-service
    ```
4.  **Access the App**:
    Copy the `EXTERNAL-IP` (e.g., `k8s-default-todo-app-xxxx.us-east-1.elb.amazonaws.com`) and open it in your browser.

---

## 🧹 Cleanup
To avoid AWS charges, delete the cluster when you are done.

```bash
# If using Option 1 (EC2)
eksctl delete cluster -f deployment/ec2-cluster-config.yaml

# If using Option 2 (Auto Mode)
eksctl delete cluster -f deployment/auto-mode-cluster-config.yaml
```
