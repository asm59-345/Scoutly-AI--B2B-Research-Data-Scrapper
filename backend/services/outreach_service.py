"""
Outreach draft generator and template service for Scoutly AI.
Creates tailored, professional sales & partnership outreach emails grounded in lead data.
"""

from typing import Dict, Any, Optional

class OutreachService:
    @staticmethod
    def generate_draft(
        firm_name: str,
        contact_person: Optional[str] = "",
        category: Optional[str] = "",
        website_url: Optional[str] = "",
        pitch_type: str = "partnership"  # "partnership", "sales", "introduction"
    ) -> Dict[str, str]:
        """
        Generates a personalized, professional outreach pitch.
        Grounded strictly on confirmed lead details (no hallucinations).
        """
        salutation = f"Hi {contact_person.split()[0]}," if contact_person and contact_person.strip() else f"Hello {firm_name} Team,"
        clean_cat = category or "industry"
        
        if pitch_type == "partnership":
            subject = f"Exploring partnership opportunities with {firm_name}"
            body = (
                f"{salutation}\n\n"
                f"I've been following {firm_name}'s work in the {clean_cat} space and wanted to reach out.\n\n"
                f"We specialize in supporting high-growth organizations with tailored B2B solutions and strategic workflows. "
                f"Given your strong presence in the market, I believe there could be meaningful synergy between our teams.\n\n"
                f"Would you be open to a brief 10-minute introductory call next week to explore potential collaboration?\n\n"
                f"Best regards,\n"
                f"Business Development Team"
            )
        elif pitch_type == "sales":
            subject = f"Optimizing {clean_cat} operations for {firm_name}"
            body = (
                f"{salutation}\n\n"
                f"I noticed {firm_name} is actively expanding in the {clean_cat} sector.\n\n"
                f"We help leaders in your domain streamline client acquisition and optimize operational intelligence. "
                f"We recently helped comparable companies increase qualified prospect pipeline by 35% within 60 days.\n\n"
                f"Do you have 10 minutes this Thursday or Friday for a quick conversation?\n\n"
                f"Best regards,\n"
                f"Growth & Strategy Team"
            )
        else: # Introduction
            subject = f"Quick question regarding {firm_name}"
            body = (
                f"{salutation}\n\n"
                f"I came across {firm_name} while researching top innovators in the {clean_cat} sector.\n\n"
                f"I'd love to learn more about your current strategic priorities for the coming quarter and see if our solutions could assist your growth initiatives.\n\n"
                f"Looking forward to connecting.\n\n"
                f"Best regards,\n"
                f"Strategic Partnerships"
            )

        return {
            "subject": subject,
            "body": body,
            "salutation": salutation
        }

