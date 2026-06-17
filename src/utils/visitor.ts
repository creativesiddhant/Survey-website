/**
 * Visitor session and browser fingerprinting utilities.
 */

// Generate a RFC4122 compliant UUID v4
export const generateUUID = (): string => {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  
  // Fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const VISITOR_ID_KEY = 'survey_visitor_id';

export const getOrCreateVisitorId = (): string => {
  if (typeof window === 'undefined') return '';
  
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = generateUUID();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
};

// Generates a simple, lightweight browser fingerprint hash
export const getBrowserFingerprint = (): string => {
  if (typeof window === 'undefined') return '';
  
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let canvasData = '';
    
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = "14px 'Arial'";
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#6366F1';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#10B981';
      ctx.fillText('SurveyWebsiteFingerprint,v2', 2, 15);
      ctx.fillStyle = 'rgba(99, 102, 241, 0.7)';
      ctx.fillText('SurveyWebsiteFingerprint,v2', 4, 17);
      canvasData = canvas.toDataURL();
    }
    
    const fingerprintData = [
      navigator.userAgent,
      navigator.language,
      screen.colorDepth,
      `${screen.width}x${screen.height}`,
      new Date().getTimezoneOffset(),
      canvasData
    ].join('|');
    
    // Simple fast hashing function (DJB2)
    let hash = 5381;
    for (let i = 0; i < fingerprintData.length; i++) {
      hash = (hash * 33) ^ fingerprintData.charCodeAt(i);
    }
    return (hash >>> 0).toString(16);
  } catch (e) {
    // Basic fallback if canvas is blocked or security error occurs
    const basicData = [
      navigator.userAgent,
      navigator.language,
      `${screen.width}x${screen.height}`
    ].join('|');
    let hash = 5381;
    for (let i = 0; i < basicData.length; i++) {
      hash = (hash * 33) ^ basicData.charCodeAt(i);
    }
    return (hash >>> 0).toString(16);
  }
};
