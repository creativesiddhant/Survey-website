/**
 * Device and Browser detection utilities.
 */

export type DeviceType = 'Desktop' | 'Tablet' | 'Mobile';

export const getDeviceType = (): DeviceType => {
  const ua = navigator.userAgent;
  if (/ipad|tablet|playbook|silk/i.test(ua)) {
    return 'Tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|iemobile|opera mini/i.test(ua)) {
    return 'Mobile';
  }
  return 'Desktop';
};

export const getBrowserName = (): string => {
  const ua = navigator.userAgent;
  if (/edg/i.test(ua)) {
    return 'Edge';
  }
  if (/opr|opios/i.test(ua)) {
    return 'Opera';
  }
  if (/chrome|crios/i.test(ua)) {
    return 'Chrome';
  }
  if (/firefox|iceweasel/i.test(ua)) {
    return 'Firefox';
  }
  if (/safari/i.test(ua)) {
    return 'Safari';
  }
  if (/msie|trident/i.test(ua)) {
    return 'Internet Explorer';
  }
  return 'Other';
};
