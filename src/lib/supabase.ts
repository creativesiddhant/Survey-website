/**
 * Supabase client utility using standard fetch.
 * To use Supabase for the backend, define the following environment variables:
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_ANON_KEY
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey);
};

export interface SurveyResponse {
  age_group: string;
  state: string;
  city: string;
  occupation: string;
  monthly_income: string;
  excited_business: string;
  ranking: string[];
  suggestions: string;
}

export const submitToSupabase = async (data: SurveyResponse): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY env variables.");
    return false;
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/survey_responses`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Supabase API responded with status ${response.status}: ${errText}`);
    }

    return true;
  } catch (error) {
    console.error("Failed to submit to Supabase:", error);
    return false;
  }
};
