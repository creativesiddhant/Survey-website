import React, { useState, useEffect } from 'react';
import { ProgressBar } from './ProgressBar';
import { Button } from './Button';
import { isSupabaseConfigured } from '../lib/supabase';
import { BusinessCard, FoxnutsIllustration, CoffeeIllustration, SpicesIllustration, WaterIllustration, StationeryIllustration, BiodegradableIllustration } from './BusinessCard';
import type { BusinessOption } from './BusinessCard';
import { DragRank } from './DragRank';
import { ArrowLeft, ArrowRight, CheckCircle, Search, ChevronDown } from 'lucide-react';
import { getOrCreateVisitorId, getBrowserFingerprint } from '../utils/visitor';
import { getDeviceType, getBrowserName } from '../utils/device';
import { validateStep } from '../validation/survey';
import { upsertVisitorSession, checkExistingSubmission, submitSurvey } from '../services/supabaseService';
import type { SurveyPayload } from '../services/supabaseService';

// Indian States data
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry'
].sort();

// Business Ideas options array
const BUSINESS_OPTIONS: BusinessOption[] = [
  {
    id: 'foxnuts',
    emoji: '🥣',
    title: 'Foxnuts',
    description: 'Healthy premium roasted snack built on authentic high-quality farm produce.',
    illustration: <FoxnutsIllustration />
  },
  {
    id: 'coffee',
    emoji: '☕',
    title: 'Coffee',
    description: 'Daily premium hot beverage crafted with high-grade organic coffee beans.',
    illustration: <CoffeeIllustration />
  },
  {
    id: 'spices',
    emoji: '🌶️',
    title: 'Spices',
    description: 'Pure, unadulterated spices capturing the rich heritage of authentic flavors.',
    illustration: <SpicesIllustration />
  },
  {
    id: 'water',
    emoji: '💧',
    title: 'Packaged Water',
    description: 'Premium packaged mineral drinking water stored in eco-conscious containers.',
    illustration: <WaterIllustration />
  },
  {
    id: 'stationery',
    emoji: '✏️',
    title: 'Stationery',
    description: 'Luxury office and school supplies utilizing high-quality tactile materials.',
    illustration: <StationeryIllustration />
  },
  {
    id: 'biodegradable',
    emoji: '🌿',
    title: 'Biodegradable Products',
    description: 'Eco-friendly biodegradable dinnerware supporting a green, sustainable future.',
    illustration: <BiodegradableIllustration />
  }
];

interface SurveyCardProps {
  onComplete?: () => void;
}

export const SurveyCard: React.FC<SurveyCardProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 8;
  const [slideDirection, setSlideDirection] = useState<'in' | 'out' | 'left' | 'right'>('in');

  // Survey responses state
  const [answers, setAnswers] = useState({
    ageGroup: '',
    state: '',
    city: '',
    occupation: '',
    monthlyIncome: '',
    excitedBusiness: '',
    ranking: BUSINESS_OPTIONS.map(b => ({ id: b.id, title: b.title, emoji: b.emoji })),
    suggestions: ''
  });

  // State Searchable Dropdown state
  const [stateSearch, setStateSearch] = useState('');
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);

  // Confetti particles state
  const [confetti, setConfetti] = useState<{ id: number; left: number; delay: number; color: string; duration: number }[]>([]);

  // Supabase states
  const [visitorId, setVisitorId] = useState<string>('');
  const [fingerprint, setFingerprint] = useState<string>('');
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');
  const [submitError, setSubmitError] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);

  // Initialize Session
  useEffect(() => {
    const initSession = async () => {
      const vid = getOrCreateVisitorId();
      setVisitorId(vid);

      const fp = getBrowserFingerprint();
      setFingerprint(fp);

      setStartTime(Date.now());

      // Check local storage block
      const localCompleted = localStorage.getItem('survey_completed') === 'true';
      if (localCompleted) {
        setHasSubmitted(true);
        return;
      }

      // Check DB block
      if (isSupabaseConfigured()) {
        const isDuplicate = await checkExistingSubmission(vid, fp);
        if (isDuplicate) {
          localStorage.setItem('survey_completed', 'true');
          setHasSubmitted(true);
          return;
        }

        const devType = getDeviceType();
        const browser = getBrowserName();
        await upsertVisitorSession(vid, fp, devType, browser, answers.city);
      }
    };

    initSession();
  }, []);

  // Update session record when city is filled to capture demographics early
  useEffect(() => {
    if (answers.city.trim().length >= 2 && visitorId && isSupabaseConfigured()) {
      const devType = getDeviceType();
      const browser = getBrowserName();
      upsertVisitorSession(visitorId, fingerprint, devType, browser, answers.city);
    }
  }, [answers.city, visitorId]);

  // Trigger confetti particle creation on completion
  useEffect(() => {
    if (step === 9) {
      const colors = ['#6366F1', '#818CF8', '#10B981', '#38BDF8', '#FBBF24', '#F472B6'];
      const particles = Array.from({ length: 120 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: 2 + Math.random() * 2,
      }));
      setConfetti(particles);
      if (onComplete) onComplete();
    }
  }, [step]);

  // Handle slide transitions
  const changeStep = (nextStep: number) => {
    setSlideDirection(nextStep > step ? 'left' : 'right');
    
    // Smoothly scroll back to the top of the survey component to prevent viewport jumping when content height changes
    const surveySection = document.getElementById('survey');
    if (surveySection) {
      surveySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    setTimeout(() => {
      setStep(nextStep);
      setSlideDirection('in');
    }, 200);
  };

  const handleFormSubmission = async () => {
    setIsLoading(true);
    setSubmitError('');

    const duration = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
    const devType = getDeviceType();
    const browser = getBrowserName();

    const answersArray = [
      { question_number: 1, question: 'Select your age group', answer: answers.ageGroup },
      { question_number: 2, question: 'Which state do you currently reside in?', answer: answers.state },
      { question_number: 3, question: 'Which city or town do you live in?', answer: answers.city },
      { question_number: 4, question: 'What is your current occupation?', answer: answers.occupation },
      { question_number: 5, question: 'Monthly Household Income Bracket', answer: answers.monthlyIncome },
      { question_number: 6, question: 'Which business excites you the most?', answer: BUSINESS_OPTIONS.find(b => b.id === answers.excitedBusiness)?.title || answers.excitedBusiness },
      { question_number: 7, question: 'Rank these business ideas', answer: answers.ranking.map((item, idx) => `#${idx + 1}: ${item.emoji} ${item.title}`).join(', ') },
      { question_number: 8, question: 'Share your ideas or suggestions', answer: answers.suggestions || 'None' }
    ];

    const payload: SurveyPayload = {
      visitorId,
      fingerprint,
      ageGroup: answers.ageGroup,
      state: answers.state,
      city: answers.city,
      occupation: answers.occupation,
      incomeRange: answers.monthlyIncome,
      businessInterest: BUSINESS_OPTIONS.find(b => b.id === answers.excitedBusiness)?.title || answers.excitedBusiness,
      businessRanking: answers.ranking.map(item => `${item.emoji} ${item.title}`),
      suggestions: answers.suggestions,
      deviceType: devType,
      browser,
      completionTime: duration,
      answers: answersArray
    };

    try {
      if (isSupabaseConfigured()) {
        await submitSurvey(payload);
        localStorage.setItem('survey_completed', 'true');
      } else {
        // Fallback simulation
        console.warn('Supabase not configured. Simulating response persistence locally.');
        await new Promise(resolve => setTimeout(resolve, 1200));
      }
      setIsLoading(false);
      changeStep(9);
    } catch (err: any) {
      console.error('Submission failed:', err);
      setIsLoading(false);
      setSubmitError(err.message || 'Unknown network connectivity issue');
    }
  };

  const handleNext = async () => {
    // Perform step validation using friendly inline validation library
    const validation = validateStep(step, answers);
    if (!validation.isValid) {
      setValidationError(validation.message);
      return;
    }

    setValidationError('');

    if (step < totalSteps) {
      changeStep(step + 1);
    } else {
      await handleFormSubmission();
    }
  };

  const handlePrev = () => {
    setValidationError('');
    if (step > 1) {
      changeStep(step - 1);
    }
  };

  // Render question content
  const renderQuestion = () => {
    switch (step) {
      case 1:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Select your age group
            </h2>
            <p style={{ color: 'var(--text-body)', fontSize: '0.95rem' }}>
              Understanding your age helps us categorize demand patterns across demographics.
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '1rem',
                marginTop: '0.5rem',
              }}
            >
              {['18-24', '25-34', '35-44', '45-54', '55+'].map((age) => {
                const isSelected = answers.ageGroup === age;
                return (
                  <div
                    key={age}
                    onClick={() => setAnswers({ ...answers, ageGroup: age })}
                    style={{
                      padding: '1.25rem 1rem',
                      borderRadius: '16px',
                      border: isSelected ? '2.5px solid var(--primary)' : '1.5px solid var(--border-color)',
                      backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-card)',
                      boxShadow: isSelected ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontWeight: 600,
                      color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                      transition: 'var(--transition-fast)',
                      minHeight: '52px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onMouseEnter={(e) => !isSelected && (e.currentTarget.style.borderColor = 'var(--primary)')}
                    onMouseLeave={(e) => !isSelected && (e.currentTarget.style.borderColor = 'var(--border-color)')}
                  >
                    {age}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 2:
        const filteredStates = INDIAN_STATES.filter(state =>
          state.toLowerCase().includes(stateSearch.toLowerCase())
        );

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Which state do you currently reside in?
            </h2>
            <p style={{ color: 'var(--text-body)', fontSize: '0.95rem' }}>
              We'll use regional tracking to assess local supply chains.
            </p>
            
            {/* Custom Searchable Dropdown */}
            <div style={{ position: 'relative', width: '100%', marginTop: '0.5rem' }}>
              <div
                onClick={() => setStateDropdownOpen(!stateDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  borderRadius: '16px',
                  border: '1.5px solid var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 500,
                  color: answers.state ? 'var(--text-main)' : 'var(--text-body)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <span>{answers.state || 'Choose your State'}</span>
                <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />
              </div>

              {stateDropdownOpen && (
                <div
                  className="glass-panel no-scrollbar"
                  style={{
                    position: 'absolute',
                    top: '110%',
                    left: 0,
                    width: '100%',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    borderRadius: '16px',
                    zIndex: 100,
                    boxShadow: 'var(--shadow-lg)',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    backgroundColor: 'var(--bg-card)',
                  }}
                >
                  {/* Search Bar inside Dropdown */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '10px',
                      backgroundColor: 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <Search size={16} style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Search state..."
                      value={stateSearch}
                      onChange={(e) => setStateSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        outline: 'none',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.9rem',
                        width: '100%',
                        color: 'var(--text-main)',
                      }}
                    />
                  </div>

                  {filteredStates.length > 0 ? (
                    filteredStates.map((state) => {
                      const isSelected = answers.state === state;
                      return (
                        <div
                          key={state}
                          onClick={() => {
                            setAnswers({ ...answers, state: state });
                            setStateDropdownOpen(false);
                            setStateSearch('');
                          }}
                          style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: isSelected ? 600 : 400,
                            backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent',
                            color: isSelected ? 'var(--primary)' : 'var(--text-body)',
                            transition: 'var(--transition-fast)',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-main)';
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          {state}
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-body)', textAlign: 'center' }}>
                      No states found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Which city or town do you live in?
            </h2>
            <p style={{ color: 'var(--text-body)', fontSize: '0.95rem' }}>
              This helps pinpoint city clusters for delivery setup.
            </p>
            <input
              type="text"
              placeholder="Type your city (e.g. Mumbai, Bangalore)"
              value={answers.city}
              onChange={(e) => setAnswers({ ...answers, city: e.target.value })}
              style={{
                width: '100%',
                padding: '1rem 1.25rem',
                borderRadius: '16px',
                border: '1.5px solid var(--border-color)',
                outline: 'none',
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                backgroundColor: 'var(--bg-card)',
                boxShadow: 'var(--shadow-sm)',
                color: 'var(--text-main)',
                transition: 'var(--transition-fast)',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
            />
          </div>
        );

      case 4:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
              What is your current occupation?
            </h2>
            <p style={{ color: 'var(--text-body)', fontSize: '0.95rem' }}>
              Understanding your work style aligns our product features to your daily schedule.
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginTop: '0.5rem',
              }}
            >
              {[
                'Student',
                'Working Professional',
                'Business Owner',
                'Homemaker',
                'Retired',
                'Other'
              ].map((occ) => {
                const isSelected = answers.occupation === occ;
                return (
                  <div
                    key={occ}
                    onClick={() => setAnswers({ ...answers, occupation: occ })}
                    style={{
                      padding: '1.25rem 1.2rem',
                      borderRadius: '16px',
                      border: isSelected ? '2.5px solid var(--primary)' : '1.5px solid var(--border-color)',
                      backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-card)',
                      boxShadow: isSelected ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                      transition: 'var(--transition-fast)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      minHeight: '56px',
                    }}
                    onMouseEnter={(e) => !isSelected && (e.currentTarget.style.borderColor = 'var(--primary)')}
                    onMouseLeave={(e) => !isSelected && (e.currentTarget.style.borderColor = 'var(--border-color)')}
                  >
                    <span
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: '2px solid var(--border-color)',
                        borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                        backgroundColor: isSelected ? '#fff' : 'transparent',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isSelected && (
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                      )}
                    </span>
                    <span>{occ}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 5:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Monthly Household Income Bracket
            </h2>
            <p style={{ color: 'var(--text-body)', fontSize: '0.95rem' }}>
              Helps us define affordable price tiers for standard products.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
              {[
                'Under ₹25,000',
                '₹25,000 – ₹50,000',
                '₹50,000 – ₹1,00,000',
                '₹1,00,000 – ₹2,00,000',
                '₹2,00,000+'
              ].map((income) => {
                const isSelected = answers.monthlyIncome === income;
                return (
                  <div
                    key={income}
                    onClick={() => setAnswers({ ...answers, monthlyIncome: income })}
                    style={{
                      padding: '1.1rem 1.5rem',
                      borderRadius: '16px',
                      border: isSelected ? '2.5px solid var(--primary)' : '1.5px solid var(--border-color)',
                      backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-card)',
                      boxShadow: isSelected ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => !isSelected && (e.currentTarget.style.borderColor = 'var(--primary)')}
                    onMouseLeave={(e) => !isSelected && (e.currentTarget.style.borderColor = 'var(--border-color)')}
                  >
                    <span>{income}</span>
                    <span style={{ fontSize: '1.25rem', opacity: isSelected ? 1 : 0.4 }}>💼</span>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 6:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Which business excites you the most?
              </h2>
              <p style={{ color: 'var(--text-body)', fontSize: '0.95rem', marginTop: '0.4rem' }}>
                Select the project option you would love to buy from or see launch first.
              </p>
            </div>
            
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.25rem',
                marginTop: '0.5rem',
              }}
            >
              {BUSINESS_OPTIONS.map((option) => (
                <BusinessCard
                  key={option.id}
                  option={option}
                  isSelected={answers.excitedBusiness === option.id}
                  onSelect={() => setAnswers({ ...answers, excitedBusiness: option.id })}
                />
              ))}
            </div>
          </div>
        );

      case 7:
        const handleRankChange = (newRankItems: { id: string; title: string; emoji: string }[]) => {
          setAnswers({ ...answers, ranking: newRankItems });
        };

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Rank these business ideas
              </h2>
              <p style={{ color: 'var(--text-body)', fontSize: '0.95rem', marginTop: '0.4rem' }}>
                Drag and drop cards or click the up/down arrows to rank your favorites from 1 to 6.
              </p>
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <DragRank items={answers.ranking} onChange={handleRankChange} />
            </div>
          </div>
        );

      case 8:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Share your ideas or suggestions
              </h2>
              <p style={{ color: 'var(--text-body)', fontSize: '0.95rem', marginTop: '0.4rem' }}>
                Tell us anything else you want! What should we build? What pricing or flavor excites you?
              </p>
            </div>
            
            <textarea
              placeholder="Share any product ideas or suggestions..."
              value={answers.suggestions}
              onChange={(e) => setAnswers({ ...answers, suggestions: e.target.value })}
              style={{
                width: '100%',
                minHeight: '160px',
                padding: '1.25rem',
                borderRadius: '20px',
                border: '1.5px solid var(--border-color)',
                outline: 'none',
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                backgroundColor: 'var(--bg-card)',
                boxShadow: 'var(--shadow-sm)',
                color: 'var(--text-main)',
                transition: 'var(--transition-fast)',
                resize: 'vertical',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
            />
          </div>
        );
      default:
        return null;
    }
  };

  // Render Completion Screen
  if (hasSubmitted) {
    return (
      <div
        id="survey-card-root"
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '800px',
          borderRadius: '24px',
          padding: '4rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          margin: '2rem auto',
          boxShadow: 'var(--shadow-lg)',
          minHeight: '400px',
          backgroundColor: '#fff',
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            marginBottom: '0.5rem',
          }}
        >
          ✨
        </div>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Response Already Recorded!
        </h2>
        <p style={{ color: 'var(--text-body)', fontSize: '1.1rem', maxWidth: '560px', lineHeight: 1.6 }}>
          Thank you for your enthusiasm! Your responses have already been securely saved in our database.
          We only allow one submission per participant to ensure accurate market demand statistics.
        </p>
        <div style={{ marginTop: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Visitor ID: <code style={{ backgroundColor: 'var(--bg-main)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.8rem' }}>{visitorId}</code>
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        id="survey-card-root"
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '840px',
          borderRadius: '24px',
          padding: '4rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          margin: '2rem auto',
          boxShadow: 'var(--shadow-lg)',
          minHeight: '440px',
          backgroundColor: '#fff',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            border: '4px solid var(--primary-light)',
            borderTopColor: 'var(--primary)',
            animation: 'spin 1s linear infinite',
            marginBottom: '1rem',
          }}
        />
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Submitting Your Survey
        </h2>
        <p style={{ color: 'var(--text-body)', fontSize: '1rem', maxWidth: '400px', lineHeight: 1.5 }}>
          Securing your feedback in our database. Please don't close this page.
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (submitError) {
    return (
      <div
        id="survey-card-root"
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '840px',
          borderRadius: '24px',
          padding: '3.5rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          margin: '2rem auto',
          boxShadow: 'var(--shadow-lg)',
          minHeight: '440px',
          backgroundColor: '#fff',
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: '#FEF2F2',
            color: '#EF4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            marginBottom: '0.5rem',
            border: '1.5px solid #FCA5A5'
          }}
        >
          ⚠️
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Connection Issue Detected
        </h2>
        <p style={{ color: 'var(--text-body)', fontSize: '1.05rem', maxWidth: '500px', lineHeight: 1.6 }}>
          We had trouble saving your survey responses. Please verify your internet connection.
          Your answers are safe, and you can retry submitting when ready.
        </p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <Button variant="outline" onClick={() => setSubmitError('')}>
            Back to Edit
          </Button>
          <Button variant="primary" onClick={handleFormSubmission}>
            Retry Submission
          </Button>
        </div>
      </div>
    );
  }

  if (step === 9) {
    return (
      <div
        id="survey-card-root"
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '800px',
          borderRadius: '24px',
          padding: '3.5rem 2rem',
          textAlign: 'center',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          margin: '2rem auto',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          backgroundColor: '#fff',
        }}
      >
        {/* Render Confetti */}
        {confetti.map((p) => (
          <div
            key={p.id}
            className="confetti-particle"
            style={{
              left: `${p.left}%`,
              backgroundColor: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}

        <div style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>
          <CheckCircle size={72} strokeWidth={1.5} className="animate-scale-in" />
        </div>

        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Thank You for Participating!
        </h2>
        
        <p style={{ color: 'var(--text-body)', fontSize: '1.1rem', maxWidth: '560px', lineHeight: 1.6 }}>
          Your responses have been successfully recorded. Your choices will help validate market demand and outline target strategies for future business models.
        </p>

        {/* Answer Summary Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-main)',
            borderRadius: '16px',
            padding: '1.5rem',
            width: '100%',
            maxWidth: '600px',
            textAlign: 'left',
            marginTop: '1rem',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Response Summary
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '0.5rem', fontSize: '0.9rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-body)' }}>Demographics:</span>
            <span>{answers.ageGroup} Years | {answers.occupation}</span>
            
            <span style={{ fontWeight: 600, color: 'var(--text-body)' }}>Location:</span>
            <span>{answers.city}, {answers.state}</span>

            <span style={{ fontWeight: 600, color: 'var(--text-body)' }}>Income Bracket:</span>
            <span>{answers.monthlyIncome}</span>

            <span style={{ fontWeight: 600, color: 'var(--text-body)' }}>Favorite Venture:</span>
            <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
              {BUSINESS_OPTIONS.find(b => b.id === answers.excitedBusiness)?.emoji}{' '}
              {BUSINESS_OPTIONS.find(b => b.id === answers.excitedBusiness)?.title}
            </span>

            <span style={{ fontWeight: 600, color: 'var(--text-body)' }}>Ideas / Rank 1:</span>
            <span>
              {answers.ranking[0]?.emoji} {answers.ranking[0]?.title} (Ranked Top)
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => {
            setAnswers({
              ageGroup: '',
              state: '',
              city: '',
              occupation: '',
              monthlyIncome: '',
              excitedBusiness: '',
              ranking: BUSINESS_OPTIONS.map(b => ({ id: b.id, title: b.title, emoji: b.emoji })),
              suggestions: ''
            });
            changeStep(1);
          }}
          style={{ marginTop: '1.5rem' }}
        >
          Restart Survey
        </Button>
      </div>
    );
  }

  // Active Survey render
  return (
    <div
      id="survey"
      style={{
        padding: '6rem 1.5rem 4rem 1.5rem',
        display: 'flex',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <div
        id="survey-card-root"
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '840px',
          borderRadius: '24px',
          padding: '2.5rem 2rem',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          backgroundColor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '440px',
        }}
      >
        {/* Progress header */}
        <ProgressBar current={step} total={totalSteps} />

        {/* Transition container */}
        <div
          style={{
            flex: 1,
            opacity: slideDirection === 'in' ? 1 : 0,
            transform:
              slideDirection === 'in'
                ? 'translateX(0)'
                : slideDirection === 'left'
                ? 'translateX(-12px)'
                : slideDirection === 'right'
                ? 'translateX(12px)'
                : 'translateX(0)',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
            marginBottom: '2.5rem',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {renderQuestion()}
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div
            className="animate-slide-up"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#FEF2F2',
              color: '#EF4444',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              border: '1px solid #FCA5A5',
              fontSize: '0.875rem',
              fontWeight: 500,
              marginBottom: '1.5rem',
            }}
          >
            <span style={{ fontSize: '1rem' }}>⚠️</span>
            <span>{validationError}</span>
          </div>
        )}

        {/* Card Footer: Navigation buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1.5rem',
            marginTop: 'auto',
          }}
        >
          <Button
            variant="outline"
            disabled={step === 1}
            onClick={handlePrev}
            icon={<ArrowLeft size={16} />}
            iconPosition="left"
            style={{ minWidth: '110px' }}
          >
            Back
          </Button>

          <Button
            variant="primary"
            onClick={handleNext}
            icon={step === totalSteps ? undefined : <ArrowRight size={16} />}
            iconPosition="right"
            style={{ minWidth: '120px' }}
          >
            {step === totalSteps ? 'Submit Response' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
};
