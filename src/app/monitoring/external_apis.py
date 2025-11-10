import requests
from typing import Dict, Optional

class ExternalAPIMonitor:
    def __init__(self):
        self.apis = {
            'coinstats': 'https://api.coinstats.app/public/v1/coins',
            'news_api': 'https://newsapi.org/v2/everything'
        }
    
    async def check_api_health(self, api_name: str) -> Dict:
        """بررسی سلامت APIهای خارجی"""
        try:
            response = requests.get(self.apis[api_name], timeout=10)
            return {
                'api': api_name,
                'status': 'healthy' if response.status_code == 200 else 'unhealthy',
                'response_time': response.elapsed.total_seconds(),
                'status_code': response.status_code
            }
        except Exception as e:
            return {
                'api': api_name,
                'status': 'error',
                'error': str(e)
            }

api_monitor = ExternalAPIMonitor()
