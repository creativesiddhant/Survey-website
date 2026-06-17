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

export interface SystemSettings {
  duplicateBlock: boolean;
  submissionLimit: number;
  exportPref: string;
}

/**
 * Fetch global system settings from Supabase, falling back to localStorage or default options.
 */
export const fetchSystemSettings = async (): Promise<SystemSettings> => {
  const defaultSettings: SystemSettings = {
    duplicateBlock: false, // Default to false for unlimited submissions by default
    submissionLimit: 999,  // Default to 999 for unlimited submissions by default
    exportPref: 'csv'
  };

  if (!isSupabaseConfigured()) {
    const localDup = localStorage.getItem('settings_duplicate_block');
    const dup = localDup !== null ? localDup === 'true' : false;
    const localLimit = localStorage.getItem('settings_submission_limit');
    const limit = localLimit !== null ? Number(localLimit) : 999;
    const exportPref = localStorage.getItem('settings_export_pref') || 'csv';
    return { duplicateBlock: dup, submissionLimit: limit, exportPref };
  }

  try {
    const { data, error } = await supabase
      .from('settings')
      .select('key, value');

    if (error) {
      console.error('Error fetching settings from DB:', error.message);
      const localDup = localStorage.getItem('settings_duplicate_block');
      const dup = localDup !== null ? localDup === 'true' : false;
      const localLimit = localStorage.getItem('settings_submission_limit');
      const limit = localLimit !== null ? Number(localLimit) : 999;
      const exportPref = localStorage.getItem('settings_export_pref') || 'csv';
      return { duplicateBlock: dup, submissionLimit: limit, exportPref };
    }

    const settingsMap: Partial<SystemSettings> = {};
    data?.forEach(row => {
      if (row.key === 'settings_duplicate_block') {
        settingsMap.duplicateBlock = row.value?.value;
      } else if (row.key === 'settings_submission_limit') {
        settingsMap.submissionLimit = Number(row.value?.value);
      } else if (row.key === 'settings_export_pref') {
        settingsMap.exportPref = row.value?.value;
      }
    });

    return {
      duplicateBlock: settingsMap.duplicateBlock !== undefined ? settingsMap.duplicateBlock : false,
      submissionLimit: settingsMap.submissionLimit !== undefined ? settingsMap.submissionLimit : 999,
      exportPref: settingsMap.exportPref || 'csv'
    };
  } catch (err) {
    console.error('Failed to fetch settings from DB:', err);
    return defaultSettings;
  }
};

/**
 * Save settings globally in Supabase and locally in localStorage.
 */
export const saveSystemSettings = async (settings: SystemSettings): Promise<boolean> => {
  localStorage.setItem('settings_duplicate_block', String(settings.duplicateBlock));
  localStorage.setItem('settings_submission_limit', String(settings.submissionLimit));
  localStorage.setItem('settings_export_pref', settings.exportPref);

  if (!isSupabaseConfigured()) return true;

  try {
    const rows = [
      { key: 'settings_duplicate_block', value: { value: settings.duplicateBlock } },
      { key: 'settings_submission_limit', value: { value: settings.submissionLimit } },
      { key: 'settings_export_pref', value: { value: settings.exportPref } }
    ];

    const { error } = await supabase
      .from('settings')
      .upsert(rows, { onConflict: 'key' });

    if (error) {
      console.error('Error saving settings to DB:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to save settings to DB:', err);
    return false;
  }
};

/**
 * Get total submission count across all visitor sessions matching visitorId OR fingerprint.
 */
export const getSubmissionCount = async (
  visitorId: string,
  fingerprint: string
): Promise<number> => {
  if (!isSupabaseConfigured()) return 0;

  try {
    const { data, error } = await supabase
      .from('visitor_sessions')
      .select('submission_count')
      .or(`visitor_id.eq.${visitorId},fingerprint.eq.${fingerprint}`);

    if (error) {
      console.error('Error fetching submission count:', error.message);
      return 0;
    }

    const total = data ? data.reduce((acc, curr) => acc + (curr.submission_count || 0), 0) : 0;
    return total;
  } catch (err) {
    console.error('Failed to get submission count from DB:', err);
    return 0;
  }
};

