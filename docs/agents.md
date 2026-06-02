# Agents

* **IntakePlannerAgent**: Drafts the initial plan based on user requests.
* **SourceUnderstandingAgent**: Evaluates sources for viability.
* **BenchmarkGeneratorAgent**: Uses retrieved chunks to formulate QA pairs. Contains logic for a "repair loop".
* **QualityEvaluatorAgent**: Scores samples on 0-1 metrics and makes routing decisions (pass, repair, reject).
* **ExportReportAgent**: Bundles outputs for delivery.
