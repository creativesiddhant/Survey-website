import React, { useState, useMemo } from 'react';
import { Award, Heart, MessageSquare, Tag, TrendingUp } from 'lucide-react';

interface SurveyResponse {
  id: string;
  business_interest: string;
  business_ranking: string[];
  suggestions?: string;
  income_range: string;
  created_at: string;
}

interface AdminBusinessProps {
  responses: SurveyResponse[];
}

export const AdminBusiness: React.FC<AdminBusinessProps> = ({ responses }) => {
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);

  // Business Definitions
  const businesses = [
    { id: 'foxnuts', title: 'Foxnuts', emoji: '🥣', color: '#6366F1' },
    { id: 'coffee', title: 'Coffee', emoji: '☕', color: '#F59E0B' },
    { id: 'spices', title: 'Spices', emoji: '🌶️', color: '#EF4444' },
    { id: 'water', title: 'Packaged Water', emoji: '💧', color: '#06B6D4' },
    { id: 'stationery', title: 'Stationery', emoji: '✏️', color: '#10B981' },
    { id: 'biodegradable', title: 'Biodegradable Products', emoji: '🌿', color: '#EC4899' }
  ];

  // 1. Calculate Venture Performance metrics
  const businessMetrics = useMemo(() => {
    return businesses.map(b => {
      // Popularity (Rank 1 count in business_interest selection)
      const primaryInterestCount = responses.filter(r => 
        r.business_interest.toLowerCase().includes(b.id.toLowerCase()) || 
        r.business_interest.toLowerCase().includes(b.title.toLowerCase().split(' ')[0])
      ).length;

      // Weighted score based on rank placement:
      // Rank 1 = 6 pts, Rank 2 = 5 pts, Rank 3 = 4 pts, Rank 4 = 3 pts, Rank 5 = 2 pts, Rank 6 = 1 pt
      let weightedScore = 0;
      responses.forEach(r => {
        const index = r.business_ranking.findIndex(rankStr => 
          rankStr.toLowerCase().includes(b.id.toLowerCase()) ||
          rankStr.toLowerCase().includes(b.title.toLowerCase().split(' ')[0])
        );
        if (index !== -1) {
          // index 0 -> Rank 1 -> 6 pts. index 5 -> Rank 6 -> 1 pt.
          weightedScore += (6 - index);
        }
      });

      // Purchase intent: Percentage of high income profiles interested in this business
      // High income: ₹50,000+ brackets
      const interestedUsers = responses.filter(r => 
        r.business_interest.toLowerCase().includes(b.id.toLowerCase()) || 
        r.business_interest.toLowerCase().includes(b.title.toLowerCase().split(' ')[0])
      );
      const highIncomeCount = interestedUsers.filter(r => 
        r.income_range.includes('₹50,000') || 
        r.income_range.includes('₹1,00,000') || 
        r.income_range.includes('₹2,00,000')
      ).length;

      const purchaseIntent = interestedUsers.length > 0
        ? Math.round((highIncomeCount / interestedUsers.length) * 100)
        : 0;

      // Simulated growth trend based on last 7 days share vs total share
      const today = new Date();
      const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const recentResponses = responses.filter(r => new Date(r.created_at) >= oneWeekAgo);
      
      const recentInterest = recentResponses.filter(r => 
        r.business_interest.toLowerCase().includes(b.id.toLowerCase()) || 
        r.business_interest.toLowerCase().includes(b.title.toLowerCase().split(' ')[0])
      ).length;

      const recentShare = recentResponses.length > 0 ? recentInterest / recentResponses.length : 0;
      const allTimeShare = responses.length > 0 ? primaryInterestCount / responses.length : 0;

      let growthTrend = 0;
      if (allTimeShare > 0) {
        growthTrend = Math.round(((recentShare - allTimeShare) / allTimeShare) * 100);
      }

      return {
        ...b,
        popularity: primaryInterestCount,
        score: weightedScore,
        purchaseIntent,
        growth: growthTrend
      };
    }).sort((a, b) => b.score - a.score);
  }, [responses]);

  // 2. Keyword NLP Extractor logic
  const keywordsData = useMemo(() => {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'to', 'for', 
      'with', 'on', 'in', 'at', 'by', 'of', 'from', 'it', 'this', 'that', 'these', 
      'those', 'i', 'we', 'you', 'they', 'he', 'she', 'me', 'my', 'our', 'your', 
      'his', 'her', 'us', 'them', 'some', 'any', 'no', 'not', 'all', 'more', 'less', 
      'so', 'than', 'will', 'can', 'should', 'would', 'could', 'about', 'very', 
      'also', 'just', 'like', 'none', 'etc', 'get', 'make', 'be', 'been', 'have', 
      'has', 'had', 'do', 'does', 'did', 'their', 'there', 'please', 'would', 'could',
      'need', 'want', 'good', 'great', 'more', 'product', 'products', 'business', 'survey',
      'ideas', 'idea', 'startup'
    ]);

    const wordFreqs: Record<string, number> = {};

    responses.forEach(r => {
      if (!r.suggestions) return;
      // Clean punctuation
      const cleanText = r.suggestions
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, '')
        .replace(/\s{2,}/g, ' ');

      const words = cleanText.split(' ');
      words.forEach(word => {
        const trimmed = word.trim();
        if (trimmed.length > 3 && !stopWords.has(trimmed)) {
          wordFreqs[trimmed] = (wordFreqs[trimmed] || 0) + 1;
        }
      });
    });

    return Object.keys(wordFreqs)
      .map(word => ({ word, count: wordFreqs[word] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [responses]);

  // Filter suggestions by clicked keyword
  const filteredSuggestions = useMemo(() => {
    if (!selectedKeyword) return [];
    return responses.filter(r => 
      r.suggestions && r.suggestions.toLowerCase().includes(selectedKeyword.toLowerCase())
    );
  }, [selectedKeyword, responses]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
          Business Venture Analytics
        </h1>
        <p style={{ color: 'var(--text-body)', fontSize: '0.95rem' }}>
          Weighted rankings, purchase intent indexes, and suggestion text parsing.
        </p>
      </div>

      {/* Grid: Business Scores Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={20} style={{ color: 'var(--primary)' }} />
          Weighted Score Leaderboard
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.5rem' }}>
          {businessMetrics.map((b, idx) => (
            <div
              key={b.id}
              className="glass-panel"
              style={{
                padding: '1.5rem',
                borderRadius: '20px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Placement badge */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  backgroundColor: idx === 0 ? 'var(--primary)' : 'var(--border-color)',
                  color: idx === 0 ? '#FFFFFF' : 'var(--text-body)',
                  padding: '0.4rem 1rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  borderBottomLeftRadius: '14px'
                }}
              >
                RANK #{idx + 1}
              </div>

              {/* Title & icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '2rem' }}>{b.emoji}</span>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>{b.title}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-body)' }}>{b.popularity} Primary votes</span>
                </div>
              </div>

              {/* Stats Split */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
                
                {/* Score */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-body)' }}>Weighted Score</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {b.score} <span style={{ fontSize: '0.85rem', color: 'var(--text-body)', fontWeight: 500 }}>pts</span>
                  </span>
                </div>

                {/* Purchase Intent */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-body)' }}>Purchase Intent</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)' }}>
                    {b.purchaseIntent}%
                  </span>
                </div>
              </div>

              {/* Bottom trend info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-body)', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <TrendingUp size={12} style={{ color: b.growth >= 0 ? 'var(--success)' : '#EF4444' }} />
                  Weekly Trend:
                  <strong style={{ color: b.growth >= 0 ? 'var(--success)' : '#EF4444' }}>
                    {b.growth >= 0 ? `+${b.growth}%` : `${b.growth}%`}
                  </strong>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Heart size={12} style={{ color: 'var(--accent)' }} />
                  Score conversion index
                </span>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Suggestions Keyword extraction Analysis */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'start', marginTop: '1rem' }}>
        
        {/* NLP Chips Panel */}
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
            <Tag size={18} style={{ color: 'var(--primary)' }} />
            Suggestion Keyword Cloud
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-body)', marginBottom: '1.25rem' }}>
            We scanned the text inside suggestion fields, filtered filler words, and extracted the most active terms. Click a chip to filter matching comments.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {keywordsData.length > 0 ? (
              keywordsData.map(item => {
                const isSelected = selectedKeyword === item.word;
                return (
                  <button
                    key={item.word}
                    onClick={() => setSelectedKeyword(isSelected ? null : item.word)}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: '9999px',
                      border: '1.5px solid',
                      borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                      backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-main)',
                      color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = 'var(--primary)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-color)';
                    }}
                  >
                    <span>{item.word}</span>
                    <span
                      style={{
                        backgroundColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                        color: isSelected ? '#FFFFFF' : 'var(--text-body)',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.1rem 0.35rem',
                        borderRadius: '6px'
                      }}
                    >
                      {item.count}
                    </span>
                  </button>
                );
              })
            ) : (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>No active keywords detected yet.</span>
            )}
          </div>
        </div>

        {/* Suggestion Comments Matches panel */}
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '24px', minHeight: '320px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            <MessageSquare size={18} style={{ color: 'var(--accent)' }} />
            Matching Feedbacks
          </h3>

          <div className="admin-scrollable" style={{ overflowY: 'auto', flex: 1, maxHeight: '240px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {selectedKeyword ? (
              filteredSuggestions.length > 0 ? (
                filteredSuggestions.map((r, idx) => (
                  <div
                    key={r.id + '-' + idx}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '12px',
                      backgroundColor: 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.85rem',
                      lineHeight: 1.5
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', color: 'var(--text-body)', fontSize: '0.75rem' }}>
                      <span>Venture: <strong>{r.business_interest}</strong></span>
                      <span>{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    <p style={{ color: 'var(--text-main)', fontStyle: 'italic' }}>
                      "{r.suggestions}"
                    </p>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-body)', fontSize: '0.85rem' }}>
                  No suggestions matching keyword.
                </div>
              )
            ) : (
              <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-body)', fontSize: '0.85rem', padding: '3rem 0' }}>
                Select a keyword cloud chip on the left to read filtered suggestion responses.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
