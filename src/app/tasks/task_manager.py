import asyncio
from typing import Callable, Optional
from ..cache.redis_manager import redis_manager

class TaskManager:
    def __init__(self):
        self.tasks = {}
    
    async def schedule_periodic(self, 
                              func: Callable, 
                              interval: int,
                              task_name: str):
        """اجرای دوره‌ای یک تابع"""
        while True:
            try:
                await func()
                print(f"Task {task_name} executed successfully")
            except Exception as e:
                print(f"Task {task_name} failed: {e}")
            
            await asyncio.sleep(interval)

task_manager = TaskManager()
