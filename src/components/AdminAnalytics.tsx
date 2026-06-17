import React, { useState } from 'react';
import { BarChart3, PieChart, LineChart, Shield } from 'lucide-react';

interface SurveyResponse {
  id: string;
  created_at: string;
  age_group: string;
  state: string;
  city: string;
  occupation: string;
  income_range: string;
  business_interest: string;
  business_ranking: string[];
}

interface AdminAnalyticsProps {
  responses: SurveyResponse[];
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ responses }) => {
  // Tooltip state
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({ visible: false, x: 0, y: 0, content: '' });

  const handleMouseMove = (e: React.MouseEvent, content: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left + 15;
    const y = e.clientY - rect.top - 20;
    setTooltip({ visible: true, x, y, content });
  };

  const handleMouseLeave = () => {
    setTooltip({ visible: false, x: 0, y: 0, content: '' });
  };

  // 1. Business Popularity Data
  const ventures = [
    { key: 'Foxnuts', title: 'Foxnuts', color: '#6366F1' },
    { key: 'Coffee', title: 'Coffee', color: '#F59E0B' },
    { key: 'Spices', title: 'Spices', color: '#EF4444' },
    { key: 'Packaged Water', title: 'Packaged Water', color: '#06B6D4' },
    { key: 'Stationery', title: 'Stationery', color: '#10B981' },
    { key: 'Biodegradable Products', title: 'Biodegradable', color: '#EC4899' }
  ];

  const popularityData = ventures.map(v => {
    const count = responses.filter(r => r.business_interest.toLowerCase().includes(v.key.toLowerCase())).length;
    return { ...v, count };
  });
  const maxPopularity = Math.max(...popularityData.map(d => d.count), 1);

  // 2. Age Distribution Data
  const ageGroups = ['18-24', '25-34', '35-44', '45-54', '55+'];
  const ageColors = ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF'];
  const ageData = ageGroups.map((g, idx) => {
    const count = responses.filter(r => r.age_group === g).length;
    return { label: g, count, color: ageColors[idx] };
  });
  const totalAgeCount = ageData.reduce((sum, d) => sum + d.count, 0) || 1;

  // 3. Occupation Distribution Data
  const occupations = ['Student', 'Working Professional', 'Business Owner', 'Homemaker', 'Retired', 'Other'];
  const occColors = ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5', '#ECFDF5'];
  const occData = occupations.map((o, idx) => {
    const count = responses.filter(r => r.occupation === o).length;
    return { label: o, count, color: occColors[idx % occColors.length] };
  });
  const totalOccCount = occData.reduce((sum, d) => sum + d.count, 0) || 1;

  // 4. Monthly Income Area Chart Data
  const incomeBrackets = ['Under ₹25,000', '₹25,000 – ₹50,000', '₹50,000 – ₹1,00,000', '₹1,00,000 – ₹2,00,000', '₹2,00,000+'];
  const incomeData = incomeBrackets.map(b => {
    const count = responses.filter(r => r.income_range === b).length;
    return { label: b.split(' ')[0], fullLabel: b, count };
  });
  const maxIncomeCount = Math.max(...incomeData.map(d => d.count), 1);

  // 5. State-wise Data
  const stateCounts: Record<string, number> = {};
  responses.forEach(r => {
    stateCounts[r.state] = (stateCounts[r.state] || 0) + 1;
  });
  const sortedStates = Object.keys(stateCounts)
    .map(state => ({ state, count: stateCounts[state] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const maxStateCount = Math.max(...sortedStates.map(s => s.count), 1);

  // 6. City-wise Data
  const cityCounts: Record<string, number> = {};
  responses.forEach(r => {
    cityCounts[r.city] = (cityCounts[r.city] || 0) + 1;
  });
  const sortedCities = Object.keys(cityCounts)
    .map(city => ({ city, count: cityCounts[city] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const maxCityCount = Math.max(...sortedCities.map(c => c.count), 1);

  // 7. Daily Trend Line Graph (Last 7 Days)
  const getDailyTrend = () => {
    const dailyMap: Record<string, number> = {};
    const dateLabels: string[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyMap[key] = 0;
      dateLabels.push(key);
    }

    responses.forEach(r => {
      const key = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (key in dailyMap) {
        dailyMap[key]++;
      }
    });

    return dateLabels.map(label => ({ label, count: dailyMap[label] }));
  };
  const dailyTrendData = getDailyTrend();
  const maxDailyTrend = Math.max(...dailyTrendData.map(d => d.count), 1);

  // 8. Weekly Survey Trend (Day of Week)
  const getWeeklyTrend = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    responses.forEach(r => {
      const d = new Date(r.created_at).getDay();
      counts[d]++;
    });
    return days.map((day, idx) => ({ label: day.slice(0, 3), count: counts[idx] }));
  };
  const weeklyTrendData = getWeeklyTrend();
  const maxWeeklyTrend = Math.max(...weeklyTrendData.map(d => d.count), 1);

  // 9. Monthly Survey Trend (Timeline)
  const getMonthlyTrend = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts = Array(12).fill(0);
    responses.forEach(r => {
      const m = new Date(r.created_at).getMonth();
      counts[m]++;
    });
    // Filter to only display months with data or current month
    const currentMonth = new Date().getMonth();
    return months.map((m, idx) => ({ label: m, count: counts[idx] })).slice(Math.max(0, currentMonth - 5), currentMonth + 1);
  };
  const monthlyTrendData = getMonthlyTrend();
  const maxMonthlyTrend = Math.max(...monthlyTrendData.map(d => d.count), 1);

  // 10. Venture Priority Ranking (#1 Ranks count)
  const rankingPriorityData = ventures.map(v => {
    const count = responses.filter(r => {
      // Find where this venture was placed at Rank 1 (first item in business_ranking)
      const rank1 = r.business_ranking[0] || '';
      return rank1.toLowerCase().includes(v.key.toLowerCase());
    }).length;
    return { ...v, count };
  });
  const maxRankingPriority = Math.max(...rankingPriorityData.map(d => d.count), 1);

  // Pie slice drawing helper
  const drawPieSlices = (data: typeof ageData, totalCount: number, size: number) => {
    const center = size / 2;
    const radius = size * 0.4;
    let accumulatedAngle = 0;

    return data.map((d, index) => {
      const percentage = d.count / totalCount;
      if (percentage === 0) return null;

      const angle = percentage * 360;
      const startAngle = accumulatedAngle;
      const endAngle = accumulatedAngle + angle;
      accumulatedAngle = endAngle;

      // Convert angles to radians
      const rad1 = ((startAngle - 90) * Math.PI) / 180;
      const rad2 = ((endAngle - 90) * Math.PI) / 180;

      // Coordinate helper
      const x1 = center + radius * Math.cos(rad1);
      const y1 = center + radius * Math.sin(rad1);
      const x2 = center + radius * Math.cos(rad2);
      const y2 = center + radius * Math.sin(rad2);

      const largeArcFlag = angle > 180 ? 1 : 0;
      const pathData = `
        M ${center} ${center}
        L ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
        Z
      `;

      return (
        <path
          key={index}
          className="chart-pie-slice"
          d={pathData}
          fill={d.color}
          onMouseMove={(e) => handleMouseMove(e, `${d.label}: ${d.count} responses (${Math.round(percentage * 100)}%)`)}
          onMouseLeave={handleMouseLeave}
        />
      );
    });
  };

  // Donut slice drawing helper
  const drawDonutSlices = (data: typeof occData, totalCount: number, size: number) => {
    const center = size / 2;
    const radius = size * 0.4;
    const innerRadius = size * 0.22;
    let accumulatedAngle = 0;

    return data.map((d, index) => {
      const percentage = d.count / totalCount;
      if (percentage === 0) return null;

      const angle = percentage * 360;
      const startAngle = accumulatedAngle;
      const endAngle = accumulatedAngle + angle;
      accumulatedAngle = endAngle;

      const rad1 = ((startAngle - 90) * Math.PI) / 180;
      const rad2 = ((endAngle - 90) * Math.PI) / 180;

      // Coordinates
      const x1 = center + radius * Math.cos(rad1);
      const y1 = center + radius * Math.sin(rad1);
      const x2 = center + radius * Math.cos(rad2);
      const y2 = center + radius * Math.sin(rad2);

      const innerX1 = center + innerRadius * Math.cos(rad1);
      const innerY1 = center + innerRadius * Math.sin(rad1);
      const innerX2 = center + innerRadius * Math.cos(rad2);
      const innerY2 = center + innerRadius * Math.sin(rad2);

      const largeArcFlag = angle > 180 ? 1 : 0;
      
      // Donut Path
      const pathData = `
        M ${innerX1} ${innerY1}
        L ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
        L ${innerX2} ${innerY2}
        A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1}
        Z
      `;

      return (
        <path
          key={index}
          className="chart-pie-slice"
          d={pathData}
          fill={d.color}
          onMouseMove={(e) => handleMouseMove(e, `${d.label}: ${d.count} responses (${Math.round(percentage * 100)}%)`)}
          onMouseLeave={handleMouseLeave}
        />
      );
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
      
      {/* Tooltip Overlay */}
      {tooltip.visible && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            padding: '0.4rem 0.8rem',
            borderRadius: '8px',
            backgroundColor: 'var(--text-main)',
            color: 'var(--bg-card)',
            fontSize: '0.8rem',
            fontWeight: 600,
            zIndex: 50,
            pointerEvents: 'none',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            whiteSpace: 'nowrap'
          }}
        >
          {tooltip.content}
        </div>
      )}

      {/* Title */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
          Analytics & Trends
        </h1>
        <p style={{ color: 'var(--text-body)', fontSize: '0.95rem' }}>
          Aggregated visual reports on market segments and venture popularity.
        </p>
      </div>

      {/* Main Grid: 10 Charts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem',
        }}
      >
        
        {/* CHART 1: Business Popularity (Bar Chart) */}
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <BarChart3 size={18} style={{ color: 'var(--primary)' }} />
            Business Popularity Count
          </h3>
          <svg viewBox="0 0 400 200" style={{ width: '100%', overflow: 'visible' }}>
            {/* Grid Lines */}
            <line x1="40" y1="160" x2="380" y2="160" stroke="var(--border-color)" strokeWidth="1.5" />
            <line x1="40" y1="110" x2="380" y2="110" className="chart-grid-line" />
            <line x1="40" y1="60" x2="380" y2="60" className="chart-grid-line" />

            {/* Render Bars */}
            {popularityData.map((d, idx) => {
              const barWidth = 32;
              const xPos = 55 + idx * 53;
              const barHeight = (d.count / maxPopularity) * 120;
              const yPos = 160 - barHeight;
              return (
                <rect
                  key={d.key}
                  className="chart-bar"
                  x={xPos}
                  y={yPos}
                  width={barWidth}
                  height={barHeight}
                  fill={d.color}
                  rx="6"
                  onMouseMove={(e) => handleMouseMove(e, `${d.title}: ${d.count} votes`)}
                  onMouseLeave={handleMouseLeave}
                />
              );
            })}

            {/* Labels */}
            {popularityData.map((d, idx) => {
              const xPos = 71 + idx * 53;
              return (
                <text
                  key={d.key}
                  x={xPos}
                  y="180"
                  textAnchor="middle"
                  fill="var(--text-body)"
                  fontSize="8"
                  fontWeight="600"
                >
                  {d.title.split(' ')[0]}
                </text>
              );
            })}
          </svg>
        </div>

        {/* CHART 2: Age Distribution (Pie Chart) */}
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <PieChart size={18} style={{ color: 'var(--accent)' }} />
            Age Group Distribution
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <svg viewBox="0 0 160 160" style={{ width: '150px', height: '150px', overflow: 'visible' }}>
              <g>{drawPieSlices(ageData, totalAgeCount, 160)}</g>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
              {ageData.map(d => (
                <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: d.color }} />
                  <span style={{ color: 'var(--text-body)', fontWeight: 500 }}>{d.label}</span>
                  <strong style={{ color: 'var(--text-main)' }}>{d.count}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CHART 3: Occupation Distribution (Donut Chart) */}
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <PieChart size={18} style={{ color: 'var(--success)' }} />
            Occupation Share
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <svg viewBox="0 0 160 160" style={{ width: '150px', height: '150px', overflow: 'visible' }}>
              <g>{drawDonutSlices(occData, totalOccCount, 160)}</g>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', flex: 1 }}>
              {occData.map(d => (
                <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: d.color }} />
                    <span style={{ color: 'var(--text-body)' }}>{d.label.slice(0, 15)}</span>
                  </div>
                  <strong style={{ color: 'var(--text-main)' }}>{d.count}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CHART 4: Monthly Income Distribution (Area Chart) */}
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <LineChart size={18} style={{ color: '#F59E0B' }} />
            Income Bracket Density
          </h3>
          <svg viewBox="0 0 400 200" style={{ width: '100%', overflow: 'visible' }}>
            {/* Grid Line */}
            <line x1="40" y1="160" x2="380" y2="160" stroke="var(--border-color)" strokeWidth="1.5" />
            <line x1="40" y1="100" x2="380" y2="100" className="chart-grid-line" />

            {/* Build points path */}
            {(() => {
              const points = incomeData.map((d, idx) => {
                const x = 50 + idx * 75;
                const y = 160 - (d.count / maxIncomeCount) * 110;
                return { x, y };
              });
              const pathString = points.reduce((str, p, idx) => {
                return str + `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y} `;
              }, '');
              const areaString = pathString + `L ${points[points.length - 1].x} 160 L ${points[0].x} 160 Z`;
              
              return (
                <>
                  {/* Fill Area */}
                  <path d={areaString} fill="rgba(245, 158, 11, 0.15)" />
                  {/* Line */}
                  <path d={pathString} fill="none" stroke="#F59E0B" strokeWidth="3" className="chart-line-path" />
                  {/* Dots */}
                  {points.map((p, idx) => (
                    <circle
                      key={idx}
                      cx={p.x}
                      cy={p.y}
                      r="5"
                      fill="#FFFFFF"
                      stroke="#F59E0B"
                      strokeWidth="2.5"
                      cursor="pointer"
                      onMouseMove={(e) => handleMouseMove(e, `${incomeData[idx].fullLabel}: ${incomeData[idx].count} responses`)}
                      onMouseLeave={handleMouseLeave}
                    />
                  ))}
                </>
              );
            })()}

            {/* Labels */}
            {incomeData.map((d, idx) => {
              const xPos = 50 + idx * 75;
              return (
                <text
                  key={idx}
                  x={xPos}
                  y="180"
                  textAnchor="middle"
                  fill="var(--text-body)"
                  fontSize="8"
                  fontWeight="600"
                >
                  {d.label}
                </text>
              );
            })}
          </svg>
        </div>

        {/* CHART 5: State-wise Responses (Ranked stacked bar list) */}
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <BarChart3 size={18} style={{ color: '#EF4444' }} />
            Top States
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {sortedStates.length > 0 ? (
              sortedStates.map((s, idx) => {
                const percent = (s.count / maxStateCount) * 100;
                return (
                  <div key={s.state} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>#{idx + 1} {s.state}</span>
                      <strong style={{ color: 'var(--text-body)' }}>{s.count} responses</strong>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${percent}%`,
                          height: '100%',
                          backgroundColor: '#EF4444',
                          borderRadius: '4px',
                          transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-body)' }}>
                No active responses.
              </div>
            )}
          </div>
        </div>

        {/* CHART 6: City-wise Responses (Horizontal Bars) */}
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <BarChart3 size={18} style={{ color: '#06B6D4' }} />
            Top Cities
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {sortedCities.length > 0 ? (
              sortedCities.map((c) => {
                const percent = (c.count / maxCityCount) * 100;
                return (
                  <div key={c.city} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{c.city || 'Unknown'}</span>
                      <strong style={{ color: 'var(--text-body)' }}>{c.count} responses</strong>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${percent}%`,
                          height: '100%',
                          backgroundColor: '#06B6D4',
                          borderRadius: '4px',
                          transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-body)' }}>
                No active responses.
              </div>
            )}
          </div>
        </div>

        {/* CHART 7: Daily Survey Trend (Line Graph) */}
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <LineChart size={18} style={{ color: 'var(--primary)' }} />
            Daily Survey Trend (Last 7 Days)
          </h3>
          <svg viewBox="0 0 400 200" style={{ width: '100%', overflow: 'visible' }}>
            <line x1="40" y1="160" x2="380" y2="160" stroke="var(--border-color)" strokeWidth="1.5" />
            <line x1="40" y1="100" x2="380" y2="100" className="chart-grid-line" />

            {(() => {
              const points = dailyTrendData.map((d, idx) => {
                const x = 50 + idx * 52;
                const y = 160 - (d.count / maxDailyTrend) * 110;
                return { x, y };
              });
              const pathString = points.reduce((str, p, idx) => {
                return str + `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y} `;
              }, '');
              
              return (
                <>
                  <path d={pathString} fill="none" stroke="var(--primary)" strokeWidth="3" className="chart-line-path" />
                  {points.map((p, idx) => (
                    <circle
                      key={idx}
                      cx={p.x}
                      cy={p.y}
                      r="4.5"
                      fill="#FFFFFF"
                      stroke="var(--primary)"
                      strokeWidth="2.5"
                      cursor="pointer"
                      onMouseMove={(e) => handleMouseMove(e, `${dailyTrendData[idx].label}: ${dailyTrendData[idx].count} responses`)}
                      onMouseLeave={handleMouseLeave}
                    />
                  ))}
                </>
              );
            })()}

            {dailyTrendData.map((d, idx) => {
              const xPos = 50 + idx * 52;
              return (
                <text
                  key={idx}
                  x={xPos}
                  y="180"
                  textAnchor="middle"
                  fill="var(--text-body)"
                  fontSize="7.5"
                  fontWeight="600"
                >
                  {d.label}
                </text>
              );
            })}
          </svg>
        </div>

        {/* CHART 8: Weekly Survey Trend (Bar/Column chart) */}
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <BarChart3 size={18} style={{ color: 'var(--accent)' }} />
            Weekly Distribution (Day of Week)
          </h3>
          <svg viewBox="0 0 400 200" style={{ width: '100%', overflow: 'visible' }}>
            <line x1="40" y1="160" x2="380" y2="160" stroke="var(--border-color)" strokeWidth="1.5" />
            <line x1="40" y1="100" x2="380" y2="100" className="chart-grid-line" />

            {weeklyTrendData.map((d, idx) => {
              const barWidth = 24;
              const xPos = 55 + idx * 47;
              const barHeight = (d.count / maxWeeklyTrend) * 120;
              const yPos = 160 - barHeight;
              return (
                <rect
                  key={d.label}
                  className="chart-bar"
                  x={xPos}
                  y={yPos}
                  width={barWidth}
                  height={barHeight}
                  fill="var(--accent)"
                  rx="4"
                  onMouseMove={(e) => handleMouseMove(e, `${d.label}: ${d.count} responses`)}
                  onMouseLeave={handleMouseLeave}
                />
              );
            })}

            {weeklyTrendData.map((d, idx) => {
              const xPos = 67 + idx * 47;
              return (
                <text
                  key={d.label}
                  x={xPos}
                  y="180"
                  textAnchor="middle"
                  fill="var(--text-body)"
                  fontSize="8"
                  fontWeight="600"
                >
                  {d.label}
                </text>
              );
            })}
          </svg>
        </div>

        {/* CHART 9: Monthly Survey Trend (Timeline) */}
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <LineChart size={18} style={{ color: '#EC4899' }} />
            Monthly Response Timeline
          </h3>
          <svg viewBox="0 0 400 200" style={{ width: '100%', overflow: 'visible' }}>
            <line x1="40" y1="160" x2="380" y2="160" stroke="var(--border-color)" strokeWidth="1.5" />
            <line x1="40" y1="100" x2="380" y2="100" className="chart-grid-line" />

            {(() => {
              const points = monthlyTrendData.map((d, idx) => {
                const x = 60 + idx * 56;
                const y = 160 - (d.count / maxMonthlyTrend) * 110;
                return { x, y };
              });
              const pathString = points.reduce((str, p, idx) => {
                return str + `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y} `;
              }, '');
              
              return (
                <>
                  <path d={pathString} fill="none" stroke="#EC4899" strokeWidth="3" className="chart-line-path" />
                  {points.map((p, idx) => (
                    <circle
                      key={idx}
                      cx={p.x}
                      cy={p.y}
                      r="4.5"
                      fill="#FFFFFF"
                      stroke="#EC4899"
                      strokeWidth="2.5"
                      cursor="pointer"
                      onMouseMove={(e) => handleMouseMove(e, `${monthlyTrendData[idx].label}: ${monthlyTrendData[idx].count} responses`)}
                      onMouseLeave={handleMouseLeave}
                    />
                  ))}
                </>
              );
            })()}

            {monthlyTrendData.map((d, idx) => {
              const xPos = 60 + idx * 56;
              return (
                <text
                  key={idx}
                  x={xPos}
                  y="180"
                  textAnchor="middle"
                  fill="var(--text-body)"
                  fontSize="8"
                  fontWeight="600"
                >
                  {d.label}
                </text>
              );
            })}
          </svg>
        </div>

        {/* CHART 10: Venture Priority Ranking (#1 Placements) */}
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Shield size={18} style={{ color: 'var(--primary)' }} />
            Rank #1 Business Priority Selection
          </h3>
          <svg viewBox="0 0 400 200" style={{ width: '100%', overflow: 'visible' }}>
            <line x1="40" y1="160" x2="380" y2="160" stroke="var(--border-color)" strokeWidth="1.5" />
            <line x1="40" y1="110" x2="380" y2="110" className="chart-grid-line" />
            <line x1="40" y1="60" x2="380" y2="60" className="chart-grid-line" />

            {rankingPriorityData.map((d, idx) => {
              const barWidth = 28;
              const xPos = 55 + idx * 54;
              const barHeight = (d.count / maxRankingPriority) * 120;
              const yPos = 160 - barHeight;
              return (
                <rect
                  key={d.key}
                  className="chart-bar"
                  x={xPos}
                  y={yPos}
                  width={barWidth}
                  height={barHeight}
                  fill="var(--primary)"
                  rx="5"
                  onMouseMove={(e) => handleMouseMove(e, `${d.title} Ranked #1: ${d.count} times`)}
                  onMouseLeave={handleMouseLeave}
                />
              );
            })}

            {rankingPriorityData.map((d, idx) => {
              const xPos = 69 + idx * 54;
              return (
                <text
                  key={d.key}
                  x={xPos}
                  y="180"
                  textAnchor="middle"
                  fill="var(--text-body)"
                  fontSize="8"
                  fontWeight="600"
                >
                  {d.title.split(' ')[0]}
                </text>
              );
            })}
          </svg>
        </div>

      </div>

    </div>
  );
};
