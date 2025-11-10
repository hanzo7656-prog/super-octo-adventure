from functools import wraps
from .redis_manager import redis_manager
from .cache_keys import CacheKeys

def cache_response(expire: int = 300):
    """دکوریتور برای کش کردن پاسخ endpointها"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # ساخت کلید کش بر اساس پارامترها
            cache_key = CacheKeys.generate_key(func.__name__, kwargs)
            
            # چک کردن کش
            cached_result = redis_manager.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # اجرای تابع و ذخیره در کش
            result = await func(*args, **kwargs)
            redis_manager.set(cache_key, result, expire)
            
            return result
        return wrapper
    return decorator
