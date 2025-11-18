import { useEffect, useRef } from 'react';

export function usePerformance() {
  const performanceRef = useRef({
    navigationStart: Date.now(),
    resources: new Map(),
    marks: new Map()
  });

  const mark = (name) => {
    const timestamp = Date.now();
    performanceRef.current.marks.set(name, timestamp);
    console.log(`🏷️ ${name}: ${timestamp}ms`);
  };

  const measure = (name, startMark, endMark) => {
    const start = performanceRef.current.marks.get(startMark);
    const end = performanceRef.current.marks.get(endMark);
    
    if (start && end) {
      const duration = end - start;
      console.log(`📊 ${name}: ${duration}ms`);
      return duration;
    }
    
    return null;
  };

  const trackResource = (url, type) => {
    const startTime = Date.now();
    const resourceId = `${type}_${url}`;
    
    performanceRef.current.resources.set(resourceId, {
      url,
      type,
      startTime,
      endTime: null,
      duration: null
    });

    return () => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      performanceRef.current.resources.set(resourceId, {
        url,
        type,
        startTime,
        endTime,
        duration
      });

      console.log(`📦 ${type} loaded: ${url} (${duration}ms)`);
    };
  };

  const getMetrics = () => {
    const now = Date.now();
    const navigationDuration = now - performanceRef.current.navigationStart;
    
    const resources = Array.from(performanceRef.current.resources.values());
    const totalResourceTime = resources.reduce((sum, resource) => 
      sum + (resource.duration || 0), 0
    );
    
    return {
      navigationDuration,
      totalResources: resources.length,
      totalResourceTime,
      averageResourceTime: resources.length > 0 ? totalResourceTime / resources.length : 0,
      slowResources: resources.filter(r => r.duration > 1000)
    };
  };

  useEffect(() => {
    mark('app_initialized');
    
    // ردیابی عملکرد در طول زمان
    const interval = setInterval(() => {
      const metrics = getMetrics();
      if (metrics.slowResources.length > 0) {
        console.warn('Slow resources detected:', metrics.slowResources);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    mark,
    measure,
    trackResource,
    getMetrics
  };
}
