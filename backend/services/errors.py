import re


def sanitize_error_message(error: Exception | str) -> str:
    message = str(error)

    replacements = [
        (r"sk-[A-Za-z0-9_\-]+", "[redacted_api_key]"),
        (r"(?i)(api[_ -]?key['\"]?\s*[:=]\s*['\"]?)[A-Za-z0-9_\-]+", r"\1[redacted]"),
        (r"(?i)(access[_ -]?key[_ -]?secret['\"]?\s*[:=]\s*['\"]?)[A-Za-z0-9_\-]+", r"\1[redacted]"),
    ]
    for pattern, replacement in replacements:
        message = re.sub(pattern, replacement, message)

    if "invalid_api_key" in message or "Incorrect API key" in message:
        return "Qwen API rejected the configured API key. Check QWEN_API_KEY and make sure it is a valid Model Studio/DashScope key."
    if "Budget exceeded" in message:
        return message
    if "fallback disabled" in message:
        return "The real Qwen call failed and fallback is disabled. Check backend logs and Qwen configuration."

    return message[:500]
