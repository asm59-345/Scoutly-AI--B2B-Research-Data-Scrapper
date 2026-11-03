"""
Sanitization module for Scoutly AI.
Guards against CSV and Excel formula injection (CWE-1236).
"""

from typing import Any, Dict, List

DANGEROUS_PREFIXES = ('=', '+', '-', '@', '\t', '\r')

def sanitize_cell_value(val: Any) -> str:
    """
    Sanitizes string values to prevent formula execution in spreadsheet software.
    Prepends a single quote if the string begins with =, +, -, @, or whitespace control characters.
    """
    if val is None:
        return ""
    raw_str = str(val)
    if not raw_str:
        return ""
    if raw_str.startswith(DANGEROUS_PREFIXES):
        return "'" + raw_str
    
    # Check stripped version as well in case of spaces before formula symbols
    s = raw_str.strip()
    if s.startswith(DANGEROUS_PREFIXES):
        return "'" + s
    return s

def sanitize_record(record: Dict[str, Any]) -> Dict[str, Any]:
    """Sanitizes all string fields in a lead record dictionary."""
    return {k: sanitize_cell_value(v) for k, v in record.items()}

def sanitize_records_list(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Sanitizes a list of lead records."""
    return [sanitize_record(r) for r in records]
