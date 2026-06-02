# Deployment Instructions

## Docker Compose (Local / Single Node ECS)

1. Clone the repository.
2. Ensure you have Docker and Docker Compose installed.
3. Copy `.env.example` to `.env` and fill in your Alibaba Cloud credentials:
   ```
   QWEN_API_KEY=your_key
   ALIBABA_CLOUD_ACCESS_KEY_ID=your_id
   ALIBABA_CLOUD_ACCESS_KEY_SECRET=your_secret
   ALIBABA_CLOUD_OSS_BUCKET=your_bucket
   STORAGE_MODE=oss
   MOCK_LLM=false
   ```
4. Run `docker compose up --build -d`.
5. Access the frontend at port 3000 and the backend API at port 8000.
