import { useState, useEffect } from "react";
import { SampleData } from "./components/SampleCard";

export const MOCK_SAMPLE_DATA: SampleData[] = [
  {
    id: "sample-f273b1a8-8e6f-42e7-91cf-a548c909e701",
    category: "Cancellation Timeline",
    difficulty: "easy",
    sample_type: "single_hop",
    question: "What is the standard cancellation window for a premium monthly subscription?",
    expected_answer: "Premium monthly subscriptions can be cancelled within 7 days of the billing cycle start date for a full refund.",
    status: "GENERATED",
    retry_count: 0,
    overall_score: null,
    decision: null,
    evidence: [
      {
        id: "chunk-cancel-02",
        index: 2,
        document_name: "refund_policy.md",
        text: "Cancellation Window: Monthly premium subscribers may initiate a cancel request within seven (7) business days of their recurring billing date to receive a full reversal of fees. Any requests submitted after this 7-day period will apply to the subsequent billing cycle."
      }
    ]
  },
  {
    id: "sample-39cb58da-2f1a-471d-a0b2-bb2f89f28cf5",
    category: "Refund Eligibility",
    difficulty: "medium",
    sample_type: "single_hop",
    question: "Under what conditions can a user request a refund for a service outage?",
    expected_answer: "Users can request a refund if the outage exceeds 24 consecutive hours, or if the cumulative outage in a single calendar month exceeds 48 hours, verified by the system uptime logs.",
    status: "REPAIRED",
    retry_count: 1,
    overall_score: 0.85,
    decision: "repair",
    issues: ["Initially output answer was ungrounded in outage duration specs."],
    evaluator_notes: "Evaluator corrected the service outage time window based on section 4.2.",
    evidence: [
      {
        id: "chunk-elig-14",
        index: 14,
        document_name: "service_level_agreement.md",
        text: "Outage Credits & Refunds: Fees are refundable in full if system downtime exceeds 24 consecutive hours. For cumulative outages, if the service uptime drops below 99.5% (approx. 48 hours total downtime) within a single billing cycle, a partial credit of 15% will be automatically applied, or the user can request a full review."
      }
    ]
  },
  {
    id: "sample-f2483a9d-bca5-4309-8422-902319efc23d",
    category: "Subscription Adjustments",
    difficulty: "hard",
    sample_type: "multi_hop",
    question: "If a user upgrades from Basic to Enterprise, how is the refund computed if they cancel 15 days later?",
    expected_answer: "If a user upgrades and cancels 15 days later, the refund is calculated on a pro-rata basis for the unused portion of the Enterprise subscription minus a 10% administrative upgrade cancellation fee.",
    status: "APPROVED",
    retry_count: 2,
    overall_score: 0.98,
    decision: "pass",
    evidence: [
      {
        id: "chunk-upgrade-05",
        index: 5,
        document_name: "billing_terms.md",
        text: "Upgrade Adjustments: Upgrading accounts will have their unused portion of the previous plan credited toward the new tier. If the customer subsequently requests cancellation of the upgraded plan within 30 days, the calculation will be based on the pro-rated daily rate of the active upgraded tier."
      },
      {
        id: "chunk-admin-08",
        index: 8,
        document_name: "billing_terms.md",
        text: "Administrative Fees: Cancellation of upgraded accounts (specifically upgrades exceeding a 200% tier value increase, such as Basic to Enterprise) incurs a standard 10% administrative surcharge calculated against the total upgraded contract value."
      }
    ]
  },
  {
    id: "sample-a58392d1-21ff-4890-a3bc-11cf98f02931",
    category: "Refund Eligibility",
    difficulty: "hard",
    sample_type: "multi_hop",
    question: "Does the refund policy cover chargebacks initiated prior to contacting support?",
    expected_answer: "No. Initiating a bank chargeback before submitting a formal support request immediately suspends the account, voids refund eligibility, and incurs a $50 dispute processing fee.",
    status: "GENERATED",
    retry_count: 0,
    overall_score: null,
    decision: null,
    evidence: [
      {
        id: "chunk-dispute-11",
        index: 11,
        document_name: "chargeback_policy.md",
        text: "Dispute Resolution & Chargebacks: Customers must first file a billing ticket via support. If a customer initiates a chargeback dispute directly with their financial institution prior to contacting support, the account will be immediately flagged and suspended. All pending refunds are voided, and a $50 fee is assessed to cover dispute investigation costs."
      }
    ]
  }
];

export function useGeneratorSamples(projectId: string, demoMode: boolean) {
  const [samples, setSamples] = useState<SampleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (demoMode) {
      setSamples(MOCK_SAMPLE_DATA);
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;
    const fetchSamples = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${apiUrl}/api/projects/${projectId}/samples`);
        if (!res.ok) {
          throw new Error(`Error fetching samples: ${res.statusText}`);
        }
        const data = await res.json();
        
        if (active) {
          if (data && data.length > 0) {
            setSamples(data);
          } else {
            // If the endpoint is empty, fallback to rich mock data to avoid empty workspaces
            setSamples(MOCK_SAMPLE_DATA);
          }
          setError(null);
        }
      } catch (err: any) {
        console.error("Failed to load samples:", err);
        if (active) {
          setError(err.message || "Failed to load samples");
          // Fallback to mock data on error so the workspace doesn't break
          setSamples(MOCK_SAMPLE_DATA);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchSamples();

    return () => {
      active = false;
    };
  }, [projectId, demoMode]);

  return { samples, loading, error };
}
