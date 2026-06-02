# Demo Script (Under 3 mins)

1. Open the UI at `http://localhost:3000`.
2. Click **Start New Benchmark Project**.
3. Name it "Vietnamese Ecommerce", copy the text from `examples/vietnamese-ecommerce-policy/benchmark_request.txt`, and pretend to upload the markdown files from that same folder.
4. Click **Start Autopilot Workflow**.
5. Observe the status page update to "PLANNING" and then "WAITING_FOR_PLAN_APPROVAL".
6. Click **Review Benchmark Plan**. See the AI-generated plan.
7. Click **Approve Plan**.
8. Observe status move to "GENERATING" and "EVALUATING".
9. Click **Review Generated Samples**. See the table of generated questions. (Explain the hidden repair loop where weak samples were automatically fixed).
10. Click **Download Export Package**.
11. Show that the backend successfully generated the `export.zip` and (if configured) pushed it to Alibaba Cloud OSS.
