import { useState, useEffect } from "react";

export interface EvidenceItem {
  id: string;
  index: number;
  document_name: string;
  text: string;
  evidence_unavailable?: boolean;
}

export interface EvaluatorSample {
  id: string;
  category: string;
  difficulty: string;
  sample_type: string;
  question: string;
  expected_answer: string;
  status: string;
  retry_count: number;
  
  // Quality evaluation specific fields
  overall_score: number | null;
  decision: "pass" | "repair" | "human_review" | "reject" | null;
  faithfulness_score: number | null;
  answer_relevance_score: number | null;
  context_precision_score?: number | null;
  context_recall_score?: number | null;
  hallucination_risk_score: number | null;
  clarity_score?: number | null;
  difficulty_match_score?: number | null;
  answerability_score?: number | null;
  novelty_score?: number | null;
  
  issues: string[];
  evaluator_notes: string | null;
  repair_instruction: string | null;
  evidence: EvidenceItem[];
}

export const MOCK_EVALUATOR_SAMPLES: EvaluatorSample[] = [
  {
    id: "sample-f273b1a8-8e6f-42e7-91cf-a548c909e701",
    category: "Cancellation Timeline",
    difficulty: "easy",
    sample_type: "single_hop",
    question: "What is the standard cancellation window for a premium monthly subscription?",
    expected_answer: "Premium monthly subscriptions can be cancelled within 7 days of the billing cycle start date for a full refund.",
    status: "APPROVED",
    retry_count: 0,
    overall_score: 0.95,
    decision: "pass",
    faithfulness_score: 0.98,
    answer_relevance_score: 0.96,
    context_precision_score: 0.95,
    context_recall_score: 0.98,
    hallucination_risk_score: 0.02,
    clarity_score: 0.97,
    difficulty_match_score: 0.95,
    answerability_score: 1.0,
    novelty_score: 0.92,
    issues: [],
    evaluator_notes: "The response is fully grounded in the provided refund policy documentation. The monthly subscription cancellation window is clearly stated as 7 days, matching the chunk details.",
    repair_instruction: null,
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
    overall_score: 0.88,
    decision: "pass",
    faithfulness_score: 0.92,
    answer_relevance_score: 0.90,
    context_precision_score: 0.85,
    context_recall_score: 0.90,
    hallucination_risk_score: 0.08,
    clarity_score: 0.91,
    difficulty_match_score: 0.85,
    answerability_score: 0.95,
    novelty_score: 0.89,
    issues: ["Initially output answer was ungrounded in outage duration specs."],
    evaluator_notes: "Negotiation Turn 1: Generator revised the answer to correctly cite the 24-consecutive-hour outage rule and the 48-hour cumulative monthly rule. The new text matches Section 4.2 exactly, resolving the initial grounding gap.",
    repair_instruction: "Rewrite the answer so it only uses the cited refund policy chunk.",
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
    overall_score: 0.94,
    decision: "pass",
    faithfulness_score: 0.96,
    answer_relevance_score: 0.95,
    context_precision_score: 0.92,
    context_recall_score: 0.96,
    hallucination_risk_score: 0.03,
    clarity_score: 0.92,
    difficulty_match_score: 0.94,
    answerability_score: 0.98,
    novelty_score: 0.86,
    issues: ["Initial draft failed to apply the pro-rata computation.", "Turn 1 revision forgot to include the 10% administrative fee surcharge."],
    evaluator_notes: "Negotiation Turn 2: The generator successfully synthesizes the pro-rata computation from billing_terms.md #5 and the 10% admin surcharge from billing_terms.md #8. All multi-hop details are fully resolved.",
    repair_instruction: "Include the 10% administrative fee penalty for upgrades cancelling in under 30 days.",
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
    status: "APPROVED",
    retry_count: 0,
    overall_score: 0.92,
    decision: "pass",
    faithfulness_score: 0.94,
    answer_relevance_score: 0.92,
    context_precision_score: 0.90,
    context_recall_score: 0.94,
    hallucination_risk_score: 0.04,
    clarity_score: 0.95,
    difficulty_match_score: 0.90,
    answerability_score: 1.0,
    novelty_score: 0.93,
    issues: [],
    evaluator_notes: "Perfect alignment. The expected answer states that refund eligibility is voided and a fee is charged, which is fully supported by the chargeback_policy document.",
    repair_instruction: null,
    evidence: [
      {
        id: "chunk-dispute-11",
        index: 11,
        document_name: "chargeback_policy.md",
        text: "Dispute Resolution & Chargebacks: Customers must first file a billing ticket via support. If a customer initiates a chargeback dispute directly with their financial institution prior to contacting support, the account will be immediately flagged and suspended. All pending refunds are voided, and a $50 fee is assessed to cover dispute investigation costs."
      }
    ]
  },
  {
    id: "sample-38cf5612-421c-43df-9e2c-e1bc89a71221",
    category: "Shipping Policy",
    difficulty: "easy",
    sample_type: "single_hop",
    question: "What is the standard delivery timeframe for domestic orders?",
    expected_answer: "Standard shipping takes 3-5 business days for deliveries within the continental United States.",
    status: "APPROVED",
    retry_count: 0,
    overall_score: 0.96,
    decision: "pass",
    faithfulness_score: 0.98,
    answer_relevance_score: 0.98,
    context_precision_score: 0.95,
    context_recall_score: 0.98,
    hallucination_risk_score: 0.01,
    clarity_score: 0.96,
    difficulty_match_score: 0.95,
    answerability_score: 1.0,
    novelty_score: 0.88,
    issues: [],
    evaluator_notes: "Grounded directly. Frame match is 100% correct.",
    repair_instruction: null,
    evidence: [
      {
        id: "chunk-ship-01",
        index: 1,
        document_name: "shipping_faq.md",
        text: "Standard Shipping Rates and Times: For all domestic orders within the continental US, delivery is fulfilled via standard ground shipping and typically arrives between three to five (3-5) business days from date of dispatch."
      }
    ]
  },
  {
    id: "sample-99bc82ad-01f1-432d-82d2-28df8b1a3d90",
    category: "Shipping Policy",
    difficulty: "hard",
    sample_type: "unanswerable",
    question: "How long does standard shipping take if I order from a remote location in Alaska or Hawaii?",
    expected_answer: "The provided documents do not contain information about standard shipping times for remote locations in Alaska or Hawaii.",
    status: "APPROVED",
    retry_count: 0,
    overall_score: 0.94,
    decision: "pass",
    faithfulness_score: 0.95,
    answer_relevance_score: 0.96,
    context_precision_score: 0.90,
    context_recall_score: 0.95,
    hallucination_risk_score: 0.02,
    clarity_score: 0.92,
    difficulty_match_score: 0.95,
    answerability_score: 1.0,
    novelty_score: 0.95,
    issues: [],
    evaluator_notes: "Intentional unanswerable test. The generator correctly identified that shipping guidelines only specify 'continental US' and declared this specific question unanswerable. Fully grounded negation.",
    repair_instruction: null,
    evidence: [
      {
        id: "chunk-ship-01",
        index: 1,
        document_name: "shipping_faq.md",
        text: "Standard Shipping Rates and Times: For all domestic orders within the continental US, delivery is fulfilled via standard ground shipping and typically arrives between three to five (3-5) business days from date of dispatch."
      }
    ]
  },
  {
    id: "sample-7cba491a-82ff-4b10-ad2e-8391af220912",
    category: "Warranty",
    difficulty: "medium",
    sample_type: "single_hop",
    question: "Are battery replacements covered under the standard product warranty?",
    expected_answer: "No, the standard 12-month warranty excludes consumable parts like batteries and protective coatings unless damage occurred due to a defect in materials or workmanship.",
    status: "APPROVED",
    retry_count: 0,
    overall_score: 0.93,
    decision: "pass",
    faithfulness_score: 0.96,
    answer_relevance_score: 0.94,
    context_precision_score: 0.92,
    context_recall_score: 0.95,
    hallucination_risk_score: 0.03,
    clarity_score: 0.93,
    difficulty_match_score: 0.90,
    answerability_score: 1.0,
    novelty_score: 0.91,
    issues: [],
    evaluator_notes: "Accurate extraction of the warranty exclusions text. Directly maps to Section 3.1.",
    repair_instruction: null,
    evidence: [
      {
        id: "chunk-warranty-03",
        index: 3,
        document_name: "hardware_warranty.md",
        text: "Warranty Exclusions: This limited warranty does not cover: (a) consumable parts, such as batteries or protective coatings designed to diminish over time, unless failure has occurred due to a defect in materials or workmanship; (b) cosmetic damage, including scratches and dents."
      }
    ]
  },
  {
    id: "sample-6c8f2b2d-1282-4bf1-a8cf-4ef8ba991a03",
    category: "Payment Methods",
    difficulty: "medium",
    sample_type: "edge_case",
    question: "What is the maximum order limit allowed for Cash on Delivery (COD) transactions?",
    expected_answer: "The maximum limit for Cash on Delivery (COD) transactions is $500 per order, and it is only available in authorized zip codes.",
    status: "REPAIRED",
    retry_count: 1,
    overall_score: 0.90,
    decision: "pass",
    faithfulness_score: 0.94,
    answer_relevance_score: 0.92,
    context_precision_score: 0.88,
    context_recall_score: 0.92,
    hallucination_risk_score: 0.04,
    clarity_score: 0.94,
    difficulty_match_score: 0.88,
    answerability_score: 0.98,
    novelty_score: 0.90,
    issues: ["Initially hallucinated a $1,000 COD limit from general knowledge."],
    evaluator_notes: "Negotiation Turn 1: Corrected. The generator originally assumed the default limit was $1000, but the critic requested an alignment with checkout_terms.md which states $500 max. The corrected answer is fully grounded.",
    repair_instruction: "Correct the cash-on-delivery threshold limit. Check checkout_terms.md chunk #3.",
    evidence: [
      {
        id: "chunk-checkout-03",
        index: 3,
        document_name: "checkout_terms.md",
        text: "Payment Methods: We support Credit Cards, PayPal, and Cash on Delivery (COD). COD transactions are capped at five hundred dollars ($500) per individual invoice and restricted to delivery routes operated directly by our logistics fleet."
      }
    ]
  },
  {
    id: "sample-01cb89d2-921a-4ab2-bc22-cf89283abf33",
    category: "Account Management",
    difficulty: "easy",
    sample_type: "single_hop",
    question: "How can I request permanent deletion of my account?",
    expected_answer: "Account deletion can be requested via the Account Settings panel, and will take up to 30 days to process completely.",
    status: "APPROVED",
    retry_count: 0,
    overall_score: 0.91,
    decision: "pass",
    faithfulness_score: 0.94,
    answer_relevance_score: 0.90,
    context_precision_score: 0.89,
    context_recall_score: 0.94,
    hallucination_risk_score: 0.05,
    clarity_score: 0.93,
    difficulty_match_score: 0.92,
    answerability_score: 1.0,
    novelty_score: 0.87,
    issues: [],
    evaluator_notes: "Grounded. Process time frame matches the 30-day policy.",
    repair_instruction: null,
    evidence: [
      {
        id: "chunk-privacy-09",
        index: 9,
        document_name: "privacy_policy.md",
        text: "Account Deactivation & Deletion: Customers may request permanent erasure of personal data by choosing 'Delete Profile' in the Account Settings dashboard. Our compliance team processes these requests within thirty (30) business days."
      }
    ]
  },
  {
    id: "sample-a02ff839-bc1a-4712-ad99-28cb8921af7b",
    category: "Refund Eligibility",
    difficulty: "hard",
    sample_type: "multi_hop",
    question: "If I cancel my annual subscription after 6 months, am I entitled to a pro-rated refund?",
    expected_answer: "No, annual plans are billed upfront and are non-refundable after the first 30 days of purchase. Only monthly subscriptions are eligible for pro-rated billing adjustments.",
    status: "APPROVED",
    retry_count: 0,
    overall_score: 0.95,
    decision: "pass",
    faithfulness_score: 0.98,
    answer_relevance_score: 0.96,
    context_precision_score: 0.94,
    context_recall_score: 0.98,
    hallucination_risk_score: 0.02,
    clarity_score: 0.95,
    difficulty_match_score: 0.95,
    answerability_score: 1.0,
    novelty_score: 0.89,
    issues: [],
    evaluator_notes: "The comparison between monthly and annual plans is correctly synthesized from the billing FAQ. Fully grounded.",
    repair_instruction: null,
    evidence: [
      {
        id: "chunk-billing-faq-04",
        index: 4,
        document_name: "billing_faq.md",
        text: "Annual Subscriptions: All annual memberships represent a twelve-month commitment, payable in advance. Cancellations requested after the 30-day satisfaction guarantee window will terminate future renewals but do not qualify for pro-rated refunds for the remaining term."
      }
    ]
  },
  // --- REPAIR SAMPLES (STILL IN PROGRESS / FAILED INITIAL CHECKS) ---
  {
    id: "sample-5b8d234a-9b2f-410a-ad2c-12bc89fa012c",
    category: "Warranty",
    difficulty: "medium",
    sample_type: "single_hop",
    question: "What should I do if my item arrives damaged during shipment?",
    expected_answer: "You must report damaged items to customer support within 48 hours of delivery and provide photos of both the outer packaging and the product.",
    status: "REPAIRING",
    retry_count: 1,
    overall_score: 0.68,
    decision: "repair",
    faithfulness_score: 0.60,
    answer_relevance_score: 0.85,
    context_precision_score: 0.90,
    context_recall_score: 0.60,
    hallucination_risk_score: 0.40,
    clarity_score: 0.88,
    difficulty_match_score: 0.70,
    answerability_score: 0.90,
    novelty_score: 0.85,
    issues: [
      "Weak grounding: The answer asserts a 7-day reporting period, but the document mandates reporting within 48 hours of receipt.",
      "Moderate hallucination risk regarding the submission protocol."
    ],
    evaluator_notes: "The generator has hallucinated the reporting time window. It says customers have 7 days to report shipping damage, whereas return_instructions.md chunk #12 explicitly specifies forty-eight (48) hours. Sending back for repair.",
    repair_instruction: "Rewrite the answer. Correct the reporting timeline from 7 days to 48 hours as documented in return_instructions.md.",
    evidence: [
      {
        id: "chunk-return-12",
        index: 12,
        document_name: "return_instructions.md",
        text: "Damaged Items: If a shipment arrives damaged, this must be reported to returns@acme.com within 48 hours of courier delivery confirmation. Documentation including clear digital photographs of the damaged box, packaging, and item itself must be attached to the claim ticket."
      }
    ]
  },
  {
    id: "sample-bc8f9a2d-28cb-472e-83ab-ff11cb93d8b2",
    category: "Payment Methods",
    difficulty: "hard",
    sample_type: "multi_hop",
    question: "Can I split a payment between a credit card and a store gift card?",
    expected_answer: "Yes, you can use a gift card for a partial payment and cover the remaining balance with any accepted credit card at checkout.",
    status: "REPAIRING",
    retry_count: 0,
    overall_score: 0.58,
    decision: "repair",
    faithfulness_score: 0.50,
    answer_relevance_score: 0.80,
    context_precision_score: 0.70,
    context_recall_score: 0.50,
    hallucination_risk_score: 0.55,
    clarity_score: 0.75,
    difficulty_match_score: 0.72,
    answerability_score: 0.85,
    novelty_score: 0.92,
    issues: [
      "Weak grounding: Answer claims that splitting payments is not allowed, but gift cards can be combined.",
      "Conflict with billing policy guidelines."
    ],
    evaluator_notes: "The generator claim that 'split payments are not supported' directly contradicts checkout_terms.md #6 which allows combining store credit/gift cards with a primary credit card. The agent needs to align with the permissive clause.",
    repair_instruction: "Revise the answer. Split payments *are* allowed when combining a store gift card or store credit with a standard credit card. Review checkout_terms.md chunk #6.",
    evidence: [
      {
        id: "chunk-checkout-06",
        index: 6,
        document_name: "checkout_terms.md",
        text: "Split Transactions: While we do not support split billing across two separate bank credit cards, customers are fully permitted to apply store gift cards or promotional vouchers first, and cover the remaining invoice amount via credit card or PayPal."
      }
    ]
  },
  // --- HUMAN REVIEW WORKFLOW CHECKPOINTS (NOT FAILURES) ---
  {
    id: "sample-ab021cf8-bb99-4d2c-88ab-f22abcf89ad1",
    category: "Subscription Adjustments",
    difficulty: "hard",
    sample_type: "multi_hop",
    question: "Is there an administrative charge for transferring a license key from a Corporate Plan to a Personal Plan?",
    expected_answer: "No, transferring license keys is free, but it must be approved by the Corporate account administrator and takes 5 days.",
    status: "HUMAN_REVIEW",
    retry_count: 2,
    overall_score: 0.72,
    decision: "human_review",
    faithfulness_score: 0.82,
    answer_relevance_score: 0.84,
    context_precision_score: 0.75,
    context_recall_score: 0.80,
    hallucination_risk_score: 0.20,
    clarity_score: 0.82,
    difficulty_match_score: 0.85,
    answerability_score: 0.90,
    novelty_score: 0.96,
    issues: [
      "Ambiguity: The source text does not explicitly detail corporate-to-personal downgrades, only general enterprise allocation.",
      "Max repair retries (2) reached without a decisive quality threshold match."
    ],
    evaluator_notes: "Negotiation Turn 2: The generator has attempted to answer twice. The source documents contain info about 'general license reallocations' but do not explicitly cover downgrading from Corporate to Personal plans. The answer is reasonable but borders on an extrapolation. Recommending Human-in-the-Loop review to decide if this question should be approved or pruned.",
    repair_instruction: null,
    evidence: [
      {
        id: "chunk-licensing-02",
        index: 2,
        document_name: "licensing_terms.md",
        text: "Enterprise License Transfer: Seat reassignments within a corporate subscription are managed directly via the organization portal by authorized IT administrators. Corporate license transfers do not incur additional seat activation surcharges, provided total active seats remain within the contracted allocation limit."
      }
    ]
  },
  {
    id: "sample-77fa8bc2-211d-40aa-a9d9-bbdf12ca87ab",
    category: "Refund Eligibility",
    difficulty: "medium",
    sample_type: "single_hop",
    question: "Can I receive a refund if I bought the product from an unofficial reseller?",
    expected_answer: "No. Refunds are only processed for purchases made directly through our website or authorized retail stores.",
    status: "HUMAN_REVIEW",
    retry_count: 2,
    overall_score: 0.75,
    decision: "human_review",
    faithfulness_score: 0.84,
    answer_relevance_score: 0.88,
    context_precision_score: 0.80,
    context_recall_score: 0.85,
    hallucination_risk_score: 0.15,
    clarity_score: 0.90,
    difficulty_match_score: 0.80,
    answerability_score: 0.92,
    novelty_score: 0.94,
    issues: [
      "Ungrounded inference: The source documents mention 'authorized partners' but don't strictly exclude indirect refunds.",
      "Max repair retries (2) reached."
    ],
    evaluator_notes: "The return guidelines state that 'purchases must be verified with a proof of purchase issued by our billing department or an authorized distributor'. The generator infers that 'unofficial resellers' are excluded. While highly probable and logical, it is not explicitly stated in the context text. Needs human judgment to approve or reject.",
    repair_instruction: null,
    evidence: [
      {
        id: "chunk-refund-01",
        index: 1,
        document_name: "refund_policy.md",
        text: "Proof of Purchase: Acme requires a valid system invoice number or transaction ID from an authorized reseller or payment channel to process refund claims. Claims submitted without verifiable purchase proof will be placed on administrative hold."
      }
    ]
  },
  // --- REJECTED SAMPLES ---
  {
    id: "sample-99df28cd-bb88-4444-a123-bb2f89ca0121",
    category: "Warranty",
    difficulty: "easy",
    sample_type: "single_hop",
    question: "How long is the warranty duration?",
    expected_answer: "We offer a lifetime warranty on all aluminum parts.",
    status: "REJECTED",
    retry_count: 2,
    overall_score: 0.45,
    decision: "reject",
    faithfulness_score: 0.35,
    answer_relevance_score: 0.50,
    context_precision_score: 0.50,
    context_recall_score: 0.40,
    hallucination_risk_score: 0.78,
    clarity_score: 0.70,
    difficulty_match_score: 0.60,
    answerability_score: 0.70,
    novelty_score: 0.48,
    issues: [
      "Severe Hallucination: The document actually specifies a 12-month hardware warranty. There is no mention of a 'lifetime warranty' for aluminum parts.",
      "Critical failure on Faithfulness threshold.",
      "Low novelty (duplicate question context)."
    ],
    evaluator_notes: "Evaluation failed. The generator has hallucinated a 'lifetime warranty' which is completely unsupported. Furthermore, this is a near-duplicate of existing question sample-7cba491a. Rejecting sample from the benchmark.",
    repair_instruction: "Prune from final benchmark. Severe hallucination and duplicate query path.",
    evidence: [
      {
        id: "chunk-warranty-01",
        index: 1,
        document_name: "hardware_warranty.md",
        text: "Standard Warranty Period: Acme hardware devices carry a twelve (12) month limited warranty beginning on the date of retail delivery to the end-user customer."
      }
    ]
  }
];

// Generate additional mock samples to fill up to 30 items
for (let i = 1; i <= 20; i++) {
  const original = MOCK_EVALUATOR_SAMPLES[i % MOCK_EVALUATOR_SAMPLES.length];
  const decisions: ("pass" | "repair" | "human_review" | "reject")[] = ["pass", "pass", "pass", "repair", "human_review", "reject"];
  const decision = decisions[i % decisions.length];
  
  let status = "APPROVED";
  let retryCount = 0;
  let score = 0.90 + (i % 10) / 100;
  let notes = "Sample meets all validation criteria. Grounding, answer relevance, and clarity are within parameters.";
  let repairInstruction = null;
  let issues: string[] = [];
  
  if (decision === "repair") {
    status = "REPAIRING";
    retryCount = i % 2 === 0 ? 1 : 0;
    score = 0.60 + (i % 15) / 100;
    issues = ["Minor grounding discrepancy found in subsection references."];
    notes = `Evaluation detected minor grounding alignment discrepancies. Prompting generator for repair Turn ${retryCount + 1}.`;
    repairInstruction = `Verify the reference clause for item #${i + 2}. Do not extrapolate details not found in document.`;
  } else if (decision === "human_review") {
    status = "HUMAN_REVIEW";
    retryCount = 2;
    score = 0.70 + (i % 10) / 100;
    issues = ["High ambiguity in source chunk context.", "Max retry attempts reached."];
    notes = "The question contains terminology with minor semantic shift. Needs human verification to confirm accuracy.";
  } else if (decision === "reject") {
    status = "REJECTED";
    retryCount = 2;
    score = 0.40 + (i % 10) / 100;
    issues = ["Hallucination detected in date references.", "Duplicate question coverage."];
    notes = "Critical hallucination: The answer quotes a 45-day return policy whereas the document only lists 14 days. Rejecting.";
  }

  MOCK_EVALUATOR_SAMPLES.push({
    id: `sample-mock-gen-${1000 + i}-${original.id.substring(12, 16)}`,
    category: original.category,
    difficulty: i % 3 === 0 ? "easy" : i % 3 === 1 ? "medium" : "hard",
    sample_type: original.sample_type,
    question: `${original.question.replace(/\?$/, "")} (Test Variant #${i})?`,
    expected_answer: `[Mock Variant #${i}] ${original.expected_answer}`,
    status,
    retry_count: retryCount,
    overall_score: score,
    decision,
    faithfulness_score: decision === "reject" ? 0.35 : score + 0.02,
    answer_relevance_score: decision === "reject" ? 0.45 : score + 0.03,
    context_precision_score: score - 0.05,
    context_recall_score: score - 0.02,
    hallucination_risk_score: decision === "reject" ? 0.75 : 0.02 + (i % 8) / 100,
    clarity_score: 0.85 + (i % 10) / 100,
    difficulty_match_score: 0.90,
    answerability_score: 1.0,
    novelty_score: 0.80 + (i % 20) / 100,
    issues,
    evaluator_notes: notes,
    repair_instruction: repairInstruction,
    evidence: original.evidence
  });
}

export function useEvaluatorSamples(projectId: string, demoMode: boolean) {
  const [samples, setSamples] = useState<EvaluatorSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (demoMode) {
      setSamples(MOCK_EVALUATOR_SAMPLES);
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
            // Map backend data to evaluator shape, applying defaults where missing
            const mappedData: EvaluatorSample[] = data.map((s: any) => {
              // Map backend sample statuses to evaluator decisions if decision is missing
              let decision: "pass" | "repair" | "human_review" | "reject" | null = s.decision;
              if (!decision) {
                const stat = (s.status || "").toUpperCase();
                if (stat === "APPROVED" || stat === "PASS") decision = "pass";
                else if (stat === "REPAIRING" || stat === "REPAIRED" || stat === "REPAIR") decision = "repair";
                else if (stat === "HUMAN_REVIEW" || stat === "NEEDS_REVIEW") decision = "human_review";
                else if (stat === "REJECTED" || stat === "REJECT") decision = "reject";
              }
              
              return {
                id: s.id,
                category: s.category || "General",
                difficulty: s.difficulty || "medium",
                sample_type: s.sample_type || "single_hop",
                question: s.question,
                expected_answer: s.expected_answer,
                status: s.status,
                retry_count: s.retry_count || 0,
                overall_score: s.overall_score !== undefined ? s.overall_score : null,
                decision,
                faithfulness_score: s.faithfulness_score !== undefined ? s.faithfulness_score : null,
                answer_relevance_score: s.answer_relevance_score !== undefined ? s.answer_relevance_score : null,
                context_precision_score: s.context_precision_score !== undefined ? s.context_precision_score : null,
                context_recall_score: s.context_recall_score !== undefined ? s.context_recall_score : null,
                hallucination_risk_score: s.hallucination_risk_score !== undefined ? s.hallucination_risk_score : null,
                clarity_score: s.clarity_score !== undefined ? s.clarity_score : null,
                difficulty_match_score: s.difficulty_match_score !== undefined ? s.difficulty_match_score : null,
                answerability_score: s.answerability_score !== undefined ? s.answerability_score : null,
                novelty_score: s.novelty_score !== undefined ? s.novelty_score : null,
                issues: s.issues || [],
                evaluator_notes: s.evaluator_notes || s.evaluator_notes === null ? s.evaluator_notes : "Processed by Quality Evaluator Agent.",
                repair_instruction: s.repair_instruction || null,
                evidence: s.evidence || []
              };
            });
            setSamples(mappedData);
          } else {
            // Empty DB fallback
            setSamples(MOCK_EVALUATOR_SAMPLES);
          }
          setError(null);
        }
      } catch (err: any) {
        console.error("Failed to load evaluation samples:", err);
        if (active) {
          setError(err.message || "Failed to load evaluation samples");
          setSamples(MOCK_EVALUATOR_SAMPLES);
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

  return { samples, setSamples, loading, error };
}
