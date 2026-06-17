import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface SurveyPayload {
  visitorId: string;
  fingerprint: string;
  ageGroup: string;
  state: string;
  city: string;
  occupation: string;
  incomeRange: string;
  businessInterest: string;
  businessRanking: string[];
  suggestions: string;
  deviceType: string;
  browser: string;
  completionTime: number;
  answers: Array<{
    question_number: number;
    question: string;
    answer: string;
  }>;
}

/**
 * Service to manage visitor sessions in Supabase.
 * Checks for configuration and fails gracefully to local tracking if Supabase is offline/unconfigured.
 */
export const upsertVisitorSession = async (
  visitorId: string,
  fingerprint: string,
  device: string,
  browser: string,
  city?: string
): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from('visitor_sessions')
      .upsert(
        {
          visitor_id: visitorId,
          fingerprint,
          device,
          browser,
          city: city || null,
          last_visit: new Date().toISOString()
        },
        { onConflict: 'visitor_id' }
      );

    if (error) {
      console.error('Error upserting visitor session:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to communicate with Supabase:', err);
    return false;
  }
};

/**
 * Service to check if a visitor has already submitted a response.
 * Uses a double protection layer: matches by Visitor ID OR Browser Fingerprint.
 */
export const checkExistingSubmission = async (
  visitorId: string,
  fingerprint: string
): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  try {
    // Check if visitor_sessions has any matching completed record
    const { data, error } = await supabase
      .from('visitor_sessions')
      .select('completed')
      .or(`visitor_id.eq.${visitorId},fingerprint.eq.${fingerprint}`)
      .eq('completed', true)
      .limit(1);

    if (error) {
      console.error('Error checking duplicate submission:', error.message);
      return false;
    }

    return data && data.length > 0;
  } catch (err) {
    console.error('Failed to communicate with Supabase:', err);
    return false;
  }
};

/**
 * Service to execute the atomic survey insertion transaction via RPC.
 */
export const submitSurvey = async (payload: SurveyPayload): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase integration is not configured.');
  }

  try {
    const { data, error } = await supabase.rpc('submit_survey_response', {
      p_visitor_id: payload.visitorId,
      p_fingerprint: payload.fingerprint,
      p_age_group: payload.ageGroup,
      p_state: payload.state,
      p_city: payload.city,
      p_occupation: payload.occupation,
      p_income_range: payload.incomeRange,
      p_business_interest: payload.businessInterest,
      p_business_ranking: payload.businessRanking,
      p_suggestions: payload.suggestions,
      p_device_type: payload.deviceType,
      p_browser: payload.browser,
      p_completion_time: payload.completionTime,
      p_answers: payload.answers
    });

    if (error) {
      throw new Error(error.message);
    }

    return !!data;
  } catch (err: any) {
    console.error('Supabase survey submission error:', err);
    throw err;
  }
};

/**
 * Admin Sign In.
 */
export const signInAdmin = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

/**
 * Admin Sign Out.
 */
export const signOutAdmin = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Get current authenticated user session.
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) return null;
  return user;
};

/**
 * Reset admin password request.
 */
export const resetAdminPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/admin`,
  });
  if (error) throw error;
  return data;
};

/**
 * Fetch all survey responses along with their answers.
 */
export const fetchAllResponses = async () => {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('responses')
      .select(`
        *,
        survey_answers (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching responses:', error.message);
      throw error;
    }
    return data || [];
  } catch (err) {
    console.error('Failed to retrieve responses:', err);
    throw err;
  }
};

/**
 * Fetch all visitor sessions.
 */
export const fetchAllVisitorSessions = async () => {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('visitor_sessions')
      .select('*')
      .order('last_visit', { ascending: false });

    if (error) {
      console.error('Error fetching visitor sessions:', error.message);
      throw error;
    }
    return data || [];
  } catch (err) {
    console.error('Failed to retrieve visitor sessions:', err);
    throw err;
  }
};

/**
 * Delete a survey response (will cascade delete its survey_answers).
 */
export const deleteSurveyResponse = async (responseId: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase
      .from('responses')
      .delete()
      .eq('id', responseId);

    if (error) {
      console.error('Error deleting survey response:', error.message);
      throw error;
    }
    return true;
  } catch (err) {
    console.error('Failed to delete response:', err);
    throw err;
  }
};

/**
 * Subscribe to realtime inserts on survey responses.
 */
export const subscribeToRealtimeChanges = (onInsert: (payload: any) => void) => {
  if (!isSupabaseConfigured()) return null;
  const channel = supabase
    .channel('responses-realtime')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'responses'
      },
      (payload) => {
        onInsert(payload.new);
      }
    )
    .subscribe();
  return channel;
};

