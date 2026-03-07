import React, { createContext, useContext, useState, useEffect } from 'react';

const TelemetryContext = createContext();

export function TelemetryProvider({ children }) {
  const [enabled, setEnabled] = useState(() => {
    const saved = localStorage.getItem('openclaw-telemetry');
    return saved === null ? false : saved === 'true'; // Opt-out by default
  });

  const [events, setEvents] = useState([]);

  useEffect(() => {
    localStorage.setItem('openclaw-telemetry', enabled.toString());
  }, [enabled]);

  const track = (eventType, data = {}) => {
    if (!enabled) return;
    
    const event = {
      type: eventType,
      data,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
    };
    
    setEvents(prev => [...prev, event]);
    
    // Send to backend if enabled
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    }).catch(() => {}); // Silent fail
  };

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('openclaw-session');
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('openclaw-session', sessionId);
    }
    return sessionId;
  };

  return (
    <TelemetryContext.Provider value={{ enabled, setEnabled, track, events }}>
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error('useTelemetry must be used within TelemetryProvider');
  }
  return context;
}

// Telemetry toggle component
export function TelemetryToggle({ className = '' }) {
  const { enabled, setEnabled } = useTelemetry();

  return (
    <div className={`flex items-center gap-3 ${className}`} data-testid="telemetry-toggle">
      <span className="text-sm text-[#8892A8]">Analytics</span>
      <button
        onClick={() => setEnabled(!enabled)}
        className={`relative w-10 h-5 rounded-full transition-colors ${enabled ? 'bg-[#00E676]' : 'bg-[#2A3142]'}`}
      >
        <span 
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${enabled ? 'left-5' : 'left-0.5'}`}
        />
      </button>
    </div>
  );
}

export default TelemetryContext;
