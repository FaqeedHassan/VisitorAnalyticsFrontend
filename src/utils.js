export function getDeviceInfo() {
  const userAgent = navigator.userAgent;
  let device = /Mobile|Android|iP(ad|hone)/.test(userAgent) ? 'Mobile' : 'Desktop';

  let browser = 'Other';
  if (userAgent.includes('Firefox/')) browser = 'Firefox';
  else if (userAgent.includes('Edg/')) browser = 'Edge';
  else if (userAgent.includes('OPR/') || userAgent.includes('Opera')) browser = 'Opera';
  else if (userAgent.includes('Chrome/')) browser = 'Chrome';
  else if (userAgent.includes('Safari/')) browser = 'Safari';

  return { device, browser };
}
