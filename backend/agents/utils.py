from typing import Any, List
import logging

logger = logging.getLogger(__name__)

def normalize_categories(proposed_categories: Any, fallback: List[str] = None) -> List[str]:
    """
    Defensively normalizes category lists from LLM outputs.
    Ensures the returned list contains only unique strings.
    """
    if fallback is None:
        fallback = ["General"]

    normalized_categories = []
    if isinstance(proposed_categories, list):
        for cat in proposed_categories:
            if isinstance(cat, str):
                cat_stripped = cat.strip()
                if cat_stripped:
                    normalized_categories.append(cat_stripped)
            elif isinstance(cat, dict):
                # extract key from priority: "name", "category", "topic", "title"
                val = cat.get("name") or cat.get("category") or cat.get("topic") or cat.get("title")
                if not val and cat:
                    # find first string value in the dict
                    for v in cat.values():
                        if isinstance(v, str):
                            val = v
                            break
                if val and isinstance(val, str):
                    val_stripped = val.strip()
                    if val_stripped:
                        normalized_categories.append(val_stripped)
                        logger.warning(
                            f"Normalized category from dict to str. "
                            f"Original: {cat}, Normalized: {val_stripped}"
                        )
                else:
                    logger.warning(
                        f"Skipped invalid dictionary category: {cat}"
                    )
            else:
                logger.warning(
                    f"Skipped invalid non-str/non-dict category element: {cat} (type: {type(cat).__name__})"
                )
    elif isinstance(proposed_categories, dict):
        logger.warning(
            f"Expected list for categories but got dict. "
            f"Attempting recovery by extracting keys: {proposed_categories}"
        )
        for k in proposed_categories.keys():
            if isinstance(k, str):
                k_stripped = k.strip()
                if k_stripped:
                    normalized_categories.append(k_stripped)
    else:
        logger.warning(
            f"Expected list for categories but got: {proposed_categories} (type: {type(proposed_categories).__name__})"
        )

    # Deduplicate while preserving order
    seen = set()
    deduped_categories = []
    for cat in normalized_categories:
        if cat not in seen:
            seen.add(cat)
            deduped_categories.append(cat)

    if not deduped_categories:
        orig_repr = str(proposed_categories)
        if len(orig_repr) > 200:
            orig_repr = orig_repr[:197] + "..."
        orig_len = len(proposed_categories) if hasattr(proposed_categories, "__len__") else 1
        logger.warning(
            f"All categories were filtered out after normalization. "
            f"Original count: {orig_len}, Original values: {orig_repr}, Falling back to: {fallback}"
        )
        deduped_categories = fallback

    return deduped_categories
