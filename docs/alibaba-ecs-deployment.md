# Alibaba Cloud ECS Deployment Guide

This guide outlines how to deploy the DatasetOps Autopilot application in production on an Alibaba Cloud ECS (Elastic Compute Service) instance.

## 1. Create an Alibaba Cloud ECS Instance

1. Log in to the [Alibaba Cloud Console](https://homenew.console.aliyun.com/).
2. Navigate to **Elastic Compute Service** -> **Instances**.
3. Click **Create Instance**.
4. Choose an appropriate instance type (e.g., at least 2 vCPUs and 4 GiB memory for smooth building and running).
5. Select a public image, preferably **Ubuntu 22.04** or **Ubuntu 24.04**.
6. Ensure a **Public IP** is assigned.
7. Configure your security group to open ports **80** (HTTP) and **22** (SSH). If you want direct access to the backend or frontend without Nginx, also open **8000** and **3000** respectively.

## 2. Install Docker and Docker Compose

SSH into your new instance:

```bash
ssh root@<YOUR_ECS_PUBLIC_IP>
```

Install Docker and Docker Compose:

```bash
# Add Docker's official GPG key and repository
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update

# Install Docker
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

## 3. Clone the Repository

Clone the application code to your instance:

```bash
git clone https://github.com/PTD504/datasetops-autopilot.git
cd datasetops-autopilot
```

## 4. Configure Environment Variables

Create your `.env` file based on the example:

```bash
cp .env.example .env
```

Edit the `.env` file (`nano .env`) to setup production environment variables. Make sure you correctly set up real Qwen integration and OSS storage:

```env
DATABASE_URL=postgresql://postgres:password@db:5432/datasetops
# Use your ECS public IP if accessing directly instead of through Nginx, or keep as http://localhost if using Nginx reverse proxy
NEXT_PUBLIC_API_URL=http://<YOUR_ECS_PUBLIC_IP>/api

MOCK_LLM=false
ALLOW_LLM_FALLBACK=false
STORAGE_MODE=oss

QWEN_API_KEY=your_real_qwen_api_key

ALIBABA_CLOUD_ACCESS_KEY_ID=your_access_key_id
ALIBABA_CLOUD_ACCESS_KEY_SECRET=your_access_key_secret
ALIBABA_CLOUD_OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com
ALIBABA_CLOUD_OSS_BUCKET=your_bucket_name
```

## 5. Run Production Docker Compose

Start the application using the production compose file. This uses multi-stage builds and Nginx for reverse proxying:

```bash
sudo docker compose -f docker-compose.prod.yml up --build -d
```

## 6. Verification Steps

### Backend Health

Wait for the containers to start, then verify the core backend is running:

```bash
curl http://localhost/api/health
```

### Qwen Health Endpoint

Check that the Qwen Model Studio connection is active and valid:

```bash
curl http://localhost/api/health/qwen
```

Ensure `test_call_success` returns `true`.

### Storage/OSS Health Endpoint

Verify that OSS credentials have read/write access:

```bash
curl http://localhost/api/health/storage
```

Ensure `test_call_success` returns `true`.

## 7. Open the Frontend & Run Demo

1. Open your browser and navigate to `http://<YOUR_ECS_PUBLIC_IP>`.
2. Follow the standard application flow:
   - Create a project.
   - Upload policy docs.
   - Enter a benchmark request.
   - Run the workflow and generate samples.
   - Export your ZIP file (which will be safely uploaded to your Alibaba Cloud OSS bucket).
