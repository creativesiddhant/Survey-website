import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ClipboardCheck, 
  Clock, 
  Activity, 
  MapPin, 
  Award,
  RefreshCw,
  Smartphone,
  Laptop
} from 'lucide-react';
import { subscribeToRealtimeChanges } from '../services/supabaseService';

interface SurveyResponse {
  id: string;
  created_at: string;
  visitor_id: string;
  age_group: string;
  state: string;
  city: string;
  occupation: string;
  income_range: string;
  business_interest: string;
  completion_time: number;
  suggestions?: string;
  device_type?: string;
  browser?: string;
}

interface VisitorSession {
  visitor_id: string;
  submission_count: number;
  device?: string;
  browser?: string;
  completed: boolean;
}

interface AdminHomeProps {
  responses: SurveyResponse[];
  sessions: VisitorSession[];
  onRefresh: () => void;
  isLoading: boolean;
}

interface ActivityItem {
  id: string;
  city: string;
  state: string;
  business: string;
  timestamp: Date;
  device?: string;
}

export const AdminHome: React.FC<AdminHomeProps> = ({ 
  responses, 
  sessions, 
  onRefresh, 
  isLoading 
}) => {
  const [liveActivities, setLiveActivities] = useState<ActivityItem[]>([]);

  // Initialize Realtime subscriber & pre-populate recent activity
  useEffect(() => {
    // Grab the 8 most recent responses as starting activity logs
    const initialActivities = responses.slice(0, 8).map(r => ({
      id: r.id,
      city: r.city,
      state: r.state,
      business: r.business_interest,
      timestamp: new Date(r.created_at),
      device: r.device_type
    }));
    setLiveActivities(initialActivities);

    // Subscribe to realtime inserts
    const channel = subscribeToRealtimeChanges((newResponse: any) => {
      // Trigger data refresh from parent
      onRefresh();

      // Append new activity to list
      const newActivity: ActivityItem = {
        id: newResponse.id,
        city: newResponse.city,
        state: newResponse.state,
        business: newResponse.business_interest,
        timestamp: new Date(),
        device: newResponse.device_type
      };

      setLiveActivities(prev => [newActivity, ...prev.slice(0, 15)]);
    });

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [responses]);

  // Calculations
  const totalResponses = responses.length;
  const totalSessions = sessions.length;
  
  // Date-based filters
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const responsesToday = responses.filter(r => new Date(r.created_at) >= startOfToday).length;
  const responsesThisWeek = responses.filter(r => new Date(r.created_at) >= oneWeekAgo).length;


  // Average completion time
  const avgCompletionTime = totalResponses > 0
    ? Math.round(responses.reduce((sum, r) => sum + r.completion_time, 0) / totalResponses)
    : 0;

  // Completion conversion rate
  const completionRate = totalSessions > 0
    ? Math.round((sessions.filter(s => s.completed).length / totalSessions) * 100)
    : 0;

  // Unique vs Returning
  const uniqueVisitors = sessions.length;
  const returningVisitors = sessions.filter(s => s.submission_count > 1).length;

  // Average suggestion length
  const suggestionResponses = responses.filter(r => r.suggestions && r.suggestions.trim().length > 0);
  const avgSuggestionLen = suggestionResponses.length > 0
    ? Math.round(suggestionResponses.reduce((sum, r) => sum + (r.suggestions?.length || 0), 0) / suggestionResponses.length)
    : 0;

  // Mode calculations helpers
  const getMode = (arr: string[]): { value: string; count: number } => {
    if (arr.length === 0) return { value: 'N/A', count: 0 };
    const freqs: Record<string, number> = {};
    arr.forEach(item => {
      freqs[item] = (freqs[item] || 0) + 1;
    });
    let maxVal = arr[0];
    let maxCount = freqs[arr[0]] || 0;
    Object.keys(freqs).forEach(key => {
      if (freqs[key] > maxCount) {
        maxCount = freqs[key];
        maxVal = key;
      }
    });
    return { value: maxVal, count: maxCount };
  };

  const getMin = (arr: string[]): { value: string; count: number } => {
    if (arr.length === 0) return { value: 'N/A', count: 0 };
    const freqs: Record<string, number> = {};
    arr.forEach(item => {
      freqs[item] = (freqs[item] || 0) + 1;
    });
    let minVal = arr[0];
    let minCount = freqs[arr[0]] || 0;
    Object.keys(freqs).forEach(key => {
      if (freqs[key] < minCount) {
        minCount = freqs[key];
        minVal = key;
      }
    });
    return { value: minVal, count: minCount };
  };

  const popularBusiness = getMode(responses.map(r => r.business_interest));
  const leastPopularBusiness = getMin(responses.map(r => r.business_interest));
  const activeState = getMode(responses.map(r => r.state));
  const activeCity = getMode(responses.map(r => r.city));

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
            Executive Dashboard
          </h1>
          <p style={{ color: 'var(--text-body)', fontSize: '0.95rem' }}>
            Real-time market validation metrics for venture opportunities.
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="glass-panel"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.1rem',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'var(--text-main)',
            transition: 'var(--transition-fast)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-light)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.7)')}
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          {isLoading ? 'Refreshing...' : 'Refresh Metrics'}
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Total Responses */}
        <div className="glass-panel animate-slide-up" style={{ padding: '1.5rem', borderRadius: '20px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-body)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Responses
              </span>
              <h3 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem' }}>
                {totalResponses}
              </h3>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              <ClipboardCheck size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-body)' }}>
            <span style={{ color: 'var(--success)', fontWeight: 700 }}>+{responsesToday} today</span>
            <span>• {responsesThisWeek} this week</span>
          </div>
        </div>

        {/* Unique Visitors */}
        <div className="glass-panel animate-slide-up" style={{ padding: '1.5rem', borderRadius: '20px', animationDelay: '0.05s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-body)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Unique Visitors
              </span>
              <h3 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem' }}>
                {uniqueVisitors}
              </h3>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
              <Users size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-body)' }}>
            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{returningVisitors} returning</span>
            <span>• {completionRate}% fill conversion</span>
          </div>
        </div>

        {/* Average Completion Speed */}
        <div className="glass-panel animate-slide-up" style={{ padding: '1.5rem', borderRadius: '20px', animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-body)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Avg Completion Time
              </span>
              <h3 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem' }}>
                {avgCompletionTime}s
              </h3>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: '#FEF3C7', color: '#D97706' }}>
              <Clock size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-body)' }}>
            <span>Avg feedback len: <strong>{avgSuggestionLen} chars</strong></span>
          </div>
        </div>

        {/* Conversion rate */}
        <div className="glass-panel animate-slide-up" style={{ padding: '1.5rem', borderRadius: '20px', animationDelay: '0.15s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-body)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Completion Rate
              </span>
              <h3 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem' }}>
                {completionRate}%
              </h3>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
              <Activity size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-body)' }}>
            <span>Out of <strong>{totalSessions} sessions</strong></span>
          </div>
        </div>
      </div>

      {/* Sub-KPI Grid & Realtime Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Demographics Summary Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <Award size={18} style={{ color: 'var(--primary)' }} />
              Venture Leaderboards
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {/* Popular */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-body)', fontWeight: 500 }}>
                  Most Popular Venture
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
                  {popularBusiness.value}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-body)' }}>
                  Chosen by {popularBusiness.count} users
                </span>
              </div>
              
              {/* Least Popular */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-body)', fontWeight: 500 }}>
                  Least Popular Venture
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-body)' }}>
                  {leastPopularBusiness.value}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-body)' }}>
                  Chosen by {leastPopularBusiness.count} users
                </span>
              </div>

              {/* State */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-body)', fontWeight: 500 }}>
                  Most Active State
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <MapPin size={16} style={{ color: '#EF4444' }} />
                  {activeState.value}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-body)' }}>
                  {activeState.count} submissions
                </span>
              </div>

              {/* City */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-body)', fontWeight: 500 }}>
                  Most Active City
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <MapPin size={16} style={{ color: 'var(--success)' }} />
                  {activeCity.value}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-body)' }}>
                  {activeCity.count} submissions
                </span>
              </div>
            </div>
          </div>
          
          {/* Quick Platform Splits */}
          <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              Device Split
            </h3>
            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'space-around' }}>
              <div style={{ textAlign: 'center' }}>
                <Laptop size={32} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
                <h4 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  {responses.filter(r => r.device_type === 'Desktop').length}
                </h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-body)' }}>Desktop</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Smartphone size={32} style={{ color: 'var(--accent)', marginBottom: '0.5rem' }} />
                <h4 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  {responses.filter(r => r.device_type === 'Mobile' || r.device_type === 'Tablet').length}
                </h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-body)' }}>Mobile / Tablet</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Realtime Activity Panel */}
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '24px', height: '100%', maxHeight: '460px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem', flexShrink: 0 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444', display: 'inline-block', animation: 'ping 1.5s infinite' }} />
            Live Activity Feed
          </h3>
          <style>{`
            @keyframes ping {
              0% { transform: scale(1); opacity: 1; }
              70%, 100% { transform: scale(2.2); opacity: 0; }
            }
          `}</style>

          <div 
            className="admin-scrollable" 
            style={{ 
              overflowY: 'auto', 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.75rem',
              paddingRight: '0.25rem' 
            }}
          >
            {liveActivities.length > 0 ? (
              liveActivities.map((act, index) => (
                <div
                  key={act.id + '-' + index}
                  className="animate-slide-in-right"
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    fontSize: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: 'var(--text-main)' }}>
                      New Survey Received
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-body)' }}>
                      {formatTimeAgo(act.timestamp)}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-body)' }}>
                    Visitor from <strong style={{ color: 'var(--text-main)' }}>{act.city || 'Unknown'}, {act.state}</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                    Interested in {act.business}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-body)', fontSize: '0.9rem', padding: '2rem 0' }}>
                No active responses logged.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
