/**
 * Survey input validation helpers with friendly, polished wording.
 */

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

export const validateAgeGroup = (val: string): ValidationResult => {
  if (!val) {
    return { isValid: false, message: 'Please select your age group so we can categorize responses.' };
  }
  const allowed = ['18-24', '25-34', '35-44', '45-54', '55+'];
  if (!allowed.includes(val)) {
    return { isValid: false, message: 'Please select a valid age group category.' };
  }
  return { isValid: true, message: '' };
};

export const validateState = (val: string): ValidationResult => {
  if (!val) {
    return { isValid: false, message: 'Please select the state you reside in.' };
  }
  return { isValid: true, message: '' };
};

export const validateCity = (val: string): ValidationResult => {
  const trimmed = val.trim();
  if (!trimmed) {
    return { isValid: false, message: 'Please type your city or town name.' };
  }
  if (trimmed.length < 2) {
    return { isValid: false, message: 'City name is a bit too short! Please enter at least 2 characters.' };
  }
  if (!/^[a-zA-Z\s\-]+$/.test(trimmed)) {
    return { isValid: false, message: 'City name should only contain letters, spaces, or hyphens.' };
  }
  return { isValid: true, message: '' };
};

export const validateOccupation = (val: string): ValidationResult => {
  if (!val) {
    return { isValid: false, message: 'Please select your current occupation.' };
  }
  return { isValid: true, message: '' };
};

export const validateMonthlyIncome = (val: string): ValidationResult => {
  if (!val) {
    return { isValid: false, message: 'Please select your monthly household income bracket.' };
  }
  return { isValid: true, message: '' };
};

export const validateBusinessSelection = (val: string): ValidationResult => {
  if (!val) {
    return { isValid: false, message: 'Please select the business project that excites you the most.' };
  }
  return { isValid: true, message: '' };
};

export const validateRanking = (ranking: any[]): ValidationResult => {
  if (!ranking || ranking.length < 6) {
    return { isValid: false, message: 'Please rank all 6 business ideas in your order of preference.' };
  }
  return { isValid: true, message: '' };
};

export const validateSuggestions = (val: string): ValidationResult => {
  if (val && val.length > 1000) {
    return { isValid: false, message: 'Suggestions should not exceed 1000 characters. Keep it brief!' };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate active survey step inputs.
 */
export const validateStep = (step: number, answers: any): ValidationResult => {
  switch (step) {
    case 1:
      return validateAgeGroup(answers.ageGroup);
    case 2:
      return validateState(answers.state);
    case 3:
      return validateCity(answers.city);
    case 4:
      return validateOccupation(answers.occupation);
    case 5:
      return validateMonthlyIncome(answers.monthlyIncome);
    case 6:
      return validateBusinessSelection(answers.excitedBusiness);
    case 7:
      return validateRanking(answers.ranking);
    case 8:
      return validateSuggestions(answers.suggestions);
    default:
      return { isValid: true, message: '' };
  }
};
