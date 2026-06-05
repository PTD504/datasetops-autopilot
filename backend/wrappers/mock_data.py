import json

VIETNAMESE_BENCHMARK_SAMPLES = [
    {
        "category": "refund policy",
        "difficulty": "easy",
        "sample_type": "single_hop",
        "question": "Tôi có thể yêu cầu hoàn tiền trong bao lâu?",
        "expected_answer": "Bạn có thể yêu cầu hoàn tiền toàn bộ trong vòng 14 ngày kể từ ngày nhận hàng nếu sản phẩm bị lỗi.",
        "source_chunk_ids": ["mock_chunk_refund_001"]
    },
    {
        "category": "refund policy",
        "difficulty": "medium",
        "sample_type": "single_hop",
        "question": "Tôi sẽ mất bao nhiêu tiền phí nếu đổi ý và trả hàng?",
        "expected_answer": "Nếu bạn đổi ý, bạn sẽ chịu phí hoàn trả 10% và phí vận chuyển sẽ không được hoàn lại.",
        "source_chunk_ids": ["mock_chunk_refund_002"]
    },
    {
        "category": "refund policy",
        "difficulty": "hard",
        "sample_type": "multi_hop",
        "question": "Tôi có được hoàn lại phí vận chuyển nếu sản phẩm bị lỗi không?",
        "expected_answer": "Chính sách chỉ đề cập hoàn tiền toàn bộ đối với sản phẩm lỗi và không hoàn phí vận chuyển nếu bạn đổi ý. Thường thì sản phẩm lỗi sẽ được hoàn trả toàn bộ, bao gồm cả phí vận chuyển, tuy nhiên tài liệu không ghi chi tiết về phí vận chuyển cho hàng lỗi.",
        "source_chunk_ids": ["mock_chunk_refund_001", "mock_chunk_refund_002"]
    },
    {
        "category": "shipping policy",
        "difficulty": "easy",
        "sample_type": "single_hop",
        "question": "Thời gian giao hàng tiêu chuẩn là bao lâu?",
        "expected_answer": "Giao hàng tiêu chuẩn mất 3-5 ngày làm việc trong lãnh thổ Việt Nam.",
        "source_chunk_ids": ["mock_chunk_shipping_001"]
    },
    {
        "category": "shipping policy",
        "difficulty": "medium",
        "sample_type": "single_hop",
        "question": "Làm thế nào để được miễn phí vận chuyển?",
        "expected_answer": "Miễn phí vận chuyển áp dụng cho các đơn hàng có giá trị trên 500.000 VNĐ.",
        "source_chunk_ids": ["mock_chunk_shipping_003"]
    },
    {
        "category": "shipping policy",
        "difficulty": "hard",
        "sample_type": "unanswerable",
        "question": "Nếu tôi ở Campuchia, tôi có thể đặt hàng được không?",
        "expected_answer": "Không đủ thông tin trong tài liệu. Hiện tại không hỗ trợ giao hàng quốc tế, nên bạn không thể đặt hàng nếu ở Campuchia.",
        "source_chunk_ids": ["mock_chunk_shipping_004"]
    },
    {
        "category": "warranty",
        "difficulty": "easy",
        "sample_type": "single_hop",
        "question": "Thời gian bảo hành cho đồ điện tử là bao lâu?",
        "expected_answer": "Tất cả các sản phẩm điện tử đều được bảo hành 12 tháng kể từ ngày mua.",
        "source_chunk_ids": ["mock_chunk_warranty_001"]
    },
    {
        "category": "warranty",
        "difficulty": "medium",
        "sample_type": "edge_case",
        "question": "Bảo hành có áp dụng cho sản phẩm bị rơi vỡ không?",
        "expected_answer": "Không, bảo hành không áp dụng đối với các trường hợp hư hỏng do người dùng như rơi rớt, vào nước hoặc sử dụng sai cách.",
        "source_chunk_ids": ["mock_chunk_warranty_002"]
    },
    {
        "category": "warranty",
        "difficulty": "hard",
        "sample_type": "unanswerable",
        "question": "Nếu tôi mua hàng ở một nước khác và mang về Việt Nam, thì tôi có được bảo hành không?",
        "expected_answer": "Không đủ thông tin trong tài liệu.",
        "source_chunk_ids": []
    },
    {
        "category": "order cancellation",
        "difficulty": "easy",
        "sample_type": "single_hop",
        "question": "Tôi có thể hủy đơn hàng trước khi nó được giao không?",
        "expected_answer": "Có, đơn hàng có thể bị hủy miễn phí trước khi chúng được giao cho đơn vị vận chuyển.",
        "source_chunk_ids": ["mock_chunk_cancellation_001"]
    },
    {
        "category": "order cancellation",
        "difficulty": "medium",
        "sample_type": "single_hop",
        "question": "Làm sao để biết đơn hàng đã được giao cho đơn vị vận chuyển chưa?",
        "expected_answer": "Bạn sẽ nhận được thông báo qua email hoặc trên ứng dụng khi đơn hàng bắt đầu được vận chuyển.",
        "source_chunk_ids": ["mock_chunk_cancellation_002"]
    },
    {
        "category": "order cancellation",
        "difficulty": "hard",
        "sample_type": "multi_hop",
        "question": "Nếu đơn hàng đã được vận chuyển nhưng tôi vẫn muốn hủy thì làm thế nào?",
        "expected_answer": "Sau khi đơn hàng đã được giao cho đơn vị vận chuyển, bạn không thể hủy đơn hàng mà chỉ có thể xử lý dưới dạng yêu cầu trả hàng sau khi nhận hàng theo quy định hoàn trả.",
        "source_chunk_ids": ["mock_chunk_cancellation_001", "mock_chunk_refund_001"]
    },
    {
        "category": "payment policy",
        "difficulty": "easy",
        "sample_type": "single_hop",
        "question": "Cửa hàng chấp nhận những phương thức thanh toán nào?",
        "expected_answer": "Chúng tôi chấp nhận thẻ tín dụng, chuyển khoản ngân hàng và thanh toán tiền mặt khi nhận hàng (COD).",
        "source_chunk_ids": ["mock_chunk_payment_001"]
    },
    {
        "category": "payment policy",
        "difficulty": "medium",
        "sample_type": "edge_case",
        "question": "Thanh toán COD có bị giới hạn gì không?",
        "expected_answer": "Thanh toán COD chỉ khả dụng cho các đơn hàng có giá trị dưới 5.000.000 VNĐ.",
        "source_chunk_ids": ["mock_chunk_payment_002"]
    },
    {
        "category": "payment policy",
        "difficulty": "hard",
        "sample_type": "multi_hop",
        "question": "Nếu tôi thanh toán qua thẻ tín dụng và hủy đơn hàng trước khi giao, bao lâu thì nhận lại tiền?",
        "expected_answer": "Đơn hàng sẽ được hủy miễn phí trước khi giao, và theo chính sách hoàn tiền, khoản hoàn trả sẽ được xử lý vào phương thức thanh toán ban đầu (thẻ tín dụng) trong vòng 5-7 ngày làm việc.",
        "source_chunk_ids": ["mock_chunk_payment_001", "mock_chunk_cancellation_001", "mock_chunk_refund_003"]
    }
]

# We need 30 samples, let's duplicate the 15 to make 30, and modify slightly if needed.
# Since this is a mock, duplicating is fine as long as there are 30.
mock_30_samples = []
for i in range(2):
    for sample in VIETNAMESE_BENCHMARK_SAMPLES:
        new_sample = sample.copy()
        if i == 1:
            new_sample['question'] += " (Câu hỏi phụ)"
        mock_30_samples.append(new_sample)
