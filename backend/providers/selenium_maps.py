"""
Controlled Selenium Adapter for Scoutly AI.
Wraps the existing GoogleMapsScraper engine behind the standard DiscoveryProvider interface
without altering its original extraction algorithms or Times New Roman Excel generation.
"""

from typing import List, Dict, Any, Callable, Optional
from providers.base import DiscoveryProvider
from scraper_core import GoogleMapsScraper, MASTER_TAXONOMY

class SeleniumGoogleMapsProvider(DiscoveryProvider):
    """
    Adapter wrapping GoogleMapsScraper to preserve legacy extraction behavior
    behind a compliant provider contract.
    """

    def __init__(self, headless: bool = True):
        self.headless = headless
        self.scraper = GoogleMapsScraper(headless=headless)

    def search_and_extract(
        self,
        query: str,
        limit: int = 20,
        log_callback: Optional[Callable[[str], None]] = None
    ) -> List[Dict[str, Any]]:
        self.scraper.run(query=query, limit=limit, log_callback=log_callback)
        return list(self.scraper.data_store)

    def shutdown(self) -> None:
        self.scraper.shutdown()

    @property
    def active_excel_filename(self) -> str:
        return self.scraper.active_excel_filename

