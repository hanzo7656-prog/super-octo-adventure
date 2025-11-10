import time
import asyncio
import psutil
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Callable
from collections import defaultdict, deque
import threading
import json
import traceback
from dataclasses import dataclass
from enum import Enum

# ==================== IMPORT های جدید برای ساختار ریپو ====================
from .cache.redis_manager import redis_manager
from .database.database import get_db
from .cache.cache_decorators import cache_response

# ==================== IMPORT های اصلی از پروژه ====================
from .routes.health import health_router
from .routes.coins import coins_router
from .routes.exchanges import exchanges_router
from .routes.news import news_router
from .routes.insights import insights_router
from .routes.raw_coins import raw_coins_router
from .routes.raw_news import raw_news_router
from .routes.raw_insights import raw_insights_router
from .routes.raw_exchanges import raw_exchanges_router
from .routes.docs import docs_router

try:
    from .complete_coinstats_manager import coin_stats_manager
    COINSTATS_AVAILABLE = True
    print("✅ CoinStats manager imported successfully!")
except ImportError as e:
    print(f"❌ CoinStats import error: {e}")
    COINSTATS_AVAILABLE = False

# ==================== IMPORT های دیباگ سیستم ====================
DEBUG_SYSTEM_AVAILABLE = False
live_dashboard_manager = None
console_stream_manager = None

try:
    from .debug_system.core.debug_manager import DebugManager, debug_manager
    from .debug_system.core.metrics_collector import metrics_collector
    from .debug_system.core.alert_manager import alert_manager
    from .debug_system.monitors.system_monitor import system_monitor
    from .debug_system.monitors.performance_monitor import performance_monitor
    from .debug_system.monitors.security_monitor import security_monitor
    
    DEBUG_SYSTEM_AVAILABLE = True
    print("✅ Core debug system imported successfully!")
except ImportError as e:
    print(f"❌ Core debug system import error: {e}")
    DEBUG_SYSTEM_AVAILABLE = False

try:
    from .debug_system.realtime.live_dashboard import LiveDashboardManager
    from .debug_system.realtime.console_stream import console_stream_manager
    print("✅ Real-time debug system imported successfully!")
except ImportError as e:
    print(f"❌ Real-time debug system import error: {e}")
    live_dashboard_manager = None
    console_stream_manager = None

# ==================== IMPORT های FastAPI ====================
from fastapi import FastAPI, HTTPException, Query, BackgroundTasks, WebSocket
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os
from pathlib import Path
import sys

logger = logging.getLogger(__name__)

# ==================== DEBUG SYSTEM CLASSES (کپی از پروژه اصلی) ====================

class DebugLevel(Enum):
    INFO = "INFO"
    WARNING = "WARNING" 
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"

@dataclass
class EndpointCall:
    endpoint: str
    method: str
    timestamp: datetime
    params: Dict[str, Any]
    response_time: float
    status_code: int
    cache_used: bool
    api_calls: int
    memory_used: float
    cpu_impact: float

@dataclass
class SystemMetrics:
    timestamp: datetime
    cpu_percent: float
    memory_percent: float
    disk_usage: float
    network_io: Dict[str, int]
    active_connections: int

class DebugManager:
    def __init__(self):
        self.endpoint_calls = deque(maxlen=10000)
        self.system_metrics_history = deque(maxlen=1000)
        self.endpoint_stats = defaultdict(lambda: {
            'total_calls': 0,
            'successful_calls': 0,
            'failed_calls': 0,
            'total_response_time': 0,
            'cache_hits': 0,
            'cache_misses': 0,
            'api_calls': 0,
            'errors': [],
            'last_call': None
        })
        
        self.alerts = []
        self.performance_thresholds = {
            'response_time_warning': 1.0,
            'response_time_critical': 3.0,
            'cpu_warning': 80.0,
            'cpu_critical': 95.0,
            'memory_warning': 85.0,
            'memory_critical': 95.0
        }
        
        self._start_background_monitoring()
        
    def log_endpoint_call(self, endpoint: str, method: str, params: Dict[str, Any], 
                         response_time: float, status_code: int, cache_used: bool, 
                         api_calls: int = 0):
        """ثبت فراخوانی اندپوینت"""
        try:
            memory_used = psutil.virtual_memory().percent
            cpu_impact = psutil.cpu_percent(interval=0.1)
            
            call = EndpointCall(
                endpoint=endpoint,
                method=method,
                timestamp=datetime.now(),
                params=params,
                response_time=response_time,
                status_code=status_code,
                cache_used=cache_used,
                api_calls=api_calls,
                memory_used=memory_used,
                cpu_impact=cpu_impact
            )
            
            self.endpoint_calls.append(call)
            
            stats = self.endpoint_stats[endpoint]
            stats['total_calls'] += 1
            stats['total_response_time'] += response_time
            
            if 200 <= status_code < 300:
                stats['successful_calls'] += 1
            else:
                stats['failed_calls'] += 1
                stats['errors'].append({
                    'timestamp': datetime.now().isoformat(),
                    'status_code': status_code,
                    'params': params
                })
                
            if cache_used:
                stats['cache_hits'] += 1
            else:
                stats['cache_misses'] += 1
                
            stats['api_calls'] += api_calls
            stats['last_call'] = datetime.now().isoformat()
            
            self._check_performance_alerts(endpoint, call)
            
            logger.debug(f"📊 Endpoint logged: {endpoint} - {response_time:.3f}s")
            
        except Exception as e:
            logger.error(f"❌ Error logging endpoint call: {e}")
    
    def log_error(self, endpoint: str, error: Exception, traceback_str: str, context: Dict[str, Any] = None):
        """ثبت خطا"""
        error_data = {
            'endpoint': endpoint,
            'error_type': type(error).__name__,
            'error_message': str(error),
            'traceback': traceback_str,
            'context': context or {},
            'timestamp': datetime.now().isoformat()
        }
        
        self.endpoint_stats[endpoint]['errors'].append(error_data)
        
        if self._is_critical_error(error):
            self._create_alert(
                level=DebugLevel.CRITICAL,
                message=f"Critical error in {endpoint}: {str(error)}",
                source=endpoint,
                data=error_data
            )
        
        logger.error(f"🚨 Error in {endpoint}: {error}")
    
    def get_endpoint_stats(self, endpoint: str = None) -> Dict[str, Any]:
        """دریافت آمار اندپوینت"""
        if endpoint:
            if endpoint not in self.endpoint_stats:
                return {'error': 'Endpoint not found'}
            
            stats = self.endpoint_stats[endpoint]
            avg_response_time = (stats['total_response_time'] / stats['total_calls']) if stats['total_calls'] > 0 else 0
            
            return {
                'endpoint': endpoint,
                'total_calls': stats['total_calls'],
                'successful_calls': stats['successful_calls'],
                'failed_calls': stats['failed_calls'],
                'success_rate': (stats['successful_calls'] / stats['total_calls'] * 100) if stats['total_calls'] > 0 else 0,
                'average_response_time': round(avg_response_time, 3),
                'cache_performance': {
                    'hits': stats['cache_hits'],
                    'misses': stats['cache_misses'],
                    'hit_rate': (stats['cache_hits'] / (stats['cache_hits'] + stats['cache_misses']) * 100) if (stats['cache_hits'] + stats['cache_misses']) > 0 else 0
                },
                'api_calls': stats['api_calls'],
                'recent_errors': stats['errors'][-10:],
                'last_call': stats['last_call']
            }
        else:
            all_stats = {}
            total_calls = 0
            total_success = 0
            
            for endpoint, stats in self.endpoint_stats.items():
                all_stats[endpoint] = {
                    'total_calls': stats['total_calls'],
                    'success_rate': (stats['successful_calls'] / stats['total_calls'] * 100) if stats['total_calls'] > 0 else 0,
                    'average_response_time': round((stats['total_response_time'] / stats['total_calls']), 3) if stats['total_calls'] > 0 else 0,
                    'last_call': stats['last_call']
                }
                total_calls += stats['total_calls']
                total_success += stats['successful_calls']
            
            return {
                'overall': {
                    'total_endpoints': len(self.endpoint_stats),
                    'total_calls': total_calls,
                    'overall_success_rate': (total_success / total_calls * 100) if total_calls > 0 else 0,
                    'timestamp': datetime.now().isoformat()
                },
                'endpoints': all_stats
            }
    
    def get_recent_calls(self, limit: int = 50) -> List[Dict[str, Any]]:
        """دریافت آخرین فراخوانی‌ها"""
        recent_calls = list(self.endpoint_calls)[-limit:]
        return [
            {
                'endpoint': call.endpoint,
                'method': call.method,
                'timestamp': call.timestamp.isoformat(),
                'response_time': call.response_time,
                'status_code': call.status_code,
                'cache_used': call.cache_used,
                'api_calls': call.api_calls,
                'memory_used': call.memory_used,
                'cpu_impact': call.cpu_impact
            }
            for call in recent_calls
        ]
    
    def get_system_metrics_history(self, hours: int = 1) -> List[Dict[str, Any]]:
        """دریافت تاریخچه متریک‌های سیستم"""
        cutoff_time = datetime.now() - timedelta(hours=hours)
        return [
            {
                'timestamp': metrics.timestamp.isoformat(),
                'cpu_percent': metrics.cpu_percent,
                'memory_percent': metrics.memory_percent,
                'disk_usage': metrics.disk_usage,
                'network_io': metrics.network_io,
                'active_connections': metrics.active_connections
            }
            for metrics in self.system_metrics_history
            if metrics.timestamp >= cutoff_time
        ]
    
    def _start_background_monitoring(self):
        """شروع مانیتورینگ پس‌زمینه سیستم"""
        def monitor_system():
            while True:
                try:
                    self._collect_system_metrics()
                    time.sleep(5)
                except Exception as e:
                    logger.error(f"❌ System monitoring error: {e}")
                    time.sleep(10)
        
        monitor_thread = threading.Thread(target=monitor_system, daemon=True)
        monitor_thread.start()
        logger.info("✅ Background system monitoring started")
    
    def _collect_system_metrics(self):
        """جمع‌آوری متریک‌های سیستم"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory_percent = psutil.virtual_memory().percent
            disk_usage = psutil.disk_usage('/').percent
            
            net_io = psutil.net_io_counters()
            network_io = {
                'bytes_sent': net_io.bytes_sent,
                'bytes_recv': net_io.bytes_recv,
                'packets_sent': net_io.packets_sent,
                'packets_recv': net_io.packets_recv
            }
            
            active_connections = len(psutil.net_connections())
            
            metrics = SystemMetrics(
                timestamp=datetime.now(),
                cpu_percent=cpu_percent,
                memory_percent=memory_percent,
                disk_usage=disk_usage,
                network_io=network_io,
                active_connections=active_connections
            )
            
            self.system_metrics_history.append(metrics)
            
        except Exception as e:
            logger.error(f"❌ Error collecting system metrics: {e}")
    
    def _check_performance_alerts(self, endpoint: str, call: EndpointCall):
        """بررسی هشدارهای performance"""
        if call.response_time > self.performance_thresholds['response_time_critical']:
            self._create_alert(
                level=DebugLevel.CRITICAL,
                message=f"Critical response time in {endpoint}: {call.response_time:.2f}s",
                source=endpoint,
                data={
                    'response_time': call.response_time,
                    'threshold': self.performance_thresholds['response_time_critical']
                }
            )
        elif call.response_time > self.performance_thresholds['response_time_warning']:
            self._create_alert(
                level=DebugLevel.WARNING,
                message=f"High response time in {endpoint}: {call.response_time:.2f}s",
                source=endpoint,
                data={
                    'response_time': call.response_time,
                    'threshold': self.performance_thresholds['response_time_warning']
                }
            )
        
        if call.cpu_impact > self.performance_thresholds['cpu_critical']:
            self._create_alert(
                level=DebugLevel.CRITICAL,
                message=f"Critical CPU usage in {endpoint}: {call.cpu_impact:.1f}%",
                source=endpoint,
                data={'cpu_usage': call.cpu_impact}
            )
    
    def _create_alert(self, level: DebugLevel, message: str, source: str, data: Dict[str, Any]):
        """ایجاد هشدار جدید"""
        alert = {
            'id': len(self.alerts) + 1,
            'level': level.value,
            'message': message,
            'source': source,
            'timestamp': datetime.now().isoformat(),
            'data': data,
            'acknowledged': False
        }
        
        self.alerts.append(alert)
        logger.warning(f"🚨 {level.value} Alert: {message}")
    
    def _is_critical_error(self, error: Exception) -> bool:
        """بررسی آیا خطا critical است"""
        critical_errors = [
            'Timeout',
            'ConnectionError',
            'MemoryError',
            'OSError'
        ]
        
        return any(critical_error in type(error).__name__ for critical_error in critical_errors)
    
    def get_active_alerts(self) -> List[Dict[str, Any]]:
        """دریافت هشدارهای فعال"""
        return [alert for alert in self.alerts if not alert['acknowledged']]
    
    def acknowledge_alert(self, alert_id: int):
        """تأیید هشدار"""
        for alert in self.alerts:
            if alert['id'] == alert_id:
                alert['acknowledged'] = True
                break
    
    def clear_old_data(self, days: int = 7):
        """پاک کردن داده‌های قدیمی"""
        cutoff_time = datetime.now() - timedelta(days=days)
        
        self.endpoint_calls = deque(
            [call for call in self.endpoint_calls if call.timestamp > cutoff_time],
            maxlen=10000
        )
        
        self.system_metrics_history = deque(
            [metrics for metrics in self.system_metrics_history if metrics.timestamp > cutoff_time],
            maxlen=1000
        )
        
        logger.info(f"🧹 Cleared data older than {days} days")

# ایجاد نمونه گلوبال
debug_manager = DebugManager()

# ==================== FASTAPI APP ====================

app = FastAPI(
    title="VortexAI Database Platform", 
    version="1.0.0",
    description="Real-time cryptocurrency data with AI-powered insights and advanced database system",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== DEBUG SYSTEM INITIALIZATION ====================

print("=" * 60)
print("🛠️  VORTEXAI DB - SYSTEM INITIALIZATION")
print("=" * 60)
print(f"✅ Database system: Ready")
print(f"✅ Cache system: Ready") 
print(f"✅ Debug system: {'Active' if DEBUG_SYSTEM_AVAILABLE else 'Inactive'}")
print(f"✅ CoinStats: {'Available' if COINSTATS_AVAILABLE else 'Unavailable'}")
print("=" * 60)

# ==================== BACKGROUND TASKS ====================

@app.on_event("startup")
async def startup_event():
    """رویدادهای startup"""
    print("🚀 VortexAI Database Platform starting up...")
    
    if DEBUG_SYSTEM_AVAILABLE and live_dashboard_manager:
        try:
            # شروع تسک‌های background
            asyncio.create_task(start_dashboard_broadcast())
            print("✅ Dashboard broadcast task started")
        except Exception as e:
            logger.error(f"❌ Startup tasks error: {e}")

async def start_dashboard_broadcast():
    """شروع برودکست دشبورد"""
    if live_dashboard_manager:
        try:
            await live_dashboard_manager.start_dashboard_broadcast()
        except Exception as e:
            logger.error(f"❌ Dashboard broadcast error: {e}")

# ==================== ROUTES REGISTRATION ====================

# ثبت روت‌ها
app.include_router(health_router)
app.include_router(coins_router)
app.include_router(exchanges_router)
app.include_router(news_router)
app.include_router(insights_router)
app.include_router(raw_coins_router)
app.include_router(raw_news_router)
app.include_router(raw_insights_router)
app.include_router(raw_exchanges_router)
app.include_router(docs_router)

# ==================== BASIC ROUTES ====================

@app.get("/")
async def root():
    """صفحه اصلی"""
    return {
        "message": "🚀 VortexAI Database Platform v1.0.0",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "features": {
            "database": "Ready",
            "cache": "Ready",
            "debug_system": "Active" if DEBUG_SYSTEM_AVAILABLE else "Inactive",
            "coinstats": "Available" if COINSTATS_AVAILABLE else "Unavailable"
        },
        "endpoints": {
            "docs": "/docs",
            "health": "/api/health/status",
            "coins": "/api/coins/list",
            "database_info": "/api/database/info",
            "cache_info": "/api/cache/info"
        }
    }

@app.get("/api/database/info")
async def database_info():
    """اطلاعات دیتابیس"""
    return {
        "database": "Ready",
        "cache": "Ready",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/cache/info")
@cache_response(expire=60)  # استفاده از دکوریتور کش جدید
async def cache_info():
    """اطلاعات کش"""
    return {
        "cache_system": "Redis",
        "status": "Ready",
        "timestamp": datetime.now().isoformat()
    }

# ==================== MAIN EXECUTION ====================

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 10000))
    
    print("🚀" * 50)
    print("🎯 VORTEXAI DATABASE PLATFORM v1.0.0")
    print("🚀" * 50)
    print(f"🌐 Server URL: http://localhost:{port}")
    print(f"📚 Documentation: http://localhost:{port}/docs")
    print("🎯 Quick Start:")
    print(f"   • Health Check: http://localhost:{port}/api/health/status")
    print(f"   • Database Info: http://localhost:{port}/api/database/info")
    print(f"   • Cache Info: http://localhost:{port}/api/cache/info")
    print(f"   • Bitcoin Data: http://localhost:{port}/api/coins/details/bitcoin")
    print("🔧 System Status:")
    print(f"   • Database: ✅ READY")
    print(f"   • Cache: ✅ READY")
    print(f"   • Debug System: {'✅ ACTIVE' if DEBUG_SYSTEM_AVAILABLE else '❌ INACTIVE'}")
    print("🚀" * 50)
    
    uvicorn.run(app, host="0.0.0.0", port=port, access_log=True)
