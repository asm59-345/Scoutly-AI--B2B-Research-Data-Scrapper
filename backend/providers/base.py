"""
Abstract Provider Interface for Scoutly AI.
Allows plugging in authorized B2B APIs (e.g. Google Places API, Clearbit, ZoomInfo)
or controlled local extraction adapters while adhering to data compliance rules.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Callable, Optional

class DiscoveryProvider(ABC):
    """
    Standard interface for all business discovery and lead extraction engines.
    """

    @abstractmethod
    def search_and_extract(
        self,
        query: str,
        limit: int = 20,
        log_callback: Optional[Callable[[str], None]] = None
    ) -> List[Dict[str, Any]]:
        """
        Executes a targeted search and returns extracted business listings.
        """
        pass

    @abstractmethod
    def shutdown(self) -> None:
        """Cleans up browser, client session, or network connections."""
        pass

