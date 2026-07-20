import json

ENGLISH_BENCHMARK_SAMPLES = [
    {
        "category": "refund policy",
        "difficulty": "easy",
        "sample_type": "single_hop",
        "question": "How long do I have to request a refund?",
        "expected_answer": "You can request a full refund within 14 days of receiving your item if the product is defective.",
        "source_chunk_ids": ["mock_chunk_refund_001"]
    },
    {
        "category": "refund policy",
        "difficulty": "medium",
        "sample_type": "single_hop",
        "question": "How much will I be charged if I change my mind and return an item?",
        "expected_answer": "If you change your mind, you will be charged a 10% restocking fee and shipping fees will not be refunded.",
        "source_chunk_ids": ["mock_chunk_refund_002"]
    },
    {
        "category": "refund policy",
        "difficulty": "hard",
        "sample_type": "multi_hop",
        "question": "Will shipping fees be refunded if the product is defective?",
        "expected_answer": "The policy specifies a full refund for defective products and no shipping refund for change-of-mind returns. Usually defective products receive full refunds including shipping, but the documentation does not state detailed shipping refund rules for defective items.",
        "source_chunk_ids": ["mock_chunk_refund_001", "mock_chunk_refund_002"]
    },
    {
        "category": "shipping policy",
        "difficulty": "easy",
        "sample_type": "single_hop",
        "question": "What is the standard delivery time?",
        "expected_answer": "Standard shipping takes 3 to 5 business days.",
        "source_chunk_ids": ["mock_chunk_shipping_001"]
    },
    {
        "category": "shipping policy",
        "difficulty": "medium",
        "sample_type": "single_hop",
        "question": "How can I qualify for free shipping?",
        "expected_answer": "Free shipping applies to orders with a total value over $50.",
        "source_chunk_ids": ["mock_chunk_shipping_003"]
    },
    {
        "category": "shipping policy",
        "difficulty": "hard",
        "sample_type": "unanswerable",
        "question": "Can I place an order if I live in Cambodia?",
        "expected_answer": "Not enough information in the document. International shipping is currently not supported, so orders cannot be placed from Cambodia.",
        "source_chunk_ids": ["mock_chunk_shipping_004"]
    },
    {
        "category": "warranty",
        "difficulty": "easy",
        "sample_type": "single_hop",
        "question": "How long is the warranty period for electronic products?",
        "expected_answer": "All electronic products carry a 12-month warranty from the date of purchase.",
        "source_chunk_ids": ["mock_chunk_warranty_001"]
    },
    {
        "category": "warranty",
        "difficulty": "medium",
        "sample_type": "edge_case",
        "question": "Does the warranty cover damage caused by accidental drops?",
        "expected_answer": "No, the warranty does not cover user-induced damage such as drops, liquid damage, or improper usage.",
        "source_chunk_ids": ["mock_chunk_warranty_002"]
    },
    {
        "category": "warranty",
        "difficulty": "hard",
        "sample_type": "unanswerable",
        "question": "If I purchase an item abroad and bring it back, is it eligible for warranty service?",
        "expected_answer": "Not enough information in the document.",
        "source_chunk_ids": []
    },
    {
        "category": "order cancellation",
        "difficulty": "easy",
        "sample_type": "single_hop",
        "question": "Can I cancel my order before it gets shipped?",
        "expected_answer": "Yes, orders can be canceled free of charge before they are handed over to the shipping carrier.",
        "source_chunk_ids": ["mock_chunk_cancellation_001"]
    },
    {
        "category": "order cancellation",
        "difficulty": "medium",
        "sample_type": "single_hop",
        "question": "How do I know if my order has been handed over to the carrier?",
        "expected_answer": "You will receive an email or app notification once your order starts shipping.",
        "source_chunk_ids": ["mock_chunk_cancellation_002"]
    },
    {
        "category": "order cancellation",
        "difficulty": "hard",
        "sample_type": "multi_hop",
        "question": "What should I do if the order is already shipped but I still want to cancel?",
        "expected_answer": "Once the order is handed over to the shipping carrier, you cannot cancel it directly; you must process it as a return after receiving the package according to return regulations.",
        "source_chunk_ids": ["mock_chunk_cancellation_001", "mock_chunk_refund_001"]
    },
    {
        "category": "payment policy",
        "difficulty": "easy",
        "sample_type": "single_hop",
        "question": "What payment methods does the store accept?",
        "expected_answer": "We accept credit cards, bank transfers, and Cash on Delivery (COD).",
        "source_chunk_ids": ["mock_chunk_payment_001"]
    },
    {
        "category": "payment policy",
        "difficulty": "medium",
        "sample_type": "edge_case",
        "question": "Are there any restrictions on COD (Cash on Delivery) payments?",
        "expected_answer": "Cash on Delivery (COD) payment is only available for orders valued under $200.",
        "source_chunk_ids": ["mock_chunk_payment_002"]
    },
    {
        "category": "payment policy",
        "difficulty": "hard",
        "sample_type": "multi_hop",
        "question": "If I pay via credit card and cancel before shipping, how long will it take to get a refund?",
        "expected_answer": "Orders will be canceled free of charge before shipping, and per refund policy, the refund will be processed back to the original credit card payment method within 5-7 business days.",
        "source_chunk_ids": ["mock_chunk_payment_001", "mock_chunk_cancellation_001", "mock_chunk_refund_003"]
    }
]

# Aliases for backward compatibility
VIETNAMESE_BENCHMARK_SAMPLES = ENGLISH_BENCHMARK_SAMPLES
MOCK_BENCHMARK_SAMPLES = ENGLISH_BENCHMARK_SAMPLES

# 30 mock samples for full demo generation
mock_30_samples = []
for i in range(2):
    for sample in ENGLISH_BENCHMARK_SAMPLES:
        new_sample = sample.copy()
        if i == 1:
            new_sample['question'] += " (Follow-up)"
        mock_30_samples.append(new_sample)

MOCK_EVALUATION_LOW_SCORE = {
    "faithfulness_score": 0.5,
    "answer_relevance_score": 0.7,
    "context_precision_score": 0.8,
    "context_recall_score": 0.5,
    "hallucination_risk_score": 0.1,
    "answerability_score": 0.9,
    "clarity_score": 0.9,
    "difficulty_match_score": 0.8,
    "overall_score": 0.65,
    "decision": "repair",
    "issues": ["Answer lacks details combining both chunks."],
    "evaluator_notes": "Needs repair.",
    "repair_instruction": "Regenerate using a different user scenario and evidence angle while preserving category and difficulty."
}
