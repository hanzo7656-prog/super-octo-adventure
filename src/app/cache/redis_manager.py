import redis
import json
import os
from typing import Optional, Any

class RedisManager:
    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.client = redis.Redis.from_url(self.redis_url, decode_responses=True)
    
    def set(self, key: str, value: Any, expire: int = 300) -> bool:
        """ذخیره داده در کش"""
        try:
            serialized_value = json.dumps(value)
            return self.client.setex(key, expire, serialized_value)
        except Exception as e:
            print(f"Redis set error: {e}")
            return False
    
    def get(self, key: str) -> Optional[Any]:
        """دریافت داده از کش"""
        try:
            value = self.client.get(key)
            return json.loads(value) if value else None
        except Exception as e:
            print(f"Redis get error: {e}")
            return None
    
    def delete(self, key: str) -> bool:
        """حذف داده از کش"""
        try:
            return bool(self.client.delete(key))
        except Exception as e:
            print(f"Redis delete error: {e}")
            return False

# instance全局
redis_manager = RedisManager()
