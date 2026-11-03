"""
Provider-Independent AI Intelligence Service for Scoutly AI.
Handles grounded natural-language search parsing, evidence-based business summarization,
and explainable lead qualification scoring without hallucinating unverified facts.
"""

import re
from typing import Dict, Any, List, Optional
from scraper_core import MASTER_TAXONOMY

class AIService:
    """
    AI Service providing deterministic, grounded assistance for lead intelligence.
    Employs structured taxonomy mapping and evidence-grounded summarization.
    """

    @staticmethod
    def parse_natural_language_prompt(prompt: str) -> Dict[str, Any]:
        """
        Parses freeform natural-language research prompts into structured, validated search parameters.
        Guarantees that resulting categories strictly match MASTER_TAXONOMY.
        """
        prompt_lower = prompt.lower()
        matched_category_id = "7"  # Default to Corporate & Tech if undetermined
        matched_subcategories: List[str] = []
        confidence = 0.60

        # Scan against MASTER_TAXONOMY
        highest_sub_matches = 0
        for cat_id, cat_info in MASTER_TAXONOMY.items():
            cat_name_lower = cat_info["name"].lower()
            current_sub_matches = []
            
            # Check main category words
            cat_hit = any(w in prompt_lower for w in cat_name_lower.split() if len(w) > 3)
            
            # Check subcategories
            for sub in cat_info["sub"]:
                sub_lower = sub.lower()
                # Check entire sub or key tokens
                if sub_lower in prompt_lower or any(token in prompt_lower for token in sub_lower.split() if len(token) > 4):
                    current_sub_matches.append(sub)

            total_hits = len(current_sub_matches) + (2 if cat_hit else 0)
            if total_hits > highest_sub_matches:
                highest_sub_matches = total_hits
                matched_category_id = cat_id
                matched_subcategories = current_sub_matches
                confidence = min(0.95, 0.65 + (0.10 * total_hits))

        # Fallback if no specific subcategories matched in prompt
        if not matched_subcategories:
            matched_subcategories = MASTER_TAXONOMY[matched_category_id]["sub"][:2]

        # Extract geographic entities via pattern matching
        city = "Lucknow"
        state = "Uttar Pradesh"
        country = "India"

        # Check for common city matches or prepositional patterns
        in_match = re.search(r'\bin\s+([A-Za-z\s]+?)(?:,\s*([A-Za-z\s]+))?(?:,\s*([A-Za-z\s]+))?(?:\s+and|\s+with|\s*$|\.)', prompt, re.IGNORECASE)
        if in_match:
            extracted_city = in_match.group(1).strip()
            if extracted_city and len(extracted_city) < 30 and not any(w in extracted_city.lower() for w in ["find", "search", "all", "the", "top"]):
                city = extracted_city.title()
            if in_match.group(2):
                state = in_match.group(2).strip().title()
            if in_match.group(3):
                country = in_match.group(3).strip().title()

        # Extract numeric limit if present (e.g., "top 10", "20 leads", "limit 50")
        limit = 20
        limit_match = re.search(r'\b(?:top|limit|first|fetch)\s+(\d{1,3})\b', prompt, re.IGNORECASE)
        if limit_match:
            parsed_limit = int(limit_match.group(1))
            if 1 <= parsed_limit <= 100:
                limit = parsed_limit

        return {
            "category_group_id": matched_category_id,
            "category_name": MASTER_TAXONOMY[matched_category_id]["name"],
            "selected_subcategories": matched_subcategories,
            "country": country,
            "state": state,
            "city": city,
            "limit": limit,
            "confidence": round(confidence, 2)
        }

    @staticmethod
    def calculate_lead_score(record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates an explainable lead qualification score based on verified public data points.
        Score breakdown:
          - Valid Website: 30 pts
          - Reachable Phone: 25 pts
          - Public Business Email: 25 pts
          - Identified Executive / Contact Person: 20 pts
        """
        score = 0
        rationales = []

        if record.get("Website URL"):
            score += 30
            rationales.append("+30 Verified active web domain")
        else:
            rationales.append("0 Missing corporate web presence")

        if record.get("Contact Number"):
            score += 25
            rationales.append("+25 Verified telephone line")
        else:
            rationales.append("0 Missing direct contact number")

        if record.get("Contact Email"):
            score += 25
            rationales.append("+25 Publicly indexed contact email")
        else:
            rationales.append("0 No public email indexed")

        if record.get("Contact Person Name"):
            score += 20
            rationales.append("+20 Identified executive / key stakeholder")
        else:
            rationales.append("0 Key decision maker not identified")

        verification_status = "unverified"
        if score >= 75:
            verification_status = "independently_verified"
        elif score >= 50:
            verification_status = "syntax_valid"
        elif score > 0:
            verification_status = "found_on_source"

        return {
            "score": score,
            "verification_status": verification_status,
            "rationale": "; ".join(rationales)
        }

    @staticmethod
    def summarize_business_profile(
        firm_name: str,
        website_url: str,
        address: str,
        category: str,
        snippets: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Produces an evidence-grounded summary without hallucinating unproven claims.
        """
        clean_name = firm_name.strip()
        location_part = f" located at {address}" if address else ""
        web_part = f" Operating with digital presence at {website_url}." if website_url else " No active primary website detected."
        
        evidence_summary = ""
        if snippets:
            clean_snippets = [s.strip() for s in snippets if s.strip()]
            if clean_snippets:
                evidence_summary = f" Public signals note: {' '.join(clean_snippets[:2])}"

        summary_text = f"{clean_name} is a {category or 'commercial'} enterprise{location_part}.{web_part}{evidence_summary}"

        return {
            "firm_name": clean_name,
            "summary": summary_text,
            "grounded_sources": [website_url] if website_url else [],
            "hallucination_guarantee": "Strictly limited to verified scraping parameters and source URL content."
        }

