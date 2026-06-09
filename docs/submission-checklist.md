# Hackathon Submission Checklist

Before finalizing the submission for the Qwen Cloud Global Hackathon, ensure all the following requirements are met:

- [ ] **Public GitHub repository requirement:** The repository is public and accessible to judges.
- [ ] **Open source license visible:** An open-source license (e.g., MIT, Apache 2.0) is available at the repository top level.
- [ ] **Architecture diagram exists:** `docs/architecture.md` contains a Mermaid diagram explaining the system.
- [ ] **Demo video under 3 minutes:** The main demo video effectively showcases the application and adheres to the time limit.
- [ ] **Alibaba Cloud backend proof recording:** A short, separate recording demonstrates the application running on Alibaba Cloud ECS and passing health checks.
- [ ] **Link to code file proving Alibaba Cloud API/service usage:** Code wrappers (`backend/wrappers/oss_client.py` and `backend/wrappers/qwen_client.py`) clearly show integration with Alibaba APIs.
- [ ] **Track identified as Track 4: Autopilot Agent:** The submission text clearly states the track.
- [ ] **Text description prepared:** A comprehensive text description of the project is ready for the submission platform.
- [ ] **README updated:** The `README.md` clearly explains what the project is, how to set it up, and how to verify the deployment.
- [ ] **`.env.example` complete:** The environment template includes all necessary variables for both local and production environments.
- [ ] **No secrets committed:** The repository has been thoroughly checked to ensure no hardcoded API keys or secrets are committed.
- [ ] **App can run locally with mock mode:** The deterministic local fallback flow (`MOCK_LLM=true`, `STORAGE_MODE=local`) works perfectly without credentials.
- [ ] **App can run with real Qwen + OSS configuration:** The production flow (`MOCK_LLM=false`, `STORAGE_MODE=oss`) works flawlessly when provided with real credentials.
- [x] **Phase 7A Completed:** Advanced sample types implemented.
- [x] **Phase 7B Completed:** Evaluator agent upgraded to use RAG-specific quality metrics.
